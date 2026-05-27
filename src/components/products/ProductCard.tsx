import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Star, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isPublished: boolean;
  onTogglePublish: (id: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isPublished,
  onTogglePublish,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', classes: 'bg-red-50 text-red-700 border-red-200' };
    if (stock < 10) return { label: `Low Stock (${stock})`, classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'In Stock', classes: 'bg-green-50 text-green-700 border-green-200' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className={`relative flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden transition-all duration-200
      ${!isPublished ? 'opacity-65 border-dashed border-slate-300' : 'border-slate-200'}`}>
      
      <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-400 text-xs font-medium">No Image</div>
        )}

        <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
          {product.category.replace('-', ' ')}
        </span>

        {isAdmin && (
          <button
            onClick={() => onTogglePublish(product.id)}
            className={`absolute right-2 top-2 rounded p-1.5 shadow-sm backdrop-blur-sm transition-all focus:outline-none
              ${isPublished 
                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                : 'bg-rose-500/90 text-white hover:bg-rose-600'
              }`}
            title={isPublished ? 'Published: Click to Hide' : 'Hidden: Click to Publish'}
            type="button"
          >
            {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-2.5">
        <div className="flex-1">
          <Link
            to={`/products/${product.id}`}
            className="font-bold text-slate-800 hover:text-indigo-600 text-sm line-clamp-1 block transition-colors"
          >
            {product.title}
          </Link>
          <div className="flex items-center gap-1 mt-1 text-slate-500">
            <span className="text-xs">{product.brand || 'Generic'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
          <div className="text-base font-extrabold text-indigo-950">${product.price.toFixed(2)}</div>
          
          <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>{product.rating.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${stockStatus.classes}`}>
            {stockStatus.label}
          </span>

          <Link
            to={`/products/${product.id}`}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Details &rarr;
          </Link>
        </div>

        {/* Admin CRUD Actions Footer on Cards */}
        {isAdmin && (
          <div className="flex border-t border-slate-100 mt-2 pt-2.5 justify-end gap-1.5">
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
              title="Edit Product"
              type="button"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 hover:bg-red-100"
              title="Delete Product"
              type="button"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
