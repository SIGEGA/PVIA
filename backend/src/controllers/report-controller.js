const reportService = require('../services/report-service');
const { success, error } = require('../utils/response');

const getDailySummary = async (req, res, next) => {
  try {
    return success(res, await reportService.dailySummary(req.query.fecha));
  } catch (e) { next(e); }
};

const getSalesByPeriod = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return error(res, 'Los parámetros desde y hasta son requeridos');
    return success(res, await reportService.salesByPeriod({ desde, hasta }));
  } catch (e) { next(e); }
};

const getTopProducts = async (req, res, next) => {
  try {
    return success(res, await reportService.topProducts(req.query));
  } catch (e) { next(e); }
};

const getInventoryValue = async (req, res, next) => {
  try {
    return success(res, await reportService.inventoryValue());
  } catch (e) { next(e); }
};

module.exports = { getDailySummary, getSalesByPeriod, getTopProducts, getInventoryValue };
