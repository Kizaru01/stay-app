import type { ListingPreview } from "@/components/ui/listing-card";

export type PropertyCategory = "cabins" | "beach" | "city" | "unique" | "experiences";
export type SampleProperty = ListingPreview & {
  category: PropertyCategory;
  nightlyPriceAmount: number;
  currency: "PHP";
  guests: number;
  bedrooms: number;
  description: string;
};

// Temporary UI catalogue, not live StayApp inventory. Names, prices and reviews
// are illustrative. Bundled photos may be reused and do not depict these stays.
const villa = require("../../assets/images/demo/villa.jpg");
const cabin = require("../../assets/images/demo/cabin.jpg");

const galleryPhotos = {
  pool: { source: require("../../assets/images/demo/pool-terrace.jpg"), description: "Illustrative shaded pool beside a tropical wooden terrace" },
  exterior: { source: require("../../assets/images/demo/villa-exterior.jpg"), description: "Illustrative contemporary villa with a lawn and swimming pool" },
  bedroom: { source: require("../../assets/images/demo/bedroom.jpg"), description: "Illustrative bedroom with white bedding and warm lighting" },
  living: { source: require("../../assets/images/demo/apartment-living.jpg"), description: "Illustrative living room with blue accents and comfortable seating" },
  cabinLiving: { source: require("../../assets/images/demo/cabin-living.jpg"), description: "Illustrative timber cabin lounge with a loft staircase" },
  cabinBedroom: { source: require("../../assets/images/demo/cabin-bedroom.jpg"), description: "Illustrative rustic bedroom with log furniture" },
  treehouse: { source: require("../../assets/images/demo/treehouse.jpg"), description: "Illustrative elevated treehouse with a staircase among tall trees" },
  coffee: { source: require("../../assets/images/demo/coffee.jpg"), description: "Illustrative freshly brewed coffee beside beans and greenery" },
};

