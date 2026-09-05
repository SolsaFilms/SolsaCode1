const bcrypt = require('bcrypt');
const env = require('../config/env');

async function cifrarPassword(password) {
  return bcrypt.hash(password, env.bcryptSaltRounds);
}

async function verificarPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { cifrarPassword, verificarPassword };
