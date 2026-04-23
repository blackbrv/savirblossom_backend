<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BouquetCategories extends Model
{
    protected $fillable = [
        'name',
        'description',
        'published',
    ];

    protected $casts = [
        'published' => 'boolean',
    ];

    public function bouquets()
    {
        return $this->hasMany(Bouquet::class, 'cateogry_id');
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
