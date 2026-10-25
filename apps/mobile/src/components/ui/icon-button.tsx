import { Platform, Pressable, type PressableProps } from "react-native";
import { Icon, type IconName } from "./icon";

export type IconButtonProps = PressableProps & { icon: IconName; accessibilityLabel: string; selected?: boolean };
export function IconButton({ icon, accessibilityLabel, selected, disabled = false, className = "", style, ...props }: IconButtonProps) {
  return <Pressable {...props} {...(Platform.OS === "web" && selected !== undefined ? { "aria-pressed": selected } : {})} accessibilityLabel={accessibilityLabel} accessibilityRole="button" accessibilityState={{ ...props.accessibilityState, selected, disabled: !!disabled }} disabled={disabled}
    className={`${Platform.OS === "android" ? "min-h-control-md min-w-control-md" : "min-h-control-sm min-w-control-sm"} items-center justify-center rounded-full border border-outline focus-visible:outline-2 focus-visible:outline-focus active:bg-canvas ${disabled ? "bg-disabled opacity-50" : "bg-surface"} ${className}`} style={style}>
    <Icon name={icon} filled={selected} className={selected ? "text-primary" : disabled ? "text-muted" : "text-ink"} />
  </Pressable>;
}
