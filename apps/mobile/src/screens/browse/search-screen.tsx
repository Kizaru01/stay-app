import { FlatList, Keyboard, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon, IconButton, ListingCard, SearchBar, Text } from "@/components/ui";
import { sampleProperties } from "@/fixtures/properties";
import { filterParams, filterProperties, readFilters, singleParam, type BrowseParams } from "./property-search";
import { useWishlist } from "./wishlist-context";

export default function SearchScreen() {
  const params = useLocalSearchParams<BrowseParams>();
  const query = singleParam(params.q);
  const filters = readFilters(params);
  const results = filterProperties(sampleProperties, query, filters);
  const router = useRouter();
  const { savedIds, setSaved } = useWishlist();
  const filtered = filters.category !== "all" || filters.min !== undefined || filters.max !== undefined;
  function openFilters() {
    Keyboard.dismiss();
    router.push({ pathname: "/filters", params: { source: "search", q: query, ...filterParams(filters) } });
  }
  function reset() {
    Keyboard.dismiss();
    router.setParams({ q: "", category: "all", min: "", max: "" });
  }
  return <SafeAreaView edges={["top", "bottom", "left", "right"]} className="flex-1 bg-onboarding-paper">
    <Stack.Screen options={{ headerShown: false }} />
    <View className="flex-row items-center gap-md px-xl pt-sm pb-lg">
      <IconButton icon="chevron" accessibilityLabel="Back to Home" onPress={() => router.canGoBack() ? router.back() : router.replace("/home")} style={{ transform: [{ rotate: "180deg" }] }} className="border-0 bg-transparent" />
      <Text variant="heading2" accessibilityRole="header" className="text-onboarding-ink flex-1">Search stays</Text>
    </View>
    <View className="px-xl gap-md pb-lg">
      <SearchBar value={query} onChangeText={q => router.setParams({ q })} onSubmitEditing={() => Keyboard.dismiss()} onFiltersPress={openFilters} filtersLabel={filtered ? "Edit active search filters" : "Open search filters"} autoCapitalize="none" autoCorrect={false} accessibilityHint="Results update as you type" />
      <View className="flex-row flex-wrap items-center justify-between gap-sm">
        <Text variant="bodySmall" className="text-onboarding-muted" accessibilityLiveRegion="polite">{results.length} {results.length === 1 ? "stay" : "stays"}{query.trim() ? ` for “${query.trim()}”` : " to explore"}</Text>
        {filtered ? <Button title="Clear filters" variant="ghost" size="sm" onPress={() => router.setParams({ category: "all", min: "", max: "" })} /> : null}
      </View>
      <Text variant="caption" className="text-onboarding-muted">Sample stays · Illustrative photos, prices and reviews</Text>
    </View>
    <FlatList data={results} keyExtractor={property => property.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerClassName="px-xl pb-2xl gap-xl" renderItem={({ item }) => <ListingCard listing={item} favorite={savedIds.has(item.id)} onFavoriteChange={saved => setSaved(item.id, saved)} />} ListEmptyComponent={<View className="items-center gap-lg py-2xl">
      <Icon name="search" size="lg" className="text-onboarding-muted" />
      <Text variant="heading2" accessibilityRole="header" className="text-center text-onboarding-ink">No stays found</Text>
      <Text className="text-center text-onboarding-muted">Try another destination or a wider price range.</Text>
      <Button title="Reset search" onPress={reset} />
    </View>} />
  </SafeAreaView>;
}
