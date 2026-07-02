import { create } from 'zustand';

// Estado global para notificaciones tipo toast
const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'success') => {
    const id = Date.now();
    set({ toasts: [...get().toasts, { id, message, type }] });
    // Elimina el toast automáticamente después de 3 segundos
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3000);
  },

  removeToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export default useToastStore;
