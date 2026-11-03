# 16 · Premium typography system

Status: done

## Goal
Give every existing StayApp screen a consistent, refined typography hierarchy using two complementary families. Change typography only, preserving layout structure, spacing tokens, colors, content, functionality, and interactions.

## Decisions
- Audit: `global.css` defines eight shared Inter variants, but property details, listing cards, and host profiles override these with Lora, including body copy, metadata, and actions. This makes text roles insufficiently differentiated and produces inconsistent treatments across screens.
- Screenshot findings: serif amenities and dates slow scanning; reviews and descriptions compete with headings; ratings, locations, and buttons lack a consistent functional treatment. Keep the editorial warmth while reserving serif typography for titles and headings.
- Proposed pairing: Fraunces Medium/SemiBold for editorial display, property titles, card titles, and section headings; Manrope Regular/Medium/SemiBold/Bold for body copy and functional UI. Two families only; no decorative italics or new uppercase treatments.
- Research: https://fonts.google.com/specimen/Fraunces ; https://fonts.google.com/specimen/Manrope ; https://github.com/googlefonts/fraunces ; https://docs.expo.dev/develop/user-interface/fonts/ ; https://docs.expo.dev/versions/latest/sdk/font/ . Fraunces supplies a distinctive soft-serif display voice. Manrope is the proposed clean interface counterpoint; this pairing is a design judgment.
- Replace Inter/Lora dependencies with the corresponding Expo Google Fonts packages after approval. Use bundled static faces, explicit family names per weight, and the existing root `useFonts`/splash lifecycle for Expo Go, native, and web. Verify exact package exports before implementation. Do not rely on synthesized weights or platform-specific variable axes.
- Extend the existing shared Text/NativeWind utility system with semantic roles. Keep one source for each role; remove conflicting local family overrides rather than adding another styling system. Native headers, tabs, and TextInput need matching explicit families.
- Proposed type specifications below are font size / line height in React Native logical units, with tracking in logical units. Preserve existing compact/full card size differences. Fit-check before finalizing: adjust typography rather than container spacing. Natural text wrapping can change with new glyph metrics; do not promise pixel-identical text heights.

| Role | Family and weight | Size / line height | Tracking |
| --- | --- | --- | --- |
| Editorial display / onboarding headline | Fraunces 600 | 40 / 48, retain existing smaller headline sizes | -0.5 |
| Screen / property title | Fraunces 600 | 28 / 36 | -0.35 |
| Section heading | Fraunces 500 | 20 / 28 | -0.15 |
| Card title, compact / standard | Fraunces 600 | 14 / 21; 16 / 24 | 0 |
| Host / reviewer name | Manrope 600 | 16 / 24; 14 / 21 in compact contexts | -0.1 |
| Location / amenities | Manrope 400 | 14 / 21; 12 / 18 in existing compact contexts | 0 |
| Description / reviews / comments | Manrope 400 | 16 / 24; 14 / 21 where already compact | 0 |
| Buttons / links | Manrope 600 | 16 / 24; 14 / 21 small | 0 |
| Form label / subheading | Manrope 600 | 14 / 21; 16 / 24 where already larger | 0 |
| Input / search | Manrope 400 or 500 | Preserve existing 14 or 16 / 21 or 24 | 0 |
| Price / rating | Manrope 700 or 600 | Preserve existing context sizes; large summary 40 / 48 | -0.25 large, 0 small |
| Metadata / date / badge | Manrope 400 or 500 | 12 / 18; 14 / 21 where already larger | 0.1 |
| Tab label | Manrope 400 default, 600 selected | 11 / existing native metric, web 16 line height | 0 |

- Keep currency and ratings clearly distinguished from their supporting labels. Use tabular numerals only for comparable numeric summaries where supported and verified; do not apply them globally.
- Preserve font scaling, accessibility labels, line limits, and existing responsive behavior. Do not shrink text to hide overflow or disable font scaling.
- Skill assessment: no listed skill specifically applies to a repository-wide typography-only React Native change. Website-building, image generation, Figma, and Clerk workflows are outside this task.

