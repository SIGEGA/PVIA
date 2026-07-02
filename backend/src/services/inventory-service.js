const supabase = require('../config/supabase');

// Retorna movimientos de inventario con filtros opcionales
const getAll = async ({ id_producto, tipo, desde, hasta } = {}) => {
  let query = supabase
    .from('movimiento_inventario')
    .select('*, productos(codigo, nombre)')
    .order('fecha', { ascending: false });

  if (id_producto) query = query.eq('id_producto', id_producto);
  if (tipo) query = query.eq('tipo', tipo);
  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Retorna productos cuyo stock está en o por debajo del mínimo configurado
const getLowStock = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, codigo, nombre, stock_actual, stock_minimo, categorias(nombre)')
    .order('stock_actual');
  if (error) throw error;
  return data.filter(p => parseFloat(p.stock_actual) <= parseFloat(p.stock_minimo));
};

// Registra un movimiento manual y ajusta el stock del producto
const createMovement = async ({ id_producto, tipo, cantidad, motivo, referencia }) => {
  // Obtiene stock actual para calcular el nuevo valor
  const { data: product, error: ep } = await supabase
    .from('productos')
    .select('stock_actual, nombre')
    .eq('id', id_producto)
    .single();

  if (ep || !product) {
    const err = new Error('Producto no encontrado');
    err.status = 404;
    throw err;
  }

  const currentStock = parseFloat(product.stock_actual);
  const qty = parseFloat(cantidad);

  // Valida que no se reste más stock del disponible
  if ((tipo === 'salida' || tipo === 'ajuste') && qty > currentStock) {
    const err = new Error(
      `Cantidad excede el stock disponible de "${product.nombre}" (${currentStock})`
    );
    err.status = 409;
    throw err;
  }

  // Calcula nuevo stock según tipo de movimiento
  let newStock;
  if (tipo === 'entrada') newStock = currentStock + qty;
  else if (tipo === 'salida') newStock = currentStock - qty;
  else newStock = qty; // ajuste directo al valor indicado

  // Actualiza el stock del producto
  const { error: eu } = await supabase
    .from('productos')
    .update({ stock_actual: newStock, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id_producto);
  if (eu) throw eu;

  // Registra el movimiento en el historial
  const { data, error } = await supabase
    .from('movimiento_inventario')
    .insert({ id_producto, tipo, cantidad: qty, motivo, referencia: referencia || null })
    .select('*, productos(codigo, nombre)')
    .single();
  if (error) throw error;
  return data;
};

module.exports = { getAll, getLowStock, createMovement };
