// src/hooks/useTvDashboard.js
import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';

export const useTvDashboard = () => {
  const [reclamos, setReclamos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [nuevoReclamo, setNuevoReclamo] = useState(null);
  const [reclamoSolucionado, setReclamoSolucionado] = useState(null);

  // Referencia para guardar los objetos completos de reclamos conocidos
  const reclamosRef = useRef([]);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reclamosData, tareasData] = await Promise.all([
          storageService.getReclamos(),
          storageService.getTareasPendientes()
        ]);
        
        if (reclamosData) {
          const oldReclamos = reclamosRef.current;
          
          if (!isInitialLoad.current) {
            // Reclamos nuevos (están en la nueva lista pero no en la antigua)
            const nuevos = reclamosData.filter(r => !oldReclamos.find(old => old.rowId === r.rowId));
            if (nuevos.length > 0) {
              setNuevoReclamo(nuevos[0]);
            }
            
            // Reclamos solucionados (estaban en la antigua lista pero ya no en la nueva)
            const solucionados = oldReclamos.filter(old => !reclamosData.find(r => r.rowId === old.rowId));
            if (solucionados.length > 0) {
              setReclamoSolucionado(solucionados[0]);
            }
          } else {
            isInitialLoad.current = false;
          }
          
          // Actualizar la referencia
          reclamosRef.current = [...reclamosData];
        }

        setReclamos(reclamosData || []);
        setTareas(tareasData || []);
        setUltimaActualizacion(new Date());
      } catch (err) {
        console.error("Error cargando TV Dashboard", err);
      }
    };

    // Carga inicial
    fetchData();

    // Refresco cada 30 segundos (ideal para una TV desatendida)
    const interval = setInterval(fetchData, 30000); 

    return () => clearInterval(interval);
  }, []);

  return { reclamos, tareas, ultimaActualizacion, nuevoReclamo, setNuevoReclamo, reclamoSolucionado, setReclamoSolucionado };
};