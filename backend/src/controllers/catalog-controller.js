const catalogService = require('../services/catalog-service');
const { success, error } = require('../utils/response');

// ---- CATEGORÍAS ----
const getCategorias = async (req, res, next) => {
  try { return success(res, await catalogService.getCategorias()); } catch (e) { next(e); }
};
const createCategoria = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return error(res, 'El nombre de la categoría es requerido');
    return success(res, await catalogService.createCategoria(req.body), 201);
  } catch (e) { next(e); }
};
const updateCategoria = async (req, res, next) => {
  try { return success(res, await catalogService.updateCategoria(req.params.id, req.body)); }
  catch (e) { next(e); }
};
const deleteCategoria = async (req, res, next) => {
  try {
    await catalogService.deleteCategoria(req.params.id);
    return success(res, { message: 'Categoría desactivada' });
  } catch (e) { next(e); }
};

// ---- UNIDADES ----
const getUnidades = async (req, res, next) => {
  try { return success(res, await catalogService.getUnidades()); } catch (e) { next(e); }
};
const createUnidad = async (req, res, next) => {
  try {
    const { nombre, abreviacion } = req.body;
    if (!nombre || !abreviacion) return error(res, 'Nombre y abreviación son requeridos');
    return success(res, await catalogService.createUnidad(req.body), 201);
  } catch (e) { next(e); }
};
const updateUnidad = async (req, res, next) => {
  try { return success(res, await catalogService.updateUnidad(req.params.id, req.body)); }
  catch (e) { next(e); }
};

// ---- PROVEEDORES ----
const getProveedores = async (req, res, next) => {
  try { return success(res, await catalogService.getProveedores()); } catch (e) { next(e); }
};
const createProveedor = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return error(res, 'El nombre del proveedor es requerido');
    return success(res, await catalogService.createProveedor(req.body), 201);
  } catch (e) { next(e); }
};
const updateProveedor = async (req, res, next) => {
  try { return success(res, await catalogService.updateProveedor(req.params.id, req.body)); }
  catch (e) { next(e); }
};
const deleteProveedor = async (req, res, next) => {
  try {
    await catalogService.deleteProveedor(req.params.id);
    return success(res, { message: 'Proveedor desactivado' });
  } catch (e) { next(e); }
};

// ---- CLIENTES ----
const getClientes = async (req, res, next) => {
  try { return success(res, await catalogService.getClientes(req.query)); } catch (e) { next(e); }
};
const createCliente = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return error(res, 'El nombre del cliente es requerido');
    return success(res, await catalogService.createCliente(req.body), 201);
  } catch (e) { next(e); }
};
const updateCliente = async (req, res, next) => {
  try { return success(res, await catalogService.updateCliente(req.params.id, req.body)); }
  catch (e) { next(e); }
};
const deleteCliente = async (req, res, next) => {
  try {
    await catalogService.deleteCliente(req.params.id);
    return success(res, { message: 'Cliente desactivado' });
  } catch (e) { next(e); }
};

module.exports = {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getUnidades, createUnidad, updateUnidad,
  getProveedores, createProveedor, updateProveedor, deleteProveedor,
  getClientes, createCliente, updateCliente, deleteCliente,
};
