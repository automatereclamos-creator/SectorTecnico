// src/constants/roles.js

/**
 * Mapa centralizado de permisos — ÚNICA FUENTE DE VERDAD.
 * Cualquier componente que necesite verificar permisos debe importar desde aquí.
 */
export const PERMISOS = {
  soporte: ['tecnico', 'admin'],
  relevamiento: ['auditor', 'admin'],
  visor: ['auditor', 'admin'],
  pizarra: ['admin'],
  panel: ['admin', 'encargado', 'soporte'],
  ruta: ['tecnico', 'admin']
};