import type { PropsWithChildren } from "react";
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { Icon, IconButton, Text, type IconName } from "@/components/ui";
import type { SampleReview } from "@/fixtures/property-details";

export function DetailSection({
  title,
  children,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <View className="border-t border-outline/50 py-xl gap-md">
      {title ? (
        <Text
          variant="heading2"
          accessibilityRole="header"
          className="font-lora-semibold text-onboarding-ink"
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function DetailAction({
  label,
  onPress,
  expanded,
  outline = false,
}: {
  label: string;
  onPress: () => void;
  expanded?: boolean;
  outline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      className={`min-h-control-md flex-row items-center gap-sm rounded-lg active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus ${outline ? "border border-onboarding justify-center px-lg" : "self-start"}`}
    >
      <Text variant="buttonSmall" className="font-lora-medium text-onboarding">
        {label}
      </Text>
      <View style={{ transform: [{ rotate: expanded ? "270deg" : "90deg" }] }}>
        <Icon name="chevron" size="sm" className="text-onboarding" />
      </View>
    </Pressable>
  );
}

export function DetailItem({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="flex-row items-center gap-md py-sm">
      <Icon name={icon} className="text-onboarding-ink" />
      <Text
        variant="caption"
        className="font-lora-regular flex-1 text-onboarding-muted"
      >
        {label}
      </Text>
    </View>
  );
}

export function DetailColumns({
  items,
  amenities = false,
}: {
  items: readonly { icon: IconName; label: string }[];
  amenities?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const single = width < 350 || fontScale > 1.3;
  if (amenities)
    return (
      <View className="gap-sm">
        {Array.from({ length: Math.ceil(items.length / 2) }, (_, row) => {
          const columns = 2;
          return (
            <View key={row} className="flex-row gap-lg">
              {items.slice(row * columns, (row + 1) * columns).map((item) => (
                <View key={item.label} className="flex-1 min-w-0">
                  <DetailItem {...item} />
                </View>
              ))}
              {row * columns + 1 >= items.length ? (
                <View className="flex-1" />
              ) : null}
            </View>
          );
        })}
      </View>
    );
  return (
    <View className="flex-row flex-wrap justify-between">
      {items.map((item) => (
        <View key={item.label} style={{ width: single ? "100%" : "48%" }}>
          <DetailItem {...item} />
        </View>
      ))}
    </View>
  );
}

export function ReviewCard({ review }: { review: SampleReview }) {
  return (
    <View className="gap-md py-lg border-t border-outline/50">
      <View className="flex-row items-center gap-md">
        <View className="h-control-md w-control-md rounded-full bg-success-soft items-center justify-center">
          <Text variant="button" tone="primary" className="font-lora-medium">
            {review.name.slice(0, 1)}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            variant="button"
            className="font-lora-medium text-onboarding-ink"
          >
            {review.name}
          </Text>
          <Text
            variant="caption"
            className="font-lora-regular text-onboarding-muted"
          >
            {review.date}
          </Text>
        </View>
      </View>
      <View
        className="flex-row gap-xs"
        accessibilityLabel={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Icon
            key={i}
            name="star"
            size="sm"
            filled={i < review.rating}
            className="text-onboarding"
          />
        ))}
      </View>
      <Text
        variant="bodySmall"
        className="font-lora-regular text-onboarding-muted"
      >
        {review.text}
      </Text>
    </View>
  );
}

export function DetailOverlay({
  title,
  onClose,
  children,
}: PropsWithChildren<{ title: string; onClose: () => void }>) {
  const reduced = useReducedMotion();
  return (
    <Modal
      visible
      animationType={reduced ? "none" : "fade"}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView
        className="flex-1 bg-onboarding-paper"
        accessibilityViewIsModal
        onAccessibilityEscape={onClose}
      >
        <View className="flex-row items-center gap-lg border-b border-outline/50 px-xl py-md">
          <Text
            variant="heading2"
            accessibilityRole="header"
            className="font-lora-semibold flex-1 text-onboarding-ink"
          >
            {title}
          </Text>
          <IconButton
            icon="close"
            accessibilityLabel={`Close ${title}`}
            onPress={onClose}
          />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerClassName="p-xl gap-lg"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

/** Schematic only: deliberately does not imply a verified property address. */
export function LocationPreview({ coastal }: { coastal: boolean }) {
  return (
    <View
      className="h-48 rounded-lg overflow-hidden bg-canvas"
      accessibilityLabel="Illustrative neighbourhood map, not an exact property location"
      accessibilityRole="image"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 360 144"
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width="360" height="144" fill="#eeeee7" />
        {coastal ? (
          <Path d="M0 0H130L112 40 97 62 84 100 50 144H0Z" fill="#a9dfee" />
        ) : (
          <Path d="M0 0H90L180 144H0ZM280 0H360V144H310Z" fill="#dce8d6" />
        )}
        <Path
          d="M130 0 100 72 60 144M180 0 145 70 110 144M240 0 208 70 195 144M110 35 360 80M90 95 350 130M270 0 330 144"
          stroke="white"
          strokeWidth="4"
          fill="none"
        />
        <Path
          d="m140 0 25 65 90 35 35 44"
          stroke="#d6e6d2"
          strokeWidth="12"
          fill="none"
        />
        <Circle cx="179" cy="72" r="19" fill="#0f5132" opacity="0.12" />
        <Path
          d="M179 86s-12-12-12-20a12 12 0 0 1 24 0c0 8-12 20-12 20Z"
          fill="#0b5149"
        />
        <Circle cx="179" cy="66" r="4" fill="white" />
      </Svg>
    </View>
  );
}
