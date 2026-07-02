// Manejador global de errores — nunca expone detalles internos al cliente
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Error de clave duplicada de Supabase/PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'El registro ya existe (valor duplicado)' });
  }

  // Error de restricción de llave foránea
  if (err.code === '23503') {
    return res.status(400).json({ success: false, error: 'Referencia inválida a un registro inexistente' });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Error interno del servidor';

  return res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
