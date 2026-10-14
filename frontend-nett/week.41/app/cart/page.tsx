"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useHasHydrated } from "@/stores/useHasHydrated";
import Modal from "@/components/Modal";

const secondaryButton = "rounded-full border border-line px-5 py-2.5 transition-colors hover:border-muted";

export default function CartPage() {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearCart = useCartStore((s) => s.clearCart);
    const hydrated = useHasHydrated();
    const [confirmOpen, setConfirmOpen] = useState(false); // ← før alle early returns

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    function handleConfirmClear() {
        clearCart();
        setConfirmOpen(false);
    }

    if (!hydrated) return <p className="text-muted">Laster handlekurv…</p>;

    if (items.length === 0) {
        return (
            <section>
                <h1 className="text-3xl font-bold tracking-tight">Handlekurv</h1>
                <p className="mt-4 text-muted">Handlekurven er tom.</p>
                <Link
                    href="/products"
                    className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent/85"
                >
                    Se produkter
                </Link>
            </section>
        );
    }

    return (
        <section className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Handlekurv</h1>

            <ul className="mt-8 divide-y divide-line border-y border-line">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-4">
                        <img
                            src={item.image}
                            alt=""
                            className="size-16 shrink-0 rounded-lg bg-plinth object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="text-sm text-muted">{item.qty} × {item.price} kr</p>
                        </div>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
                        >
                            Fjern
                        </button>
                    </li>
                ))}
            </ul>

            <p className="flex justify-between py-6 text-lg font-semibold">
                <span>Totalt</span>
                <span>{total.toFixed(2)} kr</span>
            </p>

            <button onClick={() => setConfirmOpen(true)} className={secondaryButton}>
                Tøm handlekurven
            </button>

            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Tømme handlekurven?">
                <p className="text-muted">Alle varene fjernes fra handlekurven. Dette kan ikke angres.</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setConfirmOpen(false)} className={secondaryButton}>
                        Avbryt
                    </button>
                    <button
                        onClick={handleConfirmClear}
                        className="rounded-full bg-red-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-600"
                    >
                        Tøm
                    </button>
                </div>
            </Modal>
        </section>
    );
}
