import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-amber-100 p-4 text-amber-600">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-slate-950">Page Not Found</h2>
      <p className="mt-2 text-slate-500 max-w-md">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="mt-8">
        <Link
          to="/dashboard"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
