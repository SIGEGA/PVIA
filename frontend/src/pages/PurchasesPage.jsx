import { useEffect, useState } from 'react';
import { getPurchases, createPurchase, cancelPurchase } from '../services/purchases.service';
import { getProducts } from '../services/products.service';
import { getSuppliers } from '../services/catalog.service';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import useToast from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';

const PurchasesPage = () => {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([{ id_producto: '', cantidad: 1, precio_unitario: 0 }]);
  const [notas, setNotas] = useState('');
  const [idProveedor, setIdProveedor] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getPurchases(), getProducts(), getSuppliers()])
      .then(([p, prods, sups]) => { setPurchases(p || []); setProducts(prods || []); setSuppliers(sups || []); })
      .catch(() => toast.error('Error al cargar compras'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addItem = () => setItems([...items, { id_producto: '', cantidad: 1, precio_unitario: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => setItems(items.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const totalCompra = items.reduce((s, i) => s + parseFloat(i.cantidad || 0) * parseFloat(i.precio_unitario || 0), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!idProveedor) { toast.error('Selecciona un proveedor'); return; }
    if (items.some((i) => !i.id_producto)) { toast.error('Selecciona un producto en cada fila'); return; }
    setSaving(true);
    try {
      await createPurchase({ id_proveedor: idProveedor, notas, items });
      toast.success('Compra registrada correctamente');
      setModalOpen(false);
      setItems([{ id_producto: '', cantidad: 1, precio_unitario: 0 }]);
      setNotas('');
      setIdProveedor('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar la compra');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id, folio) => {
    if (!window.confirm(`¿Cancelar compra ${folio}?`)) return;
    try {
      await cancelPurchase(id);
      toast.success('Compra cancelada');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cancelar');
    }
  };

  const columns = [
    { key: 'folio', label: 'Folio' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'proveedores', label: 'Proveedor', render: (v) => v?.nombre || '—' },
    { key: 'total', label: 'Total', render: (v) => formatCurrency(v) },
    { key: 'estado', label: 'Estado', render: (v) => <Badge variant={v === 'recibida' ? 'success' : 'danger'}>{v}</Badge> },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Compras</h1>
        <Button onClick={() => setModalOpen(true)}>+ Nueva compra</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {loading ? <p className="text-gray-400 text-sm">Cargando...</p> : (
          <DataTable
            columns={columns}
            data={purchases}
            emptyMessage="Sin compras registradas"
            actions={(row) => row.estado !== 'cancelada' && (
              <Button size="sm" variant="danger" onClick={() => handleCancel(row.id, row.folio)}>
                Cancelar
              </Button>
            )}
          />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva compra" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Proveedor <span className="text-red-500">*</span></label>
            <select required value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500">
              <option value="">Seleccionar proveedor...</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notas (opcional)</label>
            <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones de la compra"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Productos</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select required value={item.id_producto} onChange={(e) => updateItem(i, 'id_producto', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
                  </select>
                  <input type="number" min="1" value={item.cantidad} placeholder="Cant."
                    onChange={(e) => updateItem(i, 'cantidad', e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" min="0" step="0.01" value={item.precio_unitario} placeholder="Precio"
                    onChange={(e) => updateItem(i, 'precio_unitario', e.target.value)}
                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-sm text-blue-600 hover:underline">
              + Agregar producto
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex justify-between text-sm font-medium">
            <span>Total estimado</span>
            <span className="text-blue-700">{formatCurrency(totalCompra)}</span>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">Registrar compra</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasesPage;
