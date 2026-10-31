import { View, useWindowDimensions } from "react-native";
import { Redirect, Stack, useRouter } from "expo-router";
import { useAuth, useClerk, useSession, useUser } from "@clerk/expo";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, StatusAlert, Text } from "@/components/ui";
import { authErrorMessage } from "@/screens/auth/clerk-errors";
import { WelcomeLogo } from "@/components/ui/welcome-logo";

// Property browsing remains a placeholder; identity and sessions come from Clerk.
export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  if (!isLoaded) return <View className="flex-1 items-center justify-center"><Text accessibilityRole="progressbar">Loading your account…</Text></View>;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  const logout = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View className="flex-1 items-center bg-onboarding-paper" style={{ paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) }}>
      <Stack.Screen options={{ headerShown: false, title: "Home" }} />
      <StatusBar style="dark" />
      <View style={{ width: Math.min(window.width, 512) }} className="gap-xl px-xl">
        <WelcomeLogo compact />
        <Text variant="heading1" accessibilityRole="header" className="text-onboarding-ink">Welcome to StayApp</Text>
        <Text className="text-onboarding-muted">Your next stay starts here.</Text>
        <Text>{user?.primaryEmailAddress?.emailAddress}</Text>
        <StatusAlert message={session?.currentTask ? "Your account requires an additional setup step. Please contact support before continuing." : "You're signed in. Property browsing is coming later."} />
        {error ? <StatusAlert variant="error" message={error} /> : null}
        <Button title="Sign out" loading={busy} onPress={logout} />
      </View>
    </View>
  );
}
