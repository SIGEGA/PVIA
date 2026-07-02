import api from './api';

export const getDailySummary = (fecha) =>
  api.get('/reportes/resumen-diario', { params: { fecha } }).then((r) => r.data.data);

export const getSalesByPeriod = (params) =>
  api.get('/reportes/ventas-periodo', { params }).then((r) => r.data.data);

export const getTopProducts = (params) =>
  api.get('/reportes/productos-mas-vendidos', { params }).then((r) => r.data.data);

export const getInventoryValue = () =>
  api.get('/reportes/inventario-valorizado').then((r) => r.data.data);
