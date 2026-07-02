const supabase = require('../config/supabase');

const generateFolio = () => {
  const now = new Date();
  const date = now.getFullYear().toString().slice(-2)
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0');
  return `COM-${date}-${String(now.getTime()).slice(-4)}`;
};

const getAll = async ({ desde, hasta, proveedor } = {}) => {
  let query = supabase
    .from('compras')
    .select('*, proveedores(nombre)')
    .order('fecha', { ascending: false });
  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);
  if (proveedor) query = query.eq('id_proveedor', proveedor);
  const { data, error } = await query;
  if (error) throw error;
  if (data?.[0]) console.log('[compras columns]', Object.keys(data[0]));
  return data;
};

const getById = async (id) => {
  const { data: compra, error: e1 } = await supabase
    .from('compras').select('*, proveedores(nombre)').eq('id', id).single();
  if (e1) return null;
  const { data: detalle, error: e2 } = await supabase
    .from('detalle_compra').select('*, productos(codigo, nombre)').eq('id_compra', id);
  if (e2) throw e2;
  return { ...compra, detalle };
};

// Crea la compra, actualiza el stock y registra movimientos de inventario
const create = async ({ id_proveedor, fecha, notas, items }) => {
  let subtotal = 0;
  const detalleItems = items.map(item => {
    const sub = parseFloat(item.cantidad) * parseFloat(item.precio_unitario);
    subtotal += sub;
    return {
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: sub,
    };
  });

  const impuestos = parseFloat((subtotal * 0.16).toFixed(2));
  const total = parseFloat((subtotal + impuestos).toFixed(2));
  const folio = generateFolio();

  const { data: compra, error: e1 } = await supabase
    .from('compras')
    .insert({
      folio,
      fecha: fecha || new Date().toISOString().split('T')[0],
      id_proveedor,
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuestos,
      total,
      estado: 'recibida',
      notas: notas || null,
    })
    .select().single();
  if (e1) throw e1;

  const detalleConId = detalleItems.map(d => ({ ...d, id_compra: compra.id }));
  const { error: e2 } = await supabase.from('detalle_compra').insert(detalleConId);
  if (e2) throw e2;

  // Incrementa el stock de cada producto y registra el movimiento
  for (const item of items) {
    const { data: product } = await supabase
      .from('productos').select('stock_actual').eq('id', item.id_producto).single();
    const newStock = parseFloat(product.stock_actual) + parseFloat(item.cantidad);
    await supabase
      .from('productos')
      .update({ stock_actual: newStock, fecha_actualizacion: new Date().toISOString() })
      .eq('id', item.id_producto);
  }

  const movements = items.map(item => ({
    id_producto: item.id_producto,
    tipo: 'entrada',
    cantidad: item.cantidad,
    motivo: 'Compra a proveedor',
    referencia: folio,
  }));
  await supabase.from('movimiento_inventario').insert(movements);

  return compra;
};

const cancel = async (id) => {
  const { data, error } = await supabase
    .from('compras').update({ estado: 'cancelada' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

module.exports = { getAll, getById, create, cancel };
