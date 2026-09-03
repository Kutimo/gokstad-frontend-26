import './App.css'
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import Layout from "./components/Layout.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/products" element={<Products/>} />
                    <Route path="/products/:id" element={<ProductDetail/>}/>
                    <Route path="/*" element={<h2>404 - Page not found!</h2>} />
                </Route>
            </Routes>
        </>
    )
}

export default App
