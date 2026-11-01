import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text } from "@/components/ui";
import type { IconName } from "@/components/ui/icon";

export function BrowseEmptyState({ title, message, icon }: { title: string; message: string; icon: IconName }) {
  return <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-onboarding-paper">
    <View className="gap-xl p-xl">
      <Text variant="heading1" accessibilityRole="header" className="text-onboarding-ink">{title}</Text>
      <View className="items-center gap-lg rounded-xl bg-surface p-xl">
        <Icon name={icon} size="lg" className="text-onboarding-muted" />
        <Text tone="muted" className="text-center">{message}</Text>
      </View>
    </View>
  </SafeAreaView>;
}
