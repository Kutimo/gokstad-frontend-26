import {Link, Outlet} from "react-router-dom";

export default function Layout() {
    return (
        <>
            <nav>
                <Link to="/">Hjem</Link>
                <Link to="/about">om oss</Link>
                <Link to="/products">Produkter</Link>
            </nav>
            <Outlet/>
        </>
    );
}