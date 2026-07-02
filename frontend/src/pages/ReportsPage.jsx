import { useEffect, useState } from 'react';
import { getDailySummary, getTopProducts, getInventoryValue } from '../services/reports.service';
import { formatCurrency } from '../utils/formatCurrency';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import useToast from '../hooks/useToast';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];

const StatCard = ({ title, value, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const ReportsPage = () => {
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [daily, setDaily] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDailySummary(today),
      getTopProducts({ limite: 5 }),
      getInventoryValue(),
    ])
      .then(([d, tp, iv]) => {
        setDaily(d);
        setTopProducts(tp || []);
        setInventoryValue(iv);
      })
      .catch(() => toast.error('Error al cargar reportes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Cargando reportes...</div>;

  const metodosData = daily?.por_metodo
    ? Object.entries(daily.por_metodo).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Reportes</h1>

      {/* Resumen del día */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen del día — {today}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total vendido" value={formatCurrency(daily?.total_ventas || 0)} />
          <StatCard title="Número de ventas" value={daily?.num_ventas || 0} sub="transacciones" />
          <StatCard title="Ticket promedio" value={formatCurrency(daily?.ticket_promedio || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Ventas por método de pago */}
        {metodosData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Ventas por método de pago</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={metodosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {metodosData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Productos más vendidos */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 productos más vendidos</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="total_vendido" fill="#2563eb" radius={[0, 4, 4, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Valor del inventario */}
      {inventoryValue && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Inventario valorizado</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Valor costo</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(inventoryValue.valor_costo || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Valor venta</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(inventoryValue.valor_venta || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Total productos</p>
              <p className="text-lg font-bold text-gray-900">{inventoryValue.total_productos || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
