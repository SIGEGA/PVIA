const router = require('express').Router();
const ctrl = require('../controllers/inventory-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Consulta de movimientos y stock bajo — todos los roles
router.get('/movements', ctrl.getMovements);
router.get('/low-stock', ctrl.getLowStock);

// Registro de movimientos manuales — vendedor, gerente y administrador
router.post('/movements', authorize('vendedor', 'gerente', 'administrador'), ctrl.createMovement);

module.exports = router;
