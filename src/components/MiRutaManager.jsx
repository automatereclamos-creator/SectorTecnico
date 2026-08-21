import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Map, ArrowUp, ArrowDown, Plus, X, Phone, User, Share2, Wrench } from 'lucide-react';
import { formatearFechaTZ } from '../utils/timezone';
import '../styles.css';

const MiRutaManager = ({ userData, onNavigate }) => {
  const [pendientes, setPendientes] = useState([]);
  const [miRuta, setMiRuta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ruta');

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [reclamos, tareas] = await Promise.all([
          storageService.getAllReclamos(),
          storageService.getAllTareas()
        ]);

        const recPendientes = reclamos.filter(r => r.estado === 'PENDIENTE').map(r => ({ ...r, tipoItem: 'reclamo' }));
        const tarPendientes = tareas.filter(t => t.estado === 'PENDIENTE').map(t => ({ ...t, tipoItem: 'tarea' }));
        
        const todosPendientes = [...recPendientes, ...tarPendientes].sort((a, b) => new Date(b.fecha_carga || b.fecha_creacion) - new Date(a.fecha_carga || a.fecha_creacion));
        
        setPendientes(todosPendientes);

        // Cargar ruta local
        const savedRoute = localStorage.getItem(`ruta_diaria_${userData.email}`);
        if (savedRoute) {
          const parsedRoute = JSON.parse(savedRoute);
          // Actualizar los datos de la ruta con los datos frescos de la BD
          const updatedRoute = parsedRoute.map(routeItem => {
            const fresh = todosPendientes.find(p => p.rowId === routeItem.rowId);
            return fresh ? fresh : routeItem; 
          }).filter(item => todosPendientes.some(p => p.rowId === item.rowId));
          
          setMiRuta(updatedRoute);
        }
      } catch (error) {
        console.error("Error cargando pendientes para ruta:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [userData.email]);

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`ruta_diaria_${userData.email}`, JSON.stringify(miRuta));
    }
  }, [miRuta, userData.email, isLoading]);

  const agregarARuta = (item) => {
    if (!miRuta.find(r => r.rowId === item.rowId)) {
      setMiRuta([...miRuta, item]);
    }
  };

  const quitarDeRuta = (rowId) => {
    setMiRuta(miRuta.filter(r => r.rowId !== rowId));
  };

  const moverArriba = (index) => {
    if (index === 0) return;
    const nuevaRuta = [...miRuta];
    const temp = nuevaRuta[index];
    nuevaRuta[index] = nuevaRuta[index - 1];
    nuevaRuta[index - 1] = temp;
    setMiRuta(nuevaRuta);
  };

  const moverAbajo = (index) => {
    if (index === miRuta.length - 1) return;
    const nuevaRuta = [...miRuta];
    const temp = nuevaRuta[index];
    nuevaRuta[index] = nuevaRuta[index + 1];
    nuevaRuta[index + 1] = temp;
    setMiRuta(nuevaRuta);
  };

  const handleSolucionar = (item) => {
    localStorage.setItem('autoSelectTask', JSON.stringify({ rowId: item.rowId, tipo: item.tipoItem }));
    if (onNavigate) {
      onNavigate('soporte');
    }
  };

  const compartirWhatsApp = () => {
    let texto = `*Mi Ruta Diaria - ${formatearFechaTZ(new Date())}*\n\n`;
    miRuta.forEach((item, index) => {
      texto += `*${index + 1}. [${item.empresa}] ID ${item.id}* - ${item.nombre}\n`;
      texto += `   Problema: ${item.informa || item.descripcion}\n\n`;
    });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // Filtrar los que ya están en la ruta
  const disponibles = pendientes.filter(p => !miRuta.find(r => r.rowId === p.rowId));

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-main)' }}>Cargando pendientes...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <style>{`
        .miruta-panel { flex: 1 1 500px; display: none; }
        .miruta-panel.active { display: block; }
        .miruta-tabs { display: flex; }
        @media (min-width: 900px) {
          .miruta-panel { display: block !important; }
          .miruta-tabs { display: none !important; }
        }
      `}</style>

      {/* TABS MÓVIL */}
      <div className="miruta-tabs" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '6px', border: '1px solid var(--border-md)', gap: '6px' }}>
        <button 
          onClick={() => setActiveTab('ruta')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'ruta' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'ruta' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Map size={18} color={activeTab === 'ruta' ? '#ec4899' : 'currentColor'} /> Mi Ruta ({miRuta.length})
        </button>
        <button 
          onClick={() => setActiveTab('disponibles')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'disponibles' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'disponibles' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
           Disponibles ({disponibles.length})
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* PANEL IZQUIERDO: MI RUTA */}
        <div className={`miruta-panel ${activeTab === 'ruta' ? 'active' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              <Map size={24} color="#ec4899" />
              Mi Ruta Diaria ({miRuta.length})
            </h2>
            {miRuta.length > 0 && (
              <button 
                onClick={compartirWhatsApp}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                <Share2 size={16} /> Compartir
              </button>
            )}
          </div>

          {miRuta.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)', borderRadius: '8px' }}>
              Aún no has agregado tareas a tu ruta. Selecciona desde la lista de disponibles.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {miRuta.map((item, index) => (
                <div key={item.rowId} style={{ display: 'flex', gap: '10px', alignItems: 'stretch', backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {/* Controles de orden */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center', borderRight: '1px solid var(--border)', paddingRight: '10px' }}>
                    <button onClick={() => moverArriba(index)} disabled={index === 0} style={{ background: 'none', border: 'none', color: index === 0 ? 'var(--border-md)' : 'var(--text-main)', cursor: index === 0 ? 'default' : 'pointer', padding: '2px' }}><ArrowUp size={22} /></button>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{index + 1}</div>
                    <button onClick={() => moverAbajo(index)} disabled={index === miRuta.length - 1} style={{ background: 'none', border: 'none', color: index === miRuta.length - 1 ? 'var(--border-md)' : 'var(--text-main)', cursor: index === miRuta.length - 1 ? 'default' : 'pointer', padding: '2px' }}><ArrowDown size={22} /></button>
                  </div>

                  {/* Info de la tarea */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          <span className={`badge ${item.empresa?.toLowerCase()}`}>{item.empresa || 'S/D'}</span>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: item.tipoItem === 'tarea' ? '#0ea5e9' : 'var(--warning)' }}>
                            {item.tipoItem === 'tarea' ? 'TAREA' : 'RECLAMO'} - ID {item.id}
                          </span>
                        </div>
                        <button onClick={() => quitarDeRuta(item.rowId)} style={{ background: 'var(--bg-input)', borderRadius: '50%', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px', flexShrink: 0 }} title="Quitar de la ruta">
                          <X size={16} />
                        </button>
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '8px', fontSize: '1rem', lineHeight: '1.3' }}>{item.nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0', lineHeight: '1.4' }}>{item.informa || item.descripcion}</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-hint)', fontSize: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {item.telefono || item.contacto || '---'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {item.carga || item.creador || 'Sistema'}</span>
                       </div>
                       <button 
                         onClick={() => handleSolucionar(item)}
                         style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                       >
                         <Wrench size={16} /> Solucionar
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: DISPONIBLES */}
        <div className={`miruta-panel ${activeTab === 'disponibles' ? 'active' : ''}`} style={{ backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '20px', border: '1px dashed var(--border-md)' }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '1.25rem' }}>Tareas Disponibles ({disponibles.length})</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '5px' }}>
            {disponibles.map(item => (
              <div key={item.rowId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                 <div style={{ flex: 1, paddingRight: '15px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={`badge ${item.empresa?.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{item.empresa || 'S/D'}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: item.tipoItem === 'tarea' ? '#0ea5e9' : 'var(--warning)' }}>
                        ID {item.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.3' }}>{item.nombre}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.informa || item.descripcion}
                    </div>
                 </div>
                 <button 
                    onClick={() => agregarARuta(item)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                    title="Agregar a mi ruta"
                  >
                    <Plus size={22} />
                 </button>
              </div>
            ))}
            {disponibles.length === 0 && (
               <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-hint)' }}>No hay más tareas pendientes disponibles.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MiRutaManager;
