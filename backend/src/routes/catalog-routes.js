const router = require('express').Router();
const ctrl = require('../controllers/catalog-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Categorías
router.get('/categorias', ctrl.getCategorias);
router.post('/categorias', authorize('gerente', 'administrador'), ctrl.createCategoria);
router.put('/categorias/:id', authorize('gerente', 'administrador'), ctrl.updateCategoria);
router.delete('/categorias/:id', authorize('administrador'), ctrl.deleteCategoria);

// Unidades de medida
router.get('/unidades', ctrl.getUnidades);
router.post('/unidades', authorize('gerente', 'administrador'), ctrl.createUnidad);
router.put('/unidades/:id', authorize('gerente', 'administrador'), ctrl.updateUnidad);

// Proveedores
router.get('/proveedores', ctrl.getProveedores);
router.post('/proveedores', authorize('gerente', 'administrador'), ctrl.createProveedor);
router.put('/proveedores/:id', authorize('gerente', 'administrador'), ctrl.updateProveedor);
router.delete('/proveedores/:id', authorize('administrador'), ctrl.deleteProveedor);

// Clientes
router.get('/clientes', ctrl.getClientes);
router.post('/clientes', ctrl.createCliente);
router.put('/clientes/:id', ctrl.updateCliente);
router.delete('/clientes/:id', authorize('gerente', 'administrador'), ctrl.deleteCliente);

module.exports = router;
