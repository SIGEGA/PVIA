const inventoryService = require('../services/inventory-service');
const { success, error } = require('../utils/response');

const getMovements = async (req, res, next) => {
  try {
    const { id_producto, tipo, desde, hasta } = req.query;
    const data = await inventoryService.getAll({ id_producto, tipo, desde, hasta });
    return success(res, data);
  } catch (e) { next(e); }
};

const getLowStock = async (req, res, next) => {
  try {
    const data = await inventoryService.getLowStock();
    return success(res, data);
  } catch (e) { next(e); }
};

const createMovement = async (req, res, next) => {
  try {
    const { id_producto, tipo, cantidad, motivo } = req.body;

    if (!id_producto || !tipo || !cantidad || !motivo) {
      return error(res, 'Los campos id_producto, tipo, cantidad y motivo son requeridos');
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return error(res, 'El tipo debe ser: entrada, salida o ajuste');
    }
    if (parseFloat(cantidad) <= 0) {
      return error(res, 'La cantidad debe ser mayor a cero');
    }
    if (motivo.trim().length < 3) {
      return error(res, 'El motivo debe tener al menos 3 caracteres');
    }

    const data = await inventoryService.createMovement(req.body);
    return success(res, data, 201);
  } catch (e) { next(e); }
};

module.exports = { getMovements, getLowStock, createMovement };
