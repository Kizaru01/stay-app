import { Platform, Pressable, View, type ViewProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type NavigationItem = { key: string; label: string; icon: IconName; disabled?: boolean };
export type BottomNavigationProps = ViewProps & {
  items: readonly NavigationItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
};
/** Controlled presentation; the caller owns Expo Router navigation and safe-area placement. */
export function BottomNavigation({ items, selectedKey, onSelect, className = "", style, ...props }: BottomNavigationProps) {
  return <View {...props} accessibilityRole="tablist" accessibilityLabel={props.accessibilityLabel ?? "Main navigation"} className={`flex-row flex-wrap rounded-xl curve-continuous border border-outline bg-surface p-xs ${className}`} style={style}>
    {items.map(item => {
      const selected = item.key === selectedKey;
      return <Pressable key={item.key} {...(Platform.OS === "web" ? { "aria-selected": selected } : {})} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected, disabled: !!item.disabled }} disabled={item.disabled} onPress={() => onSelect(item.key)} className={`min-h-control-lg min-w-control-lg flex-1 items-center justify-center gap-xs rounded-md curve-continuous p-xs focus-visible:outline-2 focus-visible:outline-focus ${item.disabled ? "opacity-50" : "active:bg-canvas"}`}>
        <Icon name={item.icon} filled={selected && item.icon === "home"} className={selected ? "text-primary" : "text-muted"} />
        <Text variant="caption" tone={selected ? "primary" : "muted"} className="w-full text-center">{item.label}</Text>
      </Pressable>;
    })}
  </View>;
}

