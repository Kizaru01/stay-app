import type { IconName } from "@/components/ui/icon";
import { sampleProperties } from "./properties";
import { samplePropertyHosts } from "./hosts";

export type Amenity = { icon: IconName; label: string };
export type SampleReview = { name: string; date: string; rating: number; text: string };
const essentials: Amenity[] = [
  { icon: "wifi", label: "Free Wi-Fi" }, { icon: "parking", label: "Free parking" },
  { icon: "kitchen", label: "Kitchen" }, { icon: "tv", label: "Smart TV" },
  { icon: "bed", label: "Fresh bed linen" }, { icon: "shield", label: "First aid kit" },
];

/** Temporary UI fixtures. Hosts, reviews, amenities and policies are illustrative. */
export const samplePropertyDetails = sampleProperties.map(property => {
  const seaside = property.id === "sample-la-union-villa";
  const beach = property.category === "beach";
  const host = samplePropertyHosts[property.id];
  if (!host) throw new Error(`Missing sample host for ${property.id}`);
  return {
    ...property,
    beds: seaside ? 5 : property.bedrooms,
    bathrooms: seaside ? 3 : Math.max(1, Math.ceil(property.bedrooms / 2)),
    host,
    introduction: seaside ? "Relax in a private coastal villa with an infinity pool, spacious open living areas, and beautiful ocean views. Ideal for families and friends." : property.description,
    fullDescription: seaside ? "Wake up to the sound of the sea, share breakfast on the terrace, and spend slow afternoons beside your private pool. Three comfortable bedrooms and generous shared spaces make it easy to settle in together.\n\nPrepare fresh market finds in the equipped kitchen, dine outdoors at sunset, or explore San Juan’s cafés and surf spots. The entire villa is yours during your stay. Children should be supervised around the unfenced pool." : "Enjoy the entire space at your own pace, with comfortable sleeping areas, a kitchen for shared meals and a welcoming spot to unwind. Fresh linens and essentials are provided. Your host can share local dining and sightseeing suggestions before arrival.",
    amenities: [...(beach ? [{ icon: "pool" as const, label: "Private pool" }, { icon: "beach" as const, label: "Beach access" }, { icon: "snow" as const, label: "Air conditioning" }, { icon: "waves" as const, label: "Ocean view" }] : [{ icon: "home" as const, label: "Entire place" }, { icon: "sparkle" as const, label: "Private outdoor space" }]), ...essentials, { icon: "coffee" as const, label: "Coffee maker" }, { icon: "lock" as const, label: "Private entrance" }],
    locationNote: beach ? "A coastal escape near local cafés and beach walks." : property.category === "city" ? "Close to neighbourhood cafés, restaurants and city conveniences." : "A peaceful base for local walks and exploring the surrounding countryside.",
    reviewCategories: [{ icon: "sparkle" as const, label: "Cleanliness", value: Math.min(5, property.rating + 0.1) }, { icon: "pin" as const, label: "Location", value: property.rating }, { icon: "check" as const, label: "Check-in", value: property.rating }],
    reviews: [
      { name: "Miguel", date: "October 2026", rating: 5, text: seaside ? "Beautiful place! The villa is even better in person. We loved the private pool and the ocean view. Maria’s recommendations made our family weekend extra special." : "A lovely place to slow down. The rooms were comfortable, check-in was easy and our host shared great local recommendations." },
      { name: "Isabel", date: "September 2026", rating: 5, text: "Thoughtfully prepared, clean and comfortable. We especially enjoyed cooking together and having plenty of space to relax. We would happily return." },
      { name: "Daniel", date: "August 2026", rating: 4, text: "A relaxing stay with friends. The host was quick to answer our questions and the welcome guide was helpful. A great base for exploring the area." },
    ] satisfies SampleReview[],
    rules: ["Check-in: 3:00 PM", "Check-out: 11:00 AM", "No smoking", "Pets allowed by request", "Quiet hours: 10 PM–8 AM"],
    cancellationPolicy: "Free cancellation up to 7 days before check-in. Final terms will be shown before a real booking.",
  };
});
export type PropertyDetails = (typeof samplePropertyDetails)[number];
