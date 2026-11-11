<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['clerk_id', 'first_name', 'last_name', 'profile_image_url'] as $column) {
            if (! Schema::hasColumn('users', $column)) {
                Schema::table('users', function (Blueprint $table) use ($column) {
                    $table->string($column, $column === 'profile_image_url' ? 2048 : 255)->nullable();
                });
            }
        }

        if (! Schema::hasIndex('users', ['clerk_id'], 'unique')) {
            Schema::table('users', fn (Blueprint $table) => $table->unique('clerk_id'));
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        throw new RuntimeException('Identity columns may predate this migration. Use a forward migration to preserve account data.');
    }
};
