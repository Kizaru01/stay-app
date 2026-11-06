import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, StatusAlert, Text } from "@/components/ui";
import { useClerkUserSync } from "./clerk-user-sync-boundary";

export function SignedInHandoff() {
  const { phase, message, signingOut, retry, logout } = useClerkUserSync();
  const insets = useSafeAreaInsets();

  if (phase === "ready") return <Redirect href="/home" />;

  return (
    <View
      className="flex-1 items-center justify-center gap-lg bg-onboarding-paper px-xl"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {phase === "error" ? (
        <>
          <StatusAlert variant="error" message={message ?? "Couldn't finish setting up your account."} />
          <Button title="Try again" onPress={retry} />
          <Button title="Sign out" variant="ghost" onPress={() => void logout()} />
        </>
      ) : (
        <>
          <ActivityIndicator />
          <Text accessibilityLiveRegion="polite">
            {signingOut ? "Signing out…" : "Setting up your account…"}
          </Text>
        </>
      )}
    </View>
  );
}
