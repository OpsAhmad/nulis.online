<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication & Math Challenge Routes
Route::get('/challenge', [AuthController::class, 'challenge']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Article Exploration & Details
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// Public Profile Retrieval
Route::get('/users/{username}', [UserController::class, 'show']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Current User Profile & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Articles: Following feed, Posting & Image Upload
    Route::get('/articles/feed/following', [ArticleController::class, 'following']);
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::post('/articles/upload', [ArticleController::class, 'uploadImage']);

    // User Operations: Profile Edit, Follow Toggle, Analytics Dashboard
    Route::put('/user/profile', [UserController::class, 'update']);
    Route::post('/users/{id}/follow', [UserController::class, 'follow']);
    Route::get('/user/analytics', [UserController::class, 'analytics']);
});
