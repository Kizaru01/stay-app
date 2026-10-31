# Design system reference sections 1–15

Status: done

## Goal

Complete the Expo mobile design system represented by sections 1–15 of the supplied systemdesign.png, using apps/mobile/.agents/skills/expo-design-system/SKILL.md. Extend the existing NativeWind system and provide a working, responsive component catalogue for visual and interaction review.

## Decisions

- Scope is apps/mobile only. Existing uncommitted changes must be preserved.
- global.css remains the sole source of visual tokens; reuse and extend src/components/ui and the existing Inter font loading. No second styling system.
- Use the reference's exact nine palette colors and Inter typography, with mobile-friendly sizing, scalable text, consistent spacing, continuous corners, and accessible touch targets.
- Keep the existing StayApp product name (as documented in DESIGN_SYSTEM.md); implement the reference's house brand mark and tagline in that identity. No app-store identity or splash replacement.
- Implement all numbered sections 1–15: brand, palette, typography, buttons, inputs, category chips, horizontal listing card, grid listing card, host row, rating summary, mobile bottom navigation, mobile search bar, iconography, feature/policy cards, and status alerts.
- Use consistent vector icons supported on native and web; inspect installed capabilities before deciding whether an icon dependency is necessary. Do not use emoji or text glyphs as icons.
- Reference imagery is visual guidance. Use explicitly temporary listing/host fixtures and suitable local image assets where available; do not crop the reference into UI components. No backend behavior is implied.
- Demonstrate real local interactions: button feedback/loading, input focus/clear/password visibility, chip selection, favorite state, selected navigation item, search text, and alert dismissal. Navigation samples are catalogue controls rather than fabricated product destinations.
- Expose a development-only /design-system catalogue linked from the current home screen; keep release behavior simple. Label sample rental content as demo data.
- Sections 16 and 17 are out of scope. Existing Badge may remain and serve the guest-favorite treatment in listing examples.
- No template file exists in prompts/. This plan uses the required repository headings without creating or modifying TEMPLATE.md.

## Out of scope

Laravel, database changes, authentication, booking/search/payment workflows, production property screens, infrastructure, dark-theme invention, sections 16–17, and unrelated refactoring.

## Implementation steps

Each step requires verification and a progress report. Follow AGENTS.md: stop after each step and wait for instruction before starting the next.

1. Foundation and primitives (sections 1–6 and 13).
   - Reconcile existing tokens with the reference; retain one NativeWind entry point.
   - Add a coherent icon primitive and house brand mark; extend text, buttons/icon buttons, input adornments/password state, and category chips with accessible states.
   - Verify TypeScript, lint, font/icon rendering, focus and pressed/disabled states in a runnable preview.
2. Composed rental components (sections 7–10 and 14).
   - Add data-driven horizontal/grid listing cards, host row, rating summary, and feature/policy cards using the foundation.
   - Add clearly marked temporary image/content fixtures; favorite and row actions remain caller-owned.
   - Verify TypeScript/lint, content wrapping, image rendering, favorite actions, and narrow-screen layouts.
3. Navigation, search, alerts, and catalogue (sections 11–12 and 15; full coverage).
   - Add controlled bottom-navigation and search components plus success/error/info dismissible alerts.
   - Build the development catalogue covering every section 1–15, integrate its home entry, and reconcile DESIGN_SYSTEM.md with the actual components and demo route.
   - Verify all 15 sections visually and exercise the local interactions on the web preview; inspect accessibility labels/states and large-text layout. Verify native on an available Expo target and report any unavailable native checks explicitly.
4. Final verification and closeout.
   - Run configured checks, audit token drift in changed files, and confirm release catalogue guard and all reference sections.
   - Fix discovered issues within scope, record actual results/limitations in this plan, and set Status: done only when required work is complete.

## Verification

- pnpm --filter mobile exec tsc --noEmit
- pnpm --filter mobile lint
- pnpm --filter mobile exec expo install --check
- Expo web build/export to catch bundling and asset resolution problems.
- Rendered screenshots at mobile and wide widths; compare section-by-section with reference, review hierarchy, spacing, alignment, icon consistency, and clipping.
- Exercise search, clear, password visibility, chip/favorite/navigation selection, loading/disabled controls, and alert dismissal.
- Check accessible names, busy/disabled/selected states and scalable text. Native Expo and screen-reader checks must be performed if an appropriate target is available; otherwise record them as outstanding rather than claiming they passed.

## AGENTS.md updates

No update expected. Existing mobile instructions already require NativeWind and reference consistency; document component APIs and token use in DESIGN_SYSTEM.md.


## Progress

### Step 1 — implemented and verified on web

