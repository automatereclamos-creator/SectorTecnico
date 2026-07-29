import { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';

const FILAS_POR_PAGINA = 15;

export const useSoluciones = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const fetchSoluciones = async () => {
    setLoading(true);
    try {
      const res = await storageService.getSoluciones();
      setDatos(res);
    } catch (error) {
      console.error("Error cargando soluciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoluciones();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  const solucionesProcesadas = useMemo(() => {
    if (!datos || datos.length === 0) return [];

    // 1. Filtrado Inteligente
    const filtrados = datos.filter(s => {
      const searchStr = filtro.toLowerCase();
      
      const nombre = (s["Nombre / Sucursal"] || s.nombre || "").toLowerCase();
      const id = (s.ID || s.id || "").toString().toLowerCase();
      const trabajo = (s["Trabajo Realizado"] || s.trabajoRealizado || "").toLowerCase();
      const empresa = (s.Empresa || s.empresa || "").toLowerCase(); 

      return id.includes(searchStr) || 
             nombre.includes(searchStr) || 
             trabajo.includes(searchStr) || 
             empresa.includes(searchStr);
    });

    // 2. Ordenamiento Descendente Absoluto (Fecha + Hora exacta)
    return filtrados.sort((a, b) => {
      // Priorizamos el Timestamp porque trae la hora, minuto y segundo. 
      // Si por alguna razón falta, usamos la Fecha Tarea de respaldo.
      const stringA = a.Timestamp || a.timestamp || a["Fecha Tarea"] || a.fechaTarea;
      const stringB = b.Timestamp || b.timestamp || b["Fecha Tarea"] || b.fechaTarea;

      // Convertimos a milisegundos para una comparación matemática perfecta
      const tiempoA = new Date(stringA).getTime();
      const tiempoB = new Date(stringB).getTime();
      
      // Protegemos el código por si alguna celda del Excel está vacía o corrupta
      if (isNaN(tiempoA)) return 1;  // Manda los errores al fondo de la lista
      if (isNaN(tiempoB)) return -1; 
      
      // Restamos B - A para que el número más grande (más reciente) quede arriba
      return tiempoB - tiempoA;
    });
  }, [datos, filtro]);

  const totalPaginas = useMemo(() => {
    return Math.max(1, Math.ceil(solucionesProcesadas.length / FILAS_POR_PAGINA));
  }, [solucionesProcesadas.length]);

  const solucionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    return solucionesProcesadas.slice(inicio, inicio + FILAS_POR_PAGINA);
  }, [solucionesProcesadas, paginaActual]);

  return {
    soluciones: solucionesPaginadas,
    solucionesSinPaginar: solucionesProcesadas,
    loading,
    filtro,
    setFiltro,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    refresh: fetchSoluciones
  };
};