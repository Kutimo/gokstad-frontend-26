import {Outlet} from "react-router";
import Footer from "../components/navigation/Footer.tsx";
import Nav from "../components/navigation/Nav.tsx";

export default function Layout() {
    return (
        <>
            <Nav/>
            <Outlet/>
            <Footer />
        </>
    );
}