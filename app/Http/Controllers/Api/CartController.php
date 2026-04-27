<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bouquet;
use App\Models\CartItem;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user();

        $cartItems = $customer->cartItems()
            ->with('bouquet')
            ->get();

        $items = $cartItems->map(function ($item) {
            $bouquet = $item->bouquet;
            $unitPrice = (int) $bouquet->price;
            $quantity = $item->quantity;
            $subtotal = $unitPrice * $quantity;

            return [
                'id' => $item->id,
                'bouquet_id' => $item->bouquet_id,
                'quantity' => $quantity,
                'bouquet' => [
                    'id' => $bouquet->id,
                    'name' => $bouquet->name,
                    'price' => $bouquet->price,
                    'stock' => $bouquet->stock,
                    'image' => $bouquet->galleries->first()?->src,
                ],
                'subtotal' => $subtotal,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });

        $totalQuantity = $cartItems->sum('quantity');
        $totalPrice = $items->sum('subtotal');

        return response()->json([
            'data' => [
                'items' => $items,
                'total_quantity' => $totalQuantity,
                'total_price' => $totalPrice,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bouquet_id' => ['required', 'exists:bouquets,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $customer = $request->user();
        $bouquetId = $validated['bouquet_id'];
        $quantity = $validated['quantity'];

        $bouquet = Bouquet::findOrFail($bouquetId);

        $existingItem = $customer->cartItems()
            ->where('bouquet_id', $bouquetId)
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->save();
            $cartItem = $existingItem;
        } else {
            $cartItem = $customer->cartItems()->create([
                'bouquet_id' => $bouquetId,
                'quantity' => $quantity,
            ]);
        }

        $cartItem->load('bouquet');

        return response()->json([
            'message' => 'Item added to cart',
            'data' => $this->formatCartItem($cartItem),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $customer = $request->user();
        $quantity = $validated['quantity'];

        $cartItem = $customer->cartItems()->find($id);

        if (! $cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        if ($quantity <= 0) {
            $cartItem->delete();

            return response()->json([
                'message' => 'Cart item removed',
                'data' => null,
            ]);
        }

        $cartItem->quantity = $quantity;
        $cartItem->save();
        $cartItem->load('bouquet');

        return response()->json([
            'message' => 'Cart item updated',
            'data' => $this->formatCartItem($cartItem),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $customer = $request->user();

        $cartItem = $customer->cartItems()->find($id);

        if (! $cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Cart item removed',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $customer = $request->user();

        $customer->cartItems()->delete();

        return response()->json([
            'message' => 'Cart cleared',
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'send_at' => ['required', 'date'],
            'coupon_code' => ['nullable', 'string'],
        ]);

        $customer = $request->user();

        $cartItems = $customer->cartItems()->with('bouquet')->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty',
            ], 400);
        }

        $coupon = null;
        $discountAmount = 0;

        if (! empty($validated['coupon_code'])) {
            $couponService = app(CouponService::class);
            $validationResult = $couponService->validate(
                $validated['coupon_code'],
                $customer,
                $cartItems
            );

            if (! $validationResult->isValid) {
                return response()->json([
                    'message' => $validationResult->error,
                ], 422);
            }

            $coupon = $validationResult->coupon;
            $discountAmount = $validationResult->discount;
        }

        $stockErrors = [];

        foreach ($cartItems as $item) {
            $bouquet = $item->bouquet;
            if ($bouquet->stock < $item->quantity) {
                $stockErrors[] = [
                    'bouquet_id' => $bouquet->id,
                    'bouquet_name' => $bouquet->name,
                    'requested' => $item->quantity,
                    'available' => $bouquet->stock,
                ];
            }
        }

        if (! empty($stockErrors)) {
            return response()->json([
                'message' => 'Insufficient stock for some items',
                'errors' => $stockErrors,
            ], 422);
        }

        try {
            $result = DB::transaction(function () use ($customer, $cartItems, $validated, $coupon, $discountAmount) {
                $total = 0;
                $orderItems = [];

                foreach ($cartItems as $item) {
                    $bouquet = $item->bouquet;
                    $unitPrice = (int) $bouquet->price;
                    $itemTotal = $unitPrice * $item->quantity;
                    $total += $itemTotal;

                    $orderItems[] = [
                        'bouquet_id' => $bouquet->id,
                        'quantity' => $item->quantity,
                        'unit_price' => $unitPrice,
                    ];

                    $bouquet->stock -= $item->quantity;
                    $bouquet->save();
                }

                $finalTotal = max(0, $total - $discountAmount);

                $orderData = [
                    'customer_id' => $customer->id,
                    'status' => 'pending',
                    'total' => $finalTotal,
                    'shipping_address' => $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                    'send_at' => $validated['send_at'],
                    'coupon_id' => $coupon?->id,
                    'discount_amount' => $discountAmount,
                    'coupon_code' => $coupon?->code,
                ];

                $order = Order::create($orderData);

                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }

                $invoice = Invoice::create([
                    'order_id' => $order->id,
                    'invoice_number' => Invoice::generateInvoiceNumber(),
                    'total_amount' => $total,
                    'status' => 'unpaid',
                ]);

                if ($coupon) {
                    $couponService = app(CouponService::class);
                    $couponService->apply($coupon, $customer, $order->id, $discountAmount);
                }

                $customer->cartItems()->delete();

                return [
                    'order' => $order->load(['items.bouquet', 'customer', 'invoice']),
                    'invoice' => $invoice,
                ];
            });

            return response()->json([
                'message' => 'Checkout successful',
                'data' => [
                    'order' => $result['order'],
                    'invoice' => $result['invoice'],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Checkout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function formatCartItem(CartItem $cartItem): array
    {
        $bouquet = $cartItem->bouquet;
        $unitPrice = (int) $bouquet->price;
        $quantity = $cartItem->quantity;
        $subtotal = $unitPrice * $quantity;

        return [
            'id' => $cartItem->id,
            'bouquet_id' => $cartItem->bouquet_id,
            'quantity' => $quantity,
            'bouquet' => [
                'id' => $bouquet->id,
                'name' => $bouquet->name,
                'price' => $bouquet->price,
                'stock' => $bouquet->stock,
                'image' => $bouquet->galleries->first()?->src,
            ],
            'subtotal' => $subtotal,
            'created_at' => $cartItem->created_at,
            'updated_at' => $cartItem->updated_at,
        ];
    }
}
