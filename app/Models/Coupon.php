<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'discount_type',
        'discount_value',
        'min_order_value',
        'usage_limit',
        'usage_count',
        'max_uses_per_user',
        'valid_from',
        'valid_until',
        'is_active',
        'is_stackable',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_order_value' => 'decimal:2',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'is_stackable' => 'boolean',
        ];
    }

    public function bouquets(): BelongsToMany
    {
        return $this->belongsToMany(Bouquet::class, 'coupon_bouquet');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BouquetCategories::class, 'coupon_category', 'coupon_id', 'bouquet_category_id');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->valid_from && $now->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && $now->gt($this->valid_until)) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function hasReachedUserLimit(int $customerId): bool
    {
        if (! $this->max_uses_per_user) {
            return false;
        }

        return $this->usages()
            ->where('customer_id', $customerId)
            ->count() >= $this->max_uses_per_user;
    }

    public function calculateDiscount(float $subtotal, ?float $eligibleSubtotal = null): float
    {
        $baseAmount = $eligibleSubtotal ?? $subtotal;

        return match ($this->discount_type) {
            'percentage' => round($baseAmount * ($this->discount_value / 100), 2),
            'fixed_amount' => min($this->discount_value, $baseAmount),
            default => 0,
        };
    }

    public function applyToAll(): bool
    {
        return $this->bouquets()->count() === 0 && $this->categories()->count() === 0;
    }
}
