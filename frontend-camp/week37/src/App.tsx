import './App.css'
import Layout from "./pages/Layout.tsx";
import {Route, Routes} from "react-router";
import About from "./pages/About.tsx";
import Home from "./pages/Home.tsx";
import Store from "./pages/Store.tsx";
import Login from "./pages/Login.tsx";

export default function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/store" element={<Store/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/*" element={<h1>404 not found</h1>} />
                </Route>
            </Routes>
        </>
    )
}


