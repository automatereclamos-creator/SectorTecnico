import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Search, Edit2, PlusCircle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, X, Save, Trash2, Send,
  User, AlertCircle, Building2, Calendar, RefreshCw
} from 'lucide-react';
import { useTareasManager } from '../hooks/useTareasManager';

const TareasManager = () => {
  const {
    tareas,
    tareasFiltradas,
    isLoading,
    mensaje,
    kpis,

    searchQuery, setSearchQuery,
    filtroEstado, setFiltroEstado,
    filtroEmpresa, setFiltroEmpresa,

    paginaActual, setPaginaActual,
    totalPaginas,

    tareaSeleccionada, setTareaSeleccionada,
    isEditing, setIsEditing,
    editData, setEditData,
    activarEdicion,
    guardarEdicion,
    toggleEstado,
    eliminarTarea,

    isCreating, setIsCreating,
    tasksList,
    isSubmitting,
    handleAddTask,
    handleRemoveTask,
    handleFieldChange,
    handleEmpresaChange,
    handleIdChange,
    handleCrearTarea,
    fetchTareas,

    isPreviewOpen, setIsPreviewOpen,
    previewContent,
    isCopied,
    handleCopyTareas,
    confirmarYEnviarMail,

    isRegisteringAgency, setIsRegisteringAgency,
    agencyFormData,
    handleAgencyFieldChange,
    handleCrearAltaYTarea
  } = useTareasManager();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPreviewOpen) {
          setIsPreviewOpen(false);
        } else if (isCreating) {
          setIsCreating(false);
        } else if (isRegisteringAgency) {
          setIsRegisteringAgency(false);
        } else if (tareaSeleccionada) {
          setTareaSeleccionada(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, isCreating, isRegisteringAgency, tareaSeleccionada, setIsPreviewOpen, setIsCreating, setIsRegisteringAgency, setTareaSeleccionada]);

  const handleSelectTarea = (tarea) => {
    setTareaSeleccionada(tarea);
    setIsEditing(false);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  const renderDetalleTarea = () => {
    if (!tareaSeleccionada) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* HEADER DETALLE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Ficha de Tarea</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detalle y gestión de la tarea asignada</span>
          </div>
          <button
            onClick={() => setTareaSeleccionada(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {isEditing ? (
          /* MODO EDICIÓN */
          <form onSubmit={(e) => { e.preventDefault(); guardarEdicion(tareaSeleccionada.rowId); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Descripción de la Tarea</label>
              <textarea
                value={editData.descripcion || ''}
                onChange={e => setEditData(prev => ({ ...prev, descripcion: e.target.value }))}
                required
                rows={5}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Número de Contacto</label>
              <input
                type="text"
                value={editData.contacto || ''}
                onChange={e => setEditData(prev => ({ ...prev, contacto: e.target.value }))}
                placeholder="Número de contacto (opcional)..."
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Save size={16} /> Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* MODO VISTA */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* FICHA AGENCIA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación y Sucursal</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  {tareaSeleccionada.nombre} (ID: {tareaSeleccionada.id})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>EMPRESA</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', textTransform: 'capitalize' }}>
                  {tareaSeleccionada.empresa || 'Otros'}
                </span>
              </div>
              {tareaSeleccionada.contacto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>CONTACTO</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    {tareaSeleccionada.contacto}
                  </span>
                </div>
              )}
            </div>

            {/* INFO ASIGNACIÓN */}
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-md)', borderBottom: '1px solid var(--border-md)', padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Creó: <strong>{tareaSeleccionada.creador || 'Sin datos'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>{formatFecha(tareaSeleccionada.fecha_creacion)}</span>
              </div>
            </div>



            {/* DESCRIPCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trabajo a Realizar</span>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {tareaSeleccionada.descripcion}
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => toggleEstado(tareaSeleccionada)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '8px', border: 'none',
                  backgroundColor: tareaSeleccionada.estado === 'PENDIENTE' ? 'var(--success)' : '#eab308',
                  color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                {tareaSeleccionada.estado === 'PENDIENTE' ? (
                  <><CheckCircle size={16} /> Marcar Completada</>
                ) : (
                  <><AlertCircle size={16} /> Reabrir Tarea</>
                )}
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => activarEdicion(tareaSeleccionada)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)',
                    backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => eliminarTarea(tareaSeleccionada.rowId)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };



  return (
    <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'system-ui, sans-serif' }}>

      {/* OVERLAY DE CARGA */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 15, 30, 0.4)', backdropFilter: 'blur(1px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cargando...</span>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES */}
      {mensaje.text && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000000,
          padding: '12px 16px', borderRadius: '8px',
          backgroundColor: mensaje.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
          color: mensaje.type === 'error' ? 'var(--error)' : 'var(--success)',
          border: `1px solid ${mensaje.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
          fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          animation: 'scaleUp 0.15s ease-out'
        }}>
          {mensaje.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {mensaje.text}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Tareas</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{kpis.total}</span>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendientes</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{kpis.pendientes}</span>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completadas</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{kpis.completadas}</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div style={{
        backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, agencia, descripción o asignado..."
            style={{
              width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px',
              border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', width: '100%' }}>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{
              padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem',
              outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box'
            }}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="COMPLETADA">Solo Completadas</option>
          </select>

          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            style={{
              padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem',
              outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box'
            }}
          >
            <option value="TODAS">Todas las Empresas</option>
            <option value="Alfa">Alfa</option>
            <option value="Palpitos">Pálpitos</option>
            <option value="Otros">Otros</option>
          </select>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'opacity 0.2s', width: '100%', boxSizing: 'border-box'
            }}
          >
            <PlusCircle size={18} /> Nueva Tarea
          </button>

          <button
            type="button"
            onClick={() => setIsRegisteringAgency(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'opacity 0.2s', width: '100%', boxSizing: 'border-box'
            }}
          >
            <PlusCircle size={18} /> Nueva Alta
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-md)', color: 'var(--text-muted)', fontWeight: '600' }}>
                <th style={{ padding: '14px 20px' }}>ID / Sucursal</th>
                <th style={{ padding: '14px 20px' }}>Empresa</th>
                <th style={{ padding: '14px 20px' }}>Trabajo a Realizar</th>
                <th style={{ padding: '14px 20px' }}>Fecha</th>
                <th style={{ padding: '14px 20px' }}>Creó</th>
                <th style={{ padding: '14px 20px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-hint)' }}>
                    <ClipboardList size={40} style={{ marginBottom: '15px', color: 'var(--border-md)' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No se encontraron tareas con los filtros seleccionados.</p>
                  </td>
                </tr>
              ) : (
                tareas.map((t, index) => {
                  const isPendiente = t.estado === 'PENDIENTE';
                  return (
                    <tr
                      key={t.rowId || index}
                      onClick={() => handleSelectTarea(t)}
                      style={{
                        borderBottom: index < tareas.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer', transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        <div>#{t.id} — {t.nombre}</div>
                        {t.contacto && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '3px' }}>
                            Contacto: {t.contacto}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                          backgroundColor: t.empresa?.toLowerCase() === 'alfa' ? 'rgba(2, 132, 199, 0.15)' : t.empresa?.toLowerCase() === 'palpitos' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: t.empresa?.toLowerCase() === 'alfa' ? 'var(--accent-blue)' : t.empresa?.toLowerCase() === 'palpitos' ? '#f97316' : 'var(--text-muted)'
                        }}>
                          {t.empresa?.toUpperCase() || 'OTROS'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-hint)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.descripcion}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatFecha(t.fecha_creacion)}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {t.creador}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '12px',
                          backgroundColor: isPendiente ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isPendiente ? '#6366f1' : 'var(--success)',
                          border: `1px solid ${isPendiente ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`
                        }}>
                          {t.estado}
                        </span>
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

      {/* MODAL DETALLE */}
      {tareaSeleccionada && (
        <div
          onClick={() => setTareaSeleccionada(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999, padding: '15px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '550px', backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)', borderRadius: '12px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {renderDetalleTarea()}
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isCreating && (
        <div
          onClick={() => setIsCreating(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999, padding: '15px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '650px', backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)', borderRadius: '12px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* CABECERA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Crear Nueva Tarea</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga de tareas para técnicos</span>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleCrearTarea} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {tasksList.map((task, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    position: 'relative'
                  }}>
                    {/* ENCABEZADO TAREA INDIVIDUAL */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                        Tarea #{idx + 1}
                      </span>
                      {tasksList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}
                        >
                          <Trash2 size={14} /> Quitar Tarea
                        </button>
                      )}
                    </div>

                    {/* SELECCIONAR EMPRESA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Empresa</label>
                      <select
                        value={task.empresa}
                        onChange={e => handleEmpresaChange(idx, e.target.value)}
                        required
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">— Seleccionar —</option>
                        <option value="Palpitos">Pálpitos</option>
                        <option value="Alfa">Alfa</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>

                    {/* ID & NOMBRE */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: '0 0 120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>ID Agencia</label>
                        <input
                          type="text"
                          value={task.id}
                          onChange={e => handleIdChange(idx, e.target.value)}
                          required
                          autoComplete="off"
                          placeholder="Ej: 1207"
                          style={{
                            padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none',
                            border: `1px solid ${task.idHint?.found === true ? 'var(--success)' : task.idHint?.found === false ? 'var(--error)' : 'var(--border-md)'}`,
                            backgroundColor: 'var(--bg-input)', color: 'var(--text-main)'
                          }}
                        />
                        {task.idHint?.text && (
                          <span style={{ fontSize: '0.72rem', color: task.idHint.type === 'ok' ? 'var(--success)' : 'var(--error)', fontWeight: '600' }}>
                            {task.idHint.text}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nombre</label>
                        <input
                          type="text"
                          value={task.nombre}
                          readOnly
                          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* DESCRIPCION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Trabajo a Realizar</label>
                      <textarea
                        value={task.descripcion}
                        onChange={e => handleFieldChange(idx, 'descripcion', e.target.value)}
                        required
                        rows={3}
                        placeholder="Detalle del trabajo que debe realizarse..."
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* CONTACTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Número de Contacto</label>
                      <input
                        type="text"
                        value={task.contacto || ''}
                        onChange={e => handleFieldChange(idx, 'contacto', e.target.value)}
                        placeholder="Número de contacto para el técnico (opcional)..."
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px dashed var(--accent-blue)',
                  backgroundColor: 'transparent',
                  color: 'var(--accent-blue)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '5px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <PlusCircle size={14} /> Agregar otra tarea
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff', fontWeight: '600', fontSize: '0.95rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s', marginTop: '5px'
                }}
              >
                <ClipboardList size={18} />
                {isSubmitting ? 'Creando...' : 'Crear Tarea(s)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PREVISUALIZACIÓN Y CONFIRMACIÓN */}
      {isPreviewOpen && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 999999, padding: '15px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)', borderRadius: '12px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* CABECERA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Confirmación y Envío</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previsualización del formato para enviar por mail</span>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MONOSPACED BLOCK */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-md)',
              borderRadius: '8px',
              padding: '16px',
              color: 'var(--text-main)',
              fontFamily: 'monospace, Courier New, Courier',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {previewContent}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCopyTareas}
                  style={{
                    flex: '1 1 120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)',
                    backgroundColor: isCopied ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                    color: isCopied ? 'var(--success)' : '#6366f1',
                    fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <ClipboardList size={16} />
                  {isCopied ? '✓ Copiado' : 'Copiar'}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => confirmarYEnviarMail(false)}
                  style={{
                    flex: '1 1 130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff', fontWeight: '700', fontSize: '0.88rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  <Send size={16} />
                  Enviar Tarea
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => confirmarYEnviarMail(true)}
                  style={{
                    flex: '1.2 1 150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff', fontWeight: '700', fontSize: '0.88rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  <RefreshCw size={16} className={isSubmitting ? 'animate-spin' : ''} style={{ display: isSubmitting ? 'inline' : 'none' }} />
                  Enviar Mail
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  border: '1px solid var(--border-md)', backgroundColor: 'transparent',
                  color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVA ALTA */}
      {isRegisteringAgency && (
        <div
          onClick={() => setIsRegisteringAgency(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999, padding: '15px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)', borderRadius: '12px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* CABECERA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>+ Nueva Alta de Agencia y Tarea</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registra una agencia inexistente y carga su tarea inicial</span>
              </div>
              <button
                onClick={() => setIsRegisteringAgency(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleCrearAltaYTarea} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid var(--border-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)'
              }}>
                {/* SELECCIONAR EMPRESA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Empresa</label>
                  <select
                    value={agencyFormData.empresa}
                    onChange={e => handleAgencyFieldChange('empresa', e.target.value)}
                    required
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">— Seleccionar —</option>
                    <option value="Palpitos">Pálpitos</option>
                    <option value="Alfa">Alfa</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* ID & NOMBRE */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: '0 0 140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>ID Agencia Nueva</label>
                    <input
                      type="text"
                      value={agencyFormData.id_agencia}
                      onChange={e => handleAgencyFieldChange('id_agencia', e.target.value)}
                      required
                      autoComplete="off"
                      placeholder="Ej: 1207"
                      style={{
                        padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)',
                        backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nombre de Agencia</label>
                    <input
                      type="text"
                      value={agencyFormData.nombre}
                      onChange={e => handleAgencyFieldChange('nombre', e.target.value)}
                      required
                      placeholder="Ej: Agencia San Martín"
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* DESCRIPCION / TAREA INICIAL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Trabajo a Realizar / Tarea Inicial</label>
                  <textarea
                    value={agencyFormData.descripcion}
                    onChange={e => handleAgencyFieldChange('descripcion', e.target.value)}
                    required
                    rows={4}
                    placeholder="Detalle de la tarea inicial (ej: Se debe instalar punto de venta con servidor completo, 4 terminales y 2 estantes dobles)..."
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* CONTACTO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Número de Contacto</label>
                  <input
                    type="text"
                    value={agencyFormData.contacto || ''}
                    onChange={e => handleAgencyFieldChange('contacto', e.target.value)}
                    placeholder="Número de contacto para el técnico (opcional)..."
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* ACCIONES */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisteringAgency(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px',
                    border: '1px solid var(--border-md)', backgroundColor: 'transparent',
                    color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff', fontWeight: '700', fontSize: '0.9rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  <RefreshCw size={16} className={isSubmitting ? 'animate-spin' : ''} style={{ display: isSubmitting ? 'inline' : 'none' }} />
                  {isSubmitting ? 'Procesando...' : 'Generar Alta y Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareasManager;
