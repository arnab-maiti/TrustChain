import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'retailer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.data?.data?.token) {
        login(response.data.data.token, response.data.data.user);
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError('Registration failed: No token received');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "40px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>Create Account</h1>
          <p style={{ color: "#666", margin: "0 0 20px 0" }}>Join TrustChain today</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "15px",
            border: "1px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "15px",
            border: "1px solid #c3e6cb"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              disabled={loading}
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px",
                  paddingRight: "40px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
              At least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: "#007bff", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
