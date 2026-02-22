<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BouquetCategories extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function bouquets()
    {
        return $this->hasMany(Bouquet::class, 'cateogry_id');
    }
}
