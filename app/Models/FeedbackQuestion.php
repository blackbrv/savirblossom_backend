<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'feedback_questions_template_id',
        'question_text',
        'question_type',
        'is_required',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestionsTemplate::class, 'feedback_questions_template_id');
    }
}
