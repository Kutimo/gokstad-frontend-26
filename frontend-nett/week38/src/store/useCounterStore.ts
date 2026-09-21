import { create } from "zustand";
import { persist } from "zustand/middleware";

type TellerStore = {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
};
/**/
/**
 * initializes state og sets up persist(localStorage) for easy storage
 */
export const useCounterStore = create<TellerStore>()(
    persist(
        (set) => ({
            count: 0,
            increment: () => set((state) => ({ count: state.count + 1 })),
            decrement: () => set((state) => ({ count: state.count - 1 })),
            reset: () => set({ count: 0 }),
        }),
        { name: "teller-lager" },
    ),
);
