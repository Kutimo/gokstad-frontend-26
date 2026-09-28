import { useState } from "react";
import type { Product } from "../data/products";
import ProductTable from "./ProductTable";
import SearchBar from "./SearchBar";

interface FilterableProductTableProps {
    products: Product[];
}

export default function FilterableProductTable({ products }: FilterableProductTableProps) {
    const [filterText, setFilterText] = useState("")
    const [inStockOnly, setInStockOnly] = useState(false)

    return (
        <div>
            <h1>Product List</h1>
            <SearchBar
                filterText={filterText}
                inStockOnly={inStockOnly}
                onFilterTextChange={setFilterText}
                onInStockOnlyChange={setInStockOnly}
            />
            <ProductTable
                products={products}
                filterText={filterText}
                inStockOnly={inStockOnly}
            />
        </div>
    )
}