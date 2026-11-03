import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

const variants = {
  display: "type-display",
  heading1: "type-heading-1",
  heading2: "type-heading-2",
  cardTitle: "type-card-title",
  cardTitleSmall: "type-card-title-sm",
  personName: "type-person-name",
  personNameSmall: "type-person-name-sm",
  location: "type-location",
  amenity: "type-amenity",
  metadata: "type-metadata",
  label: "type-label",
  price: "type-price",
  priceSmall: "type-price-sm",
  rating: "type-rating",
  ratingDisplay: "type-rating-display",
  personNameLarge: "type-person-name-lg",
  ratingHeading: "type-rating-heading",
  ratingSmall: "type-rating-sm",
  locationSmall: "type-location-sm",
  amenitySmall: "type-amenity-sm",
  metadataLarge: "type-metadata-lg",
  body: "type-body",
  bodySmall: "type-body-sm",
  caption: "type-caption",
  button: "type-button",
  buttonSmall: "type-button-sm",
} as const;

const tones = {
  default: "text-ink",
  muted: "text-muted",
  primary: "text-primary",
  inverse: "text-on-primary",
  danger: "text-danger",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  superhost: "text-superhost",
  disabled: "text-disabled-ink",
} as const;

export type TextProps = NativeTextProps & {
  variant?: keyof typeof variants;
  tone?: keyof typeof tones;
};

export function Text({ variant = "body", tone = "default", className = "", style, ...props }: TextProps) {
  return <NativeText {...props} className={`${variants[variant]} ${tones[tone]} ${className}`} style={style} />;
}
