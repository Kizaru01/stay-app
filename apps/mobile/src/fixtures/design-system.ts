import type { ListingPreview } from "@/components/ui/listing-card";

// Temporary catalogue content only. These photos do not depict real StayApp inventory.
export const demoListings: readonly ListingPreview[] = [
  { id: "demo-villa", title: "Seaside Villa with Private Pool", location: "La Union, Philippines", image: require("../../assets/images/demo/villa.jpg"), imageDescription: "Sample villa with a private swimming pool", rating: 4.8, reviewCount: 192, nightlyPrice: "₱5,200", guestFavorite: true },
  { id: "demo-cabin", title: "Modern Cabin with Mountain View", location: "Tagaytay, Philippines", image: require("../../assets/images/demo/cabin.jpg"), imageDescription: "Sample wooden cabin surrounded by forest", rating: 4.7, reviewCount: 136, nightlyPrice: "₱4,500" },
];
export const demoHost = { name: "Maria", avatar: require("../../assets/images/demo/host.jpg"), superhost: true, yearsHosting: 4 };
