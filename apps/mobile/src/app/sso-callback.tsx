import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui";

// ClerkProvider completes the browser auth session and returns to its opener.
export default function SSOCallback() {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-onboarding-paper px-xl">
      <Stack.Screen options={{ headerShown: false }} />
      <Text>Returning to StayApp…</Text>
      <Link href="/sign-in">Return to sign in</Link>
    </View>
  );
}
