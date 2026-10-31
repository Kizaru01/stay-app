# Onboarding and authentication entry

Status: approved

## Goal

Reproduce the supplied StayEase onboarding reference closely in the StayApp Expo mobile client, and connect the introduction to account creation and sign-in entry screens.

## Decisions

- Keep the established StayApp name. Match the reference's composition, photography, dark teal surfaces, typography hierarchy, rounded controls, pagination, and spacing within existing NativeWind conventions.
- Use the existing four source images at `assets/images/onboarding(1).png` through `onboarding(4).png`. The user referred to `/prompts`, but those assets are actually in the root assets directory. Inspect each image before choosing its placement and crop; bundle copies inside mobile assets if needed.
- Implement four introduction slides in reference order: More than just a place to stay; Stays for every kind of trip; Relax, you're in good hands; Explore with ease. Follow with the dark Get Started screen.
- Match the reference controls: first-slide centered selectable pagination and Skip, followed by left-aligned pagination and a circular next control on the other slides. Selecting a later dot progresses from the first slide without an extra visible Next button. Preserve native/system back navigation without adding a top toolbar absent from the reference.
- Get Started opens `/sign-up`; Sign In opens `/sign-in`. Use Expo Router and hide default headers on reference screens. Preserve development access to `/design-system`.
- No authentication implementation or Clerk dependency currently exists. This plan covers authentication entry UI and connected navigation only. Forms must clearly communicate that authentication is not connected; never simulate successful account creation or a signed-in session. Real Clerk authentication requires a follow-up scope decision and configuration.
- Keep onboarding state local for now; no first-launch persistence dependency is required by this request.
- Reuse existing UI primitives where appropriate. Extend shared components only when necessary to reproduce the design without breaking existing callers. Account for safe areas, keyboard, small displays, and large text.
- `prompts/TEMPLATE.md` is absent. This plan uses the sections mandated by root `AGENTS.md` without creating or changing a template.

## Out of scope

- Laravel, database, rental features, payments, maps services, analytics, and new infrastructure.
- Working credential submission, OAuth, verification emails, password reset delivery, session persistence, or protected application routes.
- Replacing the established product name or redesigning the existing design-system catalogue.

## Implementation steps

### 1. Build the onboarding experience

Inspect source images and relevant skill references. Bundle the four assets for mobile. Implement the four-slide experience and Get Started composition using existing tokens and primitives, with narrowly scoped additional CSS tokens where required. Wire next, pagination, Skip, and back behavior; set appropriate status-bar contrast. Verify this step before stopping for direction to continue, per repository workflow.

### 2. Connect authentication entry screens

Build the reference account-creation screen and a visually consistent sign-in counterpart. Wire Get Started, Sign In, account-switch links, and back navigation. Include email/password fields and accessible password visibility controls. Keep submission and social-provider actions explicit about unavailable authentication, with no fake success or session. Verify the complete navigation path, keyboard behavior, and feedback before stopping for direction to continue.

### 3. Verify and close out

Run the checks below, inspect the rendered screens against the attached reference, fix defects, and record actual results and environment limitations. Add `## Result` and set `Status: done` only when the approved scope is complete.

## Verification

- `pnpm --filter mobile exec tsc --noEmit`.
- `pnpm --filter mobile lint`.
- `pnpm --filter mobile exec expo install --check`.
- Production web export to catch routing and bundled-image issues.
- Manual rendered verification at a mobile viewport: photo crops, slide order, readable copy, pagination, Skip, next, Get Started, Sign In, account-switch links, and back navigation.
- Check narrow/short screens, increased text size, safe-area layout, accessible control labels, and keyboard visibility on forms.
- Verify unavailable authentication produces truthful feedback and never implies a successful account/session.
- Native Expo/device verification if an environment is available; explicitly record any checks that cannot be performed.

## AGENTS.md updates

None anticipated. This feature follows existing mobile architecture and styling rules.

## Progress

