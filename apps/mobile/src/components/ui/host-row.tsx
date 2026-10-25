import { Pressable, View, type ViewProps } from "react-native";
import type { ImageSource } from "expo-image";
import { Icon } from "./icon";
import { Photo } from "./photo";
import { Text } from "./text";

export type HostRowProps = ViewProps & {
  name: string;
  avatar?: ImageSource | number;
  superhost?: boolean;
  yearsHosting: number;
  onPress?: () => void;
};
export function HostRow({ name, avatar, superhost = false, yearsHosting, onPress, className = "", style, ...props }: HostRowProps) {
  const content = <><Photo compact source={avatar} label={`Portrait of ${name}`} className="h-control-lg w-control-lg rounded-full" /><View className="flex-1 min-w-0 gap-xs"><Text variant="button">Hosted by {name}</Text><Text variant="caption" tone="muted">{superhost ? "Superhost · " : ""}{yearsHosting} {yearsHosting === 1 ? "year" : "years"} hosting</Text></View>{onPress ? <Icon name="chevron" size="sm" className="text-muted" /> : null}</>;
  const layout = "min-h-control-lg flex-row items-center gap-md rounded-md curve-continuous border border-outline bg-surface p-sm";
  return <View {...props} className={className} style={style}>{onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`View host ${name}`} onPress={onPress} className={`${layout} active:bg-canvas focus-visible:outline-2 focus-visible:outline-focus`}>{content}</Pressable> : <View className={layout}>{content}</View>}</View>;
}
