import ProductCategoryRow from "./ProductCategoryRow.tsx";
import ProductRow from "./ProductRow.tsx";
import type {Product} from "../data/products.ts";
import * as React from "react";

interface ProductTableProps {
    products: Product[];
    filterText: string;
    inStockOnly: boolean;
}

export default function ProductTable({
                                         products,
                                         filterText,
                                         inStockOnly
                                     }: ProductTableProps) {
    const rows: React.ReactElement[] = [];
    let lastCategory: string | null = null;

    products.forEach((product) => {
        if (
            product.name.toLowerCase().indexOf(
                filterText.toLowerCase()
            ) === -1
        ) {
            return;
        }
        if (inStockOnly && !product.stocked) {
            return;
        }
        if (product.category !== lastCategory) {
            rows.push(
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
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
            </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}