# Intro til React med Vite (2 timer)

1.2.1 JSX
1.2.2 JSX og betinget rendering
1.2.3 Variabler med useState
1.2.4 JSX og "if else"
1.2.5 JSX og map() for visning av elementer i et array
1.2.6 TSX og et array med objekter

---

## Tidsplan (oversikt)

| Tid         | Varighet | Tema                             |
|-------------|----------|----------------------------------|
| 00:00–00:10 | 10 min   | Intro + oppsett av Vite-prosjekt |
| 00:10–00:25 | 15 min   | 1.2.1 JSX                        |
| 00:25–00:40 | 15 min   | 1.2.2 JSX og betinget rendering  |
| 00:40–00:55 | 15 min   | 1.2.3 Variabler med useState     |
| 00:55–01:05 | 10 min   | ☕ Pause                          |
| 01:05–01:20 | 15 min   | 1.2.4 JSX og "if else"           |
| 01:20–01:40 | 20 min   | 1.2.5 JSX og map()               |
| 01:40–01:55 | 15 min   | 1.2.6 TSX og array med objekter  |
| 01:55–02:00 | 5 min    | Oppsummering + hjemmeoppgaver    |

---

## Forberedelser (før økten)

- Node.js installert (LTS versjon)
- Kodeeditor (VS Code anbefalt) med utvidelsen ""ES7+ React/Redux/React-Native snippets
- https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets
- Terminal klar

---

## 00:00–00:10 — Intro og oppsett

**Snakkepunkter:**
- Hva er React? Komponentbasert bibliotek for å bygge UI.
- Hva er Vite? Rask build-verktøy/dev-server, mye raskere enn Create React App.
- I dag bygger vi et lite prosjekt steg for steg og introduserer TypeScript mot slutten (TSX).

**Walkthrough — opprett prosjekt:**

```bash
npm create vite@latest 
cd react-intro
npm install
npm run dev
```

- Vis mappestrukturen: `src/main.jsx`, `src/App.jsx`, `index.html`
- Åpne `http://localhost:5173` og vis at appen kjører
- Rydd i `App.jsx` — fjern boilerplate-innhold slik at dere starter med en enkel komponent:

snakk om mappe strukturen og hvordan package.json er oppskriften for et prosjekt. 

```jsx
function App() {
  return <h1>Hei, React!</h1>;
}

export default App;
```

---

## 00:10–00:25 — 1.2.1 JSX

**Snakkepunkter:**
- JSX = JavaScript XML. Lar oss skrive HTML-lignende syntaks inni JavaScript.
- Under panseret kompileres JSX til `React.createElement(...)` kall.
- Regler: én rot-element, `className` i stedet for `class`, curly braces `{}` for JS-uttrykk.

**Walkthrough:**

```jsx
function App() {
  const navn = "Ola";
  return (
    <div>
      <h1>Hei, {navn}!</h1>
      <p>Klokka er {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
```

- Vis at `{}` kan inneholde et hvilket som helst JS-uttrykk (variabler, funksjonskall, matte)
- Vis vanlig feil: å prøve å skrive `if`-setninger direkte i JSX (fungerer ikke — kun uttrykk, ikke statements)

**Miniøvelse (3–4 min):**
Lag en komponent `Profil` som viser navn, alder og by fra variabler.

---

## 00:25–00:40 — 1.2.2 JSX og betinget rendering

**Snakkepunkter:**
- Vi kan ikke bruke `if/else` rett i JSX, men vi kan bruke uttrykk som `&&` og den ternære operatoren `? :`.

**Walkthrough:**


 ```jsx
 function App() {
  const visSkurk = false;
  return (
          <main>
            <h1>Intro til JSX</h1>
            <p>For å komme i gang...</p>
            {
                    visSkurk && <p className='skurk'>🥷🏻</p>
            }
          </main>
  );
}
 ```

```jsx
function App() {
  const erInnlogget = true;

  return (
    <div>
      {erInnlogget && <p>Velkommen tilbake!</p>}

      {erInnlogget ? (
        <p>Du er logget inn</p>
      ) : (
        <p>Du må logge inn</p>
      )}
    </div>
  );
}
```
- Poeng: `&&` viser noe bare når venstresiden er `true`
- Ternær operator gir en verdi uansett — bra når du trenger en "else"


**Miniøvelse (3–4 min):**
Vis "Handlekurven er tom" hvis en variabel `antallVarer` er 0, ellers vis antallet.

