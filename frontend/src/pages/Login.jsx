import React from 'react'
import { useState } from "react";
import api from "../services/api";
const Login = () => {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
      try {
        setLoading(true);
        const response = await api.post("/auth/login", { email, password });
        if (response.data && response.data.data && response.data.data.token) {
          localStorage.setItem("token", response.data.data.token);
          alert("Login successful!");
          // Redirect to dashboard or home
          window.location.href = "/dashboard";
        } else {
          alert("Login failed: No token received");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(error.response?.data?.message || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }}
  return (
    <div>
        <h2>Login</h2>
        <input type="text" placeholder="Enter email"
        value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <input type="text" placeholder='Enter Password'
        value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </div>
  )
}

export default Login