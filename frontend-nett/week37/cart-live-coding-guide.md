# Live-coding guide: shopping cart with Zustand (~1 hour)

Builds directly on the week37 product app (routing + `useEffect` fetch from `dummyjson.com`) and the `src/zustand.md` reference doc. Assumes students already have `Layout`, `Products`, `ProductDetail` working with routing.

**Before class:** have students skim `src/zustand.md` sections 1–2 and 5 (why Zustand, first store, actions with arguments) — this session builds exactly that store live, so it should feel like déjà vu rather than new material.

---

## Time plan (overview)

## 00:00–00:05 — Why a cart needs shared state

**Talking points:**
- The cart needs to be read/written from at least three unrelated places: `ProductDetail` (add), `Layout`'s nav (show count), `Cart` page (list/remove/total).
- These components aren't parent/child of each other — they're siblings under `Layout`'s `<Outlet/>`. `useState` + props would mean lifting state all the way up to `App` and drilling it through every route.
- This is exactly the gap Zustand fills (see `zustand.md` §1): one hook, no `<Provider>`, any component can read or write it directly.

Ask the class: *"Where would this state have to live if we only had `useState`?"* — get them to say "in `App`, passed down as props to everything" before moving on. That's the pain the store removes.

---

## 00:05–00:20 — Build the store

Create `src/stores/cartStore.ts`.

**Step 1 — shape the data first, before any Zustand code:**

```ts
export type CartItem = {
    id: number;
    title: string;
    price: number;
    image: string;
    qty: number;
};
```

- Poeng: `qty` is a quantity counter, not a duplicated row — adding the same product twice should bump `qty`, not push a second entry. Set this expectation now; it explains the `addItem` logic in step 2.

**Step 2 — the store itself (no `persist` yet, add that last):**

```ts
import {create} from "zustand";

type CartStore = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    clear: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
    items: [],

    addItem: (item) =>
        set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            return existing
                ? {
                      items: state.items.map((i) =>
                          i.id === item.id ? {...i, qty: i.qty + 1} : i
                      ),
                  }
                : {items: [...state.items, {...item, qty: 1}]};
        }),

    removeItem: (id) =>
        set((state) => ({items: state.items.filter((i) => i.id !== id)})),

    clear: () => set({items: []}),
}));
```

- Live-code this from scratch rather than pasting — type `addItem` first with just the "new item" branch, run it, show it works, *then* add the `existing` branch and explain why (click the same product twice, watch a duplicate row appear in a `console.log`, then fix it).
- Emphasize immutability: `state.items.map(...)` / `[...state.items, ...]` build new arrays. Point at `zustand.md` §5 and §13.2 ("mutating state won't re-render") if anyone tries `state.items.push(...)`.

**Step 3 — wrap it in `persist`:**

```ts
import {persist} from "zustand/middleware";

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({ /* same object as above */ }),
        {name: "cart-storage"}
    )
);
```

