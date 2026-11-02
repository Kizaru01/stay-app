/** Web/SSR implementation. Native resolves the .native.ts sibling. */
export async function getOnboardingStorage(): Promise<Storage> {
  if (typeof window === "undefined")
    throw new Error("Storage is unavailable during server rendering");
  return window.localStorage;
}
