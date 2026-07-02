const router = require('express').Router();
const ctrl = require('../controllers/sale-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.getSales);
router.get('/:id', ctrl.getSale);

// Cualquier usuario autenticado puede crear una venta
router.post('/', ctrl.createSale);

// Solo gerente y administrador pueden cancelar ventas
router.patch('/:id/cancelar', authorize('gerente', 'administrador'), ctrl.cancelSale);

module.exports = router;
