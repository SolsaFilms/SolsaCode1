const { supabase } = require('../config/supabase');
const { requerido } = require('../utils/helpers');

async function listar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const faltantes = requerido(['nombre'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const { nombre, email, telefono } = req.body;
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre,
        email: email ? email.toLowerCase().trim() : null,
        telefono,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'El correo del cliente ya existe' });
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
    const { nombre, email, telefono } = req.body;
    if (nombre !== undefined) cambios.nombre = nombre;
    if (email !== undefined) cambios.email = email ? email.toLowerCase().trim() : null;
    if (telefono !== undefined) cambios.telefono = telefono;

    const { data, error } = await supabase
      .from('clientes')
      .update(cambios)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, mensaje: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
