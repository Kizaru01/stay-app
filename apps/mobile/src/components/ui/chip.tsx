import { Platform, Pressable, type PressableProps } from "react-native";

import { Text } from "./text";
import { Icon, type IconName } from "./icon";

export type ChipProps = PressableProps & { label: string; selected?: boolean; icon?: IconName };

export function Chip({ label, icon, selected = false, disabled = false, className = "", style, ...props }: ChipProps) {
  // React Native Web needs toggle-button semantics in addition to native selection.
  const webAccessibilityProps = Platform.OS === "web" ? { "aria-pressed": selected } : {};
  return (
    <Pressable
      {...props}
      {...webAccessibilityProps}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ ...props.accessibilityState, selected, disabled: !!disabled }}
      className={`${Platform.OS === "android" ? "min-h-control-md" : "min-h-control-sm"} min-w-control-md flex-row gap-sm items-center justify-center rounded-full px-lg py-sm focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${disabled ? "bg-disabled" : selected ? "bg-primary active:bg-primary-light" : "bg-canvas active:bg-neutral-300"} ${className}`}
      style={style}
    >
      {icon ? <Icon name={icon} size="sm" className={disabled ? "text-muted" : selected ? "text-on-primary" : "text-ink"} /> : null}
      <Text className="shrink text-center" variant="bodySmall" tone={disabled ? "disabled" : selected ? "inverse" : "default"}>{label}</Text>
    </Pressable>
  );
}
