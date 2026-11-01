# 09 · Property photo galleries

Status: done

## Goal
Let users explore villas and staycations through swipeable photo slides on Home, Search and Wishlist. Enrich the static catalogue with relevant imagery and useful stay information while preserving search, filters and saved properties.

## Decisions
- The user authorizes sourcing static content from websites. Use freely reusable photos (for example standard Unsplash-licensed photos), verify the individual source/license, download optimized images into the mobile assets directory, and record photo URLs, credits and license references in an asset README. Avoid paid/subscription-only assets.
- Keep the current nine sample properties and their IDs so existing search expectations and saved states remain compatible. Give every property three relevant photos, including the two that currently have no image. Show a mix of exterior, interior and amenities/views as available, with descriptions appropriate to each image.
- These remain sample stays: stock photos can illustrate a property concept without claiming to depict the named inventory. Keep the sample disclosure visible and do not present fabricated reviews, amenities or prices as verified real-world facts.
- Add a typed optional photos collection to ListingPreview, with existing image/imageDescription as backward-compatible fallback. Keep gallery data separate from gallery rendering.
- Add one shared property-photo gallery component, reusing Photo and existing UI conventions. Use native horizontal paging with measured page width; React state updates only when the page settles, not per scroll frame. Maintain the image aspect ratios of the existing card variants.
- Display a compact photo count and page indicators. Support swipe plus accessible previous/next actions and controls with at least 44pt/48dp targets. Hide navigation for a single image and handle missing/failed images with Photo's existing fallback.
- Use the gallery in Home/Wishlist compact cards and Search grid cards. Preserve favorite-button positioning, separate save and photo navigation touch targets, and avoid nesting interactive gallery gestures inside a card-wide press target. Preserve existing horizontal card usage unless gallery navigation fits without reducing accessibility.
- Surface existing sample guest/bedroom counts and a short fixture description so users can understand the stay beyond its title. Keep compact cards readable; use richer descriptions in Search rather than overloading the Home grid.
- Follow apps/mobile/.claude/skills/expo-animation/SKILL.md and RECIPES.md. Native scrolling supplies the swipe motion; no autoplay, timers, custom tab animations or per-frame React updates. Existing 120ms press feedback remains. Programmatic page changes use no animated movement when reduced motion is enabled.
- The requested search-bar padding fix is already applied as a small independent fix: supporting-text wrapper padding changes from 8px to 4px per side; title input vertical padding changes from 4px to zero. Preserve the 56px minimum search container and accessible action targets. Verify the tightened field as part of gallery layout QA.
- References checked during planning: https://reactnative.dev/docs/scrollview and https://unsplash.com/license . Recheck installed SDK-compatible APIs before building.

## Out of scope
Backend or database work, live availability/pricing, booking, property-detail routes, user uploads, API integrations, auto-advancing slideshows, and new infrastructure or carousel dependencies.

## Steps
### 1. Source photos and implement interactive listing galleries
Read root/mobile AGENTS.md, the animation skill and press/scroll recipes, and the Home/Search/Wishlist implementations established by prompts/08-home-and-search.md. Inspect ListingCard, ListingPreview, Photo, PressFeedback, sampleProperties, property-search tests and the asset README before changing them. Find and verify reusable property images on the web, save optimized assets with source/license notes, and visually inspect the selected files. Extend the fixtures with three relevant photos per property, descriptions and existing guest/bedroom information. Implement a measured-width native paging gallery with page count, indicators, previous/next controls, reduced-motion behavior and image fallback; integrate compatible card variants across Home/Search/Wishlist. Preserve IDs, search/filter behavior, sample disclosure, font scaling and accessible targets. Verify the cases below and record observed outcomes and unavailable device checks. This single implementation step delivers the whole gallery feature; stop after it for review.

## Verification
- Run pnpm --filter mobile exec tsc --noEmit and pnpm --filter mobile lint.
- Run the existing property-search and relevant asset/auth/onboarding tests; add meaningful gallery boundary tests only if custom page-selection logic warrants them.
- Export the Android production bundle to verify imported assets and native module compatibility.
- Inspect the assets and source/license README; verify every sample property has three images and suitable descriptions.
- In an available running mobile preview, swipe photos, navigate with controls, stop at first/last pages, reverse direction, resize/rotate, and revisit cards after scrolling. Check that page counts and image widths stay correct and no vertical scrolling/favorite touches are stolen.
- Check large text, narrow screens, single/missing image fallback, screen-reader labels/actions, reduced motion and the tightened search-bar height. Assess native swipe and press feel on a release device when available; record any device verification that cannot be performed.
- End to end: Home → swipe villa photos → save → submit Tagaytay search → swipe result photos → change filters → Wishlist → confirm saved stay and gallery remain usable.

## AGENTS.md updates
None anticipated.

## Result
- Added a shared native paging gallery to Home, Wishlist and Search cards, with previous/next controls, page counts, indicators, image descriptions and existing missing-image fallback. Horizontal card layout retains its single-photo presentation. Favorite controls remain separate from paging and content navigation.
- All nine sample stays now have three distinct local photos, guest/bedroom counts and descriptions. Eight optimized Pexels photos were downloaded, visually inspected and documented in assets/images/demo/README.md; existing covers are reused. Photos and property claims remain explicitly illustrative.
- Preserved the reduced search-bar vertical padding. No carousel dependencies, backend changes or permanent engineering-rule changes were introduced.
- Passed TypeScript, Expo lint, whitespace checks, all 27 existing/new Node tests and the Android production export (.expo/gallery-final, 46 bundled assets). The first export compiled but encountered an output-directory EPERM; rerunning with permission to write the generated bundle completed successfully.
- Verified the real fixtures contain 27 valid local photo references with descriptions and three distinct photos per property. Gallery callback tests cover boundary clamping, settling, resize positioning, reduced-motion navigation, and single/missing-image handling. These tests do not simulate native gesture delivery or rendering.
- Native UI acceptance remains a device follow-up: no reachable signed-in mobile preview/emulator was available in this session. Actual swipe-versus-vertical-scroll behavior, save touch separation, large-text layout, screen-reader interaction, tightened search-field appearance and end-to-end Home/search/filter/Wishlist flow have not been visually observed. Release-device animation feel is not claimed verified.

