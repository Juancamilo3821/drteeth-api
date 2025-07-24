const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'drteeth_secret_key';

// Genera un token válido por 7 días
function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

// Middleware para verificar el token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    req.user = decoded; // { email: ... }
    next();
  });
}

module.exports = {
  generateToken,
  verifyToken,
};
