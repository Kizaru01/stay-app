import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type TextInputInstance,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Link,
  Redirect,
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useAuth, useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Icon, StatusAlert, Text, TextField } from "@/components/ui";
import { WelcomeLogo } from "@/components/ui/welcome-logo";
import { rememberAuthEntry } from "@/screens/onboarding/onboarding-storage";
import { authErrorMessage, requireAuthSuccess } from "./clerk-errors";

type Mode = "sign-up" | "sign-in";

function ProviderMark({
  provider,
}: {
  provider: "Facebook" | "Google" | "Apple";
}) {
  return (
    <Svg width={25} height={25} viewBox="0 0 24 24" aria-hidden>
      {provider === "Facebook" ? (
        <Path
          fill="white"
          d="M14 22v-9h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5L15 1c-3 0-5 2-5 5v3H7v4h3v9Z"
        />
      ) : provider === "Apple" ? (
        <Path
          fill="white"
          d="M16.5 1c.2 1.6-.5 3-1.4 3.9-.9 1-2.2 1.5-3.5 1.4-.2-1.5.5-2.9 1.4-3.8.9-.9 2.3-1.5 3.5-1.5ZM20.5 17.5c-.6 1.4-.9 2-1.7 3.1-1.1 1.6-2.6 3.5-4.4 2.5-1.6-.9-2.3-.9-4 0-1.7.9-3.1-.7-4.2-2.3C3 16.2 2.5 10.4 5.1 8c1.8-1.7 4-1.9 5.8-1 1.1.5 1.7.5 2.9 0 2.1-.9 4.7-.6 6.2 1.3-4.5 2.5-3.8 7.3.5 9.2Z"
        />
      ) : (
        <>
          <Path
            fill="#4285F4"
            d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4c2-1.8 3.1-4.4 3.1-7.7Z"
          />
          <Path
            fill="#34A853"
            d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.9-5.8-4.3H2.7v2.7A10.4 10.4 0 0 0 12 22Z"
          />
          <Path
            fill="#FBBC05"
            d="M6.2 13.6a6.2 6.2 0 0 1 0-3.2V7.7H2.7a10.1 10.1 0 0 0 0 8.6Z"
          />
          <Path
            fill="#EA4335"
            d="M12 6.1c1.5 0 2.8.5 3.8 1.5l3-3A10 10 0 0 0 12 2a10.4 10.4 0 0 0-9.3 5.7l3.5 2.7C7 8 9.3 6.1 12 6.1Z"
          />
        </>
      )}
    </Svg>
  );
}