- Step 1 implemented: bundled all four supplied photos, built four onboarding slides and the Get Started composition, and wired next, pagination, Skip, and back navigation. Authentication buttons explicitly describe their pending step-2 implementation.
- TypeScript and lint passed. Expo's offline dependency map reports compatible dependencies; online validation was unavailable.
- Web bundles and static routes compiled, but export asset writing failed with `EPERM` when creating `assets/__node_modules/.pnpm`, including on retry in a fresh output directory.
- Expo web server started on port 8082. Browser preview attempts could not reach localhost (connection refused / timed out), so visual and interaction verification remain pending. Native device and accessibility verification were not available.
- Step 2 implemented after the user requested continuation: `/sign-up` and `/sign-in` share an authentication-entry composition, the compact logo is shared with onboarding, Get Started and Sign In navigate to the appropriate routes, account-switch links replace the current auth route, and back falls back to Get Started for direct entry. Shared TextField now accepts an input ref for email-to-password keyboard focus.
- Email/password and social-provider actions show explicit unavailable-authentication feedback. No credential submission, persistence, fake account creation, or authenticated session is implemented. These simple preview fields use local state; no authentication validation/workflow dependencies were introduced.
- Step 2 TypeScript and lint checks passed; targeted `git diff --check` passed. The browser retry to `/sign-up` timed out, so rendered layout, touch navigation, password visibility, keyboard avoidance, and native accessibility remain unverified.
- Step 3 started after the user requested continuation. Final TypeScript, lint, and production web export passed. Export succeeded outside the sandbox; all six routes, including `/sign-up` and `/sign-in`, were generated. Offline Expo dependency validation passed; online metadata was unavailable.

## Result

### Corrections requested after reference review

- Replaced `currentColor` gradient stops with concrete `#002d28` colors and explicit percentage offsets/direction. Confirmed the cause in installed react-native-svg's `extractGradient`: stop colors go through `processColor` and must resolve to a number; `currentColor` fails this check. The literal mirrors the CSS onboarding-deep token and is a native SVG compatibility exception, not an additional palette.
- Removed the onboarding top back/Skip toolbar and first-slide Next button. Tightened pagination spacing, centered the first-slide dots, and retained progression via dots/Skip plus native back behavior.
- Rebalanced artwork and text positions against available safe-area height; reduced headings to 24/32; adjusted collage proportions, full-bleed balcony placement, map spacing and labels; replaced Get Started's ellipse decorations with flowing SVG waves and moved the branding/actions toward the reference positions.
- Made the auth brand compact and removed redundant visible field labels on authentication screens while retaining accessible input labels. Existing TextField callers retain visible labels by default.
- Preserved supplied onboarding photos and established StayApp naming. Those photos differ from the composite reference, so identical photographic subjects are not implied.
- Correction verification: TypeScript, lint, whitespace checks, and production web export passed (all six routes generated). Visual/native comparison remains unverified because browser policy previously denied inspection and prohibited alternate-surface workarounds; no new browser workaround was attempted.

### Swipe and text-width correction

The user reported column-like text wrapping and missing slide gestures. Re-read the design-system document and Expo animation skill. Replaced query-parameter navigation between introductions with a native horizontal, paging-enabled ScrollView containing five explicitly sized pages. Next, dots and Skip scroll the pager; swipes update selected pagination and status-bar appearance. Route parameters remain only as an entry point (for example, authentication back fallback to step 4), not the slide progression mechanism. Native scrolling owns the gesture and snap behavior; reduced-motion preference disables programmatic animated scrolling.

The pager measures its actual container, including a narrow browser panel. Each page and its vertical overflow scroller now have explicit viewport widths; centered content has a numeric width capped at 512, and copy fills the padded content area. This removes the prior dependency on percentage-width/max-width sizing inside an unconstrained scroll container. Headings use the existing `heading2` variant (20/28), copy uses `bodySmall` (14/21), and text uses the design system's 24-point screen inset. Offscreen pages are hidden from accessibility traversal. Resize preserves the selected slide; Android back moves to the previous slide.

Final TypeScript, lint, production web export, and whitespace checks passed. Route-entry changes reset the pager through a keyed component rather than synchronously setting state in an effect. Native swipe feel, actual text wrapping, and rendered reference comparison still require device/manual verification; the previous browser policy restriction has not been bypassed.

The onboarding and authentication-entry UI is implemented. Four introduction slides use the supplied images and lead to Get Started, which links to sign-up and sign-in. Real authentication remains outside this approved scope and is explicitly unavailable in the UI.

Automated verification passed: TypeScript, lint, production web export, and offline Expo dependency compatibility.

Visual/interaction closeout remains blocked. The local Windows browser verification was stopped by Computer Use because it could not establish the current browser URL. On the next user-authorized continuation, access to the existing in-app `http://localhost:8082/` tab was rejected by the browser security policy before observation. The tool explicitly prohibits attempting the same inspection through alternate browser surfaces or indirect commands. No workaround was attempted after that rejection.

Still required before marking this plan done: manual comparison against the reference; exercise slides, pagination, Skip, next/back, Get Started, account-switch links, unavailable-auth feedback and its dismissal, password visibility and keyboard focus; check narrow/short layouts and large text; native safe-area/keyboard and accessibility review where a device is available. Status remains approved because those checks are incomplete.
