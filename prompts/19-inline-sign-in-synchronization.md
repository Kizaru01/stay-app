# 19 · Inline sign-in synchronization

Status: done

## Goal
Keep users on the sign-in form while Clerk authenticates them and Laravel synchronizes their account. Open Home directly when both operations succeed, and show failures on the form.

## Decisions
- Replace the full-screen synchronization boundary with shared session sync state that renders its children throughout. Reuse the existing request, fresh-token retry, cancellation, and session identity checks.
- Track the submitting action so the password button or selected social button shows a spinner while work is pending. Disable competing submissions and provide an accessible busy state. Keep the existing email confirmation screen for flows that require a code and show its loading and errors there.
- Remove early Home redirects driven by Clerk sign-in alone. Redirect once the current session is synchronized. Keep Clerk authentication errors on the initiating form. When Laravel fails after Clerk succeeds, show an inline retry that reuses the active session and offer sign-out to switch accounts.
- A restored session on the entry route goes to Home once synchronized. If restoration needs recovery, use the sign-in form with inline retry. Keep the existing guest browsing behavior and preserve the root navigator across sync state changes.

## Out of scope
Laravel API and schema changes, profile field collection, new packages, and changes to Clerk verification requirements.

## Steps
### 1. Move synchronization feedback into the authentication screens
Refactor `clerk-user-sync-boundary.tsx` and `_layout.tsx` to provide session sync state without a blocking page. Wire `auth-entry-screen.tsx`, `confirm-email-screen.tsx`, and `app/index.tsx` to that state. Preserve existing Clerk callbacks and error handling, and remove their premature Home navigation. Ensure pending and failed sync are tied to the active session, and retry does not repeat the password or OAuth flow. Verify this step and stop for review.

## Verification
- Run the mobile regression suite, TypeScript, and lint. Update the existing sync and auth tests to cover pending, inline failure, retry, and a single Home redirect after success.
- In Expo Go, check email/password and a third-party sign-in. Confirm the submitting button stays busy until sync completes. Exercise a Clerk failure and a sync failure, and confirm each stays on the appropriate form. Check email confirmation and a restored session. Record device checks that remain outstanding.

## AGENTS.md updates
None.

## Result
Synchronization now reports progress and errors on the initiating form. Home navigation waits for the current session to synchronize. Inline retry uses that session, and restored sessions recover through the sign-in form.

All 62 mobile regression tests, TypeScript, lint, and the diff whitespace check passed. Live password and third-party sign-in checks in Expo Go remain outstanding.
