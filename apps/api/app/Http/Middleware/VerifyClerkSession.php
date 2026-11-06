<?php

namespace App\Http\Middleware;

use Closure;
use DomainException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;
use TypeError;
use UnexpectedValueException;

class VerifyClerkSession
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        abort_unless(is_string($token) && $token !== '' && strlen($token) <= 16384, 401, 'Unauthenticated.');

        $publicKey = config('services.clerk.public_key');
        $issuer = config('services.clerk.issuer');
        $parties = config('services.clerk.authorized_parties');
        abort_unless(is_string($publicKey) && $publicKey !== ''
            && is_string($issuer) && filter_var($issuer, FILTER_VALIDATE_URL)
            && str_starts_with($issuer, 'https://') && is_array($parties), 503, 'Identity synchronization is unavailable.');

        $key = openssl_pkey_get_public($publicKey);
        $details = $key === false ? false : openssl_pkey_get_details($key);
        abort_unless($details !== false && $details['type'] === OPENSSL_KEYTYPE_RSA
            && $details['bits'] >= 2048, 503, 'Identity synchronization is unavailable.');

        try {
            $claims = (array) JWT::decode($token, new Key($key, 'RS256'));
        } catch (UnexpectedValueException|DomainException|InvalidArgumentException|TypeError) {
            abort(401, 'Unauthenticated.');
        }

        $now = time();
        abort_unless(($claims['iss'] ?? null) === $issuer
            && is_int($claims['exp'] ?? null) && $claims['exp'] > $now
            && is_int($claims['nbf'] ?? null) && $claims['nbf'] <= $now
            && is_int($claims['iat'] ?? null) && $claims['iat'] <= $now
            && $claims['exp'] > $claims['iat'] && $claims['exp'] > $claims['nbf']
            && is_string($claims['sub'] ?? null) && strlen($claims['sub']) <= 255
            && preg_match('/\Auser_[a-zA-Z0-9]+\z/', $claims['sub']) === 1
            && is_string($claims['sid'] ?? null)
            && preg_match('/\Asess_[a-zA-Z0-9]+\z/', $claims['sid']) === 1
            && (! array_key_exists('sts', $claims) || $claims['sts'] === 'active')
            && (! array_key_exists('azp', $claims)
                || (is_string($claims['azp']) && in_array($claims['azp'], $parties, true))), 401, 'Unauthenticated.');

        $request->attributes->set('clerk_user_id', $claims['sub']);

        return $next($request);
    }
}
