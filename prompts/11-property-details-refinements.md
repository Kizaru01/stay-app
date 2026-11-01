# 11 · Property Details refinements

Status: done

## Goal
Refine the existing Property Details screen to match the supplied reference, simplify the photo hero, present amenities in a clean two-column grid, and add an Ask a question section with host and assistant entry points.

## Decisions
- Build on prompts/10-property-details.md and the existing mobile screen, fixtures, NativeWind tokens and reusable UI. Preserve unrelated working-tree changes.
- Remove the View all photos button and its now-unused photos overlay state/content. Keep hero photo swiping, count, accessible previous/next controls, back/share/save actions and existing card galleries.
- Amenities use two equal, flexible columns with a consistent gutter, aligned icons, wrapping labels and even row spacing. Keep two columns at standard phone widths including 320px; permit one column for accessibility text sizes when two columns cannot remain readable. Keep Show all/Show fewer behavior. Avoid accidentally changing the house-rules layout when adjusting DetailColumns.
- Add Ask a question after Things to know and before the sample-content disclosure. Match section headings, dividers and spacing. Include concise guidance and two clear options: Contact host and Ask AI assistant. Use existing message/sparkle icons, host identity, shared text/button/press-feedback components and dismissible overlay conventions. Stack options on constrained widths or large text.
- The user selected UI preview with clearly labeled sample responses and approved this plan. Implement a sample contact composer and property FAQ assistant preview; no working messaging or live AI service is included.
- For the proposed preview: Contact host opens a local draft composer with the selected property and host, accessible input and explicit messaging-not-connected copy. Do not claim a message was sent. Preserve its draft while dismissing/reopening on the same property; clear it when changing properties. Do not invent email addresses or phone numbers.
- For the proposed preview: Ask AI assistant opens a clearly labeled assistant preview with tappable property-specific questions about amenities, capacity, check-in/out and cancellation. Display answers drawn from explicit fixture facts, identified as sample answers rather than live AI output. For unsupported questions, explain the limitation and offer the host option; do not fabricate policies, availability or prices. Keep cancellation wording in one fixture field shared by the policy section and sample answer.
- Apply the user-linked local apps/mobile/.claude/skills/expo-animation/SKILL.md and relevant RECIPES.md. Purpose: feedback and state indication. Reuse 120ms press feedback (scale 0.97, skill ease-out curve, opacity with reduced motion), native gallery paging and existing overlay fade. Any newly mounted answer can use a brief Reanimated opacity entrance with reduced-motion handling. Do not animate layout heights, scrolling, or use artificial typing/loading delays. No new dependencies.
- Retain safe-area handling, persistent booking bar, font scaling, minimum touch targets, accessible expanded/selected states and modal dismissal. Question input must remain visible with the keyboard open using installed React Native primitives.

## Out of scope
Unless the integration decision explicitly changes this plan: backend/database changes, real message delivery, live AI/provider setup, new infrastructure, booking changes, authentication changes and unrelated screen redesign.

## Steps
### 1. Refine the screen and implement the approved question experience
Read root/mobile AGENTS.md, plan 10, the animation skill/press recipe, PropertyDetailsScreen, DetailColumns/DetailOverlay, PropertyPhotoGallery, property detail fixtures, TextField, PressFeedback and the current callback tests. Resolve the integration decision above before implementation. Remove the hero CTA and unreachable photo overlay, adjust only the amenity presentation for the grid, and add a small feature-local question section/overlay with the approved behavior. Reuse existing components, styles and fixtures; add only meaningful components for question interactions. Keep responsive spacing/type, keyboard-safe inputs, persistent booking bar and property-local state resets. Update existing tests that open the removed photo overlay and add meaningful tests for the new question flow/data consistency. Run verification, record observed outcomes and limitations, add Result and set done only after implementation is finished. This single step delivers the refinement; stop afterward for review.

## Verification
- TypeScript, Expo lint, all configured Node tests and git diff --check pass. Run Expo dependency/config validation without upgrading packages and an Android production export for changed native UI/assets.
- Confirm no View all photos action remains on details; swipe/previous/next/count, favorites and back/share still work, and Home/Search/Wishlist galleries retain their appearance.
- Check amenities collapsed/expanded at 320, 375 and 430px, larger screens and large text: two columns when readable, aligned icons, wrapping labels, consistent gaps, no clipping or horizontal overflow. Check house rules remain appropriate.
- Verify both question actions, selected property/host identity, close/back/reopen behavior, draft retention and reset on property change. For preview scope, verify no message-delivery success is shown, sample answers match fixture facts, unsupported topics do not invent answers, and AI/sample limitations are visible.
- Check keyboard open/close, focus/dismissal, screen-reader labels, reduced motion and persistent booking bar. No per-frame React state updates or animated heights.
- End to end in a signed-in Expo preview: Home → details → photo swipe → expand amenities → Ask a question → host draft → dismiss → assistant question/answer → dismiss → Reserve preview → back. If sign-in/device access prevents visual verification, record exactly which checks remain unobserved; callback tests and export do not prove rendered UI or release-device animation feel.

## AGENTS.md updates
None anticipated.

## Result
- Removed the View all photos action and unreachable photo overlay while retaining the hero gallery, count and accessible navigation. Existing card galleries were unchanged.
- Amenities now use equal flexible columns with a 16px gutter and consistent row spacing, including at standard 320px phone widths. Large text switches to a readable single column. House-rule layout remains unchanged.
- Added Ask a question with responsive Contact host and Ask AI assistant options. Host drafts survive overlay dismissal and assistant-to-host navigation for the same property; keyed screen state resets on property changes. Messaging is visibly unavailable and no send operation is performed.
- Added deterministic sample answers for amenities, capacity, arrival/departure and cancellation, with explicit preview labels and an unsupported-topic explanation/host handoff. Cancellation copy now comes from one fixture field. No messaging or live AI services were introduced.
- Reused shared UI, 120ms press feedback, existing overlay transitions and keyboard-aware scrolling. Sample-answer entrances use a 180ms Reanimated opacity fade with reduced-motion support; no layout heights or per-frame React updates are animated.
- Passed TypeScript, Expo lint, all 33 Node tests, whitespace checks, offline Expo dependency-map validation and Android production export (.expo/property-refinements, 46 assets). Tests exercise draft retention, overlay handoff and property-specific sample answers; they do not simulate native UI.
- Visual/native acceptance remains pending: no signed-in Expo session/device was available, and the prior browser attempt reached the existing sign-in gate. The 320/375/430px layouts, large text, keyboard behavior, screen-reader focus, physical gestures, end-to-end signed-in flow and release-device animation feel have not been visually verified.
- No new dependencies, backend changes or permanent AGENTS.md rules.
