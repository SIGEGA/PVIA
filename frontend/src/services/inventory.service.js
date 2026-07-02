import api from './api';

export const getMovements = (params = {}) =>
  api.get('/inventario/movements', { params }).then((r) => r.data.data);

export const getLowStock = () =>
  api.get('/inventario/low-stock').then((r) => r.data.data);

export const createMovement = (data) =>
  api.post('/inventario/movements', data).then((r) => r.data.data);
