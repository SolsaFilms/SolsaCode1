const { supabase } = require('../config/supabase');
const { cifrarPassword } = require('../utils/password');
const { sinPassword, requerido } = require('../utils/helpers');

async function listar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, activo, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, activo, created_at, updated_at')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const faltantes = requerido(['nombre', 'email', 'password'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const { nombre, email, password, rol = 'empleado', activo = true } = req.body;
    const password_hash = await cifrarPassword(password);

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        email: email.toLowerCase().trim(),
        password_hash,
        rol: rol === 'admin' ? 'admin' : 'empleado',
        activo,
      })
      .select('id, nombre, email, rol, activo, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });
      }
      throw error;
    }

    res.status(201).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const cambios = { updated_at: new Date().toISOString() };
    const { nombre, email, password, rol, activo } = req.body;

    if (nombre !== undefined) cambios.nombre = nombre;
    if (email !== undefined) cambios.email = email.toLowerCase().trim();
    if (rol !== undefined) cambios.rol = rol === 'admin' ? 'admin' : 'empleado';
    if (activo !== undefined) cambios.activo = activo;
    if (password) cambios.password_hash = await cifrarPassword(password);

    const { data, error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('id', req.params.id)
      .select('id, nombre, email, rol, activo, created_at, updated_at')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    res.json({ ok: true, data: sinPassword(data) });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ ok: false, mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    res.json({ ok: true, mensaje: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
