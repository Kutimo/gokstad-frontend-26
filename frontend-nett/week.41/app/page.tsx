import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import SearchForm from "@/components/SearchForm";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
    return (
        <>
            <section className="max-w-2xl py-12 sm:py-20">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Finn det du trenger.</h1>
                <p className="mt-5 text-lg text-muted">
                    Sminke, dagligvarer, møbler og mye mer. Søk etter noe bestemt, eller se hele utvalget.
                </p>
                <div className="mt-8">
                    <SearchForm />
                </div>
            </section>

            <section className="border-t border-line pt-10">
                <div className="mb-6 flex items-baseline justify-between">
                    <h2 className="text-xl font-semibold">Utvalgte produkter</h2>
                    <Link href="/products" className="text-sm text-muted hover:text-foreground">
                        Se alle produkter
                    </Link>
                </div>
                <Suspense fallback={<p className="text-muted">Laster produkter…</p>}>
                    <FeaturedProducts />
                </Suspense>
            </section>
        </>
    );
}

async function FeaturedProducts() {
    const products = await getProducts();
    return <ProductGrid products={products.slice(0, 4)} />;
}
