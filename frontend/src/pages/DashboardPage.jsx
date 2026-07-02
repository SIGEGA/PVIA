import { useEffect, useState } from 'react';
import { getSales } from '../services/sales.service';
import { getProducts } from '../services/products.service';
import { formatCurrency } from '../utils/formatCurrency';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const CARDS = [
  {
    key: 'totalHoy',
    title: 'Ventas hoy',
    format: (v) => formatCurrency(v || 0),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    key: 'numVentasHoy',
    title: 'Transacciones hoy',
    format: (v) => v || 0,
    sub: 'ventas del día',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    accent: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
  {
    key: 'totalProductos',
    title: 'Productos',
    format: (v) => v || 0,
    sub: 'en catálogo',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    accent: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  {
    key: 'stockBajo',
    title: 'Stock bajo',
    format: (v) => v || 0,
    sub: 'requieren reabastecimiento',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    accent: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    alertText: (v) => v > 0 ? 'text-red-600' : 'text-emerald-600',
  },
];

const StatCard = ({ card, stats }) => {
  const value = stats?.[card.key];
  const displayText = card.alertText ? card.alertText(value) : card.text;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white shadow-sm`}>
          {card.icon}
        </div>
        {card.key === 'stockBajo' && value > 0 && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
            Atención
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.title}</p>
      <p className={`text-3xl font-bold mt-1 tracking-tight ${displayText}`}>
        {card.format(value)}
      </p>
      {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs text-gray-500 font-medium mb-1 capitalize">{label}</p>
      <p className="text-base font-bold text-blue-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sales, products] = await Promise.all([getSales(), getProducts()]);
        const today = new Date().toISOString().split('T')[0];
        const ventasHoy = (sales || []).filter((v) => v.fecha?.startsWith(today));
        const totalHoy = ventasHoy.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
        const stockBajo = (products || []).filter((p) => parseFloat(p.stock_actual) < 5);

        const map = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          map[key] = { dia: d.toLocaleDateString('es-MX', { weekday: 'short' }), total: 0 };
        }
        (sales || []).forEach((v) => {
          const key = v.fecha?.split('T')[0];
          if (map[key]) map[key].total += parseFloat(v.total || 0);
        });

        setStats({
          totalHoy,
          numVentasHoy: ventasHoy.length,
          totalProductos: products?.length || 0,
          stockBajo: stockBajo.length,
          chart: Object.values(map),
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div className="p-6 flex items-center gap-3 text-gray-400">
      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Cargando panel...
    </div>
  );

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Panel de control</h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => <StatCard key={card.key} card={card} stats={stats} />)}
      </div>

      {/* Gráfica de ventas */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Ventas de la semana</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 7 días</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats?.chart || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eff6ff' }} />
            <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
