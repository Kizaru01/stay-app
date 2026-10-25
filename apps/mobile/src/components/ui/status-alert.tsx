import { View, type ViewProps } from "react-native";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";

const variants = {
  success: { background: "bg-success-soft", icon: "check", color: "text-success", tone: "success" },
  error: { background: "bg-danger-soft", icon: "alert", color: "text-danger", tone: "danger" },
  info: { background: "bg-info-soft", icon: "info", color: "text-info", tone: "info" },
} as const;
export type StatusAlertProps = ViewProps & { message: string; variant?: keyof typeof variants; onDismiss?: () => void; dismissLabel?: string };
export function StatusAlert({ message, variant = "info", onDismiss, dismissLabel = "Dismiss notification", className = "", style, ...props }: StatusAlertProps) {
  const appearance = variants[variant];
  return <View {...props} className={`min-h-control-md flex-row items-center gap-sm rounded-sm curve-continuous px-md py-xs ${appearance.background} ${className}`} style={style}>
    <Icon name={appearance.icon} size="sm" className={appearance.color} />
    <Text variant="bodySmall" tone={appearance.tone} accessibilityRole={variant === "error" ? "alert" : undefined} accessibilityLiveRegion={variant === "error" ? "assertive" : "polite"} role={variant === "error" ? "alert" : "status"} className="flex-1">{message}</Text>
    {onDismiss ? <IconButton icon="close" accessibilityLabel={dismissLabel} onPress={onDismiss} className="border-0 bg-transparent" /> : null}
  </View>;
}
