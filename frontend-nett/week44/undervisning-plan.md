# Uke 44 — Payload CMS: Blocks, komponenter, admin og globals (2 timer)

Bygger videre på forrige uke (collections, `relationship`/`upload`,
Local API med `getPayload`, `find`/`findByID`, `depth`).
Nytt i dag: **blocks**, **React-komponenter per block**, **tilpasning av
blocks i admin** og **globals**. Alt vises i frontenden.

**Mål:** redaktøren bygger en side selv ved å stable blocks
(Hero → Tekst → Call to action) i admin, og frontenden tegner dem.
Header og footer styres fra globals.

**Stack:** [gloer/new-payload-starter](https://github.com/gloer/new-payload-starter)
(Payload 3.92, Next.js 16.4, React 19, Postgres i Docker).
Enkel og ren styling: **én global CSS-fil** (farger, reset, typografi,
sidelayout) + **CSS Modules** (`.module.css`, innebygd i Next) per
komponent. **Ingen Tailwind.**

**Merk:** all kode er på engelsk: variabelnavn, kommentarer og tekst i
appen. Forklaringene er på norsk. Koden er en fasit. Den er typesjekket
(`tsc`) og testet mot en kjørende Postgres.

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                                                          |
|-------------|----------|---------------------------------------------------------------|
| 00:00–00:10 | 10 min   | Intro + oppsett av starteren                                  |
| 00:10–00:30 | 20 min   | Del 1: Hva er en block? Lag tre blocks                        |
| 00:30–00:50 | 20 min   | Del 2: `Pages` med blocks-felt + admin-tilpasning av blocks   |
| 00:50–01:00 | 10 min   | ☕ Pause (elevene lager innhold i admin)                      |
| 01:00–01:30 | 30 min   | Del 3: Global CSS + CSS Modules, én komponent per block + `RenderBlocks` |
| 01:30–01:50 | 20 min   | Del 4: Globals (Header + Footer) i admin og frontend          |
| 01:50–02:00 | 10 min   | Migrasjon, oppsummering og hjemmelekse                        |

---

## Begreper (vis denne tabellen først)

| Begrep             | Kort forklaring                                                                                   |
|--------------------|---------------------------------------------------------------------------------------------------|
| **Block**          | En «byggekloss»-mal med egne felter, f.eks. Hero (overskrift + bilde). Har en unik `slug`.        |
| **Blocks-felt**    | Felttype (`type: 'blocks'`) i en collection. Redaktøren legger til, sorterer og sletter blocks.    |
| **`blockType`**    | Lagres på hver block i dataene. Den er lik blockens `slug`, og frontenden bruker den til å velge komponent. |
| **`blockName`**    | Et valgfritt navn redaktøren kan gi én block i admin. Det er bare for redaktøren.                  |
| **Block reference**| Blocken defineres én gang i `buildConfig({ blocks })` og brukes med `blockReferences: ['slug']`.  |
| **Global**         | Ett enkelt dokument (ikke en liste). Passer til innhold som finnes én gang: header, footer, innstillinger. |
| **Komponent**      | En React-komponent i frontenden som tegner én block-type.                                         |
| **Admin-komponent**| En egen React-komponent som Payload viser *inne i admin*, f.eks. en egen label på en block.       |
| **Import map**     | Fil Payload genererer, slik at admin finner admin-komponentene dine ut fra en tekst-sti.         |

**Collection vs. global:** en collection er en *tabell med mange rader*
(mange sider, mange monstre). En global er *én rad* (det finnes bare én
header). Begge har `fields`, og begge kan ha `access`.

---

## 00:00–00:10 — Intro + oppsett

**Snakkepunkt:** I dag er det redaktøren som bestemmer *rekkefølgen og
innholdet* på en side, ikke utvikleren. Utvikleren lager byggeklossene
(blocks) og komponentene som tegner dem.

Oppsett (fra README-en i starteren, **ikke** `git clone`):

```bash
mkdir week44-blocks && cd week44-blocks
npx degit gloer/new-payload-starter
cp .env .env   # fill in PAYLOAD_SECRET, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
npm install
docker compose up -d   # starts only the database
npm run dev
```

Gå til `http://localhost:3000/admin` og lag første bruker.

**Port 5432:** hvis databasen fra forrige uke kjører, står port 5432
allerede opptatt. Stopp den først med `docker compose down` i
prosjektmappa fra forrige uke.

**Vis i `src/payload.config.ts`:** starteren har allerede et tomt
`blocks: Block[] = []` som sendes til `buildConfig`. Det er dette arrayet
vi fyller i dag.

Mappestruktur vi ender opp med:

```text
src/
├── blocks/            Hero.ts, Text.ts, CallToAction.ts   (config)
├── collections/       Pages.ts (ny), Users.ts, Media.ts
├── globals/           Header.ts, Footer.ts
├── components/
│   ├── admin/         HeroLabel.tsx      (vises i admin)
│   ├── blocks/        RenderBlocks.tsx + Hero/, TextContent/, CallToAction/
│   │                  (hver mappe: Komponent.tsx + Komponent.module.css)
│   ├── Header/        Header.tsx (endres), Header.module.css (erstatter Header.css)
│   └── Footer/        Footer.tsx + Footer.module.css (ny)
└── app/(frontend)/    styles.css (global, skrives om), page.tsx (endres),
                       [slug]/page.tsx (ny)
```

---

## 00:10–00:30 — Del 1: Blocks

**Konsept:** en block er en liten samling felter med en `slug`. Den
lagres ikke som et eget dokument. Den lagres *inni* dokumentet som bruker
den (her: en side). Hver block i dataene får `blockType` (= slug),
`id` og eventuelt `blockName`.

Viktige valg i block-config:

| Valg             | Hva det gjør                                                                    |
|------------------|---------------------------------------------------------------------------------|
| `slug`           | Påkrevd. Unik id som lagres som `blockType`.                                    |
| `fields`         | Påkrevd. Vanlige Payload-felter, også `upload` og `relationship`.               |
| `labels`         | Navnet som vises i admin (`singular`/`plural`).                                 |
| `interfaceName`  | Gir et eget TypeScript-interface, f.eks. `HeroBlock`. Det trenger vi i frontenden. |
| `admin`          | Admin-utseende (Del 2): `group`, `disableBlockName`, `images`, `components`.    |

`src/blocks/Hero.ts`. Linjen `admin.components` forklares i Del 2. Kommenter den ut til da:

```ts
import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  admin: {
    group: 'Layout',
    components: {
      Label: '/components/admin/HeroLabel#HeroLabel',
    },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
```

`src/blocks/TextBlock.ts`:

```ts
import type { Block } from 'payload'

export const Text: Block = {
  slug: 'text',
  interfaceName: 'Text',
  labels: {
    singular: 'Text',
    plural: 'Texts',
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
```

`src/blocks/CallToAction.ts` er en block med en **relasjon**. Det kjenner de
fra forrige uke:

```ts
import type { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  labels: {
    singular: 'Call to action',
    plural: 'Calls to action',
  },
  admin: {
    group: 'Content',
    disableBlockName: true,
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
    },
  ],
}
```

Registrer blocks i `src/payload.config.ts`:

```ts
import { Hero } from './blocks/Hero';
import { Text } from './blocks/Text';
import { CallToAction } from './blocks/CallToAction';

const blocks: Block[] = [Hero, Text, CallToAction];
```

**Snakkepunkt:** `relationTo: 'pages'` peker på en collection vi ikke har
laget ennå. Det er neste steg. Til `Pages` finnes, feiler serveren med
`InvalidFieldRelationship: ... invalid relationship 'pages'`. Det er
forventet.

---

## 00:30–00:50 — Del 2: `Pages` + blocks i admin

### 2a. Collection med blocks-felt

`src/collections/Pages.ts`:

```ts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the URL, e.g. "about". The front page must be "home".',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [],
      blockReferences: ['hero', 'text', 'cta'],
    },
  ],
}
```

Legg `Pages` til i `collections`-arrayet i `payload.config.ts`, og importer den.

**Forklar `blocks` vs. `blockReferences`:**
- `blocks: [Hero, ...]` legger block-configen *direkte* i feltet.
- `blockReferences: ['hero', ...]` peker på blocks som er definert én
  gang i `buildConfig({ blocks })`. Samme block kan da brukes i mange
  collections uten at configen kopieres. Det er derfor starteren har
  `blocks`-arrayet.
- `blocks: []` **må** være med. TypeScript-typen for blocks-feltet krever
  det, selv om det er tomt. I Payload 4.0 skal de to slås sammen.

**`slug`-feltet** (et vanlig tekstfelt, ikke collection-sluggen) er det vi
slår opp på i URL-en. `unique: true` hindrer to sider med samme adresse.

### 2b. Admin-tilpasning av blocks

Åpne admin → Pages → Create new → «Add Layout» og vis:

| Innstilling                  | Hvor          | Effekt i admin                                                   |
|------------------------------|---------------|------------------------------------------------------------------|
| `labels`                     | block         | Navnet i velgeren og på hver block.                              |
| `admin.group`                | block         | Grupperer blocks i velgeren («Layout», «Content»).               |
| `admin.disableBlockName`     | block (CTA)   | Skjuler feltet der redaktøren kan navngi blocken.                |
| `admin.images.thumbnail`     | block         | Valgfritt bilde i velgeren (helst 3:2). Vi bruker det ikke i dag.|
| `admin.components.Label`     | block (Hero)  | Bytter ut standard-labelen med vår egen React-komponent.         |
| `admin.initCollapsed`        | blocks-felt   | Valgfritt: alle blocks starter sammenslått.                      |

**Merk:** eldre tutorials bruker `imageURL`/`imageAltText` på blocken.
De er markert *deprecated* i Payload 3.92. Bruk `admin.images`.

### 2c. Egen admin-komponent: label på Hero-blocken

Standard-labelen viser bare nummer og «Hero». Vi vil se overskriften.

`src/components/admin/HeroLabel.tsx`:

```tsx
'use client'

import { useRowLabel } from '@payloadcms/ui'

export const HeroLabel = () => {
  const { data, rowNumber } = useRowLabel<{ heading?: string }>()

  return (
    <span>
      Hero {(rowNumber ?? 0) + 1}: {data?.heading || 'No heading yet'}
    </span>
  )
}
```

Forklar:
- Admin-komponenter er **Server Components** som standard. Vi trenger en
  hook, så vi skriver `'use client'` øverst.
- `useRowLabel` (fra `@payloadcms/ui`) gir dataene til *denne* blocken
  og indeksen (`rowNumber` starter på 0, derfor `+ 1`).
- Komponenten registreres som en **tekst-sti**, ikke en import:
  `'/components/admin/HeroLabel#HeroLabel'`. Stien er relativ til
  `importMap.baseDir`, som er `src/` i starteren. `#HeroLabel` er navnet
  på eksporten (ved `export default` sløyfes `#...`).
- Payload legger stien inn i `src/app/(payload)/admin/importMap.js`.
  Filen oppdateres automatisk i `npm run dev`. Hvis admin sier at
  komponenten ikke finnes: kjør `npm run generate:importmap`. **Ikke rediger
  filen for hånd.**

Fjern kommentaren på `admin.components` i `Hero.ts`, skriv en overskrift
og se at labelen oppdateres mens du skriver.

### Pause-oppgave (☕)

Lag i admin: ett bilde i Media, en side `about` (Text-block) og en side
`home` med Hero (med bilde) → Text → Call to action som peker på `about`.

---

## 01:00–01:30 — Del 3: Frontend-komponenter

**Kjør først:** `npm run generate:types`. Da får `src/payload-types.ts`
`Page`, `HeroBlock`, `TextBlock` og `CallToActionBlock`. Det er grunnen til
at vi satte `interfaceName`.

**Konsept:** `page.layout` er en **array** av blocks i den rekkefølgen
redaktøren valgte. Vi går gjennom den og velger komponent ut fra
`blockType`. Én block-type gir én komponent.

### Styling: én global fil + CSS Modules

**Regel:** det som gjelder *hele siden* (farger, reset, typografi,
layout for `main`) skal i den globale filen. Det som gjelder *én
komponent* skal i komponentens egen `.module.css`.

| Fil                      | Importeres i         | Klassenavn                                     |
|--------------------------|----------------------|------------------------------------------------|
| `styles.css` (global)    | kun `layout.tsx`     | Vanlige navn som gjelder overalt (`.app-container`, `main`, `a`) |
| `Hero.module.css` osv.   | komponenten selv     | `styles.hero` blir unikt (f.eks. `Hero-module__x__hero`), så ingen kollisjon |

Erstatt innholdet i `src/app/(frontend)/styles.css` (importeres allerede i
`layout.tsx`):

```css
/* Global styles: colours, reset, typography and page layout.
   Styles for a single component live in a *.module.css next to it. */

:root {
  --color-text: #1f2937;
  --color-muted: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f3f4f6;
  --color-border: #e5e7eb;
  --color-accent: #2563eb;
  --radius: 0.5rem;
  --space: 1rem;
  --max-width: 60rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body,
h1,
h2,
h3,
p {
  margin: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-background);
}

h1,
h2,
h3 {
  line-height: 1.2;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: var(--color-accent);
}

/* Page layout: header, main and footer stacked, footer pushed to the bottom */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 2.5);
  width: 100%;
  max-width: var(--max-width);
  margin-inline: auto;
  padding: calc(var(--space) * 2) var(--space);
}
```

**Forklar:**
- **CSS-variabler** (`--color-accent` osv.) defineres én gang i `:root`
  og brukes i alle modulene med `var(--color-accent)`. Vil du bytte farge,
  endrer du bare én linje.
- `.app-container` med `min-height: 100vh` og `main { flex: 1 }` dytter
  footeren ned til bunnen, også på korte sider.
- `main` har `max-width` og `gap`, så alle blocks får lik bredde og
  avstand. Blocksene trenger derfor ikke egen margin.

`src/components/blocks/RenderBlocks.tsx`:

```tsx
import type { Page } from '@/payload-types'
import Hero from './Hero/Hero'
import TextContent from './TextContent/TextContent'
import CallToAction from './CallToAction/CallToAction'

type Props = {
  blocks: Page['layout']
}

export default function RenderBlocks({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'hero':
            return <Hero key={block.id} {...block} />
          case 'text':
            return <TextContent key={block.id} {...block} />
          case 'cta':
            return <CallToAction key={block.id} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
```

**Snakkepunkt:** inni hver `case` vet TypeScript nøyaktig hvilken block
det er (`block.blockType === 'hero'` gir typen `HeroBlock`). Derfor kan vi
spre `{...block}` rett inn som props. Det heter *discriminated union*.

`src/components/blocks/Hero/Hero.tsx`:

```tsx
import Image from 'next/image'
import type { HeroBlock } from '@/payload-types'
import styles from './Hero.module.css'

export default function Hero({ heading, subheading, image }: HeroBlock) {
  // image is a Media object when depth >= 1, otherwise just an id
  const media = typeof image === 'object' ? image : null

  return (
    <section className={styles.hero}>
      {media?.url && (
        <Image
          className={styles.image}
          src={media.url}
          alt={media.alt}
          width={media.width ?? 1200}
          height={media.height ?? 600}
        />
      )}
      <div className={styles.content}>
        <h1>{heading}</h1>
        {subheading && <p>{subheading}</p>}
      </div>
    </section>
  )
}
```

`src/components/blocks/Hero/Hero.module.css`:

```css
.hero {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 1.5);
}

.image {
  width: 100%;
  max-height: 24rem;
  object-fit: cover;
  border-radius: var(--radius);
}

.content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 0.5);

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
  }

  p {
    font-size: 1.25rem;
    color: var(--color-muted);
  }
}
```

`src/components/blocks/TextContent/TextContent.tsx`:

```tsx
import type { Text } from '@/payload-types'
import styles from './TextContent.module.css'

export default function TextContent({ heading, body }: Text) {
  return (
    <section className={styles.text}>
      {heading && <h2>{heading}</h2>}
      <p>{body}</p>
    </section>
  )
}
```

`src/components/blocks/TextContent/TextContent.module.css`:

```css
.text {
  max-width: 65ch;

  h2 {
    margin-block-end: calc(var(--space) * 0.5);
  }

  p {
    /* Keep the line breaks the editor typed in the textarea */
    white-space: pre-line;
  }
}
```

`src/components/blocks/CallToAction/CallToAction.tsx`:

```tsx
import Link from 'next/link'
import type { CallToActionBlock } from '@/payload-types'
import styles from './CallToAction.module.css'

export default function CallToAction({ text, buttonLabel, page }: CallToActionBlock) {
  // page is a Page object when depth >= 1, otherwise just an id
  if (typeof page !== 'object') return null

  const href = page.slug === 'home' ? '/' : `/${page.slug}`

  return (
    <section className={styles.cta}>
      <p>{text}</p>
      <Link className={styles.button} href={href}>
        {buttonLabel}
      </Link>
    </section>
  )
}
```

`src/components/blocks/CallToAction/CallToAction.module.css`:

```css
.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space);
  padding: calc(var(--space) * 1.5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
}

.button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  background-color: var(--color-accent);
  color: white;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }
}
```

**Forklar:**
- **CSS Modules:** filen må hete `*.module.css`. `styles.hero` blir et
  unikt klassenavn, så `.button` i to filer kolliderer ikke. Nøstet CSS
  (`h1` inni `.content`) er vanlig CSS. Hver selector i en modul må ha en
  klasse: `.content h1` er greit, men `h1` alene gir byggefeilen
  `Selector "h1" is not pure`. Slike regler hører hjemme i den globale filen.
- **`typeof x === 'object'`** er samme mønster som `artist` forrige uke.
  En relasjon/upload er enten bare en id eller hele objektet, avhengig av `depth`.
- **`next/image`** fungerer med Payload-bilder fordi starterens
  `next.config.ts` tillater `/api/**` (`images.localPatterns`).

### Rutene

`src/app/(frontend)/page.tsx` (erstatt innholdet) henter siden med
slug `home`:

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/blocks/RenderBlocks'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 1,
  })

  const page = docs[0]
  if (!page) return notFound()

  return <RenderBlocks blocks={page.layout} />
}
```

`src/app/(frontend)/[slug]/page.tsx` gjelder for alle andre sider:

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/blocks/RenderBlocks'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const page = docs[0]
  if (!page) return notFound()

  return <RenderBlocks blocks={page.layout} />
}
```

