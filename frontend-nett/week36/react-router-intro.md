# Intro til React Router + useEffect (2 timer)

1.3.1 Oppsett av react-router-dom
1.3.2 Grunnleggende routing: Routes, Route, Link
1.3.3 Nested routes og Outlet
1.3.4 Dynamiske ruter med useParams og useNavigate
1.4.1 useEffect — hva og hvorfor
1.4.2 useEffect og datahenting
1.4.3 useEffect og opprydding (cleanup)

> **Merk:** Vi bruker kun "declarative mode" i React Router (`BrowserRouter`, `Routes`, `Route`).
> Vi går **ikke** inn på "framework mode" (data-routere, `loader`/`action`, filbasert routing) i dag — det er tema for en senere økt.

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                                     |
|-------------|----------|------------------------------------------|
| 00:00–00:10 | 10 min   | Intro + installasjon av react-router-dom |
| 00:10–00:25 | 15 min   | 1.3.2 Grunnleggende routing              |
| 00:25–00:40 | 15 min   | 1.3.3 Nested routes og Outlet            |
| 00:40–00:55 | 15 min   | 1.3.4 useParams og useNavigate           |
| 00:55–01:05 | 10 min   | ☕ Pause                                  |
| 01:05–01:20 | 15 min   | 1.4.1 useEffect — hva og hvorfor         |
| 01:20–01:35 | 15 min   | 1.4.2 useEffect og datahenting           |
| 01:35–01:50 | 15 min   | 1.4.3 useEffect og opprydding            |
| 01:50–02:00 | 10 min   | Oppsummering + hjemmeoppgaver            |

---

## Forberedelser (før økten)

- Et eksisterende Vite + React (+TS) prosjekt fra tidligere uker, eller nytt: `npm create vite@latest`
- Node.js installert (LTS versjon)
- Kodeeditor (VS Code anbefalt)
- Terminal klar

---

## 00:00–00:10 — Intro og installasjon

**Snakkepunkter:**
- I dag: hvordan bytte mellom "sider" i en React-app uten at nettleseren laster siden på nytt (Single Page Application).
- React Router er det mest brukte biblioteket for dette.
- Vi bruker **kun routing-delen** i dag (`BrowserRouter`, `Routes`, `Route`, `Link`) 
- — ikke hele "framework mode" med `loader`/`action` og filbasert routing. Det er en egen, større ting.

**Walkthrough — installer og sett opp:**

```bash
npm install react-router-dom
```

Pakk hele appen inn i `BrowserRouter` i `main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- Poeng: `BrowserRouter` må ligge **rundt** hele appen (eller i hvert fall rundt alt som skal bruke routing) — den gir resten av treet tilgang til routing via Context.

---

## 00:10–00:25 — 1.3.2 Grunnleggende routing

**Snakkepunkter:**
- `Routes` ser på nettleserens URL og velger **én** `Route` som matcher `path`.
- `element`-propen på `Route` sier hvilken komponent som skal vises.
- `Link` erstatter vanlig `<a href="...">` — bytter side **uten** full sideinnlasting.

**Walkthrough:**

```tsx
// App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import "./App.css";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
```

```tsx
// pages/Home.tsx
function Home() {
  return <h1>Welcome!</h1>;
}

export default Home;
```

Litt enkel styling på navigasjonen (ingenting fancy — bare nok til at den ikke ser ustylet ut):

```css
/* App.css */
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: lightblue;
  border-bottom: 1px solid #ddd;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

nav a:hover {
  text-decoration: underline;
}
```

- Poeng: dette er samme `App.css` som brukes videre i de neste eksemplene (`Layout.tsx` osv.) — ingen grunn til å style hvert eksempel på nytt.

- Vis vanlig feil: bruke `<a href="/about">` i stedet for `<Link to="/about">` 
- — appen laster på nytt og mister React-tilstanden.
- Vis nettleserens adressefelt og "frem/tilbake"-knappene som virker automatisk.

**Miniøvelse (4–5 min):**
Legg til en tredje side, `Contact`, med egen rute `/contact` og en lenke i navigasjonen.

---

## 00:25–00:40 — 1.3.3 Nested routes og Outlet

**Snakkepunkter:**
- Ruter kan nøstes — en "layout"-komponent (f.eks. med felles header/nav) kan ha egne underruter.
- `Outlet` er der React Router rendrer den matchende **barne**-ruten inni layout-komponenten.

**Walkthrough:**

```tsx
// Layout.tsx
import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/products">Products</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default Layout;
```

```tsx
// App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
      </Route>
    </Routes>
  );
}