export const sampleProperties: readonly SampleProperty[] = [
  { id: "sample-la-union-villa", title: "Seaside Villa with Private Pool", location: "San Juan, La Union, Philippines", image: require("../../assets/images/onboarding/villa.png"), imageDescription: "Illustrative villa with a private swimming pool", rating: 4.8, reviewCount: 192, nightlyPrice: "₱5,200", nightlyPriceAmount: 5200, currency: "PHP", category: "beach", guests: 8, bedrooms: 3, description: "A coastal getaway concept with space for shared meals, poolside afternoons and slow mornings.", photos: [{ source: require("../../assets/images/onboarding/villa.png"), description: "Illustrative villa with a private swimming pool" }, galleryPhotos.pool, galleryPhotos.bedroom] },
  { id: "sample-tagaytay-cabin", title: "Modern Cabin with Mountain View", location: "Tagaytay, Cavite, Philippines", image: require("../../assets/images/onboarding/cabin.png"), imageDescription: "Illustrative wooden cabin surrounded by trees", rating: 4.7, reviewCount: 136, nightlyPrice: "₱4,500", nightlyPriceAmount: 4500, currency: "PHP", category: "cabins", guests: 4, bedrooms: 2, description: "A cool-weather escape concept with a timber lounge, a quiet bedroom and room to unwind.", photos: [{ source: require("../../assets/images/onboarding/cabin.png"), description: "Illustrative wooden cabin surrounded by trees" }, galleryPhotos.cabinLiving, galleryPhotos.cabinBedroom] },
  { id: "sample-batangas-house", title: "Minimalist Beach House", location: "Laiya, Batangas, Philippines", image: villa, imageDescription: "Illustrative pool villa for a beach house stay", rating: 4.9, reviewCount: 203, nightlyPrice: "₱6,800", nightlyPriceAmount: 6800, currency: "PHP", category: "beach", guests: 8, bedrooms: 4, description: "A bright beach-house concept for family weekends, relaxed dinners and days by the pool.", photos: [{ source: villa, description: "Illustrative pool villa for a beach house stay" }, galleryPhotos.exterior, galleryPhotos.bedroom] },
  { id: "sample-lakeside-cabin", title: "Lakeside Cabin", location: "Tagaytay, Cavite, Philippines", image: cabin, imageDescription: "Illustrative timber cabin for a lakeside retreat", rating: 4.6, reviewCount: 98, nightlyPrice: "₱4,200", nightlyPriceAmount: 4200, currency: "PHP", category: "cabins", guests: 2, bedrooms: 1, description: "A cosy cabin concept for two, with rustic interiors and an unhurried weekend atmosphere.", photos: [{ source: cabin, description: "Illustrative timber cabin for a lakeside retreat" }, galleryPhotos.cabinBedroom, galleryPhotos.cabinLiving] },
  { id: "sample-baguio-pine", title: "Pine Forest Hideaway", location: "Baguio, Benguet, Philippines", image: cabin, imageDescription: "Illustrative forest cabin", rating: 4.8, reviewCount: 84, nightlyPrice: "₱3,600", nightlyPriceAmount: 3600, currency: "PHP", category: "cabins", guests: 4, bedrooms: 2, description: "A woodland hideaway concept for crisp mornings, reading by the window and reconnecting with nature.", photos: [{ source: cabin, description: "Illustrative forest cabin" }, galleryPhotos.cabinLiving, galleryPhotos.cabinBedroom] },
  { id: "sample-makati-loft", title: "Sunlit Loft in Salcedo Village", location: "Makati, Metro Manila, Philippines", image: galleryPhotos.living.source, imageDescription: galleryPhotos.living.description, rating: 4.9, reviewCount: 117, nightlyPrice: "₱2,900", nightlyPriceAmount: 2900, currency: "PHP", category: "city", guests: 2, bedrooms: 1, description: "A city-break concept with a colourful lounge and a comfortable bedroom for a short escape.", photos: [{ source: galleryPhotos.living.source, description: galleryPhotos.living.description }, galleryPhotos.bedroom, galleryPhotos.coffee] },
  { id: "sample-siargao-villa", title: "Palm Garden Villa", location: "General Luna, Siargao, Philippines", image: villa, imageDescription: "Illustrative tropical pool villa", rating: 4.8, reviewCount: 72, nightlyPrice: "₱5,800", nightlyPriceAmount: 5800, currency: "PHP", category: "beach", guests: 4, bedrooms: 2, description: "A tropical villa concept for laid-back island days and evenings beside the pool.", photos: [{ source: villa, description: "Illustrative tropical pool villa" }, galleryPhotos.pool, galleryPhotos.bedroom] },
  { id: "sample-rizal-treehouse", title: "Hillside Treehouse Retreat", location: "Tanay, Rizal, Philippines", image: galleryPhotos.treehouse.source, imageDescription: galleryPhotos.treehouse.description, rating: 4.7, reviewCount: 61, nightlyPrice: "₱3,200", nightlyPriceAmount: 3200, currency: "PHP", category: "unique", guests: 2, bedrooms: 1, description: "An elevated woodland retreat concept with a rustic sleeping space and cosy timber interiors.", photos: [{ source: galleryPhotos.treehouse.source, description: galleryPhotos.treehouse.description }, galleryPhotos.cabinBedroom, galleryPhotos.cabinLiving] },
  { id: "sample-cebu-farm", title: "Farm Stay and Coffee Workshop", location: "Balamban, Cebu, Philippines", image: cabin, imageDescription: "Illustrative countryside cabin for a farm stay", rating: 4.9, reviewCount: 45, nightlyPrice: "₱3,800", nightlyPriceAmount: 3800, currency: "PHP", category: "experiences", guests: 2, bedrooms: 1, description: "A countryside stay concept pairing rustic rooms with coffee tasting and a slower pace.", photos: [{ source: cabin, description: "Illustrative countryside cabin for a farm stay" }, galleryPhotos.cabinBedroom, galleryPhotos.coffee] },
];
