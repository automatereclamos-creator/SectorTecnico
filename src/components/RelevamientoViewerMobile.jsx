import React, { useState, useEffect } from 'react';
import { Search, Database, RefreshCw, FileText, Printer, Monitor, Cpu, Eye, X, Pencil, Save, Trash2 } from 'lucide-react';
import { useRelevamientoViewer } from '../hooks/useRelevamientoViewer';
import { generarReportePDF } from '../utils/reportesPDF';

const RelevamientoViewer = ({ rol }) => {
  const { 
    agenciasAgrupadas, 
    loading, 
    filtro, 
    setFiltro, 
    refresh, 
    stats, 
    error,
    filtroEmpresa,
    setFiltroEmpresa,
    filtroCategoria,
    setFiltroCategoria,
    categoriasDisponibles,
    insumosMap,
    actualizarEquipo,
    darDeBajaEquipo
  } = useRelevamientoViewer();
  
  const esEditor = rol === 'auditor' || rol === 'admin';
  
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState(null);

  // ESTADO PARA EL MODAL DE EDICIÓN
  const [equipoEditando, setEquipoEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeEdit, setMensajeEdit] = useState(null);
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);

  const abrirEdicion = (equipo) => {
    setEquipoEditando(equipo);
    setFormEdit({
      categoria: equipo.categoria || '',
      producto: equipo.producto || '',
      marca: equipo.marca || '',
      cantidad: equipo.cantidad || 1,
      procesador: equipo.procesador === 'N/A' ? '' : (equipo.procesador || ''),
      disco: equipo.disco === 'N/A' ? '' : (equipo.disco || ''),
      memoria: equipo.memoria === 'N/A' ? '' : (equipo.memoria || ''),
      nro_terminal: equipo.nro_terminal === 'N/A' ? '' : (equipo.nro_terminal || ''),
      detalles: equipo.detalles === 'N/A' ? '' : (equipo.detalles || ''),
    });
    setMensajeEdit(null);
    setConfirmandoBaja(false);
  };

  const guardarEdicion = async () => {
    if (!equipoEditando?.equipo_id) return;
    setGuardando(true);
    setMensajeEdit(null);
    const resultado = await actualizarEquipo(equipoEditando.equipo_id, formEdit);
    setGuardando(false);
    if (resultado.success) {
      setMensajeEdit({ tipo: 'success', texto: 'Equipo actualizado correctamente.' });
      setTimeout(() => {
        setEquipoEditando(null);
        setMensajeEdit(null);
      }, 1200);
    } else {
      setMensajeEdit({ tipo: 'error', texto: resultado.error || 'Error al guardar.' });
    }
  };

  const ejecutarBaja = async () => {
    if (!equipoEditando?.equipo_id) return;
    setGuardando(true);
    setMensajeEdit(null);
    const resultado = await darDeBajaEquipo(equipoEditando.equipo_id);
    setGuardando(false);
    if (resultado.success) {
      setMensajeEdit({ tipo: 'success', texto: 'Equipo dado de baja correctamente.' });
      setTimeout(() => {
        setEquipoEditando(null);
        setMensajeEdit(null);
        setConfirmandoBaja(false);
      }, 1200);
    } else {
      setMensajeEdit({ tipo: 'error', texto: resultado.error || 'Error al dar de baja.' });
      setConfirmandoBaja(false);
    }
  };
  
  useEffect(() => {
    if (!agenciaSeleccionada) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAgenciaSeleccionada(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [agenciaSeleccionada]);

  const handleReport = (agenciaId = null) => {
    if (agenciaId) {
      generarReportePDF(agenciasAgrupadas, 'INDIVIDUAL', agenciaId);
    } else {
      generarReportePDF(agenciasAgrupadas, 'TOTAL');
    }
  };

  // Filtros de mes removidos en favor de filtros Empresa/Categoría

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', borderTop: '4px solid #6366f1', position: 'relative' }}>
      
      {/* =======================================================
          MODAL DE DETALLES TÉCNICOS (PREVISUALIZACIÓN)
          ======================================================= */}
      {agenciaSeleccionada && (
        <div 
          onClick={() => setAgenciaSeleccionada(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 9999, padding: '15px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e293b', color: '#f8fafc', padding: '25px', 
              borderRadius: '12px', width: '100%', maxWidth: '600px', 
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#818cf8' }}>Ficha Técnica de Agencia</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>ID {agenciaSeleccionada.id} - {agenciaSeleccionada.nombre}</p>
              </div>
              <button onClick={() => setAgenciaSeleccionada(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#f8fafc', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agenciaSeleccionada.equipos
                .filter(eq => eq.categoria?.toUpperCase().trim() !== 'COMPONENTES')
                .map((eq, idx) => {
                  const isComponente = eq.categoria?.toUpperCase().trim() === 'COMPONENTES';
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      backgroundColor: isComponente ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', 
                      padding: '12px 15px', 
                      borderRadius: '8px', 
                      border: isComponente ? '1px dashed rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.05)',
                      opacity: isComponente ? 0.85 : 1,
                      marginLeft: isComponente ? '12px' : '0px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {isComponente && <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#64748b', marginTop: '6px' }}></span>}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', color: isComponente ? '#94a3b8' : '#34d399', fontSize: isComponente ? '0.88rem' : '0.95rem', lineHeight: '1.2' }}>
                            {insumosMap[eq.producto] || eq.producto || eq.categoria}
                          </span>
                          {insumosMap[eq.producto] && (
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                              Código: {eq.producto}
                            </span>
                          )}
                        </div>
                        {isComponente && (
                          <span style={{ fontSize: '0.65rem', padding: '1px 5px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', height: 'fit-content' }}>
                            Componente
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Cant: {eq.cantidad}</span>
                      {esEditor && (
                        <button
                          onClick={() => abrirEdicion(eq)}
                          style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '6px' }}
                          title="Editar este equipo"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', fontSize: '0.82rem' }}>
                      <div style={{ color: '#94a3b8' }}>Marca: <span style={{ color: '#f8fafc' }}>{eq.marca || 'N/A'}</span></div>
                      <div style={{ color: '#94a3b8' }}>Categoría: <span style={{ color: '#f8fafc' }}>{eq.categoria}</span></div>
                      
                      {eq.nro_terminal && eq.nro_terminal !== 'N/A' && eq.nro_terminal !== '-' && (
                        <div style={{ color: '#94a3b8' }}>Nro Terminal: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{eq.nro_terminal}</span></div>
                      )}
                      {eq.procesador && eq.procesador !== 'N/A' && eq.procesador !== '-' && (
                        <div style={{ color: '#94a3b8' }}>Procesador: <span style={{ color: '#f8fafc' }}>{eq.procesador}</span></div>
                      )}
                      {eq.disco && eq.disco !== 'N/A' && eq.disco !== '-' && (
                        <div style={{ color: '#94a3b8' }}>Disco: <span style={{ color: '#f8fafc' }}>{eq.disco}</span></div>
                      )}
                      {eq.memoria && eq.memoria !== 'N/A' && eq.memoria !== '-' && (
                        <div style={{ color: '#94a3b8' }}>RAM: <span style={{ color: '#f8fafc' }}>{eq.memoria}</span></div>
                      )}
                      {eq.detalles && eq.detalles !== 'N/A' && eq.detalles !== '-' && (
                        <div style={{ gridColumn: 'span 2', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '4px' }}>
                          Detalles: <span style={{ color: '#f8fafc', fontStyle: 'italic' }}>{eq.detalles}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setAgenciaSeleccionada(null)} 
              style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL DE EDICIÓN DE EQUIPO (Solo auditor/admin)
          ======================================================= */}
      {equipoEditando && esEditor && (
        <div 
          onClick={() => { setEquipoEditando(null); setMensajeEdit(null); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 10000, padding: '15px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e293b', color: '#f8fafc', padding: '25px', 
              borderRadius: '12px', width: '100%', maxWidth: '550px', 
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b' }}>
                  <Pencil size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Editar Equipo
                </h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {insumosMap[equipoEditando.producto] || equipoEditando.producto || equipoEditando.categoria}
                </p>
              </div>
              <button onClick={() => { setEquipoEditando(null); setMensajeEdit(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#f8fafc', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Categoría', key: 'categoria' },
                { label: 'Producto (Código)', key: 'producto' },
                { label: 'Marca', key: 'marca' },
                { label: 'Cantidad', key: 'cantidad', type: 'number' },
                { label: 'Procesador', key: 'procesador' },
                { label: 'Disco', key: 'disco' },
                { label: 'Memoria RAM', key: 'memoria' },
                { label: 'Nro Terminal', key: 'nro_terminal' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={formEdit[field.key] || ''}
                    onChange={(e) => setFormEdit(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid #334155', backgroundColor: '#0f172a',
                      color: '#f8fafc', outline: 'none', fontSize: '0.9rem',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Detalles / Observaciones</label>
                <textarea
                  value={formEdit.detalles || ''}
                  onChange={(e) => setFormEdit(prev => ({ ...prev, detalles: e.target.value }))}
                  rows={3}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #334155', backgroundColor: '#0f172a',
                    color: '#f8fafc', outline: 'none', fontSize: '0.9rem',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {mensajeEdit && (
              <div style={{
                marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
                backgroundColor: mensajeEdit.tipo === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: mensajeEdit.tipo === 'success' ? '#34d399' : '#ef4444',
                fontSize: '0.85rem', fontWeight: '600',
                border: `1px solid ${mensajeEdit.tipo === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {mensajeEdit.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setEquipoEditando(null); setMensajeEdit(null); setConfirmandoBaja(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#334155', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={guardando}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                  backgroundColor: guardando ? '#6b7280' : '#f59e0b',
                  color: '#ffffff', fontWeight: 'bold', cursor: guardando ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                {guardando ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            {/* BOTÓN DAR DE BAJA */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
              {!confirmandoBaja ? (
                <button
                  onClick={() => setConfirmandoBaja(true)}
                  disabled={guardando}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '0.85rem', transition: 'all 0.2s'
                  }}
                >
                  <Trash2 size={15} /> Dar de Baja este equipo
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: '600', textAlign: 'center' }}>
                    ¿Estás seguro? El equipo se marcará como BAJA y dejará de mostrarse.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setConfirmandoBaja(false)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#334155', color: '#94a3b8', fontWeight: '600', cursor: 'pointer' }}
                    >
                      No, cancelar
                    </button>
                    <button
                      onClick={ejecutarBaja}
                      disabled={guardando}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 'bold',
                        cursor: guardando ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      {guardando ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                      Sí, dar de baja
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ======================================================= */}

      {/* CABECERA PRINCIPAL */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database color="#6366f1" size={28} />
          <h1 style={{ margin: 0 }}>Gestión de Inventario</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleReport()} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
            <FileText size={16} /> Reporte Completo
          </button>
          <button onClick={refresh} className="btn-sync" style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid #6366f1' }}> 
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> 
          </button>
        </div>
      </div>

      <div className="card-body">
        
        {/* DASHBOARD DE MÉTRICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderLeft: '4px solid #818cf8', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>AIO (Filtrado)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{(stats.aio || 0) + (stats.aioDeporte || 0)}</span>
          </div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>CPU (Filtrado)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>{(stats.cpu || 0) + (stats.cpuDeporte || 0)}</span>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #f8fafc', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>TOTAL EQUIPOS (Filtrado)</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.totalEquipos || 0}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div className="field" style={{ position: 'relative', margin: 0, width: '100%' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Buscar por ID, nombre, CPU, RAM, TV..." 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                outline: 'none',
                fontSize: '1.05rem',
                height: '48px',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Empresa</label>
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              style={{
                width: '100%', padding: '10px 15px', borderRadius: '8px',
                border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc',
                outline: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              <option value="TODAS">Todas las Empresas</option>
              <option value="Palpitos">Pálpitos</option>
              <option value="Alfa">Alfa</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{
                width: '100%', padding: '10px 15px', borderRadius: '8px',
                border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc',
                outline: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              <option value="TODAS">Todas las Categorías</option>
              {categoriasDisponibles.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><RefreshCw className="spin" size={32} color="#6366f1" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {agenciasAgrupadas.map(agencia => {
              
              // NORMALIZACIÓN EXTREMA PARA COMPARACIÓN LIMPIA
              const empresaKey = agencia.empresa 
                ? String(agencia.empresa).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                : '';

              const CONFIG_EMPRESAS = {
                'alfa': { label: 'ALFA', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
                'palpitos': { label: 'PÁLPITOS', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' }
              };

              const estilo = CONFIG_EMPRESAS[empresaKey] || {
                label: empresaKey.toUpperCase() || 'PÁLPITOS',
                color: '#818cf8',
                bg: 'rgba(129, 140, 248, 0.1)'
              };

              return (
                <div key={agencia.idUnico} style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${estilo.color}`, overflow: 'hidden' }}>
                  
                  <div style={{ backgroundColor: estilo.bg, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: estilo.color, color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px' }}>
                        {estilo.label}
                      </span>
                      <span style={{ color: estilo.color, fontWeight: 'bold' }}>ID {agencia.id}</span>
                      <span style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{agencia.nombre}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {esEditor && (
                        <button 
                          onClick={() => setAgenciaSeleccionada({...agencia, modoEdicion: true})}
                          style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                          title="Editar equipos"
                        >
                          <Pencil size={20} />
                        </button>
                      )}
                      <button 
                        onClick={() => setAgenciaSeleccionada(agencia)} 
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                        title="Ver Detalles Técnicos"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleReport(agencia.id)} 
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                        title="Reporte PDF"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '12px' }}>
                    {agencia.equipos
                      .filter(eq => eq.categoria?.toUpperCase().trim() !== 'COMPONENTES')
                      .map((eq, idx, filteredArray) => {
                        const catUpper = (eq.categoria || "").toUpperCase();
                        const isCpuOrServer = catUpper.includes("CPU") || catUpper.includes("SERVIDOR");
                        
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx === filteredArray.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {isCpuOrServer ? <Cpu size={14} color="#10b981"/> : <Monitor size={14} color="#818cf8"/>}
                              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{insumosMap[eq.producto] || eq.producto || eq.categoria}</span>
                              {eq.nro_terminal && eq.nro_terminal !== 'N/A' && <span style={{ color: '#fbbf24', fontSize: '0.7rem' }}>#{eq.nro_terminal}</span>}
                            </div>
                            <span style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.85rem' }}>x{eq.cantidad}</span>
                          </div>
                        );
                      })}
                  </div>

                  {/* INDICADOR PREMIUM DE COMPONENTES INTERNOS */}
                  {agencia.equipos.some(eq => eq.categoria?.toUpperCase().trim() === 'COMPONENTES') && (
                    <div style={{ 
                      padding: '10px 12px', 
                      backgroundColor: 'rgba(255,255,255,0.01)', 
                      borderTop: '1px solid rgba(255,255,255,0.03)', 
                      fontSize: '0.75rem', 
                      color: '#94a3b8', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        backgroundColor: '#818cf8',
                        animation: 'pulse 2s infinite ease-in-out'
                      }}></span>
                      Contiene componentes internos (ver en ficha técnica)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelevamientoViewer;