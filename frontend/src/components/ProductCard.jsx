import React, { useState } from 'react';
import { ChevronRight, Truck, CheckCircle, Lock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from './StatusBadge';
import TrustScore from './TrustScore';

const ProductCard = ({ product, userRole, onUpdate }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  // Handle status updates (accept, out for delivery, etc.)
  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const endpoint = newStatus === 'accepted'
        ? `/products/${product.id}/accept`
        : newStatus === 'in-transit'
        ? `/products/${product.id}/out-for-delivery`
        : `/products/${product.id}/update`;

      const response = await api.post(endpoint);
      success(`Product status updated to ${newStatus}`);
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP generation
  const handleGenerateOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/delivery/generate-otp/${product.id}`);
      success('OTP generated successfully');
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showError('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/delivery/verify-otp/${product.id}`, { otp });
      success('OTP verified successfully! Product delivered.');
      setShowOtpInput(false);
      setOtp('');
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const status = product.status?.toLowerCase();
  const trustScore = product.trust_score || 0;

  // Determine which action buttons to show based on role and status
  const showAcceptButton = userRole === 'distributor' && status === 'created';
  const showOutForDeliveryButton = userRole === 'distributor' && status === 'accepted';
  const showGenerateOtpButton = userRole === 'distributor' && status === 'in-transit';
  const showVerifyOtpButton = userRole === 'retailer' && status === 'in-transit';

  return (
    <div className="card p-6 hover:shadow-card-hover transition-all duration-300 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
            {product.name || 'Unknown Product'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">ID:</span>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-light-accent dark:text-dark-accent font-mono">
              {product.id?.substring(0, 8)}...
            </code>
          </div>
        </div>
        <StatusBadge status={status} />
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
        {product.courier_id && (
          <div className="col-span-2">
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
              Courier ID
            </p>
            <p className="font-medium text-light-text dark:text-dark-text text-sm font-mono">
              {product.courier_id}
            </p>
          </div>
        )}
      </div>

      {/* OTP Input (if showing) */}
      {showOtpInput && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="input-field flex-1"
              disabled={loading}
              maxLength="6"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp.trim()}
              className="btn-primary btn-sm"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </div>
          <button
            onClick={() => {
              setShowOtpInput(false);
              setOtp('');
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:underline mt-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        {/* Accept Shipment (Distributor) */}
        {showAcceptButton && (
          <button
            onClick={() => handleStatusUpdate('accepted')}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 btn-sm"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Accept Shipment
          </button>
        )}

        {/* Out for Delivery (Distributor) */}
        {showOutForDeliveryButton && (
          <button
            onClick={() => handleStatusUpdate('in-transit')}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 btn-sm"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Truck size={16} />}
            Out for Delivery
          </button>
        )}

        {/* Generate OTP (Distributor) */}
        {showGenerateOtpButton && (
          <button
            onClick={handleGenerateOtp}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 btn-sm"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />}
            Generate OTP
          </button>
        )}

        {/* Verify OTP (Retailer) */}
        {showVerifyOtpButton && (
          !showOtpInput ? (
            <button
              onClick={() => setShowOtpInput(true)}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 btn-sm"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />}
              Verify OTP
            </button>
          ) : null
        )}

        {/* View Timeline (All roles) */}
        <button
          onClick={() => navigate(`/timeline/${product.id}`)}
          className="btn-secondary w-full flex items-center justify-center gap-2 btn-sm"
        >
          <ChevronRight size={16} />
          View Timeline
        </button>
      </div>
    </div>
  );
};

export default ProductCard;