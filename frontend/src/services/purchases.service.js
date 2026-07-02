import api from './api';

export const getPurchases = (params = {}) =>
  api.get('/compras', { params }).then((r) => r.data.data);

export const getPurchaseById = (id) =>
  api.get(`/compras/${id}`).then((r) => r.data.data);

export const createPurchase = (data) =>
  api.post('/compras', data).then((r) => r.data.data);

export const cancelPurchase = (id) =>
  api.patch(`/compras/${id}/cancelar`).then((r) => r.data.data);
