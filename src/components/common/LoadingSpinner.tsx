import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading view...',
  fullScreen = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${fullScreen ? 'min-h-screen bg-slate-50' : 'min-h-[40vh]'}`}>
      <Loader className="h-9 w-9 text-indigo-600 animate-spin" />
      {message && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{message}</p>}
    </div>
  );
};
