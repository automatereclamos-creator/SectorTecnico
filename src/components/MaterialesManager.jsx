import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Plus, Minus, Trash2, Cpu, Monitor, Printer, 
  HardDrive, Search, X, Check, AlertCircle, HelpCircle 
} from 'lucide-react';
import { supabase } from '../config/supabase';

// Helper para obtener icono correspondiente a la categoría del hardware
const getEquipoIcon = (categoria = '') => {
  const cat = categoria.toUpperCase();
  if (cat.includes('PC') || cat.includes('CPU') || cat.includes('AIO') || cat.includes('ALL IN ONE') || cat.includes('SERVER')) {
    return Cpu;
  }
  if (cat.includes('MONITOR') || cat.includes('PANTALLA') || cat.includes('TV') || cat.includes('DISPLAY')) {
    return Monitor;
  }
  if (cat.includes('PRINTER') || cat.includes('IMPRESORA') || cat.includes('TERMICA') || cat.includes('TÉRMICA')) {
    return Printer;
  }
  if (
    cat.includes('DISCO') || cat.includes('SSD') || cat.includes('HDD') || 
    cat.includes('RAM') || cat.includes('MEMORIA') || cat.includes('MOTHER') || 
    cat.includes('PROCESADOR') || cat.includes('FUENTE') || cat.includes('PLACA')
  ) {
    return HardDrive;
  }
  return Cpu; // Default icon
};

