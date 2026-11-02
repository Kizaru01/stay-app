# 12 · Browse UI density and hierarchy

Status: done

## Goal
Apply the UI improvements proposed in https://chatgpt.com/c/6ae8876d-5acc-83ec-b37b-b8359c6b0977 to the existing Expo Home, Search and Property Details screens. Make stays easier to scan and compare while retaining accessible controls and the established StayApp identity.

## Decisions
- Implement in the existing mobile app; a Figma deliverable is not required by the current request.
- Retain Inter, the existing forest-green palette, NativeWind tokens and native tab navigation. The linked suggestions are visual guidance; do not globally replace the documented design system with its proposed font sizes or 8-point spacing scale.
- Retain the responsive two-column Home grid, with its existing single-column fallback. Use moderately shorter photographs and clearer metadata rather than replacing the navigation or page structure.
- Give listing titles and prices distinct emphasis. Order information as title, location, compact rating/capacity metadata, and a dedicated nightly-price row. Remove descriptions from default Search cards.
- Compact search/category controls and section gaps while preserving minimum touch targets and text scaling.
- Reuse the existing price/category filters. Expose compact shortcuts to these working controls; new guest and amenity filters are outside this visual refinement.
- Property Details already has a sticky Reserve bar and responsive two-column amenities. Preserve and verify these instead of adding duplicates.
- Keep photographs, pricing, reviews, messaging, assistant answers and booking explicitly identified as sample content. No live AI, messaging, availability or reservations are introduced.
- There are existing uncommitted changes in listing, search, detail, navigation and onboarding files. Build on their current contents and preserve unrelated changes.

## Out of scope
Laravel, PostgreSQL, authentication changes, new dependencies, map infrastructure, live payments/bookings/messaging/AI, a Figma file, global token redesign and unrelated onboarding changes.

## Steps
### 1. Improve Home and Search comparison layouts
Read root/mobile AGENTS.md and mobile DESIGN_SYSTEM.md, then inspect the current working-tree changes in src/screens/browse/home-screen.tsx, search-screen.tsx, property-grid.tsx, components/ui/listing-card.tsx, search-bar.tsx and property-photo-gallery.tsx. Compact the Home search/category region and excessive gap above Popular stays. Refine Home and Search card hierarchy using existing typography variants, with a prominent dedicated price row and no Search description. Keep full useful location text, accessible wishlist controls, photo paging/viewing and property navigation. Add a compact Search filter row using existing price/category functionality and active state. Preserve the existing NativeTabs implementation; adjust selected presentation only if visual verification reveals an actual issue and supported APIs allow a small correction. Verify Home → Search → filters → property and wishlist synchronization. Run TypeScript and lint checks, report results, and wait before step 2.

### 2. Refine Property Details information density
Inspect src/screens/browse/property-details-screen.tsx, property-details-sections.tsx, property-questions.tsx, fixtures/property-details.ts and components/ui/host-row.tsx. Reduce title dominance and group location, rating, guest-favorite status and capacity into readable wrapping rows. Compact host presentation. Preserve the existing two-column amenities layout and ensure narrow/large-text fallback. Give the illustrative location map more useful space while avoiding repeated location text. Group check-in/check-out together when space allows, followed by house rules and cancellation using the actual fixture policies. Replace oversized question cards with compact, distinct host/assistant actions and clear preview labeling. Keep help reachable before the lower policy content. Retain the safe-area-aware sticky Reserve bar and all existing overlays, expansion behavior and sample disclaimers. Verify every action and overlay, narrow screens and enlarged text; run TypeScript and lint, report results, and wait before step 3.

### 3. Verify the connected browsing experience
Run the configured mobile checks, inspect the affected UI in Expo web and an available native environment, and correct regressions within this plan's scope. Verify Home → Search → filters → details → photo viewer → wishlist, empty results/reset, unknown property, description/amenities expansion, host/reviews/assistant previews and sample Reserve action. Check sticky bar visibility, scrolling, safe areas, keyboard behavior and modal closing. Record unavailable native verification explicitly. Add a Result section and set Status: done only when the planned work and available verification are complete.

## Verification
- From apps/mobile: npx tsc --noEmit, npm run lint, and npx expo install --check. Investigate any pre-existing failures separately from regressions.
- Visually inspect 320px, approximately 390px and wider layouts, with normal and enlarged text. Verify wrapping, readable metadata/prices, touch targets, gallery controls and no clipped bottom content.
- Confirm the existing amenities grid and sticky booking bar work before changing them.
- Verify Search filter shortcuts apply real existing filters and retain query/category/price state across navigation.
- Complete the end-to-end flows listed in step 3; report environment limitations honestly.

## AGENTS.md updates
None. This refinement follows the existing mobile architecture and visual conventions.

## Progress
- Step 1 code implemented: compact Home search/category area, shared scannable listing hierarchy with dedicated prices and no default descriptions, full Home locations, shorter images, and working existing category/price shortcuts in Search.
- Verification: mobile TypeScript and lint passed. Expo dependency check passed against the bundled offline map; online metadata was unavailable.
- Browser verification attempted at http://localhost:8081/home; the existing authentication guard redirected to /sign-in. Authenticated visual, filter/navigation and wishlist checks remain pending. Native layout/text-scaling verification is also pending.
- Paused before step 2 according to the repository workflow. No native navigation styling change was justified without visual evidence.

- Step 2 code implemented: reduced title dominance; compact capacity summary and host spacing; narrow-screen amenities fallback; larger illustrative map without duplicate location row; grouped arrival, house rules and cancellation; compact distinct host/assistant actions moved above location/reviews/policies. Existing booking bar and overlays retained.
- Step 2 verification: TypeScript, lint and git diff --check passed. Browser attempt at /property/sample-la-union-villa again redirected to /sign-in. Left the preview tab available for sign-in. Authenticated overlay/action and responsive visual verification remain pending; no native environment was exercised.
- Paused before step 3 as required by the workflow. Status remains approved because end-to-end verification is outstanding.

## Result
Implemented the Home/Search and Property Details refinements. Final TypeScript, lint and whitespace checks passed; Expo dependency validation passed using its bundled offline map (online metadata unavailable).

Authenticated Expo web checks passed for Home → Search, price/category filters, invalid ranges, empty results/reset, saving a listing and carrying selection into details, gallery paging, description/amenities expansion, host and review overlays, assistant policy answers, assistant-to-host draft preservation, sample Reserve overlay, unknown-property handling, and Home → Wishlist → removal/empty-state synchronization. Reviewed Home at 320px, 390px and 1024px, and Details at 320px/390px, including single-column amenities and the persistent booking action.

Visual verification revealed Expo NativeTabs' default web fallback floated over the Home search field. Added a scoped web CSS correction through the existing tabs wrapper: an in-flow bottom row, wrapping labels and coherent active styling. The native navigator and triggers remain in place.

The original development server stopped during verification. A restarted preview then hit Metro EMFILE errors; stopped the servers started by this task and recovered with one preview on port 8082 using --max-workers 2. Verified Wishlist after recovery. The preview is available at http://localhost:8082/home.

Native device/emulator, VoiceOver/TalkBack, enlarged native text and native keyboard/safe-area behavior were not verified; no configured native environment was available. These remain release-verification limitations. Web screenshots and interactions do not imply native verification. No AGENTS.md changes were needed.
