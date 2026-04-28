import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user } = useUser();
  const { error: showError, success } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    category: '',
    location: '',
  });
  const [creating, setCreating] = useState(false);

  // Fetch products
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

  // Handle product creation (manufacturer only)
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!createData.name.trim() || !createData.category.trim()) {
      showError('Please fill in name and category');
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/products', {
        name: createData.name,
        category: createData.category,
        location: createData.location || 'Factory',
      });

      success('Product created successfully!');
      setProducts(prev => [res.data.data, ...prev]);
      setCreateData({ name: '', category: '', location: '' });
      setShowCreateForm(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  // Handle product update
  const handleProductUpdate = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  // Handle product delete
  const handleProductDelete = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <div className="container-main">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role && `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {/* Create Product Button (Manufacturer only) */}
            {user?.role === 'manufacturer' && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                New Product
              </button>
            )}
          </div>
        </div>

        {/* Create Product Form */}
        {showCreateForm && user?.role === 'manufacturer' && (
          <div className="card p-6 mb-6 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Create New Product
            </h3>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={createData.name}
                onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                disabled={creating}
              />
              <input
                type="text"
                placeholder="Category"
                value={createData.category}
                onChange={(e) => setCreateData(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
                disabled={creating}
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={createData.location}
                onChange={(e) => setCreateData(prev => ({ ...prev, location: e.target.value }))}
                className="input-field"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating}
                className="btn-primary md:col-span-3"
              >
                {creating ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button onClick={fetchProducts} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {user?.role === 'manufacturer'
              ? 'Create a new product to get started'
              : 'Products will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              userRole={user?.role}
              onUpdate={handleProductUpdate}
              onDelete={handleProductDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
