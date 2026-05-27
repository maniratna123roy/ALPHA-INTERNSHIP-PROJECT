import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Menu, User, Bell } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const role = useAppStore((state) => state.role);
  const toasts = useAppStore((state) => state.toasts);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/products') return 'Product Management';
    if (path.startsWith('/products/')) return 'Product Details';
    if (path === '/analytics') return 'Analytics Dashboard';
    return 'Admin Console';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 md:text-xl">{getPageTitle()}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell to view simulation updates status */}
        <div className="relative cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          {toasts.length > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </div>

        {/* User Account Info */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 capitalize">
              {role || 'Guest'}
            </div>
            <div className="text-[10px] text-slate-500">
              {role === 'admin' ? 'Super Administrator' : 'Standard Account'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
