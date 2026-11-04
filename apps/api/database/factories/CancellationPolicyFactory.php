<?php

namespace Database\Factories;

use App\Models\CancellationPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CancellationPolicy> */
class CancellationPolicyFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => 'Sample flexible policy',
            'description' => 'An illustrative cancellation policy.',
            'cancellation_terms' => 'Cancel at least 48 hours before check-in.',
            'refund_details' => 'Eligible cancellations receive a full refund.',
        ];
    }
}
