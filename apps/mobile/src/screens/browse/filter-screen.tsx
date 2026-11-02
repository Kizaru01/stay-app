import { useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, IconButton, Text, TextField } from "@/components/ui";
import { sampleProperties } from "@/fixtures/properties";
import { propertyCategories } from "./property-categories";
import {
  filterParams,
  filterProperties,
  parsePrice,
  readFilters,
  singleParam,
  validatePriceRange,
  type BrowseParams,
} from "./property-search";

export default function FilterScreen() {
  const params = useLocalSearchParams<BrowseParams & { source?: string }>();
  const initial = readFilters(params);
  const [category, setCategory] = useState(initial.category);
  const [minimum, setMinimum] = useState(
    initial.min === undefined ? "" : String(initial.min),
  );
  const [maximum, setMaximum] = useState(
    initial.max === undefined ? "" : String(initial.max),
  );
  const router = useRouter();
  const error = validatePriceRange(minimum, maximum);
  const filters = {
    category,
    min: parsePrice(minimum),
    max: parsePrice(maximum),
  };
  const query = singleParam(params.q);
  const count = filterProperties(
    sampleProperties,
    params.source === "home" ? "" : query,
    filters,
  ).length;
  function close() {
    Keyboard.dismiss();
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  }
  function apply() {
    if (error) return;
    Keyboard.dismiss();
    router.dismissTo({
      pathname: params.source === "home" ? "/home" : "/search",
      params: { q: query, ...filterParams(filters) },
    });
  }
  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-onboarding-paper"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="p-xl gap-xl"
      >
        <View className="flex-row items-center justify-between gap-md">
          <Text
            variant="heading2"
            accessibilityRole="header"
            className="text-onboarding-ink"
          >
            Filter stays
          </Text>
          <IconButton
            icon="close"
            accessibilityLabel="Cancel filters"
            onPress={close}
            className="border-0 bg-transparent"
          />
        </View>
        <View className="gap-md">
          <Text variant="button">Type of stay</Text>
          <View className="flex-row flex-wrap gap-sm">
            {propertyCategories.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                icon={item.icon}
                selected={category === item.id}
                onPress={() => setCategory(item.id)}
              />
            ))}
          </View>
        </View>
        <View className="gap-md">
          <Text variant="button">Nightly price · PHP</Text>
          <Text variant="bodySmall" tone="muted">
            Leave either field blank for no limit.
          </Text>
          <TextField
            label="Minimum price (₱)"
            value={minimum}
            onChangeText={setMinimum}
            keyboardType="decimal-pad"
            placeholder="No minimum"
            maxLength={12}
          />
          <TextField
            label="Maximum price (₱)"
            value={maximum}
            onChangeText={setMaximum}
            keyboardType="decimal-pad"
            placeholder="No maximum"
            maxLength={12}
          />
          {error ? (
            <Text variant="bodySmall" tone="danger" accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" tone="muted">
          Sample prices are for browsing only.
        </Text>
        <Button
          title={`Apply filters${error ? "" : ` · ${count} ${count === 1 ? "stay" : "stays"}`}`}
          disabled={!!error}
          onPress={apply}
        />
        <Button
          title="Reset filters"
          variant="ghost"
          onPress={() => {
            setCategory("all");
            setMinimum("");
            setMaximum("");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
