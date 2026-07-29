import React, { useState } from 'react';
import { MapPin, Phone, Clock, Search, Edit2, PlusCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight, X, Save, Trash2 } from 'lucide-react';
import { useAgenciasManager } from '../hooks/useAgenciasManager';

const AgenciasManager = () => {
    const {
        agencias,
        totalFiltrado,
        isLoading,
        mensaje,
        searchQuery,
        setSearchQuery,
        filtroEstado,
        setFiltroEstado,
        paginaActual,
        setPaginaActual,
        totalPaginas,
        agregarNuevaAgencia,
        guardarDetallesAgencia,
        toggleEstado,
        estadisticas
    } = useAgenciasManager();

    // Estado para controlar qué agencia está seleccionada para ver/editar
    const [agenciaSeleccionada, setAgenciaSeleccionada] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false); // true = editando, false = viendo
    const [modoCreacion, setModoCreacion] = useState(false); // true = agregando nueva agencia

    // Formularios temporales
    const [formAgencia, setFormAgencia] = useState({
        id_agencia: '',
        empresa: 'palpitos',
        nombre: '',
        telefono: '',
        horario_atencion: '',
        latitud: ''
    });

    const handleSelectAgencia = (agencia) => {
        setAgenciaSeleccionada(agencia);
        setModoEdicion(false);
        setModoCreacion(false);
        setFormAgencia({
            id_agencia: agencia.id_agencia || '',
            empresa: agencia.empresa || 'palpitos',
            nombre: agencia.nombre || '',
            telefono: agencia.telefono || '',
            horario_atencion: agencia.horario_atencion || '',
            latitud: agencia.latitud !== null ? agencia.latitud.toString() : ''
        });
    };

    const iniciarCreacion = () => {
        setAgenciaSeleccionada(null);
        setModoEdicion(false);
        setModoCreacion(true);
        setFormAgencia({
            id_agencia: '',
            empresa: 'palpitos',
            nombre: '',
            telefono: '',
            horario_atencion: '',
            latitud: ''
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (modoCreacion) {
            const success = await agregarNuevaAgencia(formAgencia);
            if (success) {
                setModoCreacion(false);
            }
        } else if (agenciaSeleccionada) {
            const success = await guardarDetallesAgencia(agenciaSeleccionada.id, {
                ...formAgencia,
                activa: agenciaSeleccionada.activa
            });
            if (success) {
                setModoEdicion(false);
                // Actualizar la vista detallada
                setAgenciaSeleccionada({
                    ...agenciaSeleccionada,
                    ...formAgencia,
                    latitud: formAgencia.latitud ? parseFloat(formAgencia.latitud) : null
                });
            }
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'system-ui, sans-serif' }}>

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

            {/* TARJETAS DE MÉTRICAS / ESTADÍSTICAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase' }}>De Alta (Activas)</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{estadisticas.activas}</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: '600', textTransform: 'uppercase' }}>De Baja (Inactivas)</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--error)' }}>{estadisticas.inactivas}</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '600', textTransform: 'uppercase' }}>Agencias ALFA</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{estadisticas.totalAlfa}</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '600', textTransform: 'uppercase' }}>Agencias PÁLPITOS</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>{estadisticas.totalPalpitos}</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-md)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '600', textTransform: 'uppercase' }}>Agencias TUCUAPUESTAS</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{estadisticas.totalTucuApuestas}</span>
                </div>
            </div>


            {/* SECCIÓN SPLIT (IZQ: TABLA Y BUSCADOR, DER: DETALLES O EDICIÓN) */}
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>

                {/* COLUMNA IZQUIERDA: LISTADO */}
                <div style={{ flex: '1 1 650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* BARRA DE FILTROS & BÚSQUEDA */}
                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar por ID, nombre o empresa..."
                                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select
                                value={filtroEstado}
                                onChange={e => setFiltroEstado(e.target.value)}
                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="todos">Todos los Estados</option>
                                <option value="alta">Solo Activas (Alta)</option>
                                <option value="baja">Solo Inactivas (Baja)</option>
                            </select>

                            <button
                                onClick={iniciarCreacion}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            >
                                <PlusCircle size={18} /> Nueva Agencia
                            </button>
                        </div>
                    </div>

                    {/* TABLA DE AGENCIAS */}
                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-md)' }}>
                                        <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID / Código</th>
                                        <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre Agencia</th>
                                        <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa</th>
                                        <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agencias.map(ag => {
                                        const isSelected = agenciaSeleccionada?.id === ag.id;
                                        return (
                                            <tr
                                                key={ag.id}
                                                onClick={() => handleSelectAgencia(ag)}
                                                style={{
                                                    borderBottom: '1px solid var(--border)',
                                                    backgroundColor: isSelected ? 'rgba(3, 105, 161, 0.08)' : ag.activa ? 'transparent' : 'rgba(239, 68, 68, 0.03)',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                className="crm-table-row"
                                            >
                                                <td style={{ padding: '14px 20px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                    {ag.id_agencia}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: ag.activa ? 'var(--text-main)' : 'var(--text-hint)' }}>
                                                    {ag.nombre}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '600' }}>
                                                    {ag.empresa}
                                                </td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    {ag.activa ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: '700' }}>
                                                            <CheckCircle size={10} /> ACTIVO
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error)', fontSize: '0.7rem', fontWeight: '700' }}>
                                                            <XCircle size={10} /> INACTIVO
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {agencias.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {isLoading ? 'Cargando registros...' : 'No se encontraron agencias registradas con esos filtros.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* CONTROLES DE PAGINACIÓN */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Mostrando <strong>{agencias.length}</strong> de <strong>{totalFiltrado}</strong> agencias
                            </span>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                                    disabled={paginaActual === 1}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer', opacity: paginaActual === 1 ? 0.4 : 1
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                    Página {paginaActual} de {totalPaginas}
                                </span>
                                <button
                                    onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                                    disabled={paginaActual === totalPaginas}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer', opacity: paginaActual === totalPaginas ? 0.4 : 1
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: DETALLE / EDICIÓN / FORMULARIO */}
                <div style={{ flex: '1 1 400px', minWidth: '350px' }}>

                    {/* CASO A: MOSTRAR DETALLE */}
                    {agenciaSeleccionada && !modoEdicion && (
                        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalles de Agencia</span>
                                    <h3 style={{ margin: '5px 0 0 0', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700' }}>{agenciaSeleccionada.nombre}</h3>
                                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID / Código: {agenciaSeleccionada.id_agencia} | Empresa: <span style={{ textTransform: 'uppercase', fontWeight: '600' }}>{agenciaSeleccionada.empresa}</span></p>
                                </div>
                                <button
                                    onClick={() => setAgenciaSeleccionada(null)}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* CONTENEDOR DE DATOS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <Phone size={18} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Teléfono de Contacto</h4>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                            {agenciaSeleccionada.telefono || <em style={{ color: 'var(--text-hint)' }}>Sin registrar</em>}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <Clock size={18} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Horario de Atención</h4>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                            {agenciaSeleccionada.horario_atencion || <em style={{ color: 'var(--text-hint)' }}>Sin registrar</em>}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                    <MapPin size={18} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Ubicación Geográfica</h4>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                            <div style={{ padding: '6px 10px', backgroundColor: 'var(--bg-input)', borderRadius: '6px', border: '1px solid var(--border-md)', minWidth: '120px' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Latitud</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                                    {agenciaSeleccionada.latitud !== null ? agenciaSeleccionada.latitud : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                <button
                                    onClick={() => setModoEdicion(true)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <Edit2 size={16} /> Editar Datos
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm(`¿Confirmas dar de ${agenciaSeleccionada.activa ? 'BAJA' : 'ALTA'} la agencia ${agenciaSeleccionada.nombre}?`)) {
                                            toggleEstado(agenciaSeleccionada.id, agenciaSeleccionada.activa).then(success => {
                                                if (success) {
                                                    setAgenciaSeleccionada({
                                                        ...agenciaSeleccionada,
                                                        activa: !agenciaSeleccionada.activa
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                                        borderColor: agenciaSeleccionada.activa ? 'var(--error)' : 'var(--success)',
                                        backgroundColor: agenciaSeleccionada.activa ? 'var(--error-bg)' : 'var(--success-bg)',
                                        color: agenciaSeleccionada.activa ? 'var(--error)' : 'var(--success)',
                                        fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {agenciaSeleccionada.activa ? 'Dar de Baja' : 'Dar de Alta'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CASO B: MOSTRAR FORMULARIO (EDICIÓN) */}
                    {modoEdicion && (
                        <form
                            onSubmit={handleGuardar}
                            style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700' }}>
                                        Editar: {agenciaSeleccionada.nombre}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Actualizá los campos de contacto y ubicación
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModoEdicion(false)}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* CAMPOS REQUERIDOS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Código / ID de Agencia *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={true} // No permitir cambiar código al editar
                                    value={formAgencia.id_agencia}
                                    placeholder="Ej: 1207"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Nombre de Agencia *</label>
                                <input
                                    type="text"
                                    required
                                    value={formAgencia.nombre}
                                    onChange={e => setFormAgencia({ ...formAgencia, nombre: e.target.value })}
                                    placeholder="Ej: Palpitos - Batalla de Maipú (1)"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Empresa *</label>
                                <select
                                    required
                                    value={formAgencia.empresa}
                                    onChange={e => setFormAgencia({ ...formAgencia, empresa: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="palpitos">PALPITOS</option>
                                    <option value="alfa">ALFA</option>
                                    <option value="tucuapuestas">TUCUAPUESTAS</option>
                                    <option value="otros">OTROS</option>
                                </select>
                            </div>

                            {/* CAMPOS OPCIONALES */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto y Atención</span>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Número de Teléfono</label>
                                    <input
                                        type="text"
                                        value={formAgencia.telefono}
                                        onChange={e => setFormAgencia({ ...formAgencia, telefono: e.target.value })}
                                        placeholder="Ej: 3624-987654"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Horario de Atención</label>
                                    <input
                                        type="text"
                                        value={formAgencia.horario_atencion}
                                        onChange={e => setFormAgencia({ ...formAgencia, horario_atencion: e.target.value })}
                                        placeholder="Ej: Lun a Sab 08:00 a 20:00"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* GEOLOCALIZACIÓN: SOLO LATITUD */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación Geográfica (Coordenadas)</span>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '200px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Latitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formAgencia.latitud}
                                        onChange={e => setFormAgencia({ ...formAgencia, latitud: e.target.value })}
                                        placeholder="Ej: -27.4523"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* BOTONES GUARDAR / CANCELAR */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                                >
                                    <Save size={16} />
                                    {isLoading ? 'Guardando...' : 'Guardar'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setModoEdicion(false)}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    {/* CASO C: ESTADO VACÍO (INICIAL O SIN SELECCIONAR) */}
                    {!agenciaSeleccionada && !modoCreacion && (
                        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px dotted var(--border-md)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', minHeight: '350px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>Ninguna Agencia Seleccionada</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-hint)', maxWidth: '280px' }}>
                                    Hacé clic en cualquier agencia de la grilla para ver sus detalles, horarios y coordenadas geográficas, o editá su información.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* MODAL DE CREACIÓN DE NUEVA AGENCIA */}
            {modoCreacion && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 99999, padding: '20px'
                }}>
                    <form
                        onSubmit={handleGuardar}
                        style={{
                            backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
                            padding: '30px', borderRadius: '12px', border: '1px solid var(--border-md)',
                            width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            maxHeight: '90vh', overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700' }}>
                                    Crear Nueva Agencia
                                </h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Ingresá los datos del nuevo punto de atención
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModoCreacion(false)}
                                style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CAMPOS REQUERIDOS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Código / ID de Agencia *</label>
                            <input
                                type="text"
                                required
                                value={formAgencia.id_agencia}
                                onChange={e => setFormAgencia({ ...formAgencia, id_agencia: e.target.value })}
                                placeholder="Ej: 1207"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Nombre de Agencia *</label>
                            <input
                                type="text"
                                required
                                value={formAgencia.nombre}
                                onChange={e => setFormAgencia({ ...formAgencia, nombre: e.target.value })}
                                placeholder="Ej: Palpitos - Batalla de Maipú (1)"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Empresa *</label>
                            <select
                                required
                                value={formAgencia.empresa}
                                onChange={e => setFormAgencia({ ...formAgencia, empresa: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="palpitos">PALPITOS</option>
                                <option value="alfa">ALFA</option>
                                <option value="tucuapuestas">TUCUAPUESTAS</option>
                                <option value="otros">OTROS</option>
                            </select>
                        </div>

                        {/* CAMPOS OPCIONALES */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto y Atención</span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Número de Teléfono</label>
                                <input
                                    type="text"
                                    value={formAgencia.telefono}
                                    onChange={e => setFormAgencia({ ...formAgencia, telefono: e.target.value })}
                                    placeholder="Ej: 3624-987654"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Horario de Atención</label>
                                <input
                                    type="text"
                                    value={formAgencia.horario_atencion}
                                    onChange={e => setFormAgencia({ ...formAgencia, horario_atencion: e.target.value })}
                                    placeholder="Ej: Lun a Sab 08:00 a 20:00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* GEOLOCALIZACIÓN: SOLO LATITUD */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación Geográfica (Coordenadas)</span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '200px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Latitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formAgencia.latitud}
                                    onChange={e => setFormAgencia({ ...formAgencia, latitud: e.target.value })}
                                    placeholder="Ej: -27.4523"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* BOTONES GUARDAR / CANCELAR */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                            >
                                <Save size={16} />
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setModoCreacion(false)}
                                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
};

export default AgenciasManager;
