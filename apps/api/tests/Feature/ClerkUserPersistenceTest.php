<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;

class ClerkUserPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_clerk_users_persist_without_local_credentials(): void
    {
        $user = User::factory()->clerk()->create([
            'clerk_id' => 'user_verified_identity',
            'profile_image_url' => 'https://img.clerk.com/avatar.png',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'clerk_id' => 'user_verified_identity',
            'profile_image_url' => 'https://img.clerk.com/avatar.png',
            'password' => null,
            'remember_token' => null,
        ]);
    }

    public function test_duplicate_clerk_ids_are_rejected(): void
    {
        $user = User::factory()->clerk()->create();

        $this->expectException(QueryException::class);

        User::factory()->clerk()->create(['clerk_id' => $user->clerk_id]);
    }

    public function test_clerk_users_cannot_reuse_a_legacy_users_email(): void
    {
        $legacyUser = User::factory()->create();

        $this->expectException(QueryException::class);

        User::factory()->clerk()->create(['email' => $legacyUser->email]);
    }

    public function test_migration_preserves_existing_users_and_allows_multiple_unlinked_users(): void
    {
        $migration = $this->identityMigration();
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['clerk_id']);
            $table->dropColumn(['clerk_id', 'first_name', 'last_name', 'profile_image_url']);
            $table->string('password')->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
        });
        $users = User::factory()->count(2)->create();
        $originals = $users->map(fn (User $user) => $user->getRawOriginal())->all();

        $migration->up();

        foreach ($originals as $attributes) {
            $this->assertDatabaseHas('users', [...$attributes, 'clerk_id' => null, 'profile_image_url' => null]);
        }
    }

    public function test_reconciliation_preserves_existing_identity_columns_and_records(): void
    {
        $user = User::factory()->clerk()->create([
            'first_name' => 'Alex',
            'last_name' => 'Guest',
            'profile_image_url' => 'https://img.clerk.com/avatar.png',
        ]);
        $original = $user->getRawOriginal();

        $this->identityMigration()->up();

        $this->assertDatabaseHas('users', $original);
        $this->assertTrue(Schema::hasIndex('users', ['clerk_id'], 'unique'));
    }

    /** @param array<string, string|null> $attributes */
    #[DataProvider('identityData')]
    public function test_rollback_refuses_to_discard_identity_data(array $attributes): void
    {
        $user = User::factory()->create($attributes);
        $original = $user->getRawOriginal();

        try {
            $this->identityMigration()->down();
            $this->fail('Rollback must refuse to discard account data.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('Use a forward migration', $exception->getMessage());
        }

        $this->assertTrue(Schema::hasColumn('users', 'clerk_id'));
        $this->assertTrue(Schema::hasColumn('users', 'profile_image_url'));
        $this->assertDatabaseHas('users', $original);
    }

    /** @return array<string, array{array<string, string|null>}> */
    public static function identityData(): array
    {
        return [
            'passwordless user' => [['password' => null]],
            'linked identity' => [['clerk_id' => 'user_existing_identity']],
            'stored avatar' => [['profile_image_url' => 'https://img.clerk.com/avatar.png']],
        ];
    }

    private function identityMigration(): Migration
    {
        return require database_path('migrations/2026_11_07_133539_add_clerk_identity_to_users_table.php');
    }
}
