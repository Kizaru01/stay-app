# StayApp API

This directory contains the Laravel REST API for StayApp.

Follow the repository-level `/AGENTS.md` in addition to these API-specific instructions.

## Stack

- PHP
- Laravel
- Eloquent
- PostgreSQL

Use the versions and packages already established by the project unless a dependency change is explicitly required.

## API Responsibilities

The Laravel API is the authoritative source for:

- business rules
- server-side validation
- authorization
- application workflows
- database access
- data integrity
- transactions
- API responses

Never trust the mobile application to enforce security-sensitive business rules.

## Request Architecture

Prefer the following structure when the endpoint requires these responsibilities:

```text
HTTP Request
     ↓
Route
     ↓
Controller
     ↓
Form Request
     ↓
Policy / Authorization
     ↓
Service / Business Workflow
     ↓
Eloquent
     ↓
PostgreSQL
```

Not every endpoint requires every layer.

Do not introduce a service, repository, DTO, action, or other abstraction without a clear responsibility.

Prefer simple Laravel conventions when they are sufficient.

## Routes

Routes define how HTTP requests enter the application.

Keep routes readable and consistent with the existing API structure.

Do not place business logic directly inside route definitions.

Use appropriate route middleware for cross-cutting concerns such as authentication.

## Controllers

Controllers handle HTTP concerns.

Controllers should generally:

- receive the request
- work with validated input
- coordinate the application operation
- return the appropriate HTTP response

Controllers should not contain large business workflows.

Avoid turning controllers into large collections of database queries and conditional business logic.

## Validation

Use Laravel Form Requests for meaningful request validation.

Validation must occur on the server even when the mobile application performs Zod validation.

Client validation improves user experience.

Laravel validation protects the application.

Never assume data is safe because it was validated on the mobile client.

## Authorization

Use Laravel authorization mechanisms, including Policies where appropriate.

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this operation?

Clerk handles authentication and identity.

Laravel owns application-level authorization.

Authorization should be enforced on the server.

Do not rely on:

- hidden mobile buttons
- disabled UI controls
- navigation restrictions
- client-side role checks

as security mechanisms.

## Services

Use services for meaningful business workflows that benefit from being separated from HTTP concerns and persistence concerns.

Examples:

```text
BookingService
ListingService
PaymentService
```

A service should represent meaningful application behavior.

Do not create services that merely wrap a single Eloquent call without adding meaningful behavior.

Prefer a straightforward controller + Eloquent implementation when no additional business workflow exists.

## Eloquent Models

Eloquent models represent persistence and relationships.

Use models for:

- database relationships
- casts
- persistence-related behavior
- appropriate model-level concerns

Avoid placing large application workflows directly inside Eloquent models.

Do not use models as a replacement for every other application layer.

## Database

PostgreSQL is the source of truth for persistent application data.

Prefer database-level integrity where appropriate.

Use:

- foreign keys
- unique constraints
- appropriate indexes
- not-null constraints
- check constraints where appropriate
- transactions when multiple operations must succeed or fail together

Do not rely only on application code when a database constraint can protect data integrity.

## Transactions

Use database transactions when an operation modifies multiple pieces of related data that must remain consistent.

For example:

```text
Create booking
    ↓
Update related availability/state
    ↓
Create related records
```

If those operations must succeed together, consider a transaction.

Do not use transactions indiscriminately for simple read-only operations.

## Database Queries

Prefer clear and intentional Eloquent queries.

Avoid unnecessary queries.

Be aware of:

- N+1 queries
- eager loading
- pagination
- indexes
- filtering at the database level

Do not load an entire dataset into application memory when the database can perform the filtering or pagination.

## API Responses

Follow the response conventions already established by the project.

Responses should be predictable and consistent.

Do not expose:

- passwords
- authentication secrets
- internal stack traces
- sensitive database information
- unnecessary internal implementation details

Only return data required by the client.

## Authentication

Clerk is responsible for authentication and identity.

Laravel must still determine whether the authenticated user is authorized to perform the requested operation.

Do not assume:

```text
Authenticated = Authorized
```

They are separate decisions.

## Security

Treat all client input as untrusted.

Always enforce security-sensitive rules on the server.

Examples include:

- authorization
- ownership
- booking availability
- pricing
- payment state
- user capabilities
- resource access

Never rely on client-provided values for decisions that should be calculated or verified by the server.

## API Development Workflow

When implementing an API feature:

1. Inspect the existing routes.
2. Inspect related models and migrations.
3. Inspect existing controllers, requests, policies, and services.
4. Understand the existing API conventions.
5. Determine the smallest appropriate architecture.
6. Implement the required database changes.
7. Implement the API behavior.
8. Add or update tests.
9. Verify the endpoint.

Do not create a new architecture pattern simply because the feature is new.

## Scope

If the task specifically requests:

```text
Implement the Laravel API for the feature.
```

Do not automatically:

- redesign the mobile UI
- modify unrelated mobile code
- add unnecessary infrastructure
- implement unrelated features

If mobile integration is explicitly part of the task, coordinate with the mobile application according to the repository-level workflow.

## Verification

Before considering an API task complete, run the relevant checks configured by the project.

These may include:

- Laravel tests
- PHP formatting
- static analysis
- migrations
- database checks
- endpoint/API testing

Verify both successful and expected failure cases when applicable.

Do not claim an endpoint works solely because the implementation was written.

## Architecture Evolution

Do not add repositories, DTOs, actions, domain layers, or additional abstractions simply because they are common in other Laravel projects.

Introduce an abstraction when the current code demonstrates a real need for it.

If a new architectural convention becomes necessary and should apply to future API work, propose an update to this `AGENTS.md`.