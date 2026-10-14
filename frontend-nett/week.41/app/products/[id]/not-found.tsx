import Link from "next/link";

export default function NotFound() {
    return (
        <section className="py-16">
            <h1 className="text-2xl font-bold">Fant ikke produktet</h1>
            <p className="mt-2 text-muted">Det kan ha blitt fjernet, eller lenken er feil.</p>
            <Link
                href="/products"
                className="mt-6 inline-block rounded-full border border-line px-5 py-2.5 transition-colors hover:border-muted"
            >
                Tilbake til produkter
            </Link>
        </section>
    );
}
