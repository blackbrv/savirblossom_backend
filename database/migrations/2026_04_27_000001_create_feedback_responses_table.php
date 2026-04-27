<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')
                ->nullable()
                ->constrained('customers')
                ->onDelete('set null');
            $table->foreignId('order_id')
                ->nullable()
                ->constrained('orders')
                ->onDelete('set null');
            $table->foreignId('bouquet_id')
                ->nullable()
                ->constrained('bouquets')
                ->onDelete('set null');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('order_id');
            $table->index('bouquet_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_responses');
    }
};
