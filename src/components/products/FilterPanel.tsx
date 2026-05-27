import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  onClear: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategories,
  onChange,
  onClear,
}) => {
  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm">Filter by Category</span>
        </div>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {categories.map((category) => {
          const isChecked = selectedCategories.includes(category);
          return (
            <label
              key={category}
              className="flex items-center gap-2.5 cursor-pointer rounded px-1.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggleCategory(category)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="capitalize">{category.replace('-', ' ')}</span>
            </label>
          );
        })}
        {categories.length === 0 && (
          <p className="text-xs text-slate-400 py-2">Loading categories...</p>
        )}
      </div>
    </div>
  );
};
