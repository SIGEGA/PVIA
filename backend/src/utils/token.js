const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SECRET = process.env.JWT_SECRET || 'pos_ith_secret_cambiar_en_produccion';
const EXPIRY_MINUTES = 480; // 8 horas

// Genera un token HMAC firmado con payload y expiración
const sign = (payload) => {
  const exp = Date.now() + EXPIRY_MINUTES * 60 * 1000;
  const raw = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64');
  const sig = crypto.createHmac('sha256', SECRET).update(raw).digest('base64');
  return `${raw}.${sig}`;
};

// Verifica y retorna el payload, o null si el token es inválido o expiró
const verify = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [raw, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(raw).digest('base64');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(raw, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

// Hashea una contraseña con bcrypt
const hashPassword = (password) => bcrypt.hash(password, 12);

// Verifica una contraseña contra su hash bcrypt almacenado
const verifyPassword = (password, stored) => bcrypt.compare(password, stored);

module.exports = { sign, verify, hashPassword, verifyPassword };
