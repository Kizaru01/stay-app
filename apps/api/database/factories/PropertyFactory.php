<?php

namespace Database\Factories;

use App\Models\CancellationPolicy;
use App\Models\Host;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Property> */
class PropertyFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'host_id' => Host::factory(),
            'cancellation_policy_id' => CancellationPolicy::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::uuid(),
            'description' => fake()->paragraph(),
            'highlights' => ['Private outdoor space'],
            'property_type' => 'house',
            'price_per_night' => '125.00',
            'max_guests' => 4,
            'bedrooms' => 2,
            'bathrooms' => '1.50',
            'amenities' => ['wifi'],
            'city' => 'Portland',
            'region' => 'Oregon',
            'country' => 'United States',
            'photos' => [],
        ];
    }
}