**Forklar:**
- `find` + `where: { slug: { equals } }` brukes fordi vi slår opp på
  et felt, ikke på id. Forrige uke brukte vi `findByID`. `find` gir alltid en
  liste (`docs`), så vi tar `docs[0]`.
- `params` er et **Promise** i Next 16 og må `await`-es.
- `depth: 1` henter bildet (upload) og siden i CTA-en (relationship)
  som hele objekter.
- `/admin` og `/api` virker fortsatt. De er egne mapper i `(payload)`.
  Parentesene er en *route group*, og navnet kommer ikke med i URL-en.

Test `/`, `/about` og `/finnes-ikke` (404). Uten en side med slug
`home` gir også `/` 404.

---

## 01:30–01:50 — Del 4: Globals

**Konsept:** en global er ett dokument med felter. Den har ingen liste og
ingen «Create new». Den passer til innhold som finnes én gang på nettstedet.
Den hentes med `findGlobal({ slug })`, ikke med `find`.

`src/globals/Header.ts`:

```ts
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
    },
    {
      name: 'navItems',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
        },
      ],
    },
  ],
}
```

`src/globals/Footer.ts`:

```ts
import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
  ],
}
```

Registrer dem i `payload.config.ts`:

```ts
import { Header } from './globals/Header';
import { Footer } from './globals/Footer';

export default buildConfig({
  // ...
  blocks,
  collections,
  globals: [Header, Footer],
  // ...
});
```

