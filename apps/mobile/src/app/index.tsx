import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import OnboardingScreen from "@/screens/onboarding/onboarding-screen";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/home" />;
  return <OnboardingScreen />;
}
