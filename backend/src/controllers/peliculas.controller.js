const { supabase } = require('../config/supabase');
const { requerido } = require('../utils/helpers');

async function listar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('peliculas')
      .select('*')
      .order('titulo', { ascending: true });

    if (error) throw error;
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('peliculas')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Película no encontrada' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const faltantes = requerido(['titulo'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const {
      titulo,
      director,
      genero,
      anio,
      duracion_min,
      clasificacion,
      sinopsis,
      existencias = 0,
      precio = 0,
      activa = true,
    } = req.body;

    const { data, error } = await supabase
      .from('peliculas')
      .insert({
        titulo,
        director,
        genero,
        anio,
        duracion_min,
        clasificacion,
        sinopsis,
        existencias,
        precio,
        activa,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const permitidos = [
      'titulo', 'director', 'genero', 'anio', 'duracion_min',
      'clasificacion', 'sinopsis', 'existencias', 'precio', 'activa',
    ];
    const cambios = { updated_at: new Date().toISOString() };
    for (const campo of permitidos) {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    }

    const { data, error } = await supabase
      .from('peliculas')
      .update(cambios)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Película no encontrada' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('peliculas')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Película no encontrada' });
    res.json({ ok: true, mensaje: 'Película eliminada' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
