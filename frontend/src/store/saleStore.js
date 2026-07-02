import { create } from 'zustand';

// Recalcula subtotal y total al modificar items o descuento
const recalculate = (items, descuento) => {
  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.precio_venta) * parseFloat(i.cantidad),
    0
  );
  const total = Math.max(0, subtotal - parseFloat(descuento || 0));
  return { subtotal, total };
};

// Estado global del carrito de venta activo
const useSaleStore = create((set, get) => ({
  items: [],
  metodoPago: 'efectivo',
  montoPagado: 0,
  descuento: 0,
  subtotal: 0,
  total: 0,

  addItem: (product, cantidad = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.id === product.id);
    const newItems = existing
      ? items.map((i) =>
          i.id === product.id
            ? { ...i, cantidad: parseFloat(i.cantidad) + parseFloat(cantidad) }
            : i
        )
      : [...items, { ...product, cantidad: parseFloat(cantidad) }];
    set({ items: newItems, ...recalculate(newItems, get().descuento) });
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.id !== productId);
    set({ items: newItems, ...recalculate(newItems, get().descuento) });
  },

  updateQuantity: (productId, cantidad) => {
    const qty = parseFloat(cantidad);
    if (isNaN(qty) || qty <= 0) return;
    const newItems = get().items.map((i) =>
      i.id === productId ? { ...i, cantidad: qty } : i
    );
    set({ items: newItems, ...recalculate(newItems, get().descuento) });
  },

  setDescuento: (d) => {
    const descuento = parseFloat(d) || 0;
    set({ descuento, ...recalculate(get().items, descuento) });
  },

  setMetodoPago: (m) => set({ metodoPago: m }),

  setMontoPagado: (m) => set({ montoPagado: parseFloat(m) || 0 }),

  clearCart: () =>
    set({
      items: [],
      descuento: 0,
      montoPagado: 0,
      metodoPago: 'efectivo',
      subtotal: 0,
      total: 0,
    }),
}));

export default useSaleStore;
