import { supabase } from '../config/supabase';

// ─── FALLBACK: Se usa si la tabla bom_plantillas no existe o falla ───
const FALLBACK_BOM_TEMPLATES = {
  'CPU': [
    { categoria: 'COMPONENTES', producto: 'Fuente Original (Genérica)' },
    { categoria: 'COMPONENTES', producto: 'Placa Madre Original (Genérica)' },
    { categoria: 'COMPONENTES', producto: 'Memoria RAM 8GB (Original)' }
  ],
  'AIO': [
    { categoria: 'COMPONENTES', producto: 'Cargador / Fuente Externa Original' },
    { categoria: 'COMPONENTES', producto: 'Placa Madre AIO Original' },
    { categoria: 'COMPONENTES', producto: 'Memoria RAM SODIMM Original' }
  ]
};

/**
 * Dada una categoría de equipo, devuelve la clave BOM que aplica (o null).
 * Ej: 'CPU' → 'CPU', 'AIO 21.5"' → 'AIO', 'MONITOR' → null
 */
export const getBomKey = (categoria) => {
  const cat = String(categoria).trim().toUpperCase();
  if (cat === 'CPU') return 'CPU';
  if (cat.includes('AIO')) return 'AIO';
  return null;
};

/**
 * Obtiene las plantillas BOM desde la tabla `bom_plantillas`.
 * Si falla o la tabla está vacía, devuelve el fallback hardcodeado.
 *
 * @returns {Object} { 'CPU': [{ categoria, producto }, ...], 'AIO': [...] }
 */
export const fetchBomTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('bom_plantillas')
      .select('categoria_padre, categoria_hijo, producto_hijo')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const templates = {};
      data.forEach(row => {
        if (!templates[row.categoria_padre]) templates[row.categoria_padre] = [];
        templates[row.categoria_padre].push({
          categoria: row.categoria_hijo,
          producto: row.producto_hijo
        });
      });
      return templates;
    }

    return FALLBACK_BOM_TEMPLATES;
  } catch (err) {
    console.warn('⚠ Error cargando bom_plantillas, usando fallback:', err);
    return FALLBACK_BOM_TEMPLATES;
  }
};

export { FALLBACK_BOM_TEMPLATES };