---

## 00:40–00:55 — 1.2.3 Variabler med useState

**Snakkepunkter:**
- Vanlige JS-variabler "glemmes" når komponenten rendres på nytt.
- `useState` er en React Hook som gir komponenten "minne" mellom renderinger.
- Kalles med en starverdi, returnerer et array: `[verdi, settVerdi]`.

**Walkthrough:**

```jsx
import { useState } from "react";

function App() {
  const [antall, settAntall] = useState(0);

  return (
    <div>
      <p>Du har klikket {antall} ganger</p>
      <button onClick={() => settAntall(antall + 1)}>
        Klikk meg
      </button>
    </div>
  );
}
```

- Forklar hvorfor `let antall = 0` IKKE fungerer for å oppdatere UI
- Vis at hvert kall til `settAntall` trigger en ny rendering
- Nevn: aldri muter state direkte, bruk alltid setter-funksjonen

**Miniøvelse (5 min):**
Lag en enkel "lyspære"-komponent med en `boolean` state som toggler mellom "På" og "Av" ved klikk.

---

## 00:55–01:05 — Pause ☕

---

## 01:05–01:20 — 1.2.4 JSX og "if else"

**Snakkepunkter:**
- Siden JSX kun tar uttrykk, må `if/else`-logikk enten:
  1. skje **før** `return` (vanlig funksjonslogikk), eller
  2. legges i en egen funksjon som kalles inni JSX.

**Walkthrough:**

```jsx
function App() {
  const [status, settStatus] = useState("laster");

  if (status === "laster") {
    return <p>Laster innhold...</p>;
  }

  if (status === "feil") {
    return <p>Noe gikk galt 😢</p>;
  }

  return <p>Innhold lastet!</p>;
}
```

- Alternativ med hjelpefunksjon:

```jsx
function visMelding(status) {
  if (status === "laster") return "Laster...";
  if (status === "feil") return "Feil oppstod";
  return "Alt er klart!";
}

function App() {
  const [status] = useState("laster");
  return <p>{visMelding(status)}</p>;
}
```

Ta en gjennomgang med komponenter ( enkelt )


- Diskuter: når bruker vi `if/else` (tidlig retur, kompleks logikk) vs. ternær/`&&` (enkle, inline valg)?

## if/else vs. ternær/&& — når bruker vi hva?

### if/else (tidlig retur / kompleks logikk)

Bruk `if/else` når:
- Du har **flere enn 2 utfall** (3+ tilstander)
- Logikken involverer **flere betingelser** eller **beregninger** før du vet hva som skal vises
- Du vil returnere **helt forskjellig JSX** for hver tilstand (ikke bare bytte ut en liten del)

  ```jsx
  function Status({ status }) {
    if (status === "laster") {
      return <Spinner />;
    }

    if (status === "feil") {
      return <Feilmelding />;
    }

    return <Innhold />;
  }
  ```

**Hvorfor:** Dette er lettere å lese enn tre nøstede ternærer. Tidlig retur lar deg "avslutte"
funksjonen så snart du vet svaret, i stedet for å bygge én stor, forgrenet uttrykkskjede.

### Ternær `? :` (enkelt enten/eller-valg, inline)

Bruk ternær når:
- Du har **nøyaktig 2 utfall**
- Valget skjer **inni** JSX-en, ikke som en hel egen retur
- Begge grenene er **korte**

  ```jsx
  <p>{erInnlogget ? "Velkommen tilbake" : "Vennligst logg inn"}</p>
  ```

**Hvorfor:** Det er kompakt og holder seg inline der det brukes — du slipper å hoppe ut av JSX-en for
å forstå logikken.

### `&&` (vis noe, eller ingenting)

Bruk `&&` når:
- Du bare trenger å **vise eller skjule** ett element — det finnes ikke noe "else"

  ```jsx
  {feil && <p className="feil">{feil}</p>}
  ```

**Hvorfor:** Simplere enn `condition ? <X/> : null` — samme resultat, mindre støy.

### Tommelfingerregel å gi elevene

| Situasjon                                         | Verktøy                             |
  |---------------------------------------------------|-------------------------------------|
| 2+ helt ulike JSX-retur, kompleks betingelse      | `if/else` med tidlig retur          |
| Enkelt A-eller-B, inline i JSX                    | Ternær `? :`                        |
| Vis/skjul ett element                             | `&&`                                |
| Ternærene begynner å nøstes (`a ? b : c ? d : e`) | Stopp — bytt til `if/else` eller en |
| hjelpefunksjon                                    |                                     |

