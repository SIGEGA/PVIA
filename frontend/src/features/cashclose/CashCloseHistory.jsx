import { useEffect, useState } from 'react';
import { getCashCloseHistory } from '../../services/cashclose.service';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';

// Historial de cierres de caja anteriores
const CashCloseHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCashCloseHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'total_ventas', label: 'Total ventas', render: (v) => formatCurrency(v) },
    { key: 'efectivo_contado', label: 'Efectivo contado', render: (v) => formatCurrency(v) },
    {
      key: 'diferencia',
      label: 'Diferencia',
      render: (v) => {
        const diff = parseFloat(v);
        return (
          <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (v) => <Badge variant="success">{v || 'cerrado'}</Badge>,
    },
  ];

  if (loading) return <p className="text-gray-400 text-sm">Cargando historial...</p>;

  return (
    <DataTable
      columns={columns}
      data={history}
      emptyMessage="Sin cierres registrados"
    />
  );
};

export default CashCloseHistory;
