# Uke 41 — Videre med Next.js: nettbutikken flyttes til App Router (2 timer)

Bygger videre på introduksjonen til Next.js (filbasert
routing, layouts, Server vs. Client Components — se
`frontend-camp/week39/nextjs-basics.md` for referansen) og
på nettbutikken fra `week37`/`week38` (Zustand-handlekurv,
produkter fra dummyjson, søk). I dag tar vi det elevene
allerede har bygget i Vite + React Router og flytter det
over til Next.js, så de ser *hva som blir enklere* og *hva
som må gjøres annerledes*.

**Stack:** Next.js 16 (App Router) + React 19.3 + TypeScript
5, Zustand 5, Tailwind 4. Ingen React Router lenger —
routing er mapper i `app/`.

**Merk:** alle variabel-, funksjons- og typenavn i
kodeeksemplene under er på engelsk (vanlig konvensjon i
React/TS-prosjekter). Snakkepunkter og UI-tekst er på norsk,
som resten av appen.

**Praktisk:** vi lager et nytt prosjekt i `week41` med
`create-next-app` og tar med handlekurv-storen fra
`week37`. Koden under er en fasit, ikke noe som ligger
ferdig i repoet.

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                                                          |
|-------------|----------|---------------------------------------------------------------|
| 00:00–00:05 | 5 min    | Intro — hvor står vi?                                         |
| 00:05–00:20 | 15 min   | Del 1: Nytt prosjekt + layout med navbar                      |
| 00:20–00:50 | 30 min   | Del 2: Products som Server Component + søk via `searchParams` |
| 00:50–01:00 | 10 min   | ☕ Pause                                                      |
| 01:00–01:20 | 20 min   | Del 3: `products/[id]` — dynamisk rute, `notFound`, metadata  |
| 01:20–01:45 | 25 min   | Del 4: Handlekurven — Zustand i Client Components             |
| 01:45–01:55 | 10 min   | Del 5: `loading.tsx` og `error.tsx`                           |
| 01:55–02:00 | 5 min    | Oppsummering + hjemmelekse                                    |

---

## 00:00–00:05 — Intro

**Snakkepunkter:**

- Hittil: komponenter, props, state, routing med React
  Router, `useEffect` + fetch, Zustand — og en første runde
  med Next.js (filbasert routing, layouts, Server vs. Client
  Components).
- I dag: vi bygger ikke noe nytt fra bunnen av, vi *flytter*
  nettbutikken. Det er den beste måten å se forskjellen på:
  samme app, to måter å lage den på.
- Spørsmål til klassen før vi starter: "Hvilke deler av
  nettbutikken trenger egentlig å kjøre i nettleseren?"
  (Svar: knapper som endrer handlekurven og alt som leser
  fra `localStorage`. Produktlisten og produktsiden trenger
  ikke det.)

---

## 00:05–00:20 — Del 1: Nytt prosjekt + layout

```bash
cd frontend-nett
npx create-next-app@latest week41
# TypeScript: Yes · ESLint: Yes · Tailwind: Yes · src/ directory: No · App Router: Yes · Turbopack: Yes · import alias: default
cd week41
npm install zustand
npm run dev
```

Lag `stores/cartStore.ts` (samme store som i `week37`, men
`clear` heter nå `clearCart`, og `increaseQty`/`decreaseQty`
er lagt til), og bytt ut innholdet i `app/globals.css` med
temaet under.

**`stores/cartStore.ts`** (fasit, hvis elevene ikke har sin
egen kopi):

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: number;
    title: string;
    price: number;
    image: string;
    qty: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    increaseQty: (id: number) => void;
    decreaseQty: (id: number) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, qty: 1 }] };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            increaseQty: (id) =>
                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
                })),

            // Fjerner varen når antallet går ned til 0
            decreaseQty: (id) =>
                set((state) => ({
                    items: state.items
                        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
                        .filter((i) => i.qty > 0),
                })),

            clearCart: () => set({ items: [] }),
        }),
        { name: "cart-storage" },
    ),
);
```

**`app/globals.css`:**

```css
@import "tailwindcss";

