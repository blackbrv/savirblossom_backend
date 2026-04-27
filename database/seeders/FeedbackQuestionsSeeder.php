<?php

namespace Database\Seeders;

use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionsTemplate;
use Illuminate\Database\Seeder;

class FeedbackQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $template = FeedbackQuestionsTemplate::create([
            'name' => 'General Feedback',
            'description' => 'Default feedback questions for all bouquets',
            'is_default' => true,
            'is_active' => true,
        ]);

        $questions = [
            [
                'question_text' => 'How satisfied are you with your bouquet?',
                'question_type' => 'star_rating',
                'is_required' => true,
                'order' => 0,
            ],
            [
                'question_text' => 'How satisfied are you with the delivery?',
                'question_type' => 'star_rating',
                'is_required' => true,
                'order' => 1,
            ],
            [
                'question_text' => 'How satisfied are you with our customer service?',
                'question_type' => 'star_rating',
                'is_required' => true,
                'order' => 2,
            ],
            [
                'question_text' => 'Overall, how satisfied are you with your experience?',
                'question_type' => 'star_rating',
                'is_required' => true,
                'order' => 3,
            ],
            [
                'question_text' => 'Would you recommend us to friends/family?',
                'question_type' => 'yes_no',
                'is_required' => true,
                'order' => 4,
            ],
            [
                'question_text' => 'Is there anything we can improve on?',
                'question_type' => 'text',
                'is_required' => false,
                'order' => 5,
            ],
        ];

        foreach ($questions as $question) {
            FeedbackQuestion::create([
                'feedback_questions_template_id' => $template->id,
                'question_text' => $question['question_text'],
                'question_type' => $question['question_type'],
                'is_required' => $question['is_required'],
                'order' => $question['order'],
            ]);
        }
    }
}
