import {Link, Outlet} from "react-router";
import {useCartStore} from "../stores/cartStore";

export default function Layout() {
    const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

    return (
        <>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart ({itemCount})</Link>
            </nav>
            <Outlet />
        </>
    )
}