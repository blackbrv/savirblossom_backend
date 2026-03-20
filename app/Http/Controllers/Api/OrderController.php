<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Models\Bouquet;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request, string $customerId): JsonResponse
    {
        try {
            Customer::findOrFail($customerId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$customerId} not found"], 404);
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $status = $request->input('status');

        $query = Order::where('customer_id', $customerId)->with(['items.bouquet']);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    public function store(CreateOrderRequest $request, string $customerId): JsonResponse
    {
        try {
            Customer::findOrFail($customerId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$customerId} not found"], 404);
        }

        $validated = $request->validated();

        try {
            $order = DB::transaction(function () use ($validated, $customerId) {
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
                    'customer_id' => $customerId,
                    'status' => 'pending',
                    'total' => $total,
                    'shipping_address' => $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }

                return $order->load('items.bouquet');
            });

            return response()->json(['data' => $order], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'One or more bouquets not found'], 404);
        }
    }

    public function show(string $customerId, string $orderId): JsonResponse
    {
        try {
            Customer::findOrFail($customerId);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Customer {$customerId} not found"], 404);
        }

        try {
            $order = Order::where('customer_id', $customerId)
                ->with(['items.bouquet'])
                ->findOrFail($orderId);

            return response()->json(['data' => $order]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => "Order {$orderId} not found for customer {$customerId}"], 404);
        }
    }
}
