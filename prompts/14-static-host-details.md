# 14 · Static host details

Status: done

## Goal
Provide realistic temporary host profiles for the mobile property's existing host details overlay, with consistent information in its host row.

## Decisions
- Extend the existing property details experience rather than add a separate host screen.
- Keep Maria as the featured La Union villa host. Replace the generic repeated Alex profile with a small set of named, location-appropriate sample hosts explicitly assigned to the existing properties.
- Define a typed temporary host fixture in `apps/mobile/src/fixtures/hosts.ts`, with stable ID, name, bundled avatar, biography, years hosting, Superhost status, languages and response information. Reuse the existing bundled illustrative portrait without claiming verified identity.
- Include location, interests and hosting approach for richer host details, using the existing typography, spacing and overlay components.
- Preserve the existing sample-content disclosure. Host response times and Superhost badges are illustrative claims only.
- Render Superhost status conditionally and use correct singular/plural hosting-year labels in the overlay, consistent with HostRow.
- Use existing dependencies and local fixtures; no API requests or additional state management.

## Out of scope
Laravel, database, authentication, real messaging, host verification, host editing, new navigation routes, new dependencies and unrelated listing-card changes already present in the working tree.

## Steps
### 1. Implement and verify static host profiles
Read root/mobile AGENTS.md and inspect `fixtures/properties.ts`, `fixtures/property-details.ts`, `components/ui/host-row.tsx`, the host overlay in `screens/browse/property-details-screen.tsx`, and existing fixture tests. Add typed, explicitly temporary host profiles and explicit property-to-host assignments covering every sample property. Preserve current host field compatibility where practical. Update property detail fixtures to consume those profiles and render the additional profile information within the existing host overlay. Ensure the row and overlay agree on name, hosting duration and Superhost status. Reuse bundled assets and established UI components. Run the checks below, document actual results and any unavailable manual checks, then mark this plan done. This single implementation step delivers the requested scope; stop for review afterward.

## Verification
- Run `pnpm --filter mobile exec tsc --noEmit` and `pnpm --filter mobile lint`.
- Run existing relevant fixture/property-detail tests; check every property resolves a complete host with a stable ID and valid local avatar.
- Run the existing Expo dependency/config check and an Android production export to catch asset or native bundle errors.
- In an available signed-in Expo preview, open the featured villa and another listing, tap their host rows, inspect distinct profile details, scroll and dismiss the overlay. Check narrow width and large text, conditional badge text and singular hosting-year wording. Record unavailable device/preview checks honestly.

## AGENTS.md updates
None.

## Result
- Added eight typed temporary host profiles with stable IDs and explicit assignments for all nine sample properties. Maria remains the featured villa host; Alex hosts both Tagaytay cabins. The existing bundled illustrative portrait is reused.
- Connected property fixtures and the existing host overlay to those profiles. Added location, interests and hosting approach, conditional Superhost text and singular/plural hosting-year labels. Existing row, contact draft and sample disclosure behavior is preserved.
- TypeScript, Expo lint, Expo public config and whitespace checks passed. The offline Expo dependency-map check reported dependencies up to date; online compatibility was not checked.
- All 19 relevant property detail, gallery and search tests passed, including two new tests for complete host assignments and selected-profile presentation, conditional status and overlay dismissal.
- Android production export passed with 50 assets, including the host portrait, at `apps/mobile/.expo/static-host-details`.
- Native/signed-in visual acceptance was not performed. Narrow/large-text layout, physical scrolling, screen-reader behavior and device dismissal remain manual checks; callback tests and export do not verify those behaviors.
- No backend, dependency or AGENTS.md changes. The pre-existing listing-card changes were left untouched.
