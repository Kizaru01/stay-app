import { useCallback, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, StatusAlert, Text, TextField } from "@/components/ui";
import { WelcomeLogo } from "@/components/ui/welcome-logo";
import { isPreviewEmail, mockEmailConfirmation } from "@/fixtures/mock-email-confirmation";

export default function ConfirmEmailScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";
  const hasEmail = isPreviewEmail(email);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(window.width);
  const [viewportHeight, setViewportHeight] = useState(window.height);
  const [contentHeight, setContentHeight] = useState(0);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const navigating = useRef(false);

  useFocusEffect(useCallback(() => {
    navigating.current = false;
    setSubmitted(false);
    setCode("");
    setError(undefined);
  }, []));

  const confirm = () => {
    if (navigating.current || !hasEmail) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter all six digits of the confirmation code.");
      return;
    }
    if (code !== mockEmailConfirmation.code) {
      setError("That code doesn't match. Check the preview code and try again.");
      return;
    }
    navigating.current = true;
    setSubmitted(true);
    setError(undefined);
    Keyboard.dismiss();
    router.push("/home");
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-onboarding-paper" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Stack.Screen options={{ headerShown: false, title: "Confirm your email" }} />
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={contentHeight > viewportHeight + 1}
        onLayout={({ nativeEvent: { layout } }) => { setViewportHeight(layout.height); setContentWidth(layout.width); }}
        onContentSizeChange={(_, height) => setContentHeight(height)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View style={{ width: Math.min(contentWidth, 512) }} className="gap-lg px-xl">
          <Button title="Back to sign up" variant="ghost" onPress={() => router.replace("/sign-up")} />
          <WelcomeLogo compact />
          <View className="gap-sm">
            <Text variant="heading2" accessibilityRole="header" className="text-onboarding-ink">Confirm your email</Text>
            <Text variant="bodySmall" className="text-onboarding-muted">
              {hasEmail ? `Enter the six-digit preview code for ${email}.` : "Start from sign-up with a valid email address to preview confirmation."}
            </Text>
          </View>
          {hasEmail ? (
            <>
              <StatusAlert message={`Mock email: your confirmation code is ${mockEmailConfirmation.code}. No email is sent and no real account or session is created.`} />
              <TextField
                label="Six-digit confirmation code"
                placeholder="000000"
                value={code}
                onChangeText={(value) => { setCode(value.replace(/\D/g, "").slice(0, 6)); setError(undefined); }}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={confirm}
                error={error}
                editable={!submitted}
                style={{ textAlign: "center", letterSpacing: 8, fontSize: 24 }}
              />
              <Button title="Confirm email" disabled={submitted} onPress={confirm} className="bg-onboarding" />
              <Button title="Edit email address" variant="ghost" onPress={() => router.replace("/sign-up")} />
            </>
          ) : <Button title="Go to sign up" onPress={() => router.replace("/sign-up")} className="bg-onboarding" />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
