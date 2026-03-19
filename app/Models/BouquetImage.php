<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BouquetImage extends Model
{
    protected $fillable = [
        'bouquet_id',
        'src',
        'alt_text',
    ];

    protected $hidden = ['bouquet_id'];

    public function bouquet()
    {
        return $this->belongsTo(Bouquet::class);
    }
}
