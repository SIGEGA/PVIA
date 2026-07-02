const supabase = require('../config/supabase');
const { hashPassword, verifyPassword, sign } = require('../utils/token');

// Autentica al usuario y retorna un token firmado
const login = async (email, password) => {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, contraseña, rol')
    .eq('correo', email.toLowerCase().trim())
    .single();

  if (error || !user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const passwordOk = await verifyPassword(password, user['contraseña']?.trim());
  if (!passwordOk) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const token = sign({ id: user.id, nombre: user.nombre, email: user.correo, rol: user.rol });
  return {
    token,
    user: { id: user.id, nombre: user.nombre, email: user.correo, rol: user.rol },
  };
};

// Retorna todos los usuarios
const getAll = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, rol')
    .order('nombre');
  if (error) throw error;
  return data;
};

// Retorna un usuario por su ID
const getById = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, rol')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

// Verifica si un correo ya está en uso
const emailExists = async (email, excludeId = null) => {
  let query = supabase
    .from('usuarios')
    .select('id')
    .eq('correo', email.toLowerCase().trim());
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return data && data.length > 0;
};

// Crea un nuevo usuario con contraseña hasheada
const create = async ({ nombre, email, password, rol }) => {
  const exists = await emailExists(email);
  if (exists) {
    const err = new Error('El correo electrónico ya está registrado');
    err.status = 409;
    throw err;
  }

  const hash = await hashPassword(password);
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nombre,
      correo: email.toLowerCase().trim(),
      'contraseña': hash,
      rol: rol || 'vendedor',
    })
    .select('id, nombre, correo, rol')
    .single();
  if (error) throw error;
  return data;
};

// Actualiza datos del usuario — solo nombre y rol
const update = async (id, { nombre, rol }) => {
  const allowed = {};
  if (nombre) allowed.nombre = nombre;
  if (rol) allowed.rol = rol;

  const { data, error } = await supabase
    .from('usuarios')
    .update(allowed)
    .eq('id', id)
    .select('id, nombre, correo, rol')
    .single();
  if (error) throw error;
  return data;
};

// Cambia la contraseña del usuario
const changePassword = async (id, newPassword) => {
  const hash = await hashPassword(newPassword);
  const { error } = await supabase
    .from('usuarios')
    .update({ 'contraseña': hash })
    .eq('id', id);
  if (error) throw error;
};

// Activa o desactiva un usuario
const setStatus = async (id, activo) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo })
    .eq('id', id)
    .select('id, nombre, correo, rol')
    .single();
  if (error) throw error;
  return data;
};

module.exports = { login, getAll, getById, emailExists, create, update, changePassword, setStatus };
