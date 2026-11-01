# 08 · Home and property search

Status: approved

## Goal
Build the mobile home screen from the supplied home.png reference. Users can type a destination on Home, submit it to a search screen, and browse matching realistic sample properties.

## Decisions
- Mobile UI scope only: realistic, explicitly temporary sample inventory; no live availability, verified reviews, bookings, or Laravel work.
- Follow the reference's light background, dark green selection, navy typography, rounded photography, category tiles, and two-column popular stays grid. Adapt metadata wrapping and column count for small screens and large text.
- Include the four reference properties with Philippine destinations and peso prices, plus enough varied sample listings for useful destination/category searches. Reuse existing bundled photography where suitable; sample photos are illustrative.
- Reuse established NativeWind tokens, Inter fonts, icons, SearchBar, ListingCard, and Photo where appropriate; extend with compatible variants when needed.
- Home search is a real editable input. Submitting from the keyboard opens a dedicated native-stack search route with the entered query. Search remains editable there and updates local results by title, destination, and category, case-insensitively; blank query shows all, no match shows a clear empty state and reset action.
- Categories filter Home; See all opens search with the active category. The filter control opens a simple native sheet for category and nightly-price filtering, with apply/reset actions shared by Home and results.
- Use Expo native tabs for Home, Wishlist, Trips, Messages, and Profile. SDK 58 uses expo-router/native-tabs (current Expo documentation), superseding the skill's older unstable import. Preserve /home as the signed-in landing URL.
- Wishlist reflects session-local saved properties across Home and Search. Trips and Messages show honest empty states. Profile preserves existing identity, account-task messaging, and sign-out behavior.
- Follow apps/mobile/.claude/skills/expo-animation/SKILL.md and RECIPES.md: feedback is the purpose; 120ms Reanimated CSS press scale, reduced-motion-safe opacity alternative, native stack transitions, and no custom tab-switch/scroll animation. No new animation dependency is expected.
- Preserve existing authentication/onboarding routing and unrelated uncommitted authentication changes.

## Out of scope
Live inventory, backend/API/database changes, bookings/payments, property-detail screens, messaging, persisted wishlists, authentication redesign, and custom tab-bar rendering.

## Steps
### 1. Native browsing navigation and sample catalogue
Inspect root/mobile AGENTS.md, existing routes, UI components and fixtures. Add a signed-in native-tab route group preserving /home, protect all browsing routes using the existing Clerk pattern, and move existing account/sign-out UI into Profile. Add Wishlist, Trips, and Messages destinations with accessible empty states. Add typed temporary property fixtures and a small shared session-local wishlist provider inside the browsing flow. Leave unrelated auth edits untouched. Verify route types, signed-out redirects, /home landing, native-tab rendering, Profile sign-out, and TypeScript/lint. Stop for review before step 2.

### 2. Reference home screen and subtle feedback
Implement the reference layout using existing UI conventions and shared property cards. Add editable destination search, category filtering, See all navigation, and wishlist controls. Use realistic illustrative property data and bundled photo assets where suitable. Add 120ms press feedback following the animation skill with reduced-motion support, without repeated list entrances or tab animation. Verify responsive layout, accessibility targets, category and favorite interactions, image rendering and fallback, and TypeScript/lint. Search navigation becomes fully functional in step 3; keep intermediate routes working. Stop for review before step 3.

### 3. Search results, filters, and end-to-end verification
Implement the dedicated Search screen and native filter sheet, wiring Home submission and See all with query/category parameters. Reuse catalogue/cards and wishlist state. Add category and price filters with apply/reset, result counts, editable search, clear action, empty state, keyboard dismissal and native back navigation. Verify search matching independently with focused checks of the filtering logic; run TypeScript, lint, Expo dependency/config checks and available UI verification. Run the complete Home → type → submit → results → filter/reset → back flow, wishlist consistency, Profile sign-out, and reduced motion. Record any device-only checks that could not be performed. Add Result and mark done only after required verification.

