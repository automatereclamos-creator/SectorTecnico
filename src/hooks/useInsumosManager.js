import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useInsumosManager = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cargar todos los insumos ordenados por descripción
  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('insumos')
        .select('*')
        .order('descripcion', { ascending: true });

      if (supabaseError) throw supabaseError;
      setInsumos(data || []);
    } catch (err) {
      console.error('Error cargando insumos:', err);
      setError(err.message || 'Error al cargar los insumos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  // Función helper para generar código
  const generarCodigoAutomatico = async (categoria) => {
    const prefix = categoria ? categoria.substring(0, 3).toUpperCase() : 'INS';
    
    try {
      const { data } = await supabase
        .from('insumos')
        .select('codigo')
        .like('codigo', `${prefix}%`);

      if (!data || data.length === 0) {
        return `${prefix}-001`;
      }

      const numeros = data
        .map(item => {
          const partes = item.codigo.split('-');
          return partes.length > 1 ? parseInt(partes[1]) : 0;
        })
        .filter(num => !isNaN(num));

      const maxNum = numeros.length > 0 ? Math.max(...numeros) : 0;
      return `${prefix}-${(maxNum + 1).toString().padStart(3, '0')}`;
    } catch (e) {
      console.error("Error generando código:", e);
      return `${prefix}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  };

  // Crear un nuevo insumo
  const createInsumo = async (nuevoInsumo) => {
    try {
      setActionLoading(true);

      // Autogenerar código si viene vacío
      if (!nuevoInsumo.codigo) {
        nuevoInsumo.codigo = await generarCodigoAutomatico(nuevoInsumo.categoria);
      }

      // Validar si el código ya existe
      const { data: existe } = await supabase
        .from('insumos')
        .select('codigo')
        .eq('codigo', nuevoInsumo.codigo)
        .single();
      
      if (existe) {
        throw new Error(`El código "${nuevoInsumo.codigo}" ya existe en el catálogo.`);
      }

      const { data, error } = await supabase
        .from('insumos')
        .insert([nuevoInsumo])
        .select()
        .single();

      if (error) throw error;

      setInsumos(prev => [...prev, data].sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || '')));
      return { success: true, data };
    } catch (err) {
      console.error('Error al crear insumo:', err);
      return { success: false, error: err.message || 'Error al crear insumo' };
    } finally {
      setActionLoading(false);
    }
  };

  // Actualizar un insumo existente
  const updateInsumo = async (codigoOriginal, datosActualizados) => {
    try {
      setActionLoading(true);
      
      // Si el código cambió, validar que no choque con otro existente
      if (codigoOriginal !== datosActualizados.codigo) {
        const { data: existe } = await supabase
          .from('insumos')
          .select('codigo')
          .eq('codigo', datosActualizados.codigo)
          .single();
        
        if (existe) {
          throw new Error(`El código "${datosActualizados.codigo}" ya pertenece a otro insumo.`);
        }
      }

      const { data, error } = await supabase
        .from('insumos')
        .update(datosActualizados)
        .eq('codigo', codigoOriginal)
        .select()
        .single();

      if (error) throw error;

      setInsumos(prev => prev.map(ins => ins.codigo === codigoOriginal ? data : ins).sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || '')));
      return { success: true, data };
    } catch (err) {
      console.error('Error al actualizar insumo:', err);
      return { success: false, error: err.message || 'Error al actualizar insumo' };
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar un insumo
  const deleteInsumo = async (codigo) => {
    try {
      setActionLoading(true);
      
      // Intentar eliminar
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('codigo', codigo);

      if (error) {
        // En caso de que haya restricciones de llave foránea (ej. insumo usado en equipos)
        if (error.code === '23503') {
           throw new Error('No se puede eliminar este insumo porque ya está en uso en otros registros.');
        }
        throw error;
      }

      setInsumos(prev => prev.filter(ins => ins.codigo !== codigo));
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar insumo:', err);
      return { success: false, error: err.message || 'Error al eliminar insumo' };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    insumos,
    loading,
    error,
    actionLoading,
    fetchInsumos,
    createInsumo,
    updateInsumo,
    deleteInsumo
  };
};
