import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import styles from "./Product.module.css"

type Product = {
    id: number;
    title: string;
    price: number;
    images: string[];
};

export default function ProductDetail() {
    const {id} = useParams<{ id: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false)

    useEffect(() => {

        async function fetchProduct() {
            setLoading(true);
            setError(false)
            try {
                const response = await fetch(`https://dummyjson.com/products/${id}`);
                setProduct(response.ok ? await response.json() : null);
            } catch {
                setError(true)
            }
            finally {
                setLoading(false);
            }
        }

        void fetchProduct();
    }, [id]);
    console.log(product)

    if (loading) return <p>Loading product...</p>;
    if (!product) return <p>Product not found </p>;
    if (error) return <p>Something went wrong</p>

    return (
        <div className={styles.productCard}>
            <h2>{product.title}</h2>
            <img height={200} width={200} alt={product.title} src={product.images[0]}/>
            <p>{product.price} kr</p>
        </div>
    );
}