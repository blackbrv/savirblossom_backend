<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_response_id')
                ->constrained('feedback_responses')
                ->onDelete('cascade');
            $table->foreignId('feedback_question_id')
                ->constrained('feedback_questions')
                ->onDelete('cascade');
            $table->tinyInteger('rating_value')->nullable();
            $table->text('text_value')->nullable();
            $table->boolean('boolean_value')->nullable();
            $table->text('reason_value')->nullable();
            $table->timestamps();

            $table->index('feedback_response_id');
            $table->index('feedback_question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_answers');
    }
};
