# Uke 42 — Next.js med flere API-er: Ringenes Herre-oppslagsverk (2 timer)

Bygger videre på `week41` (App Router, Server Components,
`searchParams`, dynamiske ruter, `loading.tsx`/`error.tsx`).
Nytt i dag: én fil for alle API-kall, `"use cache"` og `<Suspense>`.
I dag lager vi en ny Next-app som henter data fra **tre
forskjellige API-er** og setter dem sammen til én side.

**Hvorfor tre
API-er?** [The One API](https://the-one-api.dev/documentation)
har bøker, filmer, karakterer og sitater, men **ingen
bilder**. Bøkene har bare `_id` og `name`, og karakterene
har
tekstfelter og en `wikiUrl`. Bildene må vi derfor hente
andre
steder:

| API                                                               | Hva vi bruker det til      | Nøkkel?                                |
|-------------------------------------------------------------------|----------------------------|----------------------------------------|
| [The One API](https://the-one-api.dev) (`/v2`)                    | Bøker, karakterer, sitater | `/book` nei, alt annet **ja** (gratis) |
| [Tolkien Gateway](https://tolkiengateway.net/w/api.php) (MediaWiki) | Bilde av hver karakter   | Nei                                    |
| [Open Library](https://openlibrary.org/dev/docs/api/covers)       | Bokomslag                  | Nei                                    |

**Stack:** Next.js 16 (App Router,`cacheComponents: true`) +
React 19 + TypeScript 5, **CSS Modules** (innebygd i Next,
ingen ekstra pakker). Ingen Tailwind og ingen Zustand i dag.
All henting skjer i Server Components.

**Merk:** all kode er på engelsk: variabelnavn, kommentarer
og
tekst i appen. Snakkepunktene under er på norsk.

**Praktisk (før timen):**

- Hver elev lager en gratis bruker på
  <https://the-one-api.dev/sign-up> og kopierer API-nøkkelen
  sin. Det tar 1 minutt, men gjør det **før** timen, så vi
  ikke venter på e-post.
- Grensen er **100 forespørsler per 10 minutter**. Grensen
  gjelder per **IP-adresse**, ikke bare per nøkkel, så hele
  klassen på samme nett deler den! Vi cacher med
  `"use cache"`,
  men be elevene om å ikke spamme refresh.
- Koden under er en fasit, ikke noe som ligger ferdig i
  repoet.

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                                                                  |
|-------------|----------|-----------------------------------------------------------------------|
| 00:00–00:10 | 10 min   | Intro: ett API er sjelden nok                                         |
| 00:10–00:25 | 15 min   | Del 1: Nytt prosjekt, `.env.local`, `lib/api.ts` med `fetchData`      |
| 00:25–00:50 | 25 min   | Del 2: `/books`, bøker + omslag fra Open Library (`Promise.all`)      |
| 00:50–01:00 | 10 min   | ☕ Pause                                                              |
| 01:00–01:30 | 30 min   | Del 3: Utvid `lib/api.ts`, `/characters` med bilder fra Tolkien Gateway |
| 01:30–01:50 | 20 min   | Del 4: `/characters/[id]`, detaljer + sitater + `notFound`            |
| 01:50–02:00 | 10 min   | Oppsummering + hjemmelekse                                            |

---

## 00:00–00:10 — Intro

**Snakkepunkter:**

- Vis dokumentasjonen til The One API. Spør klassen: "Vi vil
  lage en side med bokomslag, og en med bilde av alle
  karakterene. Hvor er bildene?" (Svar: det finnes ingen.
  Bøkene har bare et navn, og karakterene har tekst og en
  `wikiUrl`.)
- Plan for dagen: **først bøkene** (3 stykker, ingen nøkkel
  nødvendig, ett ekstra API), **så karakterene** (nøkkel,
  filter, sider og et ekstra API til).
- Slik er det ofte i ekte prosjekter: data kommer fra flere
  kilder, og vi må **koble dem sammen** med noe de har
  felles.
    - Bok → omslag: koblingen er **boktittelen**, som vi
      søker etter i Open Library.
    - Karakter → bilde: koblingen er **navnet**. Wikien
      Tolkien Gateway har en side med samme navn som
      karakteren (`Frodo Baggins`), og den siden har et
      bilde.
- Hvorfor Server Components passer godt her:
    1. API-nøkkelen blir på serveren og havner aldri i
       nettleseren.
    2. Ingen CORS-problemer. Serveren kan hente fra hvilket
       domene som helst.
    3. Ingen `useEffect` eller loading-state for hvert kall.
       Vi bare bruker `await`.

---

## 00:10–00:25 — Del 1: Prosjekt, nøkkel og `lib/api.ts`

```bash
cd frontend-nett
npx create-next-app@latest week42-app
# TypeScript: Yes · ESLint: Yes · Tailwind: No · src/ directory: No · App Router: Yes · Turbopack: Yes · import alias: default
cd week42-app
npm run dev
```

Bytt ut innholdet i **`app/globals.css`** med noen enkle
fellesregler (farger som variabler, så modulene kan bruke
dem):

```css
:root {
    --bg: #faf7f2;
    --card: #efe9df;
    --card-hover: #e4dccf;
    --placeholder: #d6cfc3;
    --border: #d6cfc3;
    --text: #2b2620;
    --muted: #6b6257;
    --accent: #b45309;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
}

a {
    color: inherit;
}
```

**Snakkepunkter om CSS Modules:**

- En fil som heter `noe.module.css` importeres som et
  objekt: `import styles from "./page.module.css"`, og så
  skriver vi `className={styles.card}`.
- Next gjør klassenavnene unike (`card` blir for eksempel
  `page-module__x7Ab2__card`). Da kan to filer begge ha en
  `.card` uten å krasje. Vis det i DevTools!
- Felles ting (farger, `body`) ligger i `globals.css`. Det
  som hører til én side eller komponent, ligger i en modul
  ved siden av den.

**`.env.local`** (i roten av prosjektet, ved siden av
`package.json`):

```bash
THE_ONE_API_KEY=paste-your-key-here
```

**Snakkepunkter:**

- `.env*` står allerede i `.gitignore` fra
  `create-next-app`. Vis det! Nøkler skal aldri inn i git.
- Variabler **uten** prefikset `NEXT_PUBLIC_` er bare
  tilgjengelige på serveren. Det er akkurat det vi vil.
- Restart `npm run dev` etter at du har endret `.env.local`.

### Én fil for alle API-kall: `lib/api.ts`

Vi samler **alle** API-kallene i én fil. Øverst ligger én
gjenbrukbar funksjon, `fetchData(url)`, som gjør det
kjedelige arbeidet (nøkkel, feilsjekk, cache). Alle de andre
funksjonene bruker den. Sidene våre trenger bare å kalle
`getBooks()`, `getBookCover()` osv.

Nå skriver vi bare det vi trenger til **bøkene**. I Del 3
utvider vi den samme fila med karakterene.

```ts
import {cacheLife} from "next/cache";

// ---------- Types: what the data looks like ----------

export type Book = {
    _id: string;
    name: string;
};

// ---------- The reusable fetch function ----------

const ONE_API = "https://the-one-api.dev/v2";

// Every API call in this file goes through this one function.
// It never crashes. It always gives back { data, error }:
//   it worked → { data: the answer, error: null }
//   it failed → { data: null, error: "a message we can show the user" }
async function fetchData(url: string) {
    "use cache";

    // Only The One API needs our key. Never send it to other websites!
    const headers = url.startsWith(ONE_API)
        ? {Authorization: `Bearer ${process.env.THE_ONE_API_KEY}`}
        : undefined;

    // Shows up in the terminal ONLY when we really ask the API (not when the answer comes from the cache)
    console.log("Fetching:", url);

    try {
        const res = await fetch(url, {headers});

        if (res.ok) {
            cacheLife("hours"); // a good answer is saved for 1 hour, so we don't hit the rate limit
            return {data: await res.json(), error: null};
        }

        cacheLife("seconds"); // an error is only saved for a moment, so we can try again soon
        return {data: null, error: errorMessage(res.status)};
    } catch {
        // fetch itself failed: no internet, or the website is down
        cacheLife("seconds");
        return {data: null, error: "Could not reach the API. Check your internet connection."};
    }
}

// Turns an HTTP status code into a message a user understands
function errorMessage(status: number) {
    if (status === 401) {
        return "The API key is missing or wrong. Check THE_ONE_API_KEY in .env.local and restart npm run dev.";
    }
    if (status === 429) {
        return "Too many requests (max 100 per 10 minutes). Wait a few minutes, then reload the page.";
    }
    return `The API answered with an error (${status}). Try again later.`;
}

// ---------- API 1: The One API (books) ----------

export async function getBooks() {
    const {data, error} = await fetchData(`${ONE_API}/book`);
    const books: Book[] = data?.docs ?? []; // if it failed, data is null → empty list

    return {books, error};
}

// ---------- API 2: Open Library (book covers) ----------

export async function getBookCover(title: string) {
    const {data} = await fetchData(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=Tolkien&limit=1`
    );
    const coverId = data?.docs[0]?.cover_i;

    // no cover → null, and the page shows "No cover" instead
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
}
```

**Snakkepunkter:**

- **Gjenbruk:** `fetch` + nøkkel + feilsjekk + cache står
  bare **ett** sted. Skal vi endre noe, endrer vi det i
  `fetchData`, og alle kallene får endringen.
- **Typen** `Book` forteller TypeScript hvordan dataene ser
  ut. Da får vi autofullføring på `book.name` i sidene.
- `/book` trenger egentlig ingen nøkkel, men `fetchData`
  sender den uansett til The One API. Da er alt klart når vi
  trenger den til karakterene i Del 3.
- **Bare The One API får nøkkelen.** Vi sjekker
  `url.startsWith(ONE_API)`, så nøkkelen aldri sendes til
  Open Library (eller Tolkien Gateway senere).
- **`"use cache"` + `cacheLife("hours")`:** Next husker
  svaret i en time. Ber vi om samme URL igjen, får vi svaret
  fra cachen i stedet for å spørre API-et. Det sparer rate
  limit og gjør siden raskere.
- **Se cachen virke:** `console.log("Fetching:", url)` står
  inne i `fetchData`, så det skrives bare i terminalen når vi
  *faktisk* spør API-et. Last siden to ganger: første gang ser
  dere `Fetching: ...`, andre gang ingenting, for da kom
  svaret fra cachen.
- **I dev tømmes cachen oftere:** hver gang du lagrer en fil,
  ved hard refresh (Ctrl+Shift+R), og hvis "Disable cache" er
  huket av i DevTools (Network-fanen). Skru det av i dag!
    - Merk: i nyere Next-prosjekter (`cacheComponents: true`
      i `next.config.ts`) cacher **ikke**
      `fetch(url, { next: { revalidate } })` lenger. Bruk
      `"use cache"`.
- **Feil er vanlige, ikke krasj.** Et API kan alltid svare
  med feil: feil nøkkel (`401`), rate limit (`429`), eller
  ingen internett. Derfor **kaster ikke** `fetchData` feil. Den
  gir alltid tilbake `{data, error}`, og `errorMessage()` gjør
  om statuskoden til en tekst brukeren forstår.
    - Hvorfor ikke bare `throw new Error(...)`? I produksjon
      skjuler Next teksten i feil som kastes i Server
      Components ("The specific message is omitted in
      production builds"). Da ser brukeren aldri *hvorfor*
      det feilet. En vanlig verdi kommer alltid fram.
- **Gode svar caches i en time, feil bare et øyeblikk.**
  `cacheLife` kan stå i forskjellige `if`-grener. Hadde vi
  cachet en `429` i en time, hadde siden vist feilen lenge
  etter at rate limit var over.
- **`data?.docs ?? []`:** hvis kallet feilet, er `data` lik
  `null`. `?.` stopper da i stedet for å krasje, og `?? []`
  gir en tom liste. Mangler et omslag, viser vi resten av
  siden likevel. **Én feilende kilde skal ikke ta ned hele
  siden.**

### Meny og forside

**`app/layout.module.css`**

```css
.header {
    border-bottom: 1px solid var(--border);
}

.nav {
    display: flex;
    gap: 1.5rem;
    max-width: 64rem;
    margin: 0 auto;
    padding: 1rem;
    font-weight: 600;
}
```

**`app/layout.tsx`** (legg til en meny over `{children}`):

```tsx
import Link from "next/link";
import styles from "./layout.module.css";
// ...

export const metadata: Metadata = {
    title: {
        default: "Lord of the Rings",
        template: "%s | Lord of the Rings"
    },
    description: "Encyclopedia with data from three APIs",
};

// inne i <body>:
<header className={styles.header}>
    <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/books">Books</Link>
        <Link href="/characters">Characters</Link>
    </nav>
</header>
{
    children
}
```

`Characters` gir 404 helt til Del 3. Det er helt greit, og
en fin påminnelse om at en rute bare er en mappe i `app/`.

**`app/page.module.css`** (bytt ut alt som
`create-next-app` la inn):

```css
.main {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
}

.title {
    margin: 0 0 1rem;
    font-size: 2.25rem;
}

.intro {
    margin: 0 0 2rem;
    color: var(--muted);
}

.links {
    display: grid;
    gap: 1rem;
    padding: 0;
    list-style: none;
}

@media (min-width: 640px) {
    .links {
        grid-template-columns: repeat(2, 1fr);
    }
}

.linkCard {
    display: block;
    padding: 1.5rem;
    border-radius: 0.5rem;
    background: var(--card);
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
}

.linkCard:hover {
    background: var(--card-hover);
}
```

**`app/page.tsx`**

```tsx
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Lord of the Rings Encyclopedia</h1>
            <p className={styles.intro}>
                Data from The One API, images from Tolkien
                Gateway and book covers from Open Library.
            </p>
            <ul className={styles.links}>
                <li>
                    <Link href="/books" className={styles.linkCard}>
                        📚 The Books →
                    </Link>
                </li>
                <li>
                    <Link href="/characters" className={styles.linkCard}>
                        🧙 Characters →
                    </Link>
                </li>
            </ul>
        </main>
    );
}
```

---

## 00:25–00:50 — Del 2: Bøker med omslag

Vi bruker `getBooks()` (API 1) og `getBookCover()` (API 2)
fra
`lib/api.ts`.

**`next.config.ts`**: `next/image` må få vite hvilke domener
den har lov til å hente bilder fra. Legg til `images`, og la
resten av innstillingene stå:

```ts
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "covers.openlibrary.org"
            },
        ],
    },
    // ...the rest of the settings from create-next-app
};
```

**`components/ErrorMessage.module.css`**

```css
.box {
    padding: 1rem;
    border: 1px solid #fca5a5;
    border-radius: 0.5rem;
    background: #fef2f2;
    color: #7f1d1d;
}

