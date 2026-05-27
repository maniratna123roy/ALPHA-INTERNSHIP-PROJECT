import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Settings2, ArrowUp, ArrowDown } from 'lucide-react';

export const ColumnSelector: React.FC = () => {
  const columnConfig = useAppStore((state) => state.columnConfig);
  const columnOrder = useAppStore((state) => state.columnOrder);
  const toggleColumn = useAppStore((state) => state.toggleColumn);
  const reorderColumn = useAppStore((state) => state.reorderColumn);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getLabel = (key: string) => {
    switch (key) {
      case 'image': return 'Thumbnail';
      case 'name': return 'Product Name';
      case 'category': return 'Category';
      case 'price': return 'Price';
      case 'rating': return 'Rating';
      case 'stock': return 'Stock Status';
      default: return key;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-800"
        type="button"
      >
        <Settings2 className="h-4 w-4 text-slate-500" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="border-b border-slate-100 pb-2 mb-2 font-semibold text-xs text-slate-500 uppercase tracking-wider">
            Display & Order Columns
          </div>
          <div className="space-y-2">
            {columnOrder.map((key, idx) => {
              const isChecked = columnConfig[key];
              return (
                <div key={key} className="flex items-center justify-between gap-2 rounded hover:bg-slate-50 px-1 py-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 flex-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(key)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{getLabel(key)}</span>
                  </label>
                  
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => reorderColumn(idx, 'up')}
                      disabled={idx === 0}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none p-1"
                      title="Move Up"
                      type="button"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => reorderColumn(idx, 'down')}
                      disabled={idx === columnOrder.length - 1}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none p-1"
                      title="Move Down"
                      type="button"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
