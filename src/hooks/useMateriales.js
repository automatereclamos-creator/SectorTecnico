import { useState } from 'react';

export const useMateriales = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [matError, setMatError] = useState('');

  const crearMoldeOperacion = (tipoOperacion) => ({
    tipo: tipoOperacion, // 'AGREGAR', 'QUITAR', 'CAMBIAR'

    in_familia: '', in_codigo: '', in_nombre: '', in_marca: '', in_serie: '', in_cantidad: 1, in_condicion: 'USADO',
    pide_serie: false, prefijo_serie: '',

    // BANDERAS EXTRAS DE LA BD
    pide_nro: false, prefijo_nro: '', in_nro_terminal: '',
    pide_componentes: false, in_procesador: '', in_disco: '',

    out_equipo_id: '',
  });

  const addMaterial = (tipo) => {
    if (operaciones.length > 0) {
      // Como ahora apilamos hacia arriba, el que estaba editando el usuario siempre está en la posición 0
      const ultima = operaciones[0];

      // Validaciones para equipos ENTRANTES
      if (ultima.tipo === 'AGREGAR' || ultima.tipo === 'CAMBIAR') {
        if (!ultima.in_codigo) return mostrarError("Completá el equipo entrante.");
        if (ultima.pide_serie && !ultima.in_serie) return mostrarError("Falta la serie del equipo entrante.");
        if (ultima.pide_nro && !ultima.in_nro_terminal) return mostrarError("Completá el número de terminal (Ej: 01).");
        if (ultima.pide_componentes && (!ultima.in_procesador || !ultima.in_disco)) return mostrarError("Seleccioná el procesador y el disco.");
      }

      // Validaciones para equipos SALIENTES
      if (ultima.tipo === 'QUITAR' && !ultima.out_equipo_id) return mostrarError("Seleccioná qué equipo vas a quitar.");
      if (ultima.tipo === 'CAMBIAR' && !ultima.out_equipo_id) return mostrarError("Seleccioná el equipo que se retira.");
    }

    // ─── EL TRUCO ESTÁ ACÁ ───
    // Ponemos el "crearMoldeOperacion" PRIMERO, y después desparramamos lo que ya estaba en el historial (...prev)
    setOperaciones(prev => [crearMoldeOperacion(tipo), ...prev]);
  };

  const mostrarError = (msg) => {
    setMatError(msg);
    setTimeout(() => setMatError(''), 3500);
  };

  const handleMaterialChange = (index, field, value) => {
    setOperaciones(prev => prev.map((op, i) => i === index ? { ...op, [field]: value } : op));
  };

  const removeMaterial = (index) => {
    setOperaciones(prev => prev.filter((_, i) => i !== index));
  };

  const resetMateriales = () => {
    setOperaciones([]);
    setMatError('');
  };

  return { materiales: operaciones, addMaterial, removeMaterial, handleMaterialChange, resetMateriales, matError };
};