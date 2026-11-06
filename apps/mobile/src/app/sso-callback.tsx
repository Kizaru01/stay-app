import { Link, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { SignedInHandoff } from "@/screens/auth/signed-in-handoff";

// ClerkProvider completes the browser auth session and returns to its opener.
export default function SSOCallback() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <SignedInHandoff />;

  return (
    <View className="flex-1 items-center justify-center gap-lg bg-onboarding-paper px-xl">
      <Stack.Screen options={{ headerShown: false }} />
      <Text>Returning to StayApp…</Text>
      <Link href="/sign-in" className="type-button-sm">Return to sign in</Link>
    </View>
  );
}
