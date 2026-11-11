<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuthUserResource;
use App\Services\ClerkUserSynchronizer;
use Illuminate\Http\Request;

class AuthSyncController extends Controller
{
    public function __invoke(Request $request, ClerkUserSynchronizer $synchronizer): AuthUserResource
    {
        return new AuthUserResource($synchronizer->sync($request->attributes->get('clerk_id')));
    }
}
