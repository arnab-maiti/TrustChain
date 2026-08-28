import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserContext } from "../context/UserContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [otpMap, setOtpMap] = useState({});
  const [otpGeneratedFor, setOtpGeneratedFor] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user can perform action based on role and product status
  const canAccept = (product) => {
    return user?.role === 'distributor' && product.status === 'created';
  };

  const canMarkOutForDelivery = (product) => {
    return user?.role === 'distributor' && product.status === 'accepted';
  };

  const canGenerateOtp = (product) => {
    return user?.role === 'distributor' && product.status === 'out-of-delivery';
  };

  const canVerifyOtp = (product) => {
    return user?.role === 'retailer' && product.status === 'out-of-delivery';
  };

  // 🔹 Fetch products
  const fetchProducts = async () => {
    try {
      setError("");
      const res = await api.get("/products");
      setProducts(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    load();
  }, []);

  // 🔹 Accept
  const accept = async (id) => {
    try {
      setError("");
      setLoadingId(id);
      const res = await api.post(`/products/${id}/accept`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data.data : p))
      );
      setSuccess("✓ Product accepted!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to accept product");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔹 Out for delivery
  const outForDelivery = async (id) => {
    try {
      setError("");
      setLoadingId(id);
      const res = await api.post(`/products/${id}/out-of-delivery`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data.data : p))
      );
      // Reset OTP state for new out-of-delivery
      setOtpMap({ ...otpMap, [id]: "" });
      setOtpGeneratedFor({ ...otpGeneratedFor, [id]: false });
      setSuccess("✓ Marked as out for delivery!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔹 Generate OTP
  const generateOtp = async (id) => {
    try {
      setError("");
      setLoadingId(id);
      await api.post(`/otp/${id}/generate-otp`);
      setOtpGeneratedFor({ ...otpGeneratedFor, [id]: true });
      setSuccess("✓ OTP generated! Sent to retailer.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate OTP");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔹 Verify OTP (marks as delivered)
  const verifyOtp = async (id) => {
    try {
      setError("");
      if (!otpMap[id]) {
        setError("Please enter OTP first");
        return;
      }
      setLoadingId(id);
      const res = await api.post(`/otp/${id}/verify-otp`, { otp: otpMap[id] });
      
      
      // Update product with response data
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.data.data : p))
      );
      
      // Clear OTP state after successful verification
      setOtpMap({ ...otpMap, [id]: "" });
      setOtpGeneratedFor({ ...otpGeneratedFor, [id]: false });
      setSuccess("✓ Delivery confirmed! Product marked as delivered.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "created":
        return "#6c757d";
      case "accepted":
        return "#28a745";
      case "out-of-delivery":
        return "#ffc107";
      case "delivered":
        return "#007bff";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: "30px", backgroundColor: "white", padding: "15px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h1 style={{ margin: 0 }}>📦 Dashboard</h1>
          {user && (
            <span style={{
              backgroundColor: user.role === 'distributor' ? '#ffc107' : user.role === 'retailer' ? '#28a745' : '#6c757d',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
              {user.role}
            </span>
          )}
        </div>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Manage and track products through the supply chain
        </p>
      </div>

      {error && <div style={{ color: "#721c24", marginBottom: "15px", padding: "12px", backgroundColor: "#f8d7da", borderRadius: "4px", border: "1px solid #f5c6cb" }}>{error}</div>}
      {success && <div style={{ color: "#155724", marginBottom: "15px", padding: "12px", backgroundColor: "#d4edda", borderRadius: "4px", border: "1px solid #c3e6cb" }}>{success}</div>}

      {products.length === 0 ? (
        <p style={{ fontSize: "16px", color: "#999" }}>No products available</p>
      ) : (
        products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              marginBottom: "15px",
              padding: "15px",
              borderRadius: "6px",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            {/* Product Header */}
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <button
                  onClick={() => navigate(`/timeline/${p.id}`)}
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  📋 View Timeline
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div>
                  <span style={{ color: "#666", fontSize: "12px" }}>Status: </span>
                  <span style={{ 
                    color: "white", 
                    backgroundColor: getStatusColor(p.status),
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}>
                    {p.status.toUpperCase().replace('-', ' ')}
                  </span>
                </div>
                <span style={{ color: "#999", fontSize: "12px" }}>ID: {p.id}</span>
              </div>
            </div>

            {/* Action Buttons - Show based on role and status */}
            {p.status === "created" && canAccept(p) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                <button
                  onClick={() => accept(p.id)}
                  disabled={loadingId === p.id}
                  style={{
                    padding: "8px 12px",
                    cursor: loadingId === p.id ? "not-allowed" : "pointer",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    opacity: loadingId === p.id ? 0.6 : 1,
                  }}
                >
                  {loadingId === p.id ? "..." : "✓ Accept"}
                </button>
              </div>
            )}

            {p.status === "accepted" && canMarkOutForDelivery(p) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                <button
                  onClick={() => outForDelivery(p.id)}
                  disabled={loadingId === p.id}
                  style={{
                    padding: "8px 12px",
                    cursor: loadingId === p.id ? "not-allowed" : "pointer",
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    opacity: loadingId === p.id ? 0.6 : 1,
                  }}
                >
                  {loadingId === p.id ? "..." : "📦 Out for Delivery"}
                </button>
              </div>
            )}

            {/* OTP Flow - Only for distributor on out-of-delivery or retailer verifying */}
            {p.status === "out-of-delivery" && (canGenerateOtp(p) || canVerifyOtp(p)) && (
              <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "4px", border: "1px dashed #ddd" }}>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
                  <strong>OTP Delivery Flow:</strong>
                </div>

                {/* Generate OTP Button - Distributor only */}
                {canGenerateOtp(p) && !otpGeneratedFor[p.id] && (
                  <button
                    onClick={() => generateOtp(p.id)}
                    disabled={loadingId === p.id}
                    style={{
                      padding: "8px 12px",
                      cursor: loadingId === p.id ? "not-allowed" : "pointer",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      opacity: loadingId === p.id ? 0.6 : 1,
                    }}
                  >
                    {loadingId === p.id ? "Generating..." : "🔐 Generate OTP"}
                  </button>
                )}

                {/* OTP Input & Verify - Retailer only */}
                {canVerifyOtp(p) && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      value={otpMap[p.id] || ""}
                      onChange={(e) =>
                        setOtpMap({ ...otpMap, [p.id]: e.target.value.replace(/\D/g, "") })
                      }
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        flex: 1,
                        maxWidth: "150px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={() => verifyOtp(p.id)}
                      disabled={loadingId === p.id || !otpMap[p.id]}
                      style={{
                        padding: "8px 12px",
                        cursor: loadingId === p.id ? "not-allowed" : "pointer",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        opacity: loadingId === p.id || !otpMap[p.id] ? 0.6 : 1,
                      }}
                    >
                      {loadingId === p.id ? "Verifying..." : "✓ Verify"}
                    </button>
                  </div>
                )}

                {/* Distributor waiting message */}
                {canGenerateOtp(p) && otpGeneratedFor[p.id] && (
                  <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#666" }}>
                    ⏳ Waiting for retailer to verify OTP...
                  </p>
                )}
              </div>
            )}

            {/* Out of delivery but no permission message */}
            {p.status === "out-of-delivery" && !canGenerateOtp(p) && !canVerifyOtp(p) && (
              <div style={{ backgroundColor: "#e7f3ff", padding: "12px", borderRadius: "4px", border: "1px solid #b3d9ff" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#004085" }}>
                  ℹ️ This product is out for delivery. Only distributor or retailer can take action.
                </p>
              </div>
            )}

            {/* Delivered Status */}
            {p.status === "delivered" && (
              <div style={{ backgroundColor: "#d4edda", padding: "12px", borderRadius: "4px", border: "1px solid #c3e6cb" }}>
                <strong style={{ color: "#155724" }}>✓ Delivery Confirmed!</strong>
                <p style={{ margin: "8px 0 0 0", color: "#155724", fontSize: "13px" }}>
                  Delivered at: {new Date(p.delivered_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;