# Week 35 — Component Tasks

Work through these in order. Each one builds on the same product list app
we walked through together. Run `npm run dev` and keep the browser open —
check your work after every task.

Solutions are in the collapsed `Solution` sections below each task — try
the task yourself first before expanding.

Component tree, for reference:

```
FilterableProductTable
        |
   -----------
   |         |
SearchBar  ProductTable
              |
        -----------
        |         |
ProductCategoryRow  ProductRow
```

## 0. Warm-up (no coding — answer in a comment or out loud)

- [ ] Which component owns `filterText` and `inStockOnly`? Why does it live
      there and not inside `SearchBar`?
- [ ] `ProductRow` never calls `useState`. How does it still show the right
      product every time you type in the search box?
- [ ] What would break if `ProductCategoryRow` and `ProductRow` both used
      `key={product.category}` in `ProductTable`?

<details>
<summary>Solution</summary>

- `FilterableProductTable` owns `filterText` and `inStockOnly` because
  **both** `SearchBar` (which changes them) and `ProductTable` (which reads
  them to filter) need access. Neither is an ancestor of the other, so the
  state has to live in their closest common parent — that's "lifting state
  up."
- `ProductRow` doesn't need its own state: when you type in `SearchBar`,
  `FilterableProductTable`'s state changes, which re-renders
  `FilterableProductTable` and everything below it, including
  `ProductTable`. `ProductTable` recomputes which rows to build and passes
  a (possibly different) `product` prop into each `ProductRow`. `ProductRow`
  just renders whatever `product` it's handed — it doesn't need to know
  *why* it changed.
- If both used `key={product.category}`, React couldn't tell rows apart
  within the same category — the category row and the *first* product row
  in that category would collide on the same key. React would likely
  misapply state/DOM between rows during re-renders (e.g. the wrong row
  keeping focus, or updating in place when it should re-mount) and log a
  "duplicate key" warning in the console.

</details>

## 1. Add a product

- [ ] Open `src/data/products.ts` and add one new product of your choice
      (pick a category that already exists, and one for a **brand new**
      category).
- [ ] Confirm both show up in the right place in the table without touching
      any component code.

<details>
<summary>Solution</summary>

No fixed answer — any valid entry in `src/data/products.ts` works, e.g.:

```ts
{ category: "Fruits", price: 15, stocked: true, name: "Banana" },
{ category: "Grains", price: 8, stocked: true, name: "Rice" },
```

Point out: nothing in any `.tsx` file changed, and the new category still
gets its own heading automatically — that's the payoff of driving the UI
from data instead of hardcoding rows.

</details>

## 2. New prop, no new component

- [ ] `ProductRow` currently shows the price as a plain number (e.g. `32`).
      Change it to show `$32.00` — format the price *inside* `ProductRow`,
      don't change the data.

<details>
<summary>Solution</summary>

`src/components/ProductRow.tsx`:

```tsx
<td className="price">${product.price.toFixed(2)}</td>
```

</details>

## 3. Empty state

- [ ] Search for something that matches nothing (e.g. "zzz"). Right now the
      table just shows an empty body under the headers — not great UX.
- [ ] In `ProductTable`, if `rows` ends up empty, render a single row that
      says `No products found.` instead of the empty table body.
- [ ] Hint: check `rows.length` right before the `return`.

<details>
<summary>Solution</summary>

`src/components/ProductTable.tsx`, right before the final `return`:

```tsx
if (rows.length === 0) {
    rows.push(
        <tr key="empty">
            <td colSpan={2}>No products found.</td>
        </tr>
    );
}
```

</details>

## 4. A new small component

- [ ] Create a new component `ResultsCount` that takes `count: number` as a
      prop and renders something like `6 items`.
- [ ] Render it inside `FilterableProductTable`, between the `SearchBar`
      and the `hr.divider`, showing how many products are currently visible
      after filtering.
- [ ] This is the tricky part: `FilterableProductTable` doesn't currently
      calculate the filtered count — `ProductTable` does that filtering
      internally. You'll need to decide: move the filtering logic up, or
      duplicate it. Be ready to explain which you picked and why.

<details>
<summary>Solution</summary>

**`src/components/ResultsCount.tsx`** (new file):

