import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/login", { email, password });
      
      if (response.data?.data?.token) {
        login(response.data.data.token, response.data.data.user);
        navigate("/dashboard");
      } else {
        setError("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Enter email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Enter Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: "#007bff", textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;