# 05 · Clerk authentication setup

Status: approved

## Goal
Connect StayApp's existing Expo authentication screens to the selected Clerk application so users can sign up, verify email, sign in, and sign out with a real session.

## Decisions
- Use existing Clerk application `app_3LAlavNnCSZgm1vg3NiDxvNx24E`. Never create an accountless application or select a different application.
- The user must run `npx -y clerk@latest auth login` in their host terminal before CLI access to this application.
- Work in `apps/mobile`, the existing Expo application inside the pnpm workspace. Preserve existing UI, onboarding persistence, package versions where compatible, and unrelated local changes.
- Use the Clerk CLI to detect and initialize the existing mobile project with `--app app_3LAlavNnCSZgm1vg3NiDxvNx24E`; inspect its help and current Expo documentation first. Install Clerk agent skills if absent, as authorized by the setup request.
- Do not read or print existing environment files. Allow the CLI to write development configuration; never expose a secret key to Expo client code.
- Reuse existing sign-up, sign-in, and confirmation screens rather than adding duplicate authentication routes. Replace the mock confirmation behavior with Clerk verification. Use secure native token storage recommended by the current Expo quickstart.
- Support the selected application's actual authentication requirements. Inspect its configuration after CLI login; stop for a product decision if enabled requirements cannot be handled by the planned flow. Do not silently change identifiers or social providers.
- Provide loading/error handling, session restoration, signed-in user identity, sign-out, and appropriate client navigation. Client session checks do not authorize Laravel operations.
- Existing-auth assessment: mobile has no Clerk SDK or real sessions. Laravel has Sanctum installed, a standard password-based User model, and user/session migrations; inspected routes expose only health checks and the welcome page. No active login or protected API route was found. Persisted user records and live usage have not been audited.
- Migration boundary: leave Laravel, Sanctum, database users, passwords, and sessions intact. No user import or API session cutover occurs in this mobile setup. If real legacy users or OAuth accounts need migration, stop for a separate approved plan covering stable external IDs, compatible password hashes, OAuth continuity, protected routes, token validation, session cutover, and staged rollout. Do not assume existing records are disposable.

## Out of scope
Laravel Clerk token verification, API authorization, database/user migration, deleting Sanctum, production deployment, changing Clerk application settings, Organizations, and unrelated UI changes. Social login is connected only where existing application settings and platform support permit it; otherwise retain an explicit unavailable state.

## Steps
### 1. Configure and verify Clerk in the existing mobile flow
After plan approval and host CLI login, inspect current Clerk CLI help and Expo quickstart, initialize the mobile project against the selected application, and inspect resulting changes. Install missing supported dependencies and agent skills. Add the provider and secure token cache, connect existing email/password forms and email verification, handle required session tasks or report unsupported configuration, and show signed-in identity/sign-out on Home. Guard navigation against treating mock confirmation as a real session. Update or retire mock-specific tests and fixture usage affected by this replacement without disturbing unrelated edits. Verify using the checks below, record results, and stop after this step.

## Verification
- Run Clerk doctor, mobile TypeScript, lint, Expo dependency compatibility, existing relevant regression tests, and `git diff --check`.
- Compile/export the app to check routing and bundling, then start Expo and verify available UI behavior.
- Verify sign-up validation, actual email verification, invalid/expired-code feedback, retry, sign-in, failed credentials, session restoration, signed-out navigation, and sign-out on an available device/browser. Do not create a user in this existing Clerk application without separate permission; the user can sign up themselves.
- Confirm passwords and tokens are absent from route parameters and insecure storage; Expo receives no Clerk secret key.
- Confirm Laravel and existing user records remain untouched and selected application identity is preserved.
- End-to-end: user signs up → receives and verifies real code → signed-in Home → sign out → sign in. Record any checks requiring user interaction or unavailable native runtime honestly.

## AGENTS.md updates
None anticipated. Add a persistent convention only if implementation establishes one.
