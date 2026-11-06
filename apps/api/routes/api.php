<?php

use App\Http\Controllers\SyncClerkUserController;
use App\Http\Middleware\VerifyClerkSession;
use Illuminate\Support\Facades\Route;

Route::post('/auth/sync', SyncClerkUserController::class)
    ->middleware(['throttle:30,1', VerifyClerkSession::class]);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Stay API is running',
    ]);
});
