import type { Product } from "../data/products.ts";

interface ProductRowProps {
    product: Product;
}

export default function ProductRow({ product } : ProductRowProps) {
    // Conditional rendering with a ternary: if the product is in stock we
    // just show the plain name, otherwise we wrap it in a styled <span>.
    // `name` ends up holding a string in one branch and a JSX element in
    // the other - both are valid things to put inside {}.
    const name = product.stocked ? product.name :
        <span className="name-out">
      {product.name}
    </span>;

    return (
        <tr className="product-row">
            <td>{name}</td>
            <td className="price">{product.price}</td>
        </tr>
    );
}
