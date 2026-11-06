<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('clerk_id')->nullable()->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('profile_image_url', 2048)->nullable();
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::table('users')->whereNull('email')->orWhereNull('password')->exists()) {
            throw new RuntimeException('Cannot restore required email/password columns while passwordless users exist. Resolve these records before rolling back.');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['clerk_id']);
            $table->dropColumn(['clerk_id', 'first_name', 'last_name', 'profile_image_url']);
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};