## Verification
- pnpm --filter mobile exec tsc --noEmit; pnpm --filter mobile lint; Expo dependency/config checks appropriate to SDK 58.
- Confirm native tabs on iOS/Android, safe areas, keyboard input/submission/back navigation, and no loss of existing auth/onboarding behavior.
- Check all category filters, whitespace/case-insensitive destination/title matching, empty and cleared query, no results, price boundaries, combined filters, and reset.
- Check saves across Home/Search/Wishlist and removal/empty Wishlist; Profile sign-out.
- Compare Home against reference on phone size; check narrow layouts, large text, scrolling, photo fallback, screen-reader labels and selected state.
- Confirm reduced motion removes press scaling; feel-check rapid/interrupted presses and native transitions on a release build on the slowest supported device. Do not claim device performance verified without running it.
- End-to-end: sign in → Home → enter Tagaytay → submit → relevant results → apply/reset filters → save → Wishlist → return Home → Profile → sign out.

## AGENTS.md updates
None anticipated.

## Progress
- Step 1 implemented: signed-in browsing layout, five native tabs preserving /home, Profile account/sign-out flow, nine typed sample properties, session-local wishlist provider, and empty states. Home intentionally remains a placeholder until step 2.
- Passed: TypeScript, Expo lint, Android production bundle export, and diff whitespace check. Expo install --check found no local SDK dependency mismatches; online version validation was unavailable in offline mode.
- Code review confirms browsing routes share the signed-out redirect and wishlist state is keyed by Clerk session. Native rendering, tab interactions, signed-in landing and sign-out still require device verification; no Android SDK/adb was found in the current environment. No claim of device verification.
- Step 1 reviewed and step 2 authorized by the user.
- Step 2 implemented: reference-inspired Home with an editable destination field, scrollable category tiles, a responsive two-column popular-stays grid (one column on narrow screens or with larger text), bundled illustrative property photos, and shared wishlist controls. Added compatible SearchBar supporting text and a compact ListingCard variant without replacing existing variants.
- Search submission, See all and the filter control pass the current query/category to an explicit interim Search route; full editable results and filters remain step 3 work.
- Press feedback uses Reanimated CSS transitions, scale 0.97, 120ms, cubicBezier(0.23, 1, 0.32, 1). Reduced motion uses opacity; browsing stack navigation uses native transitions and a reduced-motion fade. No custom tab or scrolling motion was added.
- Step 2 verification passed: TypeScript, Expo lint, Android production bundle export, and whitespace check. Bundled image assets were visually inspected. Device layout, category/save interactions, keyboard navigation, fallback rendering, and animation feel remain unverified in a running mobile app; no device performance claims.
- Step 2 reviewed and step 3 authorized by the user.
- Step 3 implemented: editable Search results with case/whitespace/accent-insensitive word matching across title, destination and category; live counts; empty/reset states; shared wishlist; native Back; and category/minimum/maximum nightly-price filtering from Home and Search.
- Filters use route parameters with draft state confined to the native form sheet. Apply returns to the originating screen; cancel/back discards drafts. Price bounds are inclusive; empty bounds are unrestricted; invalid and inverted input displays feedback and disables Apply. Reset in the sheet clears the draft; Apply commits it.
- Shared PropertyGrid now renders Home and Wishlist with the same responsive cards. Sample inventory remains explicit and entirely local.
- Final automated checks passed: TypeScript, Expo lint, 23 Node tests (7 property-search cases plus the existing asset/auth/onboarding checks), Android production bundle export, and diff whitespace check. Expo dependency checking passed against the local SDK map; online validation was unavailable.

## Result
All three implementation steps are built. Home search opens actual results, and filters and session-local saves are wired across the browsing screens. No API, database, dependency, or persistent engineering-rule changes were needed.

Native acceptance verification remains pending: the available Windows environment has no mobile emulator, and the attempted local browser preview returned ERR_CONNECTION_REFUSED while Expo startup did not expose a reachable server. Layout comparison, real keyboard behavior, native sheet/tab interactions, sign-out, reduced motion and release-device animation feel have not been observed. The full sign-in → Home → search → filters → Wishlist → Profile → sign-out flow must still be exercised on a device. Status remains approved until that required manual verification is completed; implementation and automated verification are complete.

