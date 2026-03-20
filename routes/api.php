<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BouquetCategoriesController;
use App\Http\Controllers\Api\BouquetController;
use App\Http\Controllers\Api\BouquetImagesController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function (Request $request) {
    return response()->json([
        'message' => 'API is working',
        'status' => 200,
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect'])->name('auth.google.redirect');
    Route::post('/google/callback', [AuthController::class, 'googleCallback'])->name('auth.google.callback');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('auth.logout');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum')->name('auth.me');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('customers/{customer_id}')->middleware('customer.own')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('customer.orders.list');
        Route::post('/orders', [OrderController::class, 'store'])->name('customer.orders.store');
        Route::get('/orders/{order_id}', [OrderController::class, 'show'])->name('customer.orders.show');
    });
});

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index'])->name('customers.list');
    Route::get('/{id}', [CustomerController::class, 'show'])->whereNumber('id')->name('customers.show');
    Route::put('/{id}', [CustomerController::class, 'update'])->whereNumber('id')->name('customers.update');
    Route::delete('/{id}', [CustomerController::class, 'destroy'])->whereNumber('id')->name('customers.delete');
});

Route::prefix('bouquet')->group(function () {
    Route::get('/', [BouquetController::class, 'index'])->name('bouquet.list');
    Route::get('/{id}', [BouquetController::class, 'show'])->whereNumber('id')->name('bouquet.id');
    Route::post('/create', [BouquetController::class, 'store'])->name('bouquet.create');
    Route::post('/update/{id}', [BouquetController::class, 'update'])->name('bouquet.update');
    Route::post('/{id}/delete', [BouquetController::class, 'destroy'])->name('bouquet.destroy');
    Route::patch('/{id}/publish', [BouquetController::class, 'togglePublish'])->name('bouquet.publish');

    Route::get('/{bouquet}/galleries', [BouquetImagesController::class, 'index'])->name('bouquet.image.list');
    Route::post('/{bouquet}/galleries', [BouquetImagesController::class, 'store'])->name('bouquet.image.store');
    Route::post('/{bouquet}/galleries/{id}', [BouquetImagesController::class, 'update'])->name('bouquet.image.update');
    Route::post('/{bouquet}/galleries/{id}/delete', [BouquetImagesController::class, 'destroy'])->name('bouquet.image.delete');
});

Route::prefix('bouquet/categories')->group(function () {
    Route::get('/', [BouquetCategoriesController::class, 'index'])->name('bouquet-categories.list');
    Route::get('/{id}', [BouquetCategoriesController::class, 'show'])->whereNumber('id')->name('bouquet-categories.id');
    Route::post('/create', [BouquetCategoriesController::class, 'store'])->name('bouquet-categories.create');
    Route::post('/update/{id}', [BouquetCategoriesController::class, 'update'])->name('bouquet-categories.update');
    Route::post('/delete/{id}', [BouquetCategoriesController::class, 'destroy'])->whereNumber('id')->name('bouquet-categories.delete');
});
