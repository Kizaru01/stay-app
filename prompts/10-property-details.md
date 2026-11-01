# 10 · Property Details

Status: done

## Goal
Let users open a property from Home, Search or Wishlist and explore a polished, scrollable details screen matching the supplied Seaside Villa reference, with photo browsing, host and review details, amenities, favorites and an always-accessible Reserve action.

## Decisions
- Mobile UI scope: use realistic but explicitly illustrative local fixtures. No live inventory or booking API is established. Preserve existing sample IDs, prices and photos, and show a compact sample-content disclosure.
- Add an Expo Router property/[id] route inside the authenticated browse stack, outside the tabs and within WishlistProvider. Reuse its session-local favorites so saves stay synchronized across screens.
- Support all existing sample listings with typed detail fixtures consistent with their location, capacity and category. Give the featured La Union villa the reference's 8 guests, 3 bedrooms, 5 beds, 3 bathrooms, Maria host profile, amenities and review breakdown. All host/review claims remain sample content.
- Reuse bundled property images and existing avatar assets where suitable, with honest descriptions and Photo fallback. Do not imply that stock imagery depicts verified inventory; do not extract the reference's phone frame into the UI.
- Match the reference's white/pale surface, navy Inter typography, forest-green accents, generous section spacing, fine dividers and rounded controls using existing NativeWind tokens and UI components. Adapt to actual screen width and large text rather than reproducing the tall mockup as a fixed canvas.
- Screen hierarchy: photo hero with back/share/save controls, count and View all photos; title/location/rating/favorite badge; host; capacity; expandable description; two-column amenities plus Show all; location preview; review summary and preview; house rules; persistent price/Reserve bar.
- Reuse/extend PropertyPhotoGallery compatibly for a detail hero and full-screen photo viewer with paging and accessible previous/next controls. Existing card galleries retain their current appearance and behavior. Keep gallery gestures separate from card navigation and favorite controls.
- Host and reviews open accessible dismissible detail overlays. Amenities and description expand inline. Provide explicit empty/missing-property and image-failure handling. Back falls back to Home when opened directly.
- Location uses a lightweight illustrative SVG neighborhood preview and location copy, not a new map SDK. Offer opening a Maps search for the destination; never invent a verified street address or precise property coordinates.
- Reserve opens a dismissible booking preview showing the selected stay and sample nightly price with a clear message that real availability, dates, taxes and booking are not connected. Do not simulate a confirmed reservation or charge. Share uses the native share sheet with descriptive property text, without inventing a production deep link.
- Apply apps/mobile/.claude/skills/expo-animation/SKILL.md and relevant RECIPES.md guidance: existing 120ms PressFeedback, native paging/stack transitions, and short opacity transitions for occasional overlays where appropriate; honor reduced motion. No per-frame React updates, animated layout heights, autoplay or new animation dependencies.

## Out of scope
Laravel/database changes, authentication changes, real booking/payment flows, date availability, authoritative pricing, persisted favorites, map infrastructure, new dependencies and unrelated visual redesign.

## Steps
### 1. Implement and verify the Property Details experience
Read root/mobile AGENTS.md and the animation skill/recipes. Inspect sampleProperties, PropertyPhotoGallery, ListingCard, PropertyGrid, SearchScreen, Wishlist, WishlistProvider, browse/root layouts, shared text/button/icon/photo/host/rating primitives and styling tokens. Add typed temporary detail fixtures and meaningful feature components under the existing screens/browse structure. Add the property/[id] route and wire explicit listing-content navigation from Home, Search and Wishlist without nesting gallery/favorite interactions. Build the complete screen and overlays described above, with a flex layout keeping the booking bar outside the vertical ScrollView, safe-area padding on all relevant edges, accessible labels and dismiss controls, scalable text, adaptive columns, and consistent save state. Reuse existing assets and primitives; extend shared components only for clearly reusable behavior while preserving current callers. Run the verification below, correct issues, record unavailable native checks, add Result and set this plan to done when acceptance is met. This single implementation step delivers the feature; stop for review afterward.

## Verification
- Run pnpm --filter mobile exec tsc --noEmit, pnpm --filter mobile lint, configured relevant Node tests and Expo dependency/config checks. Export an Android production bundle to catch native imports and asset failures.
- In an available Expo preview, inspect a narrow phone viewport and large text: hierarchy, image crops, section spacing, safe areas, overlay dismissal, scrolling and booking bar visibility without obscured final content.
- Home → villa details → swipe photos → full gallery → close → expand description/amenities → host details → reviews → location → Reserve preview → dismiss → back. Repeat entry from Search and Wishlist.
- Toggle favorite on details and confirm Home/Search/Wishlist synchronization. Verify save, photo swipe and property navigation remain separate actions.
- Check other property IDs, direct-link/back fallback, unknown ID, single/missing/failed photos, long descriptions/reviews and narrow/large-text layouts. Verify approximate-map link failures have understandable feedback.
- Check screen-reader labels, selected/expanded state, touch targets, modal focus/dismissal and reduced motion. Record actual native-device checks separately; release-device animation feel and native gestures require a real device and must not be claimed verified from compilation or browser inspection.

## AGENTS.md updates
None anticipated.

## Result
- Implemented the property/[id] screen for all nine sample properties and connected Home, Search and Wishlist listing titles/content to it. Existing photo swipes and save controls remain separate from navigation. Favorites reuse the existing session-local provider.
- Added the photo hero/full-screen gallery, expandable descriptions and amenities, host and review overlays, schematic location preview with destination Maps search, house rules and a persistent safe-area booking bar. Reserve opens an explicit sample booking preview; no booking or payment is created. Shared components and local assets are reused, including an optional borderless HostRow presentation and compatible detail-gallery styling.
- Added four callback/data tests covering selected-property saves, expansions, overlay open/dismiss, unknown-property recovery and complete fixture data. All 31 Node tests pass. TypeScript, Expo lint, whitespace checks and Android production export passed (46 assets, .expo/property-details-final). Initial sandboxed export compiled but failed to finish writing; the permitted rerun completed successfully.
- Expo's offline dependency map check passed; the online preview server separately reported available package updates. Dependencies were not changed.
- Browser preview at localhost:8090/property/sample-la-union-villa successfully compiled and redirected to the existing sign-in screen. No signed-in preview or native device was available, so screen appearance, safe-area/large-text rendering, physical swipes, modal focus, Maps/share integration and end-to-end navigation remain manual acceptance checks. Callback tests do not establish native UI behavior or release-device motion quality.
- No backend, authentication, infrastructure or AGENTS.md changes.

