const router = require('express').Router();
const ctrl = require('../controllers/cashclose-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Vista previa y consulta — gerente y administrador
router.get('/', authorize('gerente', 'administrador'), ctrl.getCashcloses);
router.get('/preview', authorize('gerente', 'administrador'), ctrl.getPreview);
router.get('/:id', authorize('gerente', 'administrador'), ctrl.getCashclose);

// Crear corte — solo gerente y administrador
router.post('/', authorize('gerente', 'administrador'), ctrl.createCashclose);

module.exports = router;
