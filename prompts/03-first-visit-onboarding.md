# First-visit onboarding and fixed navigation

Status: approved

## Goal

Correct the existing onboarding UX: centered pagination stays fixed while slides swipe, Skip and completion lead directly to authentication forms, typography follows the StayApp design system, and the introduction appears only until the user completes or skips it on this installation/browser.

## Decisions

- This extends `02-onboarding-flow.md`. The user's latest request supersedes the previous per-slide footer and nonpersistent flow.
- Keep four introduction slides using the existing photos. Remove the fifth Get Started slide from the mandatory path: finishing the fourth slide opens sign-up directly.
- Render a single footer outside the horizontal pager, pinned above the bottom safe area. Center four dots in the same position on every slide. Update their selected state from scroll progress so it tracks the visible page. Keep generous accessible touch targets and reduced-motion behavior; use the installed Reanimated/gesture conventions if continuous color interpolation is needed.
- Keep Skip visible on every slide, outside the moving content. Skip opens sign-up immediately. Provide a clearly labeled Sign In option for existing users; it opens `/sign-in` directly. Preserve Next on early slides and use Get Started/Finish on the last slide. Those controls share one completion path.
- Sign-up and login use the attached account-form reference's structure: compact centered logo, left-aligned title and supporting copy, email/password fields, rounded primary action, social-provider row, and account-switch link. Login uses Welcome back/Sign In copy. Keep StayApp branding and truthful unavailable-authentication messaging; real Clerk integration remains outside scope.
- Use the existing Inter families, typography variants, semantic colors, 24-point screen inset, and minimum control sizes. Improve heading/body hierarchy and line lengths within these conventions; avoid forced line breaks that fail on narrow screens or larger text.
- Save only a versioned nonsensitive onboarding-completed flag and the most recently selected authentication entry (sign-up/sign-in). Do not infer account existence or authenticated status from these values. Returning visits bypass onboarding and open the saved form, defaulting to sign-up. A user who selected Sign In returns to login.
- Persist completion when Skip, Finish, or the existing-user Sign In action is used. Preserve the flag when navigating between forms. Auth back navigation must not re-enter a completed introduction or create a redirect loop.
- “First time” is scoped to this installation/browser storage, since authentication is not connected. Clearing app data/reinstalling/clearing site storage resets it. Merely opening the introduction without skipping/completing does not mark it complete.
- No storage implementation currently exists. Follow the repository's Expo native UI storage guidance: Expo-compatible `expo-sqlite` localStorage polyfill for native and browser localStorage on web, installed with Expo's version resolver. Keep this in a small onboarding-specific utility; no generic store framework. Verify SSR/browser guards and storage failure handling before adoption. If storage cannot be written, show useful feedback and permit entry to the form without falsely claiming completion is persisted.
- Avoid flashing onboarding for returning visitors while reading storage; render a neutral loading state until the check completes. The saved flag is UX state only, never authorization.
- `prompts/TEMPLATE.md` remains absent. This plan follows the required repository sections without creating or modifying a template.

## Out of scope

- Real account creation, sessions, credential storage, social OAuth, password reset delivery, API/database changes, and account-based cross-device onboarding history.
- Replacing the supplied photos or renaming StayApp.

## Implementation steps

### 1. Correct pager controls and form presentation

Move pagination and Skip outside the pager, center and pin the dots, synchronize selection with swipes and button navigation, reserve footer space so content cannot overlap controls, and remove the extra terminal slide. Connect completion/Skip/Sign In to the appropriate forms through a single exit action. Refine onboarding typography and sign-in/sign-up presentation against the reference using design-system primitives. Verify TypeScript/lint and the navigation/layout as available, then stop for direction before step 2 as required by AGENTS.md.

### 2. Persist first-visit state and guard navigation

Install the Expo-compatible storage dependency, implement the onboarding-specific completion/entry utility, gate initial navigation, save completion on each exit path, and fix form back/switch behavior. Verify first launch, partial viewing, Skip, Finish, Sign In, reload/relaunch, form switching, unavailable storage, and cleared storage. Stop for direction before step 3.

### 3. Verify and close out

Run the checks below, address defects, document actual results and limitations, and mark done only when approved scope and verification are complete.

## Verification

- TypeScript, lint, Expo dependency compatibility, production web export, and whitespace checks.
- Dots remain centered and stationary throughout swipes in both directions; selected dot tracks the current slide; Next/dot taps and interrupted swipes remain consistent.
- Every slide exposes Skip and existing-user Sign In. Skip/Finish open sign-up; Sign In opens login. No mandatory Get Started interstitial remains.
- First visit shows onboarding; skipped/completed visits bypass it; abandoning mid-flow does not mark completion; clearing storage resets the behavior. Form switching/back does not replay onboarding or loop.
- No false account/session success and no credentials written to persistence.
- Short/narrow viewports, large text, safe areas, keyboard access, password visibility, screen-reader traversal, reduced motion, and reference comparison on an available native/device or browser environment.
- Existing browser policy denied inspection and explicitly prohibited workarounds. Do not bypass that restriction; record any unavailable visual/device checks accurately.
- Add focused verification for storage decisions and navigation outcomes where the existing test environment supports it; do not introduce a test framework solely for this change.

## AGENTS.md updates

None anticipated. Record feature-specific first-visit behavior in this plan; only propose a persistent storage convention if implementation establishes a project-wide rule.

## Progress

### Step 1

