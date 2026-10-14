import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return { title: "Fant ikke produktet" };
    }
    return { title: product.title, description: product.description };
}

// Siden selv venter ikke på params — det gjør ProductDetails, inni <Suspense>.
// Da kan Next.js vise fallbacken med en gang ved navigering (cacheComponents).
export default function ProductPage({ params }: Props) {
    return (
        <Suspense fallback={<p className="text-muted">Laster produkt…</p>}>
            <ProductDetails params={params} />
        </Suspense>
    );
}

async function ProductDetails({ params }: Props) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) notFound();

    return (
        <article className="grid gap-10 md:grid-cols-2 md:gap-16">
            <img
                src={product.thumbnail}
                alt={product.title}
                className="aspect-square w-full rounded-2xl bg-plinth object-contain p-8"
            />
            <div className="md:pt-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1>
                <p className="mt-2 capitalize text-muted">{product.category}</p>
                <p className="mt-6 text-2xl font-semibold">{product.price} kr</p>
                <p className="mt-6 max-w-prose leading-relaxed text-foreground/80">{product.description}</p>
                <div className="mt-8">
                    <AddToCartButton
                        item={{
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: product.thumbnail,
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
