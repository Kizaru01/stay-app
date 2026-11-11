# 18 · Clerk user synchronization

Status: approved

## Goal
After email/password or Google authentication completes in Clerk, automatically create or update the corresponding Laravel user in PostgreSQL. Repeat synchronization when a signed-in session is restored, with clear loading, failure, and retry behavior.

## Decisions
- Preserve the existing Clerk application and authentication screens from plan 05. The mobile app uses `@clerk/expo` ^4.14.1; Laravel requires ^13.17. Verify installed versions before implementation.
- Use immediate authenticated synchronization: mobile sends a Clerk session bearer token to `POST /api/auth/sync` with no identity payload. Laravel verifies the token, retrieves the current Clerk user through the Backend API, and persists an explicit allowlist of identity fields.
- Validate RS256 signatures against configured Clerk instance keys, exact issuer, expiration, not-before, subject and session claims, and authorized parties when present. Account for native bearer tokens without an `azp` claim. Reject pending session status. Never choose the issuer or key URL from untrusted token claims.
- Add `firebase/php-jwt` for JWT verification and `@tanstack/react-query` for mobile server state; approval of this plan includes these narrowly scoped dependencies. Use Laravel's HTTP client for Clerk user retrieval, bounded timeouts, safe errors, and cached JWKS with bounded refresh on an unknown key ID. Check current dependency APIs and compatibility first.
- Use `users.clerk_id` as a nullable unique external identity key so existing users remain intact. Reuse nullable `first_name`, `last_name`, and `profile_image_url`; expose the latter as `avatar_url` in API responses. Keep existing local IDs and relationships, legacy password hashes, Sanctum, and sessions intact. Email and password remain nullable in the reconciled schema; synchronization still requires a primary email.
- Synchronize name, primary email, primary-email verification status, and avatar only. Select the primary email by Clerk's primary email ID. Define a stable display-name fallback for missing names; reject missing primary email with a safe 422 response. Store no passwords, OAuth access tokens, or session tokens.
- Preserve the existing unique email constraint. Never link users by email alone: conflicts with another local user return a safe 409 and leave both records unchanged. Existing-account migration or merging requires a separate decision.
- Make writes idempotent and safe under concurrent requests using the unique Clerk ID constraint and a conflict-safe database operation. Never overwrite Laravel-owned roles or domain data. Avoid holding database transactions open during Clerk network requests.
- Return 200 with `{ data: { id, clerk_id, name, email, email_verified_at, avatar_url } }` for both creation and update. Return 401 for invalid credentials, 409 for identity conflicts, 422 for unsupported identity data, 429 for local throttling, and 503 for temporary Clerk/key-fetch failures. No partial writes on failure.
- Add one synchronization boundary under ClerkProvider. Key its server state by Clerk user and session; synchronize once per active session per app launch, including restored sessions. Do not synchronize incomplete email verification or cancelled OAuth flows.
- Signed-in users see a short account-loading state until sync succeeds, then existing navigation resumes. Failure offers Retry and Sign out without restarting Clerk authentication. Signed-out browsing and onboarding remain available. Abort or discard obsolete requests and remove identity cache on sign-out/account switch; ordinary token refreshes must not create a sync loop.
- Configure `EXPO_PUBLIC_API_URL` for the mobile API base URL, and server-only Clerk secret key, issuer, and authorized parties through Laravel config. Provide placeholder configuration instructions without printing existing environment files. Restrict browser CORS to configured development/production origins and allow Authorization; retain native support.
- This synchronizes at authentication/session restoration. Clerk changes made while the app is closed are reflected at the next sync, not continuously. No webhook endpoint or extra queue infrastructure is required for this scope.
- Tests must use an isolated test database. Do not reset or seed the configured application database. Inspect existing schema and migration status before applying additive migrations. If Neon operations are needed, load the Neon Postgres skill and follow its branch workflow.

## Out of scope
Webhook-driven profile updates/deletion, account deletion, legacy account migration/merging, new authentication providers, Clerk dashboard changes, role or host provisioning, property API integration, production deployment, and unrelated UI changes.

## Steps
### 1. Add Clerk identity persistence
Read root/API instructions and applicable Laravel migration/model skill rules. Inspect the installed framework, User model/factory, existing migrations, and database schema using available read-only tools. Add an additive migration for the fields and nullable password described above; preserve existing records. Update explicit model fields/casts and factories where required. Add isolated tests proving legacy records survive, Clerk users need no password, and Clerk IDs remain unique. Verify migration behavior on isolated PostgreSQL, including rollback limitations when passwordless records exist. Stop after verification; do not continue automatically.