.title {
    margin: 0;
    font-weight: 600;
}

.message {
    margin: 0.25rem 0 0;
}
```

**`components/ErrorMessage.tsx`** (vises på siden når et
API-kall feiler):

```tsx
import styles from "./ErrorMessage.module.css";

type Props = { message: string };

// Shown on the page when an API call fails, instead of crashing the whole page
export default function ErrorMessage({message}: Props) {
    return (
        <div role="alert" className={styles.box}>
            <p className={styles.title}>⚠️ Could not load the data</p>
            <p className={styles.message}>{message}</p>
        </div>
    );
}
```

**`app/books/page.module.css`**

```css
.main {
    max-width: 56rem;
    margin: 0 auto;
    padding: 1.5rem;
}

.title {
    margin: 0 0 1.5rem;
    font-size: 2rem;
}

.grid {
    display: grid;
    gap: 1.5rem;
    padding: 0;
    list-style: none;
}

@media (min-width: 640px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.card {
    padding: 1rem;
    border-radius: 0.5rem;
    background: var(--card);
    text-align: center;
}

.cover {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 0.25rem;
}

.placeholder {
    display: grid;
    place-items: center;
    aspect-ratio: 2 / 3;
    background: var(--placeholder);
}

.bookTitle {
    margin: 0.75rem 0 0;
    font-size: 1.1rem;
}
```

**`app/books/page.tsx`**

```tsx
import Image from "next/image";
import {getBooks, getBookCover} from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";
import styles from "./page.module.css";

export const metadata = {title: "Books"};

export default async function BooksPage() {
    const {books, error} = await getBooks();

    // Three searches against Open Library, ALL AT ONCE (if getBooks failed, books is empty → no searches)
    const covers = await Promise.all(books.map((book) => getBookCover(book.name)));

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>The Books</h1>

            {error && <ErrorMessage message={error}/>}

            <ul className={styles.grid}>
                {books.map((book, i) => (
                    <li key={book._id} className={styles.card}>
                        {covers[i] ? (
                            <Image
                                src={covers[i]}
                                alt={`Cover: ${book.name}`}
                                width={300}
                                height={450}
                                className={styles.cover}
                            />
                        ) : (
                            <div className={styles.placeholder}>No cover</div>
                        )}
                        <h2 className={styles.bookTitle}>{book.name}</h2>
                    </li>
                ))}
            </ul>
        </main>
    );
}
```

**Snakkepunkter:**

- **`Promise.all` vs. `await` i en løkke.** Tegn det på
  tavla: tre kall etter hverandre tar 3 × ventetiden, tre
  kall samtidig tar 1 × ventetiden. Kallene er uavhengige av
  hverandre, så de bør kjøre samtidig.
- `covers[i]` hører til `books[i]` fordi `Promise.all`
  beholder rekkefølgen.
- `encodeURIComponent(title)` i `getBookCover` gjør om
  mellomrom og spesialtegn så de kan stå i en URL.
- Alltid en **fallback** når bildet mangler. Et eksternt API
  kan alltid svare med "ingenting".
- `{error && <ErrorMessage message={error}/>}` viser feilen
  bare hvis det finnes en. `role="alert"` gjør at
  skjermlesere leser den opp.
- **Prøv det:** skriv feil i `THE_ONE_API_KEY` i
  `.env.local` og restart. `/book` virker fortsatt (den
  trenger ingen nøkkel), men i Del 3 får `/characters` en
  pen feilmelding i stedet for en krasj.
- Hvis noen spør: når det bare er tre bøker, kunne vi lagt
  bildene i `public/`. Det er helt greit i et ekte prosjekt.
  I dag gjør vi det med et API for å øve.

---

## 00:50–01:00 — ☕ Pause

---

## 01:00–01:30 — Del 3: Karakterer med bilder fra Tolkien Gateway

Bøkene er ferdige. Nå bruker vi det samme mønsteret på
karakterene: data fra The One API + bilder fra et annet API.

### Utvid `lib/api.ts`

Legg til typene øverst, under `Book`:

```ts
export type Character = {
    _id: string;
    name: string;
    race: string;
    gender: string;
    birth: string;
    death: string;
    realm: string;
    spouse: string;
    wikiUrl?: string;
};

