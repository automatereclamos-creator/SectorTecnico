import React, { useState, useEffect } from 'react';
import { useTvDashboard } from '../hooks/useTvDashboard';
import { AlertTriangle, ClipboardList, CheckCircle } from 'lucide-react';
import '../styles.css';

const TvDashboard = ({ onVolver }) => {
  const { reclamos, tareas, ultimaActualizacion, nuevoReclamo, setNuevoReclamo, reclamoSolucionado, setReclamoSolucionado } = useTvDashboard();
  const [horaActual, setHoraActual] = useState(new Date());
  
  // Estados para la alerta visual de nuevos reclamos
  const [alertaVisible, setAlertaVisible] = useState(false);
  const [reclamoAlerta, setReclamoAlerta] = useState(null);

  // Estados para la alerta visual de reclamos solucionados
  const [alertaSolucionVisible, setAlertaSolucionVisible] = useState(false);
  const [reclamoSolucionAlerta, setReclamoSolucionAlerta] = useState(null);

  // Efecto para reproducir sonido y mostrar alerta cuando ingresa un nuevo reclamo
  useEffect(() => {
    if (nuevoReclamo) {
      // Elegir sonido según empresa (Palpitos = notificationP.mp3, Alfa/Otros = notification.mp3)
      const empresa = nuevoReclamo.empresa?.toLowerCase() || '';
      const audioSrc = empresa === 'palpitos' ? '/notificationP.mp3' : '/notification.mp3';
      const audio = new Audio(audioSrc);
      
      audio.play().catch(err => console.log('Autoplay prevent o error al reproducir audio:', err));
      
      setReclamoAlerta(nuevoReclamo);
      setAlertaVisible(true);

      // Limpiamos el estado para poder detectar el próximo
      setNuevoReclamo(null);
    }
  }, [nuevoReclamo, setNuevoReclamo]);

  // Efecto independiente para ocultar la alerta después de 10 segundos
  useEffect(() => {
    if (alertaVisible) {
      const timeoutId = setTimeout(() => {
        setAlertaVisible(false);
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
  }, [alertaVisible]);

  // Efecto para mostrar alerta cuando se SOLUCIONA un reclamo
  useEffect(() => {
    if (reclamoSolucionado) {
      // Reproducir sonido específico de éxito
      const audio = new Audio('/notificationS.mp3');
      audio.play().catch(err => console.log('Autoplay prevent o error al reproducir audio:', err));
      
      setReclamoSolucionAlerta(reclamoSolucionado);
      setAlertaSolucionVisible(true);

      // Limpiamos el estado
      setReclamoSolucionado(null);
    }
  }, [reclamoSolucionado, setReclamoSolucionado]);

  // Efecto independiente para ocultar la alerta de solución
  useEffect(() => {
    if (alertaSolucionVisible) {
      const timeoutId = setTimeout(() => {
        setAlertaSolucionVisible(false);
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
  }, [alertaSolucionVisible]);

  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="tv-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem 3rem' }}>
      
      {/* ALERTA VISUAL (OVERLAY) */}
      {alertaVisible && reclamoAlerta && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            backgroundColor: '#1e293b', border: '4px solid #f59e0b', 
            borderRadius: '24px', padding: '4rem', maxWidth: '85%', minWidth: '60%',
            textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <AlertTriangle size={100} color="#f59e0b" style={{ margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' }} />
            <h1 style={{ fontSize: '4.5rem', color: '#f8fafc', margin: '0 0 2rem 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
              ¡Nuevo Reclamo!
            </h1>
            <div style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '2rem' }}>
              Agencia: <strong style={{ color: '#f8fafc' }}>{reclamoAlerta.nombre || 'S/D'}</strong>
            </div>
            <div style={{ fontSize: '2.5rem', color: '#cbd5e1', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2.5rem', borderRadius: '16px', lineHeight: '1.4' }}>
              {reclamoAlerta.informa}
            </div>
          </div>
        </div>
      )}

      {/* ALERTA VISUAL (RECLAMO SOLUCIONADO - OVERLAY VERDE) */}
      {alertaSolucionVisible && reclamoSolucionAlerta && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(6, 78, 59, 0.95)', zIndex: 10000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            backgroundColor: '#022c22', border: '4px solid #10b981', 
            borderRadius: '24px', padding: '4rem', maxWidth: '85%', minWidth: '60%',
            textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <CheckCircle size={100} color="#10b981" style={{ margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' }} />
            <h1 style={{ fontSize: '4.5rem', color: '#f8fafc', margin: '0 0 2rem 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
              ¡Reclamo Solucionado!
            </h1>
            <div style={{ fontSize: '3rem', color: '#a7f3d0', marginBottom: '2rem' }}>
              Agencia: <strong style={{ color: '#f8fafc' }}>{reclamoSolucionAlerta.nombre || 'S/D'}</strong>
            </div>
            <div style={{ fontSize: '2.5rem', color: '#d1fae5', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2.5rem', borderRadius: '16px', lineHeight: '1.4' }}>
              El reclamo sobre <strong>"{reclamoSolucionAlerta.informa}"</strong> fue resuelto exitosamente.
            </div>
          </div>
        </div>
      )}

      <div className="tv-header" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onVolver} className="tv-back-btn">←</button>
          <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>
            MONITOR OPERATIVO
          </h1>
        </div>

        {/* Los chips ahora están forzados a la derecha y alineados al centro del título */}
        <div className="status-bar" style={{ flexWrap: 'nowrap' }}>
          <div className="status-chip">
            <div className="status-label">Reclamos</div>
            <div className="status-value val-pending">{reclamos.length}</div>
          </div>

          <div className="status-chip">
            <div className="status-label">Tareas</div>
            <div className="status-value" style={{ color: '#6366f1' }}>{tareas.length}</div>
          </div>

          <div className="status-chip">
            <div className="pulse"></div>
            <div>
              <div className="status-label">Sincronización</div>
              <div className="status-value val-sync">Automática</div>
            </div>
          </div>

          <div className="status-chip" style={{ minWidth: '140px' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="status-label">Hora Local</div>
              <div className="status-value val-time" style={{ fontSize: '1.4rem' }}>
                {horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PARALELO DE DOS COLUMNAS */}
      <div style={{ display: 'flex', gap: '30px', flex: 1, flexWrap: 'wrap', overflow: 'hidden', width: '100%' }}>

        {/* COLUMNA IZQUIERDA: RECLAMOS */}
        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '320px' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', borderBottom: '2px solid rgba(245, 158, 11, 0.2)', paddingBottom: '8px' }}>
            <AlertTriangle size={20} /> Reclamos Pendientes ({reclamos.length})
          </h2>
          <div className="tv-list" style={{ flex: 1, overflowY: 'auto' }}>
            {reclamos.length === 0 ? (
              <div className="tv-empty" style={{ padding: '3rem 1rem' }}>
                <h2>Excelente 🎉</h2>
                <p style={{ color: 'var(--text-hint)' }}>No hay reclamos pendientes.</p>
              </div>
            ) : (
              reclamos.map(r => (
                <div key={r.rowId} className="tv-list-item tv-tipo-reclamo">
                  <div className="tv-item-header">
                    <span className={`badge ${r.empresa?.toLowerCase()} tv-badge`}>
                      {r.empresa || 'S/D'}
                    </span>
                    <span className="tv-id">ID {r.id}</span>
                  </div>
                  <div className="tv-item-problema">{r.informa}</div>
                  <div className="tv-item-agencia">{r.nombre}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: TAREAS */}
        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '320px' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '700', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', borderBottom: '2px solid rgba(99, 102, 241, 0.2)', paddingBottom: '8px' }}>
            <ClipboardList size={20} /> Tareas ({tareas.length})
          </h2>
          <div className="tv-list" style={{ flex: 1, overflowY: 'auto' }}>
            {tareas.length === 0 ? (
              <div className="tv-empty" style={{ padding: '3rem 1rem' }}>
                <h2>Excelente 🎉</h2>
                <p style={{ color: 'var(--text-hint)' }}>No hay tareas asignadas.</p>
              </div>
            ) : (
              tareas.map(t => (
                <div key={t.rowId} className="tv-list-item tv-tipo-tarea">
                  <div className="tv-item-header">
                    <span className={`badge ${t.empresa?.toLowerCase()} tv-badge`}>
                      {t.empresa || 'S/D'}
                    </span>
                    <span className="tv-id text-indigo">ID {t.id}</span>
                  </div>
                  <div className="tv-item-problema">{t.descripcion}</div>
                  <div className="tv-item-agencia">{t.nombre}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TvDashboard;