import { createContext, useContext, useState, type PropsWithChildren } from "react";

type WishlistState = { savedIds: ReadonlySet<string>; setSaved: (id: string, saved: boolean) => void };
const WishlistContext = createContext<WishlistState | undefined>(undefined);

/** Temporary session-local saves; not persisted or sent to an API. */
export function WishlistProvider({ children }: PropsWithChildren) {
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(() => new Set());
  function setSaved(id: string, saved: boolean) {
    setSavedIds(previous => {
      const next = new Set(previous);
      if (saved) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  return <WishlistContext.Provider value={{ savedIds, setSaved }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used within WishlistProvider");
  return value;
}
