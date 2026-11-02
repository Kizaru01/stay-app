import { View, useWindowDimensions } from "react-native";
import { ListingCard } from "@/components/ui";
import type { SampleProperty } from "@/fixtures/properties";
import { useWishlist } from "./wishlist-context";
import { useRouter } from "expo-router";

export function PropertyGrid({
  properties,
}: {
  properties: readonly SampleProperty[];
}) {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const { savedIds, setSaved } = useWishlist();
  const columns = width < 360 || fontScale > 1.3 ? 1 : 2;
  return (
    <View
      className="flex-row flex-wrap justify-between gap-y-xl"
      style={{ columnGap: 12 }}
    >
      {properties.map((property) => (
        <ListingCard
          key={property.id}
          variant="home"
          onPress={() =>
            router.push({
              pathname: "/property/[id]",
              params: { id: property.id },
            })
          }
          listing={property}
          favorite={savedIds.has(property.id)}
          onFavoriteChange={(saved) => setSaved(property.id, saved)}
          style={{ width: columns === 1 ? "100%" : "48%" }}
        />
      ))}
    </View>
  );
}
