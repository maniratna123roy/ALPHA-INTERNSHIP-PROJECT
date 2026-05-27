import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useRealTimeUpdates() {
  const products = useAppStore((state) => state.products);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const addToast = useAppStore((state) => state.addToast);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      const currentProducts = useAppStore.getState().products;
      if (currentProducts.length === 0) return;

      const randomIndex = Math.floor(Math.random() * currentProducts.length);
      const product = currentProducts[randomIndex];

      const newPrice = Math.max(1, Math.round(product.price * (1 + (Math.random() * 10 - 5) / 100) * 100) / 100);
      const newStock = Math.max(0, product.stock + Math.floor(Math.random() * 7) - 3);
      const newRating = Math.max(1, Math.min(5, Math.round((product.rating + (Math.random() * 0.2 - 0.1)) * 100) / 100));

      updateProduct(product.id, { price: newPrice, stock: newStock, rating: newRating });
      addToast(`Live update: "${product.title}" — Price: $${newPrice}, Stock: ${newStock}, Rating: ${newRating}`, 'info');
    }, 15000);

    return () => clearInterval(interval);
  }, [products.length, updateProduct, addToast]);
}
