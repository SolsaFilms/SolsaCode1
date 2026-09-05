const { supabase } = require('../config/supabase');
const { requerido } = require('../utils/helpers');

async function listar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rentas')
      .select(`
        *,
        clientes (id, nombre, email),
        peliculas (id, titulo),
        usuarios (id, nombre)
      `)
      .order('fecha_renta', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rentas')
      .select(`
        *,
        clientes (id, nombre, email),
        peliculas (id, titulo),
        usuarios (id, nombre)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Renta no encontrada' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const faltantes = requerido(['cliente_id', 'pelicula_id'], req.body);
    if (faltantes.length) {
      return res.status(400).json({ ok: false, mensaje: `Faltan: ${faltantes.join(', ')}` });
    }

    const { cliente_id, pelicula_id, total } = req.body;

    const { data: pelicula, error: errorPelicula } = await supabase
      .from('peliculas')
      .select('*')
      .eq('id', pelicula_id)
      .maybeSingle();

    if (errorPelicula) throw errorPelicula;
    if (!pelicula || !pelicula.activa) {
      return res.status(404).json({ ok: false, mensaje: 'Película no disponible' });
    }
    if (pelicula.existencias < 1) {
      return res.status(409).json({ ok: false, mensaje: 'Sin existencias para rentar' });
    }

    const { error: errorStock } = await supabase
      .from('peliculas')
      .update({
        existencias: pelicula.existencias - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pelicula_id);

    if (errorStock) throw errorStock;

    const { data, error } = await supabase
      .from('rentas')
      .insert({
        cliente_id,
        pelicula_id,
        usuario_id: req.usuario.id,
        total: total ?? pelicula.precio,
        estado: 'activa',
      })
      .select()
      .single();

    if (error) {
      await supabase
        .from('peliculas')
        .update({ existencias: pelicula.existencias })
        .eq('id', pelicula_id);
      throw error;
    }

    res.status(201).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function devolver(req, res, next) {
  try {
    const { data: renta, error: errorRenta } = await supabase
      .from('rentas')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (errorRenta) throw errorRenta;
    if (!renta) return res.status(404).json({ ok: false, mensaje: 'Renta no encontrada' });
    if (renta.estado === 'devuelta') {
      return res.status(409).json({ ok: false, mensaje: 'La renta ya fue devuelta' });
    }

    const { data, error } = await supabase
      .from('rentas')
      .update({
        estado: 'devuelta',
        fecha_devolucion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    const { data: pelicula } = await supabase
      .from('peliculas')
      .select('existencias')
      .eq('id', renta.pelicula_id)
      .maybeSingle();

    if (pelicula) {
      await supabase
        .from('peliculas')
        .update({
          existencias: pelicula.existencias + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', renta.pelicula_id);
    }

    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const cambios = { updated_at: new Date().toISOString() };
    const { estado, total, fecha_devolucion } = req.body;
    if (estado !== undefined) cambios.estado = estado;
    if (total !== undefined) cambios.total = total;
    if (fecha_devolucion !== undefined) cambios.fecha_devolucion = fecha_devolucion;

    const { data, error } = await supabase
      .from('rentas')
      .update(cambios)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Renta no encontrada' });
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rentas')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Renta no encontrada' });
    res.json({ ok: true, mensaje: 'Renta eliminada' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, devolver, actualizar, eliminar };
