import { useState } from "react";
import { TextInput, View, type TextInputProps, type ViewProps } from "react-native";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";

export type SearchBarProps = Omit<TextInputProps, "style" | "className" | "value" | "onChangeText"> & {
  value: string;
  onChangeText: (value: string) => void;
  onFiltersPress: () => void;
  filtersLabel?: string;
  className?: string;
  style?: ViewProps["style"];
};
export function SearchBar({ value, onChangeText, onFiltersPress, filtersLabel = "Open search filters", accessibilityLabel = "Search destinations", placeholder = "Where are you going?", editable = true, readOnly = false, onFocus, onBlur, className = "", style, ...props }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const disabled = !editable || readOnly;
  return <View className={`min-h-control-lg flex-row items-center gap-sm rounded-full border px-md ${focused && !disabled ? "border-focus" : "border-outline"} ${disabled ? "bg-disabled" : "bg-surface"} ${className}`} style={style}>
    <Icon name="search" className="text-ink" />
    <TextInput {...props} value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={accessibilityLabel} accessibilityState={{ ...props.accessibilityState, disabled }} editable={!disabled} readOnly={disabled} returnKeyType="search" onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }} className={`type-body-sm flex-1 min-w-0 min-h-control-md py-sm outline-none placeholder:text-muted ${disabled ? "text-disabled-ink" : "text-ink"}`} />
    {value ? <IconButton icon="close" accessibilityLabel="Clear destination search" onPress={() => onChangeText("")} disabled={disabled} className="border-0 bg-transparent" /> : null}
    <IconButton icon="filters" accessibilityLabel={filtersLabel} onPress={onFiltersPress} disabled={disabled} className="border-0 bg-transparent" />
  </View>;
}
