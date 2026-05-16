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
        Schema::table('bouquet_categories', function (Blueprint $table) {
            $table->string('color', 9)->nullable()->after('published');
        });
    }

    public function down(): void
    {
        Schema::table('bouquet_categories', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
