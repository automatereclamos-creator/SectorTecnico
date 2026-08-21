// src/components/ModalTracking.jsx
import React, { useState, useEffect } from 'react';
import { X, Activity, ArrowDownRight, ArrowUpRight, Package, Check, MapPin, Building2, ChevronRight } from 'lucide-react';
import { APP_TIMEZONE } from '../utils/timezone';

const T = {
    bgMain: 'var(--bg-main)',
    bgSurface: 'var(--bg-surface)',
    bgCard: 'var(--bg-card)',
    bgInput: 'var(--bg-input)',
    border: 'var(--border)',
    borderMd: 'var(--border-md)',
    textMain: 'var(--text-main)',
    textMuted: 'var(--text-muted)',
    textHint: 'var(--text-hint)',
    accent: 'var(--accent-blue)',
    accentHover: 'var(--accent-blue-h)',
    accentIndigo: 'var(--accent-indigo)',
    accentIndigoBg: 'var(--accent-indigo-bg)',
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)',
    radiusSm: 'var(--radius-sm, 6px)',
    radiusLg: 'var(--radius-lg, 12px)',
    shadowModal: 'var(--shadow-lg)',
    transition: 'var(--transition, 0.2s cubic-bezier(0.4, 0, 0.2, 1))',
};

const COLOR_MAP = {
    'AIO': '#2563eb', 'AIO DEPORTE': '#7c3aed', 'AIO CAMARAS': '#0891b2',
    'CPU': '#16a34a', 'MONITORES': '#d97706', 'TICKETERAS': '#db2777',
    'SCANNERS': '#dc2626', 'MOUSE': '#64748b', 'TECLADOS': '#64748b',
    'REDES': '#0284c7', 'CAMARAS': '#c2410c', 'TV': '#b45309',
    'IMPRESORAS': '#7c3aed', 'COMPONENTES': '#475569',
};

const getColor = (cat) => COLOR_MAP[cat?.toUpperCase()] ?? '#64748b';

const overlayStyle = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
};

const containerModalStyle = {
    backgroundColor: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusLg,
    width: '100%',
    maxWidth: 600,
    boxShadow: T.shadowModal,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
};

const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
};

const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: `1px solid ${T.borderMd}`, borderRadius: T.radiusSm,
    backgroundColor: T.bgInput, color: T.textMain, fontSize: '0.875rem', outline: 'none',
};

const selectStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: `1px solid ${T.borderMd}`, borderRadius: T.radiusSm,
    backgroundColor: T.bgCard, color: T.textMain, fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
};

const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', borderRadius: T.radiusSm,
    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', border: 'none', transition: T.transition,
};

