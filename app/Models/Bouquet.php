<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bouquet extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'galleries',
        'category_id',
        'published',
    ];

    protected $hidden = ['category_id'];

    protected $casts = [
        'galleries' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(BouquetCategories::class, 'category_id');
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
