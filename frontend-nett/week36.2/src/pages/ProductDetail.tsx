import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";


type Product = {
    id: number;
    title: string;
    price: number;
}

export default function ProductDetail() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [product, setProduct] = useState<Product | null>(null)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`https://dummyjson.com/products/${id}`)
                setProduct(response.ok ? await response.json() : null)
            }
            catch {
                console.log("something went wrong")
            }
        }
        void fetchProduct()
    }, [id])

    console.log(product)

    return (
        <div>
            <h2>{product?.title}</h2>
            <p> {product?.price}</p>
            <button onClick={() => navigate(-1)} > Back </button>
        </div>
    )
}