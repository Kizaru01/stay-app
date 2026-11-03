# 15 · Host profile detail card

Status: done

## Goal
When a user taps or clicks the host on a property, display a detailed profile card with the selected host's background, hosting experience and illustrative credentials.

## Decisions
- Build on plan 14's static host fixtures and the existing host-row tap/click handler. Keep the existing dismissible, scrollable host overlay rather than add another navigation route.
- Present a rounded profile summary card with avatar, name, location, hosting duration and conditional Superhost badge. Below it, group information into About, Background and credentials, and During your stay sections.
- Extend `SampleHost` with occupation, education/background and a typed list of sample credentials (title and description). Supply distinct, plausible fictional content for all eight hosts.
- Credentials describe sample training or relevant experience, such as hospitality training, guest-service experience or coffee workshop experience. Do not invent government IDs, license numbers or completed platform identity checks.
- Show a visible sample-profile disclosure explaining that background and credentials are illustrative and have not been verified. Preserve the existing messaging-preview limitation.
- Include existing languages, interests, response information, biography and hosting approach. Keep information tied to the selected host, including Alex's shared profile across both Tagaytay cabins.
- Extract the composed card into a feature-local `screens/browse/host-profile-card.tsx` component. Reuse Surface, Photo, Badge, Text and existing icons and tokens. Adapt to narrow screens and large text without fixed card heights.
- Keep the feature mobile-only and static, using existing assets and dependencies.

## Out of scope
Laravel, database, real credential verification, document uploads, authentication changes, real messaging, host editing, new routes, new dependencies and unrelated visual changes.

## Steps
### 1. Build and verify the detailed host card
Read root/mobile AGENTS.md, plan 14 and the current host fixtures, HostRow, property details screen, DetailOverlay, Surface, Badge, Photo and relevant callback tests. Extend the sample host type and all fixtures with background and credential content. Create the feature-local profile card and render it inside the existing host overlay when the property host is tapped or clicked. Keep the overlay's accessible close control, platform back dismissal and scrolling. Use semantic section headings, flexible wrapping and conditional Superhost/hosting-year labels. Update relevant existing tests to accommodate the extracted component and verify selected-host data, illustrative credential disclosure, conditional badges and dismissal. Run the checks below and record results and unavailable manual checks. Add Result and set this plan to done after implementation; stop for review afterward.

## Verification
- Run `pnpm --filter mobile exec tsc --noEmit` and `pnpm --filter mobile lint`.
- Run relevant property-detail tests, including fixture completeness, selected-host card contents, sample credential disclosure and a non-Superhost with one year hosting.
- Run Expo config/dependency checks and an Android production export to verify imports and bundled assets.
- In an available signed-in preview, open a property, tap/click its host and inspect the profile card, background and credentials. Scroll to the final section and dismiss. Repeat with a different host and the two Tagaytay listings. Check narrow width, large text and accessible headings/close labels; record unavailable native or authenticated checks honestly.

## AGENTS.md updates
None.

## Result
- Implemented `HostProfileCard` inside the existing host overlay. Tapping/clicking a property's HostRow displays its assigned host's rounded summary card, About section, background and credentials, and hosting approach.
- Added occupation, education/background and two illustrative credential entries to each of the eight sample hosts. A visible disclosure states that background, credentials and badges have not been verified. Conditional Superhost badges and singular/plural hosting duration remain supported.
- Reused Surface, Badge, Photo, Text, DetailSection and DetailItem. Existing scroll container, close control and platform dismissal behavior remain in place. No routes, dependencies, API or AGENTS.md changes.
- TypeScript, Expo lint, public config and whitespace checks passed. Offline dependency-map validation reported dependencies up to date; online compatibility was not checked.
- All 19 relevant property detail, gallery and search tests passed. Updated host tests exercise the extracted card, selected profile background/credentials, disclosure, conditional badge and dismissal callbacks.
- Android production export passed with 50 assets at `apps/mobile/.expo/host-profile-card`.
- Signed-in preview and native-device visual verification were not performed. Narrow/large-text layout, physical scrolling, screen-reader announcements and platform dismissal still require manual acceptance; callback tests and compilation do not establish those results.
