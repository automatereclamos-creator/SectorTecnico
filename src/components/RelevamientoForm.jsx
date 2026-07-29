import React, { useState, useEffect } from 'react';
import { Plus, Minus, ClipboardList, Trash2, Eye, Check, X } from 'lucide-react';
import { useRelevamiento } from '../hooks/useRelevamiento';
import { supabase } from '../config/supabase';
import { getBomKey } from '../services/bomService';

const unidadesStyles = {
  wrapper: { marginTop: '14px', borderTop: '1px dashed rgba(5, 150, 105, 0.3)', paddingTop: '16px', width: '100%', display: 'flex', flexDirection: 'column' },
  header: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--success)', textTransform: 'uppercase', marginBottom: '12px' },
  row: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', border: '1px solid rgba(5, 150, 105, 0.15)' },
  rowHeader: { display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed rgba(5, 150, 105, 0.2)', paddingBottom: '8px' },
  badge: { minWidth: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(5, 150, 105, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  label: { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' },
  input: { width: '100%', fontSize: '0.85rem', padding: '8px 10px', borderColor: 'rgba(5, 150, 105, 0.35)', backgroundColor: 'transparent', color: 'inherit', outline: 'none' },
  select: { width: '100%', fontSize: '0.85rem', padding: '8px 10px', borderColor: 'rgba(5, 150, 105, 0.35)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' },
  prefijoBadge: { backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)', borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', color: 'var(--success)', fontWeight: '700', fontSize: '0.8rem', padding: '8px 10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
};

const UnidadRow = ({ numero, detalle, eq, procesadoresDB, discosDB, onChange }) => (
  <div style={unidadesStyles.row}>
    <div style={unidadesStyles.rowHeader}>
      <span style={unidadesStyles.badge}>#{numero}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>Detalles Técnicos</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {eq.pide_nro && (
        <div style={unidadesStyles.inputGroup}>
          <label style={unidadesStyles.label}>N° Terminal</label>
          <div style={{ display: 'flex', width: '100%' }}>
            {eq.prefijo_nro && <span style={unidadesStyles.prefijoBadge}>{eq.prefijo_nro}</span>}
            <input type="text" placeholder="Ej: 01" value={detalle.nro_terminal || ''} onChange={e => onChange('nro_terminal', e.target.value)} style={{ ...unidadesStyles.input, border: '1px solid rgba(16,185,129,0.35)', borderRadius: eq.prefijo_nro ? '0 4px 4px 0' : '4px' }} />
          </div>
        </div>
      )}

      {eq.pide_componentes && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={unidadesStyles.inputGroup}>
            <label style={unidadesStyles.label}>Procesador</label>
            <select value={detalle.procesador || ''} onChange={e => onChange('procesador', e.target.value)} style={{ ...unidadesStyles.select, borderRadius: '4px', border: '1px solid rgba(16,185,129,0.35)' }}>
              <option value="">Seleccionar</option>
              {procesadoresDB.length === 0 && <option disabled>Cargá procesadores en BD</option>}
              {procesadoresDB.map(p => <option key={p.codigo} value={p.descripcion}>{p.descripcion}</option>)}
            </select>
          </div>
          <div style={unidadesStyles.inputGroup}>
            <label style={unidadesStyles.label}>Disco</label>
            <select value={detalle.disco || ''} onChange={e => onChange('disco', e.target.value)} style={{ ...unidadesStyles.select, borderRadius: '4px', border: '1px solid rgba(16,185,129,0.35)' }}>
              <option value="">Seleccionar</option>
              {discosDB.length === 0 && <option disabled>Cargá discos en BD</option>}
              {discosDB.map(d => <option key={d.codigo} value={d.descripcion}>{d.descripcion}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  </div>
);

const RelevamientoForm = ({ userEmail }) => {
  const {
    formData, idHint, handleEmpresaChange, handleIdChange,
    equipos, addEquipo, removeEquipo, handleEquipoChange,
    handleCantidadChange, handleDetalleChange,
    isSubmitting, message, showModal, setShowModal,
    handlePreview, handleConfirm, bomTemplates,
    ultimoEquipoCompleto
  } = useRelevamiento(userEmail);

  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, setShowModal]);

  const [productosDB, setProductosDB] = useState({});
  const [familias, setFamilias] = useState([]);

  const [procesadoresDB, setProcesadoresDB] = useState([]);
  const [discosDB, setDiscosDB] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase.from('insumos').select('*').order('descripcion', { ascending: true });
        if (error) throw error;

        const productosAgrupados = {};
        const familiasUnicas = new Set();
        const procs = [];
        const discs = [];

        data.forEach(prod => {
          const fam = prod.categoria || 'SIN CATEGORÍA';
          if (!productosAgrupados[fam]) productosAgrupados[fam] = [];
          productosAgrupados[fam].push({ ...prod, familia: fam });
          if (fam) familiasUnicas.add(fam);

          const catUpper = fam.toUpperCase();
          const marcaUpper = (prod.marca || '').toUpperCase();

          if (catUpper.includes('PROCESADOR') || marcaUpper.includes('PROCESADOR')) procs.push(prod);
          if (catUpper.includes('DISCO') || marcaUpper.includes('DISCO') || marcaUpper.includes('SSD') || marcaUpper.includes('HDD')) discs.push(prod);
        });

        setProductosDB(productosAgrupados);
        setFamilias(Array.from(familiasUnicas).sort());
        setProcesadoresDB(procs);
        setDiscosDB(discs);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setCargandoProductos(false);
      }
    };
    fetchProductos();
  }, []);

  const idClassName = idHint.found === true ? 'found' : idHint.found === false ? 'not-found' : '';

  // Calcula el total de unidades incluyendo hijos BOM
  const totalUnidades = equipos.reduce((sum, eq) => {
    const bomKey = getBomKey(eq.familia);
    const hijosCount = (bomKey && bomTemplates[bomKey]) ? bomTemplates[bomKey].length : 0;
    const unidadesPorEquipo = 1 + hijosCount; // padre + hijos
    return sum + ((eq.detalles?.length || 1) * unidadesPorEquipo);
  }, 0);

  return (
    <div className="card" style={{ borderTop: '4px solid var(--success)', position: 'relative' }}>

      {/* MODAL DE PREVIEW */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '15px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', padding: '25px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '620px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-md)', fontFamily: "'Courier New', Courier, monospace", maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >

            {/* ÁREA SCROLLEABLE */}
            <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
              <div style={{ borderBottom: '2px dashed var(--border-md)', paddingBottom: '15px', marginBottom: '20px', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 'bold' }}>REMITO DE RELEVAMIENTO</h2>
                <p style={{ margin: '4px 0', fontSize: '0.95rem' }}><strong>FECHA:</strong> {new Date().toLocaleDateString()}</p>
                <p style={{ margin: '4px 0', fontSize: '0.95rem' }}><strong>RELEVADOR:</strong> {userEmail}</p>
              </div>
              <div style={{ marginBottom: '20px', backgroundColor: 'var(--bg-input)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-md)' }}>
                <p style={{ margin: '4px 0', fontSize: '1rem' }}><strong>EMPRESA:</strong> {formData.empresa.toUpperCase()}</p>
                <p style={{ margin: '4px 0', fontSize: '1rem' }}><strong>AGENCIA ID:</strong> {formData.id}</p>
                <p style={{ margin: '4px 0', fontSize: '1rem' }}><strong>NOMBRE:</strong> {formData.nombre.toUpperCase()}</p>
              </div>

              <h3 style={{ fontSize: '1.1rem', borderBottom: '2px solid var(--border-md)', paddingBottom: '8px', marginBottom: '15px', color: 'var(--text-muted)' }}>DETALLE PARA INVENTARIO</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-input)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 8px', borderBottom: '2px solid var(--border-md)', width: '12%' }}>CANT.</th>
                    <th style={{ padding: '10px 8px', borderBottom: '2px solid var(--border-md)', width: '33%' }}>CATEGORÍA</th>
                    <th style={{ padding: '10px 8px', borderBottom: '2px solid var(--border-md)', width: '55%' }}>PRODUCTO Y ESPECIFICACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((eq, eqIdx) => {
                    const desc = eq.codigo === 'OTR-999' ? eq.descripcion_manual : `${eq.marca || ''} ${eq.nombre_producto || ''}`.trim();
                    const bomKey = getBomKey(eq.familia);
                    const hijosTemplate = (bomKey && bomTemplates[bomKey]) ? bomTemplates[bomKey] : [];

                    return (eq.detalles || [{}]).map((det, detIdx) => {
                      const extras = [];
                      if (eq.pide_nro && det.nro_terminal) extras.push(`Term: ${eq.prefijo_nro || ''}${det.nro_terminal}`);
                      if (eq.pide_componentes && det.procesador) extras.push(`CPU: ${det.procesador}`);
                      if (eq.pide_componentes && det.disco) extras.push(`Disco: ${det.disco}`);

                      return (
                        <React.Fragment key={`${eqIdx}-${detIdx}`}>
                          {/* FILA DEL EQUIPO PADRE */}
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', color: 'var(--success)' }}>1</td>
                            <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: '600' }}>{eq.familia.toUpperCase()}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ fontWeight: 'bold' }}>{desc.toUpperCase()}</span>
                              {extras.length > 0 && <div style={{ fontSize: '0.78rem', color: 'var(--text-hint)', marginTop: '2px' }}>({extras.join(' | ')})</div>}
                            </td>
                          </tr>

                          {/* FILAS AUTO-BOM: Todos los hijos del template */}
                          {hijosTemplate.map((hijo, hijoIdx) => (
                            <tr key={`${eqIdx}-${detIdx}-bom-${hijoIdx}`} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--success-bg)' }}>
                              <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', color: 'var(--success)' }}>1</td>
                              <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: '600' }}>{hijo.categoria}</td>
                              <td style={{ padding: '10px 8px' }}>
                                <span style={{ fontWeight: 'bold' }}>{hijo.producto.toUpperCase()}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '2px', fontWeight: 'bold' }}>
                                  (Auto-BOM de {eq.familia.toUpperCase()} {det.nro_terminal ? `T${det.nro_terminal}` : `#${detIdx + 1}`})
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    });
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)', textAlign: 'right', fontSize: '0.9rem' }}>
                <strong>SE REGISTRARÁN {totalUnidades} UNIDADES INDIVIDUALES</strong>
              </div>
            </div>

            {/* BOTONES FIJOS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-md)', background: 'var(--bg-input)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> Editar</button>
              <button type="button" onClick={handleConfirm} disabled={isSubmitting} style={{ padding: '10px 15px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success)', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>{isSubmitting ? 'Guardando...' : <><Check size={18} /> Confirmar Guardado</>}</button>
            </div>

          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ClipboardList size={24} color="var(--success)" />
        <h1 style={{ margin: 0 }}>Relevamiento de Agencia</h1>
      </div>

      <div className="card-body">

        <div className="field">
          <label>Empresa</label>
          <select className={`empresa-select ${formData.empresa.toLowerCase()}`} value={formData.empresa} onChange={handleEmpresaChange}>
            <option value="">— Seleccionar —</option>
            <option value="Palpitos">Palpitos</option>
            <option value="Alfa">Alfa</option>
            <option value="TucuApuestas">TucuApuestas</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div className="row">
          <div className="field">
            <label>ID Agencia</label>
            <input type="text" className={idClassName} placeholder={!formData.empresa ? 'Seleccioná la empresa primero...' : 'Ej: 1207'} value={formData.id} onChange={handleIdChange} autoComplete="off" disabled={!formData.empresa} style={{ backgroundColor: !formData.empresa ? 'var(--bg-input)' : 'transparent', cursor: !formData.empresa ? 'not-allowed' : 'text' }} />
            <div className={`id-hint ${idHint.type}`}>{idHint.text}</div>
          </div>
          <div className="field">
            <label>Nombre de Agencia</label>
            <input type="text" value={formData.nombre} readOnly style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <hr className="divider" />

        <button
          type="button"
          onClick={addEquipo}
          className="btn-add-mat"
          disabled={cargandoProductos || !ultimoEquipoCompleto}
          style={{
            borderStyle: 'dashed',
            border: '1px dashed var(--success)',
            color: (cargandoProductos || !ultimoEquipoCompleto) ? 'var(--text-hint)' : 'var(--success)',
            marginBottom: '20px',
            opacity: (cargandoProductos || !ultimoEquipoCompleto) ? 0.6 : 1,
            cursor: (cargandoProductos || !ultimoEquipoCompleto) ? 'not-allowed' : 'pointer'
          }}
        >
          {cargandoProductos ? 'Cargando catálogo...' : !ultimoEquipoCompleto ? 'Completá la carga del equipo anterior' : <><Plus size={18} /> Agregar Equipo al Relevamiento</>}
        </button>

        {equipos.length === 0 && !cargandoProductos && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aún no hay equipos. Usá el botón de arriba para comenzar.</div>
        )}

        <div>
          {equipos.map((eq, index) => {
            const bomKey = getBomKey(eq.familia);
            const hijosCount = (bomKey && bomTemplates[bomKey]) ? bomTemplates[bomKey].length : 0;

            return (
              <div key={index} className="material-row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div className="material-row-flex" style={{ width: '100%' }}>
                  <select value={eq.familia} onChange={e => { handleEquipoChange(index, 'familia', e.target.value); handleEquipoChange(index, 'codigo', ''); }} style={{ flex: 1 }}>
                    <option value="">Categoría</option>
                    {familias.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <select value={eq.codigo} disabled={!eq.familia} onChange={e => {
                    const prod = productosDB[eq.familia]?.find(x => x.codigo === e.target.value);
                    handleEquipoChange(index, 'codigo', e.target.value);
                    handleEquipoChange(index, 'nombre_producto', prod?.descripcion || '');
                    handleEquipoChange(index, 'marca', prod?.marca || '');

                    // Banderas (pide_serie lo seteamos en false a la fuerza para que no se use)
                    handleEquipoChange(index, 'pide_serie', false);
                    handleEquipoChange(index, 'prefijo_serie', '');
                    handleEquipoChange(index, 'pide_nro', prod?.pide_nro || false);
                    handleEquipoChange(index, 'prefijo_nro', prod?.prefijo_nro || '');
                    handleEquipoChange(index, 'pide_componentes', prod?.pide_componentes || false);

                  }} style={{ flex: 1 }}>
                    <option value="">Producto</option>
                    {eq.familia && productosDB[eq.familia]?.map(p => (
                      <option key={p.codigo} value={p.codigo}>{p.marca} {p.descripcion}</option>
                    ))}
                  </select>
                </div>

                {eq.codigo === 'OTR-999' && (
                  <div style={{ marginTop: '10px', width: '100%' }}>
                    <input type="text" placeholder="Escribí qué equipo es (ej: Impresora Fiscal HP)" value={eq.descripcion_manual || ''} onChange={e => handleEquipoChange(index, 'descripcion_manual', e.target.value)} style={{ width: '100%', borderColor: 'var(--success)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', justifyContent: 'flex-end' }}>
                  {eq.codigo && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Cantidad:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button type="button" disabled={eq.cantidad <= 1} onClick={() => handleCantidadChange(index, eq.cantidad - 1)} style={{ background: eq.cantidad <= 1 ? 'transparent' : 'var(--bg-card)', border: '1px solid var(--border-md)', color: eq.cantidad <= 1 ? 'var(--text-hint)' : 'var(--text-main)', borderRadius: 'var(--radius-sm)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: eq.cantidad <= 1 ? 'not-allowed' : 'pointer', transition: 'all var(--transition)' }}><Minus size={14} strokeWidth={3} /></button>
                        <span style={{ fontWeight: 'bold', minWidth: '24px', textAlign: 'center', color: 'var(--text-main)' }}>{eq.cantidad}</span>
                        <button type="button" onClick={() => handleCantidadChange(index, eq.cantidad + 1)} style={{ background: 'var(--success)', border: 'none', color: '#ffffff', borderRadius: 'var(--radius-sm)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all var(--transition)' }}><Plus size={14} strokeWidth={3} /></button>
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => removeEquipo(index)} className="btn-remove" title="Eliminar equipo" style={{ minHeight: '40px', minWidth: '40px' }}><Trash2 size={16} /></button>
                </div>



                {eq.codigo && (eq.pide_nro || eq.pide_componentes) && eq.detalles?.length > 0 && (
                  <div style={unidadesStyles.wrapper}>
                    <div style={unidadesStyles.header}>Detalle por unidad ({eq.detalles.length})</div>
                    {eq.detalles.map((det, detIdx) => (
                      <UnidadRow
                        key={detIdx}
                        numero={detIdx + 1}
                        detalle={det}
                        eq={eq}
                        procesadoresDB={procesadoresDB}
                        discosDB={discosDB}
                        onChange={(field, value) => handleDetalleChange(index, detIdx, field, value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" className="btn-submit" onClick={handlePreview} disabled={isSubmitting || cargandoProductos} style={{ marginTop: '20px', backgroundColor: 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <Eye size={20} /> Visualizar y Confirmar
        </button>

        {message.text && <div className={`msg ${message.type}`}>{message.text}</div>}
      </div>
    </div>
  );
};

export default RelevamientoForm;