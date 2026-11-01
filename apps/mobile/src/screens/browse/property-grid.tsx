import { View, useWindowDimensions } from "react-native";
import { ListingCard } from "@/components/ui";
import type { SampleProperty } from "@/fixtures/properties";
import { useWishlist } from "./wishlist-context";

export function PropertyGrid({ properties }: { properties: readonly SampleProperty[] }) {
  const { width, fontScale } = useWindowDimensions();
  const { savedIds, setSaved } = useWishlist();
  const columns = width < 360 || fontScale > 1.3 ? 1 : 2;
  return <View className="flex-row flex-wrap justify-between gap-y-2xl" style={{ columnGap: 12 }}>
    {properties.map(property => <ListingCard key={property.id} variant="home" listing={{ ...property, location: property.location.split(",")[0].trim() }} favorite={savedIds.has(property.id)} onFavoriteChange={saved => setSaved(property.id, saved)} style={{ width: columns === 1 ? "100%" : "48%" }} />)}
  </View>;
}