**Forklar:**
- `type: 'array'` er en liste med rader der *alle radene har samme felter*.
  Et blocks-felt er en liste der *hver rad kan være en ulik type*. Det er
  hele forskjellen.
- `admin.group: 'Settings'` legger globals under en egen overskrift i
  admin-menyen.
- `access.read: () => true` gjør dataene lesbare for alle via REST
  (`/api/globals/header`). **Local API** (`getPayload`) hopper over
  access control som standard (`overrideAccess` er `true`). Frontenden vår
  ville derfor fungert uten. Vi setter det likevel, så REST også virker.

Kjør `npm run generate:types`, og fyll inn Header og Footer i admin.

### Header og Footer i frontenden

Erstatt `src/components/Header/Header.tsx`. De hardkodede lenkene
(`/products`, `/dummy2`) kommer nå fra globalen. Slett `Header.css` og
lag `Header.module.css` i stedet:

```tsx
import styles from "./Header.module.css";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function Header() {
    const payload = await getPayload({ config });
    const header = await payload.findGlobal({ slug: "header", depth: 1 });

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link className={styles.logo} href="/">{header.siteName || "Home"}</Link>
                <nav className={styles.nav}>
                    {header.navItems?.map((item) => {
                        if (typeof item.page !== "object") return null;
                        const href = item.page.slug === "home" ? "/" : `/${item.page.slug}`;

                        return (
                            <Link key={item.id} href={href}>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
```

