<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UploadController;

/*
|--------------------------------------------------------------------------
| Public Routes (Customer Facing)
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    // Restaurant info
    Route::get('restaurants/{id}', [RestaurantController::class, 'show']);
    Route::get('restaurants/{id}/categories', [RestaurantController::class, 'categories']);
    Route::get('restaurants/{id}/products', [ProductController::class, 'index']);

    // Products by category
    Route::get('products', [ProductController::class, 'index']);

    // Orders
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{orderNumber}', [OrderController::class, 'track']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes (JWT Protected)
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Orders
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Products
        Route::apiResource('products', AdminProductController::class);

        // Categories
        Route::apiResource('categories', AdminCategoryController::class);

        // Image Upload
        Route::post('upload', [UploadController::class, 'upload']);
    });
});
