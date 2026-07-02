const router = require('express').Router();
const ctrl = require('../controllers/product-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Todas las rutas de productos requieren autenticación
router.use(authenticate);

router.get('/', ctrl.getProducts);
router.get('/low-stock', ctrl.getProducts); // Alias con ?low_stock=true en el servicio
router.get('/code/:codigo', ctrl.getProductByCode);
router.get('/:id', ctrl.getProduct);

// Solo gerente y administrador pueden crear, editar y eliminar
router.post('/', authorize('gerente', 'administrador'), ctrl.createProduct);
router.put('/:id', authorize('gerente', 'administrador'), ctrl.updateProduct);
router.delete('/:id', authorize('administrador'), ctrl.deleteProduct);

module.exports = router;
