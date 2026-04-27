<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'status',
        'total',
        'shipping_address',
        'notes',
        'send_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'send_at' => 'datetime',
        ];
    }

    protected $with = ['items', 'customer', 'invoice'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function feedbackTemplate()
    {
        $bouquetIds = $this->items->pluck('bouquet_id')->toArray();

        if (empty($bouquetIds)) {
            return null;
        }

        $templateId = Bouquet::whereIn('id', $bouquetIds)
            ->whereNotNull('feedback_questions_template_id')
            ->pluck('feedback_questions_template_id')
            ->first();

        if ($templateId) {
            return FeedbackQuestionsTemplate::find($templateId);
        }

        return FeedbackQuestionsTemplate::where('is_default', true)->first();
    }
}
