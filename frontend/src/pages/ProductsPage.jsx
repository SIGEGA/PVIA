import { useState } from 'react';
import ProductList from '../features/products/ProductList';
import Modal from '../components/ui/Modal';
import ProductForm from '../features/products/ProductForm';
import Button from '../components/ui/Button';
import useProducts from '../hooks/useProducts';

const ProductsPage = () => {
  const { products, loading, refetch } = useProducts();
  const [newModal, setNewModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Catálogo de productos</h1>
        <Button onClick={() => setNewModal(true)}>+ Nuevo producto</Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando productos...</p>
      ) : (
        <ProductList products={products} onRefetch={refetch} />
      )}

      <Modal
        isOpen={newModal}
        onClose={() => setNewModal(false)}
        title="Nuevo producto"
      >
        <ProductForm
          onSuccess={() => { setNewModal(false); refetch(); }}
          onCancel={() => setNewModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
