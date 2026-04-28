import React from 'react';
import { Package, CheckCircle, Truck, Lock, CheckSquare, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'created': { 
      bg: 'bg-yellow-100 dark:bg-yellow-900', 
      text: 'text-yellow-800 dark:text-yellow-100',
      icon: Package,
      label: 'Created'
    },
    'pending': { 
      bg: 'bg-yellow-100 dark:bg-yellow-900', 
      text: 'text-yellow-800 dark:text-yellow-100',
      icon: Package,
      label: 'Pending'
    },
    'accepted': { 
      bg: 'bg-emerald-100 dark:bg-emerald-900', 
      text: 'text-emerald-800 dark:text-emerald-100',
      icon: CheckCircle,
      label: 'Accepted'
    },
    'in-transit': { 
      bg: 'bg-blue-100 dark:bg-blue-900', 
      text: 'text-blue-800 dark:text-blue-100',
      icon: Truck,
      label: 'In Transit'
    },
    'out-for-delivery': { 
      bg: 'bg-cyan-100 dark:bg-cyan-900', 
      text: 'text-cyan-800 dark:text-cyan-100',
      icon: Truck,
      label: 'Out for Delivery'
    },
    'delivered': { 
      bg: 'bg-green-100 dark:bg-green-900', 
      text: 'text-green-800 dark:text-green-100',
      icon: CheckSquare,
      label: 'Delivered'
    },
    'verified': { 
      bg: 'bg-emerald-100 dark:bg-emerald-900', 
      text: 'text-emerald-800 dark:text-emerald-100',
      icon: Lock,
      label: 'OTP Verified'
    },
    'failed': { 
      bg: 'bg-red-100 dark:bg-red-900', 
      text: 'text-red-800 dark:text-red-100',
      icon: AlertCircle,
      label: 'Failed'
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.bg} ${config.text} flex items-center gap-2`}>
      <IconComponent size={18} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
