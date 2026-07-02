import { useState } from 'react';
import { deleteProduct } from '../../services/products.service';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProductForm from './ProductForm';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';

const ProductList = ({ products, onRefetch }) => {
  const toast = useToast();
  const { hasRole } = useAuth();
  const [formModal, setFormModal] = useState({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteModal.product.id);
      toast.success('Producto eliminado');
      setDeleteModal({ open: false, product: null });
      onRefetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'precio_venta',
      label: 'Precio venta',
      render: (v) => formatCurrency(v),
    },
    {
      key: 'stock_actual',
      label: 'Stock',
      render: (v, row) => {
        const stock = parseFloat(v);
        const min = parseFloat(row.stock_minimo || 0);
        if (stock === 0) return <Badge variant="danger">Agotado</Badge>;
        if (stock <= min) return <span className="text-red-600 font-medium">⚠ {stock}</span>;
        return <span className="text-gray-700">{stock}</span>;
      },
    },
    {
      key: 'categorias',
      label: 'Categoría',
      render: (v) => v?.nombre || '—',
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        emptyMessage="No hay productos registrados"
        actions={(row) => (
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFormModal({ open: true, product: row })}
            >
              Editar
            </Button>
            {hasRole('administrador') && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setDeleteModal({ open: true, product: row })}
              >
                Eliminar
              </Button>
            )}
          </div>
        )}
      />

      {/* Modal de formulario crear/editar */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, product: null })}
        title={formModal.product ? 'Editar producto' : 'Nuevo producto'}
      >
        <ProductForm
          product={formModal.product}
          onSuccess={() => {
            setFormModal({ open: false, product: null });
            onRefetch();
          }}
          onCancel={() => setFormModal({ open: false, product: null })}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        title="Confirmar eliminación"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          ¿Seguro que deseas eliminar{' '}
          <strong>{deleteModal.product?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ open: false, product: null })}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleting}
            className="flex-1"
          >
            Sí, eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ProductList;
