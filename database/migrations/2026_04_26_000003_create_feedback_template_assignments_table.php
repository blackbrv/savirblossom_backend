<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bouquet_id')
                ->constrained('bouquets')
                ->onDelete('cascade');
            $table->foreignId('feedback_questions_template_id')
                ->constrained('feedback_questions_templates')
                ->onDelete('cascade');
            $table->timestamps();

            $table->unique('bouquet_id');
            $table->index('feedback_questions_template_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_assignments');
    }
};
