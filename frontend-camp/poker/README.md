# Video Poker

A "Jacks or Better" video poker game built with React, TypeScript, React Router
and Zustand. Built as a frontend school assignment; the UI is in Norwegian,
this document is in English.

## What it does

- **Spill** (`/`) — the game itself. Deal five cards, hold the ones you want
  to keep, draw new cards for the rest, and get paid out based on the final
  hand.
- **Regler** (`/regler`) — how to play, the full payout table, and info about
  the app.
- **Spillere** (`/spillere`) — pick who's playing. Lists existing players and
  lets you create a new one (starts with 100 coins).

A round survives navigating between screens or reloading the browser: all
game state is persisted to `localStorage`, so you never lose coins or an
in-progress hand by accident.

## How the game works

1. Choose a bet (1–5 coins) and press **Del ut** (Deal). The bet is deducted
   immediately and you're dealt 5 cards from a freshly shuffled 52-card deck.
2. Click the cards you want to **hold**. Held cards are marked and kept.
3. Press **Bytt kort** (Draw) to replace every card you didn't hold with new
   cards from the same deck.
4. Your final hand is scored automatically and any winnings are added to your
   coin total — see the payout table on the Regler page. A pair only pays out
   if it's Jacks or better (J, Q, K, A); anything lower counts as no win,
   which is the standard "Jacks or Better" video poker rule.

## Tech stack & why

- **React Router** drives the three screens (`src/pages/`). Routing lives at
  the top of the tree in `App.tsx`, with a shared `NavBar` so the current
  screen is always obvious (and announced to screen readers via
  `aria-current`, which `NavLink` sets automatically).
- **Zustand** (`src/store/gameStore.ts`) holds all state that belongs to the
  game itself — the deck, the current hand, held/discarded cards, the active
  player and bet, and whether a round is mid-draw. Component-local UI state
  (e.g. the "new player" text input) uses plain `useState` instead, since it
  has no reason to outlive the component or be shared.
- **`persist` middleware** writes the store to `localStorage` on every
  change. This is what makes the app resilient to navigation and page
  reloads — the store doesn't distinguish "still on the game screen" from
  "the user went to look at the rules and came back," it's just state, so
  there was nothing extra to build for that requirement once persistence was
  in place.
- Types (`src/types/`) — `PlayingCard` (suit + rank), `PokerHand` (a union of
  every possible hand name, used by both the evaluator and the payout
  table so they can't drift out of sync), and `Player`.
- Game rules (`src/lib/`) — `deck.ts` builds and Fisher-Yates shuffles a
  52-card deck; `evaluateHand.ts` scores a 5-card hand into a `PokerHand` and
  works out the payout for it.

## Components

| Component | Purpose |
|---|---|
| `Card` | A single playing card. Pure CSS (CSS Grid for the corner/center layout), with a face and a back. |
| `PayoutTable` | The hand → payout table, reused on both the Regler page and (collapsed) on the game screen, with the current/last hand highlighted. |
| `TotalCoins` | Displays the active player's coin count. |
| `CurrentBet` | Displays the current bet. |
| `CurrentHand` | Displays the `PokerHand` the player is currently holding (or just won). |
| `Game` | The game board — wires the above together with the deck/hold/draw controls. |
| `NavBar` | Cross-screen navigation and the active player indicator. |

### Why the card back isn't its own component

`Card` takes a `faceDown` prop rather than having a separate `CardBack`
component. Front and back share the same size, shape, and interactive
wrapper (the hold/discard button, the "Holdt" label, focus handling) — the
only thing that differs is what's painted inside. Splitting it in two would
mean duplicating that shared shell and passing the same card data through an
extra layer for no real benefit, since callers never need a back-of-card
without an actual `PlayingCard` behind it (the deck itself isn't rendered
card-by-card).

## Accessibility & responsive design

- Every interactive element (nav links, hold/discard cards, bet stepper,
  deal/draw button, player list, forms) is a real `<button>`, `<a>`, or form
  control, so the whole game is operable by keyboard alone (Tab to move
  focus, Enter/Space to activate) with visible focus outlines.
- Held cards are exposed via `aria-pressed`; the current hand and payout
  updates use `aria-live="polite"` / `role="status"` so screen reader users
  hear the result without needing to find it visually.
- Layout uses CSS Grid/Flexbox with `clamp()`-based sizing instead of fixed
  pixel widths, so the same markup works from a small phone up to a desktop
  window (see the desktop vs. mobile screenshots taken during development).
- Colors and contrast are defined as CSS custom properties with a
  `prefers-color-scheme: dark` variant, so the app respects the user's OS
  theme.

## Project structure

```
src/
  types/       PlayingCard, PokerHand, Player
  lib/         deck.ts (shuffle), evaluateHand.ts (scoring + payout)
  store/       gameStore.ts (Zustand + localStorage persistence)
  components/  Card, PayoutTable, TotalCoins, CurrentBet, CurrentHand, Game, NavBar
  pages/       GamePage, RulesPage, PlayersPage
  App.tsx      Router setup
```

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run lint      # eslint
```
