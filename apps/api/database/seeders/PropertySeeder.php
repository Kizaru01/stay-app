<?php

namespace Database\Seeders;

use App\Models\CancellationPolicy;
use App\Models\Host;
use App\Models\Property;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        Property::factory()
            ->count(2)
            ->for(Host::factory())
            ->for(CancellationPolicy::factory())
            ->create();
    }
}
