export type UserRole = 'admin' | 'user';

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ColumnConfig {
  image: boolean;
  name: boolean;
  category: boolean;
  price: boolean;
  rating: boolean;
  stock: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface DashboardWidget {
  id: string;
  visible: boolean;
  label: string;
}
