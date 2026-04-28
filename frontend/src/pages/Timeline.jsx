import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Truck, Lock, Package, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Timeline = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [events, setEvents] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Icon mapping for event types
  const eventIcons = {
    created: Package,
    accepted: CheckCircle,
    out_for_delivery: Truck,
    in_transit: Truck,
    otp_generated: Lock,
    otp_verified: CheckCircle,
    delivered: CheckCircle,
  };

  // Color mapping for event types
  const eventColors = {
    created: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    accepted: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300',
    out_for_delivery: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    in_transit: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300',
    otp_generated: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
    otp_verified: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300',
    delivered: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
  };

  useEffect(() => {
    if (!productId) {
      setError('No product ID provided');
      setLoading(false);
      return;
    }

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch events for this product
        const res = await api.get(`/products/${productId}/events`);
        setEvents(res.data.data || []);

        // Fetch product details
        const productRes = await api.get(`/products/${productId}`);
        setProduct(productRes.data.data);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load timeline';
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [productId, showError]);

  const formatEventType = (type) => {
    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (!productId) {
    return (
      <div className="container-main">
        <div className="card p-12 text-center">
          <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
            No product selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select a product to view its timeline
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main">
      {/* Header */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-light-accent dark:text-dark-accent hover:opacity-80 transition-opacity mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
          Product Timeline
        </h1>
        {product && (
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Product Name</p>
              <p className="font-medium text-light-text dark:text-dark-text">{product.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Product ID</p>
              <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {productId?.substring(0, 12)}...
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent"></div>
          <p className="mt-4 text-light-text dark:text-dark-text">Loading timeline...</p>
        </div>
      ) : error ? (
        <div className="card p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error Loading Timeline
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
            No events yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Events will appear here as the product progresses through the supply chain
          </p>
        </div>
      ) : (
        <div className="card p-8">
          {/* Timeline */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const eventType = event.event_type?.toLowerCase() || 'created';
              const IconComponent = eventIcons[eventType] || Package;
              const colorClass = eventColors[eventType] || eventColors['created'];

              return (
                <div key={event.id || index} className="flex gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent size={20} />
                    </div>
                    {index < events.length - 1 && (
                      <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 pt-2">
                    <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">
                      {formatEventType(eventType)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(event.timestamp || event.created_at)}
                    </p>
                    {event.actor && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <span className="font-medium">By:</span> {event.actor}
                      </p>
                    )}
                    {event.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        {event.notes}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        <span className="font-medium">Location:</span> {event.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;