`src/components/Header/Header.module.css`:

```css
.header {
  border-bottom: 1px solid var(--color-border);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space);
  max-width: var(--max-width);
  margin-inline: auto;
  padding: var(--space);
}

.logo {
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.nav {
  display: flex;
  gap: var(--space);

  a {
    color: var(--color-muted);
    text-decoration: none;

    &:hover {
      color: var(--color-text);
    }
  }
}
```

Ny `src/components/Footer/Footer.tsx`:

```tsx
import styles from "./Footer.module.css";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function Footer() {
    const payload = await getPayload({ config });
    const footer = await payload.findGlobal({ slug: "footer" });

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                {footer.text && <p>{footer.text}</p>}
                {footer.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
            </div>
        </footer>
    );
}
```

`src/components/Footer/Footer.module.css`:

```css
.footer {
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.875rem;
}

.inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space);
  max-width: var(--max-width);
  margin-inline: auto;
  padding: var(--space);
}
```

**`.inner`-mønsteret:** `<header>` og `<footer>` går i full bredde, så
streken (`border`) går kant til kant. Den indre `div`-en får samme
`max-width` som `main`, så innholdet står på linje med resten av siden.

I `src/app/(frontend)/layout.tsx`: importer `Footer`, bytt
`<footer>Footer</footer>` med `<Footer />` og legg til denne linjen over
`metadata`:

