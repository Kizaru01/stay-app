import { Pressable, View, type ViewProps } from "react-native";
import type { ImageSource } from "expo-image";
import { Badge } from "./badge";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { Photo } from "./photo";
import { Text } from "./text";
import {
  PropertyPhotoGallery,
  type PropertyPhoto,
} from "./property-photo-gallery";

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
export function ListingCard({
  listing,
  variant = "grid",
  favorite,
  onFavoriteChange,
  onPress,
  className = "",
  style,
  ...props
}: ListingCardProps) {
  const horizontal = variant === "horizontal";
  const home = variant === "home";
  const content = (
    <>
      {horizontal ? (
        <Photo
          source={listing.image}
          label={listing.imageDescription}
          className="w-32 h-36 rounded-md"
        />
      ) : null}
      <View className={`gap-xs ${horizontal ? "flex-1 min-w-36" : "w-full"}`}>
        <Text
          variant={home ? "caption" : "button"}
          className="font-lora-medium text-onboarding-ink"
        >
          {listing.title}
        </Text>
        <View className="flex-row items-start gap-xs">
          <Icon name="pin" size="sm" className="text-onboarding-muted" />
          <Text
            variant={home ? "caption" : "bodySmall"}
            className="font-lora-regular flex-1 text-onboarding-muted"
          >
            {listing.location}
          </Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-sm gap-y-xs">
          <View
            className="flex-row items-center gap-xs"
            accessibilityLabel={`${listing.rating} out of 5, ${listing.reviewCount} reviews`}
          >
            <Icon name="star" size="sm" filled className="text-onboarding" />
            <Text
              variant={home ? "caption" : "bodySmall"}
              className="font-lora-regular text-onboarding-ink"
            >
              {listing.rating.toFixed(1)} ({listing.reviewCount})
            </Text>
          </View>
          {listing.guests !== undefined ? (
            <Text
              variant={home ? "caption" : "bodySmall"}
              className="font-lora-regular text-onboarding-muted"
            >
              · {listing.guests} guests
            </Text>
          ) : null}
          {listing.bedrooms !== undefined ? (
            <Text
              variant={home ? "caption" : "bodySmall"}
              className="font-lora-regular text-onboarding-muted"
            >
              · {listing.bedrooms}{" "}
              {listing.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </Text>
          ) : null}
        </View>
        <Text
          variant={home ? "bodySmall" : "heading2"}
          className="font-lora-medium text-onboarding-ink pt-xs"
        >
          {listing.nightlyPrice}
          <Text
            variant="bodySmall"
            className="font-lora-regular text-onboarding-muted"
          >
            {" "}
            / night
          </Text>
        </Text>
        {listing.guestFavorite && !home ? (
          <Badge label="Guest favorite" />
        ) : null}
      </View>
    </>
  );
  const layout = `gap-md ${horizontal ? "flex-row flex-wrap items-center" : "items-start"}`;
  return (
    <View {...props} className={`relative ${className}`} style={style}>
      {!horizontal ? (
        <View className="mb-sm">
          <PropertyPhotoGallery
            photos={listing.photos}
            source={listing.image}
            description={listing.imageDescription}
            title={listing.title}
            aspectRatio={home ? 1.8 : 2.1}
          />
        </View>
      ) : null}
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${listing.title}`}
          className={`${layout} min-h-control-md rounded-md curve-continuous active:opacity-70 focus-visible:outline-2 focus-visible:outline-focus`}
        >
          {content}
        </Pressable>
      ) : (
        <View className={layout}>{content}</View>
      )}
      <View
        className={`absolute top-xs ${horizontal ? "left-20" : "right-xs"}`}
      >
        <IconButton
          icon="heart"
          selected={favorite}
          accessibilityLabel={`${favorite ? "Remove" : "Save"} ${listing.title} ${favorite ? "from" : "to"} wishlist`}
          onPress={() => onFavoriteChange(!favorite)}
          className="border-0 shadow-card"
        />
      </View>
    </View>
  );
}
