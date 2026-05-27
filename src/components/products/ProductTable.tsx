import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Star, Eye, EyeOff, ArrowUp, ArrowDown, Edit2, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
  onTogglePublish: (id: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = React.memo(({
  products,
  sortBy,
  sortOrder,
  onSort,
  onTogglePublish,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const columnConfig = useAppStore((state) => state.columnConfig);
  const columnOrder = useAppStore((state) => state.columnOrder);
  const publishedSettings = useAppStore((state) => state.publishedSettings);

  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="inline-block ml-1 h-3.5 w-3.5 text-slate-700" />
    ) : (
      <ArrowDown className="inline-block ml-1 h-3.5 w-3.5 text-slate-700" />
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', classes: 'text-red-600 bg-red-50 border-red-100' };
    if (stock < 10) return { label: `Low (${stock})`, classes: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { label: 'In Stock', classes: 'text-green-600 bg-green-50 border-green-100' };
  };

  const renderCell = (product: Product, key: keyof typeof columnConfig) => {
    switch (key) {
      case 'image':
        return (
          <td className="px-6 py-3.5" key={key}>
            <div className="h-10 w-10 flex items-center justify-center rounded-md border border-slate-100 bg-slate-50 overflow-hidden">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-slate-400">N/A</span>
              )}
            </div>
          </td>
        );
      case 'name':
        return (
          <td className="px-6 py-3.5" key={key}>
            <Link to={`/products/${product.id}`} className="font-bold text-slate-800 hover:text-indigo-600 line-clamp-1 hover:underline">
              {product.title}
            </Link>
            <span className="text-[11px] text-slate-400 font-normal">
              ID: {product.id} {product.brand && `| ${product.brand}`}
            </span>
          </td>
        );
      case 'category':
        return (
          <td className="px-6 py-3.5 capitalize text-xs" key={key}>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
              {product.category.replace('-', ' ')}
            </span>
          </td>
        );
      case 'price':
        return (
          <td className="px-6 py-3.5 font-bold text-slate-900" key={key}>
            ${product.price.toFixed(2)}
          </td>
        );
      case 'rating':
        return (
          <td className="px-6 py-3.5" key={key}>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="font-bold text-slate-900">{product.rating.toFixed(2)}</span>
            </div>
          </td>
        );
      case 'stock':
        const stockStatus = getStockStatus(product.stock);
        return (
          <td className="px-6 py-3.5" key={key}>
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${stockStatus.classes}`}>
              {stockStatus.label}
            </span>
          </td>
        );
      default:
        return null;
    }
  };

  const renderHeader = (key: keyof typeof columnConfig) => {
    switch (key) {
      case 'image':
        return <th className="px-6 py-4" key={key}>Image</th>;
      case 'name':
        return (
          <th onClick={() => handleSortClick('title')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" key={key}>
            Product Name {renderSortIcon('title')}
          </th>
        );
      case 'category':
        return <th className="px-6 py-4" key={key}>Category</th>;
      case 'price':
        return (
          <th onClick={() => handleSortClick('price')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" key={key}>
            Price {renderSortIcon('price')}
          </th>
        );
      case 'rating':
        return (
          <th onClick={() => handleSortClick('rating')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" key={key}>
            Rating {renderSortIcon('rating')}
          </th>
        );
      case 'stock':
        return <th className="px-6 py-4" key={key}>Stock</th>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-600 font-sans">
        <thead className="bg-slate-50 font-semibold text-slate-700 uppercase tracking-wider text-xs border-b border-slate-200">
          <tr>
            {columnOrder.map((key) => columnConfig[key] && renderHeader(key))}
            {isAdmin && <th className="px-6 py-4 text-center">Status</th>}
            {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {products.map((product) => {
            const isPublished = publishedSettings[product.id] !== false;

            return (
              <tr
                key={product.id}
                className={`hover:bg-slate-50/50 transition-colors
                  ${!isPublished ? 'bg-slate-50/70 opacity-65 text-slate-400' : 'text-slate-700'}`}
              >
                {columnOrder.map((key) => columnConfig[key] && renderCell(product, key))}

                {isAdmin && (
                  <td className="px-6 py-3.5 text-center">
                    <button
                      onClick={() => onTogglePublish(product.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition-all focus:outline-none
                        ${isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      title={isPublished ? 'Hide Product' : 'Publish Product'}
                      type="button"
                    >
                      {isPublished ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>
                )}

                {isAdmin && (
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit Product"
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete Product"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';
