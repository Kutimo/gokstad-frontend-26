import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import SearchForm from "@/components/SearchForm";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = { title: "Produkter" };

type Props = {
    searchParams: Promise<{ q?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
    const { q = "" } = await searchParams;
    const products = await getProducts(q);

    return (
        <section>
            <h1 className="text-3xl font-bold tracking-tight">Produkter</h1>

            <div className="mt-6">
                <SearchForm defaultValue={q} />
            </div>

            <div className="mt-10">
                {products.length === 0 ? (
                    <p className="text-muted">Ingen produkter matchet «{q}». Prøv et annet søkeord.</p>
                ) : (
                    <ProductGrid products={products} />
                )}
            </div>
        </section>
    );
}
