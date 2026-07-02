import useToastStore from '../../store/toastStore';

// Colores y íconos por tipo de notificación
const styles = {
  success: {
    container: 'bg-green-50 border-green-400 text-green-800',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 13l4 4L19 7" />
    ),
    iconColor: 'text-green-500',
  },
  error: {
    container: 'bg-red-50 border-red-400 text-red-800',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 18L18 6M6 6l12 12" />
    ),
    iconColor: 'text-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    ),
    iconColor: 'text-yellow-500',
  },
};

// Contenedor global de toasts — se monta en App.jsx
const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const s = styles[toast.type] || styles.success;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-md animate-fade-in ${s.container}`}
          >
            <svg className={`w-5 h-5 mt-0.5 shrink-0 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {s.icon}
            </svg>
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
