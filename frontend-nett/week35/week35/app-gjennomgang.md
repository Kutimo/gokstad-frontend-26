# Gjennomgang: PlayerCard-appen (uke 35)

Denne appen er laget med **Vite + React + TypeScript**. Den viser to "spillerkort" med hver sin poengsum og knapper for å telle opp og nullstille.

---

## Prosjektstruktur

```
week35/
├── index.html
├── src/
│   ├── main.tsx        ← inngangspunkt, monterer React-treet
│   ├── PlayerCard.tsx  ← komponent som viser én spiller
│   ├── App.css
│   └── index.css
```

---

## Slik ser koden ut nå

**`src/PlayerCard.tsx`**

```tsx
import {useState} from "react";

interface PlayerCardProps {
  name: string;
}

export default function PlayerCard({ name }: PlayerCardProps) {
  const [score, setScore] = useState(0);

  return (
    <div>
      <h2>{name}</h2>
      <p>{score}</p>
      <button onClick={() => setScore(score + 1)}>+1</button>
      <button onClick={() => setScore(0)}>Reset</button>
    </div>
  );
}
```

**`src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PlayerCard from "./PlayerCard.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayerCard name="Alice" />
    <PlayerCard name="Bob" />
  </StrictMode>,
)
```

---

## Konsepter appen viser

**Snakkepunkter:**

- **Props** — `PlayerCard` tar imot `name` gjennom et `interface PlayerCardProps`. Props er skrivebeskyttet ("read-only") data som sendes *ned* fra forelder til barn.
- **`useState`** — `score` er state internt i `PlayerCard`. Hver gang `setScore` kalles, rendres komponenten på nytt med den nye verdien.
- **Event handlers** — `onClick={() => setScore(score + 1)}` er en inline-funksjon som kjører når knappen klikkes.
- **Hver komponentinstans har sin egen state** — dette er det viktigste poenget å understreke: fordi `main.tsx` rendrer to `<PlayerCard />`, kaller React `useState(0)` to ganger — én gang per instans. Alice sin `score` og Bob sin `score` er to helt separate variabler i minnet, selv om de kommer fra samme komponent-*funksjon*.

**Miniøvelse (3–4 min):**
La elevene klikke "+1" på Alice sitt kort og spørre: *Hvorfor endres ikke Bob sin poengsum?* Svaret er nøkkelen til å forstå at state er lokal per instans.

---

## Begrensningen i dagens design

Akkurat nå eier hver `PlayerCard` sin egen poengsum, og ingen andre komponenter kan lese eller endre den. Det betyr at vi **ikke** kan:

- Vise en samlet totalsum av begge spillernes poeng
- Lage én "Reset alle"-knapp i `main.tsx`/en forelder-komponent
- La to søskenkomponenter reagere på hverandres poengsum

For å løse dette må state flyttes ut av `PlayerCard` og opp til en felles forelder — dette kalles **"lifting state up"** (å løfte state opp), og er tema for neste steg: se [`loft-state-opp.md`](loft-state-opp.md).
