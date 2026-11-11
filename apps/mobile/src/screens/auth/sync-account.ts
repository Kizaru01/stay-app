import { fetch } from "expo/fetch";

export type BackendUser = {
  id: number;
  clerk_id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar_url: string | null;
};

export class AccountSyncError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type GetToken = (options?: { skipCache?: boolean }) => Promise<string | null>;

function isBackendUser(value: unknown): value is BackendUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return Number.isSafeInteger(user.id) && Number(user.id) > 0
    && typeof user.clerk_id === "string" && typeof user.name === "string"
    && typeof user.email === "string"
    && (user.email_verified_at === null || typeof user.email_verified_at === "string")
    && (user.avatar_url === null || typeof user.avatar_url === "string");
}

export function shouldRetrySync(failureCount: number, error: Error) {
  return failureCount < 2 && error instanceof AccountSyncError
    && (error.status === 0 || error.status === 429 || error.status >= 500);
}

export async function syncAccount({ getToken, userId, signal }: {
  getToken: GetToken;
  userId: string;
  signal: AbortSignal;
}): Promise<BackendUser> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) {
    throw new AccountSyncError(400, "Account setup is unavailable. Please contact support.");
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const timeout = setTimeout(cancel, 15000);
  let stopWaiting = () => {};
  const cancelled = new Promise<never>((_, reject) => {
    stopWaiting = () => reject(new AccountSyncError(0, "We couldn't connect. Check your connection and try again."));
    controller.signal.addEventListener("abort", stopWaiting, { once: true });
    if (controller.signal.aborted) stopWaiting();
  });

  const request = async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await getToken({ skipCache: attempt > 0 });
      if (controller.signal.aborted) throw new AccountSyncError(0, "Request cancelled.");
      if (!token) throw new AccountSyncError(401, "Your session could not be verified. Please sign out and sign in again.");
      const response = await fetch(`${apiUrl}/auth/sync`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (response.status === 401 && attempt === 0) continue;
      if (!response.ok) {
        const message = response.status === 409
          ? "We couldn't link your account. Please contact support."
          : response.status === 401
            ? "Your session could not be verified. Please sign out and sign in again."
            : response.status === 422
              ? "Your account needs a valid profile and primary email. Please contact support."
              : "We couldn't finish setting up your account. Please try again.";
        throw new AccountSyncError(response.status, message);
      }
      const body: unknown = await response.json();
      const data = body && typeof body === "object" && "data" in body ? body.data : null;
      if (!isBackendUser(data) || data.clerk_id !== userId) {
        throw new AccountSyncError(502, "We couldn't verify your account details. Please try again.");
      }
      return data;
    }
    throw new AccountSyncError(401, "Please sign out and sign in again.");
  };

  try {
    return await Promise.race([request(), cancelled]);
  } catch (error) {
    if (error instanceof AccountSyncError) throw error;
    throw new AccountSyncError(0, "We couldn't connect. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", stopWaiting);
  }
}
