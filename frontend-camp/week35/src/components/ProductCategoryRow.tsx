import type { Product } from "../data/products.ts";

interface ProductCategoryRowProps {
    category: Product["category"];
}

// A small, "dumb" presentational component: one prop in (category),
// one row of markup out. No state, no logic - good example of the
// simplest possible component.
export default function ProductCategoryRow({ category }: ProductCategoryRowProps) {
    return (
        <tr className="category-row">
           <th colSpan={2}>
               {category}
           </th>
        </tr>
    );
}
