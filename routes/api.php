<?php

use App\Http\Controllers\Api\BouquetCategoriesController;
use App\Http\Controllers\Api\BouquetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function (Request $request) {
    return response()->json([
        'message' => 'API is working',
        'status' => 200,
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('bouquet')->group(function () {
    Route::get('/', [BouquetController::class, 'index'])->name('bouquet.list');
    Route::get('/{id}', [BouquetController::class, 'show'])->whereNumber('id')->name('bouquet.id');
    Route::post('/create', [BouquetController::class, 'store'])->name('bouquet.create');
    Route::post('/update/{id}', [BouquetController::class, 'update'])->name('bouquet.update');
    Route::patch('/{id}/publish', [BouquetController::class, 'togglePublish'])->name('bouquet.publish');
});

Route::prefix('bouquet/categories')->group(function () {
    Route::get('/', [BouquetCategoriesController::class, 'index'])->name('bouquet-categories.list');
    Route::get('/{id}', [BouquetCategoriesController::class, 'show'])->whereNumber('id')->name('bouquet-categories.id');
    Route::post('/create', [BouquetCategoriesController::class, 'store'])->name('bouquet-categories.create');
    Route::post('/update/{id}', [BouquetCategoriesController::class, 'update'])->name('bouquet-categories.update');
});
