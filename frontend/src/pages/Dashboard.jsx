import React from 'react'
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { useEffect,useState } from "react";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchProducts = async () => {
            try{
                const res = await api.get("/products");
                setProducts(res.data.data);
                console.log(products);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
        <h2>DashBoard</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && products.length === 0 && <p>No products found.</p>}
        
        {products.map((p) => (
  <ProductCard key={p.id} product={p} />
))}
    </div>
  )
}

export default Dashboard
