const supabase = require('../config/supabase');

// Verifica si ya existe un corte cerrado para una fecha dada
const closedExists = async (fecha) => {
  const { data } = await supabase
    .from('corte_caja')
    .select('id')
    .eq('fecha', fecha)
    .eq('estado', 'cerrado')
    .limit(1);
  return data && data.length > 0;
};

// Calcula los totales de ventas completadas del día agrupados por método de pago
const calculateTotals = async (fecha) => {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('total, metodo_pago')
    .eq('fecha', fecha)
    .eq('estado', 'completada');
  if (error) throw error;

  const totals = {
    total_ventas: 0,
    efectivo_esperado: 0,
    total_tarjeta: 0,
    total_transferencia: 0,
    total_otros: 0,
  };

  for (const venta of ventas || []) {
    const amount = parseFloat(venta.total);
    totals.total_ventas += amount;
    if (venta.metodo_pago === 'efectivo') totals.efectivo_esperado += amount;
    else if (venta.metodo_pago === 'tarjeta') totals.total_tarjeta += amount;
    else if (venta.metodo_pago === 'transferencia') totals.total_transferencia += amount;
    else totals.total_otros += amount;
  }

  // Redondea todos los valores a 2 decimales
  Object.keys(totals).forEach(k => {
    totals[k] = parseFloat(totals[k].toFixed(2));
  });

  return totals;
};

// Crea un corte de caja para la fecha indicada
const create = async ({ fecha, id_usuario, efectivo_contado, notas }) => {
  const targetDate = fecha || new Date().toISOString().split('T')[0];

  const alreadyClosed = await closedExists(targetDate);
  if (alreadyClosed) {
    const err = new Error(`Ya existe un corte de caja cerrado para el ${targetDate}`);
    err.status = 409;
    throw err;
  }

  const totals = await calculateTotals(targetDate);
  const contado = parseFloat(efectivo_contado) || 0;
  const diferencia = parseFloat((contado - totals.efectivo_esperado).toFixed(2));

  const { data, error } = await supabase
    .from('corte_caja')
    .insert({
      fecha: targetDate,
      id_usuario,
      total_ventas: totals.total_ventas,
      efectivo_esperado: totals.efectivo_esperado,
      efectivo_contado: contado,
      diferencia,
      total_tarjeta: totals.total_tarjeta,
      total_transferencia: totals.total_transferencia,
      total_otros: totals.total_otros,
      estado: 'cerrado',
      notas: notas || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Retorna historial de cortes con filtro de fechas
const getAll = async ({ desde, hasta } = {}) => {
  let query = supabase
    .from('corte_caja')
    .select('*, usuarios(nombre)')
    .order('fecha', { ascending: false });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Retorna el detalle completo de un corte
const getById = async (id) => {
  const { data, error } = await supabase
    .from('corte_caja')
    .select('*, usuarios(nombre, email)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

// Calcula una vista previa del corte sin guardarlo
const preview = async (fecha) => {
  const targetDate = fecha || new Date().toISOString().split('T')[0];
  return calculateTotals(targetDate);
};

module.exports = { create, getAll, getById, preview };
