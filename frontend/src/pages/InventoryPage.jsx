import { useEffect, useState } from 'react';
import { getMovements, getLowStock, createMovement } from '../services/inventory.service';
import { getProducts } from '../services/products.service';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import useToast from '../hooks/useToast';
import { formatDateTime } from '../utils/formatDate';

const TIPOS = ['entrada', 'salida', 'ajuste'];

const InventoryPage = () => {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('movimientos');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id_producto: '', tipo: 'entrada', cantidad: '', motivo: '' });

  const load = () => {
    setLoading(true);
    Promise.all([getMovements(), getLowStock(), getProducts()])
      .then(([m, ls, p]) => { setMovements(m || []); setLowStock(ls || []); setProducts(p || []); })
      .catch(() => toast.error('Error al cargar inventario'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMovement = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMovement({
        id_producto: form.id_producto,
        tipo: form.tipo,
        cantidad: parseFloat(form.cantidad),
        motivo: form.motivo,
      });
      toast.success('Movimiento registrado');
      setModalOpen(false);
      setForm({ id_producto: '', tipo: 'entrada', cantidad: '', motivo: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar movimiento');
    } finally {
      setSaving(false);
    }
  };

  const movCols = [
    { key: 'fecha', label: 'Fecha', render: (v) => v ? formatDateTime(v) : '—' },
    {
      key: 'productos',
      label: 'Producto',
      render: (v) => v ? `${v.codigo} — ${v.nombre}` : '—',
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (v) => (
        <Badge variant={v === 'entrada' ? 'success' : v === 'salida' ? 'danger' : 'warning'}>
          {v}
        </Badge>
      ),
    },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'referencia', label: 'Referencia', render: (v) => v || '—' },
  ];

  const lowCols = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Producto' },
    { key: 'stock_actual', label: 'Stock actual', render: (v) => <span className="text-red-600 font-bold">{v}</span> },
    { key: 'stock_minimo', label: 'Stock mínimo' },
    { key: 'categorias', label: 'Categoría', render: (v) => v?.nombre || '—' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Inventario</h1>
        <Button onClick={() => setModalOpen(true)}>+ Registrar movimiento</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
          ⚠ <strong>{lowStock.length} producto(s)</strong> con stock bajo o agotado.
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[{ id: 'movimientos', label: 'Movimientos' }, { id: 'stock-bajo', label: `Stock bajo (${lowStock.length})` }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === id ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {loading ? <p className="text-gray-400 text-sm">Cargando...</p> : (
          tab === 'movimientos'
            ? <DataTable columns={movCols} data={movements} emptyMessage="Sin movimientos registrados" />
            : <DataTable columns={lowCols} data={lowStock} emptyMessage="Todos los productos tienen stock suficiente" />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar movimiento" size="sm">
        <form onSubmit={handleMovement} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Producto</label>
            <select required value={form.id_producto} onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar producto...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Cantidad</label>
            <input required type="number" min="0.01" step="0.01" value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Motivo</label>
            <input required type="text" value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              placeholder="Ej: Ajuste de inventario físico"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