/* Fargene i nettbutikken. Hver farge blir en Tailwind-klasse: bg-surface, text-muted, border-line osv. */
@theme {
    --color-background: #16181b;
    --color-surface: #1f2226;
    --color-line: #2c3036;
    --color-foreground: #ecebe8;
    --color-muted: #9aa0a6;
    --color-accent: #7fc8bd;
    --color-plinth: #ecebe7; /* lys bakgrunn bak produktbilder */
}

/* Fonten kommer fra next/font i layout.tsx */
@theme inline {
    --font-sans: var(--font-schibsted), ui-sans-serif, system-ui, sans-serif;
}

@layer base {
    html {
        color-scheme: dark;
    }

    :focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }
}
```

**Poeng om CSS-en:**

- Fargene står i `@theme`. Tailwind lager klasser for hver
  av dem: `--color-surface` blir `bg-surface`,
  `text-surface`, `border-surface` osv. Skal en farge
  endres, endrer vi den ett sted.
- `--color-plinth` er den lyse bakgrunnen bak
  produktbildene. Bildene fra dummyjson har hvit bakgrunn,
  så på en mørk side ser de ut som varer på en hylle i
  stedet for hvite bokser.
- `color-scheme: dark` gjør nettleserens egne deler
  (scrollbar, ×-en i søkefeltet) mørke også.
- `@theme inline` brukes for fonten fordi verdien peker på
  en variabel som `next/font` lager i `layout.tsx`.
- Ellers er all styling Tailwind-klasser rett i
  komponentene.

**Mappestruktur vi ender opp med:**

```
├── app/
│   ├── layout.tsx           ← navbar + <main>, rundt alle sider
│   ├── page.tsx             ← Home   (/)
│   ├── about/page.tsx       ← About  (/about)
│   ├── cart/page.tsx        ← Cart   (/cart)
│   └── products/
│       ├── page.tsx         ← liste + søk (/products?q=...)
│       ├── loading.tsx
│       ├── error.tsx
│       └── [id]/
│           ├── page.tsx     ← detalj (/products/12)
│           └── not-found.tsx
├── components/
│   ├── Navbar.tsx
│   ├── SearchForm.tsx       ← søkeskjema (forsiden + produkter)
│   ├── ProductGrid.tsx      ← produktkort i rutenett
│   ├── CartBadge.tsx        ← "use client"
│   ├── AddToCartButton.tsx  ← "use client"
│   └── Modal.tsx            ← "use client" (ekstra)
├── lib/
│   └── products.ts          ← fetch-funksjoner + typer
└── stores/
    ├── cartStore.ts
    └── useHasHydrated.ts    ← hydration-sjekk (del 4)
```

**`app/layout.tsx`:**

```tsx
import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const font = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });

export const metadata: Metadata = {
    title: { default: "Nettbutikken", template: "%s | Nettbutikken" },
    description: "Nettbutikken fra frontend-nett, nå i Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no" className={font.variable}>
            <body className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Navbar />
                <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">{children}</main>
            </body>
        </html>
    );
}
```

**`components/Navbar.tsx`:**

```tsx
import Link from "next/link";
import CartBadge from "./CartBadge";

const linkClass = "text-sm text-muted transition-colors hover:text-foreground";

