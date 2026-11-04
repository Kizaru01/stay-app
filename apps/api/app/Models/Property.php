<?php

namespace App\Models;

use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'host_id',
    'cancellation_policy_id',
    'title',
    'slug',
    'description',
    'highlights',
    'surroundings',
    'property_type',
    'price_per_night',
    'max_guests',
    'bedrooms',
    'bathrooms',
    'amenities',
    'pets_allowed',
    'city',
    'region',
    'country',
    'latitude',
    'longitude',
    'house_rules',
    'photos',
    'rating',
    'review_count',
])]
class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'amenities' => 'array',
            'photos' => 'array',
            'pets_allowed' => 'boolean',
            'price_per_night' => 'decimal:2',
            'bathrooms' => 'decimal:2',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
            'rating' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Host, $this> */
    public function host(): BelongsTo
    {
        return $this->belongsTo(Host::class);
    }

    /** @return BelongsTo<CancellationPolicy, $this> */
    public function cancellationPolicy(): BelongsTo
    {
        return $this->belongsTo(CancellationPolicy::class);
    }
}
