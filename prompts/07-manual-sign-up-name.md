# 07 · Name for manual sign-up

Status: done

## Goal
People creating an account with email and password can enter a name that is saved with their Clerk user and is available for a future profile display.

## Decisions
- Extend the existing `AuthEntryScreen` in `apps/mobile/src/screens/auth/auth-entry-screen.tsx`; show a single required `Name` field above email only in sign-up mode.
- Treat this as a human display name, not a unique username or a sign-in identifier. Accept single-word, multiword, and international names. Trim surrounding whitespace and reject whitespace-only input without guessing family-name boundaries.
- Store the complete entered name in Clerk's standard `firstName` field, leaving `lastName` unset. This keeps one input intact and makes it available through `useUser().user.firstName` and Clerk's derived `fullName`. This is a display-name convention for this form, not a legal-name parser.
- The installed `@clerk/expo` 4.14.1 declarations support `firstName` through `signUp.password()` additional parameters. Confirm name fields remain enabled for the selected development application before implementation; do not read environment files or change global required-name settings, which could affect social sign-up.
- Submit the trimmed name alongside email/password in the initial Clerk sign-up request so the completed account retains it. No separate local storage, route parameter, database column, or follow-up profile update is needed.
- Reuse the existing TextField, user icon, loading/error treatment, and keyboard navigation: Name → email → password → submit. Disable editing during submission.
- Preserve email verification, sign-in, onboarding, and third-party flows. Do not overwrite names supplied by third-party providers.
- A future profile can read the Clerk name and fall back to email for older accounts without a name; this task does not build that profile or alter Home.

## Out of scope
Unique usernames, profile screens, name editing, retroactively naming existing accounts, splitting first/last names, Laravel/database changes, global Clerk requirement changes, new dependencies, and unrelated auth fixes.

## Steps
### 1. Add and verify the manual sign-up name
Read the root/mobile instructions, existing auth-entry form, TextField conventions, Clerk SDK type declarations, and auth regression tests. Confirm the selected Clerk application's name-field support using the existing CLI read-only configuration flow. Add required Name state and input for sign-up only, trim and validate it, and send it as `firstName` in `signUp.password()`. Preserve other flows and all existing visual conventions. Update existing auth callback regression tests to cover blank/whitespace names, trimmed multiword/international values passed to Clerk, unchanged secret-free navigation, and absence of the field in sign-in. Run the verification below, record results, and stop after this step.

## Verification
- Run mobile TypeScript, lint, existing auth/onboarding/asset tests, Expo dependency checks, and `git diff --check`.
- Verify the form renders at phone width, the name input appears only during sign-up, and keyboard focus progresses from name to email to password.
- Verify blank and whitespace-only names stop manual submission with accessible feedback; single-word, multiword, and international names are accepted without restrictive character rules.
- Verify the existing callback tests show the trimmed name reaches Clerk and is absent from route parameters. Verify sign-in remains email/password only and social actions retain their current behavior.
- End-to-end with a user-created test account: submit name/email/password, verify the email, then inspect the Clerk user's `firstName`/`fullName` to confirm the name persists across sign-out/sign-in. Do not create an account in the existing Clerk application without explicit permission; record this check as pending if user interaction is required.

## AGENTS.md updates
None.

## Result
- Added the required Name field only to manual sign-up, using existing TextField styling and its user icon. Whitespace-only names are rejected; surrounding whitespace is trimmed. The entire name is passed as Clerk `firstName` without splitting it or placing it in route parameters/local storage.
- Confirmed with read-only Clerk development configuration that first/last name fields are enabled and optional. No application settings, existing user records, third-party flow, Home, or Laravel code were changed.
- TypeScript, targeted ESLint, all 16 auth/onboarding/asset regression tests, and whitespace checks passed. Expo's offline compatibility check passed using its bundled dependency map; online compatibility was not checked. Updated existing tests cover blank/whitespace names, trimmed international/multiword input, single-word input reaching Clerk, and absence of Name on sign-in.
- Browser verification at 390 × 844 passed: new input renders above email, empty submission shows the name error, Enter moves Name → email → password, and sign-in retains only email/password. Screenshot saved outside the repository. Expo was started on port 8083 for this check.
- Remaining external check: complete real sign-up/email verification with a user-created test account and confirm its Clerk firstName/fullName persists after signing in again. No account was created for testing; native keyboard behavior remains unverified. The implementation and available automated/UI checks are complete.
- No AGENTS.md updates were needed.
