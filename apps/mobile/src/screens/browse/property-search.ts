import type { SampleProperty } from "@/fixtures/properties";
import type { BrowseCategory } from "./property-categories";

export type BrowseParams = {
  q?: string | string[];
  category?: string | string[];
  min?: string | string[];
  max?: string | string[];
};
export type PropertyFilters = {
  category: BrowseCategory;
  min?: number;
  max?: number;
};
export const defaultFilters: PropertyFilters = { category: "all" };
const categories: readonly string[] = [
  "all",
  "cabins",
  "beach",
  "city",
  "unique",
  "experiences",
];

export function singleParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export function parsePrice(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return undefined;
  const amount = Number(trimmed);
  return Number.isFinite(amount) && amount <= Number.MAX_SAFE_INTEGER
    ? amount
    : undefined;
}

export function readFilters(params: BrowseParams): PropertyFilters {
  const category = singleParam(params.category);
  const min = parsePrice(singleParam(params.min));
  const max = parsePrice(singleParam(params.max));
  // Malformed deep links use an unrestricted range instead of broken results.
  const range =
    min !== undefined && max !== undefined && min > max ? {} : { min, max };
  return {
    category: categories.includes(category)
      ? (category as BrowseCategory)
      : "all",
    ...range,
  };
}

export function filterParams(filters: PropertyFilters) {
  return {
    category: filters.category,
    min: filters.min === undefined ? "" : String(filters.min),
    max: filters.max === undefined ? "" : String(filters.max),
  };
}

export function validatePriceRange(
  minimum: string,
  maximum: string,
): string | undefined {
  const min = parsePrice(minimum);
  const max = parsePrice(maximum);
  if (
    (minimum.trim() && min === undefined) ||
    (maximum.trim() && max === undefined)
  )
    return "Enter a valid price of zero or more, with up to two decimal places.";
  if (min !== undefined && max !== undefined && min > max)
    return "Minimum price must be less than or equal to maximum price.";
  return undefined;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** UI-only filtering of temporary inventory; never authoritative pricing/availability. */
export function filterProperties<
  T extends Pick<
    SampleProperty,
    "title" | "location" | "category" | "nightlyPriceAmount"
  >,
>(properties: readonly T[], query: string, filters: PropertyFilters): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return properties.filter((property) => {
    const searchable = normalize(
      `${property.title} ${property.location} ${property.category}`,
    );
    return (
      terms.every((term) => searchable.includes(term)) &&
      (filters.category === "all" || property.category === filters.category) &&
      (filters.min === undefined ||
        property.nightlyPriceAmount >= filters.min) &&
      (filters.max === undefined || property.nightlyPriceAmount <= filters.max)
    );
  });
}
