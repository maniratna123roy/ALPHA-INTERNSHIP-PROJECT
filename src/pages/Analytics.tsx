import React, { useEffect, useMemo } from 'react';
import { apiService } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader, AlertCircle, TrendingUp, Star, CircleDollarSign, BarChart4, Package, AlertTriangle } from 'lucide-react';

const CHART_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
];

export const Analytics: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const setProducts = useAppStore((state) => state.setProducts);

  // Load products into store if empty
  useEffect(() => {
    if (products.length > 0) return;
    let active = true;
    apiService.getProducts(100).then((data) => {
      if (active) setProducts(data.products);
    }).catch(() => {});
    return () => { active = false; };
  }, [products.length, setProducts]);

  // Computed analytics metrics (products include live updates via useRealTimeUpdates on Product List)
  const metrics = useMemo(() => {
    if (products.length === 0) return null;

    const totalProducts = products.length;
    const avgRating = products.reduce((s, p) => s + p.rating, 0) / totalProducts;
    const totalInventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

    // Category aggregations
    const countsMap: Record<string, number> = {};
    const valueMap: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category.replace(/-/g, ' ');
      countsMap[cat] = (countsMap[cat] || 0) + 1;
      valueMap[cat] = (valueMap[cat] || 0) + p.price * p.stock;
    });
    const categoryCounts = Object.entries(countsMap).map(([name, value]) => ({ name, value }));
    const categoryValue = Object.entries(valueMap).map(([name, value]) => ({ name, value: Math.round(value) }));

    // Stock insights
    const outOfStock = products.filter((p) => p.stock === 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10);
    const wellStocked = products.filter((p) => p.stock >= 100);

    return {
      totalProducts,
      avgRating,
      totalInventoryValue,
      categoryCounts,
      categoryValue,
      outOfStock,
      lowStock,
      wellStocked,
    };
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Aggregating analytics data...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <div className="rounded-full bg-red-100 p-3.5 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">No data available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{metrics.totalProducts}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Rating</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {metrics.avgRating.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Value</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              ${metrics.totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Stock Insights Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Package className="h-5 w-5 text-slate-500" />
          <h4 className="font-bold text-slate-800 text-sm md:text-base">Stock Insights & Alerts</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Out of Stock */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-red-700">Out of Stock</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-700">{metrics.outOfStock.length}</p>
            <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
              {metrics.outOfStock.slice(0, 5).map((p) => (
                <p key={p.id} className="text-xs text-red-600 truncate">• {p.title}</p>
              ))}
              {metrics.outOfStock.length > 5 && (
                <p className="text-xs text-red-400">+{metrics.outOfStock.length - 5} more...</p>
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-amber-700">Low Stock (&lt;10)</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-amber-700">{metrics.lowStock.length}</p>
            <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
              {metrics.lowStock.slice(0, 5).map((p) => (
                <p key={p.id} className="text-xs text-amber-700 truncate">• {p.title} ({p.stock})</p>
              ))}
              {metrics.lowStock.length > 5 && (
                <p className="text-xs text-amber-400">+{metrics.lowStock.length - 5} more...</p>
              )}
            </div>
          </div>

          {/* Well Stocked */}
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Well Stocked (≥100)</span>
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-700">{metrics.wellStocked.length}</p>
            <p className="mt-2 text-xs text-emerald-600">Products with 100+ units in inventory.</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
            <BarChart4 className="h-5 w-5 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm">Inventory Value by Category ($)</h4>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categoryValue} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="value" name="Inventory Value ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
            <BarChart4 className="h-5 w-5 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm">Category Distribution (Product Count)</h4>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {metrics.categoryCounts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Products']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
