import { useSyncExternalStore } from "react";
import { useCartStore } from "./cartStore";

export function useHasHydrated() {
    return useSyncExternalStore(
        (onChange) => useCartStore.persist.onFinishHydration(onChange),
        () => useCartStore.persist.hasHydrated(),
        () => false, // på serveren: aldri hydrert
    );
}