- Extended the existing NativeWind foundation, preserving the reference palette and Inter scale.
- Added SVG house branding, a coherent icon set and accessible icon buttons; installed Expo-map-compatible react-native-svg 15.15.4.
- Extended buttons with icons/loading indicators, chips with category icons, and fields with leading icons, clear actions and password visibility.
- Added a development-only foundation preview at /design-system. Remaining catalogue sections and the home link belong to step 3.
- TypeScript and lint passed. Expo install --check passed against the local SDK map; online metadata was unavailable in the sandbox. A subsequent online dev-server notice suggested optional patch updates; no unrelated upgrades were performed.
- Verified desktop and 390px mobile web rendering. Exercised clear location, password visibility, category selection, favorite selection, loading/disabled state, and focused-field appearance.
- Native Expo Go, screen-reader and large accessibility-text checks remain outstanding. Web rendering does not establish native correctness.
- Paused before step 2 as required by the approved workflow. Overall status remains approved, not done.

### Step 2 — implemented and verified on web

- Added data-driven horizontal/grid ListingCard, HostRow, RatingSummary and composable FeatureCard, using existing tokens/primitives and caller-owned actions.
- Added bundled sample villa/cabin/host photographs with provenance and clearly temporary catalogue fixtures. Photo frames include missing/error fallback behavior.
- Extended the preview for sections 7–10 and 14, with independent favorites and accessible demo-action feedback.
- Fixed shared icon color-class conflicts observed during visual review; ordinary icon actions no longer receive toggle semantics unless selection state is supplied.
- TypeScript and lint passed. Reviewed web rendering at desktop, 390px and 320px widths; confirmed photo rendering, title wrapping, rating/category reflow and feature-card layouts.
- Exercised both favorite controls and listing, host and policy-card actions; verified the resulting selected labels and local action feedback.
- Native Expo Go, native screen-reader and large accessibility-text checks remain outstanding. No production domain workflows were added.
- Paused before step 3 under the approved step-by-step workflow.

### Step 3 — implemented and verified on web

- Added controlled BottomNavigation and SearchBar plus success/error/info StatusAlert components, all using the existing NativeWind theme and icon system.
- Completed numbered catalogue sections 1–15, added accessible section headings and working local action examples, and linked the catalogue from the development home screen.
- Reconciled DESIGN_SYSTEM.md with the actual component contracts and release guard. Home remains a starter screen; production rental workflows are outside scope.
- TypeScript and lint passed. Visually reviewed the new components at desktop and mobile widths, including 390px and 320px. At the narrowest inset width, navigation may wrap to retain readable labels and touch targets.
- Exercised tab selection (including explicit web selected semantics), search submission and clear, filter feedback, all three alert dismissal controls, restoration, and the home-to-catalogue link.
- The catalogue now covers all requested reference sections. Native checks remain outstanding: this environment exposes neither adb nor an Android SDK configuration, and iOS cannot run locally on Windows. Native screen-reader and large accessibility-text verification remain unperformed.
- Paused before step 4 (final verification/export, token audit, release-guard verification, and closeout) under the approved workflow. Overall status remains approved.


### Step 4 — final verification and closeout

- Final TypeScript and lint checks passed after the audit fixes.
- Expo compatibility check reports dependencies up to date against the bundled SDK map. Network metadata was unavailable, so this does not confirm online patch recommendations.
- Production web export passed with all four routes generated in apps/mobile/dist (ignored build output).
- Verified production behavior in the browser: /design-system redirects to /, and the home page has no catalogue link. Exported HTML contains no catalogue sections or development entry.
- Confirmed sections 01–15 are present in order. Token audit found only display-label hex strings outside global.css, no inline style palette, no raw font-size styles, and no disabling of font scaling. Icon and brand dimensions now use the shared spacing scale.
- Reviewed the final icon sizing and image fallback/restoration on web; made small avatar fallbacks compact to avoid overflowing their frame. The development catalogue includes a fallback toggle.
- No permanent project rule was discovered, so AGENTS.md was not changed for this work. Existing unrelated changes remain intact.

## Result

Implemented reference sections 1–15 as reusable NativeWind components and an interactive development catalogue using the requested expo-design-system skill. Kept StayApp branding, bundled Inter/fonts and sample photos, local fixture data and caller-owned actions. Updated DESIGN_SYSTEM.md. No API or database changes.

Verification completed: TypeScript, lint, offline Expo SDK compatibility, production web export, development web interactions and responsive review at desktop/390px/320px, image fallback/restoration and release route guards.

Remaining platform validation: native Expo Go/device rendering, VoiceOver/TalkBack and large accessibility text. No Android SDK/adb target is configured here; local iOS execution is unavailable on Windows. These checks were not claimed as passing. The plan is closed with these environment limitations recorded, as permitted by its verification section.
