import useSaleStore from '../../store/saleStore';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

// Tabla del carrito de venta con cantidades editables
const SaleCart = () => {
  const { items, removeItem, updateQuantity } = useSaleStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <span className="text-4xl mb-2">🛒</span>
        <p className="text-sm">Agrega productos para iniciar la venta</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-1 text-gray-500 font-medium">Producto</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium w-24">Cantidad</th>
            <th className="text-right py-2 px-1 text-gray-500 font-medium">Precio</th>
            <th className="text-right py-2 px-1 text-gray-500 font-medium">Subtotal</th>
            <th className="py-2 px-1 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2 px-1">
                <p className="font-medium text-gray-900">{item.nombre}</p>
                <p className="text-xs text-gray-400">{item.codigo}</p>
              </td>
              <td className="py-2 px-1 text-center">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.cantidad}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                  className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="py-2 px-1 text-right text-gray-600">
                {formatCurrency(item.precio_venta)}
              </td>
              <td className="py-2 px-1 text-right font-medium text-gray-900">
                {formatCurrency(parseFloat(item.precio_venta) * parseFloat(item.cantidad))}
              </td>
              <td className="py-2 px-1">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SaleCart;