export default function Navbar() {
    return (
        <header className="border-b border-line">
            <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
                <Link href="/" className="mr-auto font-bold tracking-tight sm:text-lg">
                    Nettbutikken
                </Link>
                <Link href="/products" className={linkClass}>Produkter</Link>
                <Link href="/about" className={linkClass}>Om oss</Link>
                <Link href="/cart" className={`${linkClass} flex items-center gap-2`}>
                    Handlekurv <CartBadge />
                </Link>
            </nav>
        </header>
    );
}
```

**Poeng:**

- `<Link href>` erstatter `<Link to>` / `<NavLink>` fra
  React Router. Ingen `<BrowserRouter>`, ingen `<Routes>` —
  mappene *er* rutene.
- `layout.tsx` erstatter `App.tsx` med `<Outlet />`:
  `children` er siden som vises.
- `Navbar` er en Server Component, men den kan fint rendre
  `CartBadge`, som er en Client Component. Vi lager den i
  del 4 — inntil da kan dere kommentere den ut.
- `"%s | Nettbutikken"` i `title.template` gjør at hver side
  bare trenger å sette sin egen tittel.
- `next/font` laster ned fonten når appen bygges og
  serverer den selv, så nettleseren slipper å hente den
  fra Google.

---

## 00:20–00:50 — Del 2: Products som Server Component + søk

I uke 38 brukte vi `useState` for status/data/error,
`useEffect` for fetch, `AbortController` for opprydding og
debounce for søket. I Next.js kan nesten alt det forsvinne.

**`lib/products.ts`:**

```ts
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
```

**`app/products/page.tsx`:**

```tsx
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
```

**`components/SearchForm.tsx`:**

```tsx
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
```

**`components/ProductGrid.tsx`:**

```tsx
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
```

**`app/page.tsx`** (forsiden bruker de samme komponentene):

```tsx
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
```

**Poeng:**

- Komponenten er `async` og bruker `await` direkte. Ingen
  `useEffect`, ingen loading-state å holde styr på, ingen
  `AbortController` — fetchen skjer på serveren før HTML-en
  sendes.
- Søket bor i URL-en (`/products?q=phone`), ikke i
  `useState`. Fordeler: lenken kan deles, tilbake-knappen
  fungerer, og siden kan rendres på serveren.
- `<form action="/products">` i `SearchForm` er en vanlig
  GET-form: nettleseren navigerer til `/products?q=...`. Det
  fungerer helt uten JavaScript.
- `searchParams` og `params` er **Promises** i nyere
  Next.js — derfor `await searchParams`. Gamle blogginnlegg
  viser dem som vanlige objekter.
- `next: { revalidate: 3600 }` cacher svaret i en time. Uten
  den hentes data på nytt ved hver forespørsel.
- Vi bruker `<img>` her for å holde det enkelt. `next/image`
  krever at dummyjson-domenet legges inn i `next.config.ts`
  (`images.remotePatterns`) — se hjemmelekse.
- `SearchForm` og `ProductGrid` er egne komponenter fordi
  både forsiden og produktsiden bruker dem. Ingen av dem
  trenger `"use client"`.
- På forsiden venter bare `FeaturedProducts` på data. Den
  ligger i `<Suspense>`, så overskriften og søket vises med
  en gang.

**Sammenlign med uke 38 (vis begge side om side):**

|               | Uke 38 (Vite)                             | Uke 41 (Next.js)                    |
|---------------|-------------------------------------------|-------------------------------------|
| Hente data    | `useEffect` + `fetch` + `AbortController` | `await getProducts()` i komponenten |
| Loading/error | `status`-state i komponenten              | `loading.tsx` / `error.tsx` (del 5) |
| Søketekst     | `useState` + debounce                     | `?q=` i URL-en + `searchParams`     |
| Kjører i      | nettleseren                               | serveren                            |

**Miniøvelse (5 min):** Legg til en `<select name="sort">` i
skjemaet med `price` og `title`, og sorter `products` på
serveren ut fra `searchParams.sort`.

---

## 00:50–01:00 — ☕ Pause

---

## 01:00–01:20 — Del 3: Produktsiden — `products/[id]`

**`app/products/[id]/page.tsx`:**

```tsx
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
```

**`app/products/[id]/not-found.tsx`:**

```tsx
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
```

**Poeng:**

- `[id]` i mappenavnet tilsvarer `path="/products/:id"` +
  `useParams()` i React Router.
- `notFound()` stopper renderingen og viser nærmeste
  `not-found.tsx`. Prøv `/products/99999` i nettleseren.
- `generateMetadata` gir hver produktside sin egen
  `<title>` — se fanen i nettleseren. `getProduct` har
  `"use cache"`, så `getProduct(id)` kalles ikke dobbelt mot
  dummyjson.
- `AddToCartButton` får bare de feltene handlekurven
  trenger. Props fra en Server Component til en Client
  Component må være serialiserbare (tall, strenger, vanlige
  objekter — ikke funksjoner).

---

## 01:20–01:45 — Del 4: Handlekurven — Zustand i Client Components

Zustand-storen bruker hooks og `localStorage`, så den kan
bare brukes i Client Components. `cartStore.ts` trenger
ingen endringer — men alle komponenter som *bruker* den må
ha `"use client"` øverst.

**`components/AddToCartButton.tsx`:**

```tsx
"use client";

import { useCartStore, type CartItem } from "@/stores/cartStore";

