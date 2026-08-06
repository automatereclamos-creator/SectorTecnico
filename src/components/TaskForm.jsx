import React, { useState, useEffect } from 'react';
import { useTaskForm } from '../hooks/useTaskForm';
import { useMantenimientoForm } from '../hooks/useMantenimientoForm';
import PreviewModal from './PreviewModal';
import MaterialesManager from './MaterialesManager';
import { getListaTecnicos } from '../services/perfilesService';
import { Plus, RefreshCw, Phone, User, AlertCircle, Wrench, X, ClipboardList } from 'lucide-react';
import '../styles.css';

const TaskForm = ({ userEmail }) => {
  const [showMantenimiento, setShowMantenimiento] = useState(false);
  const [listaTecnicos, setListaTecnicos] = useState([]);

  useEffect(() => {
    getListaTecnicos().then(setListaTecnicos);
  }, []);

  const {
    formData, idHint, modalOpen, previewContent, isSubmitting, isLoading,
    isCopied, message, handleChange, handleEmpresaChange,
    handleIdChange, handleOpenModal, setModalOpen, handleCopy, handleConfirmSubmit,
    reclamosPendientes, tareasPendientes, handleSelectReclamo, handleSelectTarea, fetchReclamos, fetchTareas,
    isFormVisible, handleNuevaSolucion, handleCancelarFormulario,
    materiales, addMaterial, removeMaterial, handleMaterialChange, matError,
    equiposEnAgencia
  } = useTaskForm(userEmail);

  const handleSyncAll = () => {
    fetchReclamos();
    fetchTareas();
  };

  const {
    empresa: mantEmpresa,
    empresaBloqueada,
    agenciasLista,
    observaciones: mantObs,
    inputId: mantInputId,
    inputNombre: mantInputNombre,
    inputUuid: mantInputUuid,
    idHint: mantIdHint,
    isSubmitting: mantSubmitting,
    message: mantMsg,
    handleEmpresaChange: handleMantEmpresaChange,
    handleIdChange: handleMantIdChange,
    handleAgregarAgencia,
    handleQuitarAgencia,
    handleObservacionesChange: handleMantObsChange,
    handleSubmit: handleMantSubmit
  } = useMantenimientoForm(userEmail, () => {
    setShowMantenimiento(false);
  });

  const idClassName = idHint.found === true ? "found" : idHint.found === false ? "not-found" : "";
  const mantIdClassName = mantIdHint.found === true ? "found" : mantIdHint.found === false ? "not-found" : "";

  return (
    <div style={{ position: 'relative' }}>
      <PreviewModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmSubmit} previewContent={previewContent}
        isSubmitting={isSubmitting} isCopied={isCopied} onCopy={handleCopy}
      />

      {showMantenimiento ? (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={20} style={{ color: '#10b981' }} /> Registro de Mantenimiento
            </h1>
            <button onClick={() => setShowMantenimiento(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Volver</button>
          </div>
          <div className="card-body">

            {/* SELECTOR DE EMPRESA (se bloquea cuando hay agencias en la lista) */}
            <div className="field">
              <label>Empresa</label>
              <select
                className={`empresa-select ${mantEmpresa.toLowerCase()}`}
                value={mantEmpresa}
                onChange={handleMantEmpresaChange}
                disabled={empresaBloqueada}
                style={empresaBloqueada ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <option value="">— Seleccionar —</option>
                <option value="Palpitos">Palpitos</option>
                <option value="Alfa">Alfa</option>
                <option value="TucuApuestas">TucuApuestas</option>
                <option value="Otros">Otros</option>
              </select>
              {empresaBloqueada && <span style={{ fontSize: '0.7rem', color: 'var(--text-hint)', marginTop: '4px' }}>Empresa bloqueada mientras haya agencias en la lista</span>}
            </div>

            {/* INPUT PARA AGREGAR AGENCIAS */}
            {mantEmpresa && (
              <>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="field" style={{ flex: '0 0 100px' }}>
                    <label>ID</label>
                    <input
                      type="text"
                      className={mantIdClassName}
                      value={mantInputId}
                      onChange={handleMantIdChange}
                      autoComplete="off"
                      placeholder="Ej: 1207"
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={mantInputNombre}
                      readOnly
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAgregarAgencia}
                    disabled={!mantInputUuid}
                    style={{
                      padding: '9px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                      backgroundColor: mantInputUuid ? '#10b981' : 'var(--bg-input)',
                      color: mantInputUuid ? '#fff' : 'var(--text-hint)',
                      fontWeight: '600', fontSize: '0.85rem', cursor: mantInputUuid ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0
                    }}
                  >
                    <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Agregar
                  </button>
                </div>
                <div className={`id-hint ${mantIdHint.type}`} style={{ marginTop: '-8px' }}>{mantIdHint.text}</div>
              </>
            )}

            {/* LISTA DE AGENCIAS AGREGADAS */}
            {agenciasLista.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Agencias a registrar ({agenciasLista.length})
                  </span>
                </div>
                <div style={{
                  maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px',
                  padding: '8px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-md)'
                }}>
                  {agenciasLista.map((ag, idx) => (
                    <div key={ag.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem', minWidth: '20px' }}>{idx + 1}.</span>
                        <span style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.8rem' }}>ID {ag.id}</span>
                        <span style={{ color: 'var(--text-main)' }}>{ag.nombre}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuitarAgencia(ag.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title="Quitar de la lista"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OBSERVACIONES GLOBALES */}
            {agenciasLista.length > 0 && (
              <>
                <div className="field" style={{ marginTop: '4px' }}>
                  <label>Observaciones Generales (Opcional)</label>
                  <textarea
                    rows="3"
                    placeholder="Ej: Limpieza de terminales, verificación de cables..."
                    value={mantObs}
                    onChange={handleMantObsChange}
                  />
                </div>

                <button
                  type="button"
                  className="btn-submit"
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  disabled={mantSubmitting}
                  onClick={handleMantSubmit}
                >
                  {mantSubmitting ? 'Registrando...' : `Registrar ${agenciasLista.length} Agencia${agenciasLista.length > 1 ? 's' : ''} y Enviar`}
                </button>
              </>
            )}

            {mantMsg.text && <div className={`msg ${mantMsg.type}`}>{mantMsg.text}</div>}
          </div>
        </div>
      ) : !isFormVisible ? (
        <div style={{ maxWidth: '850px', margin: '0 auto 25px auto', padding: '0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '500' }}>Bandeja de Trabajo</h2>

            <button onClick={handleSyncAll} disabled={isLoading} className={`btn-sync ${isLoading ? 'loading' : ''}`} aria-label="Sincronizar bandeja">
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>{isLoading ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          </div>

          <div className="pendientes-grid">
            <div onClick={handleNuevaSolucion} className="reclamo-card nueva-solucion" role="button" tabIndex={0} aria-label="Crear nueva solución">
              <Plus size={24} strokeWidth={2} />
              <div style={{ fontWeight: '600' }}>Nueva Solución</div>
            </div>

            <div onClick={() => setShowMantenimiento(true)} className="reclamo-card nuevo-mantenimiento" role="button" tabIndex={0} aria-label="Cargar mantenimiento">
              <Wrench size={24} strokeWidth={2} />
              <div style={{ fontWeight: '600' }}>Cargar Mantenimiento</div>
            </div>

            {reclamosPendientes && reclamosPendientes.map(r => (
              <div key={r.rowId} onClick={() => handleSelectReclamo(r)} className="reclamo-card tipo-reclamo">
                <div className="reclamo-card-header">
                  <span className={`badge ${r.empresa?.toLowerCase()}`}>
                    {r.empresa || 'S/D'}
                  </span>
                  <span className="id-tag">ID {r.id}</span>
                </div>
                <div className="reclamo-problema-destacado">{r.informa}</div>
                <div className="reclamo-ubicacion-secundaria">{r.nombre}</div>
                <div className="reclamo-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {r.telefono || '---'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {r.carga}</span>
                </div>
              </div>
            ))}

            {tareasPendientes && tareasPendientes.map(t => (
              <div key={t.rowId} onClick={() => handleSelectTarea(t)} className="reclamo-card tipo-tarea">
                <div className="reclamo-card-header">
                  <span className={`badge ${t.empresa?.toLowerCase()}`}>
                    {t.empresa || 'S/D'}
                  </span>
                  <span className="id-tag" style={{ color: '#0ea5e9' }}>TAREA — ID {t.id}</span>
                </div>
                <div className="reclamo-problema-destacado">{t.descripcion}</div>
                <div className="reclamo-ubicacion-secundaria">{t.nombre}</div>
                <div className="reclamo-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t.contacto ? <><Phone size={12} /> {t.contacto}</> : <><ClipboardList size={12} /> Tarea</>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {t.creador || 'Encargado'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Registro de Solución</h1>
            <button onClick={handleCancelarFormulario} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Volver</button>
          </div>
          <div className="card-body">

            <div className="field">
              <label>Empresa</label>
              <select
                className={`empresa-select ${(formData.empresa || '').toLowerCase()}`}
                name="empresa"
                value={formData.empresa}
                onChange={handleEmpresaChange}
                disabled={!!formData.originRowId || !!formData.originTareaId}
                style={(formData.originRowId || formData.originTareaId) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <option value="">— Seleccionar —</option>
                <option value="Palpitos">Palpitos</option>
                <option value="Alfa">Alfa</option>
                <option value="TucuApuestas">TucuApuestas</option>
                <option value="Otros">Otros</option>
              </select>
              {formData.originRowId && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                  Bloqueado: Vinculado a un reclamo pendiente
                </span>
              )}
              {formData.originTareaId && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                  Bloqueado: Vinculado a una tarea asignada
                </span>
              )}
            </div>

            <div className="row">
              <div className="field">
                <label>ID</label>
                <input
                  type="text"
                  className={idClassName}
                  name="id"
                  value={formData.id}
                  onChange={handleIdChange}
                  autoComplete="off"
                  disabled={!!formData.originRowId || !!formData.originTareaId}
                  style={(formData.originRowId || formData.originTareaId) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
                <div className={`id-hint ${idHint.type}`}>{idHint.text}</div>
              </div>
              <div className="field">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} readOnly style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="field">
              <label>Trabajo realizado</label>
              <textarea name="trabajo" rows="3" placeholder="Descripción detallada..." value={formData.trabajo} onChange={handleChange}></textarea>
            </div>

            <hr className="divider" />
            <p className="section-label">Materiales</p>

            {matError && (
              <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertCircle size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{matError}</span>
              </div>
            )}

            <MaterialesManager
              materiales={materiales}
              addMaterial={addMaterial}
              removeMaterial={removeMaterial}
              handleMaterialChange={handleMaterialChange}
              equiposAgencia={equiposEnAgencia}
            />

            <hr className="divider" />
            <p className="section-label">Horario y Técnicos</p>

            <div className="row">
              <div className="field">
                <label>Hora inicio</label>
                <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Hora fin</label>
                <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} />
              </div>
            </div>

            <div className="field">
              <label>Técnicos</label>
              <div className="row-3">
                {[1, 2, 3].map(num => (
                  <select key={num} name={`tecnico${num}`} value={formData[`tecnico${num}`]} onChange={handleChange}>
                    <option value="">—</option>
                    {listaTecnicos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ))}
              </div>
            </div>

            <button className="btn-submit" onClick={handleOpenModal}>Revisar y Registrar</button>
            {message.text && <div className={`msg ${message.type}`}>{message.text}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;