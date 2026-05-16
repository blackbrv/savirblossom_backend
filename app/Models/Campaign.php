<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'promo_id',
        'subject',
        'email_body',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count',
        'scheduled_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }
}
