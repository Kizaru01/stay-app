import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { WishlistProvider } from "@/screens/browse/wishlist-context";
import { useReducedMotion } from "react-native-reanimated";

export default function BrowseLayout() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const reducedMotion = useReducedMotion();
  if (!isLoaded) return <View className="flex-1 items-center justify-center bg-onboarding-paper"><Text accessibilityRole="progressbar">Loading your account…</Text></View>;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  return <WishlistProvider key={sessionId}><Stack screenOptions={{ headerShown: false, animation: reducedMotion ? "fade" : "default" }}>
    <Stack.Screen name="filters" options={{ presentation: "formSheet", sheetAllowedDetents: [0.8, 1], sheetGrabberVisible: true, sheetCornerRadius: 24, contentStyle: { backgroundColor: "#f7fafb" } }} />
  </Stack></WishlistProvider>;
}
