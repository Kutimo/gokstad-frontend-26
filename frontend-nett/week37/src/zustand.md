# Zustand — An Introduction

A small, unopinionated state management library for React. The name is German for "state".

---

## 1. Why bother?

`useState` is fine until two components that aren't parent and child need the same value. The usual fixes:

- **Lift state up** — move it to a common ancestor. Works, but the state drifts further from where it's used, and you end up threading props through components that don't care about them (prop drilling).
- **Context** — solves drilling, but every consumer re-renders when *any* part of the context value changes. It's a dependency injection tool, not a state manager.
- **Redux** — powerful, but a lot of ceremony for a shopping cart.

Zustand sits in the gap. One hook, no provider, no reducers, and components only re-render when the specific slice they read actually changes.

```bash
npm install zustand
```

---

## 2. Your first store

A store is created once, outside any component, and lives at module scope.

```ts
// src/stores/counterStore.ts
import { create } from "zustand";

type CounterStore = {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
}));
```

Things to notice:

- `create` takes a function that receives `set` and returns the initial state object.
- **State and the functions that change it live together.** There's no separation between "the data" and "the reducers" — actions are just properties of the store.
- `set` merges at the top level, like the old `this.setState`. `set({ count: 0 })` leaves every other key untouched.
- Use the callback form `set((state) => ...)` when the new value depends on the old one.

---

## 3. Using it in a component

```tsx
import { useCounterStore } from "../stores/counterStore";

export default function Counter() {
    const count = useCounterStore((s) => s.count);
    const increment = useCounterStore((s) => s.increment);

    return <button onClick={increment}>Count: {count}</button>;
}
```

No `<Provider>` wrapper. No import of a context. Any component anywhere in the tree can call this hook and it's reading the same store.

---

## 4. Selectors — the most important concept

The function you pass to the hook is a **selector**. It picks the part of the store you care about, and Zustand only re-renders your component when *that* part changes.

```tsx
const count = useCounterStore((s) => s.count);        // re-renders when count changes
const user  = useUserStore((s) => s.user);            // unaffected by count
```

If you call the hook with no selector, you get the whole store — and re-render on **every** change to it:

```tsx
const store = useCounterStore();   // works, but subscribes to everything
```

Fine in a tiny app, wasteful in a real one.

### The gotcha: selecting multiple values

This looks reasonable and is a bug:

```tsx
// ❌ new object every render → re-renders on every store update
const { count, reset } = useCounterStore((s) => ({
    count: s.count,
    reset: s.reset,
}));
```

Zustand compares the previous selector result to the new one with `Object.is`. A fresh object literal is never `Object.is`-equal to the last one, so it re-renders every time anything in the store changes. In React 19 / Zustand v5 this can even warn about an infinite loop.

Two fixes. Either call the hook once per value:

```tsx
// ✅ simplest
const count = useCounterStore((s) => s.count);
const reset = useCounterStore((s) => s.reset);
```

Or use `useShallow`, which compares the returned object one level deep:

```tsx
// ✅ one call, shallow comparison
import { useShallow } from "zustand/react/shallow";

const { count, reset } = useCounterStore(
    useShallow((s) => ({ count: s.count, reset: s.reset }))
);
```

Returning a *primitive* is always safe — `s.count` is a number, and numbers compare by value.

---

## 5. Actions with arguments

Nothing special, they're just functions:

```ts
type CartItem = { id: number; title: string; price: number; qty: number };

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
                          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                      ),
                  }
                : { items: [...state.items, { ...item, qty: 1 }] };
        }),

    removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

    clear: () => set({ items: [] }),
}));
```

