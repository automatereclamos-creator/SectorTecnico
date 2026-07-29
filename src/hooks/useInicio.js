import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { storageService } from '../services/storageService';

export const useInicio = () => {
  const [loading, setLoading] = useState(true);
  const [soluciones, setSoluciones] = useState([]);
  const [reclamosPendientesList, setReclamosPendientesList] = useState([]);
  const [tareasPendientesList, setTareasPendientesList] = useState([]);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    try {
      // 1. Cargamos soluciones (historial completo de nuevas + migradas)
      let solucionesData = [];
      try {
        solucionesData = await storageService.getSoluciones();
      } catch (err) {
        console.error("Error cargando soluciones:", err);
      }

      // 2. Cargamos reclamos pendientes
      let reclamosRaw = [];
      try {
        const { data, error } = await supabase
          .from('reclamos')
          .select(`
            id, informa, telefono, falla_reportada, horario_contacto, estado, fecha_carga,
            agencias ( id_agencia, empresa, nombre )
          `)
          .eq('estado', 'PENDIENTE')
          .order('fecha_carga', { ascending: true });
        if (error) throw error;
        reclamosRaw = data || [];
      } catch (err) {
        console.error("Error cargando reclamos:", err);
      }

      // 3. Cargamos tareas pendientes
      let tareasRaw = [];
      try {
        tareasRaw = await storageService.getTareasPendientes();
      } catch (err) {
        console.error("Error cargando tareas:", err);
      }



      setSoluciones(solucionesData);
      setReclamosPendientesList(reclamosRaw);
      setTareasPendientesList(tareasRaw);
    } catch (error) {
      console.error("Error cargando dashboard unificado:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Lógica de cálculo en memoria para estadísticas (sin recargas adicionales)
  const metricas = useMemo(() => {
    let alfaCount = 0;
    let palpitosCount = 0;
    let totalMinutos = 0;
    let validTimeEntries = 0;
    const conteoAgencias = {};

    soluciones.forEach(s => {
      // 1. Distribución de Empresas
      const empresa = String(s.empresa || s.Empresa || '').toLowerCase();
      if (empresa.includes('alfa')) alfaCount++;
      else if (empresa.includes('palpito') || empresa.includes('pálpito')) palpitosCount++;

      // 2. Conteo de Demanda en Agencias
      const idAgencia = s.id || s.ID;
      const nombreAgencia = s.nombre || s["Nombre / Sucursal"] || 'S/N';
      if (idAgencia) {
        const labelCompleto = `ID ${idAgencia} - ${nombreAgencia}`;
        conteoAgencias[labelCompleto] = (conteoAgencias[labelCompleto] || 0) + 1;
      }

      // 3. Algoritmo de Tiempo Promedio de Respuesta
      const tiempoStr = String(s.totalHoras || s["Total Horas"] || '').toLowerCase();
      let minutos = 0;
      let hasTime = false;
      
      const horasMatch = tiempoStr.match(/(\d+)\s*h/);
      const minMatch = tiempoStr.match(/(\d+)\s*m/);

      if (horasMatch) {
        minutos += parseInt(horasMatch[1], 10) * 60;
        hasTime = true;
      }
      if (minMatch) {
        minutos += parseInt(minMatch[1], 10);
        hasTime = true;
      }
      
      if (hasTime) {
        totalMinutos += minutos;
        validTimeEntries++;
      }
    });

    const dataEmpresas = [
      { id: 0, value: alfaCount, label: 'ALFA', color: '#f97316' },
      { id: 1, value: palpitosCount, label: 'PÁLPITOS', color: '#4f46e5' }
    ];

    // Ordenar y tomar Top 5 agencias demandantes
    const agenciasOrdenadas = Object.entries(conteoAgencias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxDemanda = agenciasOrdenadas.length > 0 ? agenciasOrdenadas[0][1] : 1;
    
    const topAgenciasData = agenciasOrdenadas.map(item => ({
      label: item[0],
      cantidad: item[1],
      porcentaje: (item[1] / maxDemanda) * 100
    }));

    // Calcular promedio
    const promedioMinutos = validTimeEntries > 0 ? Math.round(totalMinutos / validTimeEntries) : 0;
    const horasPromedio = Math.floor(promedioMinutos / 60);
    const minsRestantes = promedioMinutos % 60;
    const tiempoPromedioStr = horasPromedio > 0 
        ? `${horasPromedio}h ${minsRestantes}min` 
        : `${minsRestantes}min`;

    return {
      solucionesTotalCount: soluciones.length,
      tiempoPromedioStr,
      dataEmpresas,
      topAgenciasData
    };
  }, [soluciones]);

  // Procesamos los reclamos urgentes (antiguos) con su estado de SLA
  const reclamosUrgentes = useMemo(() => {
    const ahora = new Date();
    return reclamosPendientesList.slice(0, 5).map(r => {
      const fechaCargaRaw = r.fecha_carga;
      const fechaCarga = new Date(fechaCargaRaw);
      const diffMs = ahora.getTime() - fechaCarga.getTime();
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      
      let slaStatus = 'NORMAL';
      if (diffHoras >= 24) {
        slaStatus = 'CRITICAL';
      } else if (diffHoras >= 12) {
        slaStatus = 'WARNING';
      }

      let tiempoTranscurridoStr = '';
      if (isNaN(fechaCarga.getTime())) {
        tiempoTranscurridoStr = 'Fecha desconocida';
      } else if (diffHoras === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        tiempoTranscurridoStr = `Hace ${diffMins} min`;
      } else if (diffHoras < 24) {
        tiempoTranscurridoStr = `Hace ${diffHoras} h`;
      } else {
        const dias = Math.floor(diffHoras / 24);
        tiempoTranscurridoStr = `Hace ${dias} día${dias > 1 ? 's' : ''}`;
      }

      return {
        rowId: r.id,
        empresa: r.agencias?.empresa || '',
        id: r.agencias?.id_agencia || '',
        nombre: r.agencias?.nombre || '',
        informa: r.falla_reportada || '',
        telefono: r.telefono || '',
        horario: r.horario_contacto || '',
        carga: r.informa || '',
        estado: r.estado,
        fechaCarga,
        tiempoTranscurridoStr,
        slaStatus
      };
    });
  }, [reclamosPendientesList]);

  // Procesamos las tareas urgentes (antiguas) con su estado de SLA
  const tareasUrgentes = useMemo(() => {
    const ahora = new Date();
    return tareasPendientesList.slice(0, 5).map(t => {
      const fechaCargaRaw = t.fecha_creacion;
      const fechaCarga = new Date(fechaCargaRaw);
      const diffMs = ahora.getTime() - fechaCarga.getTime();
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      
      let slaStatus = 'NORMAL';
      if (diffHoras >= 24) {
        slaStatus = 'CRITICAL';
      } else if (diffHoras >= 12) {
        slaStatus = 'WARNING';
      }

      let tiempoTranscurridoStr = '';
      if (isNaN(fechaCarga.getTime())) {
        tiempoTranscurridoStr = 'Fecha desconocida';
      } else if (diffHoras === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        tiempoTranscurridoStr = `Hace ${diffMins} min`;
      } else if (diffHoras < 24) {
        tiempoTranscurridoStr = `Hace ${diffHoras} h`;
      } else {
        const dias = Math.floor(diffHoras / 24);
        tiempoTranscurridoStr = `Hace ${dias} día${dias > 1 ? 's' : ''}`;
      }

      return {
        rowId: t.rowId,
        empresa: t.empresa,
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion,
        creador: t.creador || 'S/N',
        fechaCarga,
        tiempoTranscurridoStr,
        slaStatus
      };
    });
  }, [tareasPendientesList]);



  return {
    loading,
    kpis: {
      reclamosPendientes: reclamosPendientesList.length,
      tareasPendientes: tareasPendientesList.length,
      solucionesTotal: metricas.solucionesTotalCount,
      tiempoPromedioStr: metricas.tiempoPromedioStr
    },
    reclamosUrgentes,
    tareasUrgentes,
    metricas,
    refresh: cargarDatosDashboard
  };
};