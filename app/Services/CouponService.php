<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Customer;
use Illuminate\Support\Collection;

class CouponService
{
    public function validate(
        string $code,
        Customer $customer,
        Collection $cartItems
    ): ValidationResult {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon) {
            return ValidationResult::invalid('Coupon code not found');
        }

        if (! $coupon->isValid()) {
            return ValidationResult::invalid('Coupon is not valid or has expired');
        }

        if ($coupon->hasReachedUserLimit($customer->id)) {
            return ValidationResult::invalid('You have already used this coupon');
        }

        $cartTotal = $this->calculateCartTotal($cartItems);

        if ($coupon->min_order_value && $cartTotal < $coupon->min_order_value) {
            return ValidationResult::invalid(
                'Minimum order value of $'.number_format($coupon->min_order_value, 2).' required'
            );
        }

        $applicableItems = $this->getApplicableItems($coupon, $cartItems);

        if ($applicableItems->isEmpty()) {
            return ValidationResult::invalid('No applicable items for this coupon');
        }

        $eligibleSubtotal = $this->calculateCartTotal($applicableItems);
        $discount = $coupon->calculateDiscount($cartTotal, $eligibleSubtotal);

        return ValidationResult::valid($coupon, $discount, $applicableItems);
    }

    public function apply(
        Coupon $coupon,
        Customer $customer,
        $orderId,
        float $discountAmount
    ): void {
        CouponUsage::create([
            'coupon_id' => $coupon->id,
            'customer_id' => $customer->id,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount,
        ]);

        $coupon->increment('usage_count');
    }

    public function getApplicableItems(Coupon $coupon, Collection $cartItems): Collection
    {
        if ($coupon->applyToAll()) {
            return $cartItems;
        }

        $applicableBouquetIds = $coupon->bouquets()->pluck('bouquets.id');
        $applicableCategoryIds = $coupon->categories()->pluck('bouquet_categories.id');

        return $cartItems->filter(function ($item) use ($applicableBouquetIds, $applicableCategoryIds) {
            $bouquet = $item->bouquet;

            if ($applicableBouquetIds->contains($bouquet->id)) {
                return true;
            }

            if ($applicableCategoryIds->contains($bouquet->category_id)) {
                return true;
            }

            return false;
        });
    }

    private function calculateCartTotal(Collection $cartItems): float
    {
        return $cartItems->sum(function ($item) {
            $price = (float) $item->bouquet->price;
            $quantity = $item->quantity ?? 1;

            return $price * $quantity;
        });
    }
}

class ValidationResult
{
    public function __construct(
        public readonly bool $isValid,
        public readonly ?Coupon $coupon,
        public readonly ?float $discount,
        public readonly ?Collection $applicableItems,
        public readonly ?string $error
    ) {}

    public static function valid(Coupon $coupon, float $discount, Collection $applicableItems): self
    {
        return new self(
            isValid: true,
            coupon: $coupon,
            discount: $discount,
            applicableItems: $applicableItems,
            error: null
        );
    }

    public static function invalid(string $error): self
    {
        return new self(
            isValid: false,
            coupon: null,
            discount: null,
            applicableItems: null,
            error: $error
        );
    }
}
