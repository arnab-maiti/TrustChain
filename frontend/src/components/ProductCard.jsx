import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

const getStatusColor = (status) => {
  if (status === "accepted") return "orange";
  if (status === "out_for_delivery" || status === "out-of-delivery") return "gold";
  if (status === "delivered") return "green";
  if (status === "created") return "blue";
  return "gray";
};

const ProductCard = ({ product, setProducts }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const acceptProduct = async (productId) => {
    try {
      setLoading(true);
      const res = await api.post(`/products/${productId}/accept`);
      setMessage("Updated successfully");
      setError("");
      setProducts((prev) => prev.map((p) =>
        p.id === productId ? res.data.data : p
      ));
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const markOutOfDelivery = async (productId) => {
    try {
      setLoading(true);
      const res = await api.post(`/products/${productId}/out-of-delivery`);
      setMessage("Updated successfully");
      setError("");
      setProducts((prev) => prev.map((p) =>
        p.id === productId ? res.data.data : p
      ));
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (productId) => {
    try {
      if (!otp.trim()) {
        setError("Please enter OTP");
        return;
      }
      setLoading(true);
      const res = await api.post(`/otp/${productId}/verify-otp`, { otp });
      setMessage("Updated successfully");
      setError("");
      setProducts((prev) => prev.map((p) =>
        p.id === productId ? res.data.data : p
      ));
      setOtp("");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <Link
        to={`/timeline/${product.id}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <h3>{product.name}</h3>
      </Link>

      <p>
        Status:{" "}
        <span
          style={{
            color: getStatusColor(product.status),
            fontWeight: "bold",
          }}
        >
          {product.status}
        </span>
      </p>

      <p style={{ fontSize: "12px", color: "gray" }}>
        ID: {product.id}
      </p>

      <div style={{ marginBottom: "10px" }}>
        <Link to={`/verify/${product.id}`} style={{ marginRight: "10px" }}>
          Verify
        </Link>
        <Link to={`/timeline/${product.id}`}>
          View Timeline
        </Link>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {product.status === "created" && (
        <button
          onClick={() => acceptProduct(product.id)}
          disabled={loading}
          style={{ marginRight: "10px" }}
        >
          {loading ? "Accepting..." : "Accept"}
        </button>
      )}
      {product.status === "accepted" && (
        <button onClick={() => markOutOfDelivery(product.id)} disabled={loading}>
          {loading ? "Updating..." : "Mark Out of Delivery"}
        </button>
      )}
      {product.status === "out_for_delivery" || product.status === "out-of-delivery" ? (
        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={() => verifyOtp(product.id)} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProductCard;
