# Løfte state opp (Lifting State Up)

Dette dokumentet viser steg for steg hvordan vi flyttet `score`-state ut av `PlayerCard` og opp til en felles forelder-komponent, `App`.

---

## Hvorfor gjøre dette?

**Snakkepunkter:**

- I React eier hver komponent sin egen `useState`. Data kan bare flyte **nedover** via props
- — søsken-komponenter kan ikke lese eller endre hverandres state direkte.
- Når to eller flere komponenter må **dele eller koordinere** state (f.eks. vise en totalsum, eller nullstille alle samtidig), 
- må state flyttes opp til **nærmeste felles forelder**. Den forelderen eier state og sender data + funksjoner ned igjen via props.
- Dette mønsteret kalles **"lifting state up"** og er beskrevet i React-dokumentasjonen: https://react.dev/learn/sharing-state-between-components

---

## Steg for steg

### 1. Identifiser hvilken state som må deles, og hvem den nærmeste felles forelderen er

`score` lever i dag inne i `PlayerCard`. `main.tsx` rendrer to `PlayerCard`-instanser direkte — det finnes ingen egen forelder-komponent ennå. Første steg blir derfor å **lage en**.

### 2. Lag en forelder-komponent (`App.tsx`) som eier state

```tsx
// src/App.tsx
import { useState } from "react";
import PlayerCard from "./PlayerCard";

function App() {
  const [aliceScore, setAliceScore] = useState(0);
  const [bobScore, setBobScore] = useState(0);

  return (
    <div className="app">
      {/* PlayerCard rendres her, se steg 4 */}
    </div>
  );
}

export default App;
```

Legg merke til at vi nå har **to separate `useState`-kall** i `App` — ett per spiller. State er fortsatt isolert per spiller, den bor bare et annet sted nå.

### 3. Gjør `PlayerCard` om til en "presentational"-komponent

Fjern `useState` fra `PlayerCard` helt. Komponenten skal ikke lenger *eie* noe 
— den skal bare *vise* det den får inn via props, og *varsle* forelderen når noe skjer (klikk).

```tsx
// src/PlayerCard.tsx
interface PlayerCardProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onReset: () => void;
}

export default function PlayerCard({ name, score, onIncrement, onReset }: PlayerCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{score}</p>
      <button onClick={onIncrement}>+1</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
}
```

**Poeng:** `PlayerCard` vet ingenting om *hvordan* poengsummen endres 
— den kaller bare `onIncrement()` / `onReset()` og stoler på at forelderen håndterer resten. 
Dette gjør komponenten enklere å lese, teste og gjenbruke.

### 4. Koble `App` og `PlayerCard` sammen med props

```tsx
function App() {
  const [aliceScore, setAliceScore] = useState(0);
  const [bobScore, setBobScore] = useState(0);

  return (
    <div className="app">
      <PlayerCard
        name="Alice"
        score={aliceScore}
        onIncrement={() => setAliceScore((score) => score + 1)}
        onReset={() => setAliceScore(0)}
      />
      <PlayerCard
        name="Bob"
        score={bobScore}
        onIncrement={() => setBobScore((score) => score + 1)}
        onReset={() => setBobScore(0)}
      />
    </div>
  );
}
```

**Snakkepunkt:** Legg merke til `setAliceScore((score) => score + 1)` — vi bruker funksjonell oppdatering (en funksjon som tar forrige verdi) i stedet for `setAliceScore(aliceScore + 1)`. Det er en god vane når den nye verdien avhenger av den forrige, og unngår subtile bugs ved raske, etterfølgende oppdateringer.

### 5. Oppdater `main.tsx` til å rendre `App` i stedet for `PlayerCard` direkte

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "./App.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
```

### 6. Test i nettleser

- Kjør `npm run dev`
- Bekreft at "+1" og "Reset" fortsatt fungerer uavhengig for Alice og Bob
- I React DevTools: se at `score` nå vises som state på `App`, ikke lenger på `PlayerCard`

---

## Hva vi vant

Nå som `App` eier begge poengsummene, kan vi bygge ting som **ikke var mulig før**, uten å røre `PlayerCard`:

```tsx
<p>Totalt: {aliceScore + bobScore}</p>
<button onClick={() => { setAliceScore(0); setBobScore(0); }}>Reset alle</button>
```

**Miniøvelse (5–7 min):** Legg til en `<p>`-linje i `App` som viser summen av `aliceScore` og `bobScore`, og en "Reset alle"-knapp som nullstiller begge samtidig.

---

## Oppsummering

| Før                                        | Etter                                                       |
|--------------------------------------------|-------------------------------------------------------------|
| `PlayerCard` eier `score` (via `useState`) | `App` eier `score` for hver spiller                         |
| `PlayerCard` er "smart" (har egen logikk)  | `PlayerCard` er "dum"/presentational (mottar alt via props) |
| Søsken-kort kan ikke koordineres           | `App` kan lese/kombinere/nullstille begge                   |

**Tommelfingerregel:** Start med state der den brukes. Løft den opp først når et annet komponent faktisk trenger tilgang til den.
