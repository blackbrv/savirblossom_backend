<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();

            $table->unique(['coupon_id', 'customer_id', 'order_id']);
        });

        Schema::create('coupon_bouquet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bouquet_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['coupon_id', 'bouquet_id']);
        });

        Schema::create('coupon_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bouquet_category_id')->constrained('bouquet_categories')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['coupon_id', 'bouquet_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_category');
        Schema::dropIfExists('coupon_bouquet');
        Schema::dropIfExists('coupon_usages');
    }
};
