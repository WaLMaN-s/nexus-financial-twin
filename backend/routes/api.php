<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\AdvisorController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\GoalController;
use App\Http\Controllers\Api\V1\HealthScoreController;
use App\Http\Controllers\Api\V1\InsightController;
use App\Http\Controllers\Api\V1\SecurityController;
use App\Http\Controllers\Api\V1\SimulationController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\TimelineController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\TwinController;
use App\Http\Controllers\Api\V1\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public — throttled hard against credential stuffing.
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::post('/security/2fa/initiate', [TwoFactorController::class, 'initiate']);
        Route::post('/security/2fa/confirm', [TwoFactorController::class, 'confirm']);
        Route::delete('/security/2fa', [TwoFactorController::class, 'disable']);
        Route::get('/security/sessions', [SecurityController::class, 'sessions']);
        Route::delete('/security/sessions/{tokenId}', [SecurityController::class, 'revokeSession']);
        Route::get('/security/login-history', [SecurityController::class, 'loginHistory']);
        Route::get('/security/audit-logs', [SecurityController::class, 'auditLogs']);

        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/twin/projection', [TwinController::class, 'projection']);
        Route::get('/timeline', [TimelineController::class, 'index']);

        Route::get('/simulations', [SimulationController::class, 'index']);
        Route::post('/simulations', [SimulationController::class, 'store']);
        Route::get('/simulations/{simulation}', [SimulationController::class, 'show']);

        Route::get('/insights', [InsightController::class, 'index']);
        Route::post('/advisor/ask', [AdvisorController::class, 'ask'])->middleware('throttle:advisor');

        Route::get('/health-score', [HealthScoreController::class, 'show']);
        Route::get('/health-score/history', [HealthScoreController::class, 'history']);

        Route::apiResource('goals', GoalController::class)->except(['show']);
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/accounts', [AccountController::class, 'index']);
        Route::post('/accounts', [AccountController::class, 'store']);
        Route::get('/subscriptions', [SubscriptionController::class, 'index']);
        Route::post('/subscriptions', [SubscriptionController::class, 'store']);

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/overview', [AdminController::class, 'overview']);
            Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
        });
    });
});
