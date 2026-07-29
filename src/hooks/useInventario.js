import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase';

// Caché local en memoria: sobrevive re-renders, se limpia al desmontar el módulo
const cache = new Map();

export const useInventario = () => {
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Buscador de agencias ────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('');
  const [agenciasResultados, setAgenciasResultados] = useState([]);
  const [equiposResultados, setEquiposResultados] = useState([]);
  const [buscandoAgencias, setBuscandoAgencias] = useState(false);

  // Filtros globales/locales
  const [filtroEmpresa, setFiltroEmpresa] = useState('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [highlightedEquipoId, setHighlightedEquipoId] = useState(null);

  // ── Buscador por Empresa e ID (Autocompletado) ────────────────────────────────
  const [agenciasDB, setAgenciasDB] = useState({});
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchUuid, setSearchUuid] = useState(null);
  const [searchIdHint, setSearchIdHint] = useState({ text: '', type: '', found: null });

  useEffect(() => {
    const cargarAgenciasDB = async () => {
      try {
        const { data: agData } = await supabase
          .from('agencias')
          .select('id, id_agencia, empresa, nombre')
          .eq('activa', true);

        if (agData) {
          const mapping = {};
          agData.forEach(ag => {
            const emp = String(ag.empresa).trim().toLowerCase();
            if (!mapping[emp]) mapping[emp] = {};
            mapping[emp][String(ag.id_agencia).trim()] = { id: ag.id, id_agencia: ag.id_agencia, nombre: ag.nombre, empresa: ag.empresa };
          });
          setAgenciasDB(mapping);
        }
      } catch (err) {
        console.error("Error cargando agencias en useInventario:", err);
      }
    };
    cargarAgenciasDB();
  }, []);

  const limpiarBuscadorAgencia = useCallback(() => {
    setSearchId('');
    setSearchNombre('');
    setSearchUuid(null);
    setSearchIdHint({ text: '', type: '', found: null });
  }, []);

  const handleSearchEmpresaChange = useCallback((e) => {
    const value = e.target.value;
    setSearchEmpresa(value);
    setFiltroEmpresa(value || 'TODAS');
    limpiarBuscadorAgencia();
  }, [limpiarBuscadorAgencia, setFiltroEmpresa]);

  const handleSearchIdChange = useCallback((e) => {
    const val = e.target.value.trim();
    setSearchId(val);
    setSearchUuid(null);

    if (searchEmpresa === "Otros" || !searchEmpresa) {
      setSearchIdHint({ text: '', type: '', found: null });
      return;
    }

    const empNorm = String(searchEmpresa).trim().toLowerCase();
    const agEncontrada = agenciasDB[empNorm]?.[val];

    if (agEncontrada) {
      setSearchNombre(agEncontrada.nombre);
      setSearchUuid(agEncontrada.id);
      setSearchIdHint({ text: "✓ Agencia encontrada", type: "ok", found: true });
    } else {
      setSearchNombre('');
      setSearchUuid(null);
      setSearchIdHint({ text: val ? "ID no encontrado" : "", type: "err", found: val ? false : null });
    }
  }, [searchEmpresa, agenciasDB]);

  // ── Top Agencias y Agencias Virtuales ───────────────────────────────────────
  const [agenciasTop, setAgenciasTop] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);

  const [conteosGlobales, setConteosGlobales] = useState({ oficina: 0, stock: 0 });
  const [agenciasVirtuales, setAgenciasVirtuales] = useState({ oficina: null, stock: null });

  // Cargar top agencias al montar
  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoadingTop(true);

        // 1. Buscamos los UUIDs de las agencias virtuales
        const { data: virtuales } = await supabase
          .from('agencias')
          .select('*')
          .in('id_agencia', ['1213', '9999']);

        const v_ofi = virtuales?.find(a => a.id_agencia === '1213') || null;
        const v_stk = virtuales?.find(a => a.id_agencia === '9999') || null;
        setAgenciasVirtuales({ oficina: v_ofi, stock: v_stk });

        // 2. Traemos equipos con su agencia (sacamos el filtro rígido para poder contar taller)
        const { data, error } = await supabase
          .from('equipos')
          .select('agencia_id, estado, agencias!inner(id, nombre, empresa, id_agencia)');

        if (error) throw error;

        // Agrupar y contar localmente
        const counts = {};
        let c_oficina = 0, c_stock = 0;

        data?.forEach(eq => {
          if (!eq.agencias) return;
          const aId = eq.agencias.id;
          const idAgenciaStr = String(eq.agencias.id_agencia).trim();

          // Agencias virtuales (compartidas): siempre se cuentan
          if (idAgenciaStr === '1213') {
            c_oficina++;
          } else if (idAgenciaStr === '9999') {
            c_stock++;
          } else {
            // Comerciales: Filtrar por empresa si hay filtro activo
            if (filtroEmpresa !== 'TODAS') {
              const empresaEq = String(eq.agencias.empresa || '').toLowerCase();
              if (empresaEq !== filtroEmpresa.toLowerCase()) return;
            }

            // Solo contamos los INSTALADOS para el TOP 10
            if (eq.estado === 'INSTALADO') {
              if (!counts[aId]) {
                counts[aId] = { ...eq.agencias, totalEquipos: 0 };
              }
              counts[aId].totalEquipos++;
            }
          }
        });

        setConteosGlobales({ oficina: c_oficina, stock: c_stock });

        // Ordenar y tomar los 10 primeros comerciales
        const top = Object.values(counts)
          .sort((a, b) => b.totalEquipos - a.totalEquipos)
          .slice(0, 10);

        setAgenciasTop(top);
      } catch (err) {
        console.error('Error cargando top agencias:', err);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTop();
  }, [filtroEmpresa]);

  const modoBusquedaActivo = useMemo(() => {
    return busqueda.trim().length >= 2 || filtroCategoria !== 'TODAS' || filtroEstado !== 'TODOS';
  }, [busqueda, filtroCategoria, filtroEstado]);

  useEffect(() => {
    if (!modoBusquedaActivo) {
      setAgenciasResultados([]);
      setEquiposResultados([]);
      return;
    }
    const timerId = setTimeout(async () => {
      setBuscandoAgencias(true);
      try {
        // 1. Consultar Agencias
        let queryAgencias = supabase.from('agencias').select('*');
        if (busqueda.trim().length >= 2) {
          queryAgencias = queryAgencias.or(`nombre.ilike.%${busqueda}%,id_agencia.ilike.%${busqueda}%`);
        }
        if (filtroEmpresa !== 'TODAS') {
          queryAgencias = queryAgencias.eq('empresa', filtroEmpresa.toLowerCase());
        }
        const { data: dataAgencias, error: errAgencias } = await queryAgencias.limit(50);
        if (errAgencias) throw errAgencias;

        // 2. Consultar Equipos
        let queryEquipos = supabase
          .from('equipos')
          .select('*, agencias!inner(id, id_agencia, empresa, nombre)');
        
        if (busqueda.trim().length >= 2) {
          queryEquipos = queryEquipos.or(`codigo_patrimonio.ilike.%${busqueda}%,producto.ilike.%${busqueda}%,marca.ilike.%${busqueda}%,categoria.ilike.%${busqueda}%`);
        }
        if (filtroCategoria !== 'TODAS') {
          queryEquipos = queryEquipos.eq('categoria', filtroCategoria);
        }
        if (filtroEstado !== 'TODOS') {
          queryEquipos = queryEquipos.eq('estado', filtroEstado);
        }
        if (filtroEmpresa !== 'TODAS') {
          queryEquipos = queryEquipos.eq('agencias.empresa', filtroEmpresa.toLowerCase());
        }

        const { data: dataEquipos, error: errEquipos } = await queryEquipos.limit(100);
        if (errEquipos) throw errEquipos;

        setAgenciasResultados(dataAgencias || []);
        setEquiposResultados(dataEquipos || []);
      } catch (err) {
        console.error('Error en búsqueda global / filtrada:', err);
      } finally {
        setBuscandoAgencias(false);
      }
    }, 350);
    return () => clearTimeout(timerId);
  }, [busqueda, filtroEmpresa, filtroCategoria, filtroEstado, modoBusquedaActivo]);

  // ── Carga de equipos con caché local ────────────────────────────────────────
  const fetchEquipos = useCallback(async (agencia, force = false) => {
    if (!agencia) return;
    const cacheKey = `equipos_${agencia.id}`;

    if (!force && cache.has(cacheKey)) {
      setEquipos(cache.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('equipos')
        .select('*')
        .eq('agencia_id', agencia.id)
        .order('categoria', { ascending: true });

      // FIX LOGICO: Las agencias comerciales solo muestran INSTALADOS. Las internas muestran todo.
      if (agencia.id_agencia !== '1213' && agencia.id_agencia !== '9999') {
        query = query.eq('estado', 'INSTALADO');
      }

      const { data, error } = await query;

      if (error) throw error;
      const resultado = data || [];
      cache.set(cacheKey, resultado);
      setEquipos(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!agenciaSeleccionada) {
      setEquipos([]);
      return;
    }
    fetchEquipos(agenciaSeleccionada);
  }, [agenciaSeleccionada, fetchEquipos]);

  // ── Estadísticas derivadas (sin DB) ─────────────────────────────────────────
  const stats = useMemo(() => {
    const total = equipos.length;
    const sinEtiquetar = equipos.filter(e => !e.codigo_patrimonio).length;
    const categorias = {};
    equipos.forEach(e => {
      const cat = e.categoria || 'SIN CATEGORÍA';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });
    return { total, sinEtiquetar, categorias };
  }, [equipos]);

  // ── Baja de equipo ───────────────────────────────────────────────────────────
  const procesarBaja = async (equipoId, motivo) => {
    try {
      const { error: e1 } = await supabase
        .from('equipos')
        .update({
          estado: 'EN TALLER',
          agencia_id: null,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', equipoId);
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from('movimientos_equipos')
        .insert([{
          equipo_id: equipoId,
          agencia_id: agenciaSeleccionada.id,
          tipo: 'BAJA',
          condicion: 'USADO',
          observaciones: motivo || 'Baja manual desde Panel de Inventario',
        }]);
      if (e2) throw e2;

      // CASCADA BAJA: Buscar componentes hijos y moverlos junto con el padre
      const { data: hijos, error: errHijos } = await supabase
        .from('equipos')
        .select('id')
        .eq('equipo_padre_id', equipoId);
      if (errHijos) throw errHijos;

      if (hijos && hijos.length > 0) {
        const idsHijos = hijos.map(h => h.id);
        const { error: errUpdHijos } = await supabase
          .from('equipos')
          .update({
            estado: 'EN TALLER',
            agencia_id: null,
            actualizado_en: new Date().toISOString(),
          })
          .in('id', idsHijos);
        if (errUpdHijos) throw errUpdHijos;

        const movsHijos = idsHijos.map(hijoId => ({
          equipo_id: hijoId,
          agencia_id: agenciaSeleccionada.id,
          tipo: 'BAJA',
          condicion: 'USADO',
          observaciones: `Cascada: Retirado junto con equipo padre. ${motivo || ''}`.trim(),
        }));
        const { error: errMovHijos } = await supabase
          .from('movimientos_equipos')
          .insert(movsHijos);
        if (errMovHijos) throw errMovHijos;
      }

      // Actualiza estado local y caché (filtrando tanto el padre como sus hijos)
      const actualizados = equipos.filter(e => e.id !== equipoId && e.equipo_padre_id !== equipoId);
      setEquipos(actualizados);
      cache.set(`equipos_${agenciaSeleccionada.id}`, actualizados);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ── Etiquetado de patrimonio (inline, sin recargar) ──────────────────────────
  const asignarPatrimonio = async (equipoId, codigo) => {
    try {
      const { error } = await supabase
        .from('equipos')
        .update({ codigo_patrimonio: codigo, actualizado_en: new Date().toISOString() })
        .eq('id', equipoId);
      if (error) throw error;

      const actualizados = equipos.map(e =>
        e.id === equipoId ? { ...e, codigo_patrimonio: codigo } : e
      );
      setEquipos(actualizados);
      cache.set(`equipos_${agenciaSeleccionada.id}`, actualizados);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ── Edición de especificaciones inline ───────────────────────────────────────
  const actualizarEquipo = async (equipoId, campos) => {
    console.log("actualizarEquipo iniciado para:", equipoId, "con campos:", campos);
    try {
      const { error } = await supabase
        .from('equipos')
        .update({ ...campos, actualizado_en: new Date().toISOString() })
        .eq('id', equipoId);
      if (error) throw error;

      // CASCADA ACTUALIZAR: Propagar estado y agencia_id a componentes hijos
      if (campos.estado || campos.agencia_id !== undefined) {
        const updatesHijo = { actualizado_en: new Date().toISOString() };
        if (campos.estado) updatesHijo.estado = campos.estado;
        if (campos.agencia_id !== undefined) updatesHijo.agencia_id = campos.agencia_id;

        console.log("Buscando hijos para actualizar en cascada con:", updatesHijo);
        const { data: hijos, error: errHijos } = await supabase
          .from('equipos')
          .select('id')
          .eq('equipo_padre_id', equipoId);
        if (errHijos) throw errHijos;

        console.log("Hijos encontrados para actualizar:", hijos);
        if (hijos && hijos.length > 0) {
          const idsHijos = hijos.map(h => h.id);
          const { error: errUpdHijos } = await supabase
            .from('equipos')
            .update(updatesHijo)
            .in('id', idsHijos);
          if (errUpdHijos) throw errUpdHijos;
          console.log("Hijos actualizados en la base de datos con éxito.");
        }
      }

      // Sincronizar estado reactivo local y caché tanto para el padre como para los hijos
      const actualizados = equipos.map(e => {
        if (e.id === equipoId) return { ...e, ...campos };
        if (e.equipo_padre_id === equipoId) {
          const updatedHijo = { ...e };
          if (campos.estado) updatedHijo.estado = campos.estado;
          if (campos.agencia_id !== undefined) updatedHijo.agencia_id = campos.agencia_id;
          return updatedHijo;
        }
        return e;
      });
      setEquipos(actualizados);
      cache.set(`equipos_${agenciaSeleccionada.id}`, actualizados);
      return { success: true };
    } catch (err) {
      console.error("Error en actualizarEquipo:", err);
      return { success: false, error: err.message };
    }
  };

  // ── Tracking: Historial y Búsqueda Global ────────────────────────────────────
  const buscarEquiposGlobal = async (termino) => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termino);
      let query = supabase
        .from('equipos')
        .select(`
          *,
          agencias(id_agencia, empresa, nombre)
        `);

      if (isUUID) {
        query = query.eq('id', termino);
      } else {
        query = query.or(`codigo_patrimonio.ilike.%${termino}%,producto.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const obtenerHistorialEquipo = async (equipoId) => {
    try {
      const { data, error } = await supabase
        .from('movimientos_equipos')
        .select(`
          *,
          agencias(id_agencia, empresa, nombre)
        `)
        .eq('equipo_id', equipoId)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const procesarAsignacion = async (equipoId, agenciaId, observaciones) => {
    console.log("procesarAsignacion iniciado para equipoId:", equipoId, "agenciaId:", agenciaId, "obs:", observaciones);
    try {
      // 1. Actualizar estado y agencia_id en el equipo
      const { error: e1 } = await supabase
        .from('equipos')
        .update({
          estado: 'INSTALADO',
          agencia_id: agenciaId,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', equipoId);
      if (e1) throw e1;

      // 2. Registrar movimiento de ALTA/ASIGNACION
      const { error: e2 } = await supabase
        .from('movimientos_equipos')
        .insert([{
          equipo_id: equipoId,
          agencia_id: agenciaId,
          tipo: 'ALTA',
          condicion: 'USADO',
          observaciones: observaciones || 'Asignación manual desde Panel de Inventario',
        }]);
      if (e2) throw e2;

      // CASCADA TRASLADO: Mover todos los componentes hijos a la nueva agencia
      console.log("Buscando componentes hijos para trasladar...");
      const { data: hijos, error: errHijos } = await supabase
        .from('equipos')
        .select('id')
        .eq('equipo_padre_id', equipoId);
      if (errHijos) throw errHijos;

      console.log("Componentes hijos encontrados para trasladar:", hijos);
      if (hijos && hijos.length > 0) {
        const idsHijos = hijos.map(h => h.id);
        const { error: errUpdHijos } = await supabase
          .from('equipos')
          .update({
            estado: 'INSTALADO',
            agencia_id: agenciaId,
            actualizado_en: new Date().toISOString(),
          })
          .in('id', idsHijos);
        if (errUpdHijos) throw errUpdHijos;
        console.log("Componentes hijos actualizados a la agencia", agenciaId, "en la base de datos.");

        const movsHijos = idsHijos.map(hijoId => ({
          equipo_id: hijoId,
          agencia_id: agenciaId,
          tipo: 'ALTA',
          condicion: 'USADO',
          observaciones: `Cascada: Trasladado junto con equipo padre. ${observaciones || ''}`.trim(),
        }));
        const { error: errMovHijos } = await supabase
          .from('movimientos_equipos')
          .insert(movsHijos);
        if (errMovHijos) throw errMovHijos;
        console.log("Registros de movimiento en cascada agregados para los componentes hijos.");
      }

      // Actualizar vista local si la agencia afectada es la seleccionada actualmente
      if (agenciaSeleccionada && agenciaSeleccionada.id === agenciaId) {
        refresh(); // refetch to get the new equipo
      }
      return { success: true };
    } catch (err) {
      console.error("Error en procesarAsignacion:", err);
      return { success: false, error: err.message };
    }
  };

  const seleccionarAgencia = (agencia) => {
    setAgenciaSeleccionada(agencia);
    setBusqueda('');
    setAgenciasResultados([]);
    setHighlightedEquipoId(null);
    limpiarBuscadorAgencia();
    setSearchEmpresa('');
  };

  const limpiarAgencia = () => {
    setAgenciaSeleccionada(null);
    setEquipos([]);
    setError(null);
    setHighlightedEquipoId(null);
    limpiarBuscadorAgencia();
    setSearchEmpresa('');
  };

  const seleccionarEquipoGlobal = (equipo) => {
    if (!equipo) return;
    const agencia = equipo.agencias;
    if (!agencia) return;
    setAgenciaSeleccionada(agencia);
    setBusqueda('');
    setAgenciasResultados([]);
    setEquiposResultados([]);
    setFiltroEmpresa('TODAS');
    setFiltroCategoria('TODAS');
    setFiltroEstado('TODOS');
    setHighlightedEquipoId(equipo.id);
    limpiarBuscadorAgencia();
    setSearchEmpresa('');
  };

  const refresh = () => fetchEquipos(agenciaSeleccionada, true); // fuerza re-fetch

  return {
    agenciaSeleccionada, seleccionarAgencia, limpiarAgencia,
    equipos, stats, loading, error,
    procesarBaja, asignarPatrimonio, actualizarEquipo, refresh,
    busqueda, setBusqueda, agenciasResultados, equiposResultados, buscandoAgencias,
    agenciasTop, loadingTop, conteosGlobales, agenciasVirtuales,
    buscarEquiposGlobal, obtenerHistorialEquipo, procesarAsignacion,
    filtroEmpresa, setFiltroEmpresa,
    filtroCategoria, setFiltroCategoria,
    filtroEstado, setFiltroEstado,
    modoBusquedaActivo,
    highlightedEquipoId, setHighlightedEquipoId, seleccionarEquipoGlobal,
    // Nuevos estados y funciones para el buscador autocomplete
    searchEmpresa, setSearchEmpresa,
    searchId, setSearchId,
    searchNombre,
    searchUuid,
    searchIdHint,
    handleSearchEmpresaChange,
    handleSearchIdChange,
    limpiarBuscadorAgencia
  };
};