### 2. Implement authenticated synchronization
Read the Laravel security, routing, HTTP client, configuration, and testing skill rules. Verify current Clerk session-token documentation and PHP JWT APIs. Add the approved JWT dependency, server config, token-verification middleware, a small Clerk API integration, and the synchronization controller/route. Keep workflow logic out of route definitions. Fetch identity only for the verified subject; validate the returned ID. Implement response allowlists, collision handling, concurrency protection, rate limiting, and appropriate CORS. Document required configuration using placeholders in this plan and example configuration files. Verify all API success and failure cases below with generated test signing keys and faked Clerk HTTP responses. Stop after verification.

### 3. Connect the mobile session lifecycle
Read mobile instructions, Clerk Expo recipes, and Expo networking skill. Inspect installed Clerk types for `useAuth` and `getToken`; preserve existing sign-in, email verification, SSO, and token-cache behavior. Add the approved TanStack Query dependency/provider, typed API call, and central synchronization boundary in the root layout. Use Clerk `getToken()` per attempt, finite request timeouts, bounded retries for transient failures, explicit error/retry/sign-out controls, and session-specific state. Handle missing API configuration visibly for signed-in users. Verify both providers, restored sessions, cancelled auth, sign-out and account-switch races, retries, and unchanged guest browsing. Stop after verification.

### 4. Verify integration and record results
Run the complete verification below against an isolated development environment. Use the existing Clerk application; the user performs interactive authentication and creates any necessary real test account. Confirm persisted rows with read-only queries and prove repeated logins retain the same local user ID. Record executed checks and remaining environment limitations in a Result section. Apply the permanent rules below only if established by implementation, and mark done only when required work is complete.

## Verification
- API: new email/password and Google identities, repeated sync, refreshed profile fields, primary-email selection/verification changes, missing name/avatar, missing email, and same-email conflicts.
- Security: missing/malformed/expired/future tokens, bad signatures/algorithm, wrong issuer/authorized party, missing subject/session, pending sessions, unknown key IDs, key rotation, and native bearer tokens without azp. Client identity fields cannot select another user or alter roles.
- Resilience: concurrent first-sync requests create one user; Clerk timeout/rate-limit/not-found/malformed responses cause no partial writes; database conflicts remain safe and predictable. Ensure secrets are absent from responses and logs.
- Database: isolated PostgreSQL migrations, constraints, and preservation of legacy IDs/passwords. Do not run destructive test commands against the application database.
- Run relevant `php artisan test --compact` tests, `vendor/bin/pint --dirty --format agent`, mobile TypeScript and lint, Expo dependency checks and native export, and `git diff --check`. Inspect existing scripts before choosing exact commands.
- Mobile: loading and recoverable failures, retry after API downtime, expired token recovery, restart with a valid session, sign-out during a request, account switching, incomplete verification, OAuth cancellation, guest navigation, and no cross-user cached identity.
- End-to-end: email sign-up -> verify email -> sync -> PostgreSQL row; sign out -> email sign-in -> same row; Google sign-in -> corresponding row; restart -> sync without duplicates. Report any device, credential, or service limitations honestly.

## AGENTS.md updates
- API Authentication: document that Clerk bearer verification establishes identity and local users are keyed by immutable Clerk ID; never merge by email. This is a permanent identity/security boundary for future protected endpoints.
- Mobile API Integration: document the shared authenticated request pattern and clearing user-scoped server state on session/account changes. This prevents future endpoints from bypassing established session handling.
- These extend existing rules; they do not replace Clerk ownership of authentication or Laravel ownership of authorization.

