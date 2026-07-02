/**
 * Pruebas: servicio de corte de caja
 *   - preview() agrupa ventas por método de pago
 *   - create() lanza 409 si ya existe un corte para esa fecha
 *   - create() calcula la diferencia (efectivo_contado - efectivo_esperado)
 */

jest.mock('../src/config/supabase', () => ({ from: jest.fn() }));

const supabase = require('../src/config/supabase');
const { preview, create } = require('../src/services/cashclose-service');

// ------------------------------------------------------------------
// Helper: cadena fluent que resuelve el valor dado
// Soporta tanto `await chain.select().eq()` (thenable) como
// `await chain.insert().select().single()` (.single resuelve).
// ------------------------------------------------------------------
function makeChain(resolved = { data: null, error: null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    gte:    jest.fn().mockReturnThis(),
    lte:    jest.fn().mockReturnThis(),
    order:  jest.fn().mockReturnThis(),
    limit:  jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
  };
  return chain;
}

// Ventas de ejemplo con distintos métodos de pago
const VENTAS_SAMPLE = [
  { total: '300.00', metodo_pago: 'efectivo' },
  { total: '150.00', metodo_pago: 'efectivo' },
  { total: '200.00', metodo_pago: 'tarjeta' },
  { total: '100.00', metodo_pago: 'transferencia' },
];

// ------------------------------------------------------------------
// Suite: preview()
// ------------------------------------------------------------------
describe('preview() — agrupación por método de pago', () => {
  beforeEach(() => {
    supabase.from.mockReturnValue(
      makeChain({ data: VENTAS_SAMPLE, error: null })
    );
  });

  test('suma correctamente el total general de ventas del día', async () => {
    const result = await preview('2026-07-02');
    // 300 + 150 + 200 + 100 = 750
    expect(result.total_ventas).toBe(750);
  });

  test('acumula el efectivo esperado solo de ventas en efectivo', async () => {
    const result = await preview('2026-07-02');
    // 300 + 150 = 450
    expect(result.efectivo_esperado).toBe(450);
  });

  test('acumula correctamente las ventas con tarjeta', async () => {
    const result = await preview('2026-07-02');
    expect(result.total_tarjeta).toBe(200);
  });

  test('acumula correctamente las ventas por transferencia', async () => {
    const result = await preview('2026-07-02');
    expect(result.total_transferencia).toBe(100);
  });

  test('devuelve totales en 0 cuando no hay ventas en el día', async () => {
    supabase.from.mockReturnValue(makeChain({ data: [], error: null }));

    const result = await preview('2026-07-02');

    expect(result.total_ventas).toBe(0);
    expect(result.efectivo_esperado).toBe(0);
  });
});

// ------------------------------------------------------------------
// Suite: create() — validación de corte duplicado
// ------------------------------------------------------------------
describe('create() — corte duplicado', () => {
  test('lanza error 409 cuando ya existe un corte cerrado para esa fecha', async () => {
    // closedExists → encuentra un registro → lanza 409
    supabase.from.mockReturnValue(
      makeChain({ data: [{ id: 7 }], error: null })
    );

    await expect(
      create({ fecha: '2026-07-02', efectivo_contado: 500 })
    ).rejects.toMatchObject({ status: 409 });
  });

  test('el mensaje de error incluye la fecha del corte duplicado', async () => {
    supabase.from.mockReturnValue(
      makeChain({ data: [{ id: 7 }], error: null })
    );

    await expect(
      create({ fecha: '2026-07-02', efectivo_contado: 500 })
    ).rejects.toThrow('2026-07-02');
  });
});

// ------------------------------------------------------------------
// Suite: create() — cálculo de diferencia
// Flujo de create(): closedExists (corte_caja) → calculateTotals (ventas)
//                    → insert (corte_caja)
// ------------------------------------------------------------------
describe('create() — cálculo de diferencia', () => {
  // Configura mocks capturando los datos que se pasan al insert
  function setupMocksWithSpy(efectivo_contado) {
    let corteCalls = 0;
    let insertedData = null;

    supabase.from.mockImplementation((table) => {
      if (table === 'ventas') {
        return makeChain({ data: VENTAS_SAMPLE, error: null });
      }

      if (table === 'corte_caja') {
        corteCalls++;
        if (corteCalls === 1) {
          // closedExists → sin corte previo
          return makeChain({ data: [], error: null });
        }
        // Segunda llamada: insert del corte nuevo
        const chain = makeChain({ data: { id: 1, diferencia: efectivo_contado - 450 }, error: null });
        chain.insert = jest.fn((payload) => {
          insertedData = payload;
          return chain;
        });
        return chain;
      }

      return makeChain({ data: null, error: null });
    });

    return { getInsertedData: () => insertedData };
  }

  test('diferencia positiva cuando el efectivo contado supera al esperado', async () => {
    // efectivo_esperado = 450, efectivo_contado = 500 → diferencia = +50
    const { getInsertedData } = setupMocksWithSpy(500);

    await create({ fecha: '2026-07-02', efectivo_contado: 500 });

    expect(getInsertedData()).not.toBeNull();
    expect(getInsertedData().diferencia).toBe(50);
  });

  test('diferencia negativa cuando hay faltante de efectivo', async () => {
    // efectivo_esperado = 450, efectivo_contado = 400 → diferencia = -50
    const { getInsertedData } = setupMocksWithSpy(400);

    await create({ fecha: '2026-07-02', efectivo_contado: 400 });

    expect(getInsertedData()).not.toBeNull();
    expect(getInsertedData().diferencia).toBe(-50);
  });

  test('diferencia es 0 cuando el conteo exacto coincide con el efectivo esperado', async () => {
    // efectivo_esperado = 450, efectivo_contado = 450 → diferencia = 0
    const { getInsertedData } = setupMocksWithSpy(450);

    await create({ fecha: '2026-07-02', efectivo_contado: 450 });

    expect(getInsertedData()).not.toBeNull();
    expect(getInsertedData().diferencia).toBe(0);
  });
});
