import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'pending': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-100' },
    'in-transit': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-100' },
    'delivered': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-100' },
    'verified': { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-800 dark:text-emerald-100' },
    'failed': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-100' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];

  return (
    <span className={`badge ${config.bg} ${config.text}`}>
      {status || 'Pending'}
    </span>
  );
};

export default StatusBadge;
