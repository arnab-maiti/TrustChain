import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

const getStatusColor = (status) => {
  if (status === "accepted") return "orange";
  if (status === "out-of-delivery") return "gold";
  if (status === "delivered") return "green";
  if (status === "created") return "blue";
  return "gray";
};

const ProductCard = ({ product }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const acceptProduct = async (productId) => {
    try {
      setLoading(true);
      await api.post(`/products/${productId}/accept`);
      alert("Product accepted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error accepting product:", error);
      alert(error.response?.data?.message || "Failed to accept product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markOutOfDelivery = async (productId) => {
    try {
      setLoading(true);
      await api.post(`/products/${productId}/out-of-delivery`);
      alert("Product marked as out of delivery!");
      window.location.reload();
    } catch (error) {
      console.error("Error marking out of delivery:", error);
      alert(error.response?.data?.message || "Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (productId) => {
    try {
      if (!otp.trim()) {
        alert("Please enter OTP");
        return;
      }
      setLoading(true);
      await api.post(`/otp/${productId}/verify-otp`, { otp });
      alert("OTP verified successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <div style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <Link
      to={`/timeline/${product.id}`}
      style={{ color: "inherit", textDecoration: "none" }}
    >
        <h3>{product.name}</h3>
</Link>
        <p>
          Status:{" "}
          <span style={{ color: getStatusColor(product.status), fontWeight: "bold" }}>
            {product.status}
          </span>
        </p>

        <p style={{ fontSize: "12px", color: "gray" }}>
          ID: {product.id}
        </p>
        {product.status === "created" && (
          <button onClick={() => acceptProduct(product.id)} disabled={loading} style={{ marginRight: "10px" }}>
            {loading ? "Accepting..." : "Accept"}
          </button>
        )}
        {product.status === "accepted" && (
          <button onClick={() => markOutOfDelivery(product.id)} disabled={loading}>
            {loading ? "Updating..." : "Mark Out of Delivery"}
          </button>
        )}
        {product.status === "out-of-delivery" && (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={() => verifyOtp(product.id)} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
  );
};

export default ProductCard;
