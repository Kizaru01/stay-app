# 06 · Reopen onboarding from Create account

Status: approved

## Goal
Let signed-out users tap a button on Create account to view the onboarding slides again, even after completing them previously.

## Decisions
- Add a visible “View onboarding” button near the top of the Create account screen using existing UI styles and accessible touch targets.
- Navigate to `/?replay=1` with replacement navigation and start at the first slide.
- In `onboarding-screen.tsx`, allow this explicit replay parameter to bypass the saved-completion redirect. Normal visits to `/` continue to respect the saved preference.
- Keep the existing completion record; replay does not clear local storage or authentication. Skip, Get Started, and Sign In retain their current destinations and persistence behavior.
- Signed-in users continue to go to Home through the existing root authentication guard.
- This explicitly allows user-requested replay in addition to the automatic first-visit behavior described in plan 03.

## Out of scope
Login screen changes, authentication changes, storage reset controls, backend changes, and onboarding redesign.

## Steps
### 1. Add and verify the replay flow
Inspect the current shared auth screen and onboarding route before editing. Add the Create account button in `apps/mobile/src/screens/auth/auth-entry-screen.tsx` and handle the replay parameter in `apps/mobile/src/screens/onboarding/onboarding-screen.tsx`. Reuse existing Expo Router and UI conventions. Preserve unrelated working-tree changes. Verify the checks and navigation cases below, then record results and any unavailable manual checks.

## Verification
- Run mobile TypeScript checks, lint, and the installed Expo dependency compatibility check.
- In Expo Go, with onboarding previously completed, open Create account and tap View onboarding: the first slide must appear without an immediate redirect.
- Verify swiping, Skip and Get Started return to Create account, and Sign In opens login.
- Verify an ordinary root visit still skips completed onboarding, and a first visit still shows onboarding.
- Confirm the button does not appear on the login form and signed-in root navigation still opens Home.

## AGENTS.md updates
None.

## Result
- Implemented View onboarding above the Create account logo. The button replaces the current route with `/?replay=1`, reopening the first slide even when completion is saved. It is disabled during authentication submission.
- Explicit replay bypasses only the onboarding-completion redirect. Existing storage, normal startup behavior, signed-in Home routing, and onboarding exit actions remain in place.
- Passed TypeScript (`pnpm exec tsc --noEmit`), lint (`pnpm lint`), all eight existing onboarding storage tests, and `git diff --check`.
- Offline Expo dependency compatibility check passed; Expo notes offline validation is less reliable.
- Expo Go visual and end-to-end navigation checks remain pending: no connected device was available for this verification. Status remains approved until that manual acceptance is complete.
