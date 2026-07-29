import React, { useState, useMemo } from 'react';
import { Package, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, Box, AlertTriangle, AlertCircle, Save, X } from 'lucide-react';
import { useInsumosManager } from '../hooks/useInsumosManager';

const InsumosManager = () => {
    const { insumos, loading, error, actionLoading, createInsumo, updateInsumo, deleteInsumo } = useInsumosManager();
    const [searchTerm, setSearchTerm] = useState('');
    const [mensaje, setMensaje] = useState({ text: '', type: '' });
    
    const initialFormState = {
        codigo: '',
        descripcion: '',
        marca: '',
        categoria: '',
        pide_serie: false,
        prefijo_serie: '',
        pide_nro: false,
        prefijo_nro: '',
        pide_componentes: false
    };

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [originalCode, setOriginalCode] = useState(null);
    const [isCreatingCategoria, setIsCreatingCategoria] = useState(false);

    const categoriasDisponibles = useMemo(() => {
        const cats = new Set(insumos.map(i => i.categoria).filter(Boolean));
        return Array.from(cats).sort();
    }, [insumos]);

    const showMessage = (text, type = 'success') => {
        setMensaje({ text, type });
        setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
    };

    const handleOpenForm = (insumo = null) => {
        if (insumo) {
            setFormData(insumo);
            setIsEditing(true);
            setOriginalCode(insumo.codigo);
            setIsCreatingCategoria(false);
        } else {
            setFormData(initialFormState);
            setIsEditing(false);
            setOriginalCode(null);
            setIsCreatingCategoria(false);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(initialFormState);
        setIsEditing(false);
        setOriginalCode(null);
        setIsCreatingCategoria(false);
    };

    const handleSave = async () => {
        if (!formData.descripcion || !formData.categoria) {
            showMessage('La descripción y la categoría son obligatorias.', 'error');
            return;
        }

        if (isEditing && !formData.codigo) {
            showMessage('El código es obligatorio para editar.', 'error');
            return;
        }

        if (isEditing) {
            const result = await updateInsumo(originalCode, formData);
            if (result.success) {
                showMessage(`Insumo "${formData.descripcion}" actualizado exitosamente.`);
                handleCloseForm();
            } else {
                showMessage(result.error, 'error');
            }
        } else {
            const result = await createInsumo(formData);
            if (result.success) {
                showMessage(`Insumo "${formData.descripcion}" creado exitosamente.`);
                handleCloseForm();
            } else {
                showMessage(result.error, 'error');
            }
        }
    };

    const handleDelete = async (insumo) => {
        if (window.confirm(`¿Estás seguro que deseas eliminar el insumo "${insumo.descripcion}"? Esta acción no se puede deshacer y fallará si el insumo ya está en uso.`)) {
            const result = await deleteInsumo(insumo.codigo);
            if (result.success) {
                showMessage(`Insumo "${insumo.descripcion}" eliminado exitosamente.`);
            } else {
                showMessage(result.error, 'error');
            }
        }
    };

    const filteredInsumos = useMemo(() => {
        if (!searchTerm) return insumos;
        const lowerSearch = searchTerm.toLowerCase();
        return insumos.filter(ins => 
            (ins.codigo && ins.codigo.toLowerCase().includes(lowerSearch)) ||
            (ins.descripcion && ins.descripcion.toLowerCase().includes(lowerSearch)) ||
            (ins.marca && ins.marca.toLowerCase().includes(lowerSearch)) ||
            (ins.categoria && ins.categoria.toLowerCase().includes(lowerSearch))
        );
    }, [insumos, searchTerm]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'system-ui, sans-serif' }}>
            {mensaje.text && (
                <div style={{
                    padding: '12px 16px', borderRadius: '8px', 
                    backgroundColor: mensaje.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
                    color: mensaje.type === 'error' ? 'var(--error)' : 'var(--success)',
                    border: `1px solid ${mensaje.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
                    fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    {mensaje.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    {mensaje.text}
                </div>
            )}

            {error && (
                <div style={{
                    padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--error-bg)',
                    color: 'var(--error)', border: '1px solid var(--error)',
                    fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <AlertTriangle size={18} /> Error general: {error}
                </div>
            )}

            {!showForm ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Buscar por código, descripción, marca o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px',
                                    border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)',
                                    color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                                }}
                            />
                        </div>
                        
                        <button
                            onClick={() => handleOpenForm()}
                            style={{
                                padding: '10px 20px', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--accent-blue)', color: '#fff', fontWeight: '600',
                                fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                            }}
                        >
                            <Plus size={18} /> Agregar Insumo
                        </button>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', borderBottom: '1px solid var(--border)' }}>
                            <Package size={22} color="var(--accent-blue)" />
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Catálogo de Insumos ({filteredInsumos.length})</h2>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando catálogo...</div>
                        ) : filteredInsumos.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron insumos.</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Código</th>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Descripción</th>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Marca</th>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Categoría</th>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Configuración</th>
                                            <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInsumos.map(insumo => (
                                            <tr key={insumo.codigo} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px 20px', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    {insumo.codigo}
                                                </td>
                                                <td style={{ padding: '12px 20px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                                    {insumo.descripcion}
                                                </td>
                                                <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {insumo.marca || '-'}
                                                </td>
                                                <td style={{ padding: '12px 20px' }}>
                                                    {insumo.categoria ? (
                                                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                                                            {insumo.categoria}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ padding: '12px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {insumo.pide_serie && <span>Serie: Sí {insumo.prefijo_serie ? `(${insumo.prefijo_serie})` : ''}</span>}
                                                        {insumo.pide_nro && <span>Terminal: Sí {insumo.prefijo_nro ? `(${insumo.prefijo_nro})` : ''}</span>}
                                                        {insumo.pide_componentes && <span>Pide Componentes</span>}
                                                        {!insumo.pide_serie && !insumo.pide_nro && !insumo.pide_componentes && <span>Estándar</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => handleOpenForm(insumo)}
                                                            style={{ padding: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-md)', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(insumo)}
                                                            disabled={actionLoading}
                                                            style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Box size={22} color="var(--accent-blue)" />
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
                            </h2>
                        </div>
                        <button 
                            onClick={handleCloseForm}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Categoría *</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {!isCreatingCategoria ? (
                                        <>
                                            <select
                                                value={formData.categoria || ''}
                                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                            >
                                                <option value="">-- Seleccionar Categoría --</option>
                                                {categoriasDisponibles.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => { setIsCreatingCategoria(true); setFormData({ ...formData, categoria: '' }); }}
                                                style={{ padding: '10px 15px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                + Nueva
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={formData.categoria || ''}
                                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value.toUpperCase() })}
                                                placeholder="Ej: NUEVA CATEGORIA"
                                                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setIsCreatingCategoria(false); setFormData({ ...formData, categoria: '' }); }}
                                                style={{ padding: '10px 15px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Código {!isEditing && '(Autogenerado)'}</label>
                                <input
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    disabled={!isEditing}
                                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: !isEditing ? 'rgba(0,0,0,0.2)' : 'var(--bg-input)', color: !isEditing ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '0.9rem', outline: 'none', cursor: !isEditing ? 'not-allowed' : 'text' }}
                                    placeholder={!isEditing ? (formData.categoria ? `Ej: ${formData.categoria.substring(0,3).toUpperCase()}-...` : "Selecciona categoría...") : "Ej: TECLADO01"}
                                />
                            </div>
                            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Descripción *</label>
                                <input
                                    type="text"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                    placeholder="Ej: Teclado Mecánico USB"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Marca</label>
                                <input
                                    type="text"
                                    value={formData.marca || ''}
                                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                                    placeholder="Ej: Logitech"
                                />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-main)' }}>Configuración Avanzada</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)', minWidth: '150px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.pide_serie}
                                            onChange={(e) => setFormData({ ...formData, pide_serie: e.target.checked })}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        Pide N° Serie
                                    </label>
                                    {formData.pide_serie && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefijo:</span>
                                            <input 
                                                type="text"
                                                value={formData.prefijo_serie || ''}
                                                onChange={(e) => setFormData({ ...formData, prefijo_serie: e.target.value })}
                                                placeholder="Ej: SN-"
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)', minWidth: '150px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.pide_nro}
                                            onChange={(e) => setFormData({ ...formData, pide_nro: e.target.checked })}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        Pide N° Terminal
                                    </label>
                                    {formData.pide_nro && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefijo:</span>
                                            <input 
                                                type="text"
                                                value={formData.prefijo_nro || ''}
                                                onChange={(e) => setFormData({ ...formData, prefijo_nro: e.target.value })}
                                                placeholder="Ej: T"
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.pide_componentes}
                                            onChange={(e) => setFormData({ ...formData, pide_componentes: e.target.checked })}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        Requiere asociar componentes internos (Ej: CPU necesita placa, disco)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                            onClick={handleCloseForm}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={actionLoading}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-blue)', color: '#fff', fontWeight: '600', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}
                        >
                            <Save size={18} /> {actionLoading ? 'Guardando...' : (isEditing ? 'Actualizar Insumo' : 'Crear Insumo')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsumosManager;
