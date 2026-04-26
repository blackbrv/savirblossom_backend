<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('password_setup_tokens', function (Blueprint $table) {
            $table->enum('type', ['setup', 'reset'])->default('setup')->after('token');
        });
    }

    public function down(): void
    {
        Schema::table('password_setup_tokens', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
