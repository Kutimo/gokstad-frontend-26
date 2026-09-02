import './App.css'
import {Route, Routes} from "react-router-dom";
import Home from "./Pages/Home.tsx";
import About from "./Pages/About.tsx";
import Layout from "./components/Layout.tsx";
import Products from "./components/Products.tsx";
import ProductDetail from "./components/ProductsDetail.tsx";

export default function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="*" element={<h2>404 — Page not found</h2>} />
                </Route>
            </Routes>
        </div>
    );
}