import { useAuth, useClerk } from "@clerk/expo";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { syncClerkUser, UserSyncError } from "./sync-clerk-user";

type SyncState = {
  key: string | null;
  phase: "pending" | "ready" | "error";
  message?: string;
  signingOut?: boolean;
};

const SyncContext = createContext<{
  phase: SyncState["phase"];
  message?: string;
  signingOut?: boolean;
  retry: () => void;
  logout: () => Promise<void>;
} | null>(null);

export function useClerkUserSync() {
  const sync = useContext(SyncContext);
  if (!sync) throw new Error("Clerk user sync provider is missing.");
  return sync;
}

export function ClerkUserSyncBoundary({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, sessionId, userId, getToken } = useAuth();
  const { signOut } = useClerk();
  const [retry, setRetry] = useState(0);
  const syncKey =
    isLoaded && isSignedIn && sessionId && userId
      ? `${userId}:${sessionId}:${retry}`
      : null;
  const [state, setState] = useState<SyncState>({
    key: syncKey,
    phase: "pending",
  });
  const tokenGetter = useRef(getToken);
  const activeRequest = useRef<AbortController | null>(null);

  if (state.key !== syncKey) setState({ key: syncKey, phase: "pending" });

  // Clerk Expo wraps getToken on every render; changing that wrapper must not restart synchronization.
  useEffect(() => {
    tokenGetter.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!syncKey || !userId) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    void syncClerkUser(
      userId,
      (options) => tokenGetter.current(options),
      controller.signal,
    ).then(
      () => {
        if (!controller.signal.aborted)
          setState({ key: syncKey, phase: "ready" });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            key: syncKey,
            phase: "error",
            message:
              error instanceof UserSyncError
                ? error.message
                : "We couldn't finish setting up your account. Please try again.",
          });
      },
    );
    return () => {
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [syncKey, userId]);

  const current = state.key === syncKey ? state : undefined;
  const logout = async () => {
    if (!sessionId || current?.signingOut) return;
    const controller = activeRequest.current;
    controller?.abort();
    setState({ key: syncKey, phase: "pending", signingOut: true });
    try {
      await signOut();
    } catch {
      // Ignore a result from a session that has since been replaced or unmounted.
      if (activeRequest.current === controller)
        setState({
          key: syncKey,
          phase: "error",
          message: "Couldn't sign out. Please try again.",
        });
    }
  };

  return (
    <SyncContext.Provider
      value={{
        phase: current?.phase ?? "pending",
        message: current?.message,
        signingOut: current?.signingOut,
        retry: () => setRetry((value) => value + 1),
        logout,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