type Props = {
    item: Omit<CartItem, "qty">;
};

export default function AddToCartButton({ item }: Props) {
    const addItem = useCartStore((s) => s.addItem);

    return (
        <button
            onClick={() => addItem(item)}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent/85"
        >
            Legg i handlekurv
        </button>
    );
}
```

**Hydration-problemet:** `persist` leser handlekurven fra
`localStorage`, men serveren har ikke `localStorage`.
Serveren rendrer derfor en tom handlekurv, nettleseren
rendrer en med varer,
og React klager over *hydration mismatch*. Vis feilen i
konsollen først, så løsningen:

**`stores/useHasHydrated.ts`:**

```ts
import { useSyncExternalStore } from "react";
import { useCartStore } from "./cartStore";

export function useHasHydrated() {
    return useSyncExternalStore(
        (onChange) => useCartStore.persist.onFinishHydration(onChange),
        () => useCartStore.persist.hasHydrated(),
        () => false, // på serveren: aldri hydrert
    );
}
```

**`components/CartBadge.tsx`:**

```tsx
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
```

**`app/cart/page.tsx`:** `Cart.tsx` fra `week37`, flyttet
hit. Endringer: `"use client"` øverst, `next/link` i stedet
for `react-router`, og `useHasHydrated()` viser «Laster
handlekurv…» til handlekurven er lest fra `localStorage`.

```tsx
"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useHasHydrated } from "@/stores/useHasHydrated";

const secondaryButton = "rounded-full border border-line px-5 py-2.5 transition-colors hover:border-muted";