export type Quote = {
    _id: string;
    dialog: string;
};
```

Legg til karakter-funksjonene under `getBooks()`:

```ts
export async function getCharacters(page: string, race?: string) {
    let url = `${ONE_API}/character?limit=24&page=${page}&sort=name:asc`;
    if (race) {
        url += `&race=${race}`;
    }

    const {data, error} = await fetchData(url);
    const characters: Character[] = data?.docs ?? [];
    const totalPages: number = data?.pages ?? 0;

    return {characters, totalPages, error};
}

export async function getCharacter(id: string) {
    // All ids in The One API are 24 characters long. Any other id can't exist,
    // and the API crashes (500) if we ask for it, so we don't ask.
    if (id.length !== 24) {
        return {character: null, error: null};
    }

    const {data, error} = await fetchData(`${ONE_API}/character/${id}`);
    const character: Character | null = data?.docs[0] ?? null;

    return {character, error};
}

export async function getQuotes(id: string) {
    const {data} = await fetchData(`${ONE_API}/character/${id}/quote?limit=5`);
    const quotes: Quote[] = data?.docs ?? []; // no quotes is better than a broken page

    return quotes;
}
```

Og til slutt API 3, nederst i fila:

```ts
// ---------- API 3: Tolkien Gateway wiki (character images) ----------

