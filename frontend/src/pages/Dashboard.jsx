import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError, success } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch products';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductUpdate = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    success('Product updated');
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  return (
    <div className="container-main">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your products
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Create or import products to get started with TrustChain"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={handleProductUpdate}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-light-accent dark:text-dark-accent">
              {products.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Products
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {products.filter(p => p.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Delivered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {products.filter(p => p.status === 'in-transit').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              In Transit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
