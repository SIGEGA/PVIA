import api from './api';

// Retorna todas las categorías activas
export const getCategories = async () => {
  const response = await api.get('/catalogos/categorias');
  return response.data.data;
};

// Retorna todos los proveedores activos
export const getSuppliers = async () => {
  const response = await api.get('/catalogos/proveedores');
  return response.data.data;
};

// Retorna todos los clientes activos
export const getClients = async () => {
  const response = await api.get('/catalogos/clientes');
  return response.data.data;
};
