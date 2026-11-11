<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;

class AuthSyncTest extends TestCase
{
    use RefreshDatabase;

    private static string $privateKey = '';

    private static array $jwk;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, self::$privateKey);
        $details = openssl_pkey_get_details($key);
        self::$jwk = [
            'kty' => 'RSA', 'kid' => 'test-key', 'alg' => 'RS256', 'use' => 'sig',
            'n' => JWT::urlsafeB64Encode($details['rsa']['n']),
            'e' => JWT::urlsafeB64Encode($details['rsa']['e']),
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.clerk.issuer' => 'https://clerk.example.test',
            'services.clerk.secret_key' => 'test-secret',
            'services.clerk.authorized_parties' => ['https://stay.example.test'],
        ]);
        Http::preventStrayRequests();
    }

    public function test_creates_user_from_clerk_and_ignores_client_identity_fields(): void
    {
        $this->fakeClerk();
        $response = $this->withToken($this->token())->postJson('/api/auth/sync', [
            'clerk_id' => 'user_attacker', 'email' => 'attacker@example.test', 'role' => 'admin',
        ]);

        $user = User::sole();
        $response->assertOk()->assertExactJson(['data' => [
            'id' => $user->id, 'clerk_id' => 'user_test', 'name' => 'Alex Guest',
            'email' => 'alex@example.test', 'email_verified_at' => $user->email_verified_at->toISOString(),
            'avatar_url' => 'https://img.clerk.com/avatar.png',
        ]]);
        $this->assertNull($user->password);
        $this->assertDatabaseHas('users', ['clerk_id' => 'user_test', 'email' => 'alex@example.test']);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.clerk.com/v1/users/user_test'
            && $request->hasHeader('Authorization', 'Bearer test-secret'));
    }

    public function test_repeated_sync_updates_the_same_user_and_keeps_legacy_credentials(): void
    {
        $user = User::factory()->create(['clerk_id' => 'user_test', 'email' => 'old@example.test']);
        $password = $user->password;
        $this->fakeClerk(['first_name' => 'Updated']);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk()->assertJsonPath('data.id', $user->id);
        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk()->assertJsonPath('data.id', $user->id);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Guest', 'password' => $password]);
        Http::assertSentCount(3);
    }

    public function test_native_session_without_authorized_party_is_accepted(): void
    {
        $this->fakeClerk();

        $this->withToken($this->token([], false))->postJson('/api/auth/sync')->assertOk();

        $this->assertDatabaseCount('users', 1);
    }

    public function test_optional_names_and_avatar_use_safe_defaults_and_unverified_email_clears_verification(): void
    {
        User::factory()->clerk()->create(['clerk_id' => 'user_test']);
        $this->fakeClerk([
            'first_name' => null, 'last_name' => null, 'image_url' => null,
            'email_addresses' => [['id' => 'email_primary', 'email_address' => 'new@example.test', 'verification' => ['status' => 'unverified']]],
        ]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk()
            ->assertJsonPath('data.name', 'StayApp user')->assertJsonPath('data.avatar_url', null)
            ->assertJsonPath('data.email_verified_at', null);

        $this->assertDatabaseHas('users', ['clerk_id' => 'user_test', 'email' => 'new@example.test', 'email_verified_at' => null]);
    }

    public function test_email_conflict_returns_409_without_changing_either_account(): void
    {
        $legacy = User::factory()->create(['email' => 'alex@example.test']);
        $linked = User::factory()->clerk()->create(['clerk_id' => 'user_test', 'email' => 'original@example.test']);
        $originals = [$legacy->getRawOriginal(), $linked->getRawOriginal()];
        $this->fakeClerk();

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertConflict();

        foreach ($originals as $attributes) {
            $this->assertDatabaseHas('users', $attributes);
        }
        $this->assertDatabaseCount('users', 2);
    }

    public function test_new_identity_does_not_claim_existing_email(): void
    {
        $legacy = User::factory()->create(['email' => 'alex@example.test']);
        $this->fakeClerk();

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertConflict();

        $this->assertDatabaseHas('users', ['id' => $legacy->id, 'clerk_id' => null]);
        $this->assertDatabaseCount('users', 1);
    }

    #[DataProvider('invalidClaims')]
    public function test_invalid_session_claims_return_401_without_writes(array $claims): void
    {
        $this->fakeClerk();

        $this->withToken($this->token($claims))->postJson('/api/auth/sync')->assertUnauthorized();

        $this->assertDatabaseCount('users', 0);
        Http::assertSentCount(1);
    }

    public static function invalidClaims(): array
    {
        return [
            'expired' => [['exp' => 1]],
            'future not before' => [['nbf' => 4102444800]],
            'future issued at' => [['iat' => 4102444800]],
            'wrong issuer' => [['iss' => 'https://evil.example.test']],
            'wrong party' => [['azp' => 'https://evil.example.test']],
            'null party' => [['azp' => null]],
            'missing subject' => [['sub' => null]],
            'invalid subject' => [['sub' => '../../users/other']],
            'missing session' => [['sid' => null]],
            'pending session' => [['sts' => 'pending']],
            'missing expiration' => [['exp' => null]],
            'missing not before' => [['nbf' => null]],
        ];
    }

    #[DataProvider('invalidTokens')]
    public function test_missing_or_malformed_token_returns_401_without_network(string $token): void
    {
        $this->withToken($token)->postJson('/api/auth/sync')->assertUnauthorized();

        Http::assertNothingSent();
        $this->assertDatabaseCount('users', 0);
    }

    public static function invalidTokens(): array
    {
        return ['missing' => [''], 'malformed' => ['not-a-jwt'], 'oversized' => [str_repeat('a', 16385)]];
    }

    public function test_wrong_algorithm_is_rejected_before_fetching_keys(): void
    {
        $token = JWT::encode(['sub' => 'user_test'], str_repeat('s', 32), 'HS256', 'test-key');

        $this->withToken($token)->postJson('/api/auth/sync')->assertUnauthorized();

        Http::assertNothingSent();
    }

    public function test_invalid_signature_is_rejected(): void
    {
        $this->fakeClerk();
        $parts = explode('.', $this->token());
        $parts[2] = JWT::urlsafeB64Encode(str_repeat('x', 256));

        $this->withToken(implode('.', $parts))->postJson('/api/auth/sync')->assertUnauthorized();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_unknown_key_refresh_is_bounded_and_rotation_succeeds_after_cooldown(): void
    {
        $rotated = [...self::$jwk, 'kid' => 'rotated-key'];
        Http::fake([
            'https://clerk.example.test/.well-known/jwks.json' => Http::sequence()
                ->push(['keys' => [self::$jwk]])->push(['keys' => [$rotated]]),
            'https://api.clerk.com/v1/users/user_test' => Http::response([
                'id' => 'user_test', 'primary_email_address_id' => 'email_primary',
                'email_addresses' => [['id' => 'email_primary', 'email_address' => 'alex@example.test']],
            ]),
        ]);
        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk();

        $this->withToken($this->token([], true, 'rotated-key'))->postJson('/api/auth/sync')->assertUnauthorized();
        Http::assertSentCount(2);

        Cache::forget('clerk:jwks:'.hash('sha256', 'https://clerk.example.test').':refresh');
        $this->withToken($this->token([], true, 'rotated-key'))->postJson('/api/auth/sync')->assertOk();
        $this->assertDatabaseCount('users', 1);
        Http::assertSentCount(4);
    }

    #[DataProvider('profileFailures')]
    public function test_upstream_profile_failures_do_not_write_users(int $status, mixed $body, int $expected): void
    {
        Http::fake([
            'https://clerk.example.test/.well-known/jwks.json' => Http::response(['keys' => [self::$jwk]]),
            'https://api.clerk.com/v1/users/user_test' => Http::response($body, $status),
        ]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertStatus($expected);

        $this->assertDatabaseCount('users', 0);
    }

    public static function profileFailures(): array
    {
        return [
            'rate limit' => [429, [], 503], 'server error' => [500, [], 503],
            'deleted user' => [404, [], 401], 'wrong identity' => [200, ['id' => 'user_other'], 503],
            'invalid json' => [200, 'not json', 503],
            'missing primary email' => [200, ['id' => 'user_test'], 422],
        ];
    }

    public function test_profile_connection_failure_returns_503_without_writes(): void
    {
        Http::fake([
            'https://clerk.example.test/.well-known/jwks.json' => Http::response(['keys' => [self::$jwk]]),
            'https://api.clerk.com/v1/users/user_test' => Http::failedConnection(),
        ]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_malformed_keys_return_503_without_writes(): void
    {
        Http::fake(['https://clerk.example.test/.well-known/jwks.json' => Http::response(['keys' => 'invalid'])]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_key_connection_failure_returns_503_without_writes(): void
    {
        Http::fake(['https://clerk.example.test/.well-known/jwks.json' => Http::failedConnection()]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_missing_server_config_returns_503(): void
    {
        config(['services.clerk.issuer' => null]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        Http::assertNothingSent();
    }

    public function test_requests_are_throttled(): void
    {
        for ($i = 0; $i < 30; $i++) {
            $this->postJson('/api/auth/sync')->assertUnauthorized();
        }

        $this->postJson('/api/auth/sync')->assertTooManyRequests();

        Http::assertNothingSent();
    }

    public function test_cors_accepts_only_configured_browser_origins(): void
    {
        config(['cors.allowed_origins' => ['https://stay.example.test', 'http://localhost:8081']]);

        $this->options('/api/auth/sync', [], [
            'Origin' => 'https://stay.example.test', 'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization,content-type',
        ])->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'https://stay.example.test');

        $this->options('/api/auth/sync', [], [
            'Origin' => 'https://evil.example.test', 'Access-Control-Request-Method' => 'POST',
        ])->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    private function token(array $overrides = [], bool $withParty = true, string $kid = 'test-key'): string
    {
        $claims = [
            'iss' => 'https://clerk.example.test', 'sub' => 'user_test', 'sid' => 'sess_test',
            'iat' => time() - 5, 'nbf' => time() - 5, 'exp' => time() + 60,
        ];
        if ($withParty) {
            $claims['azp'] = 'https://stay.example.test';
        }

        return JWT::encode(array_replace($claims, $overrides), self::$privateKey, 'RS256', $kid);
    }

    private function fakeClerk(array $overrides = []): void
    {
        Http::fake([
            'https://clerk.example.test/.well-known/jwks.json' => Http::response(['keys' => [self::$jwk]]),
            'https://api.clerk.com/v1/users/user_test' => Http::response(array_replace([
                'id' => 'user_test', 'first_name' => 'Alex', 'last_name' => 'Guest',
                'image_url' => 'https://img.clerk.com/avatar.png', 'primary_email_address_id' => 'email_primary',
                'email_addresses' => [
                    ['id' => 'email_secondary', 'email_address' => 'secondary@example.test'],
                    ['id' => 'email_primary', 'email_address' => 'alex@example.test', 'verification' => ['status' => 'verified']],
                ],
            ], $overrides)),
        ]);
    }
}
