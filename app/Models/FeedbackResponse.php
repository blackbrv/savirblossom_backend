<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'order_id',
        'bouquet_id',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function bouquet(): BelongsTo
    {
        return $this->belongsTo(Bouquet::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(FeedbackAnswer::class, 'feedback_response_id');
    }

    public function getAverageRatingAttribute(): ?float
    {
        $ratings = $this->answers()
            ->whereNotNull('rating_value')
            ->pluck('rating_value');

        if ($ratings->isEmpty()) {
            return null;
        }

        return round($ratings->avg(), 1);
    }
}
