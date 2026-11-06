import { fetch } from "expo/fetch";

export type SyncedUser = {
  id: number;
  clerk_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
};

export class UserSyncError extends Error {
  constructor(message: string, readonly retryable = false, readonly retryAfterMs = 1000) {
    super(message);
    this.name = "UserSyncError";
  }
}

function syncUrl(): string {
  try {
    const url = new URL(`${(process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "")}/auth/sync`);
    if ((url.protocol !== "https:" && !(__DEV__ && url.protocol === "http:"))
      || url.username || url.password || url.search || url.hash) throw new Error();
    return url.toString();
  } catch {
    throw new UserSyncError("Account setup is unavailable. Please try again later.");
  }
}

function isSyncedUser(value: unknown, userId: string): value is SyncedUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return Number.isSafeInteger(user.id) && (user.id as number) > 0 && user.clerk_id === userId
    && ["email", "first_name", "last_name", "profile_image_url"].every(
      (field) => user[field] === null || typeof user[field] === "string",
    );
}

async function syncAttempt(
  url: string,
  userId: string,
  getToken: () => Promise<string | null>,
  signal: AbortSignal,
): Promise<SyncedUser> {
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const timer = setTimeout(cancel, 15000);
  let abortListener: () => void = () => {};

  try {
    return await Promise.race([
      new Promise<never>((_, reject) => {
        abortListener = () => reject(new UserSyncError("Account setup timed out. Please try again.", true));
        request.signal.addEventListener("abort", abortListener, { once: true });
        if (request.signal.aborted) abortListener();
      }),
      (async () => {
        const token = await getToken();
        if (request.signal.aborted) throw new Error("Synchronization cancelled.");
        if (!token) throw new UserSyncError("Your session needs to be refreshed. Please sign out and sign in again.", true);
        const response = await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          credentials: "omit",
          redirect: "error",
          signal: request.signal,
        });
        if (!response.ok) {
          if (response.status === 401) throw new UserSyncError("Your session needs to be refreshed. Please sign out and sign in again.", true);
          if (response.status === 409) throw new UserSyncError("We couldn't connect your account. Please contact support.");
          const retryAfter = response.headers.get("Retry-After");
          const retryAfterMs = retryAfter
            ? Math.max(1000, /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now())
            : 1000;
          throw new UserSyncError(
            "We couldn't finish setting up your account. Please try again.",
            (response.status >= 500 || response.status === 429) && Number.isFinite(retryAfterMs) && retryAfterMs <= 5000,
            Number.isFinite(retryAfterMs) ? retryAfterMs : 1000,
          );
        }
        const body: unknown = await response.json();
        const data = typeof body === "object" && body !== null && "data" in body ? body.data : undefined;
        if (!isSyncedUser(data, userId)) throw new UserSyncError("We couldn't confirm your account setup. Please try again.");
        return data;
      })(),
    ]);
  } catch (error) {
    if (error instanceof UserSyncError) throw error;
    throw new UserSyncError("Couldn't connect to StayApp. Check your connection and try again.", true);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
    request.signal.removeEventListener("abort", abortListener);
    request.abort();
  }
}

function waitForRetry(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reject(new Error("Synchronization cancelled."));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
  });
}

export async function syncClerkUser(
  userId: string,
  getToken: (options?: { skipCache: boolean }) => Promise<string | null>,
  signal: AbortSignal,
): Promise<SyncedUser> {
  const url = syncUrl();
  for (let attempt = 0; ; attempt++) {
    if (signal.aborted) throw new Error("Synchronization cancelled.");
    try {
      return await syncAttempt(url, userId, () => getToken(attempt > 0 ? { skipCache: true } : undefined), signal);
    } catch (error) {
      if (signal.aborted || attempt >= 1 || !(error instanceof UserSyncError) || !error.retryable) throw error;
      await waitForRetry(error.retryAfterMs, signal);
    }
  }
}
