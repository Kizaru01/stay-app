# 17 · Host, property, and cancellation policy models

Status: done

## Goal

Persist hosts, properties, and reusable cancellation policies in Laravel. Each property belongs to one host and one cancellation policy. Each host and policy can have multiple properties.

## Decisions

- Use Laravel integer IDs and timestamps to match the existing User migration. Defer linking Host to User or Clerk until host ownership is defined.
- Translate the diagram to snake_case. Name the domain model CancellationPolicy to distinguish it from Laravel authorization policies.
- Host stores name, optional photo URL and bio, and a superhost flag defaulting to false. CancellationPolicy stores name, description, cancellation terms, and refund details.
- Property stores title, unique slug, description, highlights, surroundings, property type, nightly price, guest capacity, bedrooms, bathrooms, amenities, pets allowed, location, house rules, photos, rating, and review count.
- Store highlights, amenity keys, and photo URLs as JSON arrays. Store city, region, country, and optional paired latitude and longitude in columns. Check coordinate bounds in the database.
- Use a fixed-point decimal with two fractional digits for nightly price and defer currency to the pricing contract. Allow fractional bathrooms. Default pets allowed to false and review count to zero. Leave rating null for unrated properties.
- Store property types and amenities as string keys. Define closed enum values once the product supplies them.
- Require indexed foreign keys to the host and cancellation policy and restrict deleting referenced parents. Enforce unique slugs and numeric range checks where applicable.

## Out of scope

Mobile integration, endpoints, authentication and authorization, uploads, geospatial search, pricing workflows, bookings, payments, and review aggregation.

## Steps

### 1. Add the database schema

In apps/api, generate reversible migrations for hosts, cancellation_policies, and properties in dependency order. Implement the fields and integrity rules above. Verify migration and rollback on disposable PostgreSQL and check compatibility with the existing SQLite test setup.

### 2. Add models and fixtures

Create Host, Property, and CancellationPolicy using existing Eloquent conventions. Add typed relationships in both directions, explicit mass assignment, and casts for arrays, booleans, and decimals. Add factories and opt-in seeders with synthetic records. Verify that factories persist related records.

### 3. Verify persistence

Add focused PHPUnit coverage that persists two properties sharing a host and a cancellation policy. Verify both relationship directions, value round-trips, unique slugs, invalid references, and restricted parent deletion. Verify numeric and coordinate checks against PostgreSQL.

## Verification

Run focused PHPUnit coverage, the Laravel test suite, Pint for changed PHP files, and migration and rollback on disposable PostgreSQL. Record any checks limited by the environment.

## AGENTS.md updates

None.

## Result

Implemented the Laravel migrations, Eloquent models, factories, opt-in seeders, and persistence tests. The six PHPUnit tests passed with 18 assertions against in-memory SQLite using a direct PHPUnit entry point. Migration and rollback also passed on a disposable SQLite database. The standard runner could not open its bootstrap file, Pint reported a file-write error, and PostgreSQL verification requires a PHP runtime with the PostgreSQL driver.
