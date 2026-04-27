import React, { useState } from 'react';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Verify = () => {
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { error: showError, success } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!productId.trim()) {
      showError('Please enter a product ID');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const res = await api.get(`/blockchain/verify/${productId}`);
      setResult(res.data);
      if (res.data.verified) {
        success('Product verified successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      showError(message);
      setResult({
        verified: false,
        message: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-light-accent dark:bg-dark-accent bg-opacity-10 rounded-full">
                <Search size={40} className="text-light-accent dark:text-dark-accent" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Verify Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a product ID to verify its authenticity on the blockchain
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Product ID
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID (e.g., 550e8400-e29b-41d4-a716...)"
                className="input-field"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You can find the product ID on the product card or dashboard
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !productId.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              <Search size={20} />
              {loading ? 'Verifying...' : 'Verify Product'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-slideUp">
              {result.verified ? (
                <>
                  {/* Success State */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={24} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Verified ✓
                        </h3>
                        <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                          This product has been verified on the blockchain. The data is authentic and has not been tampered with.
                        </p>
                        {result.data && (
                          <div className="bg-white dark:bg-gray-800 rounded p-3 text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Transaction Hash:</span>
                              <code className="text-light-accent dark:text-dark-accent font-mono break-all">
                                {result.data.transactionHash?.substring(0, 20)}...
                              </code>
                            </div>
                            {result.data.timestamp && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Verified At:</span>
                                <span className="font-medium">
                                  {new Date(result.data.timestamp).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Failed State */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Verification Failed
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {result.message || 'This product could not be verified. It may be counterfeit or not yet recorded on the blockchain.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  setProductId('');
                  setResult(null);
                }}
                className="btn-secondary w-full"
              >
                Verify Another Product
              </button>
            </div>
          )}

          {/* Info Box */}
          {!result && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <span>ℹ️</span> How it works
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Enter the product ID to verify</li>
                <li>Our system checks the blockchain</li>
                <li>You'll see if the product is authentic</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