## Out of scope
Layout redesign; margin, padding, gap, control height, color, imagery, icon, or navigation changes; new screens or product flows; API/database/authentication changes; fixture/content changes; dependency upgrades unrelated to the selected fonts.

## Steps
### 1. Establish and preview the typography foundation
Read root/mobile AGENTS.md, `apps/mobile/global.css`, `src/components/ui/text.tsx`, `src/app/_layout.tsx`, and `src/app/design-system.tsx`. Add only selected font packages and required faces, replace font loading, define the semantic type roles above, and update the existing design-system screen to demonstrate titles, a property card, host names, long reviews, amenities, metadata, prices, ratings, and controls. Preserve all non-type tokens. Verify TypeScript, lint, font loading, glyph coverage (PHP peso, accented names, punctuation), and narrow-screen rendering. Stop for review before step 2.

### 2. Apply roles to all shared components and browse surfaces
Inspect and migrate `src/components/ui/*`, all `src/screens/browse/*`, and browse route layouts, including native/web tabs. Cover listing variants, property details and all modals, host profiles, amenities, review cards, question/assistant text, search/filter forms, empty/error states, badges, gallery counters, prices, and ratings. Remove old Lora/Inter overrides and preserve colors and layout classes. Use shared semantic roles, keeping existing size distinctions where needed. Verify home/search/wishlist/property/host/reviews/amenities/contact/assistant/filter flows and narrow-screen text fit. Stop for review before step 3.

### 3. Complete onboarding, authentication, and remaining screens
Migrate onboarding, sign-in/sign-up, email confirmation including OTP inputs, callback/loading/error states, brand/welcome components, and trips/messages/profile placeholders. Inspect every remaining Text/TextInput/native header/tab/SVG text use and font reference. Keep OTP tracking intentional and brand assets intact; do not modify logo artwork. Remove unused old font dependencies/utilities only after confirming no consumers remain. Verify each affected screen and stop for review before step 4.

### 4. Verify consistency and close out
Run the checks below; inspect typography-only diffs for unintended layout/color/behavior changes. Record actual results and any unavailable native verification in `## Result`. Update the permanent typography convention in mobile AGENTS.md only after implementation establishes it, then set Status: done. Do not claim native visual verification if only web was available.

## Verification
- `pnpm --filter mobile exec tsc --noEmit` and `pnpm --filter mobile lint`.
- Run project-compatible Expo dependency/doctor checks; distinguish pre-existing issues from regressions. Verify bundling with `pnpm --filter mobile exec expo export --platform web`.
- Search for obsolete font packages/names, local weight overrides, raw text/input styles, and mismatched semantic roles. Inspect the final diff: only typography, font integration, specimen documentation, and any approved permanent typography rule should change.
- Compare the three supplied property-detail references against updated renders: title/location, host row, description, amenities, actions, ratings, reviews, and house rules. Capture before/after on the same viewport where possible.
- Visually inspect Android Expo Go and web; iOS when an environment is available. Cover 320–360 logical-pixel widths and larger font settings, long titles/locations, long reviews, currency/numerals, badges, buttons, text fields, and modal headers. Confirm no clipping, baseline collisions, missing glyphs, font flashes, or accidental fallback.
- End-to-end: onboarding → authentication screens → home → search/filter → property → host/reviews/amenities/contact/assistant → wishlist and tab placeholders. Existing interactions must remain unchanged.

## AGENTS.md updates
After implementation, add a concise rule to `apps/mobile/AGENTS.md` under Styling: use shared semantic typography roles; reserve Fraunces for editorial headings/titles and Manrope for reading/interface text; load explicit font faces centrally and avoid local family overrides. This is a lasting consistency rule replacing no existing architecture rule. Do not add feature history.

