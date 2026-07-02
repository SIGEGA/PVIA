import api from './api';

// Retorna el historial de ventas con filtros opcionales
export const getSales = async (params = {}) => {
  const response = await api.get('/ventas', { params });
  return response.data.data;
};

// Retorna el detalle de una venta
export const getSaleById = async (id) => {
  const response = await api.get(`/ventas/${id}`);
  return response.data.data;
};

// Crea una nueva venta con el carrito completo
export const createSale = async (saleData) => {
  const response = await api.post('/ventas', saleData);
  return response.data.data;
};

// Cancela una venta (solo del mismo día)
export const cancelSale = async (id, motivo) => {
  const response = await api.patch(`/ventas/${id}/cancel`, { motivo });
  return response.data.data;
};
