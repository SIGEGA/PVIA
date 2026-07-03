const supabase = require('../config/supabase');

// Genera folio único con timestamp: VTA-YYMMDD-XXXX
const generateFolio = () => {
  const now = new Date();
  const date = now.getFullYear().toString().slice(-2)
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0');
  const rand = String(now.getTime()).slice(-4);
  return `VTA-${date}-${rand}`;
};

// Retorna ventas con filtros de fecha, cliente y estado
const getAll = async ({ desde, hasta, cliente, metodo_pago, estado } = {}) => {
  let query = supabase
    .from('ventas')
    .select('*, clientes(nombre)')
    .order('fecha', { ascending: false });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);
  if (cliente) query = query.eq('id_cliente', cliente);
  if (metodo_pago) query = query.eq('metodo_pago', metodo_pago);
  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Retorna una venta con su detalle completo
const getById = async (id) => {
  const { data: venta, error: e1 } = await supabase
    .from('ventas')
    .select('*, clientes(nombre, rfc)')
    .eq('id', id)
    .single();
  if (e1) return null;

  const { data: detalle, error: e2 } = await supabase
    .from('detalle_venta')
    .select('*, productos(codigo, nombre)')
    .eq('id_venta', id);
  if (e2) throw e2;

  return { ...venta, detalle };
};

// Verifica stock de todos los items antes de crear la venta
const validateStock = async (items) => {
  for (const item of items) {
    const { data: product, error: qErr } = await supabase
      .from('productos')
      .select('stock_actual, nombre')
      .eq('id', item.id_producto)
      .single();

    if (!product) {
      const err = new Error(`Producto con id ${item.id_producto} no encontrado`);
      err.status = 404;
      throw err;
    }
    if (parseFloat(product.stock_actual) > parseFloat(item.cantidad)) {
      const err = new Error(
        `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock_actual}`
      );
      err.status = 409;
      throw err;
    }
  }
};

// Descuenta el stock de cada producto involucrado en la venta
const decrementStock = async (items) => {
  for (const item of items) {
    const { data: product } = await supabase
      .from('productos')
      .select('stock_actual')
      .eq('id', item.id_producto)
      .single();

    const newStock = parseFloat(product.stock_actual) - parseFloat(item.cantidad);
    await supabase
      .from('productos')
      .update({ stock_actual: newStock })
      .eq('id', item.id_producto);
  }
};

// Restaura el stock cuando se cancela una venta
const restoreStock = async (ventaId) => {
  const { data: detalle } = await supabase
    .from('detalle_venta')
    .select('id_producto, cantidad')
    .eq('id_venta', ventaId);

  for (const item of detalle) {
    const { data: product } = await supabase
      .from('productos')
      .select('stock_actual')
      .eq('id', item.id_producto)
      .single();

    const newStock = parseFloat(product.stock_actual) + parseFloat(item.cantidad);
    await supabase
      .from('productos')
      .update({ stock_actual: newStock })
      .eq('id', item.id_producto);
  }
};

// Inserta movimientos de inventario tipo 'salida' por cada ítem de la venta
const insertMovements = async (items, folio, tipo = 'salida') => {
  const movements = items.map(item => ({
    id_producto: item.id_producto,
    tipo,
    cantidad: item.cantidad,
    motivo: tipo === 'salida' ? 'Venta' : 'Cancelación de venta',
    referencia: folio,
  }));
  await supabase.from('movimiento_inventario').insert(movements);
};

// Crea una venta completa: valida stock, inserta venta y detalle, actualiza stock
const create = async (body) => {
  const {
    id_cliente, fecha, metodo_pago, monto_pagado,
    descuento_global, notas, items,
  } = body;

  await validateStock(items);

  // Calcula totales
  let subtotal = 0;
  const detalleItems = items.map(item => {
    const itemDesc = parseFloat(item.descuento) || 0;
    const sub = parseFloat(item.cantidad) * parseFloat(item.precio_unitario) - itemDesc;
    subtotal += sub;
    return {
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento: itemDesc,
      subtotal: sub,
    };
  });

  const descuento = parseFloat(descuento_global) || 0;
  const base = subtotal - descuento;
  const impuestos = parseFloat((base * 0.16).toFixed(2));
  const total = parseFloat((base + impuestos).toFixed(2));
  const pagado = parseFloat(monto_pagado) || total;
  const cambio = parseFloat(Math.max(0, pagado - total).toFixed(2));
  const folio = generateFolio();

  // Inserta la cabecera de la venta
  const { data: venta, error: e1 } = await supabase
    .from('ventas')
    .insert({
      folio,
      fecha: fecha || new Date().toISOString().split('T')[0],
      id_cliente: id_cliente || null,
      subtotal,
      impuestos,
      descuento,
      total,
      metodo_pago: metodo_pago || 'efectivo',
      monto_pagado: pagado,
      cambio,
      estado: 'completada',
      notas: notas || null,
    })
    .select()
    .single();
  if (e1) throw e1;

  // Inserta el detalle
  const detalleConId = detalleItems.map(d => ({ ...d, id_venta: venta.id }));
  const { error: e2 } = await supabase.from('detalle_venta').insert(detalleConId);
  if (e2) throw e2;

  // Actualiza stock y registra movimientos
  await decrementStock(items);
  await insertMovements(items, folio, 'salida');

  return venta;
};

// Cancela una venta: restaura stock y registra movimientos de entrada
const cancel = async (id, motivo) => {
  const { data: venta, error: e1 } = await supabase
    .from('ventas')
    .select('estado, folio, fecha')
    .eq('id', id)
    .single();
  if (e1 || !venta) {
    const err = new Error('Venta no encontrada');
    err.status = 404;
    throw err;
  }
  if (venta.estado === 'cancelada') {
    const err = new Error('La venta ya está cancelada');
    err.status = 400;
    throw err;
  }

  // Solo se puede cancelar ventas del mismo día
  const today = new Date().toISOString().split('T')[0];
  if (venta.fecha !== today) {
    const err = new Error('Solo se pueden cancelar ventas realizadas el día de hoy');
    err.status = 422;
    throw err;
  }

  await restoreStock(id);

  const { data: detalle } = await supabase
    .from('detalle_venta')
    .select('id_producto, cantidad')
    .eq('id_venta', id);
  await insertMovements(detalle, venta.folio, 'entrada');

  const { data, error } = await supabase
    .from('ventas')
    .update({ estado: 'cancelada', notas: motivo || null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

module.exports = { getAll, getById, create, cancel };
