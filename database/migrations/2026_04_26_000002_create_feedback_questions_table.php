<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_questions_template_id')
                ->constrained('feedback_questions_templates')
                ->onDelete('cascade');
            $table->string('question_text');
            $table->enum('question_type', ['star_rating', 'text', 'yes_no', 'yes_no_reason']);
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('feedback_questions_template_id');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_questions');
    }
};
