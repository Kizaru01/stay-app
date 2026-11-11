<?php

namespace App\Http\Middleware;

use App\Services\ClerkTokenVerifier;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateClerk
{
    public function __construct(private ClerkTokenVerifier $verifier) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        abort_unless(is_string($token) && $token !== '', 401, 'Invalid session.');
        $claims = $this->verifier->verify($token);
        $request->attributes->set('clerk_id', $claims->sub);

        return $next($request);
    }
}
