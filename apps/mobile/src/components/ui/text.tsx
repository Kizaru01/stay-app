import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

const variants = {
  display: "type-display",
  heading1: "type-heading-1",
  heading2: "type-heading-2",
  body: "type-body",
  bodySmall: "type-body-sm",
  caption: "type-caption",
  button: "type-button",
  buttonSmall: "type-button-sm",
} as const;

const tones = {
  default: "text-ink",
  muted: "text-muted",
  primary: "text-primary",
  inverse: "text-on-primary",
  danger: "text-danger",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  superhost: "text-superhost",
  disabled: "text-disabled-ink",
} as const;

export type TextProps = NativeTextProps & {
  variant?: keyof typeof variants;
  tone?: keyof typeof tones;
};

export function Text({ variant = "body", tone = "default", className = "", style, ...props }: TextProps) {
  return <NativeText {...props} className={`${variants[variant]} ${tones[tone]} ${className}`} style={style} />;
}