State updates must be **immutable** — build a new array or object rather than mutating the existing one. `map`, `filter` and spread are your tools here. (The `immer` middleware lets you write `state.items.push(...)` if you'd rather, but learn it this way first.)

### Derived values

Don't store what you can compute. Derive it in the selector:

```tsx
const total = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.qty, 0)
);

const itemCount = useCartStore((s) => s.items.length);
```

A component reading `itemCount` re-renders when items are added or removed, but not when a price changes.

---

## 6. Async actions

This is where Zustand feels nice compared to Redux — an async action is just an `async` function that calls `set` when it's done.

```ts
type Product = { id: number; title: string; price: number; images: string[] };

type ProductStore = {
    product: Product | null;
    loading: boolean;
    error: boolean;
    fetchProduct: (id: string) => Promise<void>;
};

export const useProductStore = create<ProductStore>((set) => ({
    product: null,
    loading: false,
    error: false,

    fetchProduct: async (id) => {
        set({ loading: true, error: false });
        try {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (!res.ok) throw new Error(String(res.status));
            set({ product: await res.json(), loading: false });
        } catch {
            set({ error: true, loading: false, product: null });
        }
    },
}));
```

In the component:

```tsx
export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const product = useProductStore((s) => s.product);
    const loading = useProductStore((s) => s.loading);
    const fetchProduct = useProductStore((s) => s.fetchProduct);

    useEffect(() => {
        if (id) void fetchProduct(id);
    }, [id, fetchProduct]);

    if (loading) return <p>Loading…</p>;
    if (!product) return <p>Not found.</p>;

    return <h2>{product.title}</h2>;
}
```

`fetchProduct` is a stable reference — it's created once when the store is defined and never re-created — so it's safe in a dependency array without `useCallback`.

Note that a store is a *singleton*. Navigating from product 1 to product 2 still races if both requests are in flight, and the store holds product 1's data while product 2 loads. For server data specifically, a caching library (TanStack Query, SWR) handles this better. Zustand's sweet spot is **client state**: cart contents, UI mode, filters, the logged-in user.

---

## 7. `get` — reading state inside an action

`create` passes a second argument, `get`, for when an action needs the current state without setting it:

```ts
export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => { /* ... */ },

    checkout: async () => {
        const items = get().items;          // current state, right now
        if (items.length === 0) return;
        await fetch("/api/checkout", {
            method: "POST",
            body: JSON.stringify(items),
        });
        set({ items: [] });
    },
}));
```

---

## 8. Using the store outside React

The hook has static methods on it, usable from anywhere — event handlers, utility modules, tests:

```ts
useCartStore.getState().items;          // read once, no subscription
useCartStore.getState().clear();        // call an action
useCartStore.setState({ items: [] });   // set directly

const unsub = useCartStore.subscribe((state) => console.log(state.items));
unsub();
```

`getState()` does **not** subscribe. Calling it inside a component body gives you a value that never updates — always use the hook with a selector for rendering.

---

## 9. Middleware

Middleware wraps your store creator to add behaviour.

### `persist` — survive a page reload

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item) => { /* ... */ },
            clear: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",              // localStorage key
            partialize: (state) => ({ items: state.items }),  // don't persist functions
        }
    )
);
```

### `devtools` — Redux DevTools integration

```ts
import { devtools } from "zustand/middleware";

export const useCounterStore = create<CounterStore>()(
    devtools((set) => ({ /* ... */ }), { name: "CounterStore" })
);
```

They compose: `create<T>()(devtools(persist(fn, options)))`.

---

## 10. TypeScript notes

The one piece of syntax that trips people up is the extra `()`:

```ts
create<MyStore>((set) => ({ ... }))      // plain store
create<MyStore>()(persist((set) => ({ ... }), { name: "x" }))   // with middleware
```

That curried form exists because TypeScript can't infer the generic through the middleware wrapper. If you see a confusing type error after adding middleware, this is almost always why.

Define the type with state and actions in one object type — that's the shape `create` expects.

---

## 11. Splitting a large store

For anything sizeable, split into slices and combine them:

```ts
type UserSlice = { user: User | null; login: (u: User) => void };
type CartSlice = { items: CartItem[]; addItem: (i: CartItem) => void };
type Store = UserSlice & CartSlice;

const createUserSlice: StateCreator<Store, [], [], UserSlice> = (set) => ({
    user: null,
    login: (user) => set({ user }),
});

const createCartSlice: StateCreator<Store, [], [], CartSlice> = (set) => ({
    items: [],
    addItem: (item) => set((s) => ({ items: [...s.items, item] })),
});

export const useStore = create<Store>()((...a) => ({
    ...createUserSlice(...a),
    ...createCartSlice(...a),
}));
```

Or just make several independent stores — `useCartStore`, `useUserStore`, `useUIStore`. That's usually simpler, and Zustand is designed to allow it. Unlike Redux, there's no rule about a single source of truth.

---

## 12. How it compares

| | Context | Redux Toolkit | Zustand |
|---|---|---|---|
| Provider needed | Yes | Yes | No |
| Boilerplate | Low | Medium | Very low |
| Selective re-renders | No | Yes | Yes |
| Async | Roll your own | Thunks | Plain `async` functions |
| DevTools | No | Yes | Via middleware |
| Bundle size | 0 (built in) | ~12 kB | ~1 kB |

Redux Toolkit is still a solid choice for large teams that want strict conventions and a well-mapped ecosystem. Zustand wins when you want state shared across the tree without adopting an architecture.

---

## 13. Common mistakes

1. **Returning a new object from a selector without `useShallow`** — see section 4. This is the number one issue people hit.
2. **Mutating state**: `set((s) => { s.items.push(x); return s; })` won't re-render. Return a new array.
3. **Using `getState()` in a component body** — no subscription, so no re-render.
4. **Creating the store inside a component** — it must be at module scope, or it's re-created every render.
5. **Putting server data in the store and then fighting stale caches** — reach for TanStack Query instead.
6. **No selector at all** — `useStore()` subscribes to the entire store.

---

## 14. Try it yourself

1. Rewrite a `useState` counter as a Zustand store, then read the count from two sibling components at once.
2. Build the cart store from section 5. Add a header component showing the item count and confirm it doesn't re-render when unrelated state changes (`console.log` in the body will show you).
3. Add `persist` to it and reload the page.
4. Move a fetch into a store action and share the result between a list page and a detail page.
5. Open Redux DevTools with the `devtools` middleware and watch actions land.

---

## Reference

- Docs: <https://zustand.docs.pmnd.rs>
- Repo: <https://github.com/pmndrs/zustand>