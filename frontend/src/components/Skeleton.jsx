import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
    <Skeleton className="h-24 w-24 mx-auto" />
    <Skeleton className="h-12 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

const SkeletonTimeline = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export { SkeletonCard, SkeletonTimeline, Skeleton };
