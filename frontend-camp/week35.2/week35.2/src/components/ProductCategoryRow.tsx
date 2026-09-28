import type { Product } from "../data/products"

interface ProductCategoryRowProps {
  category: Product["category"]
}


export default function ProductCategoryRow({ category }: ProductCategoryRowProps) {
  return (
    <tr>
      <th colSpan={2}>
        {category}
      </th>
    </tr>
  )
}