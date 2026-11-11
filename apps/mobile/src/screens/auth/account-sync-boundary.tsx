import { useAuth, useClerk } from "@clerk/expo";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import { syncAccount, shouldRetrySync } from "./sync-account";
import { AccountSyncFeedback } from "./account-sync-feedback";

export function AccountSyncBoundary({ children }: { children: ReactNode }) {
  const { userId, sessionId } = useAuth();
  return (
    <SessionAccount key={`${userId ?? "guest"}:${sessionId ?? "none"}`}>
      {children}
    </SessionAccount>
  );
}

function SessionAccount({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  useEffect(() => () => client.clear(), [client]);
  return (
    <QueryClientProvider client={client}>
      <AccountSyncState>{children}</AccountSyncState>
    </QueryClientProvider>
  );
}

function AccountSyncState({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();
  const account = useQuery({
    queryKey: ["account", userId, sessionId],
    enabled: isLoaded && isSignedIn === true && !!userId && !!sessionId,
    queryFn: ({ signal }) => syncAccount({ getToken, userId: userId!, signal }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetrySync,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    networkMode: "always",
  });
  const blocked = !isLoaded || (isSignedIn && !account.data);
  const leave = async () => {
    setSigningOut(true);
    setSignOutError(undefined);
    try {
      await signOut();
    } catch {
      setSignOutError("We couldn't sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-onboarding-paper">
      <View
        style={{ flex: 1, opacity: blocked ? 0 : 1 }}
        pointerEvents={blocked ? "none" : "auto"}
        accessibilityElementsHidden={!!blocked}
        importantForAccessibility={blocked ? "no-hide-descendants" : "auto"}
      >
        {children}
      </View>
      {blocked ? (
        <AccountSyncFeedback
          loading={account.isFetching || !account.error}
          error={account.error?.message}
          signOutError={signOutError}
          signingOut={signingOut}
          onRetry={() => void account.refetch()}
          onSignOut={isSignedIn ? () => void leave() : undefined}
        />
      ) : null}
    </View>
  );
}
