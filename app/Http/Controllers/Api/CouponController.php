<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::with(['bouquets', 'categories'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $coupons]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', 'unique:coupons,code'],
            'name' => ['required', 'string', 'max:255'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'min_order_value' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'is_active' => ['boolean'],
            'is_stackable' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'bouquet_ids' => ['nullable', 'array'],
            'bouquet_ids.*' => ['integer', 'exists:bouquets,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:bouquet_categories,id'],
        ]);

        $code = $validated['code'] ?? null;

        if (empty($code)) {
            $code = $this->generateUniqueCode();
        }

        $coupon = Coupon::create([
            'code' => strtoupper($code),
            'name' => $validated['name'],
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'min_order_value' => $validated['min_order_value'] ?? null,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'max_uses_per_user' => $validated['max_uses_per_user'] ?? null,
            'valid_from' => $validated['valid_from'] ?? null,
            'valid_until' => $validated['valid_until'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_stackable' => $validated['is_stackable'] ?? false,
            'priority' => $validated['priority'] ?? 0,
        ]);

        if (! empty($validated['bouquet_ids'])) {
            $coupon->bouquets()->sync($validated['bouquet_ids']);
        }

        if (! empty($validated['category_ids'])) {
            $coupon->categories()->sync($validated['category_ids']);
        }

        $coupon->load(['bouquets', 'categories']);

        return response()->json([
            'message' => 'Coupon created successfully',
            'data' => $coupon,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $coupon = Coupon::with(['bouquets', 'categories'])->findOrFail($id);

        return response()->json(['data' => $coupon]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:coupons,code,'.$id],
            'name' => ['sometimes', 'string', 'max:255'],
            'discount_type' => ['sometimes', 'in:percentage,fixed_amount'],
            'discount_value' => ['sometimes', 'numeric', 'min:0'],
            'min_order_value' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'is_active' => ['boolean'],
            'is_stackable' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'bouquet_ids' => ['nullable', 'array'],
            'bouquet_ids.*' => ['integer', 'exists:bouquets,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:bouquet_categories,id'],
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $coupon->update($validated);

        if (isset($validated['bouquet_ids'])) {
            $coupon->bouquets()->sync($validated['bouquet_ids']);
        }

        if (isset($validated['category_ids'])) {
            $coupon->categories()->sync($validated['category_ids']);
        }

        $coupon->load(['bouquets', 'categories']);

        return response()->json([
            'message' => 'Coupon updated successfully',
            'data' => $coupon,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'message' => 'Coupon deleted successfully',
        ]);
    }

    public function toggle(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->is_active = ! $coupon->is_active;
        $coupon->save();

        return response()->json([
            'message' => 'Coupon status updated',
            'data' => $coupon,
        ]);
    }

    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $customer = $request->user();

        $cartItems = $customer->cartItems()
            ->with('bouquet')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty',
            ], 400);
        }

        $couponService = app(CouponService::class);
        $result = $couponService->validate(
            $validated['code'],
            $customer,
            $cartItems
        );

        if (! $result->isValid) {
            return response()->json([
                'message' => $result->error,
                'valid' => false,
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $result->coupon->id,
                'code' => $result->coupon->code,
                'name' => $result->coupon->name,
                'discount_type' => $result->coupon->discount_type,
                'discount_value' => $result->coupon->discount_value,
            ],
            'discount' => $result->discount,
        ]);
    }

    private function generateUniqueCode(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $maxAttempts = 10;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $code = 'SAVE';
            for ($j = 0; $j < 6; $j++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }

            if (! Coupon::where('code', $code)->exists()) {
                return $code;
            }
        }

        return 'SAVE'.uniqid();
    }
}
