import { View, type ViewProps } from "react-native";
import { styled } from "nativewind";
import Svg, { Path } from "react-native-svg";

export const ThemedSvg = styled(Svg, { className: { target: "style", nativeStyleMapping: { color: "color" } } });

const paths = {
  parking: "M3 21V8l3-5h12l3 5v13M3 9h18M3 17h18M6 13h2m8 0h2M6 21v-4m12 4v-4",
  kitchen: "M4 2h16v20H4ZM4 8h16M8 5h.01M16 5h.01M8 12h8v6H8Z",
  tv: "M2 3h20v15H2ZM12 18v4m-5 0h10",
  bath: "M2 12h20M4 12v4a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-4M6 12V5a3 3 0 0 1 6 0M8 5h6M7 21v1m10-1v1",
  users: "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M5 22v-3a7 7 0 0 1 14 0v3M3 12a3 3 0 0 0 0-6m18 6a3 3 0 0 0 0-6M1 21v-4l2-2m20 6v-4l-2-2",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2",
  coffee: "M3 3h14v12a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM17 5h2a3 3 0 0 1 0 6h-2M2 23h18",
  waves: "M2 7q3-4 7 0t7 0 6 0M2 13q3-4 7 0t7 0 6 0M2 19q3-4 7 0t7 0 6 0",
  check: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 12l3 3 7-7",
  alert: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 7v6m0 4h.01",
  info: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6m0-10h.01",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1Z",
  chevron: "m9 5 7 7-7 7",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Zm-4 10 3 3 5-6",
  headset: "M3 14v-3a9 9 0 0 1 18 0v7a4 4 0 0 1-4 4h-4M3 12h4v8H3ZM17 12h4v8h-4Z",
  crown: "m2 6 5 5 5-8 5 8 5-5-3 15H5ZM5 17h14",
  home: "M3 10 12 2l9 8v11h-6v-7H9v7H3Z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  filters: "M3 6h10m4 0h4M3 12h3m4 0h11M3 18h12m4 0h2M13 4v4m-7 2v4m9 2v4",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  mail: "M3 4h18v16H3ZM3 5l9 7 9-7",
  user: "M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 22v-2a8 8 0 0 1 16 0v2Z",
  lock: "M5 10h14v12H5ZM8 10V6a4 4 0 0 1 8 0v4M12 15v2",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  eyeOff: "m3 3 18 18M10 5l2 0c6 0 10 7 10 7a19 19 0 0 1-3 4M6 6a22 22 0 0 0-4 6s4 7 10 7l4-1",
  close: "m6 6 12 12M6 18 18 6",
  arrow: "M3 12h18m-7-7 7 7-7 7",
  share: "M12 15V2m-5 5 5-5 5 5M5 11H3v11h18V11h-2",
  bookmark: "M5 3h14v19l-7-5-7 5Z",
  grid: "M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3ZM15 15h6v6h-6Z",
  cabin: "m2 11 10-9 10 9M5 9v13h14V9M9 22v-8h6v8M9 8h6",
  beach: "M12 22V8M7 22h10M12 8C6 1 2 4 2 8c4-3 7-2 10 0ZM12 8c6-7 10-4 10 0-4-3-7-2-10 0ZM12 8C8 9 6 12 6 15m6-7c4 1 6 4 6 7",
  city: "M2 22h20M5 22V4h9v18m0-13h5v13M8 8h3M8 12h3M8 16h3M8 20h3",
  tent: "m2 21 10-18 10 18ZM8 21l4-8 4 8",
  sparkle: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z",
  bag: "M4 7h16l1 15H3ZM8 9V6a4 4 0 0 1 8 0v3M8 12v6m8-6v6",
  message: "M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4ZM8 11h.01M12 11h.01M16 11h.01",
  calendar: "M3 5h18v17H3ZM3 10h18M7 2v6m10-6v6",
  bed: "M2 21V7m20 14V7M2 17h20M2 13h20v4M5 13V8h6v5m2 0V8h6v5",
  wifi: "M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0m-4 4h.01",
  snow: "M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1-1-4m15 9-4 1 1 4M3 14l4 1-1 4m15-9-4-1 1-4",
  pool: "M2 21q3-3 6 0 3-3 6 0 3-3 8 0M2 16q3-3 6 0 3-3 6 0 3-3 8 0M6 14V5a3 3 0 0 1 6 0m2 12V5a3 3 0 0 1 6 0M6 8h8m-8 4h8",
} as const;

export type IconName = keyof typeof paths;
export type IconProps = ViewProps & { name: IconName; size?: "sm" | "md" | "lg"; filled?: boolean };
const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" } as const;

/** Decorative by default; the containing control owns the accessible name. */
export function Icon({ name, size = "md", filled = false, className = "text-ink", style, ...props }: IconProps) {
  return <View {...props} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className={className} style={style}>
    <ThemedSvg className={`${sizes[size]} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path d={paths[name]} stroke="currentColor" fill={filled ? "currentColor" : "none"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </ThemedSvg>
  </View>;
}

