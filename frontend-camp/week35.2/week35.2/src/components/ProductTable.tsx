
import type { ReactElement } from "react";
import type { Product } from "../data/products";
import ProductRow from "./ProductRow";
import ProductCategoryRow from "./ProductCategoryRow";
import styles from "./ProductTable.module.css"

interface ProductTableProps {
  products: Product[];
  filterText: string;
  inStockOnly: boolean;
}

export default function ProductTable({ products, filterText, inStockOnly }: ProductTableProps) {
  const rows: ReactElement[] = [];
  let lastCategory: string | null = null;

  products.forEach((product) => {

    if (!product.name.toLowerCase().includes(filterText.toLowerCase())) {
      return
    }

    // checkbox logikken: 
    if (inStockOnly && !product.stocked) {
      return
    }

    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category}
        />
      )
    }
    rows.push(
      <ProductRow
        product={product}
        key={product.name}
      />

    )
    lastCategory = product.category
  })

  return (
    <table className={styles.productTable}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}