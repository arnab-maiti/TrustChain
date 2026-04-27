import React from 'react';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ id, message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = {
    success: Check,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideUp pointer-events-auto`}
      role="alert"
    >
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
