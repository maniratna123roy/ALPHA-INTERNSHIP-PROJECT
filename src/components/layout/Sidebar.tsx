import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, ShoppingBag, BarChart3, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const role = useAppStore((state) => state.role);
  const logout = useAppStore((state) => state.logout);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { to: '/products', label: 'Products', icon: ShoppingBag, adminOnly: false },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  ];

  const filteredLinks = links.filter((link) => !link.adminOnly || role === 'admin');

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-white transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          h-screen border-r border-slate-800`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 font-bold text-white shrink-0">
              AD
            </span>
            {!isCollapsed && (
              <span className="font-semibold text-lg tracking-wider text-slate-100 whitespace-nowrap">
                AdminDash
              </span>
            )}
          </div>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Collapse button for Desktop/Tablet */}
          {!isOpen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }
                  ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300
              ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
