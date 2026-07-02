const router = require('express').Router();
const ctrl = require('../controllers/user-controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Login — ruta pública, sin autenticación
router.post('/login', ctrl.login);

// Rutas protegidas
router.get('/me', authenticate, ctrl.getMe);

// Solo administrador gestiona usuarios
router.get('/', authenticate, authorize('administrador'), ctrl.getUsers);
router.get('/:id', authenticate, authorize('administrador'), ctrl.getUser);
router.post('/', authenticate, authorize('administrador'), ctrl.createUser);
router.put('/:id', authenticate, authorize('administrador'), ctrl.updateUser);
router.patch('/:id/password', authenticate, authorize('administrador'), ctrl.changePassword);
router.patch('/:id/status', authenticate, authorize('administrador'), ctrl.setStatus);

module.exports = router;
