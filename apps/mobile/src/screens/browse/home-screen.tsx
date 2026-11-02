import { useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Icon, SearchBar, Text } from "@/components/ui";
import { PressFeedback } from "@/components/ui/press-feedback";
import { sampleProperties } from "@/fixtures/properties";
import { propertyCategories } from "./property-categories";
import { PropertyGrid } from "./property-grid";
import {
  filterParams,
  filterProperties,
  readFilters,
  singleParam,
  type BrowseParams,
} from "./property-search";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<BrowseParams>();
  const [query, setQuery] = useState(singleParam(params.q));
  const filters = readFilters(params);
  const { category } = filters;
  const properties = filterProperties(sampleProperties, "", filters).slice(
    0,
    4,
  );
  const priceFiltered = filters.min !== undefined || filters.max !== undefined;
  function openSearch() {
    Keyboard.dismiss();
    router.push({
      pathname: "/search",
      params: { q: query.trim(), ...filterParams(filters) },
    });
  }
  function openFilters() {
    Keyboard.dismiss();
    router.push({
      pathname: "/filters",
      params: { source: "home", q: query, ...filterParams(filters) },
    });
  }
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-onboarding-paper"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="never"
        contentContainerClassName="items-center pb-2xl"
      >
        <View className="w-full max-w-[760px] pt-lg">
          <View className="px-xl">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={openSearch}
              onFiltersPress={openFilters}
              filtersLabel={
                priceFiltered || category !== "all"
                  ? "Edit active search filters"
                  : "Open search filters"
              }
              autoCapitalize="none"
              autoCorrect={false}
              className="shadow-card border-outline/60 bg-onboarding-paper"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-sm px-xl py-md"
            keyboardShouldPersistTaps="handled"
          >
            {propertyCategories.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                icon={item.icon}
                selected={category === item.id}
                onPress={() => router.setParams({ category: item.id })}
              />
            ))}
          </ScrollView>
          <View className="gap-md px-xl pt-xs">
            <View className="flex-row flex-wrap items-center justify-between gap-sm">
              <Text
                variant="heading2"
                accessibilityRole="header"
                className="text-onboarding-ink"
              >
                Popular stays
              </Text>
              <PressFeedback
                onPress={openSearch}
                accessibilityRole="button"
                accessibilityLabel="See all stays"
                className="min-h-control-md justify-center rounded-md focus-visible:outline-2 focus-visible:outline-focus"
              >
                <View className="flex-row items-center gap-xs">
                  <Text variant="bodySmall" className="text-onboarding-muted">
                    See all
                  </Text>
                  <Icon
                    name="arrow"
                    size="sm"
                    className="text-onboarding-muted"
                  />
                </View>
              </PressFeedback>
            </View>
            {priceFiltered ? (
              <Button
                title="Clear price filters"
                variant="ghost"
                size="sm"
                onPress={() => router.setParams({ min: "", max: "" })}
              />
            ) : null}
            {properties.length ? (
              <PropertyGrid properties={properties} />
            ) : (
              <View className="gap-lg items-center py-xl">
                <Text className="text-onboarding-muted text-center">
                  No stays match these filters.
                </Text>
                <Button
                  title="Reset filters"
                  onPress={() =>
                    router.setParams({ category: "all", min: "", max: "" })
                  }
                />
              </View>
            )}
            <Text variant="caption" className="text-onboarding-muted pt-sm">
              Sample stays · Illustrative photos, prices and reviews
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
