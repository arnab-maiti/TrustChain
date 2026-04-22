import api from "../services/api";
import { useState } from "react";
import React from 'react'

const Verify = () => {
    const [productId, setProductId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const handleVerify = async () => {
        if (!productId.trim()) return;
  try {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await api.get(`/blockchain/verify/${productId}`);
    
    setResult(res.data.verified);
  } catch (err) {
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  return (
     <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Verify Delivery</h2>

      <input
        type="text"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Enter Product ID"
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={handleVerify}
        disabled={loading || !productId.trim()}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Checking..." : "Verify"}
      </button>

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      {/* Result */}
      {result !== null && (
        <div style={{ marginTop: "15px" }}>
          {result ? (
            <p style={{ color: "green", fontWeight: "bold" }}>
              ✔ Verified (Data is authentic)
            </p>
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ❌ Tampered (Data mismatch detected)
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default Verify