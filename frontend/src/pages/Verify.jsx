import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import TrustScore from '../components/TrustScore';

const Verify = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { error: showError, success } = useToast();

  const [searchId, setSearchId] = useState(productId || '');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);

  // Auto-load if productId is in URL
  useEffect(() => {
    if (productId && !product) {
      handleVerify(null, productId);
    }
  }, [productId]);

  const handleVerify = async (e, idToUse = null) => {
    if (e) e.preventDefault();

    const id = idToUse || searchId.trim();
    if (!id) {
      showError('Please enter a product ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProduct(null);
      setVerified(null);

      // Fetch product details
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);

      // Check verification status
      const verifyRes = await api.get(`/blockchain/verify/${id}`);
      setVerified(verifyRes.data.data?.verified || false);

      success('Product found and verified!');
    } catch (err) {
      const message = err.response?.data?.message || 'Product not found';
      setError(message);
      showError(message);
      setProduct(null);
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12 pt-8">
          <button
            onClick={() => navigate('/')}
            className="text-light-accent dark:text-dark-accent hover:opacity-80 transition-opacity mb-6 inline-block"
          >
            ← Back
          </button>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg flex items-center justify-center">
                <Search size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-2">
              Verify Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Enter a product ID to verify its authenticity and track its journey through the supply chain
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleVerify} className="card p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter product ID..."
                  className="input-field"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You can find the product ID on the product card or packaging
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Verify Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && !product && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="card p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-4">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Product Not Found
                  </h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {product && (
          <div className="max-w-2xl mx-auto">
            {/* Product Card */}
            <div className="card p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                    {product.name}
                  </h2>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono text-gray-700 dark:text-gray-300">
                    {product.id}
                  </code>
                </div>
                <StatusBadge status={product.status} />
              </div>

              {/* Verification Status */}
              <div className="border-y border-gray-200 dark:border-gray-700 py-6 my-6">
                <div className="flex items-center gap-4">
                  {verified ? (
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                      <CheckCircle size={32} className="flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-lg">Verified ✓</p>
                        <p className="text-sm opacity-75">This product is authentic</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                      <AlertCircle size={32} className="flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-lg">Not Verified</p>
                        <p className="text-sm opacity-75">Could not verify authenticity</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    Category
                  </p>
                  <p className="font-semibold text-light-text dark:text-dark-text mt-1">
                    {product.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    Current Location
                  </p>
                  <p className="font-semibold text-light-text dark:text-dark-text mt-1">
                    {product.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    Status
                  </p>
                  <p className="font-semibold text-light-text dark:text-dark-text mt-1 capitalize">
                    {product.status?.replace(/-/g, ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    Courier
                  </p>
                  <p className="font-semibold text-light-text dark:text-dark-text mt-1 font-mono text-sm">
                    {product.courier_id?.substring(0, 8) || 'N/A'}...
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Score */}
            {product.trust_score !== undefined && (
              <div className="card p-8 mb-6">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">
                  Trust Score
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <TrustScore score={product.trust_score} size="lg" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      This score indicates the product's authenticity based on blockchain verification and supply chain tracking.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-600 dark:text-green-400">✓ All timestamps verified</p>
                      <p className="text-green-600 dark:text-green-400">✓ Chain of custody complete</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Link */}
            <div className="card p-8 bg-gray-50 dark:bg-gray-800 text-center">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">
                Want to see the full supply chain journey?
              </h3>
              <button
                onClick={() => navigate(`/timeline/${product.id}`)}
                className="btn-primary inline-flex items-center gap-2"
              >
                View Full Timeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;

