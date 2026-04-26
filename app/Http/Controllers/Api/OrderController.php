<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Bouquet;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 50);
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        $search = $request->input('search');
        $customerId = $request->input('customer_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Order::with(['items', 'customer', 'invoice']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($paymentStatus) {
            $query->whereHas('invoice', function ($q) use ($paymentStatus) {
                $q->where('status', $paymentStatus);
            });
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('username', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($orders));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.bouquet_id' => ['required', 'exists:bouquets,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_address' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'send_at' => ['required', 'date'],
        ]);

        try {
            $order = DB::transaction(function () use ($validated) {
                $total = 0;
                $orderItems = [];

                foreach ($validated['items'] as $item) {
                    $bouquet = Bouquet::findOrFail($item['bouquet_id']);
                    $itemTotal = $bouquet->price * $item['quantity'];
                    $total += $itemTotal;

                    $orderItems[] = [
                        'bouquet_id' => $item['bouquet_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $bouquet->price,
                    ];
                }

                $order = Order::create([
                    'customer_id' => $validated['customer_id'] ?? null,
                    'status' => $validated['status'] ?? 'pending',
                    'total' => $total,
                    'shipping_address' => $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                    'send_at' => $validated['send_at'],
                ]);

                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }

                Invoice::create([
                    'order_id' => $order->id,
                    'invoice_number' => Invoice::generateInvoiceNumber(),
                    'total_amount' => $total,
                    'status' => 'unpaid',
                ]);

                return $order->load(['items.bouquet', 'customer', 'invoice']);
            });

            return response()->json(['data' => $order], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'One or more bouquets not found'], 404);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $order = Order::with(['items.bouquet', 'customer', 'invoice'])->findOrFail($id);

            return response()->json(['data' => $order]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Order {$id} not found"], 404);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Order {$id} not found"], 404);
        }

        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.bouquet_id' => ['required_with:items', 'exists:bouquets,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'shipping_address' => ['sometimes', 'string'],
            'notes' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'send_at' => ['required', 'date'],
        ]);

        try {
            $order = DB::transaction(function () use ($validated, $order) {
                if (isset($validated['customer_id'])) {
                    $order->customer_id = $validated['customer_id'];
                }

                if (isset($validated['shipping_address'])) {
                    $order->shipping_address = $validated['shipping_address'];
                }

                if (array_key_exists('notes', $validated)) {
                    $order->notes = $validated['notes'];
                }

                if (isset($validated['status'])) {
                    $order->status = $validated['status'];
                }

                if (isset($validated['send_at'])) {
                    $order->send_at = $validated['send_at'];
                }

                $total = 0;

                if (isset($validated['items'])) {
                    $order->items()->delete();

                    foreach ($validated['items'] as $item) {
                        $bouquet = Bouquet::findOrFail($item['bouquet_id']);
                        $itemTotal = $bouquet->price * $item['quantity'];
                        $total += $itemTotal;

                        $order->items()->create([
                            'bouquet_id' => $item['bouquet_id'],
                            'quantity' => $item['quantity'],
                            'unit_price' => $bouquet->price,
                        ]);
                    }

                    $order->total = $total;

                    if ($order->invoice) {
                        $order->invoice->update([
                            'total_amount' => $total,
                        ]);
                    }
                }

                $order->save();

                return $order->load(['items.bouquet', 'customer', 'invoice']);
            });

            return response()->json(['data' => $order]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'One or more bouquets not found'], 404);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);
            $order->delete();

            return response()->json(['message' => "Order {$id} deleted successfully"]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Order {$id} not found"], 404);
        }
    }

    public function markInvoicePaid(string $orderId): JsonResponse
    {
        try {
            $order = Order::with('invoice')->findOrFail($orderId);

            if (! $order->invoice) {
                return response()->json(['message' => 'Invoice not found for this order'], 404);
            }

            $order->invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            return response()->json([
                'message' => 'Invoice marked as paid',
                'data' => $order->invoice,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Order {$orderId} not found"], 404);
        }
    }
}
