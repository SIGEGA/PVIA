import { useEffect, useState } from 'react';
import { getSuppliers, createProveedor, updateProveedor, deleteProveedor } from '../services/suppliers.service';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import useToast from '../hooks/useToast';

const EMPTY_FORM = { nombre: '', telefono: '', email: '', direccion: '', contacto: '' };

const SuppliersPage = () => {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, supplier: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, supplier: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    getSuppliers()
      .then((data) => setSuppliers(data || []))
      .catch(() => toast.error('Error al cargar proveedores'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormModal({ open: true, supplier: null });
  };

  const openEdit = (supplier) => {
    setForm({
      nombre:    supplier.nombre    || '',
      telefono:  supplier.telefono  || '',
      email:     supplier.email     || '',
      direccion: supplier.direccion || '',
      contacto:  supplier.contacto  || '',
    });
    setFormModal({ open: true, supplier });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      if (formModal.supplier) {
        await updateProveedor(formModal.supplier.id, form);
        toast.success('Proveedor actualizado');
      } else {
        await createProveedor(form);
        toast.success('Proveedor registrado');
      }
      setFormModal({ open: false, supplier: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProveedor(deleteModal.supplier.id);
      toast.success('Proveedor eliminado');
      setDeleteModal({ open: false, supplier: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'nombre',    label: 'Nombre' },
    { key: 'contacto',  label: 'Contacto',  render: (v) => v || '—' },
    { key: 'telefono',  label: 'Teléfono',  render: (v) => v || '—' },
    { key: 'email',     label: 'Correo',    render: (v) => v || '—' },
    { key: 'direccion', label: 'Dirección', render: (v) => v || '—' },
  ];

  const fieldClass = 'mt-1 w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Proveedores</h1>
          <p className="text-sm text-gray-400 mt-0.5">{suppliers.length} proveedor{suppliers.length !== 1 ? 'es' : ''} registrado{suppliers.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew}>+ Nuevo proveedor</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        {loading
          ? <p className="text-gray-400 text-sm p-5">Cargando...</p>
          : <DataTable
              columns={columns}
              data={suppliers}
              emptyMessage="Sin proveedores registrados"
              actions={(row) => (
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteModal({ open: true, supplier: row })}>Eliminar</Button>
                </div>
              )}
            />
        }
      </div>

      {/* Modal crear / editar */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, supplier: null })}
        title={formModal.supplier ? 'Editar proveedor' : 'Nuevo proveedor'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del proveedor" className={fieldClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Persona de contacto</label>
            <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              placeholder="Nombre del contacto" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="662 000 0000" className={fieldClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Correo</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="proveedor@ejemplo.com" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Dirección</label>
            <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, colonia, ciudad" className={fieldClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setFormModal({ open: false, supplier: null })} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {formModal.supplier ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar eliminación */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, supplier: null })}
        title="Eliminar proveedor"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          ¿Eliminar a <strong>{deleteModal.supplier?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, supplier: null })} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
            Sí, eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
