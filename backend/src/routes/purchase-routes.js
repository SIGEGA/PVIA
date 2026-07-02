const router = require('express').Router();
const ctrl = require('../controllers/purchase-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.getPurchases);
router.get('/:id', ctrl.getPurchase);
router.post('/', authorize('gerente', 'administrador'), ctrl.createPurchase);
router.patch('/:id/cancelar', authorize('gerente', 'administrador'), ctrl.cancelPurchase);

module.exports = router;
