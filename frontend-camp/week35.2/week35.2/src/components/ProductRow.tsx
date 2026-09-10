import type { Product } from "../data/products";

interface ProductRowProps {
  product: Product;
}

export default function ProductRow({ product }: ProductRowProps) {
  const name = product.stocked ? product.name :
    <span>
      {product.name}
    </span>
  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  )
}
