# CSS i React — vanlig ("straight") CSS og beste praksis

Vi la til vanlig CSS i prosjektet (ikke CSS Modules, ikke styled-components — bare `.css`-filer importert i komponenter). Dette dokumentet forklarer hva vi gjorde og hvilke fallgruver dere bør kjenne til når dere jobber med rå CSS i et React-prosjekt.

---

## Hva vi la til

```
src/
├── index.css        ← globale/base-stiler, importeres én gang i main.tsx
├── App.css          ← layout for App-komponenten
├── PlayerCard.css   ← stiler for PlayerCard-komponenten
```

**`src/index.css`** (base/reset — gjelder hele siden):

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f7f7f7;
  color: #1a1a1a;
}
```

**`src/App.css`** (layout — plasserer kortene ved siden av hverandre):

```css
.app {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 32px;
}
```

**`src/PlayerCard.css`** (komponentens egne stiler):

```css
.player-card {
  min-width: 200px;
  padding: 16px 20px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-family: inherit;
}

.player-card__name {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.player-card__score {
  margin: 0 0 16px;
  font-size: 2.5rem;
  font-weight: bold;
}

.player-card__button {
  padding: 6px 14px;
  margin-right: 8px;
  border: 1px solid #999;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.player-card__button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.player-card__button--reset {
  border-color: #c0392b;
  color: #c0392b;
}
```

Og i komponentene importerer vi filen vi trenger:

```tsx
// PlayerCard.tsx
import "./PlayerCard.module.css";
```

```tsx
// App.tsx
import "./App.css";
```

Vite plukker opp CSS-importer og bunter dem inn i sluttresultatet automatisk — ingen ekstra oppsett nødvendig.

---

## Hvorfor dette ikke er "gratis" — det store problemet med ren CSS

**Snakkepunkt:** I motsetning til CSS Modules eller styled-components, er en vanlig 
`.css`-import **ikke scopet** til komponenten. Alle klassenavn havner i **ett globalt navnerom** 
for hele appen. Hvis to komponenter begge definerer `.card`, vinner den som 
lastes sist — uansett hvilken fil den kom fra. Dette er den klassiske "CSS er global"-fellen.

---

## Beste praksis når dere bruker vanlig CSS i React

### 1. Ko-lokaliser CSS-filen med komponenten

Legg `PlayerCard.css` rett ved siden av `PlayerCard.tsx`, ikke i én stor delt fil. Det gjør det lett å se hva som hører sammen, og lett å fjerne begge filene sammen hvis komponenten slettes.

### 2. Prefiks klassenavn med komponentnavnet (BEM-lignende)

Siden CSS ikke er scopet automatisk, må **dere** sørge for at klassenavn ikke kolliderer. Vi brukte et BEM-lignende mønster:

```
.player-card              → blokken (komponenten)
.player-card__name        → et element inni blokken
.player-card__button--reset → en variant/modifier av et element
```

- `blokk__element` for ting *inni* komponenten
- `blokk__element--variant` for varianter

Dette gjør det nesten umulig at `.player-card__name` kolliderer med en annen komponents klasse, selv om begge har et element som heter "name".

### 3. Unngå generiske, "fristende" klassenavn

Ting som `.card`, `.button`, `.title`, `.container` *ser* ufarlige ut i én fil, men blir tikkende bomber i et prosjekt med mange komponenter. Første gang to komponenter begge lager `.title` med ulik styling, får dere en bug som er vanskelig å spore — fordi feilen ikke ligger i komponentens egen fil.

### 4. Skill globale stiler (`index.css`) fra komponent-stiler (`App.css`, `PlayerCard.css`)

- `index.css` importeres **én gang**, i `main.tsx`, og inneholder ting som gjelder *hele* appen: CSS-reset, fonter, bakgrunnsfarge, CSS-variabler.
- Komponent-CSS importeres **i komponenten den gjelder for**, og inneholder bare stiler for den komponenten.

Ikke bland disse — unngå å legge komponent-spesifikke regler i `index.css`, da mister dere oversikten over hva som styler hva.

### 5. Bruk CSS custom properties (variabler) for delte verdier

Hvis flere komponenter skal dele farger, avstander eller border-radius, definer dem som CSS-variabler i `index.css` eller `:root`, og referer til dem i komponent-CSS:

```css
/* index.css */
:root {
  --border-color: #d0d0d0;
  --radius: 8px;
}

/* PlayerCard.module.css */
.player-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}
```

Da slipper dere å hardkode samme fargekode 10 steder, og kan endre temaet ett sted.

### 6. Ikke bruk inline `style={{ }}` for stiler som gjenbrukes

Inline styles (`<div style={{ padding: 16 }}>`) går forbi CSS-filen helt, kan ikke bruke 
`:hover`/media queries enkelt, og er tyngre å vedlikeholde. Bruk inline style **kun** 
når verdien er dynamisk og beregnet i JS (f.eks. en progress-bar sin `width` basert på en variabel)
— ellers: bruk en klasse.

### 7. Vurder CSS Modules når prosjektet vokser

Vanlig CSS fungerer helt fint for et lite prosjekt som dette,
så lenge dere er disiplinerte med navngivning (punkt 2–3). 
Men i et større prosjekt med mange bidragsytere blir global navnekollisjon 
fort et reelt problem. Da er **CSS Modules** (`PlayerCard.module.css`) 
et naturlig neste steg — Vite støtter det direkte, og det gir automatisk 
scoping uten at dere trenger et helt nytt bibliotek.

---

## CSS Modules — praktisk eksempel med PlayerCard

Dette viser konkret hvordan `PlayerCard.css` *ville* sett ut som en CSS Module — altså den løsningen punkt 7 peker mot. Vi gjør ikke denne endringen i prosjektet nå (BEM-prefiksene fra punkt 2 løser navnekollisjon godt nok for et prosjekt med to komponenter), men det er nyttig å se hvordan overgangen ser ut.

### Steg 1: Vite-oppsett — allerede på plass

CSS Modules krever ingen ekstra konfigurasjon i Vite — det fungerer automatisk for enhver fil med `.module.css`-endelse. TypeScript-typene for disse importene kommer fra `vite/client`, som allerede står i `tsconfig.app.json`:

```json
"types": ["vite/client"]
```

Prosjektet er altså klart for CSS Modules akkurat som det er, uten en egen `vite-env.d.ts`.

### Steg 2: Døp om filen

```
PlayerCard.css  →  PlayerCard.module.css
```

Filnavnet er selve signalet til Vite om at dette er en modul, ikke vanlig global CSS.

### Steg 3: Skriv klassenavn i camelCase

I en vanlig `.css`-fil trengte vi BEM (`.player-card__name`) for å unngå kollisjon manuelt. I en CSS Module trengs ikke det lenger — Vite gjør navnene unike automatisk ved bygging. Da kan vi forenkle til camelCase, som er lettere å skrive ut i JS/TS:

```css
/* PlayerCard.module.css */
.playerCard {
  min-width: 200px;
  padding: 16px 20px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-family: inherit;
}