```tsx
// Content comes from Payload, so render on every request instead of once at build time
export const dynamic = "force-dynamic";
```

**Hvorfor?** `/` har ingen dynamiske deler. Uten linjen lager
`npm run build` en *statisk* forside én gang ved bygg, og endringer i
admin vises ikke i produksjon før neste bygg. `force-dynamic` i layouten
gjelder for alle sider under den. I `npm run dev` merker du ingen
forskjell, fordi dev alltid rendrer på nytt.

**Forklar:**
- Header og Footer er **async Server Components**. De henter data selv,
  så `layout.tsx` trenger ingen endring utover importen.
- `siteName` er `required`, men globalen er tom til noen lagrer den.
  Derfor står `|| "Home"` der.
- Vi importerer ikke typen `Header` fra `payload-types`, fordi den heter det
  samme som komponenten. `findGlobal` gir riktig type automatisk ut fra
  `slug`.

---

## 01:50–02:00 — Migrasjon, oppsummering, hjemmelekse

**Migrasjon:** i dev bruker Postgres-adapteren *push*. Endringer i
configen skrives rett til den lokale databasen. Når en funksjon er
ferdig, lag en migrasjonsfil til produksjon:

```bash
npm run migrate:create -- blocks-and-globals
```

Filen havner i `src/migrations/` og sjekkes inn i git. Ikke kjør
`npm run migrate` mot den lokale dev-databasen. Push og migrasjoner skal
ikke blandes. I produksjon kjøres migrasjonene automatisk
(`prodMigrations` i configen).

