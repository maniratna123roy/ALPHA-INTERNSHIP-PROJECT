import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onChange: (sort: string, order: 'asc' | 'desc') => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortOrder,
  onChange,
}) => {
  const options = [
    { value: '', label: 'Featured' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'title', label: 'Name' },
  ];

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value, sortOrder);
  };

  const toggleDirection = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onChange(sortBy, nextOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
        <ArrowUpDown className="h-4.5 w-4.5" />
        <span>Sort By:</span>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
        <select
          value={sortBy}
          onChange={handleFieldChange}
          className="bg-transparent py-1.5 px-2.5 text-sm text-slate-700 focus:outline-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {sortBy && (
          <button
            onClick={toggleDirection}
            className="border-l border-slate-100 p-1.5 text-slate-500 hover:text-slate-700"
            title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            type="button"
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
