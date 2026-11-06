# 20 · Diagnose and fix Google SSO loading

Status: approved

## Goal
Return Google sign-up and sign-in users to StayApp reliably, then synchronize the Clerk session with Laravel and open Home only after synchronization succeeds. Give the user a visible, recoverable error instead of leaving the browser flow or app screen indefinitely loading.

## Decisions
- Keep Clerk responsible for authentication and identity, and keep Laravel responsible for creating or refreshing the local user.
- Treat Google OAuth return, Clerk session activation, and Laravel synchronization as separate stages. Diagnose each stage before changing it; do not assume a callback or API failure without evidence.
- Preserve the existing `mobile` Expo scheme, Clerk publishable key, social sign-in strategies, guest browsing, token refresh behavior, and API synchronization contract.
- First trace and reproduce the Google flow on a physical Android device because the provided screenshot is the Google consent page. Do not change providers or add a new OAuth library when the existing `@clerk/expo` `startSSOFlow` implementation can support the required fix.
- Require both `setActive` and the post-authentication sync result before navigating to Home. Do not introduce Clerk sign-in as evidence that backend setup succeeded.
- Prefer the smallest configuration or code change proven to fix the blocked stage. Use the existing callback route, UI components, logging conventions, and sync tests rather than introducing a new abstraction.
- Never expose Clerk secret keys, session tokens, bearer tokens, or backend secrets in logs, screenshots, prompts, or committed files.

## Out of scope
Facebook or Apple provider redesign, Laravel schema changes unless testing proves the current API contract is the blocker, account-linking workflows, webhook synchronization, production deployment, credential rotation, and unrelated UI changes.

## Steps

### 1. Reproduce and identify the blocked stage
Read the mobile and root instructions, inspect the current Google SSO implementation, callback route, Expo scheme configuration, Clerk provider setup, and synchronization boundary. Inspect [auth-entry-screen.tsx](../apps/mobile/src/screens/auth/auth-entry-screen.tsx), [sso-callback.tsx](../apps/mobile/src/app/sso-callback.tsx), [app.json](../apps/mobile/app.json), the root layout, and [sync-clerk-user.ts](../apps/mobile/src/screens/auth/sync-clerk-user.ts).

Run `startSSOFlow({ strategy: "oauth_google" })` on a physical device or emulator while recording developer-visible state transitions. Confirm whether:

- Pressing Google **Continue** returns to Expo successfully.
- The browser stays open because the `mobile://` redirect or callback route is not configured or recognized.
- `startSSOFlow` resolves without creating a session.
- `createdSessionId` and `setActive` complete, but navigation is missed.
- Clerk reports that additional requirements or client trust are needed.
- The app creates and activates a session, then remains in synchronization loading.
- Laravel sync fails, returns an invalid shape, or times out.

Do not edit application code during this first step unless a configuration-only blocker is already known and safely reversible.

### 2. Add focused diagnostics without leaking sensitive data
If the reproduction does not identify the stage, add temporary development-only logging around the OAuth callback result and synchronization state. Log only provider strategy, resolved callback outcome, session/user presence booleans, session keys or IDs if safe for development, sync phase, status code, and error category. Never log bearer tokens, Clerk secret keys, full OAuth URLs containing secrets, or complete API bodies.

Add or update focused tests first where practical:

- Google flow resolves a session and `setActive` successfully.
- Google flow returns `missing_requirements` or `needs_client_trust` and remains on the form with an actionable message.
- OAuth callback cancellation returns to the existing screen and clears the busy state.
- Session activation completes after the browser closes.
- Sync starts exactly once for the active Clerk session.
- Home navigation occurs only after sync is ready.
- Stale OAuth or sync work cannot affect a sign-out or replacement session.

Run the focused tests, then stop for review if the root cause is still environmental rather than code.

### 3. Fix the proven OAuth return or callback issue
Apply the smallest code/configuration change that addresses the reproduced blocker. Depending on evidence, this may be:

- An explicit Clerk return/callback URL passed to `startSSOFlow` that matches the Expo Router callback route and `mobile` scheme.
- Correct registration of the custom scheme in Expo/Clerk configuration.
- A callback route that only performs Clerk completion without conflicting navigation.
- Removal of browser or session activation logic that races the OAuth result.
- A busy-state reset and visible error when OAuth resolves without an active usable session.

Preserve the existing provider button behavior and all non-OAuth authentication flows. If the fix requires Clerk Dashboard configuration, document the exact setting and expected redirect without exposing credentials, but do not claim it is deployed until it is verified.

### 4. Fix the proven synchronization or loading issue
If OAuth and `setActive` are successful, inspect the synchronization boundary and request function for the actual failure. The implementation already has bounded token retrieval, retries, cancellation, response identity validation, API configuration validation, and session-change handling. Add no duplicate sync mechanism.

Fix only the reproduced cause, which may be:

- API URL configuration unreachable from the physical device.
- Missing or mismatched HTTPS/HTTP/mobile development allowed-party configuration.
- `getToken()` hanging or returning too late.
- The sync request receiving a Clerk token that Laravel rejects.
- Clerk authorized-party configuration missing the Expo callback or development origin.
- API response shape or local user validation mismatch.
- Navigation occurring before sync readiness.

For a loading state caused by a non-retryable backend response, replace silent loading with the existing inline error/retry/sign-out recovery. Preserve cancellation during sign-out and prevent late success or failure from changing another session.

### 5. Verify end to end
Run the smallest relevant tests and the app verification commands.

- Verify the Google account completes consent and returns to StayApp.
- Verify session activation completes.
- Verify `POST /api/auth/sync` receives the active Clerk session and creates or refreshes the local user.
- Verify Home opens after synchronization succeeds.
- Verify a network/API failure displays an inline recoverable state rather than indefinite loading.
- Verify retry succeeds with a fresh Clerk token.
- Verify cancellation, sign-out, and an account/session switch.
- Verify email/password sign-in and guest browsing still work.

Stop after this step for review if credentials, Clerk Dashboard access, a physical device, or a live backend are unavailable.

## Verification
- Run the focused Clerk mobile tests, including the existing `clerk-user-sync.test.cjs` suite, using the repository commands.
- Run mobile TypeScript and lint checks.
- Run `git diff --check`.
- Exercise Google sign-up and Google sign-in with at least one test Clerk account on Expo Go or a development build.
- Confirm cancel, missing requirements, network failure, timeout, retry, sign-out, session switch, and restored-session behavior according to the reproduced environment.
- Confirm the Laravel sync endpoint and mobile configuration using isolated test data if code changes affect synchronization.
- Do not claim the live Google flow passes until a browser-to-app return, active Clerk session, successful API sync, and Home navigation are observed.

## AGENTS.md updates
None unless verification establishes a permanent project rule. Any future Clerk redirect rule must be added to `apps/mobile/AGENTS.md`; do not add provider-specific troubleshooting to the repository root instructions.

## Result
Step 1 reviewed the mobile authentication entry screen, callback route, root layout, Expo scheme, and synchronization code. The installed Clerk SDK already defaults to the `sso-callback` path. The social sign-in handler navigates to Home immediately after session activation, and the existing synchronization boundary is not mounted. This confirms a separate gap in the Home navigation requirement.

Android reproduction is pending. Neither ADB nor an Android emulator executable was available in this workspace, so the Google consent hang and its failing stage could not be observed. Application changes are pending the device trace required by step 1.

The 26 existing mobile sync tests, TypeScript check, and git diff whitespace check passed.
