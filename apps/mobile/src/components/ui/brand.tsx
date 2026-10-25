import { View, type ViewProps } from "react-native";
import { Path } from "react-native-svg";
import { ThemedSvg } from "./icon";
import { Text } from "./text";

export function Brand({ className = "", style, ...props }: ViewProps) {
  return <View {...props} className={`gap-md ${className}`} style={style}>
    <View className="flex-row items-center gap-lg">
      <View className="text-primary" accessibilityElementsHidden>
        <ThemedSvg className="h-18 w-16 text-primary" viewBox="0 0 64 72" fill="none" aria-hidden>
          <Path d="M21 63H7V30L32 6l25 24v33H36V49h9" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </ThemedSvg>
      </View>
      <View className="flex-1 gap-xs">
        <Text variant="display" tone="primary">StayApp</Text>
        <Text variant="heading2" tone="muted">Find your perfect stay</Text>
      </View>
    </View>
    <Text tone="muted">More than just a place to stay. Discover beautiful homes, cozy cabins and unique stays around the world.</Text>
  </View>;
}
