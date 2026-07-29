// src/services/perfilesService.js
import { supabase } from '../config/supabase';

/**
 * Caché de perfiles en memoria.
 * Reemplaza TECNICOS_MAP y ROLES_USUARIOS que estaban hardcodeados.
 */
let _perfilesCache = null;
let _loading = null;

async function _loadPerfiles() {
  if (_perfilesCache) return _perfilesCache;
  if (_loading) return _loading;

  _loading = (async () => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, email, nombre_completo, rol, activo')
      .eq('activo', true)
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error cargando perfiles:', error);
      _loading = null;
      return { map: {}, lista: [], perfiles: [] };
    }

    const perfiles = data || [];

    // TECNICOS_MAP: { "email@example.com": "Nombre Completo" }
    const map = {};
    perfiles.forEach(p => {
      if (p.email) map[p.email.toLowerCase()] = p.nombre_completo;
    });

    // TECNICOS: lista ordenada de nombres (roles técnico y admin)
    const lista = perfiles
      .filter(p => ['tecnico', 'admin'].includes(p.rol))
      .map(p => p.nombre_completo)
      .sort();

    _perfilesCache = { map, lista, perfiles };
    _loading = null;
    return _perfilesCache;
  })();

  return _loading;
}

/**
 * Retorna el nombre completo a partir del email.
 */
export async function getNombrePorEmail(email) {
  if (!email) return '';
  const { map } = await _loadPerfiles();
  return map[email.toLowerCase()] || '';
}

/**
 * Retorna la lista de nombres de técnicos para los selectores.
 */
export async function getListaTecnicos() {
  const { lista } = await _loadPerfiles();
  return lista;
}

/**
 * Retorna la lista de nombres de perfiles con rol 'soporte' para los selectores.
 */
export async function getListaSoporte() {
  const { perfiles } = await _loadPerfiles();
  return perfiles
    .filter(p => p.rol === 'soporte')
    .map(p => p.nombre_completo)
    .sort();
}

/**
 * Retorna el mapa completo email→nombre.
 */
export async function getTecnicosMap() {
  const { map } = await _loadPerfiles();
  return map;
}

/**
 * Retorna el mapa completo nombre→rol.
 */
export async function getRolesPorNombreMap() {
  const { perfiles } = await _loadPerfiles();
  const rolesMap = {};
  perfiles.forEach(p => {
    rolesMap[p.nombre_completo] = p.rol;
  });
  return rolesMap;
}

/**
 * Invalida la caché para forzar recarga.
 */
export function invalidarCachePerfiles() {
  _perfilesCache = null;
  _loading = null;
}

/**
 * Retorna todos los perfiles activos para selectores genéricos.
 */
export async function getTodosLosPerfilesActivos() {
  const { perfiles } = await _loadPerfiles();
  return perfiles.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
}
