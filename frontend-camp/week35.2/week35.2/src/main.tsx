import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { products } from './data/products'
import FilterableProductTable from './components/FilterableProductTable'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FilterableProductTable products={products} />
  </StrictMode>,
)