**Oppsummering (spør klassen):**
1. Hva er forskjellen på en block, et array-felt og en collection?
2. Hvorfor lagrer Payload `blockType`, og hvor bruker vi den?
3. Hvorfor må `HeroLabel` ha `'use client'`, og hvordan finner admin den?
4. Når bruker du en global i stedet for en collection?
5. Hva skjer med `image` og `page` hvis vi setter `depth: 0`?

**Huskeliste ved endringer:**

| Endret …                       | Kjør                           |
|--------------------------------|--------------------------------|
| felter / blocks / globals      | `npm run generate:types`       |
| sti til admin-komponent        | `npm run generate:importmap` hvis admin ikke finner den |
| ferdig med en funksjon         | `npm run migrate:create`       |

**Hjemmelekse:**
1. Lag en ny block `quote` (felter: `quote`, `author`) med komponent og
   CSS Module, og legg den til i `blockReferences` og `RenderBlocks`.
2. Sider uten Hero får ingen `<h1>`. Vis `page.title` som `<h1>` hvis
   første block ikke er en Hero.
3. Bonus: legg en egen `Label`-komponent på CTA-blocken som viser `buttonLabel`.

---

## Dokumentasjon brukt

- Payload, Blocks-felt: <https://payloadcms.com/docs/fields/blocks>
- Payload, Array-felt (`useRowLabel`): <https://payloadcms.com/docs/fields/array>
- Payload, Globals: <https://payloadcms.com/docs/configuration/globals>
- Payload, Custom components / import map: <https://payloadcms.com/docs/custom-components/overview>
- Payload, Local API (`findGlobal`, `overrideAccess`): <https://payloadcms.com/docs/local-api/overview>
- Payload, Postgres `push` og migrasjoner: <https://payloadcms.com/docs/database/postgres>, <https://payloadcms.com/docs/database/migrations>
- Next.js, dynamiske ruter (`params` som Promise): <https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes>
- Next.js, CSS Modules: <https://nextjs.org/docs/app/getting-started/css>
