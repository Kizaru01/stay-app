# StayApp Mobile

This directory contains the StayApp React Native mobile application.

Follow the repository-level `/AGENTS.md` in addition to these mobile-specific instructions.

## Stack

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind
- TanStack Query
- React Hook Form
- Zod
- Clerk

Use the versions already defined by the project unless a dependency upgrade is explicitly required.

## Mobile Responsibilities

The mobile application is responsible for:

- rendering the user interface
- navigation
- user interactions
- local UI state
- consuming server state
- client-side validation
- presenting loading, error, and empty states

The mobile application is not the authoritative source for:

- authorization
- permissions
- pricing
- booking availability
- payment state
- security-sensitive business rules

Those decisions belong to the API.

## Project Structure

Follow the existing project structure before creating new directories.

Prefer organizing code around meaningful features when the existing architecture supports it.

Do not create a new architectural structure merely because another project uses it.

Before adding a component, hook, utility, service, or state store:

1. Search for an existing implementation.
2. Determine whether it can be reused.
3. Only create a new abstraction when it has a clear responsibility.

## TypeScript

Use TypeScript consistently.

- Avoid `any`.
- Prefer explicit and descriptive types.
- Avoid hiding unclear data transformations behind complex expressions.
- Use meaningful variable and function names.
- Keep API response types explicit.
- Do not weaken types merely to make TypeScript errors disappear.

Fix the underlying type problem when practical.

## Components

Components should have clear responsibilities.

Prefer:

```text
Screen
  ↓
Feature components
  ↓
Reusable UI components
```

Do not create abstractions solely to reduce the number of lines in a file.

A component may remain local to a feature when it is not genuinely reusable.

Keep large screens readable by extracting meaningful UI sections when appropriate.

## Navigation

Use Expo Router for application navigation.

Navigation decisions should remain inside the mobile application.

Do not use navigation state as a substitute for authentication or authorization.

A user being able to navigate to a screen does not mean the API should permit the underlying operation.

## Styling

Use the project's established NativeWind and UI conventions.

Before creating a new styling pattern:

1. Inspect existing screens and components.
2. Reuse existing conventions when appropriate.
3. Avoid introducing duplicate styling systems.

Follow the established StayApp visual language and provided design references.

Do not introduce unrelated visual changes while implementing a feature.

## Server State

Use TanStack Query for server state.

Server data should not be duplicated into unrelated global state without a clear reason.

Keep these concepts separate:

```text
Server state
    ↓
TanStack Query

Local UI state
    ↓
React state / appropriate local mechanism
```

Do not treat TanStack Query as a replacement for all local UI state.

## Forms

Use React Hook Form for non-trivial forms.

Use Zod for client-side validation where appropriate.

Client-side validation exists primarily for:

- user experience
- immediate feedback
- preventing obviously invalid submissions

It does not replace Laravel validation.

The API must validate incoming data independently.

## API Integration

Keep API communication separate from presentation components when the existing architecture supports it.

Prefer a clear flow:

```text
Screen
   ↓
Feature hook / query
   ↓
API client
   ↓
Laravel API
```

Do not place large API workflows directly inside JSX.

Handle:

- loading
- success
- empty
- error

states explicitly where appropriate.

## Static and Mock Data

Static data is allowed during UI-first feature development.

When a feature is intentionally being built with static data:

- keep the data clearly identifiable as mock/temporary
- shape the data to resemble the expected API response
- avoid building UI assumptions that cannot reasonably work with real API data

For example:

```text
Mock Listing[]
      ↓
PropertyCard
```

should later be replaceable with:

```text
Laravel API
      ↓
TanStack Query
      ↓
Listing[]
      ↓
PropertyCard
```

Do not connect a feature to the API merely because an API could exist.

Follow the scope of the current task.

## Authentication

Clerk is responsible for authentication and identity.

Do not treat client-side authentication state as sufficient authorization.

The API must independently enforce access to protected operations.

Do not store sensitive authentication information in insecure client storage.

Follow the authentication implementation already established by the project.

## Error Handling

Do not silently ignore API failures.

Present appropriate user-facing states for expected failures.

Do not expose sensitive server or debugging information directly to users.

Keep developer-oriented error details available through appropriate development logging when needed.

## Accessibility and UX

Interactive elements should have appropriate labels and accessible behavior.

Loading and error states should be understandable to users.

Avoid unnecessary interaction complexity.

Use the provided design reference as the source for visual intent when a feature includes a design reference.

## Verification

Before considering a mobile task complete, perform the relevant checks.

At minimum, use the project's configured:

- TypeScript checks
- lint checks
- Expo checks

For UI changes, also verify the affected flow on the appropriate Expo environment.

Do not claim a UI feature is complete solely because the screen compiles.

## Scope

If the task specifically requests:

```text
Build the mobile UI using static data.
```

Do not automatically:

- create Laravel endpoints
- create database migrations
- create Eloquent models
- connect TanStack Query
- modify the API

unless the task explicitly requires those changes. 