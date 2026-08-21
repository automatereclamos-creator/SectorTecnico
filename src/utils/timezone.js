// src/utils/timezone.js
//
// Zona horaria fija de la aplicación: Brasília / Argentina (UTC-3, sin horario
// de verano desde 2019). Se usa un IANA timezone explícito en vez de confiar
// en la zona horaria del dispositivo/navegador/servidor donde corre la app,
// para que TODO el sistema muestre siempre la misma hora sin importar dónde
// se ejecute (evita desfasajes de 3hs si el entorno está en UTC u otra zona).
export const APP_TIMEZONE = 'America/Sao_Paulo';

/**
 * Devuelve la fecha de HOY como "YYYY-MM-DD" en APP_TIMEZONE,
 * sin pasar nunca por toISOString() (que usa UTC).
 */
export function hoyISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Formatea un timestamp (Date, string ISO con hora, o número) a "DD/MM/YYYY"
 * en APP_TIMEZONE. Para strings de fecha "pura" (YYYY-MM-DD sin hora), usar
 * el formateo literal por texto en su lugar (no hace falta zona horaria).
 */
export function formatearFechaTZ(fechaOrStr) {
  if (!fechaOrStr) return '-';
  const d = fechaOrStr instanceof Date ? fechaOrStr : new Date(fechaOrStr);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatea un timestamp a "HH:MM" (24hs) en APP_TIMEZONE.
 */
export function formatearHoraTZ(fechaOrStr) {
  if (!fechaOrStr) return '';
  const d = fechaOrStr instanceof Date ? fechaOrStr : new Date(fechaOrStr);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formatea fecha + hora completa ("DD/MM/YYYY, HH:MM") en APP_TIMEZONE.
 */
export function formatearFechaHoraTZ(fechaOrStr) {
  if (!fechaOrStr) return '-';
  const d = fechaOrStr instanceof Date ? fechaOrStr : new Date(fechaOrStr);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: APP_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}
