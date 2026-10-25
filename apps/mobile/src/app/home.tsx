import { View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusAlert, Text } from "@/components/ui";
import { WelcomeLogo } from "@/components/ui/welcome-logo";

// Temporary destination for the mock confirmation flow; not an authenticated area.
export default function Home() {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  return (
    <View className="flex-1 items-center bg-onboarding-paper" style={{ paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) }}>
      <Stack.Screen options={{ headerShown: false, title: "Home" }} />
      <StatusBar style="dark" />
      <View style={{ width: Math.min(window.width, 512) }} className="gap-xl px-xl">
        <WelcomeLogo compact />
        <Text variant="heading1" accessibilityRole="header" className="text-onboarding-ink">Welcome to StayApp</Text>
        <Text className="text-onboarding-muted">Your next stay starts here.</Text>
        <StatusAlert message="Home preview — email confirmation uses mock data. No real account or session has been created. Property browsing is coming later." />
      </View>
    </View>
  );
}
