<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bouquets', function (Blueprint $table) {
            $table->foreignId('feedback_questions_template_id')
                ->nullable()
                ->after('published')
                ->constrained('feedback_questions_templates')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('bouquets', function (Blueprint $table) {
            $table->dropForeign(['feedback_questions_template_id']);
            $table->dropColumn('feedback_questions_template_id');
        });
    }
};
