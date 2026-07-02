const userService = require('../services/user-service');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email y contraseña son requeridos');
    }
    const data = await userService.login(email, password);
    return success(res, data);
  } catch (e) { next(e); }
};

const getUsers = async (req, res, next) => {
  try {
    const data = await userService.getAll(req.query);
    return success(res, data);
  } catch (e) { next(e); }
};

const getUser = async (req, res, next) => {
  try {
    const data = await userService.getById(req.params.id);
    if (!data) return error(res, 'Usuario no encontrado', 404);
    return success(res, data);
  } catch (e) { next(e); }
};

const getMe = async (req, res, next) => {
  try {
    const data = await userService.getById(req.user.id);
    if (!data) return error(res, 'Usuario no encontrado', 404);
    return success(res, data);
  } catch (e) { next(e); }
};

const createUser = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return error(res, 'Nombre, email y contraseña son requeridos');
    }
    if (password.length < 8) {
      return error(res, 'La contraseña debe tener al menos 8 caracteres');
    }
    const validRoles = ['vendedor', 'gerente', 'administrador'];
    if (rol && !validRoles.includes(rol)) {
      return error(res, `El rol debe ser: ${validRoles.join(', ')}`);
    }
    const data = await userService.create({ nombre, email, password, rol });
    return success(res, data, 201);
  } catch (e) { next(e); }
};

const updateUser = async (req, res, next) => {
  try {
    const existing = await userService.getById(req.params.id);
    if (!existing) return error(res, 'Usuario no encontrado', 404);
    const data = await userService.update(req.params.id, req.body);
    return success(res, data);
  } catch (e) { next(e); }
};

const changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return error(res, 'La nueva contraseña debe tener al menos 8 caracteres');
    }
    await userService.changePassword(req.params.id, password);
    return success(res, { message: 'Contraseña actualizada correctamente' });
  } catch (e) { next(e); }
};

const setStatus = async (req, res, next) => {
  try {
    const { activo } = req.body;
    if (typeof activo !== 'boolean') {
      return error(res, 'El campo activo debe ser true o false');
    }
    const data = await userService.setStatus(req.params.id, activo);
    return success(res, data);
  } catch (e) { next(e); }
};

module.exports = { login, getUsers, getUser, getMe, createUser, updateUser, changePassword, setStatus };