export async function getCharacterImage(name: string) {
    // Look up the wiki page with the same name as the character, e.g. "Frodo Baggins"
    const {data} = await fetchData(
        `https://tolkiengateway.net/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&pithumbsize=400&pilicense=any&format=json&redirects=1`
    );

    // The answer looks like: { query: { pages: { "1234": { thumbnail: { source: "https://..." } } } } }
    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
    const image: string | null = page.thumbnail?.source ?? null;

    return image;
}
```

Legg også Tolkien Gateway-domenet til i `next.config.ts`, så
`next/image` får vise bildene:

```ts
remotePatterns: [
    {
        protocol: "https",
        hostname: "covers.openlibrary.org"
    },
    {
        protocol: "https",
        hostname: "tolkiengateway.net"
    }, // Tolkien Gateway
],
```

**Snakkepunkter:**

- Ingen ny `fetch`-kode! Alle de nye funksjonene bruker
  `fetchData` fra Del 1. Det er gevinsten med gjenbruk.
- `Authorization: Bearer <nøkkel>` er den vanligste måten å
  sende en API-nøkkel på. Vis hva som skjer uten nøkkelen:
  `/book` virket, men `/character` svarer `401`.
- The One API kan filtrere og sortere i URL-en, for eksempel
  `?race=Hobbit`, `?sort=name:asc` og `?limit=24&page=2`.
  Det bruker vi i `getCharacters`.
- `getCharacters` og `getCharacter` sender `error` videre til
  siden, akkurat som `getBooks`. `getQuotes` og
  `getCharacterImage` gir bare `[]` eller `null` ved feil:
  mangler sitatene eller bildet, viser vi resten av siden
  uten feilmelding.
- **`id.length !== 24`:** alle id-er i The One API er 24 tegn.
  Spør vi om noe annet (`/characters/finnesikke`), krasjer
  API-et med `500`. Da hopper vi over kallet og viser 404 i
  stedet. Vis det i nettleseren!

### Bilder fra Tolkien Gateway

[Tolkien Gateway](https://tolkiengateway.net) er en stor
Tolkien-wiki med tegninger av nesten alle kjente karakterer.
Nesten alle kjente karakterer har en side med samme navn som
i The One API (`Frodo Baggins`, `Gandalf`, `Éowyn`). Det
navnet slår vi opp i wikiens MediaWiki-API. Det er det
`getCharacterImage()` (API 3) i `lib/api.ts` gjør.

- `encodeURIComponent(name)` gjør om mellomrom og
  spesialtegn (`Éowyn`) så navnet kan stå i URL-en.
- `redirects=1` følger videresendinger. The One API kaller
  ham `Aragorn II Elessar`, men på wikien heter siden bare
  `Aragorn`. Wikien sender oss videre, og vi får bildet
  likevel.
- `pilicense=any` betyr "gi meg bildet uansett lisens". Det
  gjør ingen forskjell på Tolkien Gateway i dag, men andre
  MediaWiki-wikier (som Wikipedia) gir bare fritt
  lisensierte bilder uten den. Vi tar den med for å være
  trygge.

Prøv URL-en i nettleseren først, så elevene ser svaret:

```
https://tolkiengateway.net/w/api.php?action=query&titles=Frodo%20Baggins&prop=pageimages&pithumbsize=400&pilicense=any&format=json&redirects=1
```

Svaret ser slik ut (tallet er wikiens side-id, og det vet vi
ikke på forhånd). Derfor bruker vi `Object.values(...)[0]`
for
å ta den første siden:

```json
{
  "query": {
    "pages": {
      "1234": {
        "title": "Frodo Baggins",
        "thumbnail": {
          "source": "https://tolkiengateway.net/w/images/thumb/..."
        }
      }
    }
  }
}
```

**`components/CharacterCard.module.css`**

```css
.card {
    display: block;
    overflow: hidden;
    border-radius: 0.5rem;
    background: var(--card);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
    text-decoration: none;
    transition: transform 0.15s;
}

