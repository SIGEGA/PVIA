/**
 * Pruebas: servicio de ventas
 *   - Stock insuficiente al vender
 *   - Cálculo de totales (subtotal, impuestos 16%, total, cambio)
 */

// Mockeamos el cliente Supabase ANTES de importar el servicio
jest.mock('../src/config/supabase', () => ({ from: jest.fn() }));

const supabase = require('../src/config/supabase');
const { create } = require('../src/services/sale-service');

// ------------------------------------------------------------------
// Helper: construye un objeto encadenado que imita la API de Supabase
// Cada método devuelve `this` (fluent) y `.single()` resuelve el valor.
// El objeto también es "thenable" para soportar `await chain.insert(...)`.
// ------------------------------------------------------------------
function makeChain(resolved = { data: null, error: null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    neq:    jest.fn().mockReturnThis(),
    gte:    jest.fn().mockReturnThis(),
    lte:    jest.fn().mockReturnThis(),
    order:  jest.fn().mockReturnThis(),
    limit:  jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    // Permite `await chain` directamente (e.g. `await supabase.from().insert()`)
    then: (onFulfilled, onRejected) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
  };
  return chain;
}

// ------------------------------------------------------------------
// Suite: stock insuficiente
// ------------------------------------------------------------------
describe('create() — stock insuficiente', () => {
  const item = { id_producto: 3, cantidad: 10, precio_unitario: 100, descuento: 0 };

  test('lanza error 409 cuando la cantidad supera el stock disponible', async () => {
    // El producto tiene stock_actual: 5, pero se intenta vender 10
    supabase.from.mockReturnValue(
      makeChain({ data: { stock_actual: 5, nombre: 'Fresas Frescas 500g' }, error: null })
    );

    await expect(create({ items: [item] }))
      .rejects
      .toThrow('Stock insuficiente');
  });

  test('el error incluye el nombre del producto y el stock disponible', async () => {
    supabase.from.mockReturnValue(
      makeChain({ data: { stock_actual: 3, nombre: 'Manzana Roja' }, error: null })
    );

    await expect(create({ items: [item] }))
      .rejects
      .toThrow('Manzana Roja');
  });

  test('lanza error 404 cuando el producto no existe en la base de datos', async () => {
    // Supabase devuelve null cuando el producto no existe
    supabase.from.mockReturnValue(
      makeChain({ data: null, error: { code: 'PGRST116', message: 'No rows' } })
    );

    await expect(create({ items: [item] }))
      .rejects
      .toThrow(/no encontrado/i);
  });
});

// ------------------------------------------------------------------
// Suite: cálculo de totales
// ------------------------------------------------------------------
describe('create() — cálculo de totales', () => {
  // Captura el chain de ventas para inspeccionar qué se insertó
  let ventasChain;

  beforeEach(() => {
    ventasChain = makeChain({ data: { id: 99, folio: 'VTA-260702-0001' }, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'productos')          return makeChain({ data: { stock_actual: 50, nombre: 'Producto Test' }, error: null });
      if (table === 'ventas')             return ventasChain;
      if (table === 'detalle_venta')      return makeChain({ data: null, error: null });
      if (table === 'movimiento_inventario') return makeChain({ data: null, error: null });
      return makeChain({ data: null, error: null });
    });
  });

  test('calcula subtotal sin descuento correctamente', async () => {
    const items = [{ id_producto: 1, cantidad: 2, precio_unitario: 50, descuento: 0 }];
    // subtotal = 2 × 50 = 100

    await create({ items, metodo_pago: 'efectivo', monto_pagado: 200 });

    expect(ventasChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 100 })
    );
  });

  test('aplica IVA del 16% sobre la base (subtotal − descuento_global)', async () => {
    const items = [{ id_producto: 1, cantidad: 1, precio_unitario: 100, descuento: 0 }];
    // base = 100, impuestos = 100 × 0.16 = 16, total = 116

    await create({ items, descuento_global: 0, metodo_pago: 'efectivo', monto_pagado: 200 });

    expect(ventasChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ impuestos: 16, total: 116 })
    );
  });

  test('descuento global reduce la base antes del IVA', async () => {
    const items = [{ id_producto: 1, cantidad: 1, precio_unitario: 200, descuento: 0 }];
    // subtotal = 200, descuento_global = 50, base = 150
    // impuestos = 150 × 0.16 = 24, total = 174

    await create({ items, descuento_global: 50, metodo_pago: 'efectivo', monto_pagado: 200 });

    expect(ventasChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ descuento: 50, impuestos: 24, total: 174 })
    );
  });

  test('calcula el cambio correctamente cuando el monto pagado supera el total', async () => {
    const items = [{ id_producto: 1, cantidad: 1, precio_unitario: 100, descuento: 0 }];
    // total = 116, monto_pagado = 200, cambio = 84

    await create({ items, metodo_pago: 'efectivo', monto_pagado: 200 });

    expect(ventasChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ cambio: 84 })
    );
  });

  test('cambio es 0 cuando el método de pago no es efectivo', async () => {
    const items = [{ id_producto: 1, cantidad: 1, precio_unitario: 100, descuento: 0 }];
    // monto_pagado = total → cambio = 0

    await create({ items, metodo_pago: 'tarjeta', monto_pagado: 116 });

    expect(ventasChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ cambio: 0 })
    );
  });
});
