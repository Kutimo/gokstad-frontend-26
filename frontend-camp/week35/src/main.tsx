import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import FilterableProductTable from "./components/FilterableProductTable.tsx";
import {products} from "./data/products.ts"
import "./index.css"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <FilterableProductTable products={products}/>
    </StrictMode>
)