.card:hover {
    transform: scale(1.05);
}

.imageWrap {
    position: relative; /* needed for <Image fill> */
    aspect-ratio: 3 / 4; /* portrait, like the wiki drawings */
    background: var(--placeholder);
}

.image {
    object-fit: cover;
    object-position: top;
}

.placeholder {
    display: grid;
    place-items: center;
    height: 100%;
    font-family: serif;
    font-size: 4.5rem;
    color: rgb(255 255 255 / 0.8);
}

.info {
    padding: 0.75rem;
}

.name {
    margin: 0;
    font-size: 1rem;
    /* long names get "..." instead of wrapping */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.race {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--muted);
}
```

**`components/CharacterCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type {Character} from "@/lib/api";
import styles from "./CharacterCard.module.css";

// Some characters have no image on the wiki.
// Then we show their first letter on a color that matches their race.
const RACE_COLORS: Record<string, string> = {
    Hobbit: "#4d7c0f",
    Human: "#075985",
    Elf: "#0d9488",
    Dwarf: "#b45309",
    Maiar: "#6d28d9",
    Orc: "#7f1d1d",
};

type Props = { character: Character; image: string | null };

export default function CharacterCard({character, image}: Props) {
    const color = RACE_COLORS[character.race] ?? "#78716c";

    return (
        <Link href={`/characters/${character._id}`} className={styles.card}>
            <div className={styles.imageWrap}>
                {image ? (
                    <Image src={image} alt={character.name} fill sizes="250px" className={styles.image}/>
                ) : (
                    <div className={styles.placeholder} style={{background: color}}>
                        {character.name[0]}
                    </div>
                )}
            </div>
            <div className={styles.info}>
                <h2 className={styles.name}>{character.name}</h2>
                <p className={styles.race}>{character.race}</p>
            </div>
        </Link>
    );
}
```

**`app/characters/page.module.css`**

```css
.main {
    max-width: 64rem;
    margin: 0 auto;
    padding: 1.5rem;
}

.title {
    margin: 0 0 1rem;
    font-size: 2rem;
}

