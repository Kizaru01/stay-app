import { getOnboardingStorage } from "./onboarding-storage-access";

export type AuthEntry = "/sign-up" | "/sign-in";
type Completion = { version: 1; completed: true; entry: AuthEntry };
export type OnboardingVisit = {
  completed: boolean;
  entry: AuthEntry;
  storageAvailable: boolean;
};

const storageKey = "stayapp.onboarding.v1";
// If persistence fails, keep this visit usable without claiming a durable save.
let sessionCompletion: Completion | undefined;

function parseCompletion(value: string | null): Completion | undefined {
  if (!value) return undefined;
  try {
    const record: unknown = JSON.parse(value);
    if (typeof record !== "object" || record === null) return undefined;
    if (
      !("version" in record) ||
      record.version !== 1 ||
      !("completed" in record) ||
      record.completed !== true ||
      !("entry" in record)
    )
      return undefined;
    if (record.entry !== "/sign-up" && record.entry !== "/sign-in")
      return undefined;
    return { version: 1, completed: true, entry: record.entry };
  } catch {
    return undefined;
  }
}

export async function readOnboardingVisit(): Promise<OnboardingVisit> {
  try {
    const storage = await getOnboardingStorage();
    const record = parseCompletion(storage.getItem(storageKey));
    // A prior failed write still suppresses replay during this running session.
    const completion = sessionCompletion ?? record;
    return {
      completed: !!completion,
      entry: completion?.entry ?? "/sign-up",
      storageAvailable: !sessionCompletion,
    };
  } catch {
    return {
      completed: !!sessionCompletion,
      entry: sessionCompletion?.entry ?? "/sign-up",
      storageAvailable: false,
    };
  }
}

export async function completeOnboarding(
  entry: AuthEntry,
): Promise<{ persisted: boolean }> {
  const record: Completion = { version: 1, completed: true, entry };
  sessionCompletion = record;
  try {
    const storage = await getOnboardingStorage();
    storage.setItem(storageKey, JSON.stringify(record));
    sessionCompletion = undefined;
    return { persisted: true };
  } catch {
    return { persisted: false };
  }
}

/** Changing forms remembers the choice only after onboarding was completed. */
export async function rememberAuthEntry(
  entry: AuthEntry,
): Promise<{ persisted: boolean }> {
  const visit = await readOnboardingVisit();
  if (!visit.completed) return { persisted: visit.storageAvailable };
  return completeOnboarding(entry);
}
