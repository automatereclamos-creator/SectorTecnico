import { useState, useMemo, useEffect } from 'react';
import { LayoutGrid, Box, CheckCircle, LineChart, User, Database, MapPin, ClipboardList, Package } from 'lucide-react';

const MENU_CONFIG = [
  { id: 'inicio', label: 'Inicio', icon: LayoutGrid, seccion: 'PRINCIPAL' },
  { id: 'reclamos', label: 'Reclamos', icon: Box, seccion: 'MÓDULOS' },
  { id: 'tareas', label: 'Tareas', icon: ClipboardList, seccion: 'MÓDULOS' },
  { id: 'soluciones', label: 'Soluciones', icon: CheckCircle, seccion: 'MÓDULOS' },
  { id: 'inventario', label: 'Inventario Físico', icon: Database, seccion: 'MÓDULOS' },
  { id: 'relevamientos', label: 'Relevamientos', icon: LineChart, seccion: 'MÓDULOS' },
  { id: 'usuarios', label: 'Usuarios', icon: User, seccion: 'SISTEMA' },
  { id: 'agencias', label: 'Agencias', icon: MapPin, seccion: 'SISTEMA' },
  { id: 'insumos', label: 'Catálogo Insumos', icon: Package, seccion: 'SISTEMA', adminOnly: true }
];


export const usePanelOperativo = (rolActual, emailUsuario) => {
  const [moduloActivo, setModuloActivo] = useState(() => localStorage.getItem('panelModuloActivo') || 'inicio'); 

  useEffect(() => {
    localStorage.setItem('panelModuloActivo', moduloActivo);
  }, [moduloActivo]);

  const USER_DATA = useMemo(() => {
    const nombreReal = emailUsuario || 'Usuario';
    const iniciales = nombreReal.substring(0, 2).toUpperCase();
    
    return {
      nombre: nombreReal,
      rol: rolActual || 'Sin Rol',
      iniciales: iniciales
    };
  }, [rolActual, emailUsuario]);

  const accesoPermitido = useMemo(() => {
    return ['encargado', 'admin', 'auditor', 'soporte'].includes(rolActual);
  }, [rolActual]);

  const seccionesMenu = useMemo(() => {
    return MENU_CONFIG.reduce((acc, item) => {
      if (item.adminOnly && rolActual !== 'admin') {
        return acc;
      }
      if (rolActual === 'soporte' && !['inicio', 'reclamos', 'soluciones'].includes(item.id)) {
        return acc;
      }
      if (rolActual === 'encargado' && !['inicio', 'tareas'].includes(item.id)) {
        return acc;
      }
      if (!acc[item.seccion]) acc[item.seccion] = [];
      acc[item.seccion].push(item);
      return acc;
    }, {});
  }, [rolActual]);

  const moduloActualInfo = useMemo(() => {
    return MENU_CONFIG.find(m => m.id === moduloActivo) || MENU_CONFIG[0];
  }, [moduloActivo]);

  const setModuloActivoSafe = (modulo) => {
    if (rolActual === 'soporte' && !['inicio', 'reclamos', 'soluciones'].includes(modulo)) {
      return;
    }
    if (rolActual === 'encargado' && !['inicio', 'tareas'].includes(modulo)) {
      return;
    }
    const targetItem = MENU_CONFIG.find(m => m.id === modulo);
    if (targetItem?.adminOnly && rolActual !== 'admin') {
      return;
    }
    setModuloActivo(modulo);
  };

  useEffect(() => {
    if (rolActual === 'encargado' && !['inicio', 'tareas'].includes(moduloActivo)) {
      setModuloActivo('inicio');
    } else if (rolActual === 'soporte' && !['inicio', 'reclamos', 'soluciones'].includes(moduloActivo)) {
      setModuloActivo('inicio');
    }
  }, [rolActual, moduloActivo]);

  return { 
    USER_DATA, 
    accesoPermitido, 
    moduloActivo, 
    setModuloActivo: setModuloActivoSafe, 
    seccionesMenu, 
    moduloActualInfo 
  };
};