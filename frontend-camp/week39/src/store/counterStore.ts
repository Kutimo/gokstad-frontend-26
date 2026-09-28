import {create} from "zustand/react";
import {persist} from "zustand/middleware";

interface CounterStore {
    count: number;
    increment: () => void;
    decrement: () => void;
}
// start
// export const useCounterStore = create<CounterStore>()((set) => ({
//     count: 0,
//     increment: () => set((state) => ({count: state.count + 1})),
//     decrement: () => set((state) => ({count: state.count - 1}))
// }))

// make it persist
export const useCounterStore = create<CounterStore>()(
    persist(
        (set) => ({
            count: 0,
            increment: () => set((state) => ({count: state.count + 1})),
            decrement: () => set((state) => ({count: state.count - 1})),
            reset: () => set({count: 0})
        }),
        {name: "counter-storage"},
    ),
)