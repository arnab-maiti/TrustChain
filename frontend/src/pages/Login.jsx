import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: showError, success } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      showError('Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        success('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        showError('Login failed: No token received');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@trustchain.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg to-gray-100 dark:from-dark-bg dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-light-accent dark:bg-dark-accent opacity-10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 dark:bg-cyan-600 opacity-10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">TC</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              TrustChain
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium text-base mt-6"
            >
              <LogIn size={20} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-light-card dark:bg-dark-card text-gray-600 dark:text-gray-400">
                Or
              </span>
            </div>
          </div>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-secondary w-full py-3 font-medium"
          >
            Try Demo Account
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <p>Email: demo@trustchain.com</p>
            <p>Password: demo123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Secure blockchain-based supply chain tracking
        </p>
      </div>
    </div>
  );
};

export default Login;