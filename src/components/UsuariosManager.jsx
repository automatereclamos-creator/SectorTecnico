import React, { useState } from 'react';
import { UserPlus, Users, Shield, CheckCircle, XCircle, Edit2, Check, X } from 'lucide-react';
import { useUsuariosManager } from '../hooks/useUsuariosManager';

const UsuariosManager = () => {
    const { usuarios, isLoading, mensaje, ROLES_DISPONIBLES, agregarUsuario, actualizarRol, toggleEstado } = useUsuariosManager();

    const [nuevoUser, setNuevoUser] = useState({ nombre_completo: '', email: '', rol: 'tecnico' });

    // Nuevo estado para controlar qué usuario se está editando
    const [editandoRol, setEditandoRol] = useState(null); // Guardará { id, rol_nuevo }

    const handleAdd = async () => {
        const success = await agregarUsuario(nuevoUser);
        if (success) {
            setNuevoUser({ nombre_completo: '', email: '', rol: 'tecnico' });
        }
    };

    const confirmarEdicion = (usuarioId, rolNuevo, nombre) => {
        // Mensaje de confirmación para evitar errores accidentales
        if (window.confirm(`¿Estás seguro que deseas cambiar el rol de ${nombre} a ${rolNuevo.toUpperCase()}?`)) {
            actualizarRol(usuarioId, rolNuevo);
            setEditandoRol(null); // Cerramos el modo edición
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'system-ui, sans-serif' }}>

            {/* MENSAJE DE ESTADO */}
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
                    gap: '8px'
                }}>
                    {mensaje.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    {mensaje.text}
                </div>
            )}

            {/* TARJETA: AGREGAR USUARIO */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <UserPlus size={22} color="var(--accent-blue)" />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Agregar Nuevo Usuario</h2>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre Completo</label>
                            <input
                                type="text"
                                value={nuevoUser.nombre_completo}
                                onChange={e => setNuevoUser({ ...nuevoUser, nombre_completo: e.target.value })}
                                placeholder="Ej: Pablo Juarez"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo Electrónico</label>
                            <input
                                type="email"
                                value={nuevoUser.email}
                                onChange={e => setNuevoUser({ ...nuevoUser, email: e.target.value })}
                                placeholder="ejemplo@palpitos.com"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rol / Nivel</label>
                            <select
                                value={nuevoUser.rol}
                                onChange={e => setNuevoUser({ ...nuevoUser, rol: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                            >
                                {ROLES_DISPONIBLES.map(rol => <option key={rol} value={rol}>{rol.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={isLoading}
                            style={{ padding: '11px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }}
                        >
                            {isLoading ? 'Guardando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </div>
            </div>

            {/* TARJETA: LISTA DE USUARIOS */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <Users size={22} color="var(--text-muted)" />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Gestión de Perfiles</h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-md)' }}>
                                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usuario</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rol Asignado</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                                <th style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: u.activo ? 'transparent' : 'rgba(220, 38, 38, 0.04)', transition: 'background-color 0.2s' }}>

                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '600', color: u.activo ? 'var(--text-main)' : 'var(--text-hint)', fontSize: '0.95rem' }}>{u.nombre_completo}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.email}</div>
                                    </td>

                                    {/* COLUMNA ROL (Modo lectura o Modo Edición) */}
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Shield size={16} color={u.rol === 'admin' ? 'var(--error)' : 'var(--accent-blue)'} style={{ opacity: u.activo ? 1 : 0.4 }} />

                                            {editandoRol?.id === u.id ? (
                                                <select
                                                    value={editandoRol.rol_nuevo}
                                                    onChange={(e) => setEditandoRol({ ...editandoRol, rol_nuevo: e.target.value })}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--accent-blue)', outline: 'none', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 0 0 2px rgba(3,105,161,0.1)' }}
                                                >
                                                    {ROLES_DISPONIBLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                                </select>
                                            ) : (
                                                <span style={{ fontWeight: '600', color: u.activo ? 'var(--text-muted)' : 'var(--text-hint)', fontSize: '0.88rem', letterSpacing: '0.03em' }}>
                                                    {u.rol.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px 20px' }}>
                                        {u.activo ?
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: '700' }}>
                                                <CheckCircle size={12} /> ACTIVO
                                            </span> :
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error)', fontSize: '0.75rem', fontWeight: '700' }}>
                                                <XCircle size={12} /> INACTIVO
                                            </span>
                                        }
                                    </td>

                                    {/* COLUMNA ACCIONES */}
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        {editandoRol?.id === u.id ? (
                                            // Botones de Guardar / Cancelar en modo edición
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => confirmarEdicion(u.id, editandoRol.rol_nuevo, u.nombre_completo)}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--success)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '0.8rem' }}
                                                >
                                                    <Check size={14} /> Guardar
                                                </button>
                                                <button
                                                    onClick={() => setEditandoRol(null)}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '0.8rem' }}
                                                >
                                                    <X size={14} /> Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            // Botones normales (Lápiz + Deshabilitar)
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => setEditandoRol({ id: u.id, rol_nuevo: u.rol })}
                                                    disabled={!u.activo}
                                                    title="Cambiar Rol"
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--border-md)',
                                                        backgroundColor: 'var(--bg-card)',
                                                        color: 'var(--text-muted)',
                                                        cursor: u.activo ? 'pointer' : 'not-allowed',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        opacity: u.activo ? 1 : 0.5,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`¿Confirmas cambiar el estado de ${u.nombre_completo}?`)) {
                                                            toggleEstado(u.id, u.activo);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        border: '1px solid',
                                                        borderColor: u.activo ? 'var(--border-md)' : 'var(--success)',
                                                        backgroundColor: u.activo ? 'var(--bg-card)' : 'var(--success-bg)',
                                                        color: u.activo ? 'var(--text-muted)' : 'var(--success)',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {u.activo ? <>Deshabilitar</> : <>Reactivar</>}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        No se encontraron usuarios registrados en la base de datos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsuariosManager;