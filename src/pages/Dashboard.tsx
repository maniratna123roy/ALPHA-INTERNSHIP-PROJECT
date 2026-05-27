import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import {
  Shield, ShoppingBag, BarChart3, Settings,
  ChevronUp, ChevronDown, Eye, EyeOff, LayoutDashboard
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const role = useAppStore((state) => state.role);
  const products = useAppStore((state) => state.products);
  const setProducts = useAppStore((state) => state.setProducts);
  const dashboardLayout = useAppStore((state) => state.dashboardLayout);
  const reorderWidget = useAppStore((state) => state.reorderWidget);
  const toggleWidgetVisibility = useAppStore((state) => state.toggleWidgetVisibility);
  const toasts = useAppStore((state) => state.toasts);

  const [metricsLoading, setMetricsLoading] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    if (products.length > 0) return;
    let active = true;
    setMetricsLoading(true);
    apiService.getProducts().then((data) => {
      if (active) {
        setProducts(data.products);
        setMetricsLoading(false);
      }
    }).catch(() => {
      if (active) setMetricsLoading(false);
    });
    return () => { active = false; };
  }, [products.length, setProducts]);

  const totalProducts = products.length;
  const avgRating = products.length > 0
    ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
    : 0;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleReorderWidget = useCallback((idx: number, dir: 'up' | 'down') => {
    reorderWidget(idx, dir);
  }, [reorderWidget]);

  const handleToggleWidget = useCallback((id: string) => {
    toggleWidgetVisibility(id);
  }, [toggleWidgetVisibility]);

  // ------ Widget renderers ------

  const renderWelcome = () => (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-indigo-950 md:text-3xl">
        Welcome back, {role === 'admin' ? 'Administrator' : 'Team Member'}!
      </h2>
      <p className="mt-2 max-w-2xl text-indigo-800 text-sm">
        This dashboard provides live management tools for your products, real-time inventory updates, and analytical distributions of your digital catalog.
      </p>
    </div>
  );

  const renderMetrics = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Total Products */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Products</p>
          <div className="rounded bg-indigo-50 p-1.5 text-indigo-600">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <h3 className="mt-2 text-2xl font-black text-slate-900">
          {metricsLoading ? '...' : totalProducts}
        </h3>
        <Link to="/products" className="mt-1 text-xs font-semibold text-indigo-600 hover:underline block">View all &rarr;</Link>
      </div>

      {/* Avg Rating */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Rating</p>
          <div className="rounded bg-amber-50 p-1.5 text-amber-500">
            <span className="text-base">★</span>
          </div>
        </div>
        <h3 className="mt-2 text-2xl font-black text-slate-900">
          {metricsLoading ? '...' : avgRating.toFixed(2)}
        </h3>
        <p className="mt-1 text-xs text-slate-400">Out of 5.0</p>
      </div>

      {/* Low Stock */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Low Stock</p>
          <div className="rounded bg-amber-50 p-1.5 text-amber-600">
            <Settings className="h-4 w-4" />
          </div>
        </div>
        <h3 className="mt-2 text-2xl font-black text-amber-600">
          {metricsLoading ? '...' : lowStockCount}
        </h3>
        <p className="mt-1 text-xs text-slate-400">Items below 10 units</p>
      </div>

      {/* Out of Stock */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Out of Stock</p>
          <div className="rounded bg-red-50 p-1.5 text-red-500">
            <Shield className="h-4 w-4" />
          </div>
        </div>
        <h3 className="mt-2 text-2xl font-black text-red-600">
          {metricsLoading ? '...' : outOfStockCount}
        </h3>
        <p className="mt-1 text-xs text-slate-400">Zero inventory items</p>
      </div>
    </div>
  );

  const renderQuickLinks = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Navigation</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/products"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 transition-colors"
        >
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h5 className="font-semibold text-slate-800 text-sm">Manage Products</h5>
            <p className="text-xs text-slate-500">Search, filter, manage visibility and columns.</p>
          </div>
        </Link>

        {role === 'admin' ? (
          <Link
            to="/analytics"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 transition-colors"
          >
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-800 text-sm">Visual Analytics</h5>
              <p className="text-xs text-slate-500">View revenue metrics, ratings, category charts.</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 opacity-60">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-400 text-sm">Analytics (Locked)</h5>
              <p className="text-xs text-slate-400">Requires Administrator role.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLiveFeed = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-700">Live Update Log</h4>
        <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
          Active
        </span>
      </div>
      <div className="space-y-2 max-h-36 overflow-y-auto">
        {toasts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No recent updates. Polling runs every 15s.</p>
        ) : (
          [...toasts].reverse().slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-start gap-2 text-xs text-slate-600 border-b border-slate-50 pb-1.5">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="line-clamp-2">{t.message}</span>
            </div>
          ))
        )}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        Inventory Value: <span className="font-bold text-slate-600">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </p>
    </div>
  );

  const widgetRenderers: Record<string, () => React.ReactNode> = {
    welcome: renderWelcome,
    metrics: renderMetrics,
    quickLinks: renderQuickLinks,
    liveFeed: renderLiveFeed,
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Customizer Toggle Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm font-semibold text-slate-700">Overview</span>
        </div>
        <button
          onClick={() => setShowCustomizer(!showCustomizer)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors
            ${showCustomizer
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          type="button"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Customize Layout</span>
        </button>
      </div>

      {/* Layout Customizer Panel */}
      {showCustomizer && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Widget Visibility & Order
          </h4>
          <div className="space-y-2">
            {dashboardLayout.map((widget, idx) => (
              <div key={widget.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <button
                    onClick={() => handleToggleWidget(widget.id)}
                    className={`rounded p-0.5 transition-colors ${widget.visible ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'}`}
                    title={widget.visible ? 'Hide Widget' : 'Show Widget'}
                    type="button"
                  >
                    {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <span className={!widget.visible ? 'text-slate-400 line-through' : ''}>{widget.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorderWidget(idx, 'up')}
                    disabled={idx === 0}
                    className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Up"
                    type="button"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReorderWidget(idx, 'down')}
                    disabled={idx === dashboardLayout.length - 1}
                    className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Down"
                    type="button"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Widget Rendering in Custom Order */}
      {dashboardLayout.filter((w) => w.visible).map((widget) => {
        const renderer = widgetRenderers[widget.id];
        if (!renderer) return null;
        return <div key={widget.id}>{renderer()}</div>;
      })}
    </div>
  );
};
