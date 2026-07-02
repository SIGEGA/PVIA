import api from './api';

// Retorna la vista previa del cierre de caja para una fecha
export const getCashClosePreview = async (fecha) => {
  const response = await api.get(`/corte-caja/preview/${fecha}`);
  return response.data.data;
};

// Crea el cierre de caja del día
export const createCashClose = async (data) => {
  const response = await api.post('/corte-caja', data);
  return response.data.data;
};

// Retorna el historial de cierres de caja
export const getCashCloseHistory = async () => {
  const response = await api.get('/corte-caja');
  return response.data.data;
};