- Point out the double `()()` — `create<CartStore>()(persist(...))`. This trips everyone up the first time; `zustand.md` §10 has the explanation (TypeScript can't infer the generic through the middleware wrapper). Don't over-explain the *why*, just flag it as a pattern to copy.
- `name: "cart-storage"` is the `localStorage` key — open DevTools → Application → Local Storage together and point at the empty state before anything's been added.

---

## 00:20–00:30 — "Add to cart" button on `ProductDetail`

In `src/pages/productDetail/ProductDetail.tsx`:

```tsx
import {useCartStore} from "../../stores/cartStore";
// ...
const addItem = useCartStore((s) => s.addItem);
```

Inside the JSX, once `product` is loaded:

```tsx
<button onClick={() => addItem({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.images[0],
})}>
    Add to cart
</button>
```

- Poeng: `addItem` is a **stable reference** — created once when the store is defined, never re-created. Safe to use directly in an event handler, no `useCallback` needed (`zustand.md` §6 makes the same point about store actions in a `useEffect` dependency array).
- Click it a few times on the same product live — nothing *visibly* happens yet (no badge, no cart page). That's intentional suspense for the next two steps.

---

## 00:30–00:40 — Cart badge in the nav

This is the moment that sells Zustand to the class: a component with zero relation to `ProductDetail` reacts to the click from the last step.

In `src/components/Layout.tsx`:

```tsx
import {useCartStore} from "../stores/cartStore";

const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
```

```tsx
<Link to="/cart">Cart ({itemCount})</Link>
```

- Poeng (derived state): we don't store `itemCount` anywhere — it's computed from `items` inside the selector every render. `zustand.md` §5 "Derived values": *"Don't store what you can compute."*
- Go back to `ProductDetail`, click "Add to cart" again, and watch the nav badge update **without navigating anywhere**. That's the payoff — worth pausing on.
- Optional aside if there's time: ask what would happen with a selector like `useCartStore((s) => ({count: ...}))` returning a new object each render — segue into `zustand.md` §4's `useShallow` gotcha if a student asks, but don't force it into this session.

---

## 00:40–00:55 — The `Cart` page

Create `src/pages/Cart.tsx`:

```tsx
import {Link} from "react-router";
import {useCartStore} from "../stores/cartStore";

export default function Cart() {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const clear = useCartStore((s) => s.clear);

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (items.length === 0) {
        return (
            <div>
                <p>Your cart is empty.</p>
                <Link to="/products">Browse products</Link>
            </div>
        );
    }

    return (
        <div>
            <ul className="cart-list">
                {items.map((item) => (
                    <li key={item.id} className="cart-item">
                        <img src={item.image} alt={item.title} height={60} width={60}/>
                        <span className="cart-item-title">{item.title}</span>
                        <span>{item.qty} x {item.price} kr</span>
                        <button onClick={() => removeItem(item.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <p className="cart-total">Total: {total} kr</p>
            <button onClick={clear}>Clear cart</button>
        </div>
    );
}
```

Wire it into `App.tsx`:

```tsx
import Cart from "./pages/Cart.tsx";
// ...
<Route path="/cart" element={<Cart/>}/>
```

- Build the empty-cart branch first, show it, *then* add items and build the list branch — mirrors how you'd naturally hit that state while testing.
- Poeng: `total` is derived the same way `itemCount` was in the nav — no `total` field in the store.
- `key={item.id}` — tie back to week 34's `map()`/`key` lesson; nothing new here, just the same rule applied again.

---

## 00:55–01:00 — Persist in action, wrap-up

- Add a couple of items, then **hard-refresh the page** (Cmd/Ctrl+Shift+R). Cart survives. Open DevTools → Application → Local Storage → `cart-storage` and show the JSON sitting there.
- Recap out loud: the store is the single source of truth; three unrelated components (`ProductDetail`, `Layout`, `Cart`) all read or write it with the same one-line pattern (`useCartStore((s) => s.something)`) and never talk to each other directly.

**Homework / further practice:**
1. Add quantity +/- buttons on the cart page (`i.id === item.id ? {...i, qty: i.qty + 1} : i` — same pattern as `addItem`'s existing-item branch, just without the `find`).
2. Guard `removeItem` so it goes to 0 → actually removes the row, rather than allowing `qty: 0` to linger.
3. Add a `checkout` action to the store (see `zustand.md` §7, `get()`) that clears the cart and shows a "Thanks for your order" message.
4. Stretch: use `useShallow` (`zustand.md` §4) to select `{removeItem, clear}` together in `Cart.tsx` in one hook call instead of two, and explain in words why it's needed there but not for `items` alone.

---

## Common live-coding pitfalls to pre-empt

- **Store created inside a component** — if a student pastes the `create(...)` call inside `Cart()` instead of at module scope, it'll silently "reset" every render. `zustand.md` §13.4.
- **Forgetting `Omit<CartItem, "qty">`** on `addItem`'s parameter type — without it, TypeScript will demand a `qty` at every call site, defeating the point of defaulting it to `1` inside the action.
- **`persist` without the extra `()`** — `create<CartStore>(persist(...))` (missing the curried call) throws a confusing type error. If it happens, point straight at `zustand.md` §10.
- **Editing `cart-storage` directly in DevTools while the app is open** — Zustand's `persist` doesn't react to external `localStorage` edits, only to its own `set` calls. If a student "fixes" a bad state by editing DevTools and nothing changes on screen, that's why — reload the page instead.
