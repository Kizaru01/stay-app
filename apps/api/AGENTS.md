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

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.5. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `php artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

</laravel-boost-guidelines>
