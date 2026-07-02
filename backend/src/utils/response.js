// Envía respuesta de éxito con formato estándar
const success = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

// Envía respuesta de error con formato estándar
const error = (res, message, status = 400) => {
  return res.status(status).json({ success: false, error: message });
};

module.exports = { success, error };
