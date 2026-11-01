import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui";
import { sampleProperties } from "@/fixtures/properties";
import { BrowseEmptyState } from "@/screens/browse/browse-empty-state";
import { useWishlist } from "@/screens/browse/wishlist-context";
import { PropertyGrid } from "@/screens/browse/property-grid";

export default function Wishlist() {
  const { savedIds } = useWishlist();
  const properties = sampleProperties.filter(property => savedIds.has(property.id));
  if (!properties.length) return <BrowseEmptyState title="Wishlist" message="Save stays you love by tapping the heart. Your saved stays will appear here for this session." icon="heart" />;
  return <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-onboarding-paper">
    <ScrollView contentContainerClassName="gap-xl p-xl">
      <Text variant="heading1" accessibilityRole="header">Wishlist</Text>
      <Text variant="bodySmall" tone="muted">Sample stays · Saved for this session</Text>
      <PropertyGrid properties={properties} />
    </ScrollView>
  </SafeAreaView>;
}
