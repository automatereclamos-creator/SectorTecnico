import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Monitor, Cpu, Server, Eye, Printer, FileText, X, Pencil, Save, Trash2 } from 'lucide-react';
import { useRelevamientoViewer } from '../hooks/useRelevamientoViewer';
import { generarReportePDF } from '../utils/reportesPDF'; 

const RelevamientoViewerPanel = ({ rol }) => {
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

  // ESTADO PARA EL MODAL DE PREVISUALIZACIÓN
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

  // LA MISMA LÓGICA DE PDF QUE USÁS EN MOBILE
  const handleReport = (agenciaId = null) => {
    if (agenciaId) {
      generarReportePDF(agenciasAgrupadas, 'INDIVIDUAL', agenciaId);
    } else {
      generarReportePDF(agenciasAgrupadas, 'TOTAL');
    }
  };

  // Filtros de mes removidos en favor de filtros Empresa/Categoría

  // Función auxiliar para colores de empresa
  // Función auxiliar para colores de empresa
  const getEmpresaColors = (empresa) => {
    const emp = String(empresa).toLowerCase().trim();
    if (emp.includes('alfa')) return { bg: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', border: 'rgba(234, 88, 12, 0.25)' }; 
    if (emp.includes('palpitos') || emp.includes('pálpitos')) return { bg: 'rgba(79, 70, 229, 0.12)', color: '#818cf8', border: 'rgba(79, 70, 229, 0.25)' };
    return { bg: 'var(--bg-input)', color: 'var(--text-muted)', border: 'var(--border)' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" size={32} style={{ marginRight: '10px' }} /> Cargando inventario...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderRadius: '8px', border: '1px solid var(--error)' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px', position: 'relative' }}>
      
      {/* =======================================================
          MODAL DE DETALLES TÉCNICOS (Adaptado al Tema Claro)
          ======================================================= */}
      {agenciaSeleccionada && (
        <div 
          onClick={() => setAgenciaSeleccionada(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 9999, padding: '15px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', padding: '25px', 
              borderRadius: '12px', width: '100%', maxWidth: '600px', 
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-md)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-blue)' }}>Ficha Técnica de Agencia</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ID {agenciaSeleccionada.id} - {agenciaSeleccionada.nombre}</p>
              </div>
              <button onClick={() => setAgenciaSeleccionada(null)} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
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
                      backgroundColor: isComponente ? 'rgba(0, 0, 0, 0.02)' : 'var(--bg-input)', 
                      padding: '12px 15px', 
                      borderRadius: '8px', 
                      border: isComponente ? '1px dashed var(--border)' : '1px solid var(--border-md)',
                      opacity: isComponente ? 0.9 : 1,
                      marginLeft: isComponente ? '15px' : '0px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {isComponente && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-hint)', marginTop: '8px' }}></span>}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', color: isComponente ? 'var(--text-muted)' : 'var(--success)', fontSize: isComponente ? '0.9rem' : '0.95rem', lineHeight: '1.2' }}>
                            {insumosMap[eq.producto] || eq.producto || eq.categoria}
                          </span>
                          {insumosMap[eq.producto] && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)', fontFamily: 'monospace', marginTop: '2px' }}>
                              Código: {eq.producto}
                            </span>
                          )}
                        </div>
                        {isComponente && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-hint)', textTransform: 'uppercase', fontWeight: '600', height: 'fit-content' }}>
                            Componente Interno
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>Cant: {eq.cantidad}</span>
                        {esEditor && (
                          <button
                            onClick={() => abrirEdicion(eq)}
                            style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                            title="Editar este equipo"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', fontSize: '0.82rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Marca: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{eq.marca || 'N/A'}</span></div>
                      <div style={{ color: 'var(--text-muted)' }}>Categoría: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{eq.categoria}</span></div>
                      
                      {eq.nro_terminal && eq.nro_terminal !== 'N/A' && eq.nro_terminal !== '-' && (
                        <div style={{ color: 'var(--text-muted)' }}>Nro Terminal: <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{eq.nro_terminal}</span></div>
                      )}
                      {eq.procesador && eq.procesador !== 'N/A' && eq.procesador !== '-' && (
                        <div style={{ color: 'var(--text-muted)' }}>Procesador: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{eq.procesador}</span></div>
                      )}
                      {eq.disco && eq.disco !== 'N/A' && eq.disco !== '-' && (
                        <div style={{ color: 'var(--text-muted)' }}>Disco: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{eq.disco}</span></div>
                      )}
                      {eq.memoria && eq.memoria !== 'N/A' && eq.memoria !== '-' && (
                        <div style={{ color: 'var(--text-muted)' }}>RAM: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{eq.memoria}</span></div>
                      )}
                      {eq.detalles && eq.detalles !== 'N/A' && eq.detalles !== '-' && (
                        <div style={{ gridColumn: 'span 2', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px' }}>
                          Detalles: <span style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{eq.detalles}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setAgenciaSeleccionada(null)} 
              style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
      {/* ======================================================= */}

      {/* =======================================================
          MODAL DE EDICIÓN DE EQUIPO (Solo auditor/admin)
          ======================================================= */}
      {equipoEditando && esEditor && (
        <div 
          onClick={() => { setEquipoEditando(null); setMensajeEdit(null); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', zIndex: 10000, padding: '15px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', padding: '25px', 
              borderRadius: '12px', width: '100%', maxWidth: '550px', 
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-md)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b' }}>
                  <Pencil size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Editar Equipo
                </h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {insumosMap[equipoEditando.producto] || equipoEditando.producto || equipoEditando.categoria}
                </p>
              </div>
              <button onClick={() => { setEquipoEditando(null); setMensajeEdit(null); }} style={{ background: 'var(--bg-input)', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
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
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={formEdit[field.key] || ''}
                    onChange={(e) => setFormEdit(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Detalles / Observaciones</label>
                <textarea
                  value={formEdit.detalles || ''}
                  onChange={(e) => setFormEdit(prev => ({ ...prev, detalles: e.target.value }))}
                  rows={3}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {mensajeEdit && (
              <div style={{
                marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
                backgroundColor: mensajeEdit.tipo === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: mensajeEdit.tipo === 'success' ? '#10b981' : '#ef4444',
                fontSize: '0.85rem', fontWeight: '600',
                border: `1px solid ${mensajeEdit.tipo === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {mensajeEdit.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setEquipoEditando(null); setMensajeEdit(null); setConfirmandoBaja(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer' }}
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
                {guardando ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            {/* BOTÓN DAR DE BAJA */}
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              {!confirmandoBaja ? (
                <button
                  onClick={() => setConfirmandoBaja(true)}
                  disabled={guardando}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
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
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
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
                      {guardando ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

      {/* 1. BARRA DE HERRAMIENTAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: 'var(--bg-card)', padding: '15px 20px', borderRadius: '10px', border: '1px solid var(--border-md)' }}>
        <div style={{ display: 'flex', gap: '15px', flex: 1, minWidth: '200px', flexWrap: 'wrap', maxWidth: '850px' }}>
          <div style={{ position: 'relative', flex: '2 1 250px', minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
            <input 
              type="text" 
              placeholder="Buscar por ID, nombre, CPU, RAM, TV..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px 15px 12px 45px',
                borderRadius: '8px', 
                border: '1px solid var(--border-md)', 
                backgroundColor: 'var(--bg-input)', 
                color: 'var(--text-main)', 
                outline: 'none', 
                transition: 'border 0.2s',
                fontSize: '1rem',
                height: '46px',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          
          <select
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            style={{
              padding: '10px 15px', borderRadius: '8px',
              border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
              outline: 'none', cursor: 'pointer', fontSize: '0.9rem', minWidth: '160px', flex: '1 1 160px'
            }}
          >
            <option value="TODAS">Todas las Empresas</option>
            <option value="Palpitos">Pálpitos</option>
            <option value="Alfa">Alfa</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{
              padding: '10px 15px', borderRadius: '8px',
              border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
              outline: 'none', cursor: 'pointer', fontSize: '0.9rem', minWidth: '180px', flex: '1 1 180px'
            }}
          >
            <option value="TODAS">Todas las Categorías</option>
            {categoriasDisponibles.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={refresh} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} 
            title="Actualizar datos"
          >
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={() => handleReport()} // LLAMADA AL REPORTE TOTAL
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 16px', borderRadius: '8px', border: 'none', 
              backgroundColor: 'var(--accent-blue)', 
              color: '#ffffff', cursor: 'pointer', fontWeight: '600', 
              transition: 'background 0.2s',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
            }}
          >
            <FileText size={18} /> Reporte Completo
          </button>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Equipos AIO (Filtrado)</p>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>{stats.aio + stats.aioDeporte}</h3>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--accent-indigo-bg)', borderRadius: '50%', color: 'var(--accent-blue)' }}>
            <Monitor size={28} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>CPUs / Servidores (Filtrado)</p>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>{stats.cpu + stats.cpuDeporte}</h3>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--success-bg)', borderRadius: '50%', color: 'var(--success)' }}>
            <Server size={28} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Equipos (Filtrado)</p>
            <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>{stats.totalEquipos}</h3>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-input)', borderRadius: '50%', color: 'var(--text-muted)' }}>
            <Cpu size={28} />
          </div>
        </div>
      </div>

      {/* 3. LISTA DE AGENCIAS */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Directorio de Agencias ({agenciasAgrupadas.length})</h3>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
          {agenciasAgrupadas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-hint)' }}>
              No se encontraron agencias con la búsqueda actual.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
              {agenciasAgrupadas.map(agencia => {
                const colores = getEmpresaColors(agencia.empresa);
                return (
                  <div key={agencia.idUnico} style={{ border: `1px solid ${colores.border}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
                    
                    {/* CABECERA DE LA AGENCIA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: colores.bg }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ backgroundColor: colores.color, color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {agencia.empresa || 'S/E'}
                        </span>
                        <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>ID {agencia.id}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{agencia.nombre}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {esEditor && (
                          <button 
                            onClick={() => setAgenciaSeleccionada({...agencia, modoEdicion: true})}
                            style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                            title="Editar equipos"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => setAgenciaSeleccionada(agencia)} // LLAMADA AL MODAL DE OJO
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleReport(agencia.id)} // LLAMADA AL REPORTE INDIVIDUAL
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                          title="Imprimir ticket"
                        >
                          <Printer size={18} />
                        </button>
                      </div>
                    </div>

                    {/* LISTA DE EQUIPOS (Filtrando COMPONENTES e Iconografía Dinámica) */}
                    <div style={{ padding: '0 15px' }}>
                      {agencia.equipos
                        .filter(eq => eq.categoria?.toUpperCase().trim() !== 'COMPONENTES')
                        .map((eq, i, filteredArray) => {
                          const catUpper = (eq.categoria || "").toUpperCase();
                          const isCpuOrServer = catUpper.includes("CPU") || catUpper.includes("SERVIDOR");
                          const isAio = catUpper.includes("AIO") || catUpper.includes("MONITOR");
                          
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < filteredArray.length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {isCpuOrServer ? (
                                  <Cpu size={14} color="var(--success)" />
                                ) : isAio ? (
                                  <Monitor size={14} color="var(--accent-blue)" />
                                ) : (
                                  <Server size={14} color="var(--text-muted)" />
                                )}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                                  {insumosMap[eq.producto] || eq.producto || eq.categoria}
                                  {eq.nro_terminal && eq.nro_terminal !== 'N/A' && eq.nro_terminal !== '-' && (
                                    <span style={{ color: 'var(--warning)', fontSize: '0.75rem', marginLeft: '8px', fontWeight: 'bold' }}>
                                      #{eq.nro_terminal}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                x{eq.cantidad}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    {/* INDICADOR PREMIUM DE COMPONENTES INTERNOS */}
                    {agencia.equipos.some(eq => eq.categoria?.toUpperCase().trim() === 'COMPONENTES') && (
                      <div style={{ 
                        padding: '10px 15px', 
                        backgroundColor: 'var(--bg-surface)', 
                        borderTop: '1px solid var(--border)', 
                        fontSize: '0.78rem', 
                        color: 'var(--text-hint)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px'
                      }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--accent-indigo)',
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
      
    </div>
  );
};

export default RelevamientoViewerPanel;