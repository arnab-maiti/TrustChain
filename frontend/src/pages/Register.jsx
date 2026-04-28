import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'retailer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
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
        success('Registration successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        showError('Registration failed: No token received');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg to-gray-100 dark:from-dark-bg dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-light-accent dark:bg-dark-accent opacity-10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 dark:bg-cyan-600 opacity-10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">TC</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join TrustChain today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              >
                <option value="manufacturer">Manufacturer</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                At least 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-light-accent dark:text-dark-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