const btnPrimary = { ...btnBase, backgroundColor: T.accent, color: '#fff' };
const btnSuccess = { ...btnBase, backgroundColor: T.success, color: '#fff' };
const btnSecondary = { ...btnBase, backgroundColor: T.bgCard, color: T.textMuted, border: `1px solid ${T.borderMd}` };
const btnIcon = { background: 'none', border: `1px solid ${T.borderMd}`, borderRadius: '6px', color: T.textMuted, padding: '5px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const centeredMsg = { padding: 40, textAlign: 'center', color: T.textMuted, fontSize: '0.9rem' };

const ModalTracking = ({ equipo, onCancel, obtenerHistorialEquipo, procesarAsignacion, actualizarEquipo, agenciasVirtuales, refresh }) => {
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [errorHistorial, setErrorHistorial] = useState(null);

    const [asignando, setAsignando] = useState(false);
    const [agenciaInput, setAgenciaInput] = useState('');
    const [procesando, setProcesando] = useState(false);

    const [traspasando, setTraspasando] = useState(false);
    const [condicionTraspaso, setCondicionTraspaso] = useState('PARA REPARAR');
    const [obsTraspaso, setObsTraspaso] = useState('');

    useEffect(() => {
        const fetchHistorial = async () => {
            setLoadingHistorial(true);
            const res = await obtenerHistorialEquipo(equipo.id);
            if (res.success) setHistorial(res.data);
            else setErrorHistorial(res.error);
            setLoadingHistorial(false);
        };
        if (equipo && equipo.id) fetchHistorial();
    }, [equipo, obtenerHistorialEquipo]);

    const handleAsignar = async () => {
        if (!agenciaInput.trim()) return;
        setProcesando(true);
        const res = await procesarAsignacion(equipo.id, agenciaInput.trim());
        setProcesando(false);
        if (res.success) {
            setAsignando(false);
            if (refresh) refresh(); // Refrescar grilla de origen
            onCancel();
        } else {
            alert("Error asignando: " + res.error);
        }
    };

    const handleTraspasoStock = async () => {
        const uuidStockMaestro = agenciasVirtuales?.stock?.id;
        if (!uuidStockMaestro) {
            alert("Error: No se encontró el identificador del Stock Maestro en la base de datos.");
            return;
        }

        const confirmacion = window.confirm(`¿Confirmas el traspaso de este equipo al Stock Maestro en condición [${condicionTraspaso}]?`);
        if (!confirmacion) return;

        setProcesando(true);
        const notesTraspasoFinal = `Traspaso a Stock Maestro (Estado: ${condicionTraspaso}). ${obsTraspaso.trim()}`.trim();

        const res = await procesarAsignacion(equipo.id, uuidStockMaestro, notesTraspasoFinal);

        if (res.success) {
            // Replicar los estados correctos en cascada en la base de datos e interfaz
            if (actualizarEquipo) {
                if (condicionTraspaso === 'DESECHADO') {
                    await actualizarEquipo(equipo.id, { estado: 'DESECHADO' });
                } else if (condicionTraspaso === 'PARA REPARAR') {
                    await actualizarEquipo(equipo.id, { estado: 'EN TALLER' });
                }
            }
            
            setProcesando(false);
            setTraspasando(false);
            if (refresh) refresh(); // Refrescar grilla de origen (elimina padre e hijos de la vista de origen)
            onCancel();
        } else {
            setProcesando(false);
            alert("Error al procesar el traspaso interno: " + res.error);
        }
    };

    const catColor = getColor(equipo?.categoria);
    const esDeOficinaTecnica = equipo?.agencias?.id_agencia === '1213';

    if (!equipo) return null;

    return (
        <div style={overlayStyle}>
            <div style={containerModalStyle}>

                <div style={{ padding: '24px 28px', backgroundColor: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ backgroundColor: T.accentIndigoBg, borderRadius: T.radiusSm, padding: 10, display: 'flex' }}>
                                <Activity size={20} color={T.accentIndigo} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: T.textMain, fontSize: '1.25rem', fontWeight: 700, fontFamily: '"Lexend", sans-serif' }}>Hoja de Vida</h3>
                                <span style={{
                                    display: 'inline-block', marginTop: 4, fontSize: '0.75rem', color: catColor, fontWeight: 700,
                                    backgroundColor: `${catColor}15`, padding: '2px 10px', borderRadius: T.radiusPill,
                                }}>
                                    {equipo.categoria}
                                </span>
                            </div>
                        </div>
                        <button onClick={onCancel} style={btnIcon}><X size={20} /></button>
                    </div>

                    {/* FICHA TÉCNICA CON REFACTOR SEMÁNTICO (CÓDIGO DE EQUIPO) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.875rem' }}>
                        <div>
                            <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Producto</div>
                            <div style={{ fontWeight: 700, color: T.textMain, fontFamily: '"Lexend", sans-serif' }}>{equipo.producto}</div>
                        </div>
                        <div>
                            <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Código de Equipo</div>
                            {equipo.codigo_patrimonio ? (
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: T.success }}>{equipo.codigo_patrimonio}</span>
                            ) : (
                                <span style={{ color: T.textHint, fontStyle: 'italic' }}>Sin código asignado</span>
                            )}
                        </div>
                        <div>
                            <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Estado Actual</div>
                            <span style={{ fontWeight: 700, color: equipo.estado === 'INSTALADO' ? T.success : T.warning }}>{equipo.estado}</span>
                        </div>
                        <div>
                            <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Ubicación</div>
                            <div style={{ fontWeight: 600, color: T.textMain }}>{equipo.agencias ? equipo.agencias.nombre : 'TALLER / DEPÓSITO'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, backgroundColor: T.bgCard }}>

                    {traspasando && (
                        <div style={{ backgroundColor: T.bgSurface, padding: '16px', borderRadius: T.radiusSm, border: `1px solid ${T.borderMd}`, marginBottom: '20px' }}>
                            <h5 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 700, color: T.textMain, fontFamily: '"Lexend", sans-serif' }}>
                                Clasificación para Envío a Stock Maestro
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Condición de Ingreso</label>
                                    <select value={condicionTraspaso} onChange={e => setCondicionTraspaso(e.target.value)} style={selectStyle}>
                                        <option value="DISPONIBLE">DISPONIBLE (Listo para instalar)</option>
                                        <option value="PARA REPARAR">PARA REPARAR (Requiere revisión en stock)</option>
                                        <option value="DESECHADO">DESECHADO (Para desguace / destrucción)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Observaciones / Notas de Taller</label>
                                    <input type="text" placeholder="Ej: Cambio de disco completado..." value={obsTraspaso} onChange={e => setObsTraspaso(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                                    <button onClick={handleTraspasoStock} disabled={procesando} style={btnSuccess}>
                                        <Check size={14} /> {procesando ? 'Procesando...' : 'Confirmar Envío'}
                                    </button>
                                    <button onClick={() => setTraspasando(false)} style={btnSecondary}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BANDEROLA DE RUTA Y PRIMERA INSTALACIÓN */}
                    {historial.length > 0 && (
                        <div style={{
                            backgroundColor: T.bgSurface,
                            border: `1px solid ${T.borderMd}`,
                            borderLeft: `4px solid ${T.accent}`,
                            borderRadius: T.radiusSm,
                            padding: '12px 16px',
                            marginBottom: 20
                        }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={13} color={T.accent} /> Ruta de Instalación (Origen a Destino)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: T.accentIndigoBg, color: T.accentIndigo, padding: '4px 10px', borderRadius: T.radiusSm, fontWeight: 700 }}>
                                    <Building2 size={14} /> 
                                    1ª Agencia: {historial[historial.length - 1]?.agencias?.nombre || equipo.agencias?.nombre || 'Taller Central'} 
                                    {historial[historial.length - 1]?.agencias?.id_agencia ? ` (#${historial[historial.length - 1]?.agencias?.id_agencia})` : ''}
                                </div>
                                <ChevronRight size={14} color={T.textMuted} />
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--success-bg, rgba(22,163,74,0.1))', color: T.success, padding: '4px 10px', borderRadius: T.radiusSm, fontWeight: 700 }}>
                                    Ubicación Actual: {equipo.agencias?.nombre || 'TALLER / DEPÓSITO'}
                                </div>
                            </div>
                        </div>
                    )}

                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Lexend", sans-serif' }}>
                        Historial de Movimientos / Ruta
                    </h4>

                    {loadingHistorial ? (
                        <div style={centeredMsg}>Cargando historial...</div>
                    ) : errorHistorial ? (
                        <div style={{ color: T.error, padding: 16, backgroundColor: 'var(--error-bg)', borderRadius: T.radiusSm, fontWeight: 600 }}>Error: {errorHistorial}</div>
                    ) : historial.length === 0 ? (
                        <div style={centeredMsg}>No hay movimientos registrados para este equipo.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {historial.map((mov, index) => {
                                const isAlta = mov.tipo === 'ALTA';
                                const isPrimera = index === historial.length - 1;
                                const movColor = isAlta ? T.success : T.error;
                                const Icon = isAlta ? ArrowDownRight : ArrowUpRight;

                                return (
                                    <div key={mov.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                                        {index !== historial.length - 1 && (
                                            <div style={{ position: 'absolute', top: 32, bottom: -16, left: 15, width: 2, backgroundColor: T.border }} />
                                        )}

                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            backgroundColor: isAlta ? 'var(--success-bg)' : 'var(--error-bg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1
                                        }}>
                                            <Icon size={16} color={movColor} />
                                        </div>

                                        <div style={{ flex: 1, paddingBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <div style={{ fontWeight: 700, color: T.textMain, fontSize: '0.9rem', fontFamily: '"Lexend", sans-serif', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                    {isAlta ? 'Asignado a' : 'Retirado de'} {mov.agencias?.nombre || 'Ubicación Interna'}
                                                    {isPrimera && (
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: T.accentIndigoBg, color: T.accentIndigo, padding: '2px 8px', borderRadius: '12px' }}>
                                                            📍 Primera Instalación
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: T.textHint, whiteSpace: 'nowrap', marginLeft: 12 }}>
                                                    {new Date(mov.creado_en).toLocaleString('es-AR', { timeZone: APP_TIMEZONE, dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: T.textMuted }}>
                                                <strong style={{ color: movColor }}>{mov.tipo}</strong> · Condición: {mov.condicion}
                                            </div>
                                            {mov.observaciones && (
                                                <div style={{ marginTop: 6, padding: '8px 12px', backgroundColor: T.bgInput, borderRadius: T.radiusSm, fontSize: '0.8rem', color: T.textMain, border: `1px solid ${T.border}` }}>
                                                    {mov.observaciones}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 28px', borderTop: `1px solid ${T.border}`, backgroundColor: T.bgSurface, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                    {esDeOficinaTecnica ? (
                        !traspasando && (
                            <button onClick={() => setTraspasando(true)} style={btnSuccess}>
                                <Package size={16} /> Traspasar a Stock Maestro
                            </button>
                        )
                    ) : equipo.estado !== 'INSTALADO' ? (
                        asignando ? (
                            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                <input type="text" placeholder="ID UUID de Agencia Destino..." value={agenciaInput} onChange={e => setAgenciaInput(e.target.value)} style={inputStyle} />
                                <button onClick={handleAsignar} disabled={procesando} style={{ ...btnPrimary, backgroundColor: T.accent }}>
                                    {procesando ? 'Asignando...' : 'Confirmar'}
                                </button>
                                <button onClick={() => setAsignando(false)} style={btnSecondary}>Cancelar</button>
                            </div>
                        ) : (
                            <button onClick={() => setAsignando(true)} style={{ ...btnPrimary, backgroundColor: T.accent }}>
                                <ArrowDownRight size={16} /> Instalar en Agencia
                            </button>
                        )
                    ) : (
                        <div style={{ fontSize: '0.8rem', color: T.textMuted }}>
                            Para trasladar, primero da de baja el equipo de su agencia actual.
                        </div>
                    )}
                    <button onClick={onCancel} style={btnSecondary}>Cerrar Ficha</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ModalTracking);