import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "@/components/ui";

type Props = {
  loading: boolean;
  error?: string;
  signOutError?: string;
  signingOut: boolean;
  onRetry: () => void;
  onSignOut?: () => void;
};

export function AccountSyncFeedback({ loading, error, signOutError, signingOut, onRetry, onSignOut }: Props) {
  return (
    <ScrollView
      style={StyleSheet.absoluteFill}
      contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
      className="bg-onboarding-paper"
      accessibilityViewIsModal
    >
      <View style={{ width: "100%", maxWidth: 384 }} className="gap-lg">
        {loading ? <ActivityIndicator accessibilityLabel="Loading your account" /> : null}
        <Text variant="heading2" className="text-center">
          {loading ? "Getting your account ready" : "Let's try again"}
        </Text>
        <Text className="text-center" accessibilityLiveRegion="polite">
          {signOutError ?? (loading ? "This should only take a moment." : error)}
        </Text>
        {error ? <Button title="Retry" loading={loading} disabled={signingOut} onPress={onRetry} /> : null}
        {onSignOut ? <Button title="Sign out" variant="ghost" loading={signingOut} onPress={onSignOut} /> : null}
      </View>
    </ScrollView>
  );
}
