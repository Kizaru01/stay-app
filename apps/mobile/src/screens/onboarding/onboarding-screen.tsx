import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  BackHandler,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from "react-native";
import { Image } from "expo-image";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Icon, StatusAlert, Text } from "@/components/ui";
import Animated, {
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { WelcomeLogo } from "@/components/ui/welcome-logo";
import {
  completeOnboarding,
  readOnboardingVisit,
  type AuthEntry,
  type OnboardingVisit,
} from "./onboarding-storage";

const photos = {
  villa: require("../../../assets/images/onboarding/villa.png"),
  cabin: require("../../../assets/images/onboarding/cabin.png"),
  balcony: require("../../../assets/images/onboarding/balcony.png"),
  map: require("../../../assets/images/onboarding/map.png"),
};
const slides = [
  {
    title: "More than just a place to stay",
    body: "Discover beautiful homes, cozy cabins and unique stays around the world.",
  },
  {
    title: "Stays for every kind of trip",
    body: "From beach getaways to mountain cabins, find a stay that fits your vibe.",
  },
  {
    title: "Relax, you’re in good hands",
    body: "Safe bookings, trusted hosts, and 24/7 support — so you can focus on what matters.",
  },
  {
    title: "Explore with ease",
    body: "Get local insights, nearby attractions, and easy directions to make the most of your stay.",
  },
];

/** Native SVG gradients require concrete stop colors; currentColor is not supported
 * by react-native-svg's gradient extractor. This matches --color-onboarding-deep. */
function PhotoShade() {
  return (
    <Svg
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
      aria-hidden
    >
      <Defs>
        <LinearGradient id="photo-shade" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="35%" stopColor="#002d28" stopOpacity={0} />
          <Stop offset="72%" stopColor="#002d28" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#002d28" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#photo-shade)" />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const { step, replay } = useLocalSearchParams<{
    step?: string;
    replay?: string;
  }>();
  const parsed = Number(step ?? 0);
  const initial = Number.isInteger(parsed)
    ? Math.max(0, Math.min(3, parsed))
    : 0;
  const [visit, setVisit] = useState<OnboardingVisit>();
  useEffect(() => {
    let mounted = true;
    void readOnboardingVisit().then((result) => {
      if (mounted) setVisit(result);
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!visit)
    return (
      <View className="flex-1 items-center justify-center bg-onboarding-paper">
        <Stack.Screen options={{ headerShown: false }} />
        <Text variant="caption" tone="muted" accessibilityRole="progressbar">
          Getting ready…
        </Text>
      </View>
    );
  if (visit.completed && replay !== "1") return <Redirect href={visit.entry} />;
  return (
    <OnboardingPager
      key={initial}
      initial={initial}
      storageAvailable={visit.storageAvailable}
    />
  );
}

function PaginationDot({
  index,
  progress,
  selected,
  onPress,
}: {
  index: number;
  progress: SharedValue<number>;
  selected: boolean;
  onPress: () => void;
}) {
  const activeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - Math.abs(progress.get() - index)),
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Introduction ${index + 1} of ${slides.length}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="h-control-sm w-control-sm items-center justify-center"
    >
      <View className="h-2 w-2 overflow-hidden rounded-full bg-white/35">
        <Animated.View
          className="absolute inset-0 rounded-full bg-white"
          style={activeStyle}
        />
      </View>
    </Pressable>
  );
}

function OnboardingPager({
  initial,
  storageAvailable,
}: {
  initial: number;
  storageAvailable: boolean;
}) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewport, setViewport] = useState({
    width: window.width,
    height: window.height,
  });
  const [current, setCurrent] = useState(initial);
  const [footerHeight, setFooterHeight] = useState(160 + insets.bottom);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showStorageNotice, setShowStorageNotice] = useState(!storageAvailable);
  const [leaving, setLeaving] = useState(false);
  const exitStarted = useRef(false);
  const pager = useRef<ScrollViewInstance>(null);
  const selected = useRef(initial);
  const progress = useSharedValue(initial);
  const commit = useCallback((page: number) => {
    selected.current = page;
    setCurrent(page);
  }, []);
  const onScroll = useAnimatedScrollHandler((event) => {
    progress.set(
      Math.max(0, Math.min(3, event.contentOffset.x / viewport.width)),
    );
  });
  useAnimatedReaction(
    () => Math.round(progress.get()),
    (page, previous) => {
      if (page !== previous) scheduleOnRN(commit, page);
    },
    [commit],
  );
  const go = (page: number) => {
    if (exitStarted.current) return;
    selected.current = page;
    if (reduceMotion) {
      progress.set(page);
      commit(page);
    }
    pager.current?.scrollTo({
      x: page * viewport.width,
      animated: !reduceMotion,
    });
  };
  const finish = async (destination: AuthEntry) => {
    if (exitStarted.current) return;
    exitStarted.current = true;
    setLeaving(true);
    const result = await completeOnboarding(destination);
    router.replace({
      pathname: destination,
      params: result.persisted ? {} : { onboardingStorage: "unavailable" },
    });
  };
  useEffect(() => {
    pager.current?.scrollTo({
      x: selected.current * viewport.width,
      animated: false,
    });
  }, [viewport.width]);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selected.current === 0) return false;
        const previous = selected.current - 1;
        selected.current = previous;
        if (reduceMotion) {
          progress.set(previous);
          commit(previous);
        }
        pager.current?.scrollTo({
          x: previous * viewport.width,
          animated: !reduceMotion,
        });
        return true;
      },
    );
    return () => subscription.remove();
  }, [viewport.width, reduceMotion, progress, commit]);

  return (
    <View className="flex-1 bg-onboarding-paper" style={{ width: "100%" }}>
      <Stack.Screen
        options={{ headerShown: false, title: "Welcome to StayApp" }}
      />
      <StatusBar style="light" />
      <View
        style={{ flex: 1 }}
        onLayout={({ nativeEvent: { layout } }) => {
          if (layout.width > 0 && layout.height > 0)
            setViewport((previous) =>
              previous.width === layout.width &&
              previous.height === layout.height
                ? previous
                : { width: layout.width, height: layout.height },
            );
        }}
      >
        <Animated.ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          style={{ flex: 1 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, page) => (
            <OnboardingPage
              key={slide.title}
              current={page}
              active={page === current}
              width={viewport.width}
              height={viewport.height}
              footerHeight={footerHeight}
            />
          ))}
        </Animated.ScrollView>
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", top: insets.top, right: 24 }}
        >
          <Pressable
            disabled={leaving}
            accessibilityState={{ disabled: leaving, busy: leaving }}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding and create an account"
            onPress={() => finish("/sign-up")}
            className="min-h-control-sm min-w-control-lg items-center justify-center rounded-full bg-onboarding/80 px-lg"
          >
            <Text variant="buttonSmall" className="text-white">
              Skip
            </Text>
          </Pressable>
        </View>
      </View>
      <View
        onLayout={({ nativeEvent: { layout } }) =>
          setFooterHeight(layout.height)
        }
        className="absolute inset-x-0 bottom-0 items-center px-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {showStorageNotice ? (
          <StatusAlert
            message="Device storage is unavailable. You can continue, but onboarding may appear again next time."
            onDismiss={() => setShowStorageNotice(false)}
          />
        ) : null}
        <View
          className="flex-row justify-center"
          accessibilityLabel={`Introduction ${current + 1} of ${slides.length}`}
        >
          {slides.map((slide, index) => (
            <PaginationDot
              key={slide.title}
              index={index}
              progress={progress}
              selected={current === index}
              onPress={() => go(index)}
            />
          ))}
        </View>
        <View style={{ width: "100%", maxWidth: 464, minHeight: 48 }}>
          {current === slides.length - 1 ? (
            <Pressable
              disabled={leaving}
              accessibilityState={{ disabled: leaving, busy: leaving }}
              accessibilityRole="button"
              onPress={() => finish("/sign-up")}
              className="min-h-control-md flex-row items-center justify-center gap-md rounded-full bg-white px-xl py-md active:opacity-70"
            >
              <Text variant="button" className="text-onboarding">
                {leaving ? "Opening…" : "Get Started"}
              </Text>
              <Icon name="arrow" size="sm" className="text-onboarding" />
            </Pressable>
          ) : null}
        </View>
        <View className="flex-row flex-wrap items-center justify-center">
          <Text variant="caption" className="text-white/80">
            Already have an account?
          </Text>
          <Pressable
            disabled={leaving}
            accessibilityState={{ disabled: leaving, busy: leaving }}
            accessibilityRole="button"
            onPress={() => finish("/sign-in")}
            className="min-h-control-sm justify-center px-sm"
          >
            <Text variant="buttonSmall" className="text-white">
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function OnboardingPage({
  current,
  active,
  width,
  height,
  footerHeight,
}: {
  current: number;
  active: boolean;
  width: number;
  height: number;
  footerHeight: number;
}) {
  const insets = useSafeAreaInsets();
  const available = Math.max(400, height - insets.top - footerHeight);
  const background = [photos.villa, photos.cabin, photos.balcony, photos.map][
    current
  ];
  return (
    <View
      style={{ width, height, flexShrink: 0, overflow: "hidden" }}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      aria-hidden={!active}
      className="bg-onboarding-deep"
    >
      <Image
        source={background}
        contentFit="cover"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <PhotoShade />
      <ScrollView
        style={{ width, flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: footerHeight + 24,
        }}
      >
        <View
          style={{
            width: Math.min(width, 512),
            minHeight: available - 24,
            flexGrow: 1,
          }}
        >
          {current === 0 ? (
            <View
              className="items-center gap-sm"
              style={{ paddingTop: Math.max(56, available * 0.1) }}
            >
              <WelcomeLogo inverse />
              <Text variant="bodySmall" className="text-white">
                Find your perfect stay
              </Text>
            </View>
          ) : null}
          <View className="flex-1" style={{ minHeight: available * 0.35 }} />
          <View
            className="gap-md px-xl pt-xl"
            style={{ width: "100%", flexShrink: 0 }}
          >
            <Text
              variant="heading1"
              accessibilityRole="header"
              style={{ width: "100%" }}
              className="text-white"
            >
              {slides[current].title}
            </Text>
            <Text
              variant="body"
              style={{ width: "100%" }}
              className="text-white/90"
            >
              {slides[current].body}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