.loading {
    color: var(--muted);
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    50% {
        opacity: 0.4;
    }
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.active {
    font-weight: bold;
    color: var(--accent);
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0;
    list-style: none;
}

@media (min-width: 640px) {
    .grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}
```

**`app/characters/page.tsx`**

```tsx
import {Suspense} from "react";
import Link from "next/link";
import {getCharacters, getCharacterImage} from "@/lib/api";
import CharacterCard from "@/components/CharacterCard";
import ErrorMessage from "@/components/ErrorMessage";
import styles from "./page.module.css";

export const metadata = {title: "Characters"};

const RACES = ["Hobbit", "Human", "Elf", "Dwarf", "Maiar", "Orc"];

type Props = {
    searchParams: Promise<{ page?: string; race?: string }>
};

// The page shows the heading right away.
// Everything that needs ?page= and ?race= from the URL is inside <Suspense>.
export default function CharactersPage({searchParams}: Props) {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Characters</h1>

            <Suspense fallback={<p className={styles.loading}>Fetching characters from Middle-earth…</p>}>
                <CharacterList searchParams={searchParams}/>
            </Suspense>
        </main>
    );
}

async function CharacterList({searchParams}: Props) {
    const {page = "1", race} = await searchParams;

    // Step 1: get the characters (we need their names before we can find images)
    const {characters, totalPages, error} = await getCharacters(page, race);

    // The API failed → show the message instead of the list
    if (error) {
        return <ErrorMessage message={error}/>;
    }

    // Step 2: get all the images AT ONCE
    const images = await Promise.all(characters.map((c) => getCharacterImage(c.name)));

    const currentPage = Number(page);
    const raceFilter = race ? `&race=${race}` : "";

    return (
        <>
            <nav className={styles.filters}>
                <Link href="/characters" className={!race ? styles.active : undefined}>All</Link>
                {RACES.map((r) => (
                    <Link key={r} href={`/characters?race=${r}`} className={race === r ? styles.active : undefined}>
                        {r}
                    </Link>
                ))}
            </nav>

            <ul className={styles.grid}>
                {characters.map((c, i) => (
                    <li key={c._id}>
                        <CharacterCard character={c} image={images[i]}/>
                    </li>
                ))}
            </ul>

            <div className={styles.pagination}>
                {currentPage > 1 && (
                    <Link href={`/characters?page=${currentPage - 1}${raceFilter}`}>← Previous</Link>
                )}
                <span>Page {currentPage} of {totalPages}</span>
                {currentPage < totalPages && (
                    <Link href={`/characters?page=${currentPage + 1}${raceFilter}`}>Next →</Link>
                )}
            </div>
        </>
    );
}
```

**`app/error.module.css`**

```css
.main {
    max-width: 64rem;
    margin: 0 auto;
    padding: 1.5rem;
}

.title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
}

.message {
    margin: 0 0 1rem;
    color: var(--muted);
}

.button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background: var(--accent);
    color: white;
    font: inherit;
    cursor: pointer;
}
```

**`app/error.tsx`** (bare for *uventede* feil, altså bugs i
koden vår. Den ligger rett i `app/`, så den gjelder alle
sidene):

```tsx
"use client"; // Error boundaries must be Client Components

// This page is only for UNEXPECTED errors (bugs in our code).
// API errors are shown with <ErrorMessage> on the page itself.
// In production, Next hides the real error text here, so we show a general message.
import styles from "./error.module.css";

type Props = {
    error: Error & { digest?: string };
    retry: () => void
};

export default function ErrorPage({retry}: Props) {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>An unexpected error happened. Try again, or go back to the home page.</p>
            <button onClick={retry} className={styles.button}>
                Try again
            </button>
        </main>
    );
}
```

**Snakkepunkter:**

- **To steg som må komme etter hverandre.** Vi vet ikke
  hvilke bilder vi skal hente før vi har karakterene (vi
  trenger navnene). Steg 1 må være ferdig før steg 2.
- **Men inne i steg 2 er kallene uavhengige**, så de 24
  bildene hentes samtidig med `Promise.all`, akkurat som
  omslagene i Del 2. `images[i]` hører til `characters[i]`.
- **Filter og sider ligger i URL-en (`searchParams`), som i
  `week41`.** Siden kan deles og bokmerkes, og vi trenger
  ingen `useState`.
- **Alle kjente karakterer har bilde, men ikke alle ukjente.**
  Side 1 (sortert A–Å) har mange ukjente hobbiter og konger
  fra slektstavlene, som ingen har tegnet. Bla deg fram til
  Aragorn, Frodo og Gandalf, så har alle bilde. Derfor har
  kortet en **fallback**: forbokstaven på en farge som passer
  rasen (`RACE_COLORS` + `style={{background: color}}`).
- Bildene er tegninger av kjente Tolkien-kunstnere. De er
  fine til å øve med, men i et ekte prosjekt må man sjekke
  lisensen før man bruker dem.
- **Klasse som avhenger av state:**
  `className={race === r ? styles.active : undefined}`. En
  modul-klasse er bare en vanlig streng, så vi kan velge den
  med en ternary.
- `<Image fill>` trenger en forelder med
  `position: relative` (`.imageWrap` i `CharacterCard`).
  Glemmer man det, havner bildet utenfor kortet.
- `@keyframes pulse` i modulen blir også gjort unik, så den
  kan ikke krasje med en annen animasjon som heter `pulse`.
- **`<Suspense>` rundt det som leser URL-en.** Siden består
  av to komponenter: `CharactersPage` viser overskriften med
  en gang, og `CharacterList` leser `searchParams` og henter
  dataene. Mens `CharacterList` venter, viser `<Suspense>`
  `fallback`-teksten. Uten `<Suspense>` gir Next feilmeldingen
  *"`params` or `searchParams` accessed outside of
  `<Suspense>`"* i dev.
  - Det er det samme som `loading.tsx` fra `week41` gjør, men
    nå bestemmer vi selv hvor ventingen skal vises. Derfor
    trenger vi ingen `loading.tsx` i dag.
- **To typer feil:**
    - **Forventede feil** (API-et svarer `401`, `429`, eller
      vi har ikke internett): vi vet at de kan skje, så vi
      viser dem selv med `<ErrorMessage>`. Ødelegg nøkkelen i
      `.env.local` og se meldingen på `/characters`.
    - **Uventede feil** (bugs, for eksempel en skrivefeil som
      gjør at koden krasjer): dem fanger `app/error.tsx`, som
      i `week41`. I denne Next-versjonen heter
      knappefunksjonen `retry` (den prøver på nytt).
- **Tidlig `return` i en komponent:**
  `if (error) return <ErrorMessage .../>` betyr "stopp her og
  vis bare feilmeldingen". Overskriften i `CharactersPage`
  vises fortsatt, fordi den ligger utenfor.

---

## 01:30–01:50 — Del 4: Én karakter

**`app/characters/[id]/page.module.css`**

```css
.main {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
}