export function AuthEntryScreen({ mode }: { mode: Mode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const creating = mode === "sign-up";
  const { onboardingStorage } = useLocalSearchParams<{
    onboardingStorage?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(window.width);
  const [viewportHeight, setViewportHeight] = useState(window.height);
  const [contentHeight, setContentHeight] = useState(0);
  const passwordInput = useRef<TextInputInstance>(null);
  const emailInput = useRef<TextInputInstance>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>();
  const [validationError, setValidationError] = useState(false);
  const [storageNotice, setStorageNotice] = useState(
    onboardingStorage === "unavailable",
  );
  useEffect(() => {
    let mounted = true;
    void rememberAuthEntry(creating ? "/sign-up" : "/sign-in").then(
      (result) => {
        if (mounted && !result.persisted) setStorageNotice(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, [creating]);
  const socialSignIn = async (provider: "Facebook" | "Google" | "Apple") => {
    if (!isLoaded || submitting.current) return;
    Keyboard.dismiss();
    setValidationError(false);
    setMessage(undefined);
    submitting.current = true;
    setBusy(true);
    const strategies = {
      Facebook: "oauth_facebook",
      Google: "oauth_google",
      Apple: "oauth_apple",
    } as const;
    try {
      const result = await startSSOFlow({ strategy: strategies[provider] });
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        router.replace("/home");
      } else if (result.signUp?.status === "missing_requirements") {
        setMessage(
          "Your provider account needs additional details. Please use email sign-up or contact support.",
        );
      } else if (
        result.signIn?.status === "needs_second_factor" ||
        result.signIn?.status === "needs_client_trust"
      ) {
        setMessage(
          "Your provider account requires additional verification. Please use email sign-in.",
        );
      }
    } catch (error) {
      setValidationError(true);
      setMessage(authErrorMessage(error));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const submit = async () => {
    if (!isLoaded || submitting.current) return;
    Keyboard.dismiss();
    const normalizedEmail = email.trim();
    setValidationError(true);
    if (creating && !name.trim()) {
      setMessage("Enter your name to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Enter a valid email address to continue.");
      return;
    }
    if (!password.trim()) {
      setMessage("Enter a password to continue.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setMessage(undefined);
    try {
      if (creating) {
        requireAuthSuccess(
          await signUp.password({ firstName: name.trim(), emailAddress: normalizedEmail, password }),
        );
        if (signUp.missingFields.length > 0) {
          setMessage(
            "This account requires additional details. Please contact support to finish signing up.",
          );
          return;
        }
        requireAuthSuccess(await signUp.verifications.sendEmailCode());
        setPassword("");
        router.push({
          pathname: "/confirm-email",
          params: { flow: "sign-up" },
        });
      } else {
        requireAuthSuccess(
          await signIn.password({ identifier: normalizedEmail, password }),
        );
        if (signIn.status === "complete") {
          requireAuthSuccess(await signIn.finalize());
          setPassword("");
          router.replace("/home");
        } else if (
          signIn.status === "needs_second_factor" ||
          signIn.status === "needs_client_trust"
        ) {
          requireAuthSuccess(await signIn.mfa.sendEmailCode());
          setPassword("");
          router.push({
            pathname: "/confirm-email",
            params: { flow: "sign-in" },
          });
        } else {
          setMessage(
            "This account requires another sign-in step. Please contact support for help.",
          );
        }
      }
    } catch (error) {
      setMessage(authErrorMessage(error));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  if (isSignedIn) return <Redirect href="/home" />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-onboarding-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      onLayout={({ nativeEvent: { layout } }) => {
        if (layout.width > 0) setContentWidth(layout.width);
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          title: creating ? "Create your account" : "Sign in",
        }}
      />
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={contentHeight > viewportHeight + 1}
        onLayout={({ nativeEvent: { layout } }) =>
          setViewportHeight(layout.height)
        }
        onContentSizeChange={(_, height) => setContentHeight(height)}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View
          style={{ width: Math.min(contentWidth, 512), flexGrow: 1 }}
          className="px-xl"
        >
          <View className="-ml-md h-14 justify-center">
            {creating ? (
              <Pressable
                onPress={() =>
                  router.replace({ pathname: "/", params: { replay: "1" } })
                }
                disabled={busy}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                className="min-h-control-sm flex-row items-center gap-sm self-start rounded-full px-md active:opacity-60"
              >
                <View className="rotate-180">
                  <Icon name="chevron" className="text-onboarding" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.replace("/sign-up")}
                accessibilityRole="button"
                accessibilityLabel="Back to create account"
                className="min-h-control-sm w-control-sm items-center justify-center rounded-full active:opacity-60"
              >
                <View className="rotate-180">
                  <Icon name="chevron" className="text-onboarding-ink" />
                </View>
              </Pressable>
            )}
          </View>
          <View className="pb-xl pt-sm">
            <WelcomeLogo compact />
          </View>
          <View className="gap-sm pb-xl">
            <Text
              variant="heading2"
              accessibilityRole="header"
              className="text-onboarding-ink"
            >
              {creating ? "Create your account" : "Welcome back"}
            </Text>
            <Text variant="bodySmall" className="text-onboarding-muted">
              {creating
                ? "Join to save your favorite stays, get personalized recommendations and more."
                : "Sign in to find your favorite stays and pick up where you left off."}
            </Text>
          </View>
          <View className="gap-lg">
            {storageNotice ? (
              <StatusAlert
                message="We couldn't save your onboarding preference on this device. You can continue, but onboarding may appear again next time."
                onDismiss={() => setStorageNotice(false)}
              />
            ) : null}
            {creating ? (
              <TextField
                label="Name"
                labelHidden
                icon="user"
                placeholder="Name"
                value={name}
                editable={!busy && isLoaded}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailInput.current?.focus()}
              />
            ) : null}
            <TextField
              ref={emailInput}
              label="Email address"
              labelHidden
              icon="mail"
              placeholder="Email address"
              value={email}
              editable={!busy && isLoaded}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordInput.current?.focus()}
            />
            <TextField
              ref={passwordInput}
              label="Password"
              labelHidden
              icon="lock"
              placeholder="Password"
              value={password}
              editable={!busy && isLoaded}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={creating ? "new-password" : "current-password"}
              textContentType={creating ? "newPassword" : "password"}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <Pressable
              onPress={submit}
              disabled={busy || !isLoaded}
              accessibilityState={{ disabled: busy || !isLoaded, busy }}
              accessibilityRole="button"
              className="min-h-control-md items-center justify-center rounded-full bg-onboarding px-xl py-md active:opacity-70"
            >
              <Text variant="button" tone="inverse">
                {busy
                  ? "Please wait…"
                  : creating
                    ? "Create account"
                    : "Sign In"}
              </Text>
            </Pressable>
            {message ? (
              <StatusAlert
                message={message}
                variant={validationError ? "error" : "info"}
                onDismiss={() => setMessage(undefined)}
              />
            ) : null}
          </View>
          <View nativeID="clerk-captcha" />
          <View className="flex-row items-center gap-lg pb-lg pt-xl">
            <View className="h-px flex-1 bg-outline/50" />
            <Text variant="caption" className="text-onboarding-muted">
              or continue with
            </Text>
            <View className="h-px flex-1 bg-outline/50" />
          </View>
          <View className="flex-row justify-center gap-3xl">
            {(["Facebook", "Google", "Apple"] as const).map((provider) => (
              <Pressable
                key={provider}
                onPress={() => socialSignIn(provider)}
                disabled={busy || !isLoaded}
                accessibilityState={{ disabled: busy || !isLoaded, busy }}
                accessibilityRole="button"
                accessibilityLabel={`Continue with ${provider}`}
                className={`h-control-md w-control-md items-center justify-center rounded-full border border-outline/50 active:opacity-60 ${provider === "Facebook" ? "bg-info" : provider === "Apple" ? "bg-ink" : "bg-white"}`}
              >
                <ProviderMark provider={provider} />
              </Pressable>
            ))}
          </View>
          <Text
            variant="caption"
            className="pt-lg text-center text-onboarding-muted"
          >
            {creating
              ? "We'll email you a code to verify your account."
              : "Sign in securely to your StayApp account."}
          </Text>
          <View className="flex-1" />
          <View className="flex-row flex-wrap items-center justify-center pt-lg">
            <Text variant="caption" className="text-onboarding-muted">
              {creating ? "Already have an account?" : "New to StayApp?"}
            </Text>
            <Link href={creating ? "/sign-in" : "/sign-up"} replace asChild>
              <Pressable
                accessibilityRole="button"
                className="min-h-control-sm justify-center px-sm"
              >
                <Text variant="buttonSmall" className="text-onboarding">
                  {creating ? "Sign In" : "Create account"}
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
