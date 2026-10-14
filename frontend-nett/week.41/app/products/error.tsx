"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <section className="py-16">
            <h1 className="text-2xl font-bold">Noe gikk galt</h1>
            <p className="mt-2 text-muted">{error.message}</p>
            <button
                onClick={reset}
                className="mt-6 rounded-full border border-line px-5 py-2.5 transition-colors hover:border-muted"
            >
                Prøv igjen
            </button>
        </section>
    );
}
