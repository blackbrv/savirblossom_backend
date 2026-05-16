<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'banner_image',
        'status',
        'scheduled_at',
        'published_at',
        'cta_label',
        'cta_url',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }
}
