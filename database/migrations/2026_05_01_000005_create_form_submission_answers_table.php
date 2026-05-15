<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submission_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained('form_submissions')->onDelete('cascade');
            $table->foreignId('form_question_id')->constrained('form_questions')->onDelete('cascade');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index('form_submission_id');
            $table->index('form_question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submission_answers');
    }
};
