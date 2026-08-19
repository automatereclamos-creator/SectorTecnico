import React, { useState } from 'react';
import { Search, RefreshCw, Clock, Calendar, User, Send, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { useSoluciones } from '../hooks/useSoluciones';
import ReporteSolucionesModal from './ReporteSolucionesModal';

const Soluciones = () => {
  const [modalReporteOpen, setModalReporteOpen] = useState(false);
  const { soluciones, loading, filtro, setFiltro, paginaActual, setPaginaActual, totalPaginas, refresh } = useSoluciones();

/**
 * Formatea la fecha a (DD/MM/YYYY) sin importar la zona horaria del servidor o navegador.
 */
const formatearFecha = (fechaRaw) => {
  if (!fechaRaw) return "-";
  const str = String(fechaRaw).trim();

  // 1. Si ya viene en formato DD/MM/YYYY (ej: "24/04/2026" o "24/04/2026 20:30")
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
    return str.split(' ')[0];
  }

  // 2. Si empieza como YYYY-MM-DD (ej: "2026-04-24", "2026-04-24T00:00:00.000Z", "2026-04-24 00:00:00")
  // Extraemos directamente del texto sin usar Date() para evitar que la zona horaria reste un día
  const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) {
    const [, anio, mes, dia] = matchIso;
    return `${dia}/${mes}/${anio}`;
  }

  // 3. Fallback para timestamps numéricos o fechas no estándar
  try {
    const fecha = new Date(str);
    if (isNaN(fecha.getTime())) return str;
    
    // Usamos getUTC* para asegurar que tome la fecha exacta ingresada
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const anio = fecha.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch (e) {
    return str;
  }
};

/**
 * Extrae la hora y minuto del Timestamp (HH:MM)
 */
const formatearHora = (fechaRaw) => {
  if (!fechaRaw) return "";
  try {
    const str = String(fechaRaw).trim();

    // Buscar directamente patrón de hora HH:MM en la cadena de texto
    const matchHora = str.match(/(\d{2}):(\d{2})/);
    if (matchHora) {
      return `${matchHora[1]}:${matchHora[2]}`;
    }

    const fecha = new Date(str);
    if (isNaN(fecha.getTime())) return "";

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  } catch (e) {
    return "";
  }
};

  /**
   * Asigna colores y etiquetas según la empresa
   */
  const getEmpresaColors = (empresaRaw) => {
    const emp = String(empresaRaw || '').toLowerCase().trim();
    if (emp.includes('alfa')) return { bg: 'rgba(234, 88, 12, 0.15)', text: '#ea580c', label: 'ALFA' }; 
    if (emp.includes('palpitos') || emp.includes('pálpitos')) return { bg: 'rgba(79, 70, 229, 0.15)', text: '#818cf8', label: 'PÁLPITOS' }; 
    return { bg: 'var(--bg-input)', text: 'var(--text-muted)', label: emp.toUpperCase() || 'S/E' }; 
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
      <RefreshCw className="animate-spin" size={32} style={{ marginRight: '10px' }} /> 
      Cargando historial de soluciones
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
      
      {/* BARRA DE BÚSQUEDA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: 'var(--bg-card)', padding: '15px 20px', borderRadius: '10px', border: '1px solid var(--border-md)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input 
            type="text" 
            placeholder="Filtrar por Empresa, Agencia, ID o Trabajo..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 15px 10px 45px', borderRadius: '8px', 
              border: '1px solid var(--border-md)', color: 'var(--text-main)', backgroundColor: 'var(--bg-input)', outline: 'none', transition: 'border 0.2s'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setModalReporteOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              borderRadius: '8px', border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
              fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            title="Generar reporte"
          >
            <BarChart2 size={18} color="#eab308" />
            Reporte
          </button>
          <button 
            onClick={refresh} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
            title="Actualizar datos"
          >
            <RefreshCw size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-md)' }}>
              <tr>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>FECHA</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>AGENCIA</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>TRABAJO REALIZADO</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>TIEMPO</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>TÉCNICOS</th>
              </tr>
            </thead>
            <tbody>
              {soluciones.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-hint)' }}>
                    No se encontraron soluciones con la búsqueda actual.
                  </td>
                </tr>
              ) : (
                soluciones.map((s, i) => {
                  const estiloEmpresa = getEmpresaColors(s.Empresa || s.empresa);
                  const horaEnvio = formatearHora(s.Timestamp || s.timestamp);

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      
                      {/* FECHA Y HORA FORMATEADAS */}
                      <td style={{ padding: '15px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            <Calendar size={14} color="var(--text-muted)" /> 
                            {formatearFecha(s["Fecha Tarea"] || s.fechaTarea)}
                          </div>
                          {horaEnvio && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-hint)', paddingLeft: '2px' }}>
                              <Send size={12} /> 
                              Cargado {horaEnvio}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* DATOS DE AGENCIA CON BADGE DE EMPRESA */}
                      <td style={{ padding: '15px 20px', verticalAlign: 'top' }}>
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ 
                            backgroundColor: estiloEmpresa.bg, 
                            color: estiloEmpresa.text, 
                            fontSize: '0.65rem', 
                            fontWeight: 'bold', 
                            padding: '3px 6px', 
                            borderRadius: '4px',
                            letterSpacing: '0.5px'
                          }}>
                            {estiloEmpresa.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>ID {s.ID || s.id}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s["Nombre / Sucursal"] || s.nombre}</div>
                      </td>

                      {/* DETALLE DEL TRABAJO */}
                      <td style={{ padding: '15px 20px', maxWidth: '400px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {s["Trabajo Realizado"] || s.trabajoRealizado}
                        </div>
                      </td>

                      {/* TIEMPO TOTAL */}
                      <td style={{ padding: '15px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 'bold' }}>
                          <Clock size={14} /> {s["Total Horas"] || s.totalHoras}
                        </div>
                      </td>

                      {/* CUADRILLA DE TÉCNICOS */}
                      <td style={{ padding: '15px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {[s["Técnico 1"], s["Técnico 2"], s["Técnico 3"]].filter(t => t && String(t).trim() !== "").map((t, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <User size={12} /> {t}
                            </div>
                          ))}
                        </div>
                      </td>
                      
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer', opacity: paginaActual === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
          </span>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer', opacity: paginaActual === totalPaginas ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
      
      {/* MODAL REPORTE */}
      <ReporteSolucionesModal 
        isOpen={modalReporteOpen}
        onClose={() => setModalReporteOpen(false)}
      />
    </div>
  );
};

export default Soluciones;
