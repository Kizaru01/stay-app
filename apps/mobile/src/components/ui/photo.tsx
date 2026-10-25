import { useState } from "react";
import { View, type ViewProps } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { styled } from "nativewind";
import { Icon } from "./icon";
import { Text } from "./text";

const StyledImage = styled(Image);
export type PhotoProps = ViewProps & { source?: ImageSource | number; label: string; compact?: boolean };

/** Stable dimensions and a readable fallback also work without an image source. */
export function Photo({ source, label, compact = false, className = "", style, ...props }: PhotoProps) {
  // Remount the image state when callers replace its source.
  const sourceKey = typeof source === "number" ? String(source) : source?.uri ?? "missing";
  return <View {...props} className={`overflow-hidden bg-canvas ${className}`} style={style}>
    <PhotoContent key={sourceKey} source={source} label={label} compact={compact} />
  </View>;
}
function PhotoContent({ source, label, compact }: Pick<PhotoProps, "source" | "label" | "compact">) {
  const [failed, setFailed] = useState(false);
  if (!source || failed) return <View accessibilityLabel={`${label}. Photo unavailable`} className="flex-1 items-center justify-center gap-xs p-sm"><Icon name={compact ? "user" : "home"} className="text-muted" />{!compact ? <Text variant="caption" tone="muted" className="text-center">Photo unavailable</Text> : null}</View>;
  return <StyledImage source={source} accessibilityLabel={label} contentFit="cover" className="h-full w-full" onError={() => setFailed(true)} />;
}
