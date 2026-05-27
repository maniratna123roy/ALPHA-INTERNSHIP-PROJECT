import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Product } from '../types';
import { useAppStore } from '../store/useAppStore';
import { Star, ChevronLeft, ChevronRight, ArrowLeft, Eye, EyeOff, Package, Milestone } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const role = useAppStore((state) => state.role);
  const isAdmin = role === 'admin';
  const publishedSettings = useAppStore((state) => state.publishedSettings);
  const storeProduct = useAppStore((state) =>
    state.products.find((p) => p.id === productId)
  );
  const togglePublish = useAppStore((state) => state.togglePublish);
  const addToast = useAppStore((state) => state.addToast);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Fetch product detail
  useEffect(() => {
    if (isNaN(productId)) {
      setError('Invalid Product Identifier.');
      setLoading(false);
      return;
    }

    let active = true;
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await apiService.getProductById(productId);
        if (active) {
          setProduct(data);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch product details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  // Check if standard users are attempting to view hidden products
  const isPublished = publishedSettings[productId] !== false;
  useEffect(() => {
    if (!loading && product && !isPublished && !isAdmin) {
      addToast('Access denied: This product is currently hidden or unpublished.', 'error');
      navigate('/products', { replace: true });
    }
  }, [loading, product, isPublished, isAdmin, navigate, addToast]);

  // Overlay live values from store when product list polling has updated this item
  const mergedProduct = useMemo(() => {
    if (!product) return null;
    if (!storeProduct) return product;
    return {
      ...product,
      price: storeProduct.price,
      rating: storeProduct.rating,
      stock: storeProduct.stock,
    };
  }, [product, storeProduct]);

  const handlePrevImage = () => {
    if (!mergedProduct) return;
    setActiveImageIdx((prev) => (prev === 0 ? mergedProduct.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!mergedProduct) return;
    setActiveImageIdx((prev) => (prev === mergedProduct.images.length - 1 ? 0 : prev + 1));
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', classes: 'text-red-600 bg-red-50 border-red-200' };
    if (stock < 10) return { label: `Only ${stock} Left`, classes: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: `In Stock (${stock})`, classes: 'text-green-600 bg-green-50 border-green-200' };
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-4 border-t-indigo-600 border-slate-200 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading product particulars...</p>
      </div>
    );
  }

  if (error || !mergedProduct) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <h3 className="text-lg font-bold text-slate-900">Product Unavailable</h3>
        <p className="mt-2 text-sm text-slate-500">{error || 'The requested product data was not found.'}</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(mergedProduct.stock);
  const images = mergedProduct.images || [mergedProduct.thumbnail];

  return (
    <div className="space-y-6">
      {/* Top back actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to products list</span>
        </Link>

        {/* Admin Publish Settings Toggle */}
        {isAdmin && (
          <button
            onClick={() => togglePublish(mergedProduct.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition-all focus:outline-none
              ${isPublished
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            type="button"
          >
            {isPublished ? (
              <>
                <Eye className="h-4.5 w-4.5" />
                <span>Product is Published</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4.5 w-4.5" />
                <span>Product is Hidden</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Product specs container */}
      <div className="grid grid-cols-1 gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        {/* Left column - Image Carousel */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImageIdx]}
                alt={`${mergedProduct.title} - View ${activeImageIdx + 1}`}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <span className="text-slate-400 text-sm">No Images Available</span>
            )}

            {/* Slider navigations */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-md hover:bg-white focus:outline-none"
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-md hover:bg-white focus:outline-none"
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-14 w-14 rounded-md border bg-slate-50 p-1 overflow-hidden transition-all
                    ${activeImageIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-slate-400'}`}
                  type="button"
                >
                  <img src={img} alt="Thumbnail view" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Metadata */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and brand */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              <span>{mergedProduct.brand || 'Generic Brand'}</span>
              <span>&bull;</span>
              <span className="text-indigo-600">{mergedProduct.category.replace('-', ' ')}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              {mergedProduct.title}
            </h2>

            {/* Ratings row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm font-bold text-amber-700">
                <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                <span>{mergedProduct.rating.toFixed(2)}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Customer Rating</span>
            </div>

            {/* Price section */}
            <div className="border-y border-slate-100 py-4 flex items-baseline gap-4">
              <span className="text-3xl font-black text-slate-900">
                ${mergedProduct.price.toFixed(2)}
              </span>
              {mergedProduct.discountPercentage > 0 && (
                <>
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ${(mergedProduct.price * (1 + mergedProduct.discountPercentage / 100)).toFixed(2)}
                  </span>
                  <span className="rounded bg-red-50 border border-red-100 px-2 py-0.5 text-xs font-bold text-red-600 uppercase tracking-wide">
                    {mergedProduct.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {mergedProduct.description}
              </p>
            </div>
          </div>

          {/* Details footer specs */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            {/* Stock */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-500">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory</div>
                <div className={`text-xs font-bold border rounded px-1.5 py-0.5 mt-0.5 inline-block ${stockStatus.classes}`}>
                  {stockStatus.label}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-500">
                <Milestone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</div>
                <div className="text-xs font-bold text-slate-700 capitalize mt-0.5">
                  {mergedProduct.category.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
