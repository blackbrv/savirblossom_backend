<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('username');
            $table->string('phone_number', 20)->nullable();
            $table->string('profile_picture')->nullable();
            $table->enum('provider', ['email', 'google'])->default('email');
            $table->string('google_id')->nullable()->unique();
            $table->timestamps();

            $table->index('provider');
            $table->index('google_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
