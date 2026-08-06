// src/services/storageService.js
import { supabase } from '../config/supabase';
import { invalidarCacheAgencias } from './agenciasService';
import { getRolesPorNombreMap } from './perfilesService';

const INSUMOS_DICT = {
  "42LB5600-SB": "TV 42",
  "50A641GSC": "TV MOD 50A641GSC",
  "50A641GSV": "TV 50",
  "55U2": "TV 55 LED 55U2",
  "55UH6150": "TV SMART 55",
  "60UF8500": "TV 60",
  "AD50G4FN": "TV 50",
  "AIO-001": "AIO YTAIO",
  "AIO-002": "AIO HP 22B211BLA",
  "AIO-003": "AIO PLAYSOFT NEGRA",
  "AIO-004": "AIO PLAYSOFT GRIS",
  "AIO-005": "AIO NOBLEX",
  "AIO-006": "AIO INSPIRON 24\" (Blanca)",
  "AIO-007": "AIO INSPIRON 20\" (Negra)",
  "AIO-008": "AIO INSPIRON 22\" (Base)",
  "AIO-009": "AIO BANGHO",
  "AIO-010": "AIO PCBOX",
  "AIOC-001": "AIO PLAYSOFT NEGRA",
  "AIOC-002": "AIO PCBOX",
  "AIOC-003": "AIO DELL BLANCA",
  "AIOC-004": "AIO DELL NEGRA",
  "AIOC-005": "AIO HP",
  "AIOC-006": "AIO NOBLEX",
  "AIOD-001": "AIO PLAYSOFT NEGRA",
  "AIOD-002": "AIO PCBOX",
  "AIOD-003": "AIO DELL BLANCA",
  "AIOD-004": "AIO DELL NEGRA",
  "AIOD-005": "AIO HP",
  "AIOD-006": "AIO NOBLEX",
  "BGH BLE3216RTF": "TV BGH 32",
  "BGH BLE491GRTF": "TV BGH 49",
  "BLE4016RTF": "TV LED 40",
  "CAM-001": "CAMARA IP 2MP DS-2CD1023G2-I 2.8mm",
  "CAM-002": "CAMARA 3K COLORVU 2.8MM",
  "CDH-LE504KSMART22": "TV SMART 4K 50",
  "CPU-001": "CPU DEPORTE",
  "CPU-002": "CPU PUBLICIDAD",
  "CPU-003": "CPU CAMARAS",
  "DISC-MEC": "Mecanico",
  "DISC-S240": "SSD 240GB",
  "DISC-S256": "SSD 256GB",
  "DISC-S480": "SSD 480GB",
  "DK50X6500": "TV DE 50",
  "H4318FH5": "TV SMART 43",
  "HLE3917RTF": "TV 39",
  "IMP-001": "TICKETERAS EPSON TICKETERA T20",
  "IMP-002": "TICKETERAS EPSON TICKETERA T20II",
  "IMP-003": "TICKETERAS EPSON TICKETERA T20III",
  "IMP-C01": "IMPRESORA SISTEMA CONTINUO Y SCANNER L355",
  "IMP-C02": "IMPRESORA SISTEMA CONTINUO L3250",
  "IMP-L01": "HP LASER PRO M12W",
  "IMP-L02": "HP LASER JET 107 A",
  "IMP-L03": "HP LASER JET 107W",
  "IMP-L04": "HP LASER JET 1102W",
  "IMP-L05": "LASER JET M111A",
  "IMP-L06": "IMPRESORA LASER JET 1018",
  "IMP-O01": "IMPRESORA SISTEMA CONTINUO L3250",
  "IMP-T01": "IMPRESORA TM-T20IIIL",
  "JVC 39": "TV JVC 39",
  "MON-001": "MONITORES LG",
  "MON-002": "MONITORES PHILIPS",
  "MON-003": "MONITORES SAMSUNG",
  "MON-004": "MONITORES HP",
  "MON-005": "MONITORES AOC",
  "MON-006": "MONITORES KELIX",
  "MON-007": "MONITORES DAEWOO",
  "MOUSE-001": "MOUSE GENERICO",
  "MOUSE-002": "MOUSE LOGITECH",
  "MOUSE-003": "MOUSE GENIUS",
  "NOBLEX 50": "TV SMART 4K 50",
  "NOBLEX 75": "TV NOBLEX 75",
  "NOBLEX J50X6500": "TV NOBLEX 50",
  "OTR-001": "INTERCOMUNICADOR",
  "OTR-002": "CONTADORA DE BILLETES",
  "OTR-003": "CLASIFICADORA DOLARES",
  "OTR-004": "OTROS",
  "OTR-005": "OTROS/2",
  "PER-001": "FUENTE CPU GENERICA",
  "PER-002": "FUENTE AIO GENERICA",
  "PER-003": "MEMORIA RAM 4GB",
  "PER-004": "MEMORIA RAM 8GB",
  "PER-005": "DISCO SSD 240GB",
  "PER-006": "DISCO SSD 256GB",
  "PER-007": "DISCO SSD 480GB",
  "PER-008": "FICHA RJ45",
  "PER-009": "CABLE UTP",
  "PHILCO PLD43FS9A1": "TV PHILCO 43",
  "PROC-A4": "AMD A4",
  "PROC-CEL": "Intel Celeron",
  "PROC-I3-10": "i3 10ma",
  "PROC-I3-7": "i3 7ma",
  "PROC-I3-8": "i3 8va",
  "PROC-I3-9": "i3 9na",
  "PROC-I5-10": "I5 10ma",
  "PROC-I5-12": "i5 12va",
  "PROC-I5-8": "i5 8va",
  "PROC-I5-9": "I5 9na",
  "PROC-OTRO": "Otro",
  "PROC-R3": "AMD Ryzen 3 3200G",
  "PROC-R5": "AMD Ryzen 5 3400G",
  "PROC-SEM": "AMD Sempron",
  "RED-001": "SWITCH 5 BOCAS",
  "RED-002": "SWITCH 8 BOCAS",
  "RED-003": "SWITCH 8 BOCAS GIGABIT",
  "RED-004": "ROUTER MERCUSYS",
  "RED-005": "ROUTER B MERCUSYS",
  "RED-006": "ROUTER (VIEJO)",
  "RED-007": "UNIFY",
  "RED-008": "ROUTER MIKROTIK",
  "SAM-65": "TV SAMSUNG 65",
  "SANYO 24": "TV SANYO 24",
  "SCA-001": "SCANNER Z-3100",
  "SCA-002": "SCANNER Z-3220",
  "SRV-001": "SERVIDOR PRINCIPAL",
  "SRV-002": "SERVIDOR SECUNDARIO",
  "TCL L4256500": "TV TCL 42",
  "TEC-004": "TECLADO GENERICO",
  "TEC-005": "TECLADO LOGITECH",
  "TEC-006": "TECLADO GENIUS",
  "TK4319FK5": "TV SMART 43'",
  "X50AMDTV": "TV 50 RCA"
};

