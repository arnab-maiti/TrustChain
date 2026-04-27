import React from 'react';
import { Package, Search } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = 'Try adjusting your search or filters', icon: Icon = Package }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        <Icon size={40} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
