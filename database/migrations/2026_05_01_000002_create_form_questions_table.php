<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->onDelete('cascade');
            $table->string('label');
            $table->string('question_type');
            $table->boolean('is_required')->default(false);
            $table->integer('order')->default(0);
            $table->json('config')->nullable();
            $table->timestamps();

            $table->index('form_id');
            $table->index('question_type');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_questions');
    }
};
