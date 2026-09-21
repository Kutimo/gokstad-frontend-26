import {create} from "zustand";
import {persist} from "zustand/middleware";

export type CartItem = {
    id: number;
    title: string;
    price: number;
    image: string;
    qty: number
}

type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    // increaseItem: (id: number) => void;
    // decreaseItem: (id: number) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    //  return existing
                    //      ? {
                    //          items: state.items.map((i) => i.id === item.id ? {
                    //              ...i,
                    //              qty: i.qty + 1
                    //          } : i),
                    //      }
                    //      : {items: [...state.items, {...item, qty: 1}]}
                    // })

                    if (existing) {
                        const updatedItems = state.items.map((i) =>
                            i.id === item.id ? {...i, qty: i.qty + 1} : i
                        )
                        return {items: updatedItems};
                    } else {
                        const newItems = [...state.items, {
                            ...item,
                            qty: 1
                        }];
                        console.log(newItems)
                        return {items: newItems}
                    }
                }),
            removeItem: (id) =>
                set((state) => ({items: state.items.filter((i) => i.id !== id)})),
        }),
        {name: "cart-storage",}
    ))