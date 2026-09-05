const jwt = require('jsonwebtoken');
const env = require('../config/env');

function firmarToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verificarToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { firmarToken, verificarToken };
