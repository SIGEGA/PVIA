const supabase = require('../config/supabase');

// ---- CATEGORÍAS ----
const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias').select('*').order('nombre');
  if (error) throw error;
  return data;
};

const createCategoria = async ({ nombre, descripcion }) => {
  const { data, error } = await supabase
    .from('categorias').insert({ nombre, descripcion }).select().single();
  if (error) throw error;
  return data;
};

const updateCategoria = async (id, fields) => {
  const { data, error } = await supabase
    .from('categorias').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteCategoria = async (id) => {
  const { data: prods } = await supabase
    .from('productos').select('id').eq('categoria_id', id).limit(1);
  if (prods && prods.length > 0) {
    const err = new Error('No se puede eliminar una categoría con productos asociados');
    err.status = 409;
    throw err;
  }
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
};

// ---- PROVEEDORES ----
const getProveedores = async () => {
  const { data, error } = await supabase
    .from('proveedores').select('*').order('nombre');
  if (error) throw error;
  return data;
};

const createProveedor = async (fields) => {
  const { data, error } = await supabase
    .from('proveedores').insert(fields).select().single();
  if (error) throw error;
  return data;
};

const updateProveedor = async (id, fields) => {
  const { data, error } = await supabase
    .from('proveedores').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteProveedor = async (id) => {
  const { error } = await supabase.from('proveedores').delete().eq('id', id);
  if (error) throw error;
};

// ---- CLIENTES ----
const getClientes = async ({ search } = {}) => {
  let query = supabase.from('clientes').select('*').order('nombre');
  if (search) query = query.ilike('nombre', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const createCliente = async (fields) => {
  const { data, error } = await supabase
    .from('clientes').insert(fields).select().single();
  if (error) throw error;
  return data;
};

const updateCliente = async (id, fields) => {
  const { data, error } = await supabase
    .from('clientes').update(fields).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteCliente = async (id) => {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
};

module.exports = {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getProveedores, createProveedor, updateProveedor, deleteProveedor,
  getClientes, createCliente, updateCliente, deleteCliente,
};
