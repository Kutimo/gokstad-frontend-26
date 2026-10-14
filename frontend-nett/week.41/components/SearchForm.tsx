type Props = {
    defaultValue?: string;
};

// Vanlig GET-skjema: nettleseren navigerer til /products?q=...
export default function SearchForm({ defaultValue = "" }: Props) {
    return (
        <form action="/products" role="search" className="flex max-w-xl gap-2">
            <input
                type="search"
                name="q"
                defaultValue={defaultValue}
                placeholder="Søk etter produkter"
                aria-label="Søk etter produkter"
                className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-5 outline-none placeholder:text-muted focus:border-accent"
            />
            <button
                type="submit"
                className="h-12 rounded-full bg-accent px-6 font-semibold text-background transition-colors hover:bg-accent/85"
            >
                Søk
            </button>
        </form>
    );
}
