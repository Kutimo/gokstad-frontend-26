import {Link, Outlet} from "react-router-dom";

export default function Layout() {
    return (
        <>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/products">Products</Link>
            </nav>
            <Outlet />
        </>
    )
}