export default App;
```

- Poeng: `index` markerer standard-ruten som vises på `/` inni `Layout`.
- Poeng: barne-rutene har **ikke** skråstrek foran (`"about"`, ikke `"/about"`) — de bygges sammen med forelderens path.

**Miniøvelse (4–5 min):**
Flytt navigasjonen inn i `Layout` (om den ikke allerede er det) og legg til en ny underside `Contact` som nøstet rute.

---

## 00:40–00:55 — 1.3.4 Dynamiske ruter med useParams og useNavigate

**Snakkepunkter:**
- `:id` i en path er en **parameter** — matcher hva som helst på den posisjonen i URL-en.
- `useParams()` leser ut parameterne fra gjeldende URL.
- `useNavigate()` lar oss bytte side programmatisk (f.eks. etter et knappetrykk eller et skjema).
- `path="*"` fanger opp URL-er som ikke matcher noen annen rute — bra for en 404-side.

**Walkthrough:**

```tsx
// pages/Products.tsx
import { Link } from "react-router-dom";

const products = [
  { id: 1, name: "Shirt" },
  { id: 2, name: "Pants" },
  { id: 3, name: "Shoes" },
];

function Products() {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <Link to={`/products/${p.id}`}>{p.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Products;
```

```tsx
// pages/ProductDetail.tsx
import { useNavigate, useParams } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <h2>Product #{id}</h2>
      <button onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
}

export default ProductDetail;
```

```tsx
// App.tsx (utdrag)
<Route path="products" element={<Products />} />
<Route path="products/:id" element={<ProductDetail />} />
<Route path="*" element={<h2>404 — Page not found</h2>} />
```

- Poeng: `useParams` returnerer alltid `string` (eller `undefined`) — må konverteres selv (`Number(id)`) hvis du trenger et tall.
- Nevn `navigate("/products")` vs. `navigate(-1)` (gå tilbake i historikken).

**Miniøvelse (5 min):**
Legg til en "Buy"-knapp på `ProductDetail` som bruker `navigate("/receipt")` til en ny side.

---

## 00:55–01:05 — Pause ☕

---

## 01:05–01:20 — 1.4.1 useEffect — hva og hvorfor

**Snakkepunkter:**
- Render-funksjonen til en komponent skal være "ren" — den skal bare regne ut hva som skal vises.
- Ting som **ikke** hører hjemme direkte i rendering kalles
- **side effects**: datahenting, tidtakere, abonnementer, manuell DOM-manipulasjon.
- `useEffect(setup, deps)` kjører `setup` **etter** at React har oppdatert skjermen.
- `deps` (dependency-arrayet) styrer **når** effekten kjører på nytt:
  - Ingen array → kjører etter **hver** rendering (nesten aldri det du vil ha).
  - Tomt array `[]` → kjører **kun én gang**, når komponenten monteres.
  - Array med verdier `[a, b]` → kjører på nytt når `a` eller `b` endrer seg.

**Walkthrough:**

```tsx
import { useEffect, useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default Counter;
```

- Kjør appen og vis at fane-tittelen i nettleseren oppdateres — helt utenfor selve JSX-en.
- Vis konsekvensen av å fjerne `[count]` (kjører hver gang, uansett) og av å ha `[]` 
- (tittelen "fryser" på første verdi).

**Miniøvelse (3–4 min):**
Lag en komponent som logger `console.log("Component mounted")` én gang med `useEffect` og tomt array. Bekreft i konsollen at det bare skjer én gang, selv om komponenten rendres på nytt av andre grunner.

---

## 01:20–01:35 — 1.4.2 useEffect og datahenting

**Snakkepunkter:**
- Vanligste bruk av `useEffect`: hente data fra et API når komponenten vises (eller når en parameter endrer seg).
- Kombiner gjerne med `useParams` fra tidligere — hent data basert på `id` fra URL-en.
- Husk `async`/`await` kan **ikke** brukes direkte på selve effekt-funksjonen — lag en egen `async`-funksjon inni.

**Walkthrough:**

```tsx
// pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Product = {
  id: number;
  title: string;
  price: number;
};

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        setProduct(response.ok ? await response.json() : null);
      } finally {
        setLoading(false);
      }
    }

    void fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found 😢</p>;

  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.price} kr</p>
    </div>
  );
}

