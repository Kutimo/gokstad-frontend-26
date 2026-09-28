# Uke 38 — Zustand + videre på nettbutikken fra uke 37 (2 timer)

Bygger videre på `week35` (props, `useState`, løfte state opp), `week36`/`week37` (routing, `useEffect`, fetch) og `week37/src/zustand.md` (Zustand-referansen). Dagens plan har to deler: (1) repetere Zustand med teller-appen som allerede ligger i `week38/src/`, og (2) bruke resten av tiden på å live-code videre på selve nettbutikken fra uke 37 — det er der elevene faktisk får bruk for det de har lært.

**Stack:** React 19.2 + TypeScript 6 + Vite 8, React Router 8,
Zustand 5. Ingen `import React from "react"` trengs lenger (ny JSX-transform) — bare importer hooks du faktisk bruker.

**Merk:** alle variabel-, funksjons- og typenavn i kodeeksemplene under er på engelsk (vanlig konvensjon i React/TS-prosjekter). Snakkepunkter og UI-tekst er på norsk, som resten av appen.

**Praktisk:** del 1 kjøres i `week38`-prosjektet (allerede satt opp). Del 2 kjøres i elevenes egen kopi av `week37`-prosjektet — koden under er en fasit, ikke noe som er gjort i det faktiske prosjektet ennå.

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                                                 |
|-------------|----------|------------------------------------------------------|
| 00:00–00:05 | 5 min    | Intro — hvor står vi?                                |
| 00:05–00:25 | 20 min   | Del 1: Zustand — gjennomgang av dagens teller-app    |
| 00:25–00:55 | 30 min   | Del 2a: Cart — legg til antallskontroll (øk/reduser) |
| 00:55–01:05 | 10 min   | ☕ Pause                                             |
| 01:05–01:40 | 35 min   | Del 2b: Products — ekte data fra dummyjson + søk     |
| 01:40–01:55 | 15 min   | Del 2c: Home og About — reelt innhold                |
| 01:55–02:00 | 5 min    | Oppsummering + hjemmelekse                           |

---

## 00:00–00:05 — Intro

**Snakkepunkter:**
- Hittil: komponenter, props, `useState`, løfte state opp, CSS, routing, `useEffect` + fetch, og Zustand ble introdusert i uke 37 med handlekurven.
- I dag: en kort repetisjon av Zustand-mønsteret med teller-appen, og så rett over i å faktisk bygge videre på nettbutikken — handlekurven mangler antallskontroll, produktlisten er fortsatt hardkodet, og Home/About er tomme.

---

## 00:05–00:25 — Del 1: Zustand — gjennomgang av dagens app

Appen ligger allerede i `week38/src/`. Åpne de tre filene og gå gjennom dem sammen med klassen.

**`src/store/useCounterStore.ts`:**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CounterStore = {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
};

export const useCounterStore = create<CounterStore>()(
    persist(
        (set) => ({
            count: 0,
            increment: () => set((state) => ({ count: state.count + 1 })),
            decrement: () => set((state) => ({ count: state.count - 1 })),
            reset: () => set({ count: 0 }),
        }),
        { name: "counter-storage" },
    ),
);
```

**Snakkepunkter:**
- `create<CounterStore>()(persist(...))` —
den doble `()()` er nødvendig fordi TypeScript ikke klarer å utlede 
- generic-typen gjennom middleware-wrapperen. Se `zustand.md` §10 hvis noen spør hvorfor.
- `persist` lagrer state i `localStorage` under nøkkelen `"counter-storage"` — reload siden og vis at tallet overlever.
- `Visning.tsx` og `Button.tsx` er søskenkomponenter under `App`. Ingen av dem får props, og `App` sender ingenting nedover — de deler likevel samme `count` fordi de begge abonnerer direkte på storen.

**Walkthrough — pek på selector-mønsteret:**

```tsx
// Visning.tsx
const count = useCounterStore((state) => state.count);

// Button.tsx
const increment = useCounterStore((state) => state.increment);
```

- Hver komponent henter *bare* det den trenger. Endrer `count`, re-rendrer kun `Visning` — ikke `Knapper`. Vis dette med en `console.log("Knapper rendret")` øverst i `Knapper` og klikk `+1` noen ganger.

**Miniøvelse (5 min):** Legg til en `double`-action i storen (`double: () => set((state) => ({ count: state.count * 2 }))`) og en tilhørende knapp i `Button.tsx`.

**Bro til del 2:** Dette er akkurat samme mønster som `cartStore.ts` i uke 37 bruker (`set`, immutable oppdatering, `persist`). Nå tar vi det mønsteret og utvider en ekte store i et ekte prosjekt.

---

## 00:25–00:55 — Del 2a: Cart — antallskontroll

**Utgangspunkt i `week37`:** `cartStore.ts` har i dag bare `addItem`, `removeItem` og `clear`. Å øke antallet på en vare i handlekurven krever å fjerne den og legge den til på nytt — ikke bra UX. Vi legger til `increaseQty` og `decreaseQty`, akkurat som vi nettopp la til `double` på telleren.

**Walkthrough — utvid `src/stores/cartStore.ts`:**

```ts
addItem: (item) =>
    set((state) => {
        const existing = state.items.find((i) => i.id === item.id);

        if (existing) {
            const updatedItems = state.items.map((i) =>
                i.id === item.id ? {...i, qty: i.qty + 1} : i
            );
            return {items: updatedItems};
        } else {
            const newItems = [...state.items, {
                ...item,
                qty: 1
            }];
            return {items: newItems};
        }
    })


