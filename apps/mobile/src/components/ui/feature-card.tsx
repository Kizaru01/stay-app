import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { Icon, type IconName } from "./icon";

const tones = {
  safety: { background: "bg-feature-soft", icon: "text-feature" },
  support: { background: "bg-success-soft", icon: "text-success" },
  favorite: { background: "bg-warning-soft", icon: "text-accent" },
} as const;
export type FeatureCardProps = ViewProps & { icon: IconName; tone?: keyof typeof tones; children: ReactNode; onPress?: () => void; accessibilityLabel?: string };
export function FeatureCard({ icon, tone = "safety", children, onPress, accessibilityLabel, className = "", style, ...props }: FeatureCardProps) {
  const content = <><View className="h-control-sm w-control-sm items-center justify-center rounded-full bg-surface"><Icon name={icon} className={tones[tone].icon} /></View><View className="flex-1 min-w-0 gap-xs">{children}</View>{onPress ? <Icon name="chevron" size="sm" className={tones[tone].icon} /> : null}</>;
  const layout = `flex-row items-center gap-md p-lg rounded-md curve-continuous ${tones[tone].background}`;
  return <View {...props} className={className} style={style}>{onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} className={`${layout} active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus`}>{content}</Pressable> : <View className={layout}>{content}</View>}</View>;
}
