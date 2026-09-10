import {Link} from "react-router-dom";

const products = [
    {id: 1, name: "pants"},
    {id: 2, name: "shirts"},
    {id: 3, name: "hats"}
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
    );
}