.back {
    font-size: 0.875rem;
}

.loading {
    margin-top: 1rem;
    color: var(--muted);
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    50% {
        opacity: 0.4;
    }
}

.hero {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
}

@media (min-width: 640px) {
    .hero {
        flex-direction: row;
    }
}

.portrait {
    height: auto;
    border-radius: 0.5rem;
}

.name {
    margin: 0;
    font-size: 2rem;
}

.facts {
    display: grid;
    gap: 0.25rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
}

.wikiLink {
    display: inline-block;
    margin-top: 1rem;
}

.quotes {
    margin-top: 2rem;
}

.quotesTitle {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
}

.quoteList {
    display: grid;
    gap: 0.5rem;
    padding: 0;
    list-style: none;
}

.quote {
    padding-left: 0.75rem;
    border-left: 4px solid var(--accent);
    font-style: italic;
}
```

**`app/characters/[id]/page.tsx`**

```tsx
import {Suspense} from "react";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getCharacter, getQuotes, getCharacterImage} from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

// The page shows the back link right away.
// Everything that needs the id from the URL is inside <Suspense>.
export default function CharacterPage({params}: Props) {
    return (
        <main className={styles.main}>
            <Link href="/characters" className={styles.back}>← All characters</Link>

            <Suspense fallback={<p className={styles.loading}>Loading character…</p>}>
                <CharacterDetails params={params}/>
            </Suspense>
        </main>
    );
}

