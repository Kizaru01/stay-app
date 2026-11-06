<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;

class SyncClerkUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $key = openssl_pkey_get_private(file_get_contents(__DIR__.'/../Fixtures/clerk-test-private.pem'));
        config(['services.clerk' => [
            'public_key' => openssl_pkey_get_details($key)['key'],
            'issuer' => 'https://stay-test.clerk.accounts.dev',
            'secret_key' => 'sk_test_fixture_only',
            'authorized_parties' => ['https://stay.example'],
        ]]);
        Http::preventStrayRequests();
    }

    public function test_creates_a_passwordless_user_from_clerk_instead_of_the_client_payload(): void
    {
        Http::fake(['api.clerk.com/v1/users/user_fixture' => Http::response($this->profile())]);

        $response = $this->withToken($this->token())->postJson('/api/auth/sync', [
            'clerk_id' => 'user_attacker', 'email' => 'attacker@example.com', 'first_name' => 'Attacker',
            'password' => 'unsafe', 'id' => 999, 'is_admin' => true,
        ]);

        $response->assertOk()->assertExactJson(['data' => [
            'id' => User::query()->sole()->id,
            'clerk_id' => 'user_fixture', 'email' => 'ada@example.com',
            'first_name' => 'Ada', 'last_name' => 'Lovelace',
            'profile_image_url' => 'https://img.clerk.com/fixture.png',
        ]]);
        $this->assertDatabaseHas('users', [
            'clerk_id' => 'user_fixture', 'name' => 'Ada Lovelace', 'email' => 'ada@example.com',
            'first_name' => 'Ada', 'last_name' => 'Lovelace',
            'profile_image_url' => 'https://img.clerk.com/fixture.png',
            'password' => null, 'remember_token' => null, 'email_verified_at' => null,
        ]);
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.clerk.com/v1/users/user_fixture'
            && $request->hasHeader('Authorization', 'Bearer sk_test_fixture_only'));
    }

    public function test_repeated_sign_ins_update_the_same_user_without_changing_local_credentials_or_created_at(): void
    {
        $user = User::factory()->create(['clerk_id' => 'user_fixture', 'created_at' => '2026-01-01 00:00:00']);
        $password = $user->password;
        $rememberToken = $user->remember_token;
        Http::fake(['api.clerk.com/*' => Http::response($this->profile())]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk()->assertJsonPath('data.id', $user->id);
        $this->withToken($this->token(['sid' => 'sess_second']))->postJson('/api/auth/sync')
            ->assertOk()->assertJsonPath('data.id', $user->id);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', [
            'id' => $user->id, 'email' => 'ada@example.com', 'name' => 'Ada Lovelace',
            'password' => $password, 'remember_token' => $rememberToken, 'created_at' => '2026-01-01 00:00:00',
        ]);
        Http::assertSentCount(2);
    }

    public function test_profile_changes_and_null_values_replace_previous_values(): void
    {
        $user = User::factory()->create([
            'clerk_id' => 'user_fixture', 'first_name' => 'Old', 'last_name' => 'Name',
            'profile_image_url' => 'https://example.com/old.png',
        ]);
        Http::fake(['api.clerk.com/*' => Http::response($this->profile([
            'first_name' => null, 'last_name' => null, 'image_url' => null,
            'primary_email_address_id' => null, 'email_addresses' => [],
        ]))]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertOk()
            ->assertJsonPath('data.email', null)->assertJsonPath('data.first_name', null)
            ->assertJsonPath('data.last_name', null)->assertJsonPath('data.profile_image_url', null);

        $this->assertDatabaseHas('users', [
            'id' => $user->id, 'email' => null, 'name' => '', 'first_name' => null, 'last_name' => null,
            'profile_image_url' => null, 'email_verified_at' => null,
        ]);
        Http::assertSentCount(1);
    }

    public function test_uses_the_primary_email_instead_of_the_first_email(): void
    {
        Http::fake(['api.clerk.com/*' => Http::response($this->profile(['email_addresses' => [
            ['id' => 'email_other', 'email_address' => 'other@example.com'],
            ['id' => 'email_primary', 'email_address' => 'primary@example.com'],
        ]]))]);

        $this->withToken($this->token(['azp' => 'https://stay.example', 'sts' => 'active']))
            ->postJson('/api/auth/sync')->assertOk()->assertJsonPath('data.email', 'primary@example.com');

        $this->assertDatabaseHas('users', ['clerk_id' => 'user_fixture', 'email' => 'primary@example.com']);
        Http::assertSentCount(1);
    }

    #[DataProvider('emailOwners')]
    public function test_returns_409_without_linking_or_modifying_an_email_owner(?string $ownerClerkId): void
    {
        $owner = User::factory()->create(['email' => 'ada@example.com', 'clerk_id' => $ownerClerkId]);
        $before = $owner->fresh()->getAttributes();
        Http::fake(['api.clerk.com/*' => Http::response($this->profile())]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertConflict()
            ->assertJsonPath('message', 'This identity conflicts with an existing account. Contact support.');

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($before, $owner->fresh()->getAttributes());
        Http::assertSentCount(1);
    }

    public static function emailOwners(): array
    {
        return ['legacy account' => [null], 'different Clerk identity' => ['user_other']];
    }

    public function test_returns_409_without_partial_updates_when_an_existing_user_changes_to_an_owned_email(): void
    {
        User::factory()->create(['email' => 'ada@example.com']);
        $user = User::factory()->create(['clerk_id' => 'user_fixture', 'email' => 'original@example.com']);
        $before = $user->fresh()->getAttributes();
        Http::fake(['api.clerk.com/*' => Http::response($this->profile())]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertConflict();

        $this->assertDatabaseCount('users', 2);
        $this->assertSame($before, $user->fresh()->getAttributes());
        Http::assertSentCount(1);
    }

    public function test_database_rejects_duplicate_clerk_ids(): void
    {
        User::factory()->create(['clerk_id' => 'user_fixture']);

        $this->expectException(UniqueConstraintViolationException::class);

        User::factory()->create(['clerk_id' => 'user_fixture']);
    }

    public function test_returns_401_without_a_bearer_token_even_with_a_client_user_id(): void
    {
        Http::fake();

        $this->postJson('/api/auth/sync', ['clerk_id' => 'user_fixture'])->assertUnauthorized();

        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    #[DataProvider('invalidClaims')]
    public function test_returns_401_without_fetching_a_profile_or_writing_users_for_invalid_claims(array $overrides): void
    {
        Http::fake();

        $this->withToken($this->token($overrides))->postJson('/api/auth/sync')->assertUnauthorized();

        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public static function invalidClaims(): array
    {
        return [
            'wrong issuer' => [['iss' => 'https://other.clerk.accounts.dev']],
            'missing issuer' => [['iss' => null]],
            'expired' => [['exp' => 1]],
            'missing expiration' => [['exp' => null]],
            'string expiration' => [['exp' => '9999999999']],
            'future not before' => [['nbf' => 9999999999]],
            'missing not before' => [['nbf' => null]],
            'future issued at despite past not before' => [['iat' => 9999999999]],
            'missing issued at' => [['iat' => null]],
            'missing subject' => [['sub' => null]],
            'path traversal subject' => [['sub' => 'user_../other']],
            'oversized subject' => [['sub' => 'user_'.str_repeat('a', 255)]],
            'missing session' => [['sid' => null]],
            'non session token' => [['sid' => 'm2m_fixture']],
            'untrusted origin' => [['azp' => 'https://attacker.example']],
            'null origin' => [['azp' => null]],
            'pending session' => [['sts' => 'pending']],
            'unknown session status' => [['sts' => 'revoked']],
        ];
    }

    #[DataProvider('invalidTokens')]
    public function test_returns_401_for_malformed_or_forged_tokens(string $kind): void
    {
        Http::fake();
        $validToken = $this->token();
        $token = match ($kind) {
            'malformed' => 'not-a-jwt',
            'oversized' => str_repeat('x', 16385),
            'wrong algorithm' => JWT::encode(['sub' => 'user_fixture'], str_repeat('secret', 8), 'HS256'),
            'bad signature' => substr($validToken, 0, strrpos($validToken, '.') + 1).JWT::urlsafeB64Encode(str_repeat('x', 256)),
            'invalid algorithm type' => JWT::urlsafeB64Encode('{"alg":["RS256"]}').'.e30.eA',
        };

        $this->withToken($token)->postJson('/api/auth/sync')->assertUnauthorized();

        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public static function invalidTokens(): array
    {
        return array_map(fn (string $kind): array => [$kind], ['malformed', 'oversized', 'wrong algorithm', 'bad signature', 'invalid algorithm type']);
    }

    #[DataProvider('missingConfiguration')]
    public function test_returns_503_without_writing_users_for_missing_configuration(string $key, mixed $value): void
    {
        config(['services.clerk.'.$key => $value]);
        Http::fake();

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public static function missingConfiguration(): array
    {
        return [
            'missing key' => ['public_key', ''], 'invalid key' => ['public_key', 'invalid pem'],
            'missing issuer' => ['issuer', null], 'insecure issuer' => ['issuer', 'http://clerk.example'],
            'missing secret' => ['secret_key', null],
        ];
    }

    #[DataProvider('upstreamFailures')]
    public function test_returns_safe_errors_without_writing_users_for_clerk_failures(int $upstream, int $expected): void
    {
        Http::fake(['api.clerk.com/*' => Http::response(['errors' => ['private details']], $upstream)]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertStatus($expected)
            ->assertDontSee('private details');

        $this->assertDatabaseCount('users', 0);
        Http::assertSentCount(1);
    }

    public static function upstreamFailures(): array
    {
        return ['deleted user' => [404, 401], 'invalid secret' => [401, 503], 'rate limit' => [429, 503],
            'unavailable' => [500, 503], 'redirect' => [302, 503]];
    }

    public function test_returns_503_without_writing_users_for_a_connection_failure(): void
    {
        Http::fake(['api.clerk.com/*' => Http::failedConnection()]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
    }

    #[DataProvider('invalidProfiles')]
    public function test_returns_503_without_writing_users_for_an_invalid_clerk_profile(array $overrides): void
    {
        Http::fake(['api.clerk.com/*' => Http::response($this->profile($overrides))]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
        Http::assertSentCount(1);
    }

    public static function invalidProfiles(): array
    {
        return [
            'different user' => [['id' => 'user_other']],
            'long first name' => [['first_name' => str_repeat('a', 256)]],
            'invalid last name' => [['last_name' => []]],
            'invalid image URL' => [['image_url' => 'javascript:alert(1)']],
            'missing primary email' => [['primary_email_address_id' => 'email_missing']],
            'invalid email' => [['email_addresses' => [['id' => 'email_primary', 'email_address' => 'invalid']]]],
            'invalid emails array' => [['email_addresses' => 'invalid']],
        ];
    }

    public function test_returns_503_without_writing_users_for_a_non_json_clerk_response(): void
    {
        Http::fake(['api.clerk.com/*' => Http::response('<html>Unavailable</html>')]);

        $this->withToken($this->token())->postJson('/api/auth/sync')->assertServiceUnavailable();

        $this->assertDatabaseCount('users', 0);
        Http::assertSentCount(1);
    }

    public function test_returns_429_after_too_many_synchronization_requests(): void
    {
        Http::fake();
        for ($attempt = 0; $attempt < 30; $attempt++) {
            $this->postJson('/api/auth/sync')->assertUnauthorized();
        }

        $this->postJson('/api/auth/sync')->assertTooManyRequests();

        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    /** @return array<string, mixed> */
    private function profile(array $overrides = []): array
    {
        return array_replace([
            'id' => 'user_fixture', 'first_name' => 'Ada', 'last_name' => 'Lovelace',
            'image_url' => 'https://img.clerk.com/fixture.png', 'primary_email_address_id' => 'email_primary',
            'email_addresses' => [['id' => 'email_primary', 'email_address' => 'ada@example.com']],
        ], $overrides);
    }

    private function token(array $overrides = []): string
    {
        // This committed key is exclusively a test fixture, never a Clerk or deployment key.
        return JWT::encode(array_replace([
            'iss' => 'https://stay-test.clerk.accounts.dev', 'sub' => 'user_fixture', 'sid' => 'sess_fixture',
            'iat' => time() - 5, 'nbf' => time() - 5, 'exp' => time() + 300,
        ], $overrides), file_get_contents(__DIR__.'/../Fixtures/clerk-test-private.pem'), 'RS256');
    }
}
