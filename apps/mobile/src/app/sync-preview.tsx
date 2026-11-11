// Temporary visual verification route; remove after inspecting the real feedback component.
import { View } from "react-native";
import { AccountSyncFeedback } from "@/screens/auth/account-sync-feedback";

export default function SyncPreview() {
  return <View style={{ flex: 1 }}><AccountSyncFeedback loading={false} error="We couldn't connect. Check your connection and try again." signingOut={false} onRetry={() => {}} onSignOut={() => {}} /></View>;
}
