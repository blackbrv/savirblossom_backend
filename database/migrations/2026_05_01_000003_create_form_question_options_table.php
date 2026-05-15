<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_question_id')->constrained('form_questions')->onDelete('cascade');
            $table->string('label');
            $table->string('value')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('form_question_id');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_question_options');
    }
};
