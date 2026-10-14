"use client";

import { useCartStore, type CartItem } from "@/stores/cartStore";

type Props = {
    item: Omit<CartItem, "qty">;
};

export default function AddToCartButton({ item }: Props) {
    const addItem = useCartStore((s) => s.addItem);

    return (
        <button
            onClick={() => addItem(item)}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent/85"
        >
            Legg i handlekurv
        </button>
    );
}
