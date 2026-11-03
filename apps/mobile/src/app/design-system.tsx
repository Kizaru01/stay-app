import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import {
  BottomNavigation,
  SearchBar,
  StatusAlert,
  FeatureCard,
  HostRow,
  ListingCard,
  RatingSummary,
  Brand,
  Button,
  Chip,
  Icon,
  IconButton,
  Surface,
  Text,
  TextField,
  type IconName,
  type NavigationItem,
} from "@/components/ui";

import { demoHost, demoListings } from "@/fixtures/design-system";

const palette = [
  ["Primary", "#0F5132", "bg-primary"],
  ["Primary Light", "#1E6B4B", "bg-primary-light"],
  ["Secondary", "#0EA5E9", "bg-secondary"],
  ["Accent", "#F59E0B", "bg-accent"],
  ["Neutral 900", "#111827", "bg-neutral-900"],
  ["Neutral 600", "#6B7280", "bg-neutral-600"],
  ["Neutral 300", "#D1D5DB", "bg-neutral-300"],
  ["Neutral 100", "#F3F4F6", "bg-neutral-100"],
  ["White", "#FFFFFF", "bg-white"],
] as const;
const categories: { label: string; icon: IconName }[] = [
  { label: "All", icon: "grid" },
  { label: "Cabins", icon: "cabin" },
  { label: "Beach", icon: "beach" },
  { label: "City", icon: "city" },
  { label: "Unique", icon: "tent" },
  { label: "Experiences", icon: "sparkle" },
];
const icons: IconName[] = [
  "home",
  "heart",
  "bag",
  "message",
  "user",
  "search",
  "filters",
  "pin",
  "share",
  "calendar",
  "bed",
  "wifi",
  "snow",
  "pool",
  "star",
  "shield",
  "headset",
  "crown",
  "check",
  "alert",
  "info",
];

const navigationItems: readonly NavigationItem[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "wishlist", label: "Wishlist", icon: "heart" },
  { key: "trips", label: "Trips", icon: "bag" },
  { key: "messages", label: "Messages", icon: "message" },
  { key: "profile", label: "Profile", icon: "user" },
];
const alertExamples = [
  {
    id: "success",
    variant: "success",
    message: "Account created successfully",
  },
  {
    id: "error",
    variant: "error",
    message: "Something went wrong. Please try again.",
  },
  { id: "info", variant: "info", message: "Your booking is confirmed!" },
] as const;

