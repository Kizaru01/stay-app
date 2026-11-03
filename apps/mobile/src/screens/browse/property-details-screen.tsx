import { useState } from "react";
import { HostProfileCard } from "./host-profile-card";
import {
  PropertyQuestionOptions,
  HostQuestionPreview,
  AssistantQuestionPreview,
} from "./property-questions";
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  View,
  useWindowDimensions,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, HostRow, Icon, IconButton, Text } from "@/components/ui";
import { Photo } from "@/components/ui/photo";
import { PressFeedback } from "@/components/ui/press-feedback";
import { PropertyPhotoGallery } from "@/components/ui/property-photo-gallery";
import { samplePropertyDetails } from "@/fixtures/property-details";
import { useWishlist } from "./wishlist-context";
import {
  DetailAction,
  DetailColumns,
  DetailItem,
  DetailOverlay,
  DetailSection,
  LocationPreview,
  ReviewCard,
} from "./property-details-sections";

type Overlay = "contact" | "assistant" | "host" | "reviews" | "reserve" | null;

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = samplePropertyDetails.find((item) => item.id === id);
  // Reset local expansion/overlay state when navigating to another property.
  return <PropertyDetailsContent key={id} property={property} />;
}

function PropertyDetailsContent({
  property,
}: {
  property: (typeof samplePropertyDetails)[number] | undefined;
}) {
  const router = useRouter();
  const { savedIds, setSaved } = useWishlist();
  const [hostDraft, setHostDraft] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const { width, fontScale } = useWindowDimensions();
  const narrow = width < 350 || fontScale > 1.3;
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/home");
  if (!property)
    return (
      <SafeAreaView className="flex-1 bg-onboarding-paper p-xl gap-xl justify-center">
        <Text variant="heading1">Stay not found</Text>
        <Text tone="muted">This sample property is no longer available.</Text>
        <Button title="Back to stays" onPress={back} />
      </SafeAreaView>
    );
  const favorite = savedIds.has(property.id);
  const arrivalRules = property.rules.filter(
    (rule) => rule.startsWith("Check-in:") || rule.startsWith("Check-out:"),
  );
  const houseRules = property.rules.filter(
    (rule) => !arrivalRules.includes(rule),
  );
  const close = () => setOverlay(null);
  const titles = {
    contact: "Contact host",
    assistant: "Ask AI assistant",
    host: `Meet ${property.host.name}`,
    reviews: "Guest reviews",
    reserve: "Your stay",
  };
  async function share() {
    try {
      await Share.share({
        message: `${property!.title} — ${property!.location}. Sample stay on StayApp, ${property!.nightlyPrice} per night. Illustrative content.`,
      });
    } catch {
      Alert.alert("Unable to share", "Please try again in a moment.");
    }
  }
  async function openMaps() {
    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property!.location)}`,
      );
    } catch {
      Alert.alert(
        "Couldn’t open maps",
        `Search for ${property!.location} in your maps app.`,
      );
    }
  }
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-onboarding-paper"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-lg"
        accessibilityElementsHidden={overlay !== null}
        importantForAccessibility={overlay ? "no-hide-descendants" : "auto"}
      >
        <View>
          <PropertyPhotoGallery
            photos={property.photos}
            source={property.image}
            description={property.imageDescription}
            title={property.title}
            aspectRatio={narrow ? 1.12 : 1.55}
            detail
          />
          <View className="absolute top-lg left-lg">
            <IconButton
              icon="chevron"
              accessibilityLabel="Back to stays"
              onPress={back}
              style={{ transform: [{ rotate: "180deg" }] }}
              className="border-0 shadow-card"
            />
          </View>
          <View className="absolute top-lg right-lg flex-row gap-md">
            <IconButton
              icon="share"
              accessibilityLabel="Share property"
              onPress={share}
              className="border-0 shadow-card"
            />
            <IconButton
              icon="heart"
              selected={favorite}
              accessibilityLabel={
                favorite ? "Remove from wishlist" : "Save to wishlist"
              }
              onPress={() => setSaved(property.id, !favorite)}
              className="border-0 shadow-card"
            />
          </View>
        </View>
        <View className="px-xl">
          <View className="pt-lg pb-lg gap-xs">
            <Text
              variant="heading2"
              accessibilityRole="header"
              className="font-lora-semibold text-onboarding-ink"
            >
              {property.title}
            </Text>
            <View className="flex-row items-center gap-sm">
              <Icon name="pin" size="sm" className="text-onboarding-muted" />
              <Text
                variant="bodySmall"
                className="font-lora-regular flex-1 text-onboarding-ink"
              >
                {property.location}
              </Text>
            </View>
            <View className="flex-row flex-wrap items-center gap-md">
              <PressFeedback
                accessibilityRole="button"
                accessibilityLabel={`Read ${property.reviewCount} sample reviews, rated ${property.rating} out of 5`}
                onPress={() => setOverlay("reviews")}
                className="min-h-control-md justify-center"
              >
                <View className="flex-row items-center gap-sm">
                  <Icon
                    name="star"
                    size="sm"
                    filled
                    className="text-onboarding-muted"
                  />
                  <Text
                    variant="bodySmall"
                    className="font-lora-semibold text-onboarding-ink"
                  >
                    {property.rating.toFixed(1)} · {property.reviewCount}{" "}
                    reviews
                  </Text>
                </View>
              </PressFeedback>
              <View className="rounded-full bg-success-soft px-md py-xs flex-row items-center gap-sm">
                <Icon name="crown" size="sm" className="text-onboarding" />
                <Text
                  variant="caption"
                  className="font-lora-medium text-onboarding"
                >
                  Guest favorite
                </Text>
              </View>
            </View>
            <Text
              variant="bodySmall"
              className="font-lora-regular text-onboarding-muted"
            >
              {property.guests} guests · {property.bedrooms} bedrooms ·{" "}
              {property.beds} beds · {property.bathrooms} bathrooms
            </Text>
          </View>
          <View className="border-t border-outline/50 py-md">
            <HostRow
              {...property.host}
              bordered={false}
              onPress={() => setOverlay("host")}
            />
          </View>
          <DetailSection title="About this place">
            <Text
              variant="bodySmall"
              className="font-lora-regular text-onboarding-muted"
            >
              {property.introduction}
            </Text>
            {descriptionExpanded ? (
              <Text
                variant="bodySmall"
                className="font-lora-regular text-onboarding-muted"
              >
                {property.fullDescription}
              </Text>
            ) : null}
            <DetailAction
              label={descriptionExpanded ? "Show less" : "Show more"}
              expanded={descriptionExpanded}
              onPress={() => setDescriptionExpanded((value) => !value)}
            />
          </DetailSection>
          <DetailSection title="What this place offers">
            <DetailColumns
              amenities
              items={
                amenitiesExpanded
                  ? property.amenities
                  : property.amenities.slice(0, 8)
              }
            />
            <DetailAction
              outline
              label={
                amenitiesExpanded
                  ? "Show fewer amenities"
                  : `Show all ${property.amenities.length} amenities`
              }
              expanded={amenitiesExpanded}
              onPress={() => setAmenitiesExpanded((value) => !value)}
            />
          </DetailSection>
          <DetailSection title="Need help before booking?">
            <PropertyQuestionOptions
              hostName={property.host.name}
              onSelect={setOverlay}
            />
          </DetailSection>
          <DetailSection title="Where you’ll be">
            <LocationPreview coastal={property.category === "beach"} />
            <Text
              variant="bodySmall"
              className="font-lora-regular text-onboarding-muted"
            >
              {property.locationNote}
            </Text>
            <Text
              variant="caption"
              className="font-lora-regular text-onboarding-muted"
            >
              Illustrative map · Approximate area only
            </Text>
            <DetailAction label="Explore the area in Maps" onPress={openMaps} />
          </DetailSection>
          <DetailSection title="What guests say">
            <View className="flex-row flex-wrap gap-y-lg">
              <View
                style={{ width: narrow ? "100%" : "28%" }}
                className="gap-xs"
              >
                <View className="flex-row gap-sm items-center">
                  <Text
                    variant="heading1"
                    className="font-lora-bold text-onboarding-ink"
                  >
                    {property.rating.toFixed(1)}
                  </Text>
                  <Icon name="star" filled className="text-onboarding" />
                </View>
                <Text
                  variant="caption"
                  className="font-lora-regular text-onboarding-muted"
                >
                  out of 5 · {property.reviewCount} reviews
                </Text>
              </View>
              {property.reviewCategories.map((category) => (
                <View
                  key={category.label}
                  className="gap-sm border-l border-outline/50 pl-md"
                  style={{ width: narrow ? "33.33%" : "24%" }}
                >
                  <Icon
                    name={category.icon}
                    size="sm"
                    className="text-onboarding-ink"
                  />
                  <Text
                    variant="caption"
                    className="font-lora-regular text-onboarding-muted"
                  >
                    {category.label}
                  </Text>
                  <Text
                    variant="buttonSmall"
                    className="font-lora-medium text-onboarding-ink"
                  >
                    {category.value.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
            <ReviewCard review={property.reviews[0]} />
            <DetailAction
              outline
              label={`Read ${property.reviewCount} reviews`}
              onPress={() => setOverlay("reviews")}
            />
          </DetailSection>
          <DetailSection title="Things to know">
            <View className="gap-sm">
              <Text
                variant="buttonSmall"
                className="font-lora-medium text-onboarding-ink"
              >
                Check-in &amp; check-out
              </Text>
              <DetailColumns
                items={arrivalRules.map((label) => ({ icon: "clock", label }))}
              />
            </View>
            <View className="gap-xs">
              <Text
                variant="buttonSmall"
                className="font-lora-medium text-onboarding-ink"
              >
                House rules
              </Text>
              <Text
                variant="bodySmall"
                className="font-lora-regular text-onboarding-muted"
              >
                {houseRules.join(" · ")}
              </Text>
            </View>
            <View className="gap-xs">
              <Text
                variant="buttonSmall"
                className="font-lora-medium text-onboarding-ink"
              >
                Cancellation
              </Text>
              <Text
                variant="bodySmall"
                className="font-lora-regular text-onboarding-muted"
              >
                Sample policy: {property.cancellationPolicy}
              </Text>
            </View>
          </DetailSection>
          <Text
            variant="caption"
            className="font-lora-regular text-onboarding-muted pb-lg"
          >
            Sample stay · Photos, host, prices, amenities and reviews are
            illustrative.
          </Text>
        </View>
      </ScrollView>
      <SafeAreaView
        edges={["bottom"]}
        className="border-t border-outline/60 rounded-t-xl bg-onboarding-paper"
        accessibilityElementsHidden={overlay !== null}
        importantForAccessibility={overlay ? "no-hide-descendants" : "auto"}
      >
        <View
          className={`px-xl py-lg gap-lg ${narrow ? "" : "flex-row items-center"}`}
        >
          <View className={`gap-xs ${narrow ? "" : "flex-1"}`}>
            <Text
              variant="heading2"
              className="font-lora-semibold text-onboarding-ink"
            >
              {property.nightlyPrice}
              <Text
                variant="bodySmall"
                className="font-lora-regular text-onboarding-muted"
              >
                {" "}
                / night
              </Text>
            </Text>
            <Text
              variant="caption"
              className="font-lora-regular text-onboarding-muted"
            >
              Before taxes · Sample price
            </Text>
          </View>
          <PressFeedback
            accessibilityRole="button"
            accessibilityLabel="Reserve, view sample booking details"
            onPress={() => setOverlay("reserve")}
            className={narrow ? "w-full" : "w-1/2"}
          >
            <View className="min-h-control-lg rounded-full bg-onboarding items-center justify-center px-xl py-md">
              <Text
                variant="button"
                tone="inverse"
                className="font-lora-semibold"
              >
                Reserve
              </Text>
            </View>
          </PressFeedback>
        </View>
      </SafeAreaView>
      {overlay ? (
        <DetailOverlay title={titles[overlay]} onClose={close}>
          {overlay === "contact" ? (
            <HostQuestionPreview
              property={property}
              draft={hostDraft}
              onDraftChange={setHostDraft}
            />
          ) : null}
          {overlay === "assistant" ? (
            <AssistantQuestionPreview
              property={property}
              onContactHost={() => setOverlay("contact")}
            />
          ) : null}
          {overlay === "host" ? <HostProfileCard host={property.host} /> : null}
          {overlay === "reviews" ? (
            <>
              <Text
                variant="heading1"
                className="font-lora-bold text-onboarding-ink"
              >
                ★ {property.rating.toFixed(1)} · {property.reviewCount} reviews
              </Text>
              <Text
                variant="bodySmall"
                tone="muted"
                className="font-lora-regular"
              >
                A selection of illustrative guest reviews. Counts and ratings
                are sample content.
              </Text>
              {property.reviews.map((review) => (
                <ReviewCard key={review.name} review={review} />
              ))}
            </>
          ) : null}
          {overlay === "reserve" ? (
            <>
              <Photo
                source={property.image}
                label={property.imageDescription}
                className="w-full h-48 rounded-lg"
              />
              <Text
                variant="heading2"
                className="font-lora-semibold text-onboarding-ink"
              >
                {property.title}
              </Text>
              <Text
                variant="bodySmall"
                tone="muted"
                className="font-lora-regular"
              >
                {property.location}
              </Text>
              <DetailItem
                icon="users"
                label={`Up to ${property.guests} guests · ${property.bedrooms} bedrooms`}
              />
              <DetailSection title="Booking preview">
                <Text
                  variant="heading2"
                  tone="primary"
                  className="font-lora-semibold"
                >
                  {property.nightlyPrice} / night
                </Text>
                <Text className="font-lora-regular text-onboarding-muted">
                  This is a sample stay. Dates, live availability, taxes and
                  booking are not connected yet. No reservation has been made.
                </Text>
              </DetailSection>
              <Button title="Continue exploring" onPress={close} />
            </>
          ) : null}
        </DetailOverlay>
      ) : null}
    </SafeAreaView>
  );
}
