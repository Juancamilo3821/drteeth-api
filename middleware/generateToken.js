const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'drteeth_secret_key';

function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

module.exports = generateToken;
