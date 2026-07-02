import api from './api';

export const getSuppliers = () =>
  api.get('/catalogos/proveedores').then((r) => r.data.data);

export const createProveedor = (data) =>
  api.post('/catalogos/proveedores', data).then((r) => r.data.data);

export const updateProveedor = (id, data) =>
  api.put(`/catalogos/proveedores/${id}`, data).then((r) => r.data.data);

export const deleteProveedor = (id) =>
  api.delete(`/catalogos/proveedores/${id}`).then((r) => r.data.data);
