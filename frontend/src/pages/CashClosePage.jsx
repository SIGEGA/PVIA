import { useState } from 'react';
import CashCloseForm from '../features/cashclose/CashCloseForm';
import CashCloseHistory from '../features/cashclose/CashCloseHistory';

const CashClosePage = () => {
  const [tab, setTab] = useState('nuevo');
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    // Recarga el historial al confirmar cierre
    setKey((k) => k + 1);
    setTab('historial');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Corte de caja</h1>

      {/* Pestañas */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'nuevo', label: 'Nuevo cierre' },
          { id: 'historial', label: 'Historial' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === id ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {tab === 'nuevo' && <CashCloseForm onSuccess={handleSuccess} />}
        {tab === 'historial' && <CashCloseHistory key={key} />}
      </div>
    </div>
  );
};

export default CashClosePage;
