<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bouquet extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category_id',
        'published',
        'feedback_questions_template_id',
    ];

    protected $hidden = ['category_id'];

    protected $casts = [
        'price' => 'decimal:2',
        'published' => 'boolean',
    ];

    public function galleries()
    {
        return $this->hasMany(BouquetImage::class);
    }

    public function category()
    {
        return $this->belongsTo(BouquetCategories::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function feedbackTemplate(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestionsTemplate::class, 'feedback_questions_template_id');
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