type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    increaseQty: (id: number) => void;
    decreaseQty: (id: number) => void;
    clear: () => void;
};
```

```ts
increaseQty: (id) =>
    set((state) => ({
        items: state.items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
        ),
    })),

decreaseQty: (id) =>
    set((state) => ({
        items: state.items
            .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
    })),
```

**Poeng:**
- Samme immutable mønster som `addItem` fra før (`zustand.md` §5): `.map(...)` bygger en ny array, ingen muterer `state.items` direkte.
- `decreaseQty` kjeder `.filter((i) => i.qty > 0)` etter `.map(...)` — når antallet går til 0, forsvinner varen automatisk fra listen i stedet for å vise "0 stk".

**Walkthrough — koble til `src/pages/Cart.tsx`:**

```tsx
const increaseQty = useCartStore((s) => s.increaseQty);
const decreaseQty = useCartStore((s) => s.decreaseQty);
```

Bytt ut den statiske `{item.qty} x {item.price} kr`-linjen med:

```tsx
<div className="qty-controls">
    <button onClick={() => decreaseQty(item.id)} aria-label={`Reduser antall for ${item.title}`}>-</button>
    <span className="qty-value">{item.qty}</span>
    <button onClick={() => increaseQty(item.id)} aria-label={`Øk antall for ${item.title}`}>+</button>
</div>
<span className="cart-item-subtotal">{item.price * item.qty} kr</span>
```

**Live i klassen:** legg til varer, klikk `+`/`-`, se totalen (`total`-utregningen i `Cart.tsx` bruker allerede `item.qty`, så den oppdaterer seg selv — ingen endring nødvendig der). Reload siden og bekreft at antallet fortsatt er riktig (`persist`).

**Miniøvelse (5 min):** Legg til en disabled-tilstand på `-`-knappen når `item.qty === 1` (valgfritt UX-poeng — diskuter om `decreaseQty` heller burde ha en `min`-grense enn å fjerne varen ved 0).

---

## 00:55–01:05 — ☕ Pause

---

## 01:05–01:40 — Del 2b: Products — ekte data + søk

**Utgangspunkt:** `Products.tsx` viser i dag en hardkodet liste (`Shirt`/`Pants`/`Hats` med id 1–3), mens `ProductDetail.tsx` 
allerede fetcher ekte data fra `dummyjson.com` —
id-ene stemmer altså ikke overens. Vi fikser dette og legger til et kontrollert søkefelt samtidig.

**Walkthrough — erstatt hele `src/pages/Products.tsx`:**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router";

type Product = {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
};

type ProductsResponse = {
    products: Product[];
};

export default function Products() {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            async function fetchProducts() {
                setLoading(true);
                setError(false);
                try {
                    const url = query.trim()
                        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
                        : "https://dummyjson.com/products?limit=20";
                    const response = await fetch(url, { signal: controller.signal });
                    if (!response.ok) throw new Error(String(response.status));
                    const data: ProductsResponse = await response.json();
                    setProducts(data.products);
                } catch (err) {
                    if (err instanceof DOMException && err.name === "AbortError") return;
                    setError(true);
                } finally {
                    setLoading(false);
                }
            }

            void fetchProducts();
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query]);

    return (
        <div>
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk etter produkter..."
                className="product-search"
            />

            {loading && <p>Laster...</p>}
            {!loading && error && <p>Noe gikk galt.</p>}
            {!loading && !error && products.length === 0 && <p>Ingen produkter funnet.</p>}

            {!loading && !error && products.length > 0 && (
                <ul className="product-grid">
                    {products.map((product) => (
                        <li key={product.id} className="product-card">
                            <Link to={`/products/${product.id}`}>
                                <img src={product.thumbnail} alt={product.title} width={160} height={160} />
                                <span className="product-title">{product.title}</span>
                                <span className="product-price">{product.price} kr</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

**Bygg det opp i tre steg foran klassen, ikke lim inn alt på én gang:**

1. **Kontrollert søkefelt først, 
uten fetch:** `const [query, setQuery] = useState("")` + `<input value={query} onChange={...} />`. 
Dette er akkurat samme kontrollert-input-mønster som 
`increaseQty`-knappene og skjemaer generelt: `value` fra state, `onChange` skriver tilbake.
2. **Legg til fetch i en `useEffect`** som kjører på mount 
(tom liste `products = []` → `useEffect(() => {...}, [])`), 
fortsatt uten å bruke `query`. Vis at listen fylles med ekte dummyjson-produkter.
3. **Koble `query` inn:** legg `query` i dependency-arrayen, 
bytt URL basert på om `query` er tom, og *så* legg til `setTimeout` + `AbortController`.
Spør klassen: "hva skjer om vi fjerner debounce-en og skriver raskt?" — åpne nettverksfanen i devtools og tell antall requests med og uten `setTimeout`.

**Poeng å trekke fram:**
- `setTimeout(..., 300)` + `clearTimeout` i opprydningsfunksjonen er **debounce**:
hvert tastetrykk nullstiller timeren, så vi fetcher først 300ms etter siste tastetrykk 
— ikke på hver bokstav.
- `AbortController` kansellerer forrige forespørsel når `query` endres før 
den rakk å svare. Dette løser et ekte race condition: uten det kan et raskt, tidlig søk komme tilbake
*etter* et senere og overskrive riktig resultat med feil resultat. Vis dette ved å sette en kunstig treg URL
(`&delay=2000` støttes ikke av dummyjson, 
så demonstrer heller med `console.log` i `.then` og skriv fort i søkefeltet).
- Nå stemmer id-ene i produktlisten overens med 
`ProductDetail.tsx`, som allerede fetcher fra samme API — klikk et produkt og bekreft at riktig produkt vises.

**Miniøvelse (10 min):** Legg til en "Nullstill søk"-knapp som setter `query` tilbake til `""`, og en tekst som viser `Fant {products.length} produkter`.

---

## 01:40–01:55 — Del 2c: Home og About

Raskt — dette er innholdsarbeid, ikke nye konsepter.

```tsx
// src/pages/Home.tsx
import { Link } from "react-router";
import hero from "../assets/hero.png";