// Helper para estilos estéticos de las etiquetas según categoría
const getCategoryBadgeStyle = (categoria = '') => {
  const cat = categoria.toUpperCase();
  if (cat.includes('PC') || cat.includes('CPU') || cat.includes('AIO')) {
    return { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', text: 'PC / Terminal' };
  }
  if (cat.includes('MONITOR') || cat.includes('PANTALLA') || cat.includes('TV')) {
    return { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', text: 'Pantalla' };
  }
  if (cat.includes('PRINTER') || cat.includes('IMPRESORA')) {
    return { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', text: 'Impresora' };
  }
  if (
    cat.includes('DISCO') || cat.includes('SSD') || cat.includes('HDD') || 
    cat.includes('RAM') || cat.includes('MEMORIA') || cat.includes('MOTHER') || 
    cat.includes('PROCESADOR')
  ) {
    return { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', text: 'Componente' };
  }
  return { bg: 'rgba(107, 114, 128, 0.1)', color: '#9ca3af', text: categoria || 'Otro' };
};

const MaterialesManager = ({ materiales, addMaterial, removeMaterial, handleMaterialChange, equiposAgencia = [] }) => {
  const [PRODUCTOS, setProductos] = useState({});
  const [FAMILIAS, setFamilias] = useState([]);

  // Listas dinámicas desde la Base de Datos
  const [procesadoresDB, setProcesadoresDB] = useState([]);
  const [discosDB, setDiscosDB] = useState([]);

  // Estados del selector modal interactivo
  const [selectorOpenIndex, setSelectorOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODOS');

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const { data } = await supabase.from('insumos').select('*').order('descripcion', { ascending: true });
        if (data) {
          const agrupados = {};
          const famSet = new Set();

          const procs = [];
          const discs = [];

          data.forEach(item => {
            const cat = item.categoria || 'SIN CATEGORÍA';
            if (!agrupados[cat]) agrupados[cat] = [];
            agrupados[cat].push(item);
            famSet.add(cat);

            const catUpper = cat.toUpperCase();
            const marcaUpper = (item.marca || '').toUpperCase();

            if (catUpper.includes('PROCESADOR') || marcaUpper.includes('PROCESADOR')) {
              procs.push(item);
            }
            if (catUpper.includes('DISCO') || marcaUpper.includes('DISCO') || marcaUpper.includes('SSD') || marcaUpper.includes('HDD')) {
              discs.push(item);
            }
          });

          setProductos(agrupados);
          setFamilias(Array.from(famSet).sort());
          setProcesadoresDB(procs);
          setDiscosDB(discs);
        }
      } catch (err) { console.error('Error cargando insumos:', err); }
    };
    fetchInsumos();
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Inyección de keyframes para animaciones fluidas */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Botones de acción principales */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button type="button" onClick={() => addMaterial('AGREGAR')} style={{ flex: 1, padding: '10px', background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all var(--transition)' }}>
          <Plus size={16} /> Agregar
        </button>
        <button type="button" onClick={() => addMaterial('CAMBIAR')} style={{ flex: 1, padding: '10px', background: 'var(--accent-indigo-bg)', border: '1px solid var(--accent-indigo)', color: 'var(--accent-indigo)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all var(--transition)' }}>
          <ArrowRightLeft size={16} /> Cambiar
        </button>
        <button type="button" onClick={() => addMaterial('QUITAR')} style={{ flex: 1, padding: '10px', background: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all var(--transition)' }}>
          <Minus size={16} /> Quitar
        </button>
      </div>

      {/* Lista de operaciones de materiales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {materiales.map((mat, index) => {
          const isOut = mat.tipo === 'QUITAR' || mat.tipo === 'CAMBIAR';
          const isIn = mat.tipo === 'AGREGAR' || mat.tipo === 'CAMBIAR';

          return (
            <div key={index} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', padding: '15px', boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.2s ease-out' }}>
              
              {/* Encabezado de la Tarjeta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  OPERACIÓN: 
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    backgroundColor: mat.tipo === 'AGREGAR' ? 'var(--success-bg)' : mat.tipo === 'QUITAR' ? 'var(--error-bg)' : 'var(--accent-indigo-bg)',
                    color: mat.tipo === 'AGREGAR' ? 'var(--success)' : mat.tipo === 'QUITAR' ? 'var(--error)' : 'var(--accent-indigo)',
                    border: '1px solid ' + (mat.tipo === 'AGREGAR' ? 'rgba(5, 150, 105, 0.2)' : mat.tipo === 'QUITAR' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(2, 132, 199, 0.2)')
                  }}>
                    {mat.tipo}
                  </span>
                </span>
                <button 
                  type="button" 
                  onClick={() => removeMaterial(index)} 
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* BLOQUE SALIENTE (EQUIPO A RETIRAR) */}
              {isOut && (() => {
                const selectedEq = equiposAgencia.find(eq => eq.id === mat.out_equipo_id);

                return (
                  <div style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.02)', 
                    padding: '15px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid rgba(220, 38, 38, 0.15)', 
                    marginBottom: isIn ? '12px' : '0' 
                  }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--error)', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Equipo a retirar
                    </label>

                    {/* Si no hay equipo seleccionado, mostramos un botón dashed premium */}
                    {!mat.out_equipo_id ? (
                      <div 
                        onClick={() => { setSelectorOpenIndex(index); setSearchQuery(''); setActiveCategory('TODOS'); }}
                        style={{
                          border: '2px dashed rgba(220, 38, 38, 0.3)',
                          backgroundColor: 'rgba(220, 38, 38, 0.03)',
                          borderRadius: '8px',
                          padding: '24px 16px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.06)';
                          e.currentTarget.style.borderColor = 'var(--error)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                        }}
                      >
                        <Search size={22} style={{ color: 'var(--error)', opacity: 0.8 }} />
                        <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          Buscar equipo instalado en la agencia
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Click aquí para abrir la lista interactiva
                        </span>
                      </div>
                    ) : (
                      /* Si hay equipo seleccionado, mostramos la tarjeta premium del equipo */
                      selectedEq && (() => {
                        const badge = getCategoryBadgeStyle(selectedEq.categoria);
                        const EqIcon = getEquipoIcon(selectedEq.categoria);
                        
                        return (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            backgroundColor: 'var(--bg-input, #0F172A)', 
                            border: '1px solid rgba(220, 38, 38, 0.4)', 
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)',
                            borderRadius: '8px', 
                            padding: '12px 14px',
                            animation: 'fadeIn 0.2s ease'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                              {/* Círculo del Icono */}
                              <div style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                                borderRadius: '50%',
                                minWidth: '38px',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <EqIcon size={18} color="var(--error)" />
                              </div>

                              <div style={{ overflow: 'hidden' }}>
                                {/* Badges */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: '700',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    backgroundColor: badge.bg,
                                    color: badge.color
                                  }}>
                                    {badge.text}
                                  </span>
                                  {selectedEq.especificaciones?.nro_terminal && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#38bdf8' }}>
                                      T{selectedEq.especificaciones.nro_terminal}
                                    </span>
                                  )}
                                </div>

                                {/* Descripción Principal */}
                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {selectedEq.marca} {selectedEq.producto}
                                </div>

                                {/* Número de Serie */}
                                {selectedEq.serie_fabricante && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {selectedEq.equipo_padre_id ? 'Nro de Terminal' : 'S/N'}: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedEq.serie_fabricante}</strong>
                                  </div>
                                )}

                                {/* Datos de Jerarquía si es un componente */}
                                {selectedEq.equipo_padre_id && (() => {
                                  const padre = equiposAgencia.find(p => p.id === selectedEq.equipo_padre_id);
                                  return padre ? (
                                    <div style={{ fontSize: '0.7rem', color: '#a78bfa', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <span>└─ De:</span> <strong>{padre.producto}</strong>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            </div>

                            {/* Botón para cambiar selección */}
                            <button 
                              type="button" 
                              onClick={() => { setSelectorOpenIndex(index); setSearchQuery(''); setActiveCategory('TODOS'); }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-md)',
                                color: 'var(--text-muted)',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                marginLeft: '8px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'var(--text-main)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderColor = 'var(--border-md)';
                              }}
                            >
                              Cambiar
                            </button>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })()}

              {/* BLOQUE ENTRANTE (EQUIPO A INSTALAR) */}
              {isIn && (
                <div style={{ backgroundColor: 'var(--success-bg)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5, 150, 105, 0.15)' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Equipo a instalar
                  </label>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {/* Selector de Categoría */}
                    <select 
                      value={mat.in_familia} 
                      onChange={e => { handleMaterialChange(index, 'in_familia', e.target.value); handleMaterialChange(index, 'in_codigo', ''); }} 
                      style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', transition: 'border-color var(--transition)' }}
                    >
                      <option value="">Categoría</option>
                      {FAMILIAS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    {/* Selector de Producto */}
                    <select 
                      value={mat.in_codigo} 
                      disabled={!mat.in_familia} 
                      onChange={e => {
                        const prod = PRODUCTOS[mat.in_familia]?.find(x => x.codigo === e.target.value);
                        handleMaterialChange(index, 'in_codigo', e.target.value);
                        handleMaterialChange(index, 'in_nombre', prod?.descripcion || '');
                        handleMaterialChange(index, 'in_marca', prod?.marca || '');

                        handleMaterialChange(index, 'pide_serie', prod?.pide_serie || false);
                        handleMaterialChange(index, 'prefijo_serie', prod?.prefijo_serie || '');
                        handleMaterialChange(index, 'pide_nro', prod?.pide_nro || false);
                        handleMaterialChange(index, 'prefijo_nro', prod?.prefijo_nro || '');
                        handleMaterialChange(index, 'pide_componentes', prod?.pide_componentes || false);
                      }} 
                      style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', transition: 'border-color var(--transition)' }}
                    >
                      <option value="">Producto</option>
                      {mat.in_familia && PRODUCTOS[mat.in_familia]?.map(p => <option key={p.codigo} value={p.codigo}>{p.marca} {p.descripcion}</option>)}
                    </select>
                  </div>

                  {/* Input de Número de Serie */}
                  {mat.pide_serie && (
                    <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
                      {mat.prefijo_serie && (
                        <span style={{ padding: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {mat.prefijo_serie}
                        </span>
                      )}
                      <input 
                        type="text" 
                        placeholder={mat.prefijo_serie ? "Últimos dígitos" : "N° de Serie Completo"} 
                        value={mat.in_serie || ''} 
                        onChange={(e) => handleMaterialChange(index, 'in_serie', e.target.value)} 
                        style={{ flex: 1, padding: '10px', borderRadius: mat.prefijo_serie ? '0 6px 6px 0' : '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', transition: 'border-color var(--transition)' }} 
                      />
                    </div>
                  )}

                  {/* Input de Número de Terminal */}
                  {mat.pide_nro && (
                    <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
                      {mat.prefijo_nro && (
                        <span style={{ padding: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {mat.prefijo_nro}
                        </span>
                      )}
                      <input 
                        type="text" 
                        placeholder="Número de Terminal (Ej: 01)" 
                        value={mat.in_nro_terminal || ''} 
                        onChange={(e) => handleMaterialChange(index, 'in_nro_terminal', e.target.value)} 
                        style={{ flex: 1, padding: '10px', borderRadius: mat.prefijo_nro ? '0 6px 6px 0' : '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', transition: 'border-color var(--transition)' }} 
                      />
                    </div>
                  )}

                  {/* Componentes Internos Dinámicos (Procesador / Disco) */}
                  {mat.pide_componentes && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <select 
                        value={mat.in_procesador || ''} 
                        onChange={e => handleMaterialChange(index, 'in_procesador', e.target.value)} 
                        style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', transition: 'border-color var(--transition)' }}
                      >
                        <option value="">Procesador</option>
                        {procesadoresDB.length === 0 && <option disabled>Cargá procesadores en la BD</option>}
                        {procesadoresDB.map(p => <option key={p.codigo} value={p.descripcion}>{p.descripcion}</option>)}
                      </select>

                      <select 
                        value={mat.in_disco || ''} 
                        onChange={e => handleMaterialChange(index, 'in_disco', e.target.value)} 
                        style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-md)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', transition: 'border-color var(--transition)' }}
                      >
                        <option value="">Disco</option>
                        {discosDB.length === 0 && <option disabled>Cargá discos en la BD</option>}
                        {discosDB.map(d => <option key={d.codigo} value={d.descripcion}>{d.descripcion}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MODAL DRAWER INTERACTIVO: SELECTOR PREMIUM DE HARDWARE 
         ======================================================== */}
      {selectorOpenIndex !== null && (() => {
        const currentMatIndex = selectorOpenIndex;
        const currentMat = materiales[currentMatIndex];
        
        // Filtramos para ocultar equipos que ya hayan sido elegidos en OTRAS tarjetas
        const equiposYaSeleccionados = materiales
          .filter((_, i) => i !== currentMatIndex)
          .map(m => m.out_equipo_id)
          .filter(Boolean);
        
        const equiposDisponibles = equiposAgencia.filter(eq => !equiposYaSeleccionados.includes(eq.id));

        // Separar equipos principales de componentes
        const equiposPadre = equiposDisponibles.filter(eq => !eq.equipo_padre_id);
        const componentesHijos = equiposDisponibles.filter(eq => !!eq.equipo_padre_id);

        // Filtrado en vivo según barra de búsqueda y categoría activa
        const applyFilters = (lista) => {
          return lista.filter(eq => {
            const searchString = `${eq.categoria} ${eq.marca || ''} ${eq.producto} ${eq.serie_fabricante || ''} ${eq.especificaciones?.nro_terminal ? 'T' + eq.especificaciones.nro_terminal : ''}`.toUpperCase();
            const queryMatch = searchString.includes(searchQuery.toUpperCase());

            if (activeCategory === 'TODOS') return queryMatch;
            
            const cat = eq.categoria.toUpperCase();
            if (activeCategory === 'PC') {
              return queryMatch && (cat.includes('PC') || cat.includes('CPU') || cat.includes('AIO') || cat.includes('ALL IN ONE') || cat.includes('SERVER'));
            }
            if (activeCategory === 'MONITOR') {
              return queryMatch && (cat.includes('MONITOR') || cat.includes('PANTALLA') || cat.includes('TV'));
            }
            if (activeCategory === 'PRINTER') {
              return queryMatch && (cat.includes('PRINTER') || cat.includes('IMPRESORA') || cat.includes('TERMICA') || cat.includes('TÉRMICA'));
            }
            if (activeCategory === 'COMPONENTE') {
              return queryMatch && (cat.includes('DISCO') || cat.includes('SSD') || cat.includes('HDD') || cat.includes('RAM') || cat.includes('MEMORIA') || cat.includes('MOTHER') || cat.includes('PROCESADOR'));
            }
            if (activeCategory === 'OTRO') {
              return queryMatch && !((cat.includes('PC') || cat.includes('CPU') || cat.includes('AIO') || cat.includes('SERVER') || cat.includes('MONITOR') || cat.includes('PANTALLA') || cat.includes('TV') || cat.includes('PRINTER') || cat.includes('IMPRESORA') || cat.includes('DISCO') || cat.includes('SSD') || cat.includes('HDD') || cat.includes('RAM') || cat.includes('MEMORIA') || cat.includes('MOTHER') || cat.includes('PROCESADOR')));
            }
            
            return queryMatch;
          });
        };

        const padresFiltrados = applyFilters(equiposPadre);
        const hijosFiltrados = applyFilters(componentesHijos);
        const totalResultados = padresFiltrados.length + hijosFiltrados.length;

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-card, #1F2937)',
              border: '1px solid var(--border-md, rgba(243,244,246,0.12))',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              
              {/* Cabecera del Modal */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border, rgba(243,244,246,0.06))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <Search size={18} style={{ color: 'var(--error)' }} />
                    Seleccionar Equipo Instalado
                  </h3>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Seleccioná qué hardware activo de la agencia se va a retirar.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectorOpenIndex(null)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Filtros e Inputs */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, rgba(243,244,246,0.04))', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Caja de Búsqueda */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Filtrar por marca, modelo, N° de serie o terminal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-md)',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.85rem',
                      transition: 'border-color 0.2s'
                    }}
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Categorías Rápidas en Píldoras */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                  {[
                    { id: 'TODOS', label: 'Todos' },
                    { id: 'PC', label: 'PCs / AIO' },
                    { id: 'MONITOR', label: 'Pantallas' },
                    { id: 'PRINTER', label: 'Impresoras' },
                    { id: 'COMPONENTE', label: 'Componentes' },
                    { id: 'OTRO', label: 'Red / Otros' }
                  ].map(cat => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '16px',
                          border: '1px solid ' + (active ? 'var(--error)' : 'var(--border-md)'),
                          backgroundColor: active ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                          color: active ? '#ef4444' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista Contenedora de Equipos */}
              <div 
                className="custom-scrollbar"
                style={{
                  padding: '16px 20px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              >
                {equiposAgencia.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={28} style={{ color: 'var(--text-hint)', marginBottom: '8px', display: 'inline-block' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>La agencia no tiene equipos instalados</div>
                    <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>No hay hardware activo registrado para esta agencia en la base de datos.</div>
                  </div>
                ) : totalResultados === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                    <HelpCircle size={28} style={{ color: 'var(--text-hint)', marginBottom: '8px', display: 'inline-block' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>No se encontraron coincidencias</div>
                    <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>Intentá modificando los filtros o el texto de búsqueda.</div>
                  </div>
                ) : (
                  <>
                    {/* LISTA DE EQUIPOS PADRE */}
                    {padresFiltrados.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', paddingLeft: '4px' }}>
                          Equipos Principales ({padresFiltrados.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {padresFiltrados.map(eq => {
                            const isSelected = currentMat.out_equipo_id === eq.id;
                            const badge = getCategoryBadgeStyle(eq.categoria);
                            const EqIcon = getEquipoIcon(eq.categoria);

                            return (
                              <div
                                key={eq.id}
                                onClick={() => {
                                  handleMaterialChange(currentMatIndex, 'out_equipo_id', eq.id);
                                  setSelectorOpenIndex(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: '1px solid ' + (isSelected ? 'var(--error)' : 'var(--border)'),
                                  backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-card)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = 'var(--border-md)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                  {/* Icono de la Categoría */}
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <EqIcon size={16} color={isSelected ? 'var(--error)' : 'var(--text-muted)'} />
                                  </div>

                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '1px 4px', borderRadius: '3px', backgroundColor: badge.bg, color: badge.color }}>
                                        {badge.text}
                                      </span>
                                      {eq.especificaciones?.nro_terminal && (
                                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '1px 4px', borderRadius: '3px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#38bdf8' }}>
                                          T{eq.especificaciones.nro_terminal}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {eq.marca} {eq.producto}
                                    </div>
                                    {eq.serie_fabricante && (
                                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                        S/N: <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{eq.serie_fabricante}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Control tipo Radio */}
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: '2px solid ' + (isSelected ? 'var(--error)' : 'var(--border-md)'),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isSelected ? 'var(--error)' : 'transparent',
                                  flexShrink: 0
                                }}>
                                  {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* LISTA DE COMPONENTES INTERNOS */}
                    {hijosFiltrados.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', paddingLeft: '4px' }}>
                          Componentes Internos ({hijosFiltrados.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {hijosFiltrados.map(eq => {
                            const isSelected = currentMat.out_equipo_id === eq.id;
                            const badge = getCategoryBadgeStyle(eq.categoria);
                            const EqIcon = getEquipoIcon(eq.categoria);
                            const padre = equiposAgencia.find(p => p.id === eq.equipo_padre_id);

                            return (
                              <div
                                key={eq.id}
                                onClick={() => {
                                  handleMaterialChange(currentMatIndex, 'out_equipo_id', eq.id);
                                  setSelectorOpenIndex(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: '1px solid ' + (isSelected ? 'var(--error)' : 'var(--border)'),
                                  backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-card)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = 'var(--border-md)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                  {/* Icono de Componente */}
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <EqIcon size={16} color={isSelected ? 'var(--error)' : 'var(--text-muted)'} />
                                  </div>

                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '1px 4px', borderRadius: '3px', backgroundColor: badge.bg, color: badge.color }}>
                                        └─ {badge.text}
                                      </span>
                                      {padre && (
                                        <span style={{ fontSize: '0.6rem', color: '#a78bfa', fontWeight: '600' }}>
                                          de {padre.producto}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {eq.producto} {eq.marca ? `(${eq.marca})` : ''}
                                    </div>
                                    {eq.serie_fabricante && (
                                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                        Nro de Terminal: <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{eq.serie_fabricante}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Control tipo Radio */}
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: '2px solid ' + (isSelected ? 'var(--error)' : 'var(--border-md)'),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isSelected ? 'var(--error)' : 'transparent',
                                  flexShrink: 0
                                }}>
                                  {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pie de Página del Modal */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border, rgba(243,244,246,0.06))',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectorOpenIndex(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-md)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default MaterialesManager;