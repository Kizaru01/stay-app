import { useId, useState, useSyncExternalStore, type Ref } from "react";
import { Platform, TextInput, View, type TextInputInstance, type TextInputProps } from "react-native";

import { Text } from "./text";
import { Icon, type IconName } from "./icon";
import { IconButton } from "./icon-button";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export type TextFieldProps = TextInputProps & {
  ref?: Ref<TextInputInstance>;
  label: string;
  labelHidden?: boolean;
  hint?: string;
  error?: string;
  icon?: IconName;
  onClear?: () => void;
};

export function TextField({ label, labelHidden = false, hint, error, icon, onClear, secureTextEntry, editable = true, readOnly = false, className = "", style, onFocus, onBlur, accessibilityLabel, ...props }: TextFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  // Expo's static and client navigation trees can produce different useId values.
  // Attach the web description after hydration; native hints are always available.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const descriptionId = hydrated ? generatedId : undefined;
  const unavailable = !editable || readOnly;
  const webAccessibilityProps = Platform.OS === "web" ? {
    "aria-invalid": !!error,
    "aria-describedby": error || hint ? descriptionId : undefined,
  } : {};
  return (
    <View className="gap-sm">
      {!labelHidden ? <Text variant="label">{label}</Text> : null}
      <View className={`min-h-control-md flex-row items-center gap-sm rounded-md curve-continuous border px-md ${unavailable ? "bg-disabled" : "bg-surface"} ${error ? "border-danger" : focused && !unavailable ? "border-focus" : "border-outline"}`}>
      {icon ? <Icon name={icon} className={unavailable ? "text-muted" : "text-ink"} /> : null}
      <TextInput
        {...props}
        secureTextEntry={secureTextEntry && !passwordVisible}
        {...webAccessibilityProps}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? hint ?? props.accessibilityHint}
        accessibilityState={{ ...props.accessibilityState, disabled: unavailable }}
        editable={!unavailable}
        readOnly={unavailable}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        className={`type-body flex-1 min-w-0 min-h-control-md py-md outline-none placeholder:text-muted selection:text-primary ${unavailable ? "text-disabled-ink" : "text-ink"} ${className}`}
        style={style}
      />
      {secureTextEntry ? <IconButton icon={passwordVisible ? "eyeOff" : "eye"} accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} disabled={unavailable} onPress={() => setPasswordVisible(!passwordVisible)} className="border-0 bg-transparent" /> : onClear && !!props.value ? <IconButton icon="close" accessibilityLabel={`Clear ${label}`} disabled={unavailable} onPress={onClear} className="border-0 bg-transparent" /> : null}
      </View>
      {error ? <Text nativeID={descriptionId} variant="caption" tone="danger" accessibilityRole="alert">{error}</Text> : hint ? <Text nativeID={descriptionId} variant="caption" tone="muted">{hint}</Text> : null}
    </View>
  );
}