export default function Home() {
    return (
        <section className="hero">
            <div className="hero-text">
                <h1>Gear up for less</h1>
                <p>Ferske varer hver uke, rett hjem til deg. Fri frakt over 500 kr.</p>
                <Link to="/products" className="hero-cta">Se produkter</Link>
            </div>
            <img src={hero} alt="" className="hero-image" />
        </section>
    );
}
```

```tsx
// src/pages/About.tsx
export default function About() {
    return (
        <section className="about">
            <h1>Om oss</h1>
            <p>
                Vi er en liten nettbutikk bygget som klasseprosjekt. Alle produktene
                dere ser her kommer fra et offentlig produktkatalog-API, og alt dere
                legger i handlekurven lagres i nettleseren — så den er der neste
                gang dere er innom.
            </p>
            <p>Bygget med React, TypeScript, React Router og Zustand.</p>
        </section>
    );
}
```

**Snakkepunkt:** `hero.png` ligger allerede i `src/assets/` — pek på at bilder importeres som moduler i Vite (`import hero from "../assets/hero.png"`), ikke refereres med en streng-path, og at Vite håndterer hashing/optimalisering av dette ved bygg.

**Miniøvelse (5 min):** Legg til CSS-klassene som brukes over (`.qty-controls`, `.product-grid`, `.product-card`, `.hero`, `.hero-text`, `.hero-cta`, `.hero-image`) i `src/index.css`, i samme mørke fargepalett som resten av appen (`#1a1a1a` bakgrunn, `#6ea8fe` aksentfarge).

---

## 01:55–02:00 — Oppsummering + hjemmelekse

**Snakkepunkter:**
- I dag koblet vi Zustand-mønsteret fra teller-appen direkte til et ekte problem: en handlekurv som manglet en funksjon. Samme `set` + immutable oppdatering, bare i et større prosjekt.
- Kontrollert input (søkefeltet) og `useEffect`-opprydding (`AbortController`, `clearTimeout`) er de to tingene som går igjen overalt når dere bygger noe som henter data basert på det brukeren skriver — ikke bare i denne nettbutikken.

**Hjemmelekse:**
1. Fullfør Products-, Cart-, Home- og About-endringene fra i dag i egen `week37`-kopi, hvis dere ikke rakk alt i timen.
2. Trekk fetch-logikken i `Products.tsx` ut i en gjenbrukbar hook, `useFetch<T>(url: string)`, som returnerer `{ status, data, error }` (samme `AbortController`-mønster som over). Bruk den i både `Products.tsx` og `ProductDetail.tsx`.
3. Skriv om søkefeltets `useState`-håndtering med `useReducer` hvis dere vil ha flere filtre senere (f.eks. `{ type: "SET_QUERY", value: string } | { type: "SET_SORT", value: "price" | "title" }`) — merk hvor likt dette er `cartStore.ts` sitt `set`-mønster, bare uten Zustand.
4. (Frivillig) Legg til en `useLocalStorage<T>`-hook og la søketeksten overleve en reload, akkurat som handlekurven gjør med `persist`.

---

## Referanser

- Zustand: <https://zustand.docs.pmnd.rs>
- DummyJSON API: <https://dummyjson.com/docs/products>
- React-dokumentasjon om skjemaer: <https://react.dev/reference/react-dom/components/input>
- `useEffect`-opprydding: <https://react.dev/reference/react/useEffect#connecting-to-an-external-system>
- Bygge egne hooks: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- `useReducer`: <https://react.dev/reference/react/useReducer>
