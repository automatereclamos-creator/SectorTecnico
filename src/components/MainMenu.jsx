import React from 'react';
import { Wrench, ClipboardList, Database, LayoutDashboard, Car, Map } from 'lucide-react';
import { PERMISOS } from '../constants/roles';

const MainMenu = ({ rol, onNavigate }) => {
  return (
    <div className="main-menu-container">
      <div className="main-menu-header">
        <h1 className="main-menu-title">Sector Técnico</h1>
        <p className="main-menu-subtitle">Seleccioná el módulo de trabajo operativo</p>
      </div>

      <div className="main-menu-grid">
        
        {PERMISOS.panel?.includes(rol) && (
          <button 
            onClick={() => onNavigate('panel')}
            className="main-menu-card"
            style={{
              '--card-accent': '#a855f7',
              '--card-accent-hover': '#c084fc',
              '--card-glow': 'rgba(168, 85, 247, 0.15)',
              '--card-glow-hover': 'rgba(168, 85, 247, 0.25)',
              '--card-bg-icon': 'rgba(168, 85, 247, 0.08)'
            }}
          >
            <div className="main-menu-icon-wrapper">
              <LayoutDashboard size={28} strokeWidth={1.5} />
            </div>
            <div className="main-menu-content">
              <span className="main-menu-card-title">Panel Operativo</span>
              <span className="main-menu-card-description">Centro de mando, gráficos y estadísticas unificadas</span>
            </div>
          </button>
        )}

        {PERMISOS.soporte.includes(rol) && (
          <button 
            onClick={() => onNavigate('soporte')}
            className="main-menu-card"
            style={{
              '--card-accent': '#3b82f6',
              '--card-accent-hover': '#60a5fa',
              '--card-glow': 'rgba(59, 130, 246, 0.15)',
              '--card-glow-hover': 'rgba(59, 130, 246, 0.25)',
              '--card-bg-icon': 'rgba(59, 130, 246, 0.08)'
            }}
          >
            <div className="main-menu-icon-wrapper">
              <Wrench size={28} strokeWidth={1.5} />
            </div>
            <div className="main-menu-content">
              <span className="main-menu-card-title">Tareas Técnicas</span>
              <span className="main-menu-card-description">Carga y administración de soluciones técnicas en agencias</span>
            </div>
          </button>
        )}

        {PERMISOS.relevamiento.includes(rol) && (
          <button 
            onClick={() => onNavigate('relevamiento')}
            className="main-menu-card"
            style={{
              '--card-accent': '#10b981',
              '--card-accent-hover': '#34d399',
              '--card-glow': 'rgba(16, 185, 129, 0.15)',
              '--card-glow-hover': 'rgba(16, 185, 129, 0.25)',
              '--card-bg-icon': 'rgba(16, 185, 129, 0.08)'
            }}
          >
            <div className="main-menu-icon-wrapper">
              <ClipboardList size={28} strokeWidth={1.5} />
            </div>
            <div className="main-menu-content">
              <span className="main-menu-card-title">Relevamiento</span>
              <span className="main-menu-card-description">Control, relevamiento y diagnóstico de infraestructura física</span>
            </div>
          </button>
        )}

        {PERMISOS.visor.includes(rol) && (
          <button 
            onClick={() => onNavigate('visor')}
            className="main-menu-card"
            style={{
              '--card-accent': '#6366f1',
              '--card-accent-hover': '#818cf8',
              '--card-glow': 'rgba(99, 102, 241, 0.15)',
              '--card-glow-hover': 'rgba(99, 102, 241, 0.25)',
              '--card-bg-icon': 'rgba(99, 102, 241, 0.08)'
            }}
          >
            <div className="main-menu-icon-wrapper">
              <Database size={28} strokeWidth={1.5} />
            </div>
            <div className="main-menu-content">
              <span className="main-menu-card-title">Visor de Inventario</span>
              <span className="main-menu-card-description">Consultar, filtrar y exportar relevamientos de hardware y equipos</span>
            </div>
          </button>
        )}



        {PERMISOS.ruta?.includes(rol) && (
          <button 
            onClick={() => onNavigate('ruta')}
            className="main-menu-card"
            style={{
              '--card-accent': '#ec4899',
              '--card-accent-hover': '#f472b6',
              '--card-glow': 'rgba(236, 72, 153, 0.15)',
              '--card-glow-hover': 'rgba(236, 72, 153, 0.25)',
              '--card-bg-icon': 'rgba(236, 72, 153, 0.08)'
            }}
          >
            <div className="main-menu-icon-wrapper">
              <Map size={28} strokeWidth={1.5} />
            </div>
            <div className="main-menu-content">
              <span className="main-menu-card-title">Mi Ruta Diaria</span>
              <span className="main-menu-card-description">Organiza tus reclamos y tareas pendientes para el día</span>
            </div>
          </button>
        )}
        
      </div>
    </div>
  );
};

export default MainMenu;