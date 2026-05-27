import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ShieldAlert, User, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const login = useAppStore((state) => state.login);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const addToast = useAppStore((state) => state.addToast);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from state or default to /dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect immediately
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = (role: 'admin' | 'user') => {
    login(role);
    addToast(`Successfully logged in as ${role === 'admin' ? 'Administrator' : 'Standard User'}!`, 'success');
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-md">
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in using one of the mock options below to test role permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* User login button */}
          <button
            onClick={() => handleLogin('user')}
            className="group relative flex w-full justify-center items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 focus:outline-none"
          >
            <User className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
            <span>Login as Standard User</span>
          </button>

          {/* Admin login button */}
          <button
            onClick={() => handleLogin('admin')}
            className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none"
          >
            <ShieldCheck className="h-5 w-5 text-indigo-200 group-hover:text-white" />
            <span>Login as Administrator</span>
          </button>
        </div>

        {/* Details Footer */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-xs text-slate-500 space-y-2">
          <div className="font-semibold text-slate-600">Access Privileges:</div>
          <div>
            <strong className="text-slate-700">User Account:</strong> Can view products and details, but restricted to published products only. Cannot toggle publish state, customize visible columns (wait, column config is open to all or admin? Prompt: "Allow users to show/hide columns" - so anyone can customize columns; but published status is Admin only), or access the Analytics view.
          </div>
          <div>
            <strong className="text-slate-700">Admin Account:</strong> Full access to all products (published & hidden), ability to toggle product visibility, and access to the Analytics page.
          </div>
        </div>
      </div>
    </div>
  );
};
