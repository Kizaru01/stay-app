# StayApp design system

Based on the supplied `systemdesign.png` StayEase reference. StayApp keeps its
existing product name. The reference defines the visual language, not rental data
or API behavior. The light palette is intentional; a dark theme is not supplied.

## Source of truth

`global.css` owns all visual values through NativeWind v5 / Tailwind v4.
Do not add a parallel TypeScript palette or `StyleSheet` theme. Extend these
tokens when a reusable value is missing. Use literal, complete class strings
so Tailwind can detect them.

| Role | Token | Reference value |
| --- | --- | --- |
| Brand/actions | primary | #0F5132 |
| Pressed actions | primary-light | #1E6B4B |
| Secondary accents | secondary | #0EA5E9 |
| Ratings/highlights | accent | #F59E0B |
| Headings | neutral-900 / ink | #111827 |
| Secondary text | neutral-600 / muted | #6B7280 |
| Borders | neutral-300 / outline | #D1D5DB |
| Background | neutral-100 / canvas | #F3F4F6 |
| Cards/base | white / surface | #FFFFFF |

Status foregrounds and pale backgrounds, violet focus, spacing, radii and
shadows are derived implementation values. Colored secondary/accent fills
need dark text; white text is reserved for the dark primary fill. Success,
danger, warning, info and superhost have paired foreground/background tokens.
Do not communicate meaning through color alone.

## Typography and fonts

Inter 400, 500, 600 and 700 are bundled from `@expo-google-fonts/inter` and loaded
by the root layout before the splash screen hides. No network font request is
needed at runtime. Font loading errors surface through Expo's error boundary.
Use the named family for each weight; do not combine static Inter families with
`font-bold`/`font-semibold` (which can synthesize a weight).

| Text variant | Size / line height | Weight |
| --- | --- | --- |
| display | 40 / 48 | Bold |
| heading1 | 28 / 36.4 | Semibold |
| heading2 | 20 / 28 | Semibold |
| body | 16 / 24 | Regular |
| bodySmall | 14 / 21 | Regular |
| caption | 12 / 18 | Regular |
| button | 16 / 24 | Medium |
| buttonSmall | 14 / 21 | Medium |

These select the lower end of the reference's display/heading ranges for mobile.
Text keeps system font scaling enabled. Controls use minimum heights and padding,
so labels can wrap at larger accessibility sizes.

## Layout

- Spacing: xs 4, sm 8, md 12, lg 16, xl 24, 2xl 32, 3xl 48.
- Screen inset: 24. Use `gap-*` to group related content.
- Controls: small 44, medium 48, large 56 minimum height.
- Radii: sm 8 (badges), md 12 (fields/images), lg 16 (cards), xl 24,
  full (buttons, chips, icon controls). Pair non-capsules with `curve-continuous`.
- Shadows: `shadow-card`, `shadow-raised`, `shadow-overlay`; use sparingly.
- Interaction transitions: 150ms with `ease-standard` where animation is needed.
- Shared composition classes: `screen-content` and `surface-card`.

## Primitives

Import from `@/components/ui`. `style` is forwarded last for layout overrides;
use variants/tones to change identity. `className` is intended for layout.

| Primitive | Contract |
| --- | --- |
| Text | Named typography `variant`, semantic `tone`, native Text props |
| Button | `title`, primary/secondary/ghost, sm/md/lg, disabled/loading, native Pressable props |
| TextField | Required accessible `label`, hint/error, native input props; default/focused/error/disabled states |
| Chip | `label`, selected/disabled, onPress, accessible selection state |
| Badge | `label`, success/superhost/danger/info/warning; informational, not interactive |
| Surface | Composable children; plain/outlined/raised |

Buttons and chips provide touch feedback. Loading buttons retain their accessible
label, expose busy state, and prevent duplicate presses. Fields preserve focus
callbacks and use visible labels. Shared rental, navigation, search and alert
components are described below. No domain or navigation behavior is implied by
the catalogue examples. Steppers, segmented controls and toggles (reference
section 17) are outside this implementation.

## Preview and verification

