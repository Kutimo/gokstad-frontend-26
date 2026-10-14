"use client";

import { useCartStore } from "@/stores/cartStore";
import { useHasHydrated } from "@/stores/useHasHydrated";

export default function CartBadge() {
    const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
    const hydrated = useHasHydrated();

    if (!hydrated || count === 0) return null;
    return (
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-background">{count}</span>
    );
}