export default ProductDetail;
```

- Poeng (ESLint): `setLoading(true)` er flyttet **inn i** `fetchProduct` i stedet for å stå direkte i effekt-kroppen. Regelen `react-hooks/set-state-in-effect` klager på en setter som kalles synkront rett i effekten (kan trigge unødvendige ekstra renderinger) — inni en `async`-funksjon som effekten selv kaller, er det derimot forventet mønster.
- Poeng (ESLint): `void fetchProduct();` markerer eksplisitt at vi bevisst ikke venter på Promise-en fra effekten (som uansett ikke kan være `async` selv). Uten `void` klager linteren med "Promise returned from fetchProduct is ignored".
- Poeng (bug): en tidligere versjon av dette eksempelet brukte `fakestoreapi.com`, som svarer med status 200 og en **tom body** for en id som ikke finnes — `response.json()` kastet da en feil, og siden koden ikke hadde `try`/`finally`, ble `setLoading(false)` **aldri** kjørt (siden ble stående på "Loading product..." for alltid). `dummyjson.com` svarer derimot med en ordentlig `404`-status, så vi kan sjekke `response.ok` direkte — ingen behov for å parse tekst manuelt.
- Poeng: `finally` garanterer at `setLoading(false)` kjører uansett om `fetch` lykkes eller feiler (f.eks. ved nettverksfeil) — uten den kan siden i verste fall stå fast på "Loading product..." for alltid.

- Poeng: `[id]` som dependency betyr at data hentes **på nytt** hver gang bruker navigerer til et nytt produkt-id, uten at hele siden lastes.
- Nevn: vanlig feil er å glemme `id` i dependency-arrayet — da vises "gammelt" produkt selv om URL-en har endret seg (stale data).

**Miniøvelse (5–6 min):**
Legg til en `error`-state som fanger opp feil (f.eks. med `try/catch` rundt `fetch`) og vis en feilmelding i UI-et hvis noe går galt.

---

TODO: Check this code and learn it!  

## 01:35–01:50 — 1.4.3 useEffect og opprydding (cleanup)

**Snakkepunkter:**
- Noen effekter må **ryddes opp** når komponenten forsvinner (unmountes) 
- eller før effekten kjører på nytt — ellers får vi minnelekkasjer eller duplikate abonnementer.
- Løsning: `useEffect` kan **returnere en funksjon** — den kjøres automatisk som opprydding.
- Typiske eksempler: `setInterval`/`setTimeout`, `addEventListener`, WebSocket-abonnementer.

**Walkthrough:**

```tsx
import { useEffect, useState } from "react";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return <p>{time.toLocaleTimeString()}</p>;
}

export default Clock;
```

```tsx
import { useEffect, useState } from "react";

function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <p>Window width: {width}px</p>;
}

export default WindowWidth;
```

- Vis hva som skjer **uten** cleanup: naviger bort fra `Clock` og tilbake flere ganger — flere `setInterval` kjører samtidig (kan sees ved at klokka "hakker" eller ved en `console.log` i intervallet).
- Poeng: cleanup-funksjonen kjører **både** rett før effekten kjører på nytt (pga. endret dependency), og når komponenten unmountes helt.

**Miniøvelse (5 min):**
Legg til opprydding i `Counter`-komponenten fra tidligere: bruk `useEffect` til å legge på en `keydown`-listener som øker `count` når man trykker mellomrom, og sørg for at listeneren fjernes riktig.

---

## 01:50–02:00 — Oppsummering

**Gjennomgå kort:**
- `BrowserRouter` + `Routes` + `Route` + `Link` gir navigasjon uten sideinnlasting (declarative mode — ikke framework mode)
- Nested routes + `Outlet` for delt layout mellom sider
- `useParams` for å lese URL-parametere, `useNavigate` for å bytte side i kode
- `useEffect` kjører side effects **etter** rendering, styrt av dependency-arrayet
- Vanligste bruk: datahenting basert på props/params, samt abonnementer/tidtakere med cleanup-funksjon

**Hjemmeoppgave / videre øving:**
1. Bygg en liten "produktkatalog"-app: en produktliste-side (`/products`) og en detaljside (`/products/:id`) som henter data med `fetch` inni `useEffect`, basert på `id` fra `useParams`.
2. Legg til en `Layout`-komponent med felles navigasjon via `Outlet`, og en 404-side som fanger opp `path="*"`.
3. Lag en komponent med et `setInterval` (f.eks. en enkel nedtelling) og sørg for at intervallet ryddes opp riktig med en cleanup-funksjon i `useEffect`.

---

## Ressurser

- [React Router-dokumentasjon](https://reactrouter.com)
- [React-dokumentasjon: useEffect](https://react.dev/reference/react/useEffect)
- [React-dokumentasjon: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
