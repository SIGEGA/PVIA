const supabase = require('../config/supabase');

// Retorna todos los productos con filtros opcionales
const getAll = async ({ search, categoria, lowStock } = {}) => {
  let query = supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .order('nombre');

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,codigo.ilike.%${search}%`);
  }
  if (categoria) {
    query = query.eq('categoria_id', categoria);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (lowStock === 'true') {
    return data.filter(p => parseFloat(p.stock_actual) <= parseFloat(p.stock_minimo));
  }
  return data;
};

// Retorna un producto por su ID
const getById = async (id) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

// Busca producto por código de barras
const getByCode = async (codigo) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('codigo', codigo)
    .single();
  if (error) return null;
  return data;
};

// Verifica si un código ya existe
const codeExists = async (codigo, excludeId = null) => {
  let query = supabase
    .from('productos')
    .select('id')
    .eq('codigo', codigo);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return data && data.length > 0;
};

// Crea un nuevo producto
const create = async (fields) => {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      codigo: fields.codigo,
      nombre: fields.nombre,
      descripcion: fields.descripcion || null,
      precio_venta: fields.precio_venta,
      costo_unitario: fields.precio_compra || fields.costo_unitario || 0,
      stock_actual: fields.stock || fields.stock_actual || 0,
      stock_minimo: fields.stock_minimo || 0,
      categoria_id: fields.id_categoria || fields.categoria_id || null,
      // string vacío del select se convierte a null
      estado: 'activo',
    })
    .select('*, categorias(nombre)')
    .single();
  if (error) throw error;
  return data;
};

// Actualiza campos permitidos
const update = async (id, fields) => {
  const allowed = {};
  if (fields.nombre !== undefined) allowed.nombre = fields.nombre;
  if (fields.descripcion !== undefined) allowed.descripcion = fields.descripcion;
  if (fields.precio_venta !== undefined) allowed.precio_venta = fields.precio_venta;
  if (fields.precio_compra !== undefined) allowed.costo_unitario = fields.precio_compra;
  if (fields.costo_unitario !== undefined) allowed.costo_unitario = fields.costo_unitario;
  if (fields.stock_minimo !== undefined) allowed.stock_minimo = fields.stock_minimo;
  if (fields.id_categoria !== undefined) allowed.categoria_id = fields.id_categoria || null;
  if (fields.categoria_id !== undefined) allowed.categoria_id = fields.categoria_id || null;
  allowed.fecha_actualizacion = new Date().toISOString();

  const { data, error } = await supabase
    .from('productos')
    .update(allowed)
    .eq('id', id)
    .select('*, categorias(nombre)')
    .single();
  if (error) throw error;
  return data;
};

// Elimina el producto (hard delete si no tiene ventas)
const remove = async (id) => {
  const { data: detalle } = await supabase
    .from('detalle_venta')
    .select('id')
    .eq('id_producto', id)
    .limit(1);

  if (detalle && detalle.length > 0) {
    const err = new Error('No se puede eliminar un producto con historial de ventas');
    err.status = 409;
    throw err;
  }

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

module.exports = { getAll, getById, getByCode, codeExists, create, update, remove };
