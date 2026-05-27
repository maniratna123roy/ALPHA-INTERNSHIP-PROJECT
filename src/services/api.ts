import axios from 'axios';
import { ProductsResponse, Product } from '../types';

const API_BASE_URL = 'https://dummyjson.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getProducts: async (limit: number = 100): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>(`/products?limit=${limit}`);
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[] | { slug: string; name: string }[]>('/products/categories');
    // dummyjson categories format might be array of strings or array of objects, handles both:
    if (Array.isArray(response.data)) {
      return response.data.map(item => (typeof item === 'string' ? item : item.slug));
    }
    return [];
  },
};
