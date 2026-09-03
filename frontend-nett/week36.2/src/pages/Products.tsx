import {Link} from "react-router-dom";

const products = [
    {id: 1, name: "Shirt"},
    {id: 2, name: "Pants"},
    {id: 3, name: "Hats"},
]

export default function Products() {
    return (
        <ul>
            {products.map((p) => (
                <li key={p.id}>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                </li>
            ))}
        </ul>
    )
}