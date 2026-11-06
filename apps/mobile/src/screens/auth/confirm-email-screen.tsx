import { useCallback, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAuth, useSignIn, useSignUp } from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, TextField } from "@/components/ui";
import { WelcomeLogo } from "@/components/ui/welcome-logo";
import { authErrorMessage, requireAuthSuccess } from "./clerk-errors";
import { SignedInHandoff } from "./signed-in-handoff";

export default function ConfirmEmailScreen() {
  const params = useLocalSearchParams<{ flow?: string }>();
  const signingIn = params.flow === "sign-in";
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const email = signingIn ? signIn.identifier : signUp.emailAddress;
  const hasEmail = !!email && (signingIn
    ? signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust" || signIn.status === "complete"
    : signUp.status === "missing_requirements" || signUp.status === "complete");
  const entry = signingIn ? "/sign-in" : "/sign-up";
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

  const confirm = async () => {
    if (navigating.current || !hasEmail || !isLoaded) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter all six digits of the confirmation code.");
      return;
    }
    navigating.current = true;
    setSubmitted(true);
    setError(undefined);
    Keyboard.dismiss();
    try {
      const attempt = signingIn ? signIn : signUp;
      if (attempt.status !== "complete") {
        requireAuthSuccess(signingIn
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signUp.verifications.verifyEmailCode({ code }));
      }
      if (attempt.status !== "complete") {
        setError("Your account needs an additional verification step. Please contact support.");
        return;
      }
      requireAuthSuccess(await attempt.finalize());
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      navigating.current = false;
      setSubmitted(false);
    }
  };

  const resend = async () => {
    if (navigating.current || !hasEmail || !isLoaded) return;
    navigating.current = true;
    setSubmitted(true);
    setError(undefined);
    try {
      requireAuthSuccess(signingIn ? await signIn.mfa.sendEmailCode() : await signUp.verifications.sendEmailCode());
      setCode("");
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      navigating.current = false;
      setSubmitted(false);
    }
  };

  if (isSignedIn) return <SignedInHandoff />;

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
          <Button title={signingIn ? "Back to sign in" : "Back to sign up"} disabled={submitted} variant="ghost" onPress={() => router.replace(entry)} />
          <WelcomeLogo compact />
          <View className="gap-sm">
            <Text variant="heading2" accessibilityRole="header" className="text-onboarding-ink">Confirm your email</Text>
            <Text variant="bodySmall" className="text-onboarding-muted">
              {!isLoaded ? "Loading verification…" : hasEmail ? `Enter the six-digit code sent to ${email}.` : "Your verification session has expired. Please start again."}
            </Text>
          </View>
          {hasEmail ? (
            <>
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
                className="type-otp"
                style={{ textAlign: "center" }}
              />
              <Button title="Confirm email" loading={submitted} onPress={confirm} className="bg-onboarding" />
              <Button title="Send a new code" disabled={submitted} variant="ghost" onPress={resend} />
              <Button title="Edit email address" disabled={submitted} variant="ghost" onPress={() => router.replace(entry)} />
            </>
          ) : <Button title={signingIn ? "Go to sign in" : "Go to sign up"} disabled={!isLoaded} onPress={() => router.replace(entry)} className="bg-onboarding" />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
