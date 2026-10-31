# 04 · Mock email confirmation

Status: approved

## Goal

After submitting the sign-up form, the user can confirm an email using a mocked six-digit code and then navigate to Home.

## Decisions

- Extend the existing mobile sign-up preview in `apps/mobile/src/screens/auth/auth-entry-screen.tsx`. Sign-in and social-provider authentication retain their existing unavailable behavior.
- Use the entered email for the confirmation preview. Validate email format and require a nonempty password before advancing; never persist or forward the password.
- Use an explicitly named temporary fixture with the code `123456`. Display a clear preview notice containing the code and explaining that no email is actually sent and no real account/session is created.
- Add a `/confirm-email` route and auth screen using existing StayApp UI primitives, colors, typography, keyboard handling, and safe-area conventions.
- Accept exactly six numeric digits, support pasting the whole code, show an accessible inline error for incorrect or incomplete input, and allow retrying. Editing the email returns to sign-up. A direct visit without a usable email shows a return-to-sign-up action.
- A successful confirmation pushes `/home` using Expo Router, matching the requested navigation. Prevent repeated submission while navigation occurs.
- No Home route currently exists. Add a minimal branded Home preview with a welcome message and an explicit temporary-data notice; a full property browsing experience is outside this task.
- Confirmation is temporary UI behavior only. It grants no authenticated session or authorization and does not change persisted onboarding behavior.
- No additional dependencies are needed for this single-field preview flow.

## Out of scope

Real email delivery, Clerk integration, Laravel changes, database changes, persistent sessions, code expiry/rate limiting, real resend delivery, and a full home/listing feature.

## Steps

### 1. Implement and verify the mock confirmation flow

Read the root and mobile AGENTS.md files, existing auth screen, onboarding storage behavior, UI components, and installed Expo Router conventions. Add the clearly marked mock fixture, `/confirm-email` route and screen, and minimal `/home` route and screen. Connect sign-up submission and keyboard submission to the confirmation preview after validating input. Keep passwords local to the form. Implement six-digit input, error/retry behavior, edit-email navigation, missing-email handling, and successful push to Home. Reuse existing primitives and avoid unrelated changes. Run the verification below, fix defects, record results, and stop after this step.

## Verification

- Run mobile TypeScript and lint checks, Expo dependency compatibility checks, a production web export, and `git diff --check` using the existing toolchain.
- Verify sign-up with valid input opens confirmation and displays the supplied email; invalid email or empty password stays on sign-up with useful feedback.
- Verify incomplete input and an incorrect six-digit code show errors and stay on confirmation; correcting to `123456` opens Home exactly once.
- Verify numeric entry, six-character limit, paste, keyboard submission, editing the email, and direct confirmation navigation without an email.
- Verify the flow on an available Expo browser/device, including narrow screens, keyboard visibility, safe areas, accessible labels, and error announcements. Record unavailable checks honestly.
- Confirm sign-in/social actions retain existing behavior, no actual email is sent, passwords are absent from route parameters/storage, and no mock result creates an authentication session.
- End-to-end: onboarding/sign-up → enter email/password → confirmation → wrong code → correct mock code → Home.

## AGENTS.md updates

None.

## Result

- Implemented sign-up validation, temporary `123456` code fixture, confirmation screen, and minimal Home preview. Success pushes `/home`; wrong or incomplete codes remain on confirmation with accessible feedback. No password is routed or persisted, and no account/session is created.
- TypeScript and lint passed after the final source changes. Expo dependency compatibility passed using the local offline map; online validation was unavailable. All 11 existing onboarding-storage and asset-registry tests passed. `git diff --check` passed.
- Production web compilation and static rendering included all eight routes. The default output directory failed with an asset-write `EPERM`; a fresh `dist-confirmation` output completed successfully. That temporary build directory was removed after verification. The subsequent source adjustment only preserves informational styling for unavailable sign-in/social actions; TypeScript/lint passed again.
- Follow-up browser verification succeeded on 2026-10-25 after running Expo outside the sandbox with CI mode to avoid the stalled file watcher. At 390 × 844, Create account opened confirmation with the supplied email; an incorrect code showed an error; `123456` pushed Home. Empty sign-up showed the expected visible validation message.
- Found and corrected a real layout bug: percentage/max-width sizing inside Home's centered scroll container collapsed its content into a narrow column, wrapping text one letter per line. Home now uses explicit screen-width sizing and a fixed View. Confirmation uses measured width. Auth/confirmation disable bounce, enable scrolling only for content overflow, and use tighter spacing so the ordinary phone viewport fits. Browser screenshots verified Home and confirmation at phone width.
- Added two callback regression tests using the actual screen modules and existing Node/TypeScript test tooling. These verify sign-up validation, email-only navigation parameters, incorrect/incomplete codes, successful navigation, and duplicate-submit prevention. All 13 tests, TypeScript, lint, offline Expo dependency compatibility, and whitespace checks passed after these fixes.
- Native Expo Go touch/keyboard behavior remains unverified; the user's phone-only submission issue has not been reproduced or established as fixed. Status remains approved pending that device verification. No persistent AGENTS.md rule was introduced.
