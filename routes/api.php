<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BouquetCategoriesController;
use App\Http\Controllers\Api\BouquetController;
use App\Http\Controllers\Api\BouquetImagesController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordSetupController;
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
    Route::post('/password/setup', [PasswordSetupController::class, 'sendSetup'])->name('auth.password.setup');
    Route::post('/password/reset', [PasswordSetupController::class, 'sendReset'])->name('auth.password.reset');
    Route::post('/password/confirm', [PasswordSetupController::class, 'confirm'])->name('auth.password.confirm');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('customers/{customer_id}')->middleware('customer.own')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('customer.orders.list');
        Route::post('/orders', [OrderController::class, 'store'])->name('customer.orders.store');
        Route::get('/orders/{order_id}', [OrderController::class, 'show'])->name('customer.orders.show');
    });
});

Route::prefix('customers')->group(function () {
    Route::post('/', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('/', [CustomerController::class, 'index'])->name('customers.list');
    Route::get('/{id}', [CustomerController::class, 'show'])->whereNumber('id')->name('customers.show');
    Route::put('/{id}', [CustomerController::class, 'update'])->whereNumber('id')->name('customers.update');
    Route::delete('/{id}', [CustomerController::class, 'destroy'])->whereNumber('id')->name('customers.delete');
    Route::post('/{id}/resend-setup-email', [PasswordSetupController::class, 'resend'])->whereNumber('id')->name('customers.resend-setup-email');
});

Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('orders.list');
    Route::post('/', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/{id}', [OrderController::class, 'show'])->whereNumber('id')->name('orders.show');
    Route::put('/{id}', [OrderController::class, 'update'])->whereNumber('id')->name('orders.update');
    Route::delete('/{id}', [OrderController::class, 'destroy'])->whereNumber('id')->name('orders.destroy');
    Route::post('/{id}/mark-paid', [OrderController::class, 'markInvoicePaid'])->whereNumber('id')->name('orders.mark-paid');
});

Route::prefix('invoices')->group(function () {
    Route::get('/', [InvoiceController::class, 'index'])->name('invoices.list');
    Route::get('/{id}', [InvoiceController::class, 'show'])->whereNumber('id')->name('invoices.show');
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

Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');
    Route::get('/chart', [DashboardController::class, 'chart'])->name('dashboard.chart');
    Route::get('/ongoing-orders', [DashboardController::class, 'ongoingOrders'])->name('dashboard.ongoing-orders');
    Route::get('/bouquet-sales', [DashboardController::class, 'bouquetSales'])->name('dashboard.bouquet-sales');
});

Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('cart.list');
    Route::post('/', [CartController::class, 'store'])->name('cart.add');
    Route::put('/{id}', [CartController::class, 'update'])->whereNumber('id')->name('cart.update');
    Route::delete('/{id}', [CartController::class, 'destroy'])->whereNumber('id')->name('cart.remove');
    Route::delete('/', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
});