**Nøkkelpoeng å fremheve:** Det handler om lesbarhet, ikke funksjonalitet — alle tre kan ofte løse
samme problem, men nøstede ternærer blir fort uleselige, mens `if/else` med tidlig retur holder hver
gren enkel å følge.

**Miniøvelse (4–5 min):**
Lag en komponent som viser "Godkjent ✅", "Ikke bestått ❌" eller "Venter på resultat ⏳" basert på en `karakter`-variabel, ved hjelp av `if/else`.

---

## 01:20–01:40 — 1.2.5 JSX og map() for visning av elementer i et array

**Snakkepunkter:**
- `map()` brukes til å transformere et array til en liste av JSX-elementer.
- React krever en unik `key`-prop på hvert listeelement (for effektiv oppdatering av DOM).

**Walkthrough:**

```jsx
function App() {
  const frukter = ["Eple", "Banan", "Appelsin", "Pære"];

  return (
    <ul>
      {frukter.map((frukt, index) => (
        <li key={index}>{frukt}</li>
      ))}
    </ul>
  );
}
```

- Forklar hvorfor `key` trengs — vis konsoll-advarselen som dukker opp uten `key`
- Nevn at `index` som key er ok for statiske lister, men problematisk hvis listen endres (sortering, sletting) — bedre med en unik id fra dataen når mulig

**Miniøvelse (6–7 min):**
Ta utgangspunkt i et array med navn på handleliste-varer og render dem som en liste med kryss-ikon foran hver vare.

---

## 01:40–01:55 — 1.2.6 TSX og et array med objekter

**Snakkepunkter:**
- TSX = TypeScript + JSX. Gir typesikkerhet på props, state og data.
- Vi definerer en `type`/`interface` for objektene i arrayet, og bruker `map()` som før.
- Vis kort hvordan man setter opp TypeScript i Vite (eller vis et prosjekt som allerede har det).

**Oppsett (hvis ikke allerede TS-prosjekt):**

```bash
npm create vite@latest react-intro-ts -- --template react-ts
```

**Walkthrough:**

```tsx
type Bruker = {
  id: number;
  navn: string;
  alder: number;
};

const brukere: Bruker[] = [
  { id: 1, navn: "Kari", alder: 28 },
  { id: 2, navn: "Ola", alder: 34 },
  { id: 3, navn: "Nora", alder: 22 },
];

function App() {
  return (
    <ul>
      {brukere.map((bruker) => (
        <li key={bruker.id}>
          {bruker.navn} ({bruker.alder} år)
        </li>
      ))}
    </ul>
  );
}

export default App;
```

- Poeng: `key={bruker.id}` er nå en ekte unik id fra dataen, ikke index
- Vis hvordan TypeScript gir autofullføring og feilmelding hvis man f.eks. skriver `bruker.navnn`
- Koble sammen med 1.2.2–1.2.4: kombiner betinget rendering med lister, f.eks. vis "Ingen brukere funnet" hvis arrayet er tomt

**Miniøvelse (5 min):**
Definer en `type Produkt` med `id`, `navn`, `pris`. Lag et array med 4 produkter og render en liste med navn og pris. Vis "Utsolgt" i stedet for pris hvis `pris === 0`.

---

## 01:55–02:00 — Oppsummering

**Gjennomgå kort:**
- JSX = HTML-lignende syntaks i JS, kun uttrykk i `{}`
- Betinget rendering: `&&` og `? :` for enkle valg, `if/else` for tidlig retur/kompleks logikk
- `useState` gir komponenter minne mellom renderinger
- `map()` + `key` for å rendre lister
- TSX gir typesikkerhet på data og props

**Hjemmeoppgave / videre øving:**
1. Bygg en handleliste-app: legg til varer i et array med `useState`, vis dem med `map()`, og la bruker fjerne varer.
2. Konverter appen til TSX og lag en `type` for hver vare (`{ id, navn, kjøpt }`).
3. Legg til betinget rendering: vis "Handlelisten er tom" når arrayet er tomt, og strek over varer som er `kjøpt`.

---

## Ressurser

- [React-dokumentasjon](https://react.dev)
- [Vite-dokumentasjon](https://vitejs.dev)
- [TypeScript-dokumentasjon](https://www.typescriptlang.org/docs/)
