import api from './api';

// Autentica al usuario y retorna token + datos del usuario
export const loginUser = async ({ email, password }) => {
  const response = await api.post('/usuarios/login', { email, password });
  return response.data.data;
};
