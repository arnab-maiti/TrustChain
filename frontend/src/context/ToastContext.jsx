import React, { createContext, useContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const success = (message) => addToast(message, 'success');
  const error = (message) => addToast(message, 'error'); // eslint-disable-line react-refresh/only-export-components
  const info = (message) => addToast(message, 'info'); // eslint-disable-line react-refresh/only-export-components

  return (
    <ToastContext.Provider value={{ success, error, info, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
