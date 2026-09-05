const { verificarToken } = require('../utils/jwt');
const { supabase } = require('../config/supabase');
const { sinPassword } = require('../utils/helpers');

async function autenticar(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [tipo, token] = header.split(' ');

    if (tipo !== 'Bearer' || !token) {
      return res.status(401).json({ ok: false, mensaje: 'Token requerido' });
    }

    const payload = verificarToken(token);
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', payload.id)
      .maybeSingle();

    if (error) throw error;
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Sesión inválida' });
    }

    req.usuario = sinPassword(usuario);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }
    next(error);
  }
}

function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
