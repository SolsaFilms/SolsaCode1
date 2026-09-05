const { supabase } = require('../config/supabase');
const { cifrarPassword, verificarPassword } = require('../utils/password');
const { firmarToken } = require('../utils/jwt');
const { sinPassword, requerido } = require('../utils/helpers');

async function registrar(req, res, next) {
  try {
    const faltantes = requerido(['nombre', 'email', 'password'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const { nombre, email, password, rol } = req.body;

    const { count, error: errorConteo } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true });

    if (errorConteo) throw errorConteo;

    const rolFinal = !count ? 'admin' : (rol === 'admin' ? 'empleado' : (rol || 'empleado'));

    const password_hash = await cifrarPassword(password);

    const { data, error } = await supabase
      .from('usuarios')
      .insert({ nombre, email: email.toLowerCase().trim(), password_hash, rol: rolFinal })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });
      }
      throw error;
    }

    const token = firmarToken({ id: data.id, rol: data.rol });
    res.status(201).json({ ok: true, token, usuario: sinPassword(data) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const faltantes = requerido(['email', 'password'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const { email, password } = req.body;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }
    if (!usuario.activo) {
      return res.status(403).json({ ok: false, mensaje: 'Usuario desactivado' });
    }

    const coincide = await verificarPassword(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = firmarToken({ id: usuario.id, rol: usuario.rol });
    res.json({ ok: true, token, usuario: sinPassword(usuario) });
  } catch (error) {
    next(error);
  }
}

async function perfil(req, res) {
  res.json({ ok: true, usuario: req.usuario });
}

module.exports = { registrar, login, perfil };
