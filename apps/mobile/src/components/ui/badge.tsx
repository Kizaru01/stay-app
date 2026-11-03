import { View, type ViewProps } from "react-native";

import { Text } from "./text";

const variants = {
  success: { surface: "bg-success-soft", tone: "success" },
  superhost: { surface: "bg-superhost-soft", tone: "superhost" },
  danger: { surface: "bg-danger-soft", tone: "danger" },
  info: { surface: "bg-info-soft", tone: "info" },
  warning: { surface: "bg-warning-soft", tone: "warning" },
} as const;

export type BadgeProps = ViewProps & { label: string; variant?: keyof typeof variants };

export function Badge({ label, variant = "success", className = "", style, ...props }: BadgeProps) {
  return (
    <View {...props} className={`self-start rounded-sm curve-continuous px-md py-xs ${variants[variant].surface} ${className}`} style={style}>
      <Text variant="metadata" tone={variants[variant].tone}>{label}</Text>
    </View>
  );
}
