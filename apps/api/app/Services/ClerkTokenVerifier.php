<?php

namespace App\Services;

use DomainException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use stdClass;
use UnexpectedValueException;

class ClerkTokenVerifier
{
    public function verify(#[\SensitiveParameter] string $token): stdClass
    {
        abort_if(strlen($token) > 16384, 401, 'Invalid session.');
        try {
            $header = JWT::jsonDecode(JWT::urlsafeB64Decode(explode('.', $token)[0]));
        } catch (DomainException|UnexpectedValueException $exception) {
            abort(401, 'Invalid session.');
        }

        abort_unless($header instanceof stdClass
            && ($header->alg ?? null) === 'RS256'
            && is_string($header->kid ?? null)
            && strlen($header->kid) > 0
            && strlen($header->kid) <= 255, 401, 'Invalid session.');

        $issuer = config('services.clerk.issuer');
        abort_unless(is_string($issuer) && str_starts_with($issuer, 'https://'), 503, 'Authentication is temporarily unavailable.');
        $cacheKey = 'clerk:jwks:'.hash('sha256', $issuer);
        $jwks = Cache::get($cacheKey);
        if ($jwks === null) {
            $jwks = $this->fetchKeys($issuer, $cacheKey);
        }

        $keys = $this->parseKeys($jwks);
        if (! isset($keys[$header->kid]) && Cache::add($cacheKey.':refresh', true, 30)) {
            $keys = $this->parseKeys($this->fetchKeys($issuer, $cacheKey));
        }
        abort_unless(isset($keys[$header->kid]), 401, 'Invalid session.');

        try {
            $claims = JWT::decode($token, $keys[$header->kid]);
        } catch (DomainException|UnexpectedValueException|InvalidArgumentException $exception) {
            abort(401, 'Invalid session.');
        }

        abort_unless(
            ($claims->iss ?? null) === $issuer
            && is_int($claims->exp ?? null)
            && is_int($claims->nbf ?? null)
            && is_int($claims->iat ?? null)
            && $claims->iat <= time()
            && is_string($claims->sub ?? null)
            && preg_match('/^user_[A-Za-z0-9]+$/D', $claims->sub)
            && strlen($claims->sub) <= 255
            && is_string($claims->sid ?? null)
            && preg_match('/^sess_[A-Za-z0-9]+$/D', $claims->sid)
            && (! property_exists($claims, 'sts') || $claims->sts === 'active')
            && (! property_exists($claims, 'azp') || (is_string($claims->azp)
                && in_array($claims->azp, config('services.clerk.authorized_parties', []), true))),
            401,
            'Invalid session.',
        );

        return $claims;
    }

    /** @return array<string, mixed> */
    private function fetchKeys(string $issuer, string $cacheKey): array
    {
        Cache::put($cacheKey.':refresh', true, 30);
        try {
            $response = Http::acceptJson()->connectTimeout(3)->timeout(5)
                ->get($issuer.'/.well-known/jwks.json');
        } catch (ConnectionException $exception) {
            abort(503, 'Authentication is temporarily unavailable.');
        }
        abort_unless($response->successful() && is_array($response->json()), 503, 'Authentication is temporarily unavailable.');
        $jwks = $response->json();
        $this->parseKeys($jwks);
        Cache::put($cacheKey, $jwks, 3600);

        return $jwks;
    }

    /** @param array<string, mixed> $jwks
     * @return array<string, Key>
     */
    private function parseKeys(array $jwks): array
    {
        abort_unless(is_array($jwks['keys'] ?? null), 503, 'Authentication is temporarily unavailable.');
        $rsaKeys = array_filter($jwks['keys'] ?? [], fn ($key) => is_array($key)
            && ($key['kty'] ?? null) === 'RSA'
            && ($key['alg'] ?? 'RS256') === 'RS256'
            && ($key['use'] ?? 'sig') === 'sig');
        try {
            return JWK::parseKeySet(['keys' => array_values($rsaKeys)], 'RS256');
        } catch (DomainException|UnexpectedValueException|InvalidArgumentException $exception) {
            abort(503, 'Authentication is temporarily unavailable.');
        }
    }
}
