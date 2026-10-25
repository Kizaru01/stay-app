import { ActivityIndicator, Platform, Pressable, type ActivityIndicatorProps, type PressableProps } from "react-native";

import { styled } from "nativewind";
import { Text } from "./text";
import { Icon, type IconName } from "./icon";

// Limit styling inference to the spinner props we use with RN's strict types.
function LoadingIndicatorBase(props: Pick<ActivityIndicatorProps, "color" | "accessibilityElementsHidden">) {
  return <ActivityIndicator {...props} />;
}
const LoadingIndicator = styled(LoadingIndicatorBase, { className: { target: false, nativeStyleMapping: { color: "color" } } });

const variants = {
  primary: "bg-primary active:bg-primary-light",
  secondary: "border border-outline bg-surface active:bg-canvas",
  ghost: "bg-transparent active:bg-canvas",
} as const;

const sizes = {
  sm: Platform.OS === "android" ? "min-h-control-md px-lg py-sm" : "min-h-control-sm px-lg py-sm",
  md: "min-h-control-md px-xl py-md",
  lg: "min-h-control-lg px-2xl py-lg",
} as const;

export type ButtonProps = PressableProps & {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: IconName;
};

export function Button({ title, variant = "primary", size = "md", icon, loading = false, disabled = false, className = "", style, ...props }: ButtonProps) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{ ...props.accessibilityState, disabled: unavailable, busy: loading }}
      aria-busy={loading}
      aria-disabled={unavailable}
      disabled={unavailable}
      className={`min-w-control-md flex-row gap-sm items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${sizes[size]} ${unavailable ? "bg-disabled" : variants[variant]} ${className}`}
      style={style}
    >
      {loading ? <LoadingIndicator className="text-muted" accessibilityElementsHidden /> : null}
      <Text className="shrink text-center" variant={size === "sm" ? "buttonSmall" : "button"} tone={unavailable ? "disabled" : variant === "primary" ? "inverse" : "primary"}>
        {loading ? "Loading…" : title}
      </Text>
      {icon && !loading ? <Icon name={icon} size="sm" className={unavailable ? "text-muted" : variant === "primary" ? "text-on-primary" : "text-primary"} /> : null}
    </Pressable>
  );
}