```tsx
interface ResultsCountProps {
    count: number;
}

export default function ResultsCount({ count }: ResultsCountProps) {
    return <p className="results-count">{count} items</p>;
}
```

The honest answer to "where does the filtering logic live" is: **move it
up**. Right now `ProductTable` is the only place that knows how to filter,
which is exactly the problem the task is designed to expose. The clean fix
is to lift the filtering itself (not just the raw `products` array) into
`FilterableProductTable`, and pass the already-filtered list down:

`src/components/FilterableProductTable.tsx`:

```tsx
import ResultsCount from "./ResultsCount.tsx";

// ...inside the component, before the return:
const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
        .toLowerCase()
        .includes(filterText.toLowerCase());
    const matchesStock = !inStockOnly || product.stocked;
    return matchesSearch && matchesStock;
});

return (
    <div className="receipt">
        <h1 className="title">Product List</h1>
        <SearchBar
            filterText={filterText}
            inStockOnly={inStockOnly}
            onFilterTextChange={setFilterText}
            onInStockOnlyChange={setInStockOnly}/>
        <ResultsCount count={filteredProducts.length} />
        <hr className="divider"/>
        <ProductTable
            products={filteredProducts}
            filterText={filterText}
            inStockOnly={inStockOnly} />
    </div>
);
```

`src/components/ProductTable.tsx` then no longer needs to filter — it just
groups by category:

```tsx
interface ProductTableProps {
    products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
    const rows: ReactElement[] = [];
    let lastCategory: string | null = null;

    products.forEach((product) => {
        if (product.category !== lastCategory) {
            rows.push(
                <ProductCategoryRow category={product.category} key={product.category}/>
            );
        }
        rows.push(<ProductRow product={product} key={product.name}/>);
        lastCategory = product.category;
    });
    // ...rest unchanged (including the empty-state check from Task 3)
}
```

This is a good moment to say out loud: **the "quick" answer (duplicate the
filter logic inside a new helper in `ProductTable` just to get a count) is
tempting but creates two sources of truth that can drift apart** — e.g. if
someone later tweaks the search logic in one place and forgets the other.
Lifting it up is more editing, but there's only one filter to maintain.

</details>

## 5. Stretch goals (pick any, if you have time)

- [ ] Add a category filter: a `<select>` in `SearchBar` that lets you
      filter to one category, "All" by default. You'll need a third piece
      of state.
- [ ] Add a "low stock" style: if a product's price is under 5, give its row
      an extra `className` (e.g. `"cheap"`) and style it in `index.css`.
- [ ] Sort the table so out-of-stock items always appear at the bottom of
      their category.
- [ ] Make the checkbox label pluralize correctly: "1 item" vs "2 items" in
      your `ResultsCount` from Task 4.

<details>
<summary>Solution</summary>

**Category filter** — new state in `FilterableProductTable`:

```tsx
const [category, setCategory] = useState('All');
const categories = ['All', ...new Set(products.map((p) => p.category))];

const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(filterText.toLowerCase());
    const matchesStock = !inStockOnly || product.stocked;
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesStock && matchesCategory;
});
```

`SearchBar` gets a new prop pair (`category`, `onCategoryChange`) and:

```tsx
<select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
</select>
```

(`categories` would need to be passed down as a prop too, or computed from
a `products` prop already on `SearchBar`.)

**Cheap item styling** — in `ProductRow.tsx`:

```tsx
<tr className={`product-row ${product.price < 5 ? 'cheap' : ''}`}>
```

`index.css`:

```css
.cheap td {
    color: var(--ink-70);
    font-style: italic;
}
```

**Out-of-stock sorting** — sort within each category before building rows,
e.g. sort `products` once up front by `(category, stocked desc, name)`, or
split each category's items into stocked/unstocked and push stocked rows
first, unstocked rows after.

**Pluralization** — in `ResultsCount.tsx`:

```tsx
export default function ResultsCount({ count }: ResultsCountProps) {
    return <p className="results-count">{count} {count === 1 ? 'item' : 'items'}</p>;
}
```

</details>

## Stuck?

Re-read the comments already in the component files — every concept you
need (props, state, controlled inputs, lists + `key`, conditional
rendering) shows up somewhere in the existing code. Find the matching
example before asking for help.
