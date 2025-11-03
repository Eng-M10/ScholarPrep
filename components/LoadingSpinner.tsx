
import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Generating..." }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="text-indigo-600 font-medium">{text}</p>
  </div>
);

export default LoadingSpinner;
