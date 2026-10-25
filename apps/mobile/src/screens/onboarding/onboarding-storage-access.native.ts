/** Load within the guarded operation so missing/unavailable storage is recoverable. */
export async function getOnboardingStorage(): Promise<Storage> {
  await import("expo-sqlite/localStorage/install");
  return globalThis.localStorage;
}
