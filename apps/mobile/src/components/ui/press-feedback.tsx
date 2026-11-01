import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
  cubicBezier,
  useReducedMotion,
} from "react-native-reanimated";

const easeOut = cubicBezier(0.23, 1, 0.32, 1);

/** Near-imperceptible feedback; reduced motion uses opacity instead of scale. */
export function PressFeedback({
  children,
  onPressIn,
  onPressOut,
  ...props
}: Omit<PressableProps, "children"> & { children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Pressable
      {...props}
      pressRetentionOffset={16}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
    >
      <Animated.View
        style={{
          opacity: pressed && reduced ? 0.7 : 1,
          transform: [{ scale: pressed && !reduced ? 0.97 : 1 }],
          transitionProperty: reduced ? "opacity" : "transform",
          transitionDuration: 120,
          transitionTimingFunction: easeOut,
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
