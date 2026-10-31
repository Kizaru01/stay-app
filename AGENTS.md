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

Use database constraints and transactions where necessary to protect data integrity.

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
4. Only introduce a new pattern when existing patterns cannot reasonably solve the problem.

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

Static or mock data may be used intentionally during feature development.

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

## Feature Workflow

Use this workflow for a new feature, system, or change across several files.

Small fixes, dependency setup, maintenance tasks, and questions may skip this workflow.

1. **Understand.**
   - Read the relevant code and applicable `AGENTS.md` files.
   - Read an existing feature plan only when the task directly builds on it.
   - Read current documentation for APIs or libraries involved when needed.
   - Load and follow a relevant skill when one exists.
   - Do not rely on remembered version-specific APIs when current documentation or a skill is available.

2. **Ask.**
   - Ask when a real product or architectural decision is unclear.
   - Batch related questions when possible.
   - Choose reasonable defaults for minor implementation details and record important decisions in the plan.
   - Do not silently change an existing project decision.

3. **Plan.**
   - Read `prompts/TEMPLATE.md`.
   - Copy it to `prompts/NN-feature-name.md` using the next available number.
   - Make the plan self-contained enough that a fresh session can implement it using the repository instructions and the plan.
   - Break implementation into small, independently verifiable steps.

4. **Stop and wait.**
   - Do not modify application code before the plan is approved.
   - Present the plan for approval.
   - If changes are requested, update the plan and ask again.
   - When approved, set `Status: approved`.

5. **Build.**
   - Implement the approved plan one step at a time.
   - Verify each step before continuing.
   - Do not automatically continue to the next step.
   - If a step reveals a significant architectural or product problem, stop and explain it instead of silently redesigning the plan.

6. **Close out.**
   - Run the verification defined by the plan.
   - Add a short `## Result` section to the plan.
   - Set `Status: done`.
   - If implementation establishes a lasting project rule, update the appropriate `AGENTS.md`.
   - Do not turn `AGENTS.md` into a feature history or changelog.

## Feature Plans

Feature plans belong in:

```text
/prompts/
```

Start every feature plan from:

```text
/prompts/TEMPLATE.md
```

Feature plans should contain:

- Goal
- Decisions
- Out of scope
- Implementation steps
- Verification
- AGENTS.md updates

`AGENTS.md` contains persistent engineering rules.

`prompts/*.md` contains feature-specific decisions and implementation plans.

Do not modify `TEMPLATE.md` for an individual feature.

Do not put temporary feature requirements into `AGENTS.md`.

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

### Mobile

- TypeScript checks
- linting
- Expo checks
- relevant manual UI verification

### API

- Laravel tests
- PHP formatting
- static analysis when configured
- database/migration verification
- API endpoint testing

### Integration

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