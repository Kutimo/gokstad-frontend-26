import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import styles from "./ProductDetail.module.css"
import {useCartStore} from "../../stores/cartStore";

type Product = {
    id: number;
    title: string;
    price: number;
    images: string[];
}

export default function ProductDetail() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const addItem = useCartStore((s) => s.addItem)

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(`https://dummyjson.com/products/${id}`);
                setProduct(response.ok ? await response.json() : null);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        void fetchProduct();
    }, [id]);

    return (
        <div>
            <button onClick={() => navigate(-1)}>Back</button>
            {loading && <p>Loading...</p>}
            {!loading && error && <p>Something went wrong.</p>}
            {!loading && product && (
                <div className={styles.productCard}>
                    <h2>{product.title}</h2>
                    <img src={product.images[0]} alt={product.title} height={250} width={250}/>
                    <p>{product.price}</p>
                    <button onClick={() => addItem({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.images[0],
                    })}>
                        Add to cart
                    </button>
                </div>
            )}
        </div>
    )
}
