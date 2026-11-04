<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hosts', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('photo_url')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_superhost')->default(false);
            $table->timestamps();
        });

        Schema::create('cancellation_policies', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->text('cancellation_terms');
            $table->text('refund_details');
            $table->timestamps();
        });

        Schema::create('properties', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('host_id')->constrained()->restrictOnDelete();
            $table->foreignId('cancellation_policy_id')->constrained()->restrictOnDelete();
            $table->index('host_id');
            $table->index('cancellation_policy_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('highlights');
            $table->text('surroundings')->nullable();
            $table->string('property_type');
            $table->decimal('price_per_night', 12, 2);
            $table->unsignedInteger('max_guests');
            $table->unsignedInteger('bedrooms');
            $table->decimal('bathrooms', 5, 2);
            $table->json('amenities');
            $table->boolean('pets_allowed')->default(false);
            $table->string('city');
            $table->string('region');
            $table->string('country');
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->text('house_rules')->nullable();
            $table->json('photos');
            $table->decimal('rating', 3, 2)->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(<<<'SQL'
                ALTER TABLE properties
                    ADD CONSTRAINT properties_price_check CHECK (price_per_night >= 0),
                    ADD CONSTRAINT properties_capacity_check CHECK (max_guests > 0 AND bedrooms >= 0 AND bathrooms >= 0),
                    ADD CONSTRAINT properties_rating_check CHECK (rating BETWEEN 0 AND 5),
                    ADD CONSTRAINT properties_review_count_check CHECK (review_count >= 0),
                    ADD CONSTRAINT properties_coordinates_check CHECK (
                        (latitude IS NULL AND longitude IS NULL)
                        OR (latitude IS NOT NULL AND longitude IS NOT NULL
                            AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
                    )
                SQL);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
        Schema::dropIfExists('cancellation_policies');
        Schema::dropIfExists('hosts');
    }
};
