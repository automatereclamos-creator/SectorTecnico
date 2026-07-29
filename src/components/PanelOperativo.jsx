import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { usePanelOperativo } from '../hooks/usePanelOperativo';
import Soluciones from './Soluciones';
import RelevamientoViewerPanel from './RelevamientoViewerPanel';
import Inicio from './Inicio';
import InventarioPanel from './InventarioPanel';
import UsuariosManager from './UsuariosManager';
import AgenciasManager from './AgenciasManager';
import ReclamosManager from './ReclamosManager';
import TareasManager from './TareasManager';
import InsumosManager from './InsumosManager';
import ErrorBoundary from './ErrorBoundary';
import { FullLogo } from './Logo';

const PanelOperativo = ({ rol, nombreUsuario, onBackToMenu, onLogout, theme, setTheme }) => {
  const {
    USER_DATA,
    accesoPermitido,
    moduloActivo,
    setModuloActivo,
    seccionesMenu,
    moduloActualInfo
  } = usePanelOperativo(rol, nombreUsuario);

  // Lazy mount tracking for PanelOperativo modules
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modulosVisitados, setModulosVisitados] = useState(() => {
    const active = localStorage.getItem('panelModuloActivo') || 'inicio';
    return new Set([active]);
  });

  useEffect(() => {
    if (moduloActivo) {
      setModulosVisitados(prev => {
        if (prev.has(moduloActivo)) return prev;
        return new Set(prev).add(moduloActivo);
      });
    }
  }, [moduloActivo]);

  if (!accesoPermitido) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'system-ui, sans-serif' }}>
        <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>Acceso Restringido</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center' }}>
          Lo sentimos {USER_DATA.nombre}, tu rol ({USER_DATA.rol}) no tiene permisos para acceder al Panel Operativo.
        </p>
      </div>
    );
  }

  return (
    <div className="crm-layout">

      {/* OVERLAY MOBILE */}
      <div
        className={`crm-overlay ${mobileMenuOpen ? 'crm-overlay--visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* SIDEBAR IZQUIERDO */}
      <aside className={`crm-sidebar ${mobileMenuOpen ? 'crm-sidebar--open' : ''}`}>
        <div className="crm-sidebar-header">
          <FullLogo size={28} />
        </div>

        <nav className="crm-sidebar-nav">
          {Object.entries(seccionesMenu).map(([nombreSeccion, items]) => (
            <div key={nombreSeccion}>
              <h3 className="crm-nav-section-title">
                {nombreSeccion}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = moduloActivo === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => { setModuloActivo(item.id); setMobileMenuOpen(false); }}
                      className={`crm-nav-btn ${isActive ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span style={{
                          backgroundColor: isActive ? 'var(--accent-blue)' : 'var(--bg-input)',
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="crm-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="crm-avatar">
              {USER_DATA.iniciales}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{USER_DATA.nombre}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-hint)', textTransform: 'capitalize' }}>{USER_DATA.rol}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text-muted)',
                padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? <Sun size={14} color="var(--warning)" /> : <Moon size={14} color="var(--accent-blue)" />}
            </button>
            <button
              onClick={onBackToMenu}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'var(--bg-input)', border: '1px solid var(--border-md)', color: 'var(--text-main)',
                padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-md)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            >
              <ArrowLeft size={14} />
              Menú
            </button>
            <button
              onClick={onLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444',
                padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="crm-main">

        <header className="crm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="crm-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <div className="crm-header-breadcrumbs">
              <span>Panel</span>
              <span style={{ fontSize: '0.8rem' }}>❯</span>
              <span className="active">{moduloActualInfo.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          </div>
        </header>

        <div className="crm-content-container">
          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'inicio' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('inicio') && (
              <ErrorBoundary variant="inline">
                <Inicio
                  setModuloActivo={setModuloActivo}
                  userData={USER_DATA}
                />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'reclamos' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('reclamos') && (
              <ErrorBoundary variant="inline">
                <ReclamosManager />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'tareas' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('tareas') && (
              <ErrorBoundary variant="inline">
                <TareasManager />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'soluciones' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('soluciones') && (
              <ErrorBoundary variant="inline">
                <Soluciones />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'usuarios' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('usuarios') && (
              <ErrorBoundary variant="inline">
                <UsuariosManager />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'agencias' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('agencias') && (
              <ErrorBoundary variant="inline">
                <AgenciasManager />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'relevamientos' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            <div style={{ height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              {modulosVisitados.has('relevamientos') && (
                <ErrorBoundary variant="inline">
                  <RelevamientoViewerPanel rol={rol} />
                </ErrorBoundary>
              )}
            </div>
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'inventario' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('inventario') && (
              <ErrorBoundary variant="inline">
                <InventarioPanel />
              </ErrorBoundary>
            )}
          </div>

          <div className="custom-scrollbar crm-module-padding" style={{ display: moduloActivo === 'insumos' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
            {modulosVisitados.has('insumos') && (
              <ErrorBoundary variant="inline">
                <InsumosManager />
              </ErrorBoundary>
            )}
          </div>


        </div>

      </main>
    </div>
  );
};

export default PanelOperativo;