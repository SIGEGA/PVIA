import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/products.service';

// Hook para cargar y filtrar el catálogo de productos
const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(params);
      setProducts(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export default useProducts;
