import React from 'react';

const TrustScore = ({ score = 0, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 75) return '#22C55E';
    if (pct >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${textSize[size]} font-bold text-light-text dark:text-dark-text`}>
          {percentage}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
      </div>
    </div>
  );
};

export default TrustScore;