export default function DesignSystem() {
  const [showListingImage, setShowListingImage] = useState(true);
  const [selectedTab, setSelectedTab] = useState("home");
  const [search, setSearch] = useState("");
  const [searchAction, setSearchAction] = useState(
    "Enter a destination or open the filter demo.",
  );
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [demoAction, setDemoAction] = useState(
    "Select a card to preview its action.",
  );
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("La Union, Philippines");
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <>
      <Stack.Screen options={{ title: "Design system" }} />
      <ScrollView
        className="flex-1 bg-canvas"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="p-lg gap-lg pb-3xl"
      >
        <Text tone="muted" variant="caption">
          Reference sections 1–15 · interactive component catalogue · temporary
          demo content
        </Text>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            01. Brand
          </Text>
          <Brand />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            02. Color palette
          </Text>
          <View className="flex-row flex-wrap gap-lg">
            {palette.map(([label, hex, fill]) => (
              <View key={label} className="w-28 gap-xs">
                <View
                  className={`h-control-lg rounded-sm border border-outline ${fill}`}
                />
                <Text variant="caption">{label}</Text>
                <Text variant="caption" tone="muted">
                  {hex}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            03. Typography
          </Text>
          <Text variant="metadata" tone="muted">Fraunces · editorial / Manrope · reading and interface</Text>
          <Text variant="display">Stay for every kind of trip</Text>
          <Text variant="heading1">Seaside Villa with Private Pool</Text>
          <Text variant="heading2">What guests say</Text>
          <Text variant="cardTitle">A coastal escape near the ocean</Text>
          <Text variant="cardTitleSmall">Mountain cabin with a private terrace</Text>
          <Text variant="location" tone="muted">San Juan, La Union, Philippines</Text>
          <Text variant="personName">Hosted by María</Text>
          <Text variant="personNameSmall">José · Guest review</Text>
          <Text variant="metadata" tone="muted">Superhost · 4 years hosting · October 2026</Text>
          <Text>
            Beautiful place! The villa is even better in person. We loved the
            private pool and the ocean view. María’s recommendations made our
            family weekend extra special.
          </Text>
          <Text variant="bodySmall">A quiet place for café mornings and beach walks.</Text>
          <Text variant="amenity">Private pool · Beach access · Free Wi-Fi</Text>
          <Text variant="ratingDisplay">4.8</Text>
          <Text variant="rating">4.8 · 192 reviews</Text>
          <Text variant="price">₱12,500<Text variant="bodySmall" tone="muted"> / night</Text></Text>
          <Text variant="priceSmall">₱8,250<Text variant="caption" tone="muted"> / night</Text></Text>
          <Text variant="label">Check-in &amp; check-out</Text>
          <Text variant="caption" tone="muted">Sample stay · Photos and prices are illustrative.</Text>
          <Text variant="button">Read 192 reviews</Text>
          <Text variant="buttonSmall">Show all 12 amenities</Text>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            04. Buttons
          </Text>
          <Button
            title="Get Started"
            icon="arrow"
            onPress={() => setLoading(true)}
            loading={loading}
          />
          {loading ? (
            <Button
              title="Reset loading demo"
              variant="ghost"
              onPress={() => setLoading(false)}
            />
          ) : null}
          <Button
            title="View all stays"
            variant="secondary"
            onPress={() => setDemoAction("Demo: View all stays selected.")}
          />
          <Button
            title="See all"
            variant="ghost"
            icon="arrow"
            onPress={() => setDemoAction("Demo: See all selected.")}
          />
          <View className="flex-row flex-wrap gap-sm">
            <Button title="Disabled" disabled />
            <Button title="Disabled" variant="secondary" disabled />
            <Button title="See all" variant="ghost" disabled />
          </View>
          <View className="flex-row flex-wrap gap-sm">
            <IconButton
              icon="heart"
              accessibilityLabel="Favorite demo"
              selected={favorite}
              onPress={() => setFavorite(!favorite)}
            />
            <IconButton
              icon="share"
              accessibilityLabel="Share demo"
              onPress={() => setDemoAction("Demo: Share action selected.")}
            />
            <IconButton
              icon="bookmark"
              accessibilityLabel="Save demo"
              onPress={() => setDemoAction("Demo: Save action selected.")}
            />
            <IconButton
              icon="bookmark"
              accessibilityLabel="Save unavailable"
              disabled
            />
          </View>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            05. Input fields
          </Text>
          <TextField
            label="Search"
            icon="search"
            placeholder="Where are you going?"
          />
          <TextField
            label="Location"
            icon="pin"
            value={location}
            onChangeText={setLocation}
            onClear={() => setLocation("")}
          />
          <TextField
            label="Email address"
            icon="mail"
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="Full name"
            icon="user"
            defaultValue="Joanna Smith"
          />
          <TextField
            label="Password"
            icon="lock"
            secureTextEntry
            defaultValue="stayexample"
          />
          <TextField
            label="Email with error"
            icon="mail"
            defaultValue="invalid"
            error="Enter a valid email address."
          />
          <TextField
            label="Disabled field"
            placeholder="Unavailable"
            editable={false}
          />
          <TextField
            label="Confirmation code · typography preview"
            defaultValue="012345"
            keyboardType="number-pad"
            maxLength={6}
            className="type-otp"
            style={{ textAlign: "center" }}
          />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            06. Category chips
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            {categories.map((item) => (
              <Chip
                key={item.label}
                {...item}
                selected={category === item.label}
                onPress={() => setCategory(item.label)}
              />
            ))}
          </View>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            07. Listing card (Horizontal)
          </Text>
          <Text variant="caption" tone="muted">
            Temporary demo content · sample photography
          </Text>
          <ListingCard
            listing={demoListings[0]}
            variant="horizontal"
            favorite={!!saved[demoListings[0].id]}
            onFavoriteChange={(value) =>
              setSaved((current) => ({
                ...current,
                [demoListings[0].id]: value,
              }))
            }
            onPress={() => setDemoAction("Demo: Seaside Villa selected.")}
          />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            08. Listing card (Grid)
          </Text>
          <View className="w-full max-w-96">
            <ListingCard
              listing={{
                ...demoListings[1],
                image: showListingImage ? demoListings[1].image : undefined,
              }}
              favorite={!!saved[demoListings[1].id]}
              onFavoriteChange={(value) =>
                setSaved((current) => ({
                  ...current,
                  [demoListings[1].id]: value,
                }))
              }
              onPress={() => setDemoAction("Demo: Modern Cabin selected.")}
            />
          </View>
          <Button
            title={
              showListingImage ? "Show image fallback" : "Restore listing image"
            }
            variant="ghost"
            onPress={() => setShowListingImage(!showListingImage)}
          />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            09. Profile / Host
          </Text>
          <HostRow
            {...demoHost}
            onPress={() =>
              setDemoAction("Demo: Maria’s host profile selected.")
            }
          />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            10. Rating component
          </Text>
          <RatingSummary
            rating={4.8}
            reviewCount={192}
            categories={[
              { label: "Cleanliness", score: 4.9, icon: "sparkle" },
              { label: "Location", score: 4.8, icon: "pin" },
              { label: "Check-in", score: 4.8, icon: "bag" },
            ]}
          />
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            11. Bottom navigation (Mobile)
          </Text>
          <BottomNavigation
            items={navigationItems}
            selectedKey={selectedTab}
            onSelect={setSelectedTab}
          />
          <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
            Selected tab:{" "}
            {navigationItems.find((item) => item.key === selectedTab)?.label}.
            Demo only.
          </Text>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            12. Top search bar (Mobile)
          </Text>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFiltersPress={() =>
              setSearchAction("Demo: Search filters selected.")
            }
            onSubmitEditing={() =>
              setSearchAction(
                search.trim()
                  ? "Demo search submitted for " + search.trim() + "."
                  : "Enter a destination to search.",
              )
            }
          />
          <Text
            variant="caption"
            tone="muted"
            accessibilityLiveRegion="polite"
            role="status"
          >
            {searchAction}
          </Text>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            13. Iconography
          </Text>
          <View className="flex-row flex-wrap gap-lg">
            {icons.map((name) => (
              <View key={name} className="items-center gap-xs">
                <Icon name={name} />
                <Text variant="caption" tone="muted">
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            14. Policy / Feature cards
          </Text>
          <View className="flex-row flex-wrap gap-md">
            <FeatureCard
              icon="shield"
              tone="safety"
              className="flex-1 min-w-60"
              accessibilityLabel="View safe bookings policy"
              onPress={() =>
                setDemoAction("Demo: Safe bookings policy selected.")
              }
            >
              <Text variant="buttonSmall">Safe bookings</Text>
              <Text variant="caption" tone="muted">
                Secure payments and verified hosts.
              </Text>
            </FeatureCard>
            <FeatureCard
              icon="headset"
              tone="support"
              className="flex-1 min-w-60"
              accessibilityLabel="View support options"
              onPress={() => setDemoAction("Demo: Support options selected.")}
            >
              <Text variant="buttonSmall">24/7 support</Text>
              <Text variant="caption" tone="muted">
                We’re here whenever you need us.
              </Text>
            </FeatureCard>
            <FeatureCard
              icon="crown"
              tone="favorite"
              className="flex-1 min-w-60"
              accessibilityLabel="Learn about guest favorites"
              onPress={() =>
                setDemoAction("Demo: Guest favorite details selected.")
              }
            >
              <Text variant="buttonSmall">Guest favorite</Text>
              <Text variant="caption" tone="muted">
                Loved by travelers around the world.
              </Text>
            </FeatureCard>
          </View>
        </Surface>
        <Surface>
          <Text accessibilityRole="header" variant="button">
            15. Status / Alerts
          </Text>
          <Text variant="caption" tone="muted">
            Sample messages only; no account or booking was created.
          </Text>
          {alertExamples
            .filter((alert) => !dismissedAlerts.includes(alert.id))
            .map((alert) => (
              <StatusAlert
                key={alert.id}
                variant={alert.variant}
                message={alert.message}
                dismissLabel={"Dismiss " + alert.id + " example"}
                onDismiss={() =>
                  setDismissedAlerts((current) => [...current, alert.id])
                }
              />
            ))}
          {dismissedAlerts.length > 0 ? (
            <Button
              title="Restore alert examples"
              variant="ghost"
              onPress={() => setDismissedAlerts([])}
            />
          ) : null}
        </Surface>
        <Text
          accessibilityLiveRegion="polite"
          role="status"
          variant="caption"
          tone="primary"
        >
          {demoAction}
        </Text>
      </ScrollView>
    </>
  );
}
