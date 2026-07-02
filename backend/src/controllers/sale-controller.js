const saleService = require('../services/sale-service');
const { success, error } = require('../utils/response');

const getSales = async (req, res, next) => {
  try {
    const { desde, hasta, cliente, metodo_pago, estado } = req.query;
    const data = await saleService.getAll({ desde, hasta, cliente, metodo_pago, estado });
    return success(res, data);
  } catch (e) { next(e); }
};

const getSale = async (req, res, next) => {
  try {
    const data = await saleService.getById(req.params.id);
    if (!data) return error(res, 'Venta no encontrada', 404);
    return success(res, data);
  } catch (e) { next(e); }
};

const createSale = async (req, res, next) => {
  try {
    const { items, metodo_pago, monto_pagado } = req.body;

    if (!items || items.length === 0) {
      return error(res, 'La venta debe tener al menos un producto');
    }
    for (const item of items) {
      if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
        return error(res, 'Cada ítem requiere id_producto, cantidad y precio_unitario');
      }
      if (parseFloat(item.cantidad) <= 0) {
        return error(res, 'La cantidad de cada ítem debe ser mayor a cero');
      }
    }
    if (!metodo_pago) {
      return error(res, 'El método de pago es requerido');
    }
    if (metodo_pago === 'efectivo' && !monto_pagado) {
      return error(res, 'El monto pagado es requerido para pagos en efectivo');
    }

    const data = await saleService.create(req.body);
    return success(res, data, 201);
  } catch (e) { next(e); }
};

const cancelSale = async (req, res, next) => {
  try {
    const { motivo } = req.body;
    if (!motivo || motivo.trim().length < 5) {
      return error(res, 'Debe indicar un motivo de cancelación (mínimo 5 caracteres)');
    }
    const data = await saleService.cancel(req.params.id, motivo);
    return success(res, data);
  } catch (e) { next(e); }
};

module.exports = { getSales, getSale, createSale, cancelSale };
