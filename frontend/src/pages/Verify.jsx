import api from "../services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import React from 'react'

const Verify = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState(id || "");
  const [result, setResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifyAuto = async (pId) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setProduct(null);

      // Fetch product details
      const productRes = await api.get(`/products/${pId}`);
      setProduct(productRes.data.data);

      // Verify on blockchain
      const verifyRes = await api.get(`/blockchain/verify/${pId}`);
      setResult(verifyRes.data.verified);
    } catch (err) {
      setError(err.response?.data?.message || "Product not found or verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!productId.trim()) return;
    await handleVerifyAuto(productId);
  };

  useEffect(() => {
    if (id) {
      handleVerifyAuto(id); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [id]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h1 style={{ margin: "0 0 10px 0", textAlign: "center" }}>🔐 Verify Product Authenticity</h1>
          <p style={{ margin: "0 0 20px 0", textAlign: "center", color: "#666", fontSize: "14px" }}>
            Enter a product ID to verify its blockchain authenticity
          </p>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID"
              disabled={!!id}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading && productId.trim()) {
                  handleVerify();
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                boxSizing: "border-box",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />

            <button
              onClick={handleVerify}
              disabled={loading || !productId.trim()}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: loading || !productId.trim() ? "#ccc" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !productId.trim() ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {loading ? "🔍 Verifying..." : "✓ Verify"}
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "4px",
              marginTop: "15px",
              border: "1px solid #f5c6cb",
            }}>
              ⚠️ {error}
            </div>
          )}

          {product && (
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              marginTop: "15px",
              border: "1px solid #ddd",
            }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>📦 Product Details</h3>
              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <p style={{ margin: "5px 0" }}>
                  <strong>Name:</strong> {product.name}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Status:</strong> {product.status?.toUpperCase().replace('-', ' ')}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Product ID:</strong> {product.id}
                </p>
                {product.description && (
                  <p style={{ margin: "5px 0" }}>
                    <strong>Description:</strong> {product.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {result !== null && (
            <div style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "bold",
            }}>
              {result ? (
                <div style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  border: "1px solid #c3e6cb",
                  padding: "20px",
                  borderRadius: "8px",
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                  <p style={{ margin: "10px 0" }}>VERIFIED</p>
                  <p style={{ margin: "10px 0", fontSize: "14px" }}>
                    This product is authentic and certified on blockchain
                  </p>
                  {product?.delivered_at && (
                    <p style={{ margin: "10px 0", fontSize: "12px", color: "#666" }}>
                      Delivered: {new Date(product.delivered_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  border: "1px solid #f5c6cb",
                  padding: "20px",
                  borderRadius: "8px",
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>❌</div>
                  <p style={{ margin: "10px 0" }}>FAILED VERIFICATION</p>
                  <p style={{ margin: "10px 0", fontSize: "14px" }}>
                    This product failed blockchain verification. Data may be tampered or invalid.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: "#e7f3ff",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #b3d9ff",
          fontSize: "13px",
          color: "#004085",
        }}>
          <p style={{ margin: "5px 0" }}>
            <strong>ℹ️ How it works:</strong> This verification system checks the blockchain record of the product to ensure its authenticity and track its entire supply chain journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
