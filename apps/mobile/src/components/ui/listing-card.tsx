import { Pressable, View, type ViewProps } from "react-native";
import type { ImageSource } from "expo-image";
import { Badge } from "./badge";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Photo } from "./photo";
import { Text } from "./text";
import { PressFeedback } from "./press-feedback";
import { PropertyPhotoGallery, type PropertyPhoto } from "./property-photo-gallery";

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
  photos?: readonly PropertyPhoto[];
  guests?: number;
  bedrooms?: number;
  description?: string;
};
export type ListingCardProps = ViewProps & {
  listing: ListingPreview;
  variant?: "horizontal" | "grid" | "home";
  favorite: boolean;
  onFavoriteChange: (favorite: boolean) => void;
  onPress?: () => void;
};
export function ListingCard({ listing, variant = "grid", favorite, onFavoriteChange, onPress, className = "", style, ...props }: ListingCardProps) {
  const horizontal = variant === "horizontal";
  if (variant === "home") return <View {...props} className={`relative gap-sm ${className}`} style={style}>
    <PropertyPhotoGallery photos={listing.photos} source={listing.image} description={listing.imageDescription} title={listing.title} />
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={`View ${listing.title}`} className="min-h-control-md justify-center rounded-sm active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"><Text variant="bodySmall" className="font-inter-semibold text-onboarding-ink">{listing.title}</Text></Pressable>
    {listing.guests !== undefined && listing.bedrooms !== undefined ? <Text variant="caption" className="text-onboarding-muted">{listing.guests} guests · {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}</Text> : null}
    <View className="flex-row flex-wrap items-center gap-x-sm gap-y-xs">
      <View className="flex-row items-center gap-xs shrink"><Icon name="pin" size="sm" className="text-onboarding-muted" /><Text variant="caption" className="text-onboarding-muted shrink">{listing.location}</Text></View>
      <View className="flex-row items-center gap-xs" accessibilityLabel={`${listing.rating} out of 5, ${listing.reviewCount} sample reviews`}><Icon name="star" size="sm" filled className="text-onboarding-muted" /><Text variant="caption" className="text-onboarding-muted">{listing.rating.toFixed(1)} ({listing.reviewCount})</Text></View>
      <Text variant="caption" className="text-onboarding-ink font-inter-semibold">{listing.nightlyPrice}<Text variant="caption" className="text-onboarding-muted"> / night</Text></Text>
    </View>
    <PressFeedback onPress={() => onFavoriteChange(!favorite)} accessibilityRole="button" accessibilityLabel={`${favorite ? "Remove" : "Save"} ${listing.title} ${favorite ? "from" : "to"} wishlist`} accessibilityState={{ selected: favorite }} className="absolute top-xs right-xs min-h-control-md min-w-control-md items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-focus">
      <View className="rounded-full bg-black/20 p-sm"><Icon name="heart" filled={favorite} className="text-white" /></View>
    </PressFeedback>
  </View>;
  const content = <>
    {horizontal ? <Photo source={listing.image} label={listing.imageDescription} className="w-32 h-36 rounded-md" /> : null}
    <View className={`gap-xs ${horizontal ? "flex-1 min-w-36" : "w-full"}`}>
      <Text variant="button" className="font-inter-semibold">{listing.title}</Text>
      {listing.guests !== undefined && listing.bedrooms !== undefined ? <Text variant="caption" tone="muted">{listing.guests} guests · {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}</Text> : null}
      {!horizontal && listing.description ? <Text variant="bodySmall" tone="muted">{listing.description}</Text> : null}
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
    {!horizontal ? <View className="mb-md"><PropertyPhotoGallery photos={listing.photos} source={listing.image} description={listing.imageDescription} title={listing.title} aspectRatio={2} /></View> : null}
    {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${listing.title}`} className={`${layout} rounded-md curve-continuous active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus`}>{content}</Pressable> : <View className={layout}>{content}</View>}
    <View className={`absolute top-xs ${horizontal ? "left-20" : "right-xs"}`}>
      <IconButton icon="heart" selected={favorite} accessibilityLabel={`${favorite ? "Remove" : "Save"} ${listing.title} ${favorite ? "from" : "to"} wishlist`} onPress={() => onFavoriteChange(!favorite)} className="border-0 shadow-card" />
    </View>
  </View>;
}
