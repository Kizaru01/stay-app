import type { IconName } from "@/components/ui/icon";
import type { PropertyCategory } from "@/fixtures/properties";

export type BrowseCategory = "all" | PropertyCategory;
export const propertyCategories: readonly {
  id: BrowseCategory;
  label: string;
  icon: IconName;
}[] = [
  { id: "all", label: "All", icon: "grid" },
  { id: "cabins", label: "Cabins", icon: "cabin" },
  { id: "beach", label: "Beach", icon: "beach" },
  { id: "city", label: "City", icon: "city" },
  { id: "unique", label: "Unique", icon: "tent" },
  { id: "experiences", label: "Experiences", icon: "sparkle" },
];