async function CharacterDetails({params}: Props) {
    const {id} = await params;

    // Character and quotes don't depend on each other → fetch them at the same time
    const [{character, error}, quotes] = await Promise.all([getCharacter(id), getQuotes(id)]);

    // The API failed → show the message
    if (error) {
        return <ErrorMessage message={error}/>;
    }
    // The API worked, but there is no character with this id → 404 page
    if (!character) notFound();

    // The image needs character.name → so it has to come after
    const image = await getCharacterImage(character.name);

    // The API sometimes sends empty values or "NaN", so we remove those
    const facts = [
        {label: "Race", value: character.race},
        {label: "Gender", value: character.gender},
        {label: "Realm", value: character.realm},
        {label: "Born", value: character.birth},
        {label: "Died", value: character.death},
        {label: "Spouse", value: character.spouse},
    ].filter((fact) => fact.value && fact.value !== "NaN");

    return (
        <>
            <div className={styles.hero}>
                {image && (
                    <Image src={image} alt={character.name} width={300} height={400} className={styles.portrait}/>
                )}
                <div>
                    <h1 className={styles.name}>{character.name}</h1>
                    <ul className={styles.facts}>
                        {facts.map((fact) => (
                            <li key={fact.label}>
                                <strong>{fact.label}:</strong> {fact.value}
                            </li>
                        ))}
                    </ul>
                    {character.wikiUrl && (
                        <a href={character.wikiUrl} target="_blank" className={styles.wikiLink}>
                            Read more on the wiki →
                        </a>
                    )}
                </div>
            </div>

            {quotes.length > 0 && (
                <section className={styles.quotes}>
                    <h2 className={styles.quotesTitle}>Quotes from the movies</h2>
                    <ul className={styles.quoteList}>
                        {quotes.map((q) => (
                            <li key={q._id} className={styles.quote}>“{q.dialog}”</li>
                        ))}
                    </ul>
                </section>
            )}
        </>
    );
}
```

**Snakkepunkter:**

- Siden blander begge mønstrene fra i dag: `Promise.all`
  for de uavhengige kallene (karakter + sitater), og et
  ekstra
  kall etterpå for det som avhenger av svaret (bildet).
- **Feil eller ikke funnet?** To forskjellige ting:
  `error` betyr at API-et ikke svarte ordentlig (vis
  meldingen), mens `character === null` betyr at API-et
  svarte fint, men karakteren finnes ikke (vis 404 med
  `notFound()`).
- `[{character, error}, quotes]` henter ut verdiene fra
  begge svarene fra `Promise.all` på en gang.
- `getQuotes` returnerer `[]` hvis noe går galt. Da viser vi
  resten av siden likevel, og trenger ingen ekstra
  feilsjekk her.
- Dataene er ikke helt rene. Noen felter er tomme eller
  `"NaN"`, så vi filtrerer dem bort med `.filter()`. Sånn er
  det med ekte API-er.
- Samme mønster som i Del 3: `CharacterPage` viser
  tilbake-lenken med en gang, og `CharacterDetails` leser
  `params` inne i `<Suspense>`.
- Prøv `/characters/finnesikke` i nettleseren. Da skal
  `notFound()` gi 404-siden.

---

## 01:50–02:00 — Oppsummering

**Spør klassen:**

1. Hvorfor ligger API-nøkkelen i `.env.local` uten
   `NEXT_PUBLIC_`? (Den skal bare finnes på serveren.)
2. Hvorfor har vi én `fetchData`-funksjon i `lib/api.ts`?
   (Nøkkel, feilsjekk og cache skrives bare ett sted, og
   alle
   kallene gjenbruker den.)
3. Når bruker vi `Promise.all`, og når kan vi ikke bruke
   det? (Når kallene er uavhengige av hverandre. Ikke når
   ett kall trenger svaret fra et annet.)
4. Hva gjør `"use cache"`? (Next husker svaret, så vi ikke
   spør API-et på nytt hver gang og sprenger rate limit.)
5. Hva kobler en karakter i The One API til bildet på
   Tolkien Gateway? (Navnet. Wikien har en side med samme
   navn som karakteren.)
6. Hvorfor må vi legge domener inn i `next.config.ts`?
   (`next/image` henter og optimaliserer bare bilder fra
   domener vi har godkjent.)
7. Hva er forskjellen på `<ErrorMessage>` og `error.tsx`?
   (`<ErrorMessage>` er for feil vi forventer, som at API-et
   svarer `429`. `error.tsx` er for bugs vi ikke forventet.)
8. Både `books/page.module.css` og
   `characters/page.module.css` har en `.grid`. Hvorfor
   krasjer de ikke? (CSS Modules gjør klassenavnene unike per
   fil.)

**Hjemmelekse (velg minst én):**

- Lag `/movies` med data fra `/movie` (budsjett, inntekter,
  Oscar-priser). Lag en `Movie`-type og en `getMovies()` i
  `lib/api.ts` som bruker `fetchData`. Bonus: plakater fra
  et
  tredje API, eller bilder i `public/`.
- Legg til et søkefelt på `/characters` som bruker
  `?name=/frodo/i` (The One API støtter regex-søk). Bruk et
  vanlig `<form>` med `method="get"`, så trenger dere ingen
  Client Component. Utvid `getCharacters` med en `name`
  -parameter.
- Lag en "Quote of the day"-boks på forsiden: tilfeldig
  sitat + bilde av karakteren som sa det. (Sitatet har et
  `character`-felt med id-en, så det blir tre kall etter
  hverandre.)

---

## Feilsøking

| Problem                                           | Løsning                                                                                                                       |
|---------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `401` fra The One API                             | Feil eller manglende nøkkel. Sjekk `.env.local` og restart `npm run dev`.                                                     |
| `429` / "Too many requests"                    | Rate limit (100 kall per 10 min, per IP, så hele klassen deler den). Vent ca. 10 min uten å laste siden på nytt. Skru av "Disable cache" i DevTools og unngå Ctrl+Shift+R. Se i terminalen hvor mange `Fetching:`-linjer som kommer. |
| `429` selv om vi har `next: { revalidate }`       | Med `cacheComponents: true` cacher ikke `fetch` lenger. Bruk `"use cache"` + `cacheLife` som i `fetchData`.                   |
| `Invalid src prop ... hostname is not configured` | Domenet mangler i `remotePatterns` i `next.config.ts`. Restart dev-serveren.                                                  |
| Omslaget laster ikke                              | Open Library sender iblant videre til `archive.org`. Bruk vanlig `<img>` i stedet for `<Image>`.                              |
| `` `params` or `searchParams` accessed outside of <Suspense> `` | Les `params`/`searchParams` i en egen komponent som ligger inne i `<Suspense>`, som i Del 3 og 4. |
| Fikk `429` igjen mens vi koder                    | I dev tømmes `"use cache"` hver gang du lagrer en fil, så hver endring gir nye kall. Lagre litt sjeldnere, og vent hvis det skjer. |
| Feilmeldingen vises fortsatt etter at feilen er fikset | Feil caches bare et øyeblikk (`cacheLife("seconds")`). Vent noen sekunder og last siden på nytt. |
| Dev-overlay viser "Runtime Error"                 | Noe kastet en feil. API-feil skal komme som `{data, error}` fra `fetchData`, ikke som `throw`. Sjekk at `fetchData` ser ut som i Del 1. |
| Karakter uten bilde                               | Normalt for ukjente karakterer (ca. 9 av 24 på side 1 har bilde). Alle kjente har bilde. Fallbacken med forbokstav tar seg av resten.                                         |
