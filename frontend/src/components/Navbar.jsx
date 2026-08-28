import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleColor = (role) => {
    const colors = {
      manufacturer: "#6c757d",
      distributor: "#ffc107",
      retailer: "#28a745",
      courier: "#17a2b8",
    };
    return colors[role] || "#6c757d";
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    if (score >= 40) return "#fd7e14";
    return "#dc3545";
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "12px 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>🔗 TrustChain</h1>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <Link to="/verify" style={{ marginRight: "10px", color: "#007bff", textDecoration: "none" }}>
          🔍 Verify
        </Link>

        {user && (
          <>
            <Link to="/dashboard" style={{ color: "#007bff", textDecoration: "none" }}>
              📦 Dashboard
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {/* User Info */}
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px" }}>
                  {user.name}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: getRoleColor(user.role),
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </span>
              </div>

              {/* Trust Score */}
              {user.trust_score !== undefined && (
                <div
                  style={{
                    backgroundColor: getTrustScoreColor(user.trust_score),
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    textAlign: "center",
                    minWidth: "60px",
                  }}
                >
                  <div style={{ fontSize: "12px" }}>Trust</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>{user.trust_score}</div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;