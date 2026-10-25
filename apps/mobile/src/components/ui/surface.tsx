import { View, type ViewProps } from "react-native";

const variants = {
  plain: "",
  outlined: "border border-outline",
  raised: "shadow-card",
} as const;

export type SurfaceProps = ViewProps & { variant?: keyof typeof variants };

export function Surface({ variant = "plain", className = "", style, ...props }: SurfaceProps) {
  return <View {...props} className={`surface-card ${variants[variant]} ${className}`} style={style} />;
}
