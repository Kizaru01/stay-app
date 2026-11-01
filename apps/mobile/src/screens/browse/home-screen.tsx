import { useState } from "react";
import { Keyboard, Platform, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon, SearchBar, Text } from "@/components/ui";
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
        <View className="w-full max-w-[760px] pt-xl">
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
              supportingText="Try a city, country, or specific location"
              className="shadow-card border-outline/60 bg-onboarding-paper"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-md px-xl py-lg"
            keyboardShouldPersistTaps="handled"
          >
            {propertyCategories.map((item) => (
              <PressFeedback
                key={item.id}
                onPress={() => router.setParams({ category: item.id })}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: category === item.id }}
                {...(Platform.OS === "web"
                  ? { "aria-pressed": category === item.id }
                  : {})}
                className="rounded-xl focus-visible:outline-2 focus-visible:outline-focus"
              >
                <View
                  className={`min-h-20 min-w-20 items-center justify-center gap-sm rounded-xl px-md py-md ${category === item.id ? "bg-onboarding" : "bg-[#edf2f4]"}`}
                >
                  <Icon
                    name={item.icon}
                    className={
                      category === item.id
                        ? "text-white"
                        : "text-onboarding-ink"
                    }
                  />
                  <Text
                    variant="caption"
                    className={
                      category === item.id
                        ? "text-white"
                        : "text-onboarding-ink"
                    }
                  >
                    {item.label}
                  </Text>
                </View>
              </PressFeedback>
            ))}
          </ScrollView>
          <View className="gap-lg px-xl pt-2xl">
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
