import SearchBar from "./SearchBar.tsx";
import ProductTable from "./ProductTable.tsx";
import type {Product} from "../data/products.ts";
import {useState} from "react";

interface FilterableProductTableProps {
    products: Product[];
}

export default function FilterableProductTable({products}: FilterableProductTableProps) {
    const [filterText, setFilterText] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    return (
        <div>
            <SearchBar
                filterText={filterText}
                inStockOnly={inStockOnly}
                onFilterTextChange={setFilterText}
                onInStockOnlyChange={setInStockOnly}/>
            <ProductTable
                products={products}
                filterText={filterText}
                inStockOnly={inStockOnly} />
        </div>
    );
}