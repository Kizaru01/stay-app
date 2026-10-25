import { View } from "react-native";
import { Path } from "react-native-svg";
import { ThemedSvg } from "./icon";
import { Text } from "./text";

/** Compact brand lockup shared by onboarding and authentication entry. */
export function WelcomeLogo({ inverse = false, vertical = false, compact = false }: { inverse?: boolean; vertical?: boolean; compact?: boolean }) {
  const color = inverse ? "text-white" : "text-onboarding";
  return <View className={`items-center gap-md ${vertical ? "" : "flex-row justify-center"}`}>
    <ThemedSvg className={`${vertical ? "h-16 w-16" : compact ? "h-7 w-7" : "h-9 w-9"} ${color}`} viewBox="0 0 48 48" fill="none" aria-hidden>
      <Path d="M7 39V20L24 5l17 15v19a2 2 0 0 1-2 2H28V30h-8v11H9a2 2 0 0 1-2-2Z" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </ThemedSvg>
    <Text variant={compact ? "heading2" : "heading1"} className={color}>StayApp</Text>
  </View>;
}
