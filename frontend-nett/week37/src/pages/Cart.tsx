import {Link} from "react-router";
import {useCartStore} from "../stores/cartStore";

export default function Cart() {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const clear = useCartStore((s) => s.clear);

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (items.length === 0) {
        return (
            <div>
                <p>Your cart is empty.</p>
                <Link to="/products">Browse products</Link>
            </div>
        );
    }

    return (
        <div>
            <ul className="cart-list">
                {items.map((item) => (
                    <li key={item.id} className="cart-item">
                        <img src={item.image} alt={item.title} height={60} width={60}/>
                        <span className="cart-item-title">{item.title}</span>
                        <span>{item.qty} x {item.price} kr</span>
                        <button onClick={() => removeItem(item.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <p className="cart-total">Total: {total} kr</p>
            <button onClick={clear}>Clear cart</button>
        </div>
    );
}
