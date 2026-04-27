import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Truck, Lock, Package } from 'lucide-react';
import api from '../services/api';
import { SkeletonTimeline } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const Timeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { error: showError } = useToast();

  const eventIcons = {
    created: Package,
    accepted: CheckCircle,
    out_for_delivery: Truck,
    in_transit: Truck,
    otp_generated: Lock,
    otp_verified: CheckCircle,
    delivered: CheckCircle,
  };

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
    if (!id) {
      setError('No product ID provided');
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/products/${id}/events`);
        setEvents(res.data.data || []);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load timeline';
        setError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [id, showError]);

  const formatEventType = (type) => {
    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (!id) {
    return (
      <div className="container-main">
        <EmptyState title="No product selected" description="Please select a product to view its timeline" />
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
        <p className="text-gray-600 dark:text-gray-400">
          Product ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{id?.substring(0, 12)}...</code>
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card p-8">
          <SkeletonTimeline />
        </div>
      ) : error ? (
        <div className="card p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Timeline
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Timeline events will appear here as the product progresses"
          icon={Clock}
        />
      ) : (
        <div className="card p-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-light-accent dark:from-dark-accent via-gray-300 dark:via-gray-600 to-transparent" />

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => {
                const EventIcon = eventIcons[event.event_type] || Package;
                const colorClass = eventColors[event.event_type] || eventColors.created;
                const isLast = index === events.length - 1;

                return (
                  <div key={event.id} className="relative pl-20 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Icon */}
                    <div className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center ${colorClass} shadow-md`}>
                      <EventIcon size={24} />
                    </div>

                    {/* Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-light-text dark:text-dark-text text-lg mb-1">
                            {formatEventType(event.event_type)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                          {event.actor && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">By:</span> {event.actor}
                            </p>
                          )}
                        </div>
                        {isLast && (
                          <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                            Latest
                          </span>
                        )}
                      </div>

                      {event.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{event.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;