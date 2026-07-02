import api from './api';

// Retorna todos los productos con filtros opcionales
export const getProducts = async (params = {}) => {
  const response = await api.get('/productos', { params });
  return response.data.data;
};

// Retorna un producto por su ID
export const getProductById = async (id) => {
  const response = await api.get(`/productos/${id}`);
  return response.data.data;
};

// Busca producto por código de barras
export const getProductByCode = async (codigo) => {
  const response = await api.get(`/productos/codigo/${codigo}`);
  return response.data.data;
};

// Crea un nuevo producto
export const createProduct = async (data) => {
  const response = await api.post('/productos', data);
  return response.data.data;
};

// Actualiza un producto existente
export const updateProduct = async (id, data) => {
  const response = await api.put(`/productos/${id}`, data);
  return response.data.data;
};

// Elimina un producto
export const deleteProduct = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};
