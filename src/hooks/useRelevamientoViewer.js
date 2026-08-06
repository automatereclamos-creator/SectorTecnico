import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { storageService } from '../services/storageService';
import { useBuscadorGlobal } from './useBuscadorGlobal';

export const useRelevamientoViewer = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState(null);

  // Nuevos filtros Empresa y Categoría
  const [filtroEmpresa, setFiltroEmpresa] = useState("TODAS");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");

  // Mapa de insumos: código -> descripción
  const [insumosMap, setInsumosMap] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [json, insumosRes] = await Promise.all([
        storageService.getRelevamientos(),
        supabase.from('insumos').select('codigo, descripcion')
      ]);

      const map = {};
      if (insumosRes.data) {
        insumosRes.data.forEach(item => {
          if (item.codigo) {
            map[String(item.codigo).trim().toUpperCase()] = item.descripcion;
          }
          // Mapa inverso: descripcion -> codigo (para buscar cuando producto tiene el nombre)
          if (item.descripcion) {
            map[String(item.descripcion).trim().toUpperCase()] = item.descripcion;
          }
        });
      }
      setInsumosMap(map);
      setDatos(json);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Función para editar un equipo (solo auditor/admin)
  const actualizarEquipo = async (equipoId, datosEditados) => {
    try {
      await storageService.actualizarEquipo(equipoId, datosEditados);
      await fetchData(); // Refrescar datos después de editar
      return { success: true };
    } catch (err) {
      console.error("Error actualizando equipo:", err);
      return { success: false, error: err.message };
    }
  };

  // Función para dar de baja un equipo (borrado lógico)
  const darDeBajaEquipo = async (equipoId) => {
    try {
      await storageService.darDeBajaEquipo(equipoId);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Error dando de baja equipo:", err);
      return { success: false, error: err.message };
    }
  };

  // Extraer las categorías únicas de la base de datos para filtrado dinámico
  const categoriasDisponibles = useMemo(() => {
    const list = new Set();
    datos.forEach(d => {
      if (d.categoria) {
        list.add(d.categoria.toUpperCase().trim());
      }
    });
    return Array.from(list).sort();
  }, [datos]);

  // Filtrado a nivel de equipo/registro individual
  const datosFiltrados = useMemo(() => {
    return datos.filter(d => {
      // 1. Filtro Empresa
      if (filtroEmpresa !== "TODAS") {
        const empLower = String(d.empresa || "").toLowerCase();
        if (filtroEmpresa.toLowerCase() === "palpitos") {
          if (!empLower.includes("palpito")) return false;
        } else {
          if (!empLower.includes(filtroEmpresa.toLowerCase())) return false;
        }
      }
      // 2. Filtro Categoría
      if (filtroCategoria !== "TODAS") {
        if (String(d.categoria || "").toUpperCase() !== filtroCategoria.toUpperCase()) return false;
      }
      return true;
    });
  }, [datos, filtroEmpresa, filtroCategoria]);

  // 1. AGRUPAR (El armado de la tarjeta con Clave Compuesta, usando datos filtrados)
  const agenciasAgrupadasGlobal = useMemo(() => {
    const grupos = {};
    datosFiltrados.forEach(reg => {
      const empresaKey = reg.empresa ? String(reg.empresa).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'palpitos';
      const cleanId = String(reg.id_agencia || "").replace(/[\s\r\n]+/g, "").trim();
      const idUnico = `${empresaKey}_${cleanId}`;

      if (!grupos[idUnico]) {
        grupos[idUnico] = { idUnico, id: cleanId, nombre: String(reg.nombre_agencia || "").trim(), empresa: String(reg.empresa || "").trim(), equipos: [] };
      } else {
        if (reg.empresa) grupos[idUnico].empresa = String(reg.empresa).trim();
        if (reg.nombre_agencia) grupos[idUnico].nombre = String(reg.nombre_agencia).trim();
      }
      grupos[idUnico].equipos.push(reg);
    });
    return Object.values(grupos);
  }, [datosFiltrados]);

  // 2. Búsqueda por ID, Nombre de Agencia, o cualquier detalle de sus equipos/componentes
  const agenciasFiltradas = useMemo(() => {
    if (!filtro || typeof filtro !== 'string' || filtro.trim() === '') {
      return agenciasAgrupadasGlobal;
    }
    const cleanFiltro = filtro.toLowerCase().trim();

    return agenciasAgrupadasGlobal.filter(agencia => {
      // 1. Coincide con ID, Nombre o Empresa de la agencia
      if (String(agencia.id).toLowerCase().includes(cleanFiltro)) return true;
      if (String(agencia.nombre || '').toLowerCase().includes(cleanFiltro)) return true;
      if (String(agencia.empresa || '').toLowerCase().includes(cleanFiltro)) return true;

      // 2. O coincide con algún equipo/componente
      return agencia.equipos.some(eq => {
        if (String(eq.categoria || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.marca || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.producto || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.procesador || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.disco || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.memoria || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.nro_terminal || '').toLowerCase().includes(cleanFiltro)) return true;
        if (String(eq.detalles || '').toLowerCase().includes(cleanFiltro)) return true;

        // Buscar en la descripción del insumo (insumosMap)
        const cleanCode = String(eq.producto || '').trim().toUpperCase();
        const descInsumo = insumosMap[cleanCode];
        if (descInsumo && String(descInsumo).toLowerCase().includes(cleanFiltro)) return true;

        return false;
      });
    });
  }, [agenciasAgrupadasGlobal, filtro, insumosMap]);

  // 3. ESTADÍSTICAS GLOBALES (Calculadas sobre datos filtrados)
  const stats = useMemo(() => {
    const counts = { aio: 0, aioDeporte: 0, cpu: 0, cpuDeporte: 0, totalCriticos: 0, totalEquipos: 0 };
    datosFiltrados.forEach(d => {
      const cat = (d.categoria || "").toUpperCase().trim();
      const cant = parseInt(d.cantidad) || 1;
      counts.totalEquipos += cant;
      if (cat === "AIO") counts.aio += cant;
      else if (cat === "AIO DEPORTE") counts.aioDeporte += cant;
      else if (cat === "CPU") counts.cpu += cant;
      else if (cat === "CPU DEPORTE") counts.cpuDeporte += cant;
      if (["AIO", "AIO DEPORTE", "CPU", "CPU DEPORTE"].includes(cat)) counts.totalCriticos += cant;
    });
    return counts;
  }, [datosFiltrados]);

  // Función para dar de baja varios equipos en lote
  const darDeBajaEquipos = async (equipoIds) => {
    try {
      await storageService.darDeBajaEquipos(equipoIds);
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Error dando de baja equipos masivos:", err);
      return { success: false, error: err.message };
    }
  };

  return { 
    datos, 
    agenciasAgrupadas: agenciasFiltradas,
    loading, filtro, setFiltro, refresh: fetchData, stats, error,
    filtroEmpresa, setFiltroEmpresa,
    filtroCategoria, setFiltroCategoria,
    categoriasDisponibles,
    insumosMap,
    actualizarEquipo,
    darDeBajaEquipo,
    darDeBajaEquipos
  };
};