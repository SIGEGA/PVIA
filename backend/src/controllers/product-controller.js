const productService = require('../services/product-service');
const { success, error } = require('../utils/response');

const getProducts = async (req, res, next) => {
  try {
    const { search, categoria, low_stock } = req.query;
    const data = await productService.getAll({ search, categoria, lowStock: low_stock });
    return success(res, data);
  } catch (e) { next(e); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return error(res, 'Producto no encontrado', 404);
    return success(res, product);
  } catch (e) { next(e); }
};

const getProductByCode = async (req, res, next) => {
  try {
    const product = await productService.getByCode(req.params.codigo);
    if (!product) return error(res, 'Producto no encontrado', 404);
    return success(res, product);
  } catch (e) { next(e); }
};

const createProduct = async (req, res, next) => {
  try {
    const { codigo, nombre, precio_venta } = req.body;
    if (!codigo || !nombre || precio_venta === undefined) {
      return error(res, 'Los campos codigo, nombre y precio_venta son requeridos');
    }
    if (parseFloat(precio_venta) <= 0) {
      return error(res, 'El precio de venta debe ser mayor a cero');
    }
    const exists = await productService.codeExists(codigo);
    if (exists) return error(res, 'El código de producto ya existe', 409);

    const data = await productService.create(req.body);
    return success(res, data, 201);
  } catch (e) { next(e); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return error(res, 'Producto no encontrado', 404);

    const data = await productService.update(req.params.id, req.body);
    return success(res, data);
  } catch (e) { next(e); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return error(res, 'Producto no encontrado', 404);

    await productService.remove(req.params.id);
    return success(res, { message: 'Producto desactivado correctamente' });
  } catch (e) { next(e); }
};

module.exports = { getProducts, getProduct, getProductByCode, createProduct, updateProduct, deleteProduct };
