import { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';

const FILAS_POR_PAGINA = 15;

/**
 * Convierte texto de fecha/timestamp a milisegundos sin sufrir desfases de UTC
 */
const parseFechaToMs = (str) => {
  if (!str) return 0;
  const s = String(str).trim();

  // 1. Formato DD/MM/YYYY o DD/MM/YYYY HH:MM:SS
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [fechaPart, horaPart] = s.split(' ');
    const [dia, mes, anio] = fechaPart.split('/');
    const [horas, mins, segs] = (horaPart || '00:00:00').split(':');
    return new Date(Number(anio), Number(mes) - 1, Number(dia), Number(horas || 0), Number(mins || 0), Number(segs || 0)).getTime();
  }

  // 2. Formato YYYY-MM-DD o YYYY-MM-DD HH:MM:SS (sin Z de UTC)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const normalizado = s.replace(' ', 'T');
    if (!normalizado.includes('Z') && !normalizado.includes('+')) {
      const [fechaPart, horaPart] = normalizado.split('T');
      const [anio, mes, dia] = fechaPart.split('-');
      const [horas, mins, segs] = (horaPart || '00:00:00').split(':');
      return new Date(Number(anio), Number(mes) - 1, Number(dia), Number(horas || 0), Number(mins || 0), Number(segs || 0)).getTime();
    }
    return new Date(normalizado).getTime();
  }

  const ms = new Date(s).getTime();
  return isNaN(ms) ? 0 : ms;
};

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

    // 2. Ordenamiento Descendente Absoluto usando parseFechaToMs
    return filtrados.sort((a, b) => {
      const stringA = a.Timestamp || a.timestamp || a["Fecha Tarea"] || a.fechaTarea;
      const stringB = b.Timestamp || b.timestamp || b["Fecha Tarea"] || b.fechaTarea;

      const tiempoA = parseFechaToMs(stringA);
      const tiempoB = parseFechaToMs(stringB);

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
