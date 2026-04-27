import React, { useState } from 'react';
import { ChevronRight, Truck, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from './StatusBadge';
import TrustScore from './TrustScore';

const ProductCard = ({ product, onUpdate }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleStatusUpdate = async (action) => {
    setLoading(true);
    try {
      const response = await api.post(`/products/${product.id}/${action}`);
      success(`Product ${action} successfully`);
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/otp/verify/${product.id}`, { otp });
      success('OTP verified successfully');
      setShowOtpInput(false);
      setOtp('');
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const trustScore = product.trust_score || 0;

  return (
    <div className="card p-6 hover:shadow-card-hover transition-all duration-300 animate-fadeIn">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
            {product.name || 'Unknown Product'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">ID:</span>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-light-accent dark:text-dark-accent">
              {product.id?.substring(0, 8)}...
            </code>
          </div>
        </div>
        <StatusBadge status={product.status} />
      </div>

      {/* Trust Score */}
      <div className="flex items-center justify-center py-4 border-y border-gray-200 dark:border-gray-700 my-4">
        <div className="flex flex-col items-center gap-2">
          <TrustScore score={trustScore} size="sm" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Trust Score</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 py-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
            Category
          </p>
          <p className="font-medium text-light-text dark:text-dark-text">
            {product.category || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
            Location
          </p>
          <p className="font-medium text-light-text dark:text-dark-text">
            {product.location || 'In Transit'}
          </p>
        </div>
        {product.created_at && (
          <div className="col-span-2">
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
              Created
            </p>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">
              {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* OTP Input */}
      {showOtpInput && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="input-field flex-1"
              maxLength="6"
              disabled={loading}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="btn-primary btn-sm"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {product.status === 'pending' && (
          <button
            onClick={() => handleStatusUpdate('accept')}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {loading ? 'Processing...' : 'Accept'}
          </button>
        )}
        {product.status === 'accepted' && (
          <button
            onClick={() => handleStatusUpdate('ship')}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Truck size={18} />
            {loading ? 'Processing...' : 'Out for Delivery'}
          </button>
        )}
        {product.status === 'in-transit' && (
          <button
            onClick={() => setShowOtpInput(!showOtpInput)}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            {showOtpInput ? 'Cancel' : 'Verify OTP'}
          </button>
        )}
        <button
          onClick={() => navigate(`/timeline/${product.id}`)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          View Timeline
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default ProductCard;