# 13 · Minimal native bottom navigation

Status: done

## Goal
Refine the existing bottom navigation with a TikTok-inspired minimalist hierarchy: clean icons, compact labels, equal spacing, strong selected state and restrained feedback. Preserve Expo Router Native Tabs and every existing route and navigation behavior.

## Decisions
- Keep Home, Wishlist, Trips, Messages and Profile in their current order with the same names, routes, authentication boundary and selection/reselection behavior.
- Keep the existing light StayApp visual language: flat paper background, dark ink/forest selected foreground and muted inactive foreground. TikTok inspiration means restrained visual hierarchy, not a new dark theme or a central create button.
- Use consistent native vector symbols (SF Symbols on iOS, Material symbols on Android), with outline/filled selection variants where supported. Keep readable labels around 11–12 logical pixels without forcing fixed tab heights or disabling system text scaling.
- Remove app-controlled selected pills, decorative corners, shadows and blur where supported. Use labeled, equally distributed Android tabs and the native platform's layout/insets rather than a custom tab bar.
- iOS 26 owns Liquid Glass tab geometry. Expo documents that backgroundColor, blurEffect, shadowColor and disableTransparentOnScrollEdge affect only iOS 18 and earlier. Preserve Native Tabs and accept system-owned geometry on iOS 26; do not promise a fully flat bar on that OS or use private APIs.
- Prefer built-in native selection feedback. Add only a short web color/opacity transition with prefers-reduced-motion fallback; do not animate screen content or overlay custom animated controls onto native tab buttons.
- Add SDK-compatible expo-haptics for a lightweight selection pulse on supported native platforms, only for user-driven changes to a different enabled tab. Do not vibrate on initial render, deep links, programmatic navigation or repeated selection of the active tab. Haptics failures must not affect navigation. Suppress optional feedback when reduced motion is enabled.
- The installed Expo web NativeTabs fallback renders labels without icons. Preserve its navigator and enhance the existing scoped web styles with lightweight vector masks/assets if needed; do not introduce a parallel router or fake native verification with a web screenshot.
- Existing changes from the browse refinement remain in the working tree; preserve them and unrelated edits.

## Out of scope
New routes, route renaming, a center action, custom JavaScript tab navigator, screen redesign, dark theme, backend changes, dependency upgrades, and replacing OS-owned iOS 26 geometry.

## Steps
### 1. Implement and verify the minimal native tab bar
Read root/mobile AGENTS.md and DESIGN_SYSTEM.md. Inspect src/app/(browse)/(tabs)/_layout.tsx, global.css's scoped browse-tabs rules, the installed Expo Router Native Tabs declarations/implementation and current official SDK 58 Native Tabs/haptics documentation. Configure supported label, icon, background, indicator, ripple and shadow options to produce the agreed minimalist hierarchy. Preserve all triggers and native navigation semantics. Use SDK-supported tabPress listeners to add guarded selection haptics; use the supported native APIs without blocking navigation or swallowing application errors unrelated to optional haptic availability. Install expo-haptics through Expo with the repository's pnpm package manager and update its lockfile. Refine the existing web fallback to provide icons, equal spacing and a flat selection state; preserve its in-flow bottom placement and use safe-area-aware spacing and reduced-motion CSS. Keep styling scoped to browse navigation. Run the checks below, inspect every tab and return/back flow, and record actual platform coverage. If installation or a native API limitation blocks a requirement, explain it and retain a working app rather than silently substituting a different navigator. Add Result and set Status: done only after the available verification is completed with limitations recorded.

## Verification
- Mobile TypeScript, lint and Expo dependency compatibility checks; inspect lockfile for only the intended dependency change.
- Web at 320px, 390px and a wider viewport: five vector icons and labels, equal spacing, distinct selected state without pill backgrounds, no content overlap, keyboard focus and tab semantics, no layout shift on selection, and reduced-motion transition override.
- Home → each tab → Home; Home → Search → Property Details → back, plus wishlist save/remove synchronization. Confirm tab reselection behavior and route history are unchanged.
- On available iOS/Android devices: safe-area insets, native symbols, label readability with enlarged text, VoiceOver/TalkBack selection announcements, tab changes, reduced-motion handling and one light haptic per user-selected different tab. Confirm no haptics on launch, active-tab reselection or programmatic navigation. Explicitly record unavailable device checks.
- End-to-end: select a stay on Home, save it, visit Wishlist and return Home without route/state regressions.

## AGENTS.md updates
None. The implementation retains the established native navigation architecture.

## Result
- Retained all five NativeTabs triggers, routes and existing navigation defaults. Added compact state-specific labels, native outline/filled symbol variants, flat supported backgrounds, no app shadow/blur/indicator, and a restrained Android ripple.
- Installed only expo-haptics ~58.0.7 with Expo/pnpm. Added optional selection feedback through the SDK's user-only tabPress event, guarded for web, reduced motion, prevented selection and the already-active route; promise rejection cannot block navigation. Actual device feedback remains unverified.
- Updated the existing scoped web fallback with 24px decorative SVG masks, equal tab widths, compact labels, transparent selection backgrounds, visible keyboard focus, safe-area padding and 150ms color/opacity transitions disabled by prefers-reduced-motion. No custom navigator was introduced.
- TypeScript, lint, git diff --check and Expo's bundled offline compatibility check passed. Online compatibility metadata was unavailable. Reviewed the lockfile: only the intended haptics dependency was added.
- Authenticated web verification passed at 320px, 390px and 1024px. All five tabs render and navigate, keyboard ArrowRight selects the next tab, Home/Search/Property Details back navigation works, and Home save → Wishlist → Home preserves the saved stay. Verified five equal-width 56px-high targets at 320px, transparent selected backgrounds, 24px vector masks and the emitted reduced-motion rule. The active browser preference was normal motion; native reduced-motion toggling was not exercised.
- Restarted the existing Metro preview after file-handle exhaustion using one worker and a two-thread temporary Node thread pool; no project runtime configuration was changed. Preview remains at http://localhost:8082/home.
- No configured native device/emulator was available. iOS/Android layout, physical haptics, native enlarged text, screen-reader announcements and hardware safe-area behavior require device verification. iOS 26 retains system-owned Liquid Glass geometry as agreed. No AGENTS.md changes were needed.