/**
 * Servicio central de datos — reemplaza la conexión a Google Sheets.
 * Cada método retorna datos en el formato que los hooks existentes esperan,
 * haciendo la traducción entre columnas de Supabase y los nombres legacy.
 */
export const storageService = {

  // ─── RECLAMOS ────────────────────────────────────────────────────────────────

  /**
   * Trae reclamos con estado PENDIENTE, con datos de agencia incluidos.
   */
  getReclamos: async () => {
    const { data, error } = await supabase
      .from('reclamos')
      .select(`
        id, informa, telefono, falla_reportada, horario_contacto, estado, fecha_carga,
        agencias ( id_agencia, empresa, nombre )
      `)
      .eq('estado', 'PENDIENTE')
      .order('fecha_carga', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      rowId: r.id,
      empresa: r.agencias?.empresa || '',
      id: r.agencias?.id_agencia || '',
      nombre: r.agencias?.nombre || '',
      informa: r.falla_reportada || '',
      telefono: r.telefono || '',
      horario: r.horario_contacto || '',
      carga: r.informa || '',
      estado: r.estado
    }));
  },

  getAllReclamos: async () => {
    const { data, error } = await supabase
      .from('reclamos')
      .select(`
        id, informa, telefono, falla_reportada, horario_contacto, estado, fecha_carga,
        agencias ( id_agencia, empresa, nombre )
      `)
      .order('fecha_carga', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      rowId: r.id,
      empresa: r.agencias?.empresa || '',
      id: r.agencias?.id_agencia || '',
      nombre: r.agencias?.nombre || '',
      informa: r.falla_reportada || '',
      telefono: r.telefono || '',
      horario: r.horario_contacto || '',
      carga: r.informa || '',
      estado: r.estado,
      fecha_carga: r.fecha_carga
    }));
  },

  actualizarReclamo: async (id, datos) => {
    const { data, error } = await supabase
      .from('reclamos')
      .update({
        falla_reportada: datos.informa,
        telefono: datos.telefono,
        horario_contacto: datos.horario,
        informa: datos.carga,
        estado: datos.estado
      })
      .eq('id', id)
      .select('agencia_id')
      .maybeSingle();

    if (error) throw error;

    // Sincronizar teléfono con la tabla de agencias si está provisto
    if (datos.telefono && datos.telefono.trim() && data?.agencia_id) {
      await supabase
        .from('agencias')
        .update({ telefono: datos.telefono.trim() })
        .eq('id', data.agencia_id);
      invalidarCacheAgencias();
    }
  },

  eliminarReclamo: async (id) => {
    const { error } = await supabase
      .from('reclamos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ─── SOLUCIONES ──────────────────────────────────────────────────────────────

  /**
   * Trae el historial de soluciones combinando la tabla normalizada
   * y la tabla temporal de migración (soluciones_temp).
   */
  getSoluciones: async () => {
    // 1. Soluciones nuevas (tabla normalizada)
    const { data: solNuevas, error: e1 } = await supabase
      .from('soluciones')
      .select(`
        id, trabajo_realizado, fecha, hora_inicio, hora_fin, total_horas,
        observaciones, creado_en,
        agencias ( id_agencia, empresa, nombre ),
        soluciones_tecnicos ( perfiles ( nombre_completo ) )
      `)
      .order('creado_en', { ascending: false });

    if (e1) throw e1;

    const nuevas = (solNuevas || []).map(s => {
      const tecnicos = (s.soluciones_tecnicos || []).map(st => st.perfiles?.nombre_completo || '');
      return {
        timestamp: s.creado_en,
        empresa: s.agencias?.empresa || '',
        id: s.agencias?.id_agencia || '',
        nombre: s.agencias?.nombre || '',
        trabajoRealizado: s.trabajo_realizado,
        fechaTarea: s.fecha,
        totalHoras: s.total_horas || '',
        'Técnico 1': tecnicos[0] || '',
        'Técnico 2': tecnicos[1] || '',
        'Técnico 3': tecnicos[2] || '',
      };
    });

    // 2. Soluciones migradas (tabla plana temporal)
    const { data: solTemp, error: e2 } = await supabase
      .from('soluciones_temp')
      .select('*')
      .order('Timestamp', { ascending: false });

    const migradas = (solTemp || []).map(s => ({
      timestamp: s.Timestamp,
      empresa: s.EMPRESA || '',
      id: s.ID || '',
      nombre: s.Nombre || '',
      trabajoRealizado: s.Solucion || '',
      fechaTarea: s.Fecha,
      totalHoras: s['Total Horas'] || '',
      'Técnico 1': s['Tecnico 1'] || '',
      'Técnico 2': s['Tecnico 2'] || '',
      'Técnico 3': '',
    }));

    // 3. Combinar y ordenar por fecha descendente
    return [...nuevas, ...migradas].sort((a, b) => {
      const ta = new Date(a.timestamp || a.fechaTarea).getTime() || 0;
      const tb = new Date(b.timestamp || b.fechaTarea).getTime() || 0;
      return tb - ta;
    });
  },

  /**
   * Genera los datos para el reporte de soluciones en un rango de fechas.
   */
  getReporteData: async (fechaDesde, fechaHasta, rolFiltro = 'Todos', filtroEmpresa = '', filtroAgenciaId = '') => {
    // 1. Obtener todas las soluciones y filtrarlas
    const todasLasSoluciones = await storageService.getSoluciones();
    const rolesPorNombre = await getRolesPorNombreMap();

    const fechaInicio = new Date(fechaDesde);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fechaHasta);
    fechaFin.setHours(23, 59, 59, 999);

    const solucionesFiltradas = todasLasSoluciones.filter(s => {
      const stringFecha = s.timestamp || s.fechaTarea;
      if (!stringFecha) return false;
      const d = new Date(stringFecha);
      if (isNaN(d.getTime())) return false;

      const inDateRange = d >= fechaInicio && d <= fechaFin;
      if (!inDateRange) return false;

      // Filtrado por Rol
      if (rolFiltro !== 'Todos') {
        const tecnicos = [s['Técnico 1'], s['Técnico 2'], s['Técnico 3']].filter(Boolean);
        const tieneRol = tecnicos.some(t => {
          const rol = rolesPorNombre[t];
          if (rolFiltro === 'Soporte') return rol === 'soporte';
          if (rolFiltro === 'Técnico') return rol === 'tecnico' || rol === 'admin';
          return false;
        });
        if (!tieneRol) return false;
      }

      if (filtroEmpresa && filtroEmpresa !== 'Todas' && filtroEmpresa !== 'Otros') {
        const empNorm = String(s.empresa || '').toLowerCase().trim();
        const fNorm = String(filtroEmpresa).toLowerCase().trim();
        if (!empNorm.includes(fNorm)) return false;
      }

      if (filtroAgenciaId && String(s.id).trim() !== String(filtroAgenciaId).trim()) {
        return false;
      }

      return true;
    });

    const totalSoluciones = solucionesFiltradas.length;

    // Agrupar por agencia y por operador
    const agenciasMap = {};
    const operadoresMap = {};
    solucionesFiltradas.forEach(s => {
      const agId = s.id || 'S/E';
      if (!agenciasMap[agId]) {
        agenciasMap[agId] = {
          id: agId,
          nombre: s.nombre || 'Agencia Sin Nombre',
          empresa: s.empresa || 'S/E',
          cantidad: 0
        };
      }
      agenciasMap[agId].cantidad++;

      // Agrupar por técnicos (cada solución suma +1 a cada técnico que participó)
      const tecnicos = [s['Técnico 1'], s['Técnico 2'], s['Técnico 3']].filter(t => t && t.trim() !== '');
      tecnicos.forEach(t => {
        const nombreTec = t.trim();
        if (!operadoresMap[nombreTec]) {
          operadoresMap[nombreTec] = {
            nombre: nombreTec,
            cantidad: 0
          };
        }
        operadoresMap[nombreTec].cantidad++;
      });
    });

    const rankingAgencias = Object.values(agenciasMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
    const rankingOperadores = Object.values(operadoresMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

    // 2. Obtener los insumos de las soluciones de la tabla nueva en ese rango
    const { data: insumosData, error: insumosError } = await supabase
      .from('soluciones_insumos')
      .select(`
        insumo_codigo,
        cantidad,
        soluciones!inner ( creado_en )
      `)
      .gte('soluciones.creado_en', fechaInicio.toISOString())
      .lte('soluciones.creado_en', fechaFin.toISOString());

    // 3. Obtener el diccionario de insumos para cruzar nombres (ya que no hay Foreign Key forzada)
    const { data: catalogoInsumos } = await supabase
      .from('insumos')
      .select('codigo, descripcion, nombre, marca');

    const dictInsumos = {};
    if (catalogoInsumos) {
      catalogoInsumos.forEach(ins => {
        // Guardamos la mejor descripción disponible
        dictInsumos[ins.codigo] = `${ins.marca ? ins.marca + ' ' : ''}${ins.descripcion || ins.nombre || ins.codigo}`.trim();
      });
    }

    const insumosMap = {};
    if (!insumosError && insumosData) {
      insumosData.forEach(item => {
        const codigo = item.insumo_codigo || 'SIN-CODIGO';
        // Buscamos primero en el diccionario duro, luego en BD, si no usamos el código
        const desc = INSUMOS_DICT[codigo] || dictInsumos[codigo] || codigo;

        if (!insumosMap[codigo]) {
          insumosMap[codigo] = {
            codigo,
            descripcion: desc,
            cantidad: 0
          };
        }
        insumosMap[codigo].cantidad += (item.cantidad || 1);
      });
    } else if (insumosError) {
      console.error("Error obteniendo insumos para el reporte:", insumosError);
    }

    const rankingInsumos = Object.values(insumosMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

    return {
      totalSoluciones,
      rankingAgencias,
      rankingInsumos,
      rankingOperadores
    };
  },

  /**
   * Obtiene y procesa los datos para el Reporte de Reclamos en un rango de fechas.
   */
  getReporteReclamosData: async (fechaInicioStr, fechaFinStr, filtroEmpresa = '', filtroAgenciaId = '') => {
    // 1. Convertir fechas y asegurar el día completo (00:00:00 a 23:59:59)
    const fechaInicio = new Date(fechaInicioStr);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fechaFinStr);
    fechaFin.setHours(23, 59, 59, 999);

    // 2. Traer reclamos en el periodo con sus agencias
    const { data: reclamosData, error } = await supabase
      .from('reclamos')
      .select(`
        id, informa, fecha_carga,
        agencias ( id_agencia, empresa, nombre )
      `)
      .gte('fecha_carga', fechaInicio.toISOString())
      .lte('fecha_carga', fechaFin.toISOString());

    if (error) {
      console.error("Error obteniendo datos del reporte de reclamos:", error);
      throw new Error("No se pudieron obtener los datos del reporte.");
    }

    let reclamosFiltrados = reclamosData || [];
    if (filtroEmpresa || filtroAgenciaId) {
      reclamosFiltrados = reclamosFiltrados.filter(r => {
        const emp = r.agencias?.empresa || '';
        const agId = r.agencias?.id_agencia || '';

        if (filtroEmpresa && filtroEmpresa !== 'Todas' && filtroEmpresa !== 'Otros') {
          const empNorm = String(emp).toLowerCase().trim();
          const fNorm = String(filtroEmpresa).toLowerCase().trim();
          if (!empNorm.includes(fNorm)) return false;
        }

        if (filtroAgenciaId && String(agId).trim() !== String(filtroAgenciaId).trim()) {
          return false;
        }
        return true;
      });
    }

    const totalReclamos = reclamosFiltrados.length;

    const operadoresMap = {};
    const agenciasMap = {};
    const diasMap = {};
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (reclamosFiltrados.length > 0) {
      reclamosFiltrados.forEach(r => {
        // Agrupar por operador (columna "informa" en la BD es el operador/carga)
        const operador = (r.informa || 'Sin Especificar').trim();
        if (!operadoresMap[operador]) {
          operadoresMap[operador] = { nombre: operador, cantidad: 0 };
        }
        operadoresMap[operador].cantidad++;

        // Agrupar por agencia
        const agId = r.agencias?.id_agencia || 'S/E';
        if (!agenciasMap[agId]) {
          agenciasMap[agId] = {
            id: agId,
            nombre: r.agencias?.nombre || 'Agencia Sin Nombre',
            empresa: r.agencias?.empresa || 'S/E',
            cantidad: 0
          };
        }
        agenciasMap[agId].cantidad++;

        // Agrupar por día de la semana
        if (r.fecha_carga) {
          const fecha = new Date(r.fecha_carga);
          const numDia = fecha.getDay();
          const nombreDia = nombresDias[numDia];
          if (!diasMap[nombreDia]) {
            diasMap[nombreDia] = { nombre: nombreDia, cantidad: 0, numDia };
          }
          diasMap[nombreDia].cantidad++;
        }
      });
    }

    // Top 10 operadores
    const rankingOperadores = Object.values(operadoresMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // Top 10 agencias
    const rankingAgencias = Object.values(agenciasMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // Días de la semana (ordenados por cantidad de mayor a menor)
    const rankingDias = Object.values(diasMap)
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalReclamos,
      rankingOperadores,
      rankingAgencias,
      rankingDias
    };
  },

  // ─── RELEVAMIENTOS (lee de equipos + agencias) ──────────────────────────────

  getRelevamientos: async () => {
    let allData = [];
    let from = 0;
    const step = 5000;
    let keepGoing = true;

    while (keepGoing) {
      const { data, error } = await supabase
        .from('equipos')
        .select(`
          id, categoria, producto, marca, cantidad, especificaciones, creado_en,
          agencias ( id_agencia, empresa, nombre )
        `)
        .eq('estado', 'INSTALADO')
        .order('creado_en', { ascending: false })
        .range(from, from + step - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allData = allData.concat(data);
        from += step;
        if (data.length < step) {
          keepGoing = false;
        }
      } else {
        keepGoing = false;
      }
    }

    const data = allData;

    return (data || []).map(eq => {
      const specs = eq.especificaciones || {};
      return {
        equipo_id: eq.id,
        empresa: eq.agencias?.empresa || '',
        id_agencia: eq.agencias?.id_agencia || '',
        nombre_agencia: eq.agencias?.nombre || '',
        categoria: eq.categoria,
        producto: eq.producto,
        marca: eq.marca || '',
        cantidad: eq.cantidad ?? 1,
        procesador: specs.procesador || 'N/A',
        disco: specs.disco || 'N/A',
        memoria: specs.memoria || 'N/A',
        nro_terminal: specs.nro_terminal || 'N/A',
        detalles: specs.detalles || 'N/A',
        timestamp: eq.creado_en,
      };
    });
  },

  /**
   * Actualiza un equipo existente en la tabla 'equipos'.
   * Solo disponible para roles auditor/admin.
   */
  actualizarEquipo: async (equipoId, datos) => {
    const updatePayload = {};
    if (datos.categoria !== undefined) updatePayload.categoria = datos.categoria;
    if (datos.producto !== undefined) updatePayload.producto = datos.producto;
    if (datos.marca !== undefined) updatePayload.marca = datos.marca;
    if (datos.cantidad !== undefined) updatePayload.cantidad = parseInt(datos.cantidad) || 1;

    // Construir especificaciones JSONB
    const specs = {};
    if (datos.procesador !== undefined) specs.procesador = datos.procesador || null;
    if (datos.disco !== undefined) specs.disco = datos.disco || null;
    if (datos.memoria !== undefined) specs.memoria = datos.memoria || null;
    if (datos.nro_terminal !== undefined) specs.nro_terminal = datos.nro_terminal || null;
    if (datos.detalles !== undefined) specs.detalles = datos.detalles || null;

    if (Object.keys(specs).length > 0) {
      updatePayload.especificaciones = specs;
    }

    updatePayload.actualizado_en = new Date().toISOString();

    const { error } = await supabase
      .from('equipos')
      .update(updatePayload)
      .eq('id', equipoId);

    if (error) throw error;
  },

  /**
   * Borrado físico de un equipo y sus componentes hijos.
   * Primero elimina los hijos (equipo_padre_id) y luego el padre.
   */
  darDeBajaEquipo: async (equipoId) => {
    // 1. Eliminar componentes hijos primero (para evitar FK constraint)
    const { data: hijos, error: errHijos } = await supabase
      .from('equipos')
      .select('id')
      .eq('equipo_padre_id', equipoId);

    if (errHijos) {
      console.error('Error buscando hijos para eliminar:', errHijos);
    }

    if (hijos && hijos.length > 0) {
      const idsHijos = hijos.map(h => h.id);
      const { error: errDelHijos } = await supabase
        .from('equipos')
        .delete()
        .in('id', idsHijos);

      if (errDelHijos) {
        console.error('Error eliminando hijos en cascada:', errDelHijos);
      }
    }

    // 2. Eliminar el equipo padre
    const { error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', equipoId);

    if (error) throw error;
  },

  /**
   * Borrado masivo de varios equipos y sus componentes hijos.
   */
  darDeBajaEquipos: async (equipoIds) => {
    if (!equipoIds || equipoIds.length === 0) return;

    // 1. Eliminar componentes hijos en cascada
    const { data: hijos, error: errHijos } = await supabase
      .from('equipos')
      .select('id')
      .in('equipo_padre_id', equipoIds);

    if (errHijos) {
      console.error('Error buscando hijos para borrado masivo:', errHijos);
    }

    if (hijos && hijos.length > 0) {
      const idsHijos = hijos.map(h => h.id);
      const { error: errDelHijos } = await supabase
        .from('equipos')
        .delete()
        .in('id', idsHijos);

      if (errDelHijos) {
        console.error('Error eliminando hijos en borrado masivo:', errDelHijos);
      }
    }

    // 2. Eliminar los equipos seleccionados
    const { error } = await supabase
      .from('equipos')
      .delete()
      .in('id', equipoIds);

    if (error) throw error;
  },

  // ─── GUARDAR TAREA (reclamo / solución / relevamiento) ──────────────────────

  saveTarea: async (payload) => {
    // ── RECLAMO ──
    if (payload.tipo === 'reclamo') {
      const agenciaId = await _resolveAgenciaId(payload.empresa, payload.id, payload.nombre);

      const { error } = await supabase.from('reclamos').insert([{
        agencia_id: agenciaId,
        falla_reportada: payload.informa || '',
        telefono: payload.telefono || '',
        horario_contacto: payload.horario || '',
        informa: payload.carga || '',
        estado: 'PENDIENTE',
        fecha_carga: new Date().toISOString(),
      }]);
      if (error) throw error;

      // Sincronizar teléfono con la tabla de agencias si está provisto
      if (payload.telefono && payload.telefono.trim()) {
        await supabase
          .from('agencias')
          .update({ telefono: payload.telefono.trim() })
          .eq('id', agenciaId);
        invalidarCacheAgencias();
      }

      return { result: 'reclamo_saved' };
    }

    // ── RELEVAMIENTO ──
    if (payload.tipo === 'relevamiento') {
      const agenciaId = await _resolveAgenciaId(payload.empresa, payload.id_agencia, payload.nombre_agencia);
      const equipos = JSON.parse(payload.equipos);
      const ahora = new Date().toISOString();

      const filas = equipos.map(eq => ({
        agencia_id: agenciaId,
        categoria: eq.categoria,
        producto: eq.producto,
        marca: eq.marca || null,
        cantidad: parseInt(eq.cantidad) || 1,
        estado: 'INSTALADO',
        especificaciones: {
          procesador: eq.procesador || null,
          disco: eq.disco || null,
          nro_terminal: eq.nro_terminal || null,
        },
        creado_en: ahora,
        actualizado_en: ahora,
      }));

      const { error } = await supabase.from('equipos').insert(filas);
      if (error) throw error;
      return { result: 'relevamiento_saved' };
    }

    // ── SOLUCIÓN (default) ──
    const agenciaId = await _resolveAgenciaId(payload.empresa, payload.id, payload.nombre);

    // 1. Insertar solución
    const { data: solData, error: solErr } = await supabase.from('soluciones').insert([{
      agencia_id: agenciaId,
      reclamo_id: payload.originRowId || null,
      trabajo_realizado: payload.trabajo,
      fecha: payload.fecha || null,
      hora_inicio: payload.hora_inicio || null,
      hora_fin: payload.hora_fin || null,
      total_horas: payload.total_horas || '',
      observaciones: payload.observaciones || '',
      creado_en: new Date().toISOString(),
    }]).select('id').single();
    if (solErr) throw solErr;

    const solucionId = solData.id;

    // 2. Vincular técnicos
    const tecNombres = [payload.tecnico1, payload.tecnico2, payload.tecnico3].filter(Boolean);
    if (tecNombres.length > 0) {
      const { data: perfiles } = await supabase
        .from('perfiles')
        .select('id, nombre_completo')
        .in('nombre_completo', tecNombres);

      if (perfiles && perfiles.length > 0) {
        const links = perfiles.map(p => ({ solucion_id: solucionId, perfil_id: p.id }));
        await supabase.from('soluciones_tecnicos').insert(links);
      }
    }

    // 3. Guardar insumos/materiales
    if (payload.materiales_consumidos && payload.materiales_consumidos !== '[]') {
      try {
        const materiales = JSON.parse(payload.materiales_consumidos);
        if (materiales.length > 0) {
          const filasMat = materiales.map(m => ({
            solucion_id: solucionId,
            insumo_codigo: m.codigo || null,
            cantidad: parseInt(m.cantidad) || 1,
            estado: m.estado || 'ALTA',
            condicion: m.condicion || 'USADO',
            serie: m.serie || null,
            creado_en: new Date().toISOString(),
          }));
          await supabase.from('soluciones_insumos').insert(filasMat);
        }
      } catch (e) {
        console.error('Error guardando insumos:', e);
      }
    }

    // 4. Marcar reclamo como SOLUCIONADO
    if (payload.originRowId) {
      await supabase
        .from('reclamos')
        .update({ estado: 'SOLUCIONADO' })
        .eq('id', payload.originRowId);
    }

    return { result: 'solucion_saved' };
  },

  // ─── REGISTRAR MANTENIMIENTO ───────────────────────────────────────────────
  saveMantenimiento: async (payload) => {
    const agenciaId = payload.uuid || await _resolveAgenciaId(payload.empresa, payload.id, payload.nombre);
    if (!agenciaId) throw new Error("No se pudo resolver la agencia");

    // 1. Insertar en la tabla 'mantenimientos'
    const { error: insErr } = await supabase.from('mantenimientos').insert([{
      agencia_id: agenciaId,
      observaciones: payload.observaciones || null,
      creado_por: payload.perfilId || null,
      fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    }]);
    if (insErr) throw insErr;

    // 2. Actualizar la tabla 'agencias'
    const { error: updErr } = await supabase.from('agencias').update({
      mantenimiento_realizado: true,
      fecha_ultimo_mantenimiento: new Date().toISOString().split('T')[0]
    }).eq('id', agenciaId);
    if (updErr) throw updErr;

    return { result: 'mantenimiento_saved' };
  },

  // ─── TAREAS ─────────────────────────────────────────────────────────────────

  /**
   * Trae todas las tareas (para el Panel Operativo), con datos de agencia y perfiles.
   */
  getAllTareas: async () => {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        id, descripcion, estado, fecha_creacion, contacto,
        agencias ( id_agencia, empresa, nombre ),
        asignado:perfiles!tareas_asignado_a_fkey ( nombre_completo ),
        creador:perfiles!tareas_creado_por_fkey ( nombre_completo )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      rowId: t.id,
      empresa: t.agencias?.empresa || '',
      id: t.agencias?.id_agencia || '',
      nombre: t.agencias?.nombre || '',
      descripcion: t.descripcion || '',
      contacto: t.contacto || '',
      estado: t.estado,
      asignado: t.asignado?.nombre_completo || '',
      creador: t.creador?.nombre_completo || '',
      fecha_creacion: t.fecha_creacion
    }));
  },

  /**
   * Trae tareas pendientes (para el panel del técnico).
   */
  getTareasPendientes: async () => {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        id, descripcion, estado, fecha_creacion, contacto,
        agencias ( id, id_agencia, empresa, nombre ),
        creador:perfiles!tareas_creado_por_fkey ( nombre_completo )
      `)
      .eq('estado', 'PENDIENTE')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      rowId: t.id,
      empresa: t.agencias?.empresa || '',
      id: t.agencias?.id_agencia || '',
      nombre: t.agencias?.nombre || '',
      agencia_uuid: t.agencias?.id || null,
      descripcion: t.descripcion || '',
      contacto: t.contacto || '',
      creador: t.creador?.nombre_completo || '',
      fecha_creacion: t.fecha_creacion
    }));
  },

  /**
   * Crea una nueva tarea.
   */
  crearTarea: async (payload) => {
    const agenciaId = await _resolveAgenciaId(payload.empresa, payload.id, payload.nombre);

    const { error } = await supabase.from('tareas').insert([{
      agencia_id: agenciaId,
      descripcion: payload.descripcion || '',
      asignado_a: payload.asignado_a || null,
      creado_por: payload.creado_por || null,
      contacto: payload.contacto || null,
      estado: 'PENDIENTE',
      fecha_creacion: new Date().toISOString()
    }]);

    if (error) throw error;
    return { result: 'tarea_saved' };
  },

  /**
   * Actualiza una tarea existente.
   */
  actualizarTarea: async (id, datos) => {
    const updatePayload = {};
    if (datos.descripcion !== undefined) updatePayload.descripcion = datos.descripcion;
    if (datos.estado !== undefined) updatePayload.estado = datos.estado;
    if (datos.asignado_a !== undefined) updatePayload.asignado_a = datos.asignado_a;
    if (datos.contacto !== undefined) updatePayload.contacto = datos.contacto;

    const { error } = await supabase
      .from('tareas')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Elimina una tarea permanentemente.
   */
  eliminarTarea: async (id) => {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ─── Helper interno: busca o crea agencia_id ────────────────────────────────
async function _resolveAgenciaId(empresa, idAgencia, nombre) {
  if (!empresa || !idAgencia) return null;
  const empNormalized = empresa.trim().toLowerCase();

  // Buscar agencia existente
  const { data } = await supabase
    .from('agencias')
    .select('id')
    .eq('empresa', empNormalized)
    .eq('id_agencia', String(idAgencia))
    .limit(1)
    .maybeSingle();

  if (data) return data.id;

  // Si no existe, crearla
  const { data: nueva, error } = await supabase
    .from('agencias')
    .insert([{ empresa: empNormalized, id_agencia: String(idAgencia), nombre: nombre || '', activa: true }])
    .select('id')
    .single();

  if (error) throw error;
  return nueva.id;
}
