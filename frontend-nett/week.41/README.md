This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Cart store (`stores/cartStore.ts`)

The cart uses [Zustand](https://zustand.docs.pmnd.rs/) with the `persist` middleware, so the cart is saved in `localStorage` under the key `cart-storage`.

```ts
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
```

### Actions

| Action | What it does |
| --- | --- |
| `addItem(item)` | Adds the item with `qty: 1`, or increases `qty` by 1 if it is already in the cart |
| `removeItem(id)` | Removes the item from the cart |
| `increaseQty(id)` | Increases `qty` by 1 |
| `decreaseQty(id)` | Decreases `qty` by 1 and removes the item when it reaches 0 |
| `clearCart()` | Empties the cart |

### Usage

```tsx
"use client";

import { useCartStore } from "@/stores/cartStore";

const items = useCartStore((s) => s.items);
const addItem = useCartStore((s) => s.addItem);
```

Because the cart is read from `localStorage`, the server and the browser can render different content. Use `useHasHydrated()` from `stores/useHasHydrated.ts` to wait until the store has loaded before showing cart data (see `stores/CartBadge.tsx`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
