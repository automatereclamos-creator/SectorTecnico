import React, { useState, useEffect } from 'react';
import {
  Box, Search, Edit2, PlusCircle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, X, Save, Trash2, Phone, Clock,
  User, Share2, AlertTriangle, AlertCircle, Building2, Calendar, FileText, Copy, RefreshCw, BarChart2
} from 'lucide-react';
import { useReclamosManager } from '../hooks/useReclamosManager';
import { getListaSoporte } from '../services/perfilesService';
import ReporteReclamosModal from './ReporteReclamosModal';
import { APP_TIMEZONE } from '../utils/timezone';

const ReclamosManager = () => {
  const [listaTecnicos, setListaTecnicos] = useState([]);
  const [reclamoCopied, setReclamoCopied] = useState(false);
  const [isModalReporteOpen, setIsModalReporteOpen] = useState(false);

  useEffect(() => {
    getListaSoporte().then(setListaTecnicos);
  }, []);

  const {
    reclamos,
    reclamosFiltradosTotal,
    isLoading,
    mensaje,
    kpis,

    // Filtros
    searchQuery,
    setSearchQuery,
    filtroEstado,
    setFiltroEstado,
    filtroEmpresa,
    setFiltroEmpresa,

    // Paginación
    paginaActual,
    setPaginaActual,
    totalPaginas,

    // Detalle y ABM
    reclamoSeleccionado,
    setReclamoSeleccionado,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    activarEdicion,
    guardarEdicion,
    toggleEstado,
    eliminarReclamo,

    // Drawer de Creación
    isCreating,
    setIsCreating,
    formData,
    idHint,
    isSubmitting,
    handleCreateChange,
    handleCreateEmpresaChange,
    handleCreateIdChange,
    handleCrearReclamo,

    // Drawer de Solución
    isSolucionando,
    solFormData,
    solIdHint,
    solIsSubmitting,
    handleSolChange,
    handleSolEmpresaChange,
    handleSolIdChange,
    handleSolConfirmSubmit,
    abrirSolucionDesdeReclamo,
    abrirNuevaSolucion,
    cerrarSolucion
  } = useReclamosManager();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSolucionando) {
          cerrarSolucion();
        } else if (isCreating) {
          setIsCreating(false);
        } else if (reclamoSeleccionado) {
          setReclamoSeleccionado(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSolucionando, isCreating, reclamoSeleccionado, cerrarSolucion, setIsCreating, setReclamoSeleccionado]);

  const handleSelectReclamo = (reclamo) => {
    setReclamoSeleccionado(reclamo);
    setIsEditing(false);
  };

  const renderDetalleReclamo = () => {
    if (!reclamoSeleccionado) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* HEADER DETALLE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Ficha de Reclamo</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trazabilidad e incidentes técnicos</span>
          </div>
          <button
            onClick={() => setReclamoSeleccionado(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {isEditing ? (
          /* MODO EDICIÓN */
          <form onSubmit={(e) => { e.preventDefault(); guardarEdicion(reclamoSeleccionado.rowId); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Operador (Cargó)</label>
              <input
                type="text"
                value={editData.carga || ''}
                onChange={e => setEditData(prev => ({ ...prev, carga: e.target.value }))}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Teléfono</label>
                <input
                  type="text"
                  value={editData.telefono || ''}
                  onChange={e => setEditData(prev => ({ ...prev, telefono: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Horario Contacto</label>
                <input
                  type="text"
                  value={editData.horario || ''}
                  onChange={e => setEditData(prev => ({ ...prev, horario: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Falla / Problema Reportado</label>
              <textarea
                value={editData.informa || ''}
                onChange={e => setEditData(prev => ({ ...prev, informa: e.target.value }))}
                required
                rows={5}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
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
                  {reclamoSeleccionado.nombre} (ID: {reclamoSeleccionado.id})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>EMPRESA</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', textTransform: 'capitalize' }}>
                  {reclamoSeleccionado.empresa || 'Otros'}
                </span>
              </div>
            </div>

            {/* FICHA CONTACTO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto de Soporte</span>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <Phone size={16} color="var(--text-hint)" />
                  <span>{reclamoSeleccionado.telefono || 'Sin Teléfono'}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <Clock size={16} color="var(--text-hint)" />
                  <span>{reclamoSeleccionado.horario || 'Sin Horario'}</span>
                </div>
              </div>
            </div>

            {/* OPERADOR CARGA */}
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-md)', borderBottom: '1px solid var(--border-md)', padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Carga: <strong>{reclamoSeleccionado.carga}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>{formatFecha(reclamoSeleccionado.fecha_carga)}</span>
              </div>
            </div>

            {/* DESCRIPCIÓN DEL PROBLEMA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problema / Avería</span>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(234, 179, 8, 0.04)',
                border: '1px solid rgba(234, 179, 8, 0.15)',
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {reclamoSeleccionado.informa}
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => toggleEstado(reclamoSeleccionado)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: reclamoSeleccionado.estado === 'PENDIENTE' ? 'var(--success)' : '#eab308',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  {reclamoSeleccionado.estado === 'PENDIENTE' ? (
                    <><CheckCircle size={16} /> Resolver Reclamo</>
                  ) : (
                    <><AlertTriangle size={16} /> Reabrir Reclamo</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyReclamo(reclamoSeleccionado)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: reclamoCopied ? 'var(--success)' : 'var(--accent-blue)',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  {reclamoCopied ? (
                    <><CheckCircle size={16} /> ¡Copiado!</>
                  ) : (
                    <><Copy size={16} /> Copiar Reclamo</>
                  )}
                </button>
              </div>

              {/* BOTÓN REGISTRAR SOLUCIÓN */}
              <button
                type="button"
                onClick={() => abrirSolucionDesdeReclamo(reclamoSeleccionado)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                <FileText size={16} /> Registrar Solución
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => activarEdicion(reclamoSeleccionado)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-md)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} /> Editar Datos
                </button>

                <button
                  type="button"
                  onClick={() => eliminarReclamo(reclamoSeleccionado.rowId)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    color: '#ef4444',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
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

  // Copia el reclamo formateado para pegarlo manualmente en WhatsApp
  const handleCopyReclamo = (r) => {
    const msgWA = `*Empresa:* ${r.empresa ? r.empresa.toUpperCase() : 'Otros'}\n*ID:* ${r.id} \n*Agencia:* ${r.nombre}\n*Falla/Problema:* ${r.informa}\n*Teléfono:* ${r.telefono || 'No registrado'}\n*Horario:* ${r.horario || 'No registrado'}\n*Carga:* ${r.carga}`;
    navigator.clipboard.writeText(msgWA)
      .then(() => {
        setReclamoCopied(true);
        setTimeout(() => setReclamoCopied(false), 2000);
      })
      .catch(err => {
        console.error("Error al copiar texto del reclamo:", err);
      });
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-AR', {
        timeZone: APP_TIMEZONE,
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  const solIdClassName = solIdHint.found === true ? 'found' : solIdHint.found === false ? 'not-found' : '';

  return (
    <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'system-ui, sans-serif' }}>

      {/* OVERLAY DE CARGA CON SPINNER */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 15, 30, 0.4)',
          backdropFilter: 'blur(1px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cargando...</span>
          </div>
        </div>
      )}



      {/* NOTIFICACIONES DE ESTADO */}
      {mensaje.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: mensaje.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
          color: mensaje.type === 'error' ? 'var(--error)' : 'var(--success)',
          border: `1px solid ${mensaje.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          {mensaje.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {mensaje.text}
        </div>
      )}

      {/* KPIs SUPERIORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Reclamos</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{kpis.total}</span>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendientes (Activos)</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>{kpis.pendientes}</span>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solucionados (Historial)</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{kpis.solucionados}</span>
        </div>
      </div>

      {/* BARRA SUPERIOR CON BOTÓN REPORTE */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <button
          onClick={() => setIsModalReporteOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            borderRadius: '8px', border: '1px solid var(--border-md)',
            backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
            fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
            transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <BarChart2 size={18} color="#eab308" />
          Reporte
        </button>
      </div>

      {/* BARRA DE FILTROS (Buscador arriba, filtros y acciones abajo en grilla simétrica) */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
      }}>
        {/* BUSCADOR ARRIBA (100% de ancho) */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, agencia o problema..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '8px',
              border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
          />
        </div>

        {/* FILTROS Y ACCIONES ABAJO (Grilla simétrica responsiva con elementos del mismo tamaño) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          width: '100%'
        }}>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="SOLUCIONADO">Solo Solucionados</option>
          </select>

          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-md)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
              width: '100%',
              boxSizing: 'border-box'
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--accent-blue)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <PlusCircle size={18} /> Nuevo Reclamo
          </button>

          <button
            type="button"
            onClick={abrirNuevaSolucion}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <FileText size={18} /> Nueva Solución
          </button>
        </div>
      </div>

      {/* VISTA TABLA COMPLETA (Única vista de lista disponible) */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-md)', color: 'var(--text-muted)', fontWeight: '600' }}>
                <th style={{ padding: '14px 20px' }}>ID / Sucursal</th>
                <th style={{ padding: '14px 20px' }}>Empresa</th>
                <th style={{ padding: '14px 20px' }}>Problema / Avería</th>
                <th style={{ padding: '14px 20px' }}>Fecha Carga</th>
                <th style={{ padding: '14px 20px' }}>Operador</th>
                <th style={{ padding: '14px 20px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reclamos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-hint)' }}>
                    <Box size={40} style={{ marginBottom: '15px', color: 'var(--border-md)' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No se encontraron reclamos con los filtros seleccionados.</p>
                  </td>
                </tr>
              ) : (
                reclamos.map((r, index) => {
                  const isPendiente = r.estado === 'PENDIENTE';
                  return (
                    <tr
                      key={r.rowId || index}
                      onClick={() => handleSelectReclamo(r)}
                      style={{
                        borderBottom: index < reclamos.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        #{r.id} — {r.nombre}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: r.empresa?.toLowerCase() === 'alfa' ? 'rgba(2, 132, 199, 0.15)' : r.empresa?.toLowerCase() === 'palpitos' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: r.empresa?.toLowerCase() === 'alfa' ? 'var(--accent-blue)' : r.empresa?.toLowerCase() === 'palpitos' ? '#f97316' : 'var(--text-muted)'
                        }}>
                          {r.empresa?.toUpperCase() || 'OTROS'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-hint)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.informa}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatFecha(r.fecha_carga)}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {r.carga}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: isPendiente ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isPendiente ? '#eab308' : 'var(--success)',
                          border: `1px solid ${isPendiente ? 'rgba(234,179,8,0.2)' : 'rgba(16,185,129,0.2)'}`
                        }}>
                          {r.estado}
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

      {/* PAGINACIÓN (Ancho completo) */}
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

      {/* DETALLE EN MODAL CENTRADO EN VISTA TABLA */}
      {reclamoSeleccionado && (
        <div
          onClick={() => setReclamoSeleccionado(null)}
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
              width: '100%',
              maxWidth: '550px',
              backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {renderDetalleReclamo()}
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN CENTRADO */}
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
              width: '100%',
              maxWidth: '500px',
              backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >

            {/* CABECERA DRAWER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Registrar Nuevo Reclamo</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga de incidentes de agencias</span>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleCrearReclamo} style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>

              {/* EMPRESA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Empresa *</label>
                <select
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleCreateEmpresaChange}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">— Seleccionar —</option>
                  <option value="Palpitos">Pálpitos</option>
                  <option value="Alfa">Alfa</option>
                  <option value="Otros">Otros (No Agencias)</option>
                </select>
              </div>

              {/* ID AGENCIA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>ID Agencia *</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleCreateIdChange}
                  placeholder="Ej: 1205"
                  required
                  autoComplete="off"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-md)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    borderColor: idHint.found === true ? 'var(--success)' : idHint.found === false ? 'var(--error)' : 'var(--border-md)'
                  }}
                />
                {idHint.text && (
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: idHint.type === 'ok' ? 'var(--success)' : 'var(--error)'
                  }}>
                    {idHint.text}
                  </span>
                )}
              </div>

              {/* NOMBRE SUCURSAL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nombre / Sucursal *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleCreateChange}
                  placeholder="Se completa automáticamente al validar ID"
                  required
                  readOnly={formData.empresa !== "Otros" && formData.empresa !== ""}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-md)',
                    backgroundColor: (formData.empresa !== "Otros" && formData.empresa !== "") ? 'var(--bg-input)' : 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    opacity: (formData.empresa !== "Otros" && formData.empresa !== "") ? 0.75 : 1
                  }}
                />
              </div>

              {/* TELÉFONO Y HORARIO */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleCreateChange}
                    placeholder="Ej: 3624123456"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Horario</label>
                  <input
                    type="text"
                    name="horario"
                    value={formData.horario}
                    onChange={handleCreateChange}
                    placeholder="Ej: 09:00 a 22:00"
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* OPERADOR CARGA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tu Nombre (Soporte) *</label>
                <select
                  name="carga"
                  value={formData.carga}
                  onChange={handleCreateChange}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">— Seleccionar Operador —</option>
                  {listaTecnicos.map((tecnico, index) => (
                    <option key={index} value={tecnico}>{tecnico}</option>
                  ))}
                </select>
              </div>

              {/* DETALLE PROBLEMA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Problema (Detalle) *</label>
                <textarea
                  name="informa"
                  value={formData.informa}
                  onChange={handleCreateChange}
                  placeholder="Describí detalladamente la avería o problema técnico..."
                  required
                  rows={4}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* ACCIONES FORMULARIO */}
              <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Registrando..." : "Registrar Reclamo"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ESTILOS DE TRANSICIONES */}
      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* MODAL DE SOLUCIÓN CENTRADO */}
      {isSolucionando && (
        <div
          onClick={cerrarSolucion}
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
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-card)',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-md)',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowY: 'auto',
              animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >

            {/* CABECERA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-md)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} style={{ color: '#8b5cf6' }} /> Registro de Solución
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {solFormData.originRowId ? 'Solución vinculada a reclamo' : 'Solución sin reclamo asociado'}
                </span>
              </div>
              <button
                onClick={cerrarSolucion}
                style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULARIO DE SOLUCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>

              {/* EMPRESA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Empresa *</label>
                <select
                  name="empresa"
                  value={solFormData.empresa}
                  onChange={handleSolEmpresaChange}
                  disabled={!!solFormData.originRowId}
                  style={{
                    padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)',
                    backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem',
                    outline: 'none', cursor: solFormData.originRowId ? 'not-allowed' : 'pointer',
                    opacity: solFormData.originRowId ? 0.7 : 1
                  }}
                >
                  <option value="">— Seleccionar —</option>
                  <option value="Palpitos">Pálpitos</option>
                  <option value="Alfa">Alfa</option>
                  <option value="TucuApuestas">TucuApuestas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* ID + NOMBRE */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: '0 0 110px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>ID</label>
                  <input
                    type="text"
                    name="id"
                    className={solIdClassName}
                    value={solFormData.id}
                    onChange={handleSolIdChange}
                    autoComplete="off"
                    readOnly={!!solFormData.originRowId}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)',
                      backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                      borderColor: solIdHint.found === true ? 'var(--success)' : solIdHint.found === false ? 'var(--error)' : 'var(--border-md)',
                      opacity: solFormData.originRowId ? 0.7 : 1
                    }}
                  />
                  {solIdHint.text && (
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: solIdHint.type === 'ok' ? 'var(--success)' : 'var(--error)' }}>
                      {solIdHint.text}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={solFormData.nombre}
                    readOnly
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.9rem', outline: 'none', opacity: 0.75 }}
                  />
                </div>
              </div>

              {/* TRABAJO REALIZADO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Trabajo realizado *</label>
                <textarea
                  name="trabajo"
                  rows={4}
                  placeholder="Descripción detallada de la solución..."
                  value={solFormData.trabajo}
                  onChange={handleSolChange}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* SEPARADOR */}
              <div style={{ borderTop: '1px solid var(--border-md)', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asignación de Técnicos</span>
              </div>

              {/* TÉCNICOS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Técnicos</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3].map(num => (
                    <select
                      key={num}
                      name={`tecnico${num}`}
                      value={solFormData[`tecnico${num}`]}
                      onChange={handleSolChange}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="">—</option>
                      {listaTecnicos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ))}
                </div>
              </div>

              {/* ACCIONES */}
              <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  type="button"
                  disabled={solIsSubmitting}
                  onClick={() => handleSolConfirmSubmit(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.95rem', cursor: solIsSubmitting ? 'not-allowed' : 'pointer', opacity: solIsSubmitting ? 0.7 : 1 }}
                >
                  {solIsSubmitting ? 'Guardando...' : 'Guardar Solución'}
                </button>
                <button
                  type="button"
                  onClick={cerrarSolucion}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTE */}
      <ReporteReclamosModal 
        isOpen={isModalReporteOpen} 
        onClose={() => setIsModalReporteOpen(false)} 
      />

    </div>
  );
};

export default ReclamosManager;
