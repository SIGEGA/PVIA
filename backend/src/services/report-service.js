const supabase = require('../config/supabase');

// Resumen del día: ventas, compras y utilidad bruta
const dailySummary = async (fecha) => {
  const targetDate = fecha || new Date().toISOString().split('T')[0];

  const [{ data: ventas }, { data: compras }] = await Promise.all([
    supabase.from('ventas').select('total, metodo_pago').eq('fecha', targetDate).eq('estado', 'completada'),
    supabase.from('compras').select('total').eq('fecha', targetDate).eq('estado', 'recibida'),
  ]);

  const totalVentas = (ventas || []).reduce((s, v) => s + parseFloat(v.total), 0);
  const totalCompras = (compras || []).reduce((s, c) => s + parseFloat(c.total), 0);
  const porMetodo = (ventas || []).reduce((acc, v) => {
    acc[v.metodo_pago] = parseFloat(((acc[v.metodo_pago] || 0) + parseFloat(v.total)).toFixed(2));
    return acc;
  }, {});

  return {
    fecha: targetDate,
    ventas: { total: parseFloat(totalVentas.toFixed(2)), cantidad: (ventas || []).length, por_metodo: porMetodo },
    compras: { total: parseFloat(totalCompras.toFixed(2)), cantidad: (compras || []).length },
    utilidad_bruta: parseFloat((totalVentas - totalCompras).toFixed(2)),
  };
};

// Ventas agrupadas por día en un período
const salesByPeriod = async ({ desde, hasta }) => {
  const { data, error } = await supabase
    .from('ventas')
    .select('fecha, total, subtotal, impuestos, descuento, metodo_pago')
    .eq('estado', 'completada')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha');
  if (error) throw error;

  const porDia = data.reduce((acc, v) => {
    if (!acc[v.fecha]) acc[v.fecha] = { fecha: v.fecha, total: 0, cantidad: 0 };
    acc[v.fecha].total += parseFloat(v.total);
    acc[v.fecha].cantidad += 1;
    return acc;
  }, {});

  return {
    detalle: data,
    por_dia: Object.values(porDia).map(d => ({ ...d, total: parseFloat(d.total.toFixed(2)) })),
    totales: {
      ventas: parseFloat(data.reduce((s, v) => s + parseFloat(v.total), 0).toFixed(2)),
      cantidad: data.length,
    },
  };
};

// Productos más vendidos por cantidad en un período
const topProducts = async ({ desde, hasta, limite = 10 }) => {
  let query = supabase
    .from('ventas_detalle')
    .select('cantidad, subtotal, productos(id, codigo, nombre), ventas!inner(fecha, estado)')
    .eq('ventas.estado', 'completada');
  if (desde) query = query.gte('ventas.fecha', desde);
  if (hasta) query = query.lte('ventas.fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;

  const agrupado = data.reduce((acc, d) => {
    const pid = d.productos.id;
    if (!acc[pid]) {
      acc[pid] = { id: pid, codigo: d.productos.codigo, nombre: d.productos.nombre, cantidad: 0, total: 0 };
    }
    acc[pid].cantidad += parseFloat(d.cantidad);
    acc[pid].total += parseFloat(d.subtotal);
    return acc;
  }, {});

  return Object.values(agrupado)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, parseInt(limite))
    .map(p => ({ ...p, total: parseFloat(p.total.toFixed(2)) }));
};

// Valorización del inventario actual
const inventoryValue = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, codigo, nombre, stock, stock_minimo, precio_compra, precio_venta, categorias(nombre), unidades_medida(abreviacion)')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;

  const conValor = data.map(p => ({
    ...p,
    valor_costo: parseFloat((parseFloat(p.stock) * parseFloat(p.precio_compra)).toFixed(2)),
    valor_venta: parseFloat((parseFloat(p.stock) * parseFloat(p.precio_venta)).toFixed(2)),
    bajo_minimo: parseFloat(p.stock) <= parseFloat(p.stock_minimo),
  }));

  const totales = conValor.reduce(
    (acc, p) => ({ valor_costo: acc.valor_costo + p.valor_costo, valor_venta: acc.valor_venta + p.valor_venta }),
    { valor_costo: 0, valor_venta: 0 }
  );

  return {
    productos: conValor,
    totales: {
      valor_costo: parseFloat(totales.valor_costo.toFixed(2)),
      valor_venta: parseFloat(totales.valor_venta.toFixed(2)),
    },
  };
};

module.exports = { dailySummary, salesByPeriod, topProducts, inventoryValue };