- Approved by the user and implemented. A single centered four-dot footer sits outside the horizontal pager and vertical overflow containers. Each dot has a 44-point touch target. Its active layer interpolates opacity from scroll progress in a Reanimated UI-thread worklet; selection crosses to React only when the rounded slide index changes.
- Skip stays outside the moving slides. Skip and the last slide's Get Started action replace onboarding with sign-up; the existing-user Sign In action replaces it with login. All exits share one function, ready for step 2 persistence. The old fifth Get Started slide is removed.
- Onboarding uses Inter heading1 (28/36.4), body (16/24), 24-point content insets, and natural wrapping. The footer reserves its own layout space so page content cannot cover it. Short/large-text content can scroll vertically above the stationary footer. Reduced-motion programmatic paging remains supported.
- Forms retain the compact brand, placeholder fields, primary action, social row and account-switch composition from the supplied reference. Form headings use heading2; supporting copy wraps naturally. Form content width is measured and capped at 512 instead of depending on percentage/max-width sizing in a vertical scroller.
- TypeScript, lint (after removing an unused import), whitespace checks, and production web export passed. Export generated all six routes. Visual/native swipe feel and reference comparison remain unverified under the existing browser restriction; no policy workaround was attempted.
- Step 1 completed; the user then authorized step 2. Real authentication remains outside scope.

### Step 2

- Installed `expo-sqlite` ~57.0.4 with Expo's SDK resolver; installation added the Expo config plugin and updated the pnpm lockfile. Native access lazily installs its localStorage polyfill within the guarded operation. The web/SSR sibling uses browser storage and never imports the native package. Added a no-export module declaration for the package's untyped side-effect installer.
- A single versioned nonsensitive record (`stayapp.onboarding.v1`) stores completion and `/sign-up` or `/sign-in`. Root entry waits on a neutral screen for the initial check, then either displays onboarding or redirects to the saved form. Invalid/corrupt/unsupported records are treated as incomplete. Reading or partially viewing onboarding does not save completion.
- Skip, Finish, and onboarding Sign In save the record before replacing the route. A ref guards duplicate exit actions and controls expose their pending state. A failed write still allows entry to the form, keeps a session-only fallback to avoid replay in that running session, and displays a dismissible warning that onboarding may appear next time.
- Form entry remembers the selected form only if onboarding has already completed. Account-switch links continue to replace the form route. Login's back action opens sign-up; sign-up has no back action to onboarding. Returning to `/` checks completion rather than granting access or inferring an account/session. Direct form access alone does not mark onboarding complete.
- Added eight focused built-in Node tests in `apps/mobile/scripts/onboarding-storage.test.cjs`, executing the actual TypeScript storage modules with browser Storage doubles and fresh module contexts for relaunch. They cover fresh/partial visits, persistent sign-up/login choice, cleared storage, direct form access, malformed/versioned records, blocked reads/writes, stale disk data with session fallback and write recovery, and SSR without window. No new test framework was installed.
- Verification passed: all eight tests (`pnpm --filter mobile exec node --test scripts/onboarding-storage.test.cjs`), TypeScript, lint, whitespace checks, Expo's offline dependency map, production web export (six routes), and Android/Hermes bundle export. Android export output was removed after checking it. Online dependency metadata was unavailable.
- Actual native SQLite writes/relaunch, device/browser route gestures and reference comparison were not manually verified. The existing browser restriction was not bypassed. Those checks remain part of step 3.
- Step 2 completed; the user authorized step 3 final verification.

### Step 3

- Re-ran all eight storage tests and TypeScript successfully. Re-ran lint successfully and checked whitespace. Reviewed completion parsing, session-only failure fallback, each onboarding exit, root startup gating, saved form updates, and form back/account-switch targets. No additional application changes were necessary.
- The production web and Android/Hermes exports and offline Expo dependency check passed during step 2 on this implementation; these results remain applicable because application code has not changed since. The tests use Storage doubles, not an actual device SQLite database, and do not establish end-to-end navigation behavior.
- Existing browser policy denied page observation and prohibited alternate-browser/indirect workarounds. No further browser attempt or workaround was made. Device UI and actual native persistence verification remain unavailable.

## Result

### Follow-up: full-screen imagery and final-slide action

At the user's request, the four supplied photos now fill their respective slide bounds using absolute positioning and cover cropping. A native-compatible dark gradient overlays each image for white copy/controls. Removed the collage/map-card compositions from this revised full-image presentation. Pagination and account links sit in a transparent, absolutely positioned bottom overlay, so no solid footer shortens the image. Page content reserves the measured footer height to avoid overlap, with vertical overflow retained for small screens and large text. A reserved primary-action slot keeps dot placement stable; Get Started is visible only on the final slide. Earlier slides progress by swipe or dot selection. Skip and Sign In remain available, and persistence is unchanged.

TypeScript, lint, whitespace checks, and production web export passed for this change. The pnpm export wrapper reported an error after emitting output; rerunning the installed Expo CLI directly succeeded with exit code 0. Rendered/native acceptance remains pending under the previously recorded restriction.

Implemented the four-slide onboarding with one stationary centered pagination row, continuous swipe-linked dot opacity, persistent Skip and Sign In controls, direct form exits, design-system typography, versioned first-visit persistence, saved form selection, neutral startup gating, and recoverable storage errors. Real authentication is explicitly unconnected and no credentials are persisted.

Automated checks passed: eight storage tests, TypeScript, lint, whitespace, offline Expo dependency compatibility, production web export, and Android/Hermes bundle export. No AGENTS.md change was needed.

Manual acceptance remains outstanding: compare the screens with the supplied reference; swipe both ways and interrupt/reverse paging; exercise Skip, Finish, Sign In, form switching and device/browser back; relaunch after completion using actual native storage; clear only test-installation storage and confirm first-use behavior returns; check short screens, large text, reduced motion, keyboard access, safe areas and screen-reader traversal. These results are not implied by automated checks. Status remains approved rather than done because required visual/device acceptance has not been completed.