In development, select **View design system** on the home screen, or visit
`/design-system`. The catalogue demonstrates every reference section from 1–15,
including interactive states and clearly marked temporary rental fixtures. The
entry is hidden in release, and direct catalogue navigation redirects home.

Run `pnpm --filter mobile exec tsc --noEmit`, `pnpm --filter mobile lint`,
and `pnpm --filter mobile exec expo install --check`. Verify on native with
large accessibility text and VoiceOver/TalkBack before shipping a feature.

## Reference foundation (sections 1–6 and 13)

`Brand` renders the StayApp house mark and reference tagline. `Icon` uses SVG
paths and NativeWind color classes; `IconButton` owns its accessible label and
selected/disabled states. SVG color is applied directly to the SVG through the
NativeWind styled adapter so native does not depend on View color inheritance.
The SVG dependency is pinned to the installed Expo SDK's compatibility map.

`Button` supports a trailing `icon` and displays an activity indicator while
loading. `Chip` accepts a category `icon`. `TextField` accepts a leading `icon`
and controlled `onClear` action; secure fields have an accessible visibility
control. It retains visible labels, focus/error styling, native input props,
and descriptive hints. Caller style overrides apply to the input itself.

The development-only `/design-system` route previews the foundation alongside
the composed components below.

## Rental compositions (sections 7–10 and 14)

| Component | Contract |
| --- | --- |
| ListingCard | `listing: ListingPreview`, horizontal/grid variant, controlled `favorite` and `onFavoriteChange`, optional `onPress` |
| HostRow | Name, optional avatar, superhost status, hosting years, optional caller-owned action |
| RatingSummary | Aggregate rating/review count and an array of labeled category scores/icons |
| FeatureCard | Safety/support/favorite tone, icon, composable text children, optional labeled action |

All accept native View props and layout styles. Listing and host data are display
models, not authoritative pricing, inventory, or verification rules. Favorite
controls are siblings of the listing action so the two actions do not nest.
Labels wrap; horizontal cards and rating rows reflow on narrow screens.

`Photo` is an internal shared image frame with missing/error fallback behavior.
The development fixtures live in `src/fixtures/design-system.ts`; bundled sample
photos and their source URLs live under `assets/images/demo`. None represents
actual StayApp properties, users, or API data. Catalogue card actions report a
local demo message rather than starting rental or support workflows.

## Navigation, search and alerts (sections 11, 12 and 15)

| Component | Contract |
| --- | --- |
| BottomNavigation | Caller-supplied items, controlled selectedKey, onSelect; selected/disabled tab semantics |
| SearchBar | Controlled value/onChangeText, required onFiltersPress, native input callbacks, clear action |
| StatusAlert | success/error/info variant, message, optional onDismiss and dismissLabel |

BottomNavigation presents the reference's five tabs. The caller owns Expo Router
navigation, safe-area placement, and any authentication checks. Catalogue tab
selection is local. Items reflow when space or large labels require it, rather
than clipping text or reducing touch targets.

SearchBar exposes focus and read-only/disabled states. Its style prop targets
the outer capsule; native text input props are forwarded to the input. Search
submission and filters are caller-owned. No search endpoint or filter sheet is
implied by the design-system demo.

StatusAlert pairs an icon and readable message with a status tint. Error messages
use assertive alert semantics; success and information use polite status semantics.
Dismiss controls are separate buttons with explicit names. Only mount alerts when
needed; do not treat catalogue confirmation text as an actual booking result.

Catalogue headings follow the reference numbering, with sections 16–17 excluded.
The preview provides a restore action after alert dismissal. The reference palette
is intentionally light; native dark-mode and production screens require a separate
product decision.

## Implementation verification

Sections 1–15 are implemented. TypeScript, lint, bundled-SDK dependency checking
and production web export passed. Desktop and mobile web interactions were
reviewed, including missing-image fallback/restoration. Production navigation to
/design-system redirects home and the catalogue entry is absent.

Online dependency metadata was unavailable during the SDK check. Native Expo Go,
VoiceOver/TalkBack and large accessibility-text verification still require a
configured device or emulator; those results are not implied by web verification.
