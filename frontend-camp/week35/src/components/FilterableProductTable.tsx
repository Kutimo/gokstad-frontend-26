import SearchBar from "./SearchBar.tsx";
import ProductTable from "./ProductTable.tsx";
import type {Product} from "../data/products.ts";
import {useState} from "react";

interface FilterableProductTableProps {
    products: Product[];
}

// This is the "parent" component. It's the top of our little component tree:
//
//        FilterableProductTable
//              /        \
//        SearchBar    ProductTable
//                       /        \
//              ProductCategoryRow  ProductRow
//
// It owns the two pieces of state (the search text and the checkbox) and
// passes them DOWN to its children as props. This is called "lifting state
// up": both SearchBar and ProductTable need this data, so it lives here,
// in their shared parent, instead of inside either of them.
export default function FilterableProductTable({products}: FilterableProductTableProps) {
    // useState gives us a value (filterText) and a setter function (setFilterText).
    // Calling the setter tells React "re-render this component with the new value".
    const [filterText, setFilterText] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);

    return (
        <div className="receipt">
            <h1 className="title">Product List</h1>

            {/* Passing state DOWN as props, and passing the setter functions
                down too (renamed as onFilterTextChange / onInStockOnlyChange).
                SearchBar doesn't know or care that this is useState under the
                hood - it just knows "call this function when the user types". */}
            <SearchBar
                filterText={filterText}
                inStockOnly={inStockOnly}
                onFilterTextChange={setFilterText}
                onInStockOnlyChange={setInStockOnly}/>
            <hr className="divider"/>
            <ProductTable
                products={products}
                filterText={filterText}
                inStockOnly={inStockOnly} />
        </div>
    );
}
