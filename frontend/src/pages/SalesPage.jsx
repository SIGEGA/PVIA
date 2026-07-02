import { useState } from 'react';
import useSaleStore from '../store/saleStore';
import ProductSearch from '../features/sales/ProductSearch';
import SaleCart from '../features/sales/SaleCart';
import PaymentModal from '../features/sales/PaymentModal';
import ReceiptModal from '../features/sales/ReceiptModal';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import useToast from '../hooks/useToast';

// Pantalla principal del POS — búsqueda + carrito + cobro
const SalesPage = () => {
  const toast = useToast();
  const { items, addItem, subtotal, total, descuento, setDescuento, clearCart } = useSaleStore();
  const [payOpen, setPayOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const handleAddProduct = (product) => {
    addItem(product);
    toast.success(`${product.nombre} agregado al carrito`);
  };

  const handlePaymentSuccess = (sale) => {
    setLastSale(sale);
    setPayOpen(false);
    setReceiptOpen(true);
  };

  const handleNewSale = () => {
    setReceiptOpen(false);
    setLastSale(null);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0">
      {/* Panel izquierdo: buscador */}
      <div className="flex-1 p-6 overflow-y-auto border-r border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Nueva venta</h1>
        <ProductSearch onSelect={handleAddProduct} />

        <div className="mt-5">
          <SaleCart />
        </div>
      </div>

      {/* Panel derecho: resumen y acciones */}
      <div className="w-full lg:w-72 xl:w-80 bg-gray-50 p-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1">
          <h2 className="font-semibold text-gray-700 mb-4">Resumen</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Descuento */}
            <div className="flex items-center justify-between text-gray-600">
              <span>Descuento ($)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={descuento || ''}
                onChange={(e) => setDescuento(e.target.value)}
                className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-blue-700">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <Button
            onClick={() => setPayOpen(true)}
            disabled={items.length === 0}
            className="w-full"
            size="lg"
          >
            Cobrar {items.length > 0 && `(${items.length} productos)`}
          </Button>
          <Button
            variant="ghost"
            onClick={clearCart}
            disabled={items.length === 0}
            className="w-full"
          >
            Limpiar carrito
          </Button>
        </div>
      </div>

      {/* Modales */}
      <PaymentModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        sale={lastSale}
        onNewSale={handleNewSale}
      />
    </div>
  );
};

export default SalesPage;
