import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

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

    useEffect(() => {

        async function fetchProduct() {
            setLoading(true);
            try {
                const response = await fetch(`https://dummyjson.com/products/${id}`);
                setProduct(response.ok ? await response.json() : null);
            } finally {
                setLoading(false);
            }
        }

        void fetchProduct();
    }, [id]);

    if (loading) return <p>Loading product...</p>;
    if (!product) return <p>Product not found </p>;

    return (
        <div>
            <h2>{product.title}</h2>
            <p>{product.price} kr</p>
            <img height={200} width={200} alt={product.title} src={product.images[0]}/>
        </div>
    );
}