export default function CartPage() {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearCart = useCartStore((s) => s.clearCart);
    const hydrated = useHasHydrated();

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

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

            <button onClick={clearCart} className={secondaryButton}>
                Tøm handlekurven
            </button>
        </section>
    );
}
```

**Poeng:**

- `"use client"` markerer en *grense*: denne filen og alt
  den importerer sendes
- til nettleseren. Hold grensen så langt ned i treet som
  mulig — en knapp, ikke hele siden.
- `Cart` er et unntak: hele siden er interaktiv og leser fra
  `localStorage`,
- så her er det greit at hele siden er en Client Component.
- Hvorfor `useSyncExternalStore` og ikke `useState` +
  `useEffect`? Den er laget for å lese fra en ekstern kilde
  (her: Zustand sin persist-status), og den har en egen
  server-verdi (`() => false`),
- så server og klient rendrer det samme første gang.

---

## 01:45–01:55 — Del 5: `loading.tsx` og `error.tsx`

**`app/products/loading.tsx`:**

```tsx
export default function Loading() {
    return <p className="text-muted">Laster produkter…</p>;
}
```

**`app/products/error.tsx`:**

```tsx
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
```

**Poeng:**

- `loading.tsx` vises automatisk mens en `async` side i
  samme mappe venter på data.
  Test ved å legge
  `await new Promise((r) => setTimeout(r, 2000))` midlertidig
  i `getProducts`.
- `error.tsx` fanger feil som kastes (`throw new Error(...)`
  i `getProducts`).
  Den **må** være en Client Component fordi `reset` er en
  knapp.
- Dette erstatter `status: "loading" | "error" | "success"`
  -state fra uke 38 — samme idé, men Next.js håndterer det
  per mappe.

---

## 01:55–02:00 — Oppsummering + hjemmelekse

**Snakkepunkter:**

- Samme nettbutikk, mye mindre kode for datahenting: Server
  Components henter data direkte, URL-en holder søket,
  og `loading.tsx`/`error.tsx` tar seg av tilstandene vi
  skrev for hånd før.
- Det som *må* kjøre i nettleseren (knapper, Zustand,
  `localStorage`) lever i små Client Components med
  `"use client"`.
- Hydration mismatch dukker opp når server og nettleser
  rendrer forskjellig
  — alltid sjekk om noe leser fra `localStorage`, `window`
  eller `Date.now()`.

---

## Referanser

- Next.js App Router: <https://nextjs.org/docs/app>
- `searchParams` og
  `params`: <https://nextjs.org/docs/app/api-reference/file-conventions/page>
- `loading.tsx`, `error.tsx`,
  `not-found.tsx`: <https://nextjs.org/docs/app/api-reference/file-conventions>
- `"use client"`: <https://react.dev/reference/rsc/use-client>
- Zustand med
  Next.js: <https://zustand.docs.pmnd.rs/guides/nextjs>
- `useSyncExternalStore`: <https://react.dev/reference/react/useSyncExternalStore>
- DummyJSON API: <https://dummyjson.com/docs/products>

---

## Ekstra: Modal med `<dialog>` og klikk utenfor (ca. 25 min)

Bruk denne delen hvis det er tid igjen, eller som en egen
økt. Vi lager en gjenbrukbar `Modal`-komponent og bruker den
til å be om bekreftelse før handlekurven tømmes. Det er en
vanlig oppgave i ekte prosjekter, og den er lett å gjøre
*nesten* riktig.

### Hvorfor `<dialog>` og ikke en `<div>`?

Det er fristende å lage en modal av en `<div>` med
`position: fixed`. Men da må vi selv lage alt nettleseren
allerede kan:

|                                       | `<div>` med `position: fixed`  | `<dialog>` + `showModal()`          |
|---------------------------------------|--------------------------------|-------------------------------------|
| Lukk med Escape                       | Må skrives selv                | Innebygd                            |
| Fokus flyttes inn i modalen           | Må skrives selv                | Innebygd                            |
| Tab blir inne i modalen               | Må skrives selv (focus trap)   | Innebygd (resten av siden er inert) |
| Fokus tilbake til knappen etterpå     | Må skrives selv                | Innebygd                            |
| Ligger over alt annet                 | `z-index`-krig                 | Egen "top layer", ingen `z-index`   |
| Mørk bakgrunn bak                     | Egen `<div>` som overlay       | `::backdrop`                        |
| Skjermlesere forstår at det er dialog | `role="dialog"` + `aria-modal` | Innebygd                            |

**Snakkepunkt:** "Bruk plattformen." Alt i høyre kolonne er
tilgjengelighet vi får gratis. Det eneste nettleseren *ikke*
gjør for oss er å lukke modalen når man klikker utenfor. Det
skriver vi selv.

### Slik fungerer klikk utenfor

Når en `<dialog>` er åpnet med `showModal()`, regnes et
klikk på backdropen (det mørke feltet rundt) som et klikk på
**selve `<dialog>`-elementet**. Trikset er derfor:

1. Ha **ingen padding** på `<dialog>`, og legg alt innhold i
   en `<div>` inni.
2. Da er `event.target === event.currentTarget` bare sant
   når man klikker *utenfor* innholdet.

```
┌──────────── <dialog> (target === currentTarget) ─────────────┐
│   backdrop: klikk her → lukk                                 │
│        ┌──────── <div className="p-6"> ────────┐             │
│        │  klikk her → target er div/knapp/tekst│             │
│        │  → ingenting skjer                    │             │
│        └───────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

**Fallgruve vi også fikser:**
hvis brukeren markerer tekst inni modalen og slipper musa
*utenfor*,
får `<dialog>` et `click`-event (klikket "havner" på felles
forelder).
Uten ekstra sjekk lukkes modalen midt i en tekstmarkering.
Løsningen er å huske hvor musknappen ble trykket *ned*, og
bare lukke hvis både `mousedown` og `click` skjedde på
backdropen.

### Walkthrough — `components/Modal.tsx`

```tsx
"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const pressedOnBackdrop = useRef(false);
    const titleId = useId();

    // Synkroniser React-state (open) med nettleserens dialog
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    function handleMouseDown(event: React.MouseEvent<HTMLDialogElement>) {
        pressedOnBackdrop.current = event.target === event.currentTarget;
    }

    function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
        const clickedBackdrop = event.target === event.currentTarget;
        if (pressedOnBackdrop.current && clickedBackdrop) {
            onClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            aria-labelledby={titleId}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface text-foreground shadow-2xl backdrop:bg-black/60"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-xl font-semibold">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Lukk"
                        className="text-2xl leading-none text-muted hover:text-foreground"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </dialog>
    );
}
```

**Poeng — gå gjennom én ting av gangen:**

- **`"use client"`**: `useRef`, `useEffect` og
  klikk-håndtering kjører bare i nettleseren.
