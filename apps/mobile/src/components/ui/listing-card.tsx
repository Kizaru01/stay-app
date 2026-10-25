import { Pressable, View, type ViewProps } from "react-native";
import type { ImageSource } from "expo-image";
import { Badge } from "./badge";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Photo } from "./photo";
import { Text } from "./text";

export type ListingPreview = {
  id: string;
  title: string;
  location: string;
  image?: ImageSource | number;
  imageDescription: string;
  rating: number;
  reviewCount: number;
  /** Display value supplied by caller; authoritative pricing belongs to the API. */
  nightlyPrice: string;
  guestFavorite?: boolean;
};
export type ListingCardProps = ViewProps & {
  listing: ListingPreview;
  variant?: "horizontal" | "grid";
  favorite: boolean;
  onFavoriteChange: (favorite: boolean) => void;
  onPress?: () => void;
};
export function ListingCard({ listing, variant = "grid", favorite, onFavoriteChange, onPress, className = "", style, ...props }: ListingCardProps) {
  const horizontal = variant === "horizontal";
  const content = <>
    <Photo source={listing.image} label={listing.imageDescription} className={`rounded-md curve-continuous ${horizontal ? "w-32 h-36" : "w-full aspect-[2/1]"}`} />
    <View className={`gap-xs ${horizontal ? "flex-1 min-w-36" : "w-full"}`}>
      <Text variant="button" className="font-inter-semibold">{listing.title}</Text>
      <View className="flex-row items-start gap-xs"><Icon name="pin" size="sm" className="text-muted" /><Text variant="caption" tone="muted" className="flex-1">{listing.location}</Text></View>
      <View className="flex-row flex-wrap items-center gap-sm">
        <View className="flex-row items-center gap-xs" accessibilityLabel={`${listing.rating} out of 5, ${listing.reviewCount} reviews`}>
          <Icon name="star" size="sm" filled className="text-accent" /><Text variant="caption"><Text variant="caption" className="font-inter-semibold">{listing.rating.toFixed(1)}</Text> <Text variant="caption" tone="muted">({listing.reviewCount})</Text></Text>
        </View>
        <Text variant="caption"><Text variant="caption" className="font-inter-semibold">{listing.nightlyPrice}</Text><Text variant="caption" tone="muted"> / night</Text></Text>
      </View>
      {listing.guestFavorite ? <Badge label="Guest favorite" /> : null}
    </View>
  </>;
  const layout = `gap-md ${horizontal ? "flex-row flex-wrap items-center" : "items-start"}`;
  return <View {...props} className={`relative ${className}`} style={style}>
    {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${listing.title}`} className={`${layout} rounded-md curve-continuous active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus`}>{content}</Pressable> : <View className={layout}>{content}</View>}
    <View className={`absolute top-xs ${horizontal ? "left-20" : "right-xs"}`}>
      <IconButton icon="heart" selected={favorite} accessibilityLabel={`${favorite ? "Remove" : "Save"} ${listing.title} ${favorite ? "from" : "to"} wishlist`} onPress={() => onFavoriteChange(!favorite)} className="border-0 shadow-card" />
    </View>
  </View>;
}
