import { useState } from 'react';
import { createSale } from '../../services/sales.service';
import useSaleStore from '../../store/saleStore';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import useToast from '../../hooks/useToast';

const METODOS = ['efectivo', 'tarjeta', 'transferencia'];

// Modal de cobro: selección de método de pago, cálculo de vuelto y confirmación
const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const {
    items, subtotal, total, descuento,
    metodoPago, setMetodoPago,
    montoPagado, setMontoPagado,
    clearCart,
  } = useSaleStore();

  const [loading, setLoading] = useState(false);

  const cambio = Math.max(0, montoPagado - total);
  const montoInsuficiente = metodoPago === 'efectivo' && montoPagado < total;

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const saleData = {
        metodo_pago: metodoPago,
        monto_pagado: metodoPago === 'efectivo' ? montoPagado : total,
        descuento_global: descuento,
        items: items.map((i) => ({
          id_producto: i.id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_venta,
          descuento: 0,
        })),
      };
      const result = await createSale(saleData);
      toast.success('Venta registrada exitosamente');
      clearCart();
      onSuccess(result);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar pago" size="sm">
      {/* Resumen del total */}
      <div className="bg-blue-50 rounded-xl p-4 mb-5">
        {descuento > 0 && (
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
        )}
        {descuento > 0 && (
          <div className="flex justify-between text-sm text-green-600 mb-1">
            <span>Descuento</span><span>- {formatCurrency(descuento)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-blue-700">
          <span>Total a cobrar</span><span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
        <div className="flex gap-2">
          {METODOS.map((m) => (
            <button
              key={m}
              onClick={() => setMetodoPago(m)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize
                ${metodoPago === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Monto recibido (solo efectivo) */}
      {metodoPago === 'efectivo' && (
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Monto recibido ($)</label>
          <input
            type="number"
            min={total}
            step="0.50"
            value={montoPagado || ''}
            onChange={(e) => setMontoPagado(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={total.toFixed(2)}
          />
          {montoInsuficiente && montoPagado > 0 && (
            <p className="text-xs text-red-600 mt-1">Monto insuficiente</p>
          )}
          {/* Vuelto */}
          {cambio > 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between">
              <span className="text-sm text-green-700 font-medium">Vuelto</span>
              <span className="text-lg font-bold text-green-700">{formatCurrency(cambio)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button
          onClick={handleConfirm}
          loading={loading}
          disabled={montoInsuficiente || items.length === 0}
          className="flex-1"
        >
          Confirmar pago
        </Button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
