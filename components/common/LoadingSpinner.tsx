import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <FiLoader className="animate-spin text-blue-500" size={size} />
    </div>
  );
};

export default LoadingSpinner;
