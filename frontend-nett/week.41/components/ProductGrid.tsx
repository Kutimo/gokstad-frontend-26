import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductGrid({ products }: { products: Product[] }) {
    return (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
                <li key={p.id}>
                    <Link href={`/products/${p.id}`} className="group block">
                        <img
                            src={p.thumbnail}
                            alt={p.title}
                            className="aspect-square w-full rounded-xl bg-plinth object-contain p-3"
                        />
                        <h2 className="mt-3 text-sm font-medium leading-snug underline-offset-4 group-hover:underline">
                            {p.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted">{p.price} kr</p>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
