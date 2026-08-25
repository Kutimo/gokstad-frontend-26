import ProductCategoryRow from "./ProductCategoryRow.tsx";
import ProductRow from "./ProductRow.tsx";
import type {Product} from "../data/products.ts";
import type { ReactElement } from "react"

interface ProductTableProps {
    products: Product[];
    filterText: string;
    inStockOnly: boolean;
}

// ProductTable takes the full product list plus the current filter values,
// and turns them into <tr> rows - inserting a category heading row
// whenever the category changes. This is the most "logic-heavy" component
// in the app; everything else here is mostly just JSX.
export default function ProductTable({
                                         products,
                                         filterText,
                                         inStockOnly
                                     }: ProductTableProps) {
    // We build up a plain array of JSX elements first, then render it below.
    // This is a common pattern: loop in plain JS/TS, render the result.
    const rows: ReactElement[] = [];
    let lastCategory: string | null = null;

    products.forEach((product) => {
        // Skip products that don't match the search text...
        if (
            product.name.toLowerCase().indexOf(
                filterText.toLowerCase()
            ) === -1
        ) {
            return;
        }
        // ...or that are out of stock when "in stock only" is checked.
        if (inStockOnly && !product.stocked) {
            return;
        }
        // Whenever the category changes from the last row we added, insert a
        // heading row for the new category first.
        if (product.category !== lastCategory) {
            rows.push(
                // `key` is required whenever you render a list of elements -
                // it helps React tell rows apart between re-renders. It's
                // not a regular prop and doesn't get passed into the
                // component itself.
                <ProductCategoryRow
                    category={product.category}
                    key={product.category}/>
            );
        }
        rows.push(
            <ProductRow
                product={product}
                key={product.name}/>
        );
        lastCategory = product.category;
    });
    return (
        <table className="product-table">
            <thead>
            <tr>
                <th className="col-head">Item</th>
                <th className="col-head col-head-price">Price</th>
            </tr>
            </thead>
            {/* `rows` is just an array of JSX - React renders arrays of
                elements automatically, one after another. */}
            <tbody>{rows}</tbody>
        </table>
    );
}