.playerName {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.score {
  margin: 0 0 16px;
  font-size: 2.5rem;
  font-weight: bold;
}

.button {
  padding: 6px 14px;
  margin-right: 8px;
  border: 1px solid #999;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.button:hover {
  background: rgba(0, 0, 0, 0.06);
}

.resetButton {
  border-color: #c0392b;
  color: #c0392b;
}
```

**Snakkepunkt:** Legg merke til at `.button` og `.score` — navn som var for generiske til å bruke globalt i punkt 3 — nå er helt trygge. Vite hasher dem til noe unikt bak kulissene (f.eks. `_button_a1b2c3`), så de kan aldri kollidere med en `.button`-klasse i en annen fil.

### Steg 4: Importer som et objekt, ikke som en side-effekt

```tsx
// PlayerCard.tsx
import styles from "./PlayerCard.module.css";

interface PlayerCardProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onReset: () => void;
}

export default function PlayerCard({ name, score, onIncrement, onReset }: PlayerCardProps) {
  return (
    <div className={styles.playerCard}>
      <h2 className={styles.playerName}>{name}</h2>
      <p className={styles.score}>{score}</p>
      <button className={styles.button} onClick={onIncrement}>+1</button>
      <button
        className={`${styles.button} ${styles.resetButton}`}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
```

**Snakkepunkter:**
- `import styles from "./PlayerCard.module.css"` gir dere et JS-objekt der hver klasse fra filen er en nøkkel — `styles.playerCard`, `styles.score`, osv.
- For Reset-knappen trenger vi **to** klasser samtidig (`button` og `resetButton`). Siden dette ikke lenger er strenger vi selv skriver, må vi kombinere dem med en template-literal: `` `${styles.button} ${styles.resetButton}` ``.
- I et større prosjekt med mange slike kombinasjoner blir dette fort uoversiktlig — da er et lite hjelpebibliotek som [`clsx`](https://www.npmjs.com/package/clsx) verdt å vurdere: `clsx(styles.button, styles.resetButton)`.

### CSS Modules vs. BEM + vanlig CSS — når velger vi hva?

| | Vanlig CSS + BEM (det vi bruker nå) | CSS Modules |
|---|---|---|
| Scoping | Manuelt, via disiplin (prefiksering) | Automatisk, håndhevet av verktøyet |
| Klassenavn | Må være lange/unike (`player-card__name`) | Kan være korte (`.score`, `.button`) |
| Kombinere klasser | Vanlig streng: `"button reset"` | Må hente fra objektet: `` `${styles.button} ${styles.reset}` `` |
| Læringskurve | Ingen — er bare CSS | Litt — nytt importmønster |
| Passer best til | Små prosjekter, få komponenter | Prosjekter som vokser, flere bidragsytere |

**Miniøvelse (5–7 min):** Ta `App.css` og gjør den samme øvelsen — døp om til `App.module.css`, skriv om `.app`-klassen, og oppdater importen i `App.tsx`. Diskuter: føltes dette nødvendig for et så lite prosjekt, eller var BEM-navngivningen god nok?

---

## Oppsummering — sjekkliste for ren CSS i React

- [ ] Én CSS-fil per komponent, liggende rett ved siden av `.tsx`-filen
- [ ] Klassenavn prefikset med komponentnavn (BEM-lignende)
- [ ] Ingen generiske klassenavn som `.title`, `.card`, `.button` alene
- [ ] Globale stiler kun i `index.css`, importert én gang i `main.tsx`
- [ ] Delte verdier (farger, avstand) som CSS-variabler, ikke hardkodet flere steder
- [ ] Inline `style={{ }}` kun for verdier som faktisk er dynamiske
- [ ] Vurder CSS Modules hvis prosjektet vokser forbi noen få komponenter

**Miniøvelse (5 min):** Gi `PlayerCard`-komponenten en ny visuell variant — f.eks. en gyllen kant (`.player-card--leader`) som vises på spilleren med høyest poengsum. Diskuter: hvordan ville dere unngått at denne klassen kolliderer med en tilsvarende klasse i en helt annen komponent?
