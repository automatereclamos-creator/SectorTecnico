import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './config/supabase';

import TaskForm from './components/TaskForm';
import Login from './components/Login';
import TvDashboard from './components/TvDashboard';
import MainMenu from './components/MainMenu';
import RelevamientoForm from './components/RelevamientoForm';
import RelevamientoViewerMobile from './components/RelevamientoViewerMobile';
import AccessDenied from './components/AccessDenied';
import MaintenancePage from './components/MaintenancePage';
import PanelOperativo from './components/PanelOperativo';
import MiRutaManager from './components/MiRutaManager';
import ErrorBoundary from './components/ErrorBoundary';
import { Monitor, LogOut, ArrowLeft, Sun, Moon, WifiOff } from 'lucide-react';
import { PERMISOS } from './constants/roles';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import './styles.css';

function App() {
  const [session, setSession] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modoTV, setModoTV] = useState(false);
  const [vistaTecnico, setVistaTecnicoRaw] = useState(() => localStorage.getItem('vistaActual') || 'menu');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('crm-theme') || 'dark');
  const { isOnline } = useOnlineStatus();

  // Lazy mount: registrar qué vistas fueron visitadas para montarlas solo al primer acceso
  const [vistasVisitadas, setVistasVisitadas] = useState(() => {
    const guardada = localStorage.getItem('vistaActual');
    return new Set(guardada && guardada !== 'menu' ? [guardada] : []);
  });

  // Wrapper de setVistaTecnico que registra la vista como visitada
  const setVistaTecnico = (vista) => {
    if (vista !== 'menu') {
      setVistasVisitadas(prev => {
        if (prev.has(vista)) return prev;
        return new Set(prev).add(vista);
      });
    }
    setVistaTecnicoRaw(vista);
  };

  // Sincronizar tema con clases del body
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('crm-theme', theme);
  }, [theme]);

  // Persistir la vista activa en localStorage al cambiar de pestaña
  useEffect(() => {
    localStorage.setItem('vistaActual', vistaTecnico);
  }, [vistaTecnico]);

  // 1. Escuchador de Autenticación (Establece la sesión sincrónicamente sin llamadas de DB)
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (!session) {
          setCargando(false); // No hay sesión activa, termina la carga
        }
      })
      .catch((err) => {
        console.warn("Error al recuperar sesión inicial:", err);
        setSession(null);
        setCargando(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Estado de Autenticación:', event);
      setSession(newSession);
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUsuario(null);
        setRol(null);
        setNombreUsuario('');
        setVistasVisitadas(new Set());
        localStorage.removeItem('vistaActual');
        localStorage.removeItem('panelModuloActivo');
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargador de Perfil (Reacciona al estado de sesión de React, evitando deadlocks)
  const perfilCargadoRef = useRef(false);

  useEffect(() => {
    if (!session) {
      setUsuario(null);
      setRol(null);
      setNombreUsuario('');
      perfilCargadoRef.current = false;
      return;
    }

    setUsuario(session.user);

    // Si el perfil ya fue cargado exitosamente, no volver a consultarlo
    // (Supabase emite múltiples eventos de auth: SIGNED_IN, INITIAL_SESSION, etc.)
    if (perfilCargadoRef.current) {
      setCargando(false);
      return;
    }

    let isMounted = true;
    setCargando(true);

    async function cargarPerfil() {
      try {
        const { data: perfil, error } = await supabase
          .from('perfiles')
          .select('rol, nombre_completo, activo')
          .eq('email', session.user.email)
          .single();

        if (!isMounted) return;

        if (error) {
          if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
            console.warn("Token expirado detectado en base de datos. Forzando cierre...");
            await supabase.auth.signOut();
            return;
          }
          throw error;
        }

        if (perfil && perfil.activo) {
          setRol(perfil.rol);
          setNombreUsuario(perfil.nombre_completo);
          perfilCargadoRef.current = true;

          // Solo configurar vista inicial si NO hay una guardada previamente en localStorage
          const vistaGuardada = localStorage.getItem('vistaActual');
          if (!vistaGuardada || vistaGuardada === 'menu') {
            if (['encargado', 'admin', 'soporte'].includes(perfil.rol)) {
              setVistaTecnico('panel');
            } else if (perfil.rol === 'tecnico') {
              setVistaTecnico('soporte');
            }
          }

          // Solo aplicar tema por defecto si el usuario nunca eligió uno
          if (!localStorage.getItem('crm-theme')) {
            if (['encargado', 'admin', 'soporte'].includes(perfil.rol)) {
              setTheme('light');
            } else {
              setTheme('dark');
            }
          }
        } else {
          setRol(null);
          setNombreUsuario('');
        }
      } catch (err) {
        console.error("Error al obtener el perfil de base de datos:", err);
        if (isMounted) setRol(null);
      } finally {
        if (isMounted) setCargando(false);
      }
    }

    cargarPerfil();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleCerrarSesion = async () => await supabase.auth.signOut();
  const tienePermiso = (modulo) => PERMISOS[modulo]?.includes(rol);

  if (cargando) return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-main)', fontFamily: 'system-ui, sans-serif' }}>Cargando sistema...</div>;
  if (!usuario) return <Login />;
  if (!rol) return <AccessDenied email={usuario.email} />;
  if (rol === 'mantenimiento') return <MaintenancePage email={usuario.email} />;

  if (modoTV && (rol === 'admin' || rol === 'soporte')) {
    return <TvDashboard onVolver={() => setModoTV(false)} />;
  }

  return (
    <div>
      {/* Banner de estado offline */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100000,
          backgroundColor: '#dc2626', color: '#ffffff',
          padding: '8px 16px', textAlign: 'center',
          fontSize: '0.85rem', fontWeight: '600',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
        }}>
          <WifiOff size={16} />
          Sin conexión — Los cambios no se guardarán hasta que vuelvas a conectarte
        </div>
      )}
      {vistaTecnico !== 'panel' && (
        <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>

            {rol !== 'soporte' && vistaTecnico !== 'menu' && (
              <button onClick={() => setVistaTecnico('menu')} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                <ArrowLeft size={16} /> Menú
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{nombreUsuario}</span>
              <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', backgroundColor: rol === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(2, 132, 199, 0.15)', color: rol === 'admin' ? '#ef4444' : 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: '700', border: `1px solid ${rol === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(2, 132, 199, 0.3)'}` }}>
                {rol}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Botón de Alternancia de Tema */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', color: 'var(--text-muted)' }}
              title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--accent-blue)" />}
            </button>

            {(rol === 'admin' || rol === 'soporte') && (
              <button onClick={() => setModoTV(true)} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', cursor: 'pointer', fontWeight: '600', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Monitor size={16} /> Pizarra
              </button>
            )}
            <button onClick={() => setShowLogoutModal(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      )}

      <>
        {vistaTecnico === 'menu' && <MainMenu rol={rol} onNavigate={setVistaTecnico} />}

        {/* Lazy mount + display:none: se montan al primer acceso, nunca se desmontan */}
        <div style={{ display: vistaTecnico === 'soporte' ? 'block' : 'none' }}>
          {vistasVisitadas.has('soporte') && tienePermiso('soporte') && (
            <ErrorBoundary>
              <TaskForm userEmail={usuario.email} />
            </ErrorBoundary>
          )}
        </div>
        <div style={{ display: vistaTecnico === 'relevamiento' ? 'block' : 'none' }}>
          {vistasVisitadas.has('relevamiento') && tienePermiso('relevamiento') && (
            <ErrorBoundary>
              <RelevamientoForm userEmail={usuario.email} onBack={() => setVistaTecnico('menu')} />
            </ErrorBoundary>
          )}
        </div>
        <div style={{ display: vistaTecnico === 'visor' ? 'block' : 'none' }}>
          {vistasVisitadas.has('visor') && tienePermiso('visor') && (
            <ErrorBoundary>
              <RelevamientoViewerMobile rol={rol} />
            </ErrorBoundary>
          )}
        </div>



        <div style={{ display: vistaTecnico === 'ruta' ? 'block' : 'none', minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '20px' }}>
          {vistasVisitadas.has('ruta') && tienePermiso('ruta') && (
            <ErrorBoundary>
              <MiRutaManager userData={{ nombre: nombreUsuario, email: usuario.email }} onNavigate={setVistaTecnico} />
            </ErrorBoundary>
          )}
        </div>

        {/* PASAMOS EL NOMBRE REAL AL PANEL OPERATIVO */}
        <div style={{ display: vistaTecnico === 'panel' ? 'block' : 'none' }}>
          {vistasVisitadas.has('panel') && tienePermiso('panel') && (
            <ErrorBoundary>
              <PanelOperativo 
                rol={rol} 
                nombreUsuario={nombreUsuario} 
                onBackToMenu={() => setVistaTecnico('menu')}
                onLogout={() => setShowLogoutModal(true)}
                theme={theme}
                setTheme={setTheme}
              />
            </ErrorBoundary>
          )}
        </div>
      </>

      {showLogoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-md)', width: '100%', maxWidth: '320px', textAlign: 'center', borderTop: '4px solid #ef4444', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ marginBottom: '15px', color: '#ef4444', display: 'flex', justifyContent: 'center' }}><LogOut size={36} strokeWidth={2} /></div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontFamily: "'Lexend', system-ui, sans-serif", fontWeight: '600' }}>¿Cerrar sesión?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-md)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>Cancelar</button>
              <button onClick={() => { setShowLogoutModal(false); handleCerrarSesion(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;