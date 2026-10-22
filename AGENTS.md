# StayApp

StayApp is a mobile-first property rental platform inspired by applications such as Airbnb.

The repository contains the mobile client and Laravel REST API for the application.

## Project Architecture

```text
React Native + Expo
        ↓
     REST API
        ↓
     Laravel
        ↓
    Eloquent
        ↓
   PostgreSQL
```

External services may be used for specific responsibilities:

- Clerk — authentication and identity
- Cloudinary — property and user-uploaded images
- Mapbox — maps and location services
- Stripe — payments
- PostHog — product analytics
- Redis — caching/queues when required
- PostGIS — geospatial functionality when required

Do not introduce additional infrastructure unless the project has a concrete requirement for it.

## Repository Structure

```text
apps/
├── mobile/     React Native + Expo application
└── api/        Laravel REST API

packages/       Shared JavaScript/TypeScript packages when genuinely useful

prompts/        Feature plans and implementation workflows
```

The mobile application and Laravel API are separate applications.

Do not assume that code can be shared directly between PHP and TypeScript.

## Responsibility Boundaries

### Mobile

The mobile application owns:

- UI rendering
- navigation
- user interaction
- local UI state
- server-state consumption
- client-side validation
- presentation of loading, error, and empty states

The mobile application must not be the authoritative source for business rules or security decisions.

### Laravel API

The API owns:

- business logic
- server-side validation
- authorization
- application workflows
- database access
- transactions
- data integrity rules
- API responses

The API is the authoritative source for business rules.

### PostgreSQL

PostgreSQL is the application's primary persistent data store.

Use database constraints and transactions where they are necessary to protect data integrity.

### Clerk

Clerk owns authentication and identity.

Laravel remains responsible for application-level authorization and domain rules.

Do not treat authentication and authorization as the same responsibility.

## Engineering Principles

### Inspect Before Changing

Before modifying code:

1. Inspect the relevant existing implementation.
2. Understand the current architecture and conventions.
3. Reuse existing patterns when appropriate.
4. Only introduce a new pattern when the existing patterns cannot reasonably solve the problem.

Do not assume the repository is empty simply because a feature has not been implemented yet.

### Prefer Simplicity

Prefer the simplest architecture that correctly solves the current problem.

Do not introduce:

- unnecessary abstractions
- unnecessary services
- unnecessary repositories
- unnecessary state management
- unnecessary dependencies
- microservices
- infrastructure
- design patterns solely for theoretical future requirements

Architecture should evolve from real requirements.

### Do Not Duplicate Business Logic

Business rules should have one authoritative implementation.

For example, if the API determines whether a booking is allowed, the mobile application may display the result but must not be trusted to make the final decision.

Client-side validation improves user experience.

Server-side validation and authorization protect the system.

### Keep Temporary Implementations Explicit

During feature development, static or mock data may be used intentionally.

Temporary data must be clearly identified as temporary.

When a feature moves to real backend data:

```text
Static data
    ↓
API contract
    ↓
Laravel endpoint
    ↓
PostgreSQL
    ↓
Mobile API integration
```

Do not silently leave production features dependent on mock data.

## Feature Development Workflow

Features should normally be developed incrementally.

A feature may be divided into multiple implementation steps.

A common workflow is:

```text
Feature plan
    ↓
Mobile UI with static data
    ↓
Verify mobile
    ↓
Laravel API
    ↓
Verify API
    ↓
Connect mobile to API
    ↓
End-to-end verification
```

The mobile and API do not have to be implemented in a single task.

Prefer separate implementation steps when this makes the feature easier to understand, test, and debug.

## Feature Plans

Feature plans belong in:

```text
/prompts/
```

Feature plans describe what is being built.

They should contain:

- Goal
- Decisions
- Out of scope
- Implementation steps
- Verification
- AGENTS.md updates

`AGENTS.md` contains persistent engineering rules.

`prompts/*.md` contains feature-specific decisions and plans.

Do not put temporary feature requirements into `AGENTS.md`.

## Agent Workflow

When given a development task:

1. Read the applicable `AGENTS.md` instructions.
2. Inspect the existing code relevant to the task.
3. Read the applicable feature plan under `/prompts/` when one exists.
4. Identify which application(s) are affected.
5. Explain or establish the implementation approach when architectural decisions are involved.
6. Implement only the requested scope.
7. Verify the implementation using the appropriate checks.
8. Report what was changed and what was verified.
9. If implementation establishes a new permanent architectural rule, propose an update to the appropriate `AGENTS.md`.

Do not claim work is complete when the relevant verification has not been performed.

## Scope Control

Respect the scope of the current task.

If a task says to build a mobile UI using static data:

- work on the mobile application
- use appropriate temporary data
- do not automatically build the Laravel API
- do not modify the database unless required

If a task says to implement a Laravel API:

- work on the API
- do not redesign the mobile UI unless required

If a task explicitly requires both applications, coordinate the changes across both.

## Security

Never trust data originating from the mobile client.

Security-sensitive decisions must be enforced by the Laravel API.

Examples include:

- authorization
- ownership checks
- booking availability
- pricing
- payment state
- role/capability checks
- resource access

Do not rely on hidden UI elements or client-side checks as security mechanisms.

## Verification

Verification should match the scope of the task.

Examples:

Mobile:

- TypeScript checks
- linting
- Expo checks
- relevant manual UI verification

API:

- Laravel tests
- PHP formatting
- static analysis when configured
- database/migration verification
- API endpoint testing

Integration:

- mobile → API request
- authentication
- authorization
- loading state
- error state
- successful response
- relevant edge cases

Never claim a feature works solely because the code was written.

## Updating AGENTS.md

Do not modify `AGENTS.md` simply because a feature was implemented.

Update it when implementation establishes a reusable project-level rule, architectural decision, or convention that future work must follow.

When proposing an update, identify:

- what rule was discovered
- why it is permanent
- which `AGENTS.md` should contain it

Avoid turning `AGENTS.md` into a changelog.