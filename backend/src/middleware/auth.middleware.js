const { verify } = require('../utils/token');
const { error } = require('../utils/response');

// Verifica el token del header Authorization y adjunta el usuario a req
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const payload = verify(token);
  if (!payload) {
    return error(res, 'Token inválido o sesión expirada', 401);
  }

  req.user = payload;
  next();
};

// Middleware de autorización por rol
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return error(res, 'No tiene permiso para realizar esta acción', 403);
  }
  next();
};

module.exports = { authenticate, authorize };
