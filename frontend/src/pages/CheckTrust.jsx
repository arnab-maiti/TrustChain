import React, { useState } from 'react';
import { Search, User, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';
import TrustScore from '../components/TrustScore';
import { useToast } from '../context/ToastContext';

const CheckTrust = () => {
  const [courierId, setCourierId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { error: showError, success } = useToast();

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!courierId.trim()) {
      showError('Please enter a courier ID');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/users/trust/${courierId}`);
      setResult(res.data.data);
      success('Courier information loaded');
    } catch (err) {
      const message = err.response?.data?.message || 'Courier not found';
      showError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Poor', color: 'text-red-600 dark:text-red-400' };
  };

  const trustInfo = result ? getTrustLevel(result.trust_score || 0) : null;

  return (
    <div className="container-main flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-2xl">
        {/* Search Card */}
        <div className="card p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-light-accent dark:bg-dark-accent bg-opacity-10 rounded-full">
                <Award size={40} className="text-light-accent dark:text-dark-accent" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Check Trust Score
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View the trust score and performance of any courier
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Courier ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={courierId}
                  onChange={(e) => setCourierId(e.target.value)}
                  placeholder="Enter courier ID"
                  className="input-field pl-10"
                  disabled={loading}
                />
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !courierId.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Check Trust Score'}
            </button>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className="card p-8 animate-slideUp">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {result.name || result.email || 'Unknown Courier'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.email}
                </p>
              </div>
            </div>

            {/* Trust Score Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Circular Score */}
              <div className="flex flex-col items-center justify-center">
                <TrustScore score={result.trust_score || 0} size="lg" />
              </div>

              {/* Info */}
              <div className="space-y-4">
                {/* Trust Level */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trust Level</p>
                  <p className={`text-2xl font-bold ${trustInfo?.color}`}>
                    {trustInfo?.level}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-light-text dark:text-dark-text">
                      {result.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Role */}
                {result.role && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                    <p className="font-medium text-light-text dark:text-dark-text capitalize">
                      {result.role}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            {(result.total_deliveries || result.completed_deliveries) && (
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-light-accent dark:text-dark-accent">
                    {result.total_deliveries || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Total Deliveries
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {result.completed_deliveries || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {result.success_rate ? `${result.success_rate}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Success Rate
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            <button
              onClick={() => {
                setCourierId('');
                setResult(null);
              }}
              className="btn-secondary w-full mt-8"
            >
              Check Another Courier
            </button>
          </div>
        )}

        {/* Info Box */}
        {!result && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <TrendingUp size={20} /> Trust Score System
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>Scores range from 0 to 100</li>
              <li>Based on delivery performance and reliability</li>
              <li>Updated automatically with each completed delivery</li>
              <li>80+ = Excellent | 60-79 = Good | 40-59 = Fair | &lt;40 = Poor</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckTrust;