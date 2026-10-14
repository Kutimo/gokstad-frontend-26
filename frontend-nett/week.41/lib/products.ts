import { cacheLife } from "next/cache";

export type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    category: string;
};

type ProductsResponse = {
    products: Product[];
    total: number;
};

const BASE_URL = "https://dummyjson.com/products";

export async function getProducts(query?: string): Promise<Product[]> {
    let url = `${BASE_URL}?limit=20`;
    if (query) {
        url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Kunne ikke hente produkter (${res.status})`);

    const data: ProductsResponse = await res.json();
    return data.products;
}

export async function getProduct(id: string): Promise<Product | null> {
    "use cache";
    cacheLife("hours");

    const res = await fetch(`${BASE_URL}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Kunne ikke hente produkt (${res.status})`);
    return res.json();
}