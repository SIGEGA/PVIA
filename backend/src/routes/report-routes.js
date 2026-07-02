const router = require('express').Router();
const ctrl = require('../controllers/report-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('gerente', 'administrador'));

router.get('/resumen-diario', ctrl.getDailySummary);
router.get('/ventas-periodo', ctrl.getSalesByPeriod);
router.get('/productos-mas-vendidos', ctrl.getTopProducts);
router.get('/inventario-valorizado', ctrl.getInventoryValue);

module.exports = router;