## Progress
- Step 1 implemented: additive user migration, explicit model fields, passwordless Clerk factory state, and eight persistence/migration tests. Existing user IDs, passwords, and the unique email constraint are preserved.
- Schema reconciliation approved on November 11: the Neon database already had nullable `clerk_id`, `first_name`, `last_name`, `profile_image_url`, email and password, without a matching repository migration. The migration now adds only missing identity columns/indexes and aligns fresh installs with that existing schema. It is forward-only because it cannot safely drop pre-existing columns during rollback.
- Verification: all 8 tests passed with 21 assertions using isolated in-memory SQLite; Pint passed. Installed Laravel is 13.38.0 and PHP is 8.5.0.
- Step 1 PostgreSQL verification passed using the existing downloaded PHP 8.5.12 runtime with PDO PostgreSQL enabled. All 8 persistence tests passed with 21 assertions. The default PHP runtime still lacks this driver; no global PHP settings were changed.
- Step 2 implemented: `POST /api/auth/sync`, Clerk token middleware, cached RS256 JWKS verification with a 30-second unknown-key refresh cooldown, trusted Backend API profile retrieval, atomic upsert keyed by Clerk ID, safe email-conflict responses, explicit response fields, throttling, and configurable CORS. Installed `firebase/php-jwt` 7.2.1; unrelated dependency versions were preserved.
- Step 2 verification: 36 endpoint cases passed on SQLite. All 50 existing feature tests passed on isolated PostgreSQL 17 with 177 assertions, including the persistence tests and rental catalog regression tests. Temporary PostgreSQL was stopped afterward. No application database migrations or data changes were performed.
- The default PHPUnit command references a nonexistent `tests/Unit` directory; use `php vendor/bin/phpunit tests/Feature`. The endpoint tests generate ephemeral RSA signing keys and fake Clerk HTTP responses. Configure `OPENSSL_CONF` for the local PHP distribution when its default OpenSSL configuration is unavailable.
- The endpoint uses a database-native upsert and unique constraints for concurrent creation; simultaneous process-level request testing and live Clerk authentication remain part of integration verification.
- Composer audit reports 8 advisories affecting 5 existing Symfony packages, none for the added JWT dependency. Dependency remediation is outside this feature's approved dependency scope.
- Step 3 implemented: a central Clerk session boundary provides a separate TanStack Query client for each user/session, discards its cache on unmount, synchronizes authenticated/restored sessions, and presents loading, Retry, and Sign out states. Navigation stays mounted behind the blocking state so existing authentication redirects can complete. Existing signed-out onboarding/authentication and the browse area's sign-in requirement are preserved.
- The mobile request has a 15-second timeout covering token retrieval and HTTP, cancellation on session disposal, one forced token refresh after a 401, bounded transient retries, response-shape and Clerk-ID checks, and safe user-facing messages. It never sends profile fields or stores session tokens outside Clerk.
- Step 3 automated verification: TypeScript and lint passed; all 21 synchronization/onboarding/email-confirmation regression tests passed; Android and iOS production exports succeeded. Export artifacts are under ignored `apps/mobile/dist/clerk-sync-20261110`.
- Expo's offline dependency check passed, but its online compatibility check recommends 15 patch/version updates to existing Expo/React Native dependencies. Those existing versions were preserved; the only new mobile dependency is TanStack Query.
- Step 3 device/UI and real email/Google authentication checks are still pending. Step 4 will verify actual configuration, migration deployment to the intended development database, real sign-in, API failures/retry, session restoration, and PostgreSQL rows. No application database migration has been applied yet. Stop at this step boundary rather than claiming end-to-end completion.

## Step 4 integration progress
- Created isolated Neon branch `codex-clerk-sync-verification` (`br-wild-night-bdnfem7y`), expiring November 18, 2026. Production and the project's pinned Neon context are unchanged.
- Applied the approved reconciled migration successfully to that isolated branch, which initially contained zero users. All 50 API feature tests passed after reconciliation (175 assertions, SQLite); the previous pre-reconciliation PostgreSQL test run had passed.
- Local HTTP health check returned 200; unauthenticated synchronization returned 401 with the expected JSON. Local CORS was verified for both preview ports 8081 and 8082. Local server settings are process-only overrides; existing environment files were not rewritten.
- Real authentication was deferred because the user could not sign in at the handoff. Do not mark the feature done until signed-in synchronization and persisted rows are verified.
- The user reported a collapsed error-screen layout in the 8082 preview. Replaced utility-based overlay sizing with explicit React Native positioning and a responsive maximum width, plus scrolling for small windows. Restarted hidden local Expo/API processes, including the 8082 CORS origin, and retained isolated database targeting. Visual verification is in progress.

## Mobile configuration for Step 3
- Set `EXPO_PUBLIC_API_URL` to the Laravel API base URL including `/api`, for example `http://<development-machine-LAN-address>:8000/api`. A physical phone's localhost points to the phone, not the development computer. Use HTTPS for deployed environments.
- Keep the existing `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The mobile integration never requires a Clerk secret key.
- Restart Expo after changing public environment values. Web testing also requires the matching Laravel authorized-party/CORS origins described below.
- Missing or invalid API configuration displays a recoverable account-setup error for signed-in users. Signed-out users can still access onboarding and authentication.

## Server configuration for Step 2
- Set `CLERK_SECRET_KEY` only in the Laravel environment using the existing Clerk application's secret key.
- Set `CLERK_ISSUER` to that instance's exact HTTPS issuer, such as `https://your-instance.clerk.accounts.dev`, without a trailing slash. The verifier derives its JWKS URL from this server configuration, never from token input.
- Set `CLERK_AUTHORIZED_PARTIES` to comma-separated trusted browser origins, such as `http://localhost:8081,https://your-web-app.example`. Native bearer tokens without an authorized-party claim are accepted; tokens containing one must match the allowlist.
- Set `CORS_ALLOWED_ORIGINS` to the browser origins allowed to call this API. Native clients do not require CORS. Empty defaults allow no browser origins. Include the actual Expo web origin when testing web.
- Apply the additive migration to the intended development database before using the endpoint. Do not run migrations or tests against a production database by accident. This implementation has only migrated isolated test databases so far.
- Obtain a Clerk session token on the client and send it as `Authorization: Bearer <session-token>` with `Accept: application/json` to `POST /api/auth/sync`. No identity payload is needed or trusted. Step 3 will automate this lifecycle in mobile.
