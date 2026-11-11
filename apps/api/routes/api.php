<?php

use App\Http\Controllers\AuthSyncController;
use App\Http\Middleware\AuthenticateClerk;
use Illuminate\Support\Facades\Route;

Route::post('/auth/sync', AuthSyncController::class)
    ->middleware(['throttle:30,1', AuthenticateClerk::class])
    ->name('auth.sync');

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Stay API is running',
    ]);
});
