import { useMemo } from 'react';

/**
 * Hook universal para filtrar listas de objetos.
 * @param {Array} datos - El array original completo que queremos filtrar.
 * @param {String} textoBusqueda - Lo que el usuario escribió en el input.
 * @param {Array} campos - Array de strings con las propiedades donde debe buscar (ej: ['id', 'nombre']).
 * @returns {Array} - El array filtrado.
 */
export const useBuscadorGlobal = (datos, textoBusqueda, campos) => {
  const datosFiltrados = useMemo(() => {
    // 1. Si la lista original está vacía o no es válida, devolvemos vacío
    if (!datos || !Array.isArray(datos)) return [];

    // 2. Si el buscador está vacío, devolvemos la lista entera intacta
    if (!textoBusqueda || typeof textoBusqueda !== 'string' || textoBusqueda.trim() === '') {
      return datos;
    }

    // 3. Normalizamos la palabra buscada (minúsculas y sin espacios extra)
    const filtro = textoBusqueda.toLowerCase().trim();

    // 4. Motor de búsqueda blindado
    return datos.filter(item => {
      try {
        // 'some' verifica si AL MENOS UN campo coincide con la búsqueda
        return campos.some(campo => {
          const valorCampo = item[campo];
          
          // Si la celda estaba vacía en la base de datos, la salteamos
          if (valorCampo === null || valorCampo === undefined) return false;
          
          // Convertimos a texto y buscamos
          return String(valorCampo).toLowerCase().includes(filtro);
        });
      } catch (err) {
        // Si una tarjeta tiene datos corruptos, la ignora en vez de crashear la app
        return false;
      }
    });
  }, [datos, textoBusqueda, campos]); // Solo se recalcula si cambia la lista, la palabra o los campos

  return datosFiltrados;
};