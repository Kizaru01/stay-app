<?php

namespace Tests\Feature;

use App\Models\CancellationPolicy;
use App\Models\Host;
use App\Models\Property;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;

class RentalCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_properties_share_a_host_and_cancellation_policy(): void
    {
        $host = Host::factory()->create(['is_superhost' => true]);
        $policy = CancellationPolicy::factory()->create();

        [$first, $second] = Property::factory()
            ->count(2)
            ->for($host)
            ->for($policy)
            ->create([
                'latitude' => '45.523064',
                'longitude' => '-122.676483',
                'pets_allowed' => true,
            ]);

        $property = $first->fresh(['host', 'cancellationPolicy']);

        $this->assertTrue($property->host->is($host));
        $this->assertTrue($property->cancellationPolicy->is($policy));
        $this->assertEqualsCanonicalizing([$first->id, $second->id], $host->properties()->pluck('id')->all());
        $this->assertEqualsCanonicalizing([$first->id, $second->id], $policy->properties()->pluck('id')->all());
        $this->assertTrue($property->host->is_superhost);
        $this->assertTrue($property->pets_allowed);
        $this->assertSame('125.00', $property->price_per_night);
        $this->assertSame('1.50', $property->bathrooms);
        $this->assertSame('45.523064', $property->latitude);
        $this->assertSame('-122.676483', $property->longitude);
        $this->assertSame(['wifi'], $property->amenities);
        $this->assertSame(['Private outdoor space'], $property->highlights);
        $this->assertSame([], $property->photos);
    }

    public function test_property_slugs_are_unique(): void
    {
        $property = Property::factory()->create();

        $this->expectException(QueryException::class);

        Property::factory()->create(['slug' => $property->slug]);
    }

    public function test_a_property_requires_an_existing_host(): void
    {
        $this->expectException(QueryException::class);

        Property::factory()->create(['host_id' => 999999]);
    }

    public function test_a_property_requires_an_existing_cancellation_policy(): void
    {
        $this->expectException(QueryException::class);

        Property::factory()->create(['cancellation_policy_id' => 999999]);
    }

    public function test_a_referenced_host_cannot_be_deleted(): void
    {
        $property = Property::factory()->create();

        $this->expectException(QueryException::class);

        $property->host->delete();
    }

    public function test_a_referenced_cancellation_policy_cannot_be_deleted(): void
    {
        $property = Property::factory()->create();

        $this->expectException(QueryException::class);

        $property->cancellationPolicy->delete();
    }
}
