<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackQuestionsTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_default',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(FeedbackQuestion::class, 'feedback_questions_template_id')
            ->orderBy('order');
    }

    public function bouquets(): BelongsToMany
    {
        return $this->belongsToMany(Bouquet::class, 'feedback_assignments');
    }

    public static function getDefault(): ?self
    {
        return static::where('is_default', true)->first();
    }
}
