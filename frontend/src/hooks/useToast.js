import useToastStore from '../store/toastStore';

// Hook para mostrar notificaciones desde cualquier componente
const useToast = () => {
  const { addToast } = useToastStore();

  return {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
  };
};

export default useToast;
