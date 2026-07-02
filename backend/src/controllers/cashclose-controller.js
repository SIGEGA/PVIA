const cashcloseService = require('../services/cashclose-service');
const { success, error } = require('../utils/response');

const getCashcloses = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    const data = await cashcloseService.getAll({ desde, hasta });
    return success(res, data);
  } catch (e) { next(e); }
};

const getCashclose = async (req, res, next) => {
  try {
    const data = await cashcloseService.getById(req.params.id);
    if (!data) return error(res, 'Corte de caja no encontrado', 404);
    return success(res, data);
  } catch (e) { next(e); }
};

const getPreview = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const data = await cashcloseService.preview(fecha);
    return success(res, data);
  } catch (e) { next(e); }
};

const createCashclose = async (req, res, next) => {
  try {
    const { efectivo_contado, fecha, notas } = req.body;

    if (efectivo_contado === undefined || efectivo_contado === null) {
      return error(res, 'El monto de efectivo contado es requerido');
    }
    if (parseFloat(efectivo_contado) < 0) {
      return error(res, 'El efectivo contado no puede ser negativo');
    }

    const data = await cashcloseService.create({
      fecha,
      id_usuario: req.user.id,
      efectivo_contado,
      notas,
    });
    return success(res, data, 201);
  } catch (e) { next(e); }
};

module.exports = { getCashcloses, getCashclose, getPreview, createCashclose };
