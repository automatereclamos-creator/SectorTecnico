import React from 'react';
import {
  AlertCircle, CheckCircle2, Clock, AlertTriangle, TrendingUp, RefreshCw, Phone, User as UserIcon, Activity, ClipboardList, Car
} from 'lucide-react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useInicio } from '../hooks/useInicio';

const Inicio = ({ setModuloActivo, userData }) => {
  const { loading, kpis, reclamosUrgentes, tareasUrgentes, metricas, refresh } = useInicio();

  const getSlaBadgeStyles = (status) => {
    switch (status) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', text: 'Retrasado (>24h)' };
      case 'WARNING':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', text: 'Atención (>12h)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', text: 'Reciente' };
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
      <RefreshCw className="animate-spin" size={40} style={{ color: 'var(--accent-blue)', marginBottom: '15px' }} />
      <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-main)' }}>
        Cargando Centro de Control Operativo
      </span>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-hint)', marginTop: '5px' }}>
        Conectando a base de datos y cargando indicadores...
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', paddingRight: '5px' }}>

      {/* HEADER DE CONTROL */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        backgroundColor: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-blue)" />
            INICIO
          </h2>
          <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Información general del sistema.
          </p>
        </div>

        {/* Indicador de Estado del Sistema */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-input)', padding: '6px 12px', borderRadius: '30px', border: '1px solid var(--border-md)' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            Online
          </span>
          <button
            onClick={refresh}
            style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '5px', padding: '2px', transition: 'color 0.2s' }}
            title="Sincronizar Panel"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-hint)'}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 1. TARJETAS KPI DE ESTADO CRÍTICO (LIVE INDICATORS) */}
      <div className="kpi-corporate-grid">

        {/* KPI: Reclamos Activos */}
        <div
          className="kpi-corporate-card"
          style={{
            '--card-accent': 'var(--error)',
            '--card-accent-hover': '#ef4444',
            '--card-glow': 'rgba(239, 68, 68, 0.15)',
            '--card-glow-hover': 'rgba(239, 68, 68, 0.25)',
            '--card-bg-icon': 'rgba(239, 68, 68, 0.08)',
            '--card-bg-badge': 'rgba(239, 68, 68, 0.06)'
          }}
          onClick={() => setModuloActivo('reclamos')}
        >
          <div className="kpi-corporate-header">
            <span className="kpi-corporate-title">Reclamos Pendientes</span>
            <div className="kpi-corporate-icon-wrapper">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-corporate-body">
            <span className="kpi-corporate-value">{kpis.reclamosPendientes}</span>
            <div className="kpi-corporate-footer">
              <span className="kpi-corporate-badge">
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--error)', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} />
                Cola Activa
              </span>
              <span>Requiere atención técnica</span>
            </div>
          </div>
        </div>

        {/* KPI: Tareas Pendientes */}
        <div
          className="kpi-corporate-card"
          style={{
            '--card-accent': '#6366f1',
            '--card-accent-hover': '#8b5cf6',
            '--card-glow': 'rgba(99, 102, 241, 0.15)',
            '--card-glow-hover': 'rgba(99, 102, 241, 0.25)',
            '--card-bg-icon': 'rgba(99, 102, 241, 0.08)',
            '--card-bg-badge': 'rgba(99, 102, 241, 0.06)'
          }}
          onClick={() => setModuloActivo('tareas')}
        >
          <div className="kpi-corporate-header">
            <span className="kpi-corporate-title">Tareas Pendientes</span>
            <div className="kpi-corporate-icon-wrapper">
              <ClipboardList size={20} />
            </div>
          </div>
          <div className="kpi-corporate-body">
            <span className="kpi-corporate-value">{kpis.tareasPendientes}</span>
            <div className="kpi-corporate-footer">
              <span className="kpi-corporate-badge">
                <span style={{ width: '6px', height: '6px', backgroundColor: '#6366f1', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} />
                Cola Activa
              </span>
              <span>Trabajos programados</span>
            </div>
          </div>
        </div>

        {/* KPI: Soluciones */}
        <div
          className="kpi-corporate-card"
          style={{
            '--card-accent': 'var(--accent-blue)',
            '--card-accent-hover': '#38bdf8',
            '--card-glow': 'rgba(2, 132, 199, 0.15)',
            '--card-glow-hover': 'rgba(2, 132, 199, 0.25)',
            '--card-bg-icon': 'rgba(2, 132, 199, 0.08)',
            '--card-bg-badge': 'rgba(2, 132, 199, 0.06)'
          }}
          onClick={() => setModuloActivo('soluciones')}
        >
          <div className="kpi-corporate-header">
            <span className="kpi-corporate-title">Soluciones Registradas</span>
            <div className="kpi-corporate-icon-wrapper">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-corporate-body">
            <span className="kpi-corporate-value">{kpis.solucionesTotal}</span>
            <div className="kpi-corporate-footer">
              <span className="kpi-corporate-badge">
                Historial de Trabajo
              </span>
              <span>Total acumulado</span>
            </div>
          </div>
        </div>

        {/* KPI: Tiempo Promedio */}
        <div
          className="kpi-corporate-card"
          style={{
            '--card-accent': 'var(--warning)',
            '--card-accent-hover': '#fbbf24',
            '--card-glow': 'rgba(245, 158, 11, 0.15)',
            '--card-glow-hover': 'rgba(245, 158, 11, 0.25)',
            '--card-bg-icon': 'rgba(245, 158, 11, 0.08)',
            '--card-bg-badge': 'rgba(245, 158, 11, 0.06)'
          }}
        >
          <div className="kpi-corporate-header">
            <span className="kpi-corporate-title">Tiempo Promedio Resolución</span>
            <div className="kpi-corporate-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-corporate-body">
            <span className="kpi-corporate-value">{kpis.tiempoPromedioStr}</span>
            <div className="kpi-corporate-footer">
              <span className="kpi-corporate-badge">
                Eficiencia SLA
              </span>
              <span>Meta de resolución &lt; 24h</span>
            </div>
          </div>
        </div>



      </div>

      {/* 2. LAYOUT PARALELO (PC: 3 Columnas | Móvil: 1 Columna) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

        {/* COLUMNA IZQUIERDA: ALERTA DE SLA / TICKETS RETRASADOS (30% de ancho aproximado) */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              <AlertTriangle size={18} color="#ef4444" /> Reclamos
            </h3>
          </div>

          <div className="custom-scrollbar" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            maxHeight: '520px',
            overflowY: 'auto'
          }}>

            {reclamosUrgentes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-hint)' }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>¡Sin reclamos retrasados!</span>
                <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>La cola de tickets de soporte técnico se encuentra limpia.</p>
              </div>
            ) : (
              reclamosUrgentes.map((ticket) => {
                const sla = getSlaBadgeStyles(ticket.slaStatus);
                return (
                  <div
                    key={ticket.rowId}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: '8px',
                      padding: '14px',
                      border: '1px solid var(--border-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {/* Fila superior con el SLA y Tiempo */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: sla.bg, color: sla.color, textTransform: 'uppercase'
                      }}>
                        {sla.text}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Clock size={12} />
                        {ticket.tiempoTranscurridoStr}
                      </span>
                    </div>

                    {/* Información de Agencia */}
                    <div style={{ margin: '2px 0' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        ID {ticket.id} - {ticket.nombre}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-hint)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Empresa: {ticket.empresa}
                        </span>
                        {ticket.telefono && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} color="var(--accent-blue)" /> {ticket.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalles de la Falla */}
                    <div style={{
                      fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45',
                      backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)'
                    }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>FALLA REPORTADA:</strong>
                      <p style={{ margin: '2px 0 0 0' }}>{ticket.informa || "No se especificó detalle de la falla."}</p>
                    </div>

                    {/* Footer de información */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-hint)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={12} />
                        Informa: {ticket.carga || 'Técnico'}
                      </span>
                      {ticket.horario && (
                        <span>Horario: {ticket.horario}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* COLUMNA CENTRO: TAREAS PENDIENTES (30% de ancho aproximado) */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              <ClipboardList size={18} color="var(--accent-blue)" /> Tareas
            </h3>
          </div>

          <div className="custom-scrollbar" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            maxHeight: '520px',
            overflowY: 'auto'
          }}>

            {tareasUrgentes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-hint)' }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>¡Sin tareas pendientes!</span>
                <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>La cola de tareas se encuentra limpia.</p>
              </div>
            ) : (
              tareasUrgentes.map((tarea) => {
                const sla = getSlaBadgeStyles(tarea.slaStatus);
                return (
                  <div
                    key={tarea.rowId}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: '8px',
                      padding: '14px',
                      border: '1px solid var(--border-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {/* Fila superior con el SLA y Tiempo */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: sla.bg, color: sla.color, textTransform: 'uppercase'
                      }}>
                        {sla.text}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Clock size={12} />
                        {tarea.tiempoTranscurridoStr}
                      </span>
                    </div>

                    {/* Información de Agencia */}
                    <div style={{ margin: '2px 0' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        ID {tarea.id} - {tarea.nombre}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-hint)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Empresa: {tarea.empresa}
                        </span>
                      </div>
                    </div>

                    {/* Detalles del Trabajo */}
                    <div style={{
                      fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45',
                      backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)'
                    }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>TRABAJO A REALIZAR:</strong>
                      <p style={{ margin: '2px 0 0 0' }}>{tarea.descripcion || "No se especificó detalle de la tarea."}</p>
                    </div>

                    {/* Footer de información */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-hint)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={12} />
                        Creó: {tarea.creador}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS GERENCIALES (60% de ancho aproximado) */}
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              <TrendingUp size={18} color="var(--accent-blue)" /> Estadísticas y Demanda de Soporte
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Gráfico 1: Pálpitos vs Alfa (Torta MUI) */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Distribución de Incidentes por Empresa
              </h4>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <PieChart
                  series={[
                    {
                      data: metricas.dataEmpresas,
                      innerRadius: 35,
                      outerRadius: 85,
                      paddingAngle: 5,
                      cornerRadius: 5,
                    },
                  ]}
                  height={200}
                  margin={{ right: 5 }}
                />
              </div>
            </div>

            {/* Gráfico 2: Top 5 Agencias con Mayor Demanda */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Top 5 Agencias con mas incidentes
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {metricas.topAgenciasData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-hint)', padding: '20px 0', fontSize: '0.8rem' }}>
                    No se registran datos suficientes de soporte aún.
                  </div>
                ) : (
                  metricas.topAgenciasData.map((agencia, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                      {/* Texto de información arriba de la barra */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '85%'
                        }} title={agencia.label}>
                          {index + 1}. {agencia.label}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {agencia.cantidad} {agencia.cantidad === 1 ? 'solución' : 'soluciones'}
                        </span>
                      </div>

                      {/* Barra de progreso CSS */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${agencia.porcentaje}%`,
                          height: '100%',
                          backgroundColor: 'var(--accent-blue)',
                          borderRadius: '4px',
                          transition: 'width 1s ease-in-out'
                        }} />
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Inicio;