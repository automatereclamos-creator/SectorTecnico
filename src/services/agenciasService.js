// src/services/agenciasService.js
import { supabase } from '../config/supabase';

/**
 * Caché de agencias en memoria.
 * Se carga una sola vez y se reutiliza en todos los hooks.
 * Estructura: { "Palpitos": { "1207": { nombre, horario, telefono }, ... }, "Alfa": { ... } }
 */
let _cache = null;
let _loading = null;

async function _loadCache() {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async () => {
    const { data, error } = await supabase
      .from('agencias')
      .select('id_agencia, empresa, nombre, telefono')
      .eq('activa', true)
      .order('id_agencia', { ascending: true });

    if (error) {
      console.error('Error cargando agencias:', error);
      _loading = null;
      return {};
    }

    const mapa = {};
    (data || []).forEach(ag => {
      const emp = (ag.empresa || 'Otros').trim().toLowerCase();
      if (!mapa[emp]) mapa[emp] = {};
      mapa[emp][ag.id_agencia] = {
        nombre: ag.nombre || '',
        telefono: ag.telefono || ''
      };
    });

    _cache = mapa;
    _loading = null;
    return _cache;
  })();

  return _loading;
}

/**
 * Busca una agencia por empresa + ID.
 * Retorna el objeto { nombre, telefono } si existe, o null si no.
 */
export async function buscarAgencia(empresa, idAgencia) {
  if (!empresa || !idAgencia) return null;
  const mapa = await _loadCache();
  const empKey = empresa.trim().toLowerCase();
  return mapa[empKey]?.[idAgencia] || null;
}

/**
 * Actualiza el teléfono de una agencia específica por empresa + id_agencia.
 */
export async function actualizarTelefonoAgencia(empresa, idAgencia, telefono) {
  if (!empresa || !idAgencia || !telefono) return;
  const { error } = await supabase
    .from('agencias')
    .update({ telefono: telefono.trim() })
    .eq('id_agencia', idAgencia.trim())
    .eq('empresa', empresa.trim().toLowerCase());

  if (error) {
    console.error('Error al actualizar teléfono de agencia:', error);
  } else {
    invalidarCacheAgencias();
  }
}

/**
 * Retorna el mapa completo de agencias (para lookups sincrónicos tras la carga).
 */
export async function getAgenciasMap() {
  return _loadCache();
}

/**
 * Invalida la caché para forzar recarga.
 */
export function invalidarCacheAgencias() {
  _cache = null;
  _loading = null;
}

/**
 * Evalúa dinámicamente si el mantenimiento sigue siendo válido (menor a 365 días).
 * Si tiene más de un año, se resetea a false en memoria.
 */
export function procesarMantenimiento(agencia) {
  if (!agencia) return agencia;
  
  let realizado = agencia.mantenimiento_realizado || false;
  const fechaUltimo = agencia.fecha_ultimo_mantenimiento;
  
  if (realizado && fechaUltimo) {
    const fechaMante = new Date(fechaUltimo);
    const hoy = new Date();
    const unAnoEnMs = 365 * 24 * 60 * 60 * 1000;
    
    if (hoy - fechaMante > unAnoEnMs) {
      realizado = false;
    }
  }
  
  return {
    ...agencia,
    mantenimiento_realizado: realizado
  };
}

/**
 * Obtiene todas las agencias registradas en la base de datos sin filtrar por estado activa.
 * Retorna la lista completa de agencias con todos sus metadatos.
 */
export async function fetchTodasLasAgencias() {
  const { data, error } = await supabase
    .from('agencias')
    .select('*')
    .order('id_agencia', { ascending: true });

  if (error) {
    console.error('Error al traer todas las agencias:', error);
    throw error;
  }
  
  return (data || []).map(ag => procesarMantenimiento(ag));
}

/**
 * Crea una nueva agencia en la base de datos e invalida la caché local.
 */
export async function crearAgencia(datos) {
  const { data, error } = await supabase
    .from('agencias')
    .insert([
      {
        id_agencia: datos.id_agencia.trim(),
        empresa: datos.empresa.trim().toLowerCase(),
        nombre: datos.nombre.trim(),
        activa: datos.activa !== undefined ? datos.activa : true,
        telefono: datos.telefono ? datos.telefono.trim() : null,
        horario_atencion: datos.horario_atencion ? datos.horario_atencion.trim() : null,
        latitud: datos.latitud ? parseFloat(datos.latitud) : null,
        longitud: datos.longitud ? parseFloat(datos.longitud) : null,
        altitud: datos.altitud ? parseFloat(datos.altitud) : null
      }
    ])
    .select();

  if (error) {
    console.error('Error al crear agencia:', error);
    throw error;
  }

  invalidarCacheAgencias();
  return data?.[0] || null;
}

/**
 * Actualiza los detalles de una agencia existente e invalida la caché local.
 */
export async function actualizarAgencia(id, datos) {
  const { data, error } = await supabase
    .from('agencias')
    .update({
      id_agencia: datos.id_agencia.trim(),
      empresa: datos.empresa.trim().toLowerCase(),
      nombre: datos.nombre.trim(),
      activa: datos.activa,
      telefono: datos.telefono ? datos.telefono.trim() : null,
      horario_atencion: datos.horario_atencion ? datos.horario_atencion.trim() : null,
      latitud: datos.latitud !== undefined && datos.latitud !== null && datos.latitud !== '' ? parseFloat(datos.latitud) : null,
      longitud: datos.longitud !== undefined && datos.longitud !== null && datos.longitud !== '' ? parseFloat(datos.longitud) : null,
      altitud: datos.altitud !== undefined && datos.altitud !== null && datos.altitud !== '' ? parseFloat(datos.altitud) : null
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al actualizar agencia:', error);
    throw error;
  }

  invalidarCacheAgencias();
  return data?.[0] || null;
}

/**
 * Activa o desactiva una agencia por ID e invalida la caché local.
 */
export async function toggleEstadoAgencia(id, estadoActual) {
  const { data, error } = await supabase
    .from('agencias')
    .update({ activa: !estadoActual })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al cambiar estado de agencia:', error);
    throw error;
  }

  invalidarCacheAgencias();
  return data?.[0] || null;
}

