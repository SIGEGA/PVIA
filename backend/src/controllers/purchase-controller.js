const purchaseService = require('../services/purchase-service');
const { success, error } = require('../utils/response');

const getPurchases = async (req, res, next) => {
  try {
    return success(res, await purchaseService.getAll(req.query));
  } catch (e) { next(e); }
};

const getPurchase = async (req, res, next) => {
  try {
    const data = await purchaseService.getById(req.params.id);
    if (!data) return error(res, 'Compra no encontrada', 404);
    return success(res, data);
  } catch (e) { next(e); }
};

const createPurchase = async (req, res, next) => {
  try {
    const { id_proveedor, items } = req.body;
    if (!id_proveedor) return error(res, 'El proveedor es requerido');
    if (!items || items.length === 0) return error(res, 'La compra debe tener al menos un producto');
    for (const item of items) {
      if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
        return error(res, 'Cada ítem requiere id_producto, cantidad y precio_unitario');
      }
    }
    return success(res, await purchaseService.create(req.body), 201);
  } catch (e) { next(e); }
};

const cancelPurchase = async (req, res, next) => {
  try {
    return success(res, await purchaseService.cancel(req.params.id));
  } catch (e) { next(e); }
};

module.exports = { getPurchases, getPurchase, createPurchase, cancelPurchase };
