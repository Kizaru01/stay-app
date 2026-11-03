import { View, type ViewProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type RatingCategory = { label: string; score: number; icon: IconName };
export type RatingSummaryProps = ViewProps & {
  rating: number;
  reviewCount: number;
  categories: readonly RatingCategory[];
};
export function RatingSummary({
  rating,
  reviewCount,
  categories,
  className = "",
  style,
  ...props
}: RatingSummaryProps) {
  return (
    <View
      {...props}
      className={`flex-row flex-wrap items-center gap-lg ${className}`}
      style={style}
    >
      <View
        className="gap-xs"
        accessibilityLabel={`${rating} out of 5 from ${reviewCount} reviews`}
      >
        <View className="flex-row items-center gap-sm">
          <Text variant="ratingDisplay">{rating.toFixed(1)}</Text>
          <Icon name="star" filled className="text-primary" />
        </View>
        <Text variant="caption" tone="muted">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </Text>
      </View>
      <View className="flex-1 min-w-48 flex-row flex-wrap gap-md">
        {categories.map((category) => (
          <View
            key={category.label}
            className="min-w-control-lg flex-1 items-center gap-xs border-l border-outline pl-sm"
            accessibilityLabel={`${category.label}: ${category.score} out of 5`}
          >
            <Icon name={category.icon} size="sm" />
            <Text variant="ratingSmall">
              {category.score.toFixed(1)}
            </Text>
            <Text variant="caption" tone="muted" className="text-center">
              {category.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
