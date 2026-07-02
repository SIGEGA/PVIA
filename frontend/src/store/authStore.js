import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Estado global de autenticación — persiste en localStorage
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-pos' }
  )
);

export default useAuthStore;