- **Kontrollert komponent**: forelderen eier `open`-staten,
  akkurat som med kontrollerte `<input>`-felt. `Modal`
  bestemmer ikke selv når den er åpen, den sier bare fra med
  `onClose`.
- **`useEffect` + `ref`**: `showModal()` og `close()` er
  metoder på DOM-elementet, ikke props. Derfor trenger vi en
  `ref` og en effekt som oversetter `open` til riktig
  metodekall. Sjekkene `!dialog.open` / `dialog.open`hindrer
  feilen "already open" hvis effekten kjører to ganger
  (Strict Mode).
- **`onClose`**: nettleseren sender `close`-eventet uansett
  *hvordan* dialogen lukkes, også med Escape. Derfor holder
  React-staten seg i synk selv om vi aldri skriver kode for
  Escape.
- **`useId()`**: gir en unik id, så `aria-labelledby`
  fungerer selv om det er flere modaler på siden.
  Skjermleseren leser opp tittelen når modalen åpnes.
- **`pressedOnBackdrop`** er en `ref` og ikke `useState`,
  fordi verdien ikke skal vises noe sted. Vi trenger bare å
  huske den mellom `mousedown` og `click`, uten ny
  rendering.
- **`m-auto`**: Tailwind sin reset setter `margin: 0` på
  alle elementer, og det fjerner nettleserens sentrering av
  `<dialog>`. `m-auto` setter den tilbake.
- **`backdrop:bg-black/60`**: Tailwind sin variant for
  `::backdrop`, det mørke laget bak modalen.

### Lås scrolling bak modalen

`<dialog>` stopper ikke siden bak fra å scrolle. Legg til én
regel nederst i `app/globals.css`:

```css
body:has(dialog[open]) {
    overflow: hidden;
}
```

`:has()` betyr "body som *inneholder* en åpen dialog". Ingen
JavaScript nødvendig.

### Bruk den: bekreft før handlekurven tømmes

I `app/cart/page.tsx` (hele filen):

```tsx
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
```

**Poeng:**

- `useState` må stå **før** `if (!hydrated) return ...`.
  Hooks må kalles i samme rekkefølge hver gang, så ingen
  hooks etter en early return.
- `useState` og `Modal` importeres øverst, siden versjonen
  fra del 4 ikke brukte dem.
- Knappen "Tøm handlekurven" tømmer ikke lenger direkte, den
  åpner bare modalen. Selve handlingen skjer i
  `handleConfirmClear`.
- Den farlige knappen er rød, og "Avbryt" står først. Det er
  vanlig praksis for handlinger som ikke kan angres.

### Test sammen med klassen

Gå gjennom denne listen live. Hvert punkt er noe vi enten
skrev kode for, eller fikk gratis fra `<dialog>`:

1. Klikk "Tøm handlekurven" → modalen åpnes, fokus står på
   første knapp (×).
2. Trykk **Tab** flere ganger → fokus går rundt *inni*
   modalen, aldri til navbaren bak.
3. Trykk **Escape** → modalen lukkes, og fokus er tilbake på
   "Tøm handlekurven".
4. Klikk på det mørke feltet utenfor → modalen lukkes.
5. Klikk på teksten *inni* modalen → ingenting skjer.
6. Marker teksten inni modalen og slipp musa utenfor →
   modalen blir stående.
7. Prøv å scrolle siden bak mens modalen er åpen → ingenting
   skjer.
8. Klikk "Tøm" → handlekurven tømmes og modalen lukkes.

### Miniøvelse (10 min)

Bruk den samme `Modal`-komponenten i `AddToCartButton`: når
man legger noe i handlekurven, vis en modal med
"«{item.title}» er lagt i handlekurven" og to knapper:
"Fortsett å handle" (lukker) og "Gå til handlekurven"
(`<Link href="/cart">`). Hint: komponenten trenger sin egen
`useState` for `open`, og lenken må også lukke modalen.

### Referanser for modal

- `<dialog>`
  -elementet: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog>
- `::backdrop`: <https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop>
- `useRef` til
  DOM-elementer: <https://react.dev/learn/manipulating-the-dom-with-refs>
- `useId`: <https://react.dev/reference/react/useId>
- Tailwind `backdrop:`
  -varianten: <https://tailwindcss.com/docs/hover-focus-and-other-states#dialog-backdrops>
