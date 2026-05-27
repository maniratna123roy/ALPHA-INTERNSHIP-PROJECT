import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/api';
import { Product } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useUrlState } from '../hooks/useUrlState';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { SearchBar } from '../components/products/SearchBar';
import { FilterPanel } from '../components/products/FilterPanel';
import { SortDropdown } from '../components/products/SortDropdown';
import { ColumnSelector } from '../components/products/ColumnSelector';
import { Pagination } from '../components/products/Pagination';
import { ProductTable } from '../components/products/ProductTable';
import { ProductCard } from '../components/products/ProductCard';
import { AlertCircle, Loader, SlidersHorizontal, LayoutGrid, List, Plus, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ProductList: React.FC = () => {
  const isAdmin = useAppStore((state) => state.role === 'admin');
  const products = useAppStore((state) => state.products);
  const setProducts = useAppStore((state) => state.setProducts);
  const createProduct = useAppStore((state) => state.createProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  
  const publishedSettings = useAppStore((state) => state.publishedSettings);
  const togglePublish = useAppStore((state) => state.togglePublish);
  const addToast = useAppStore((state) => state.addToast);

  // States for fetching and modals
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    title: '',
    brand: '',
    category: '',
    price: 0,
    stock: 0,
    rating: 5,
    description: '',
    thumbnail: '',
  });

  // URL state synchronization
  const { filters, setFilters } = useUrlState();

  // Fetch products catalogue if empty (initialize store once)
  useEffect(() => {
    let active = true;

    async function loadData() {
      if (products.length > 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const productsData = await apiService.getProducts(100);
        if (active) {
          setProducts(productsData.products);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch products catalogue.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [products.length, setProducts]);

  // Extract categories dynamically from current store products list
  const categories = useMemo(() => {
    const cats = products.map((p) => p.category);
    return Array.from(new Set(cats)).sort();
  }, [products]);

  // Hook to simulate live product polling updates in the background (every 15s)
  useRealTimeUpdates();

  // Filter & sort logic (memoized)
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Role-based visibility
    if (!isAdmin) {
      result = result.filter((p) => publishedSettings[p.id] !== false);
    }

    // 2. Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(searchLower));
    }

    // 3. Multi-category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // 4. Sort logic
    if (filters.sortBy) {
      const field = filters.sortBy as 'price' | 'rating' | 'title';
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return 0;
      });
    }

    return result;
  }, [products, isAdmin, publishedSettings, filters.search, filters.categories, filters.sortBy, filters.sortOrder]);

  // Paginate list
  const paginatedProducts = useMemo(() => {
    const startIndex = (filters.page - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedProducts, filters.page]);

  // Callbacks for updating search, category and page parameters
  const handleSearchChange = useCallback((query: string) => {
    setFilters({ search: query, page: 1 });
  }, [setFilters]);

  const handleCategoryChange = useCallback((selectedCats: string[]) => {
    setFilters({ categories: selectedCats, page: 1 });
  }, [setFilters]);

  const handleSortChange = useCallback((sort: string, order: 'asc' | 'desc') => {
    setFilters({ sortBy: sort, sortOrder: order });
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const handleTogglePublish = useCallback((id: number) => {
    togglePublish(id);
  }, [togglePublish]);

  // Admin CRUD Modal Handlers
  const openCreateModal = () => {
    setFormFields({
      title: '',
      brand: '',
      category: categories[0] || 'smartphones',
      price: 19.99,
      stock: 50,
      rating: 4.5,
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
    });
    setModalType('create');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormFields({
      title: product.title,
      brand: product.brand || '',
      category: product.category,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      description: product.description,
      thumbnail: product.thumbnail || '',
    });
    setModalType('edit');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingProduct(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFields.title || !formFields.category) {
      addToast('Product name and category are required.', 'error');
      return;
    }

    if (modalType === 'create') {
      createProduct({
        ...formFields,
        images: [formFields.thumbnail],
        discountPercentage: 0,
      });
      addToast(`Product "${formFields.title}" created successfully!`, 'success');
    } else if (modalType === 'edit' && editingProduct) {
      updateProduct(editingProduct.id, {
        ...formFields,
        images: [formFields.thumbnail],
      });
      addToast(`Product "${formFields.title}" updated successfully!`, 'success');
    }

    handleCloseModal();
  };

  const handleDeleteProduct = useCallback((id: number) => {
    const productToDelete = products.find((p) => p.id === id);
    const confirmName = productToDelete ? `"${productToDelete.title}"` : 'this product';
    
    if (window.confirm(`Are you sure you want to delete ${confirmName}?`)) {
      deleteProduct(id);
      addToast('Product deleted successfully.', 'success');
    }
  }, [products, deleteProduct, addToast]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading catalog assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <div className="rounded-full bg-red-100 p-3.5 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Failed to Load Products</h3>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter, Action & Configuration Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBar value={filters.search} onChange={handleSearchChange} />

        <div className="flex flex-wrap items-center gap-3">
          {/* Create Product Button (Admin only) */}
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 text-sm font-semibold shadow-sm focus:outline-none"
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>Create Product</span>
            </button>
          )}

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 md:hidden hover:bg-slate-50"
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <SortDropdown
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onChange={handleSortChange}
          />

          <ColumnSelector />

          <div className="hidden sm:flex border border-slate-200 bg-white rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
              type="button"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
              type="button"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-start">
        {/* Sidebar Filters */}
        <div className={`md:block space-y-4 ${showMobileFilters ? 'block' : 'hidden'}`}>
          <FilterPanel
            categories={categories}
            selectedCategories={filters.categories}
            onChange={handleCategoryChange}
            onClear={() => handleCategoryChange([])}
          />
        </div>

        {/* Listings column */}
        <div className="md:col-span-3 space-y-5">
          {processedProducts.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <div className="hidden md:block">
                  <ProductTable
                    products={paginatedProducts}
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onSort={handleSortChange}
                    onTogglePublish={handleTogglePublish}
                    onEdit={openEditModal}
                    onDelete={handleDeleteProduct}
                    isAdmin={isAdmin}
                  />
                </div>
              ) : null}

              <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden'}>
                {paginatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isPublished={publishedSettings[p.id] !== false}
                    onTogglePublish={handleTogglePublish}
                    onEdit={openEditModal}
                    onDelete={handleDeleteProduct}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              <Pagination
                currentPage={filters.page}
                totalItems={processedProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="flex min-h-[30vh] flex-col items-center justify-center text-center rounded-lg border border-dashed border-slate-200 bg-white p-8">
              <p className="text-slate-400 text-sm font-semibold mb-2">No products found matching filters.</p>
              <p className="text-slate-400 text-xs">Try adjusting your search keywords, clear category selections, or reset active sorts.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal Popups */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="font-bold text-slate-800">
                {modalType === 'create' ? 'Create New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    value={formFields.title}
                    onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. iPhone 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    value={formFields.brand}
                    onChange={(e) => setFormFields({ ...formFields, brand: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Apple"
                  />
                </div>
              </div>

              {/* Category, Price, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value.toLowerCase() })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. smartphones"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formFields.price}
                    onChange={(e) => setFormFields({ ...formFields, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formFields.stock}
                    onChange={(e) => setFormFields({ ...formFields, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rating and Image URL */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={formFields.rating}
                    onChange={(e) => setFormFields({ ...formFields, rating: parseFloat(e.target.value) || 5 })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={formFields.thumbnail}
                    onChange={(e) => setFormFields({ ...formFields, thumbnail: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-slate-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter product description specs..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex border-t border-slate-100 pt-4 justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {modalType === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
