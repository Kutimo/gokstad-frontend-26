import {create} from "zustand";
import {persist} from "zustand/middleware";

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
    clear: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    return existing
                        ? {
                              items: state.items.map((i) =>
                                  i.id === item.id ? {...i, qty: i.qty + 1} : i
                              ),
                          }
                        : {items: [...state.items, {...item, qty: 1}]};
                }),

            removeItem: (id) =>
                set((state) => ({items: state.items.filter((i) => i.id !== id)})),

            clear: () => set({items: []}),
        }),
        {
            name: "cart-storage",
        }
    )
);
