 import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: number;
    title: string;
    price: number;
    image: string;
    qty: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    increaseQty: (id: number) => void;
    decreaseQty: (id: number) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, qty: 1 }] };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            increaseQty: (id) =>
                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
                })),

            // Fjerner varen når antallet går ned til 0
            decreaseQty: (id) =>
                set((state) => ({
                    items: state.items
                        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                        .filter((i) => i.qty > 0),
                })),

            clearCart: () => set({ items: [] }),
        }),
        { name: "cart-storage" },
    ),
);
