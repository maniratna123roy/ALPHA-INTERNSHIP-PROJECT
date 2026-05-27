import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, ColumnConfig, ToastMessage, Product, DashboardWidget } from '../types';

interface AppState {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;

  products: Product[];
  setProducts: (products: Product[]) => void;
  createProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;

  publishedSettings: Record<number, boolean>;
  togglePublish: (productId: number) => void;

  columnConfig: ColumnConfig;
  columnOrder: (keyof ColumnConfig)[];
  toggleColumn: (column: keyof ColumnConfig) => void;
  reorderColumn: (currentIndex: number, direction: 'up' | 'down') => void;

  dashboardLayout: DashboardWidget[];
  reorderWidget: (currentIndex: number, direction: 'up' | 'down') => void;
  toggleWidgetVisibility: (id: string) => void;

  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      role: null,
      login: (role) => set({ isAuthenticated: true, role }),
      logout: () => set({ isAuthenticated: false, role: null }),

      products: [],
      setProducts: (products) => set({ products }),
      createProduct: (newProduct) =>
        set((state) => {
          const maxId = state.products.reduce((max, p) => Math.max(max, p.id), 0);
          const product: Product = {
            ...newProduct,
            id: maxId + 1,
          };
          return {
            products: [product, ...state.products],
          };
        }),
      updateProduct: (id, updatedFields) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      publishedSettings: {},
      togglePublish: (productId) =>
        set((state) => {
          const current = state.publishedSettings[productId] !== false;
          return {
            publishedSettings: {
              ...state.publishedSettings,
              [productId]: !current,
            },
          };
        }),

      columnConfig: {
        image: true,
        name: true,
        category: true,
        price: true,
        rating: true,
        stock: true,
      },
      columnOrder: ['image', 'name', 'category', 'price', 'rating', 'stock'],
      toggleColumn: (column) =>
        set((state) => ({
          columnConfig: {
            ...state.columnConfig,
            [column]: !state.columnConfig[column],
          },
        })),
      reorderColumn: (currentIndex, direction) =>
        set((state) => {
          const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (nextIndex < 0 || nextIndex >= state.columnOrder.length) return {};
          
          const newOrder = [...state.columnOrder];
          const [moved] = newOrder.splice(currentIndex, 1);
          newOrder.splice(nextIndex, 0, moved);

          return { columnOrder: newOrder };
        }),

      dashboardLayout: [
        { id: 'welcome', visible: true, label: 'Welcome Banner' },
        { id: 'metrics', visible: true, label: 'Catalog Metrics' },
        { id: 'quickLinks', visible: true, label: 'Quick Navigation' },
        { id: 'liveFeed', visible: true, label: 'Live Update Log' },
      ],
      reorderWidget: (currentIndex, direction) =>
        set((state) => {
          const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (nextIndex < 0 || nextIndex >= state.dashboardLayout.length) return {};

          const newLayout = [...state.dashboardLayout];
          const [moved] = newLayout.splice(currentIndex, 1);
          newLayout.splice(nextIndex, 0, moved);

          return { dashboardLayout: newLayout };
        }),
      toggleWidgetVisibility: (id) =>
        set((state) => ({
          dashboardLayout: state.dashboardLayout.map((widget) =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget
          ),
        })),

      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        publishedSettings: state.publishedSettings,
        columnConfig: state.columnConfig,
        columnOrder: state.columnOrder,
        dashboardLayout: state.dashboardLayout,
        products: state.products,
      }),
    }
  )
);