## Progress
- Step 1 implemented: added two font packages and six explicit static faces, retained legacy faces for unmigrated consumers, added semantic Text/NativeWind roles, updated the root header family, and expanded the development-only typography specimen. No spacing or color tokens changed.
- Verification: TypeScript, lint, web export, and diff whitespace checks passed. Expo dependency check passed using the local map; online version validation was unavailable.
- Web preview inspected at 360 and 320 logical-pixel widths: editorial headings, long review wrapping, accented names, peso glyphs, numeric roles, metadata, and buttons rendered without observed clipping. Android/iOS and larger native font-scale checks remain pending; web checks do not establish native correctness.
- Step 1 approved by the user; step 2 implemented. Migrated listing title/location/price/rating roles, host rows and profiles, reviews, detail sections/actions/items, badge and form-label treatments, search inputs, chips, and native/web tab font families. Removed all local Inter/Lora overrides from shared UI and browse screens. Added compact/large semantic roles to preserve existing context sizes, with the main property title using the approved 28/36 hierarchy. No layout classes, colors, content, or interaction handlers changed.
- Step 2 verification: TypeScript, lint, web export, and diff whitespace checks passed. Expo dependency check passed against the local dependency map; online validation remained unavailable.
- Step 2 web checks at 360/320 logical pixels covered home cards, property title/body, host profile, reviews, amenities expansion, contact form, assistant topic answers, populated/empty wishlist, search results, and filter selection/application. Observed no text clipping. Native rendering and enlarged native font-scale checks remain pending. Preview server restarted on port 8082 after the old preview became unresponsive.
- Step 2 approved by the user; step 3 implemented. Audited onboarding, authentication, confirmation, callback, brand, profile, trips, and messages: shared Text roles already propagate the approved fonts. Added the missing callback link treatment and a shared OTP utility (Manrope Medium, 24/32, existing 8px tracking), plus a development-only code specimen. Removed unused Inter/Lora imports, loading entries, CSS tokens/utilities, dependencies, and lockfile records. No authentication or onboarding logic changed.
- Step 3 checks: TypeScript and lint passed. Expo dependency check passed using the local map. Web bundling passed, but writing assets to the existing `dist` directory failed with EPERM; exporting to a separate `dist-typography` folder succeeded. Temporary output and diagnostic log were removed afterward.
- Step 3 web verification: after restarting Metro with a cleared cache, styles rendered correctly. Trips, Messages, Profile, and the OTP specimen were inspected at 320px. OTP computed styles confirmed Manrope_500Medium, 24px size, 32px line height, and 8px tracking; all six digits rendered without clipping. The active signed-in browser session redirects authentication/onboarding routes to Home, so a completed visual check of those routes and live confirmation remains pending. Native and enlarged-font verification also remain pending.
- Step 3 approved by the user. Step 4 consistency audit confirmed no legacy font references, no local weight overrides, unchanged non-typography design tokens, and glyph coverage in every loaded font face. Added the permanent semantic typography rule under Styling in mobile AGENTS.md. Final TypeScript, lint, and local-map Expo dependency checks passed.

## Result
Implemented the approved Fraunces/Manrope typography system across shared components and existing screens, preserving layout structure, spacing/color tokens, content, business logic, and interactions. Six bundled static faces replace the eight legacy Inter/Lora faces. Semantic roles cover editorial titles, names, reading text, compact metadata, controls, prices, ratings, and OTP inputs.

Final verification passed: TypeScript, lint, diff whitespace checks, local-map Expo dependency checks, glyph coverage for all six faces, and `expo export --platform all --output-dir dist-typography-final` (Android/iOS Hermes bundles and web static output). Generated verification output was removed afterward. Online dependency validation was unavailable.

Web visual checks at 320/360px covered the typography specimen, listing cards, property detail sections and overlays, host profile, reviews, amenities, contact/assistant previews, search/filters, wishlist states, tab placeholders, profile, and OTP. Native visual rendering and enlarged native font scaling remain unverified because no connected device/simulator was available. Signed-out authentication/onboarding and live email-confirmation visual checks remain unverified because the browser's active signed-in session redirects those routes to Home. Those limitations are not represented as passing checks; the source audit and cross-platform bundles passed. No authentication state or account data was changed for verification.
