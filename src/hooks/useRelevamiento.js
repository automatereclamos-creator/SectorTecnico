import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { fetchBomTemplates, getBomKey } from '../services/bomService';

const isEquipoCompleto = (eq) => {
  if (!eq) return true;
  if (!eq.familia || !eq.codigo) return false;
  if (eq.codigo === 'OTR-999' && (!eq.descripcion_manual || !eq.descripcion_manual.trim())) return false;
  
  if (eq.pide_nro) {
    const isNroIncompleto = eq.detalles?.some(det => !det.nro_terminal || !det.nro_terminal.trim());
    if (isNroIncompleto) return false;
  }
  
  if (eq.pide_componentes) {
    const isCompIncompleto = eq.detalles?.some(det => !det.procesador || !det.disco);
    if (isCompIncompleto) return false;
  }
  
  return true;
};

export const useRelevamiento = (userEmail) => {
  const [formData, setFormData] = useState({ empresa: '', id: '', nombre: '', agencia_uuid: null });
  const [idHint, setIdHint] = useState({ text: '', type: '', found: null });
  const [equipos, setEquipos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [agenciasDB, setAgenciasDB] = useState({});
  const [bomTemplates, setBomTemplates] = useState({});

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // ─── Carga de Agencias ───
  useEffect(() => {
    const cargarAgencias = async () => {
      try {
        const { data, error } = await supabase
          .from('agencias')
          .select('id, id_agencia, empresa, nombre')
          .eq('activa', true)
          .limit(5000);

        if (error) throw error;

        const dbEstructurada = {};
        if (data) {
          data.forEach(ag => {
            const empresaLimpia = String(ag.empresa).trim().toUpperCase();
            if (!dbEstructurada[empresaLimpia]) {
              dbEstructurada[empresaLimpia] = {};
            }
            dbEstructurada[empresaLimpia][String(ag.id_agencia).trim()] = {
              nombre: ag.nombre,
              uuid: ag.id
            };
          });
          setAgenciasDB(dbEstructurada);
        }
      } catch (err) {
        console.error("Error cargando agencias:", err);
      }
    };
    cargarAgencias();
  }, []);

  // ─── Carga de Plantillas BOM desde BD ───
  useEffect(() => {
    const cargarBom = async () => {
      const templates = await fetchBomTemplates();
      setBomTemplates(templates);
    };
    cargarBom();
  }, []);

  // ─── Handlers de Agencia ───
  const handleEmpresaChange = (e) => {
    const val = e.target.value;
    setFormData({ empresa: val, id: '', nombre: '', agencia_uuid: null });
    setIdHint({ text: '', type: '', found: null });
  };

  const handleIdChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, id: val, agencia_uuid: null, nombre: '' }));

    if (!formData.empresa || !val) {
      setIdHint({ text: '', type: '', found: null });
      return;
    }

    const empNorm = formData.empresa.trim().toUpperCase();
    const agfound = agenciasDB[empNorm]?.[val];

    if (agfound) {
      setFormData(prev => ({ ...prev, nombre: agfound.nombre, agencia_uuid: agfound.uuid }));
      setIdHint({ text: "✓ Agencia vinculada", type: "ok", found: true });
    } else {
      setIdHint({ text: "ID de Punto no encontrado", type: "err", found: false });
    }
  };

  const addEquipo = () => {
    // Validar que el equipo más reciente (primero en la lista) esté completo
    if (equipos.length > 0) {
      const masReciente = equipos[0];
      if (!isEquipoCompleto(masReciente)) return;
    }
    // Insertar al inicio para que el nuevo equipo aparezca arriba
    setEquipos(prev => [{
      familia: '',
      codigo: '',
      nombre_producto: '',
      marca: '',
      descripcion_manual: '',
      cantidad: 1,
      pide_serie: false,
      prefijo_serie: '',
      pide_nro: false,
      prefijo_nro: '',
      pide_componentes: false,
      detalles: [{}]
    }, ...prev]);
  };

  /** Elimina un equipo por índice */
  const removeEquipo = (index) => {
    setEquipos(prev => prev.filter((_, i) => i !== index));
  };

  /** Modifica un campo de un equipo por índice */
  const handleEquipoChange = (index, campo, valor) => {
    setEquipos(prev => prev.map((eq, i) => i === index ? { ...eq, [campo]: valor } : eq));
  };

  /** Ajusta la cantidad de unidades y sincroniza el array de detalles */
  const handleCantidadChange = (index, nuevaCantidad) => {
    setEquipos(prev => prev.map((eq, i) => {
      if (i !== index) return eq;
      const cant = Math.max(1, nuevaCantidad);
      const detalles = [...(eq.detalles || [])];
      // Agregar slots vacíos si se aumentó la cantidad
      while (detalles.length < cant) detalles.push({});
      // Quitar del final si se redujo
      while (detalles.length > cant) detalles.pop();
      return { ...eq, cantidad: cant, detalles };
    }));
  };

  /** Modifica un campo dentro de un detalle de unidad específico */
  const handleDetalleChange = (eqIndex, detIndex, campo, valor) => {
    setEquipos(prev => prev.map((eq, i) => {
      if (i !== eqIndex) return eq;
      const detalles = eq.detalles.map((det, j) =>
        j === detIndex ? { ...det, [campo]: valor } : det
      );
      return { ...eq, detalles };
    }));
  };

  // ─── Preview: Valida y abre el modal ───
  const handlePreview = () => {
    if (!formData.agencia_uuid) return showMsg("ID de agencia inválido.", "error");
    if (equipos.length === 0) return showMsg("Agregá al menos un equipo antes de impactar.", "error");

    for (const eq of equipos) {
      if (!eq.familia || !eq.codigo) {
        return showMsg("Completá categoría y producto de todos los equipos.", "error");
      }
      if (eq.codigo === 'OTR-999' && !eq.descripcion_manual) {
        return showMsg("Describí el equipo 'Otro' antes de continuar.", "error");
      }
    }

    setShowModal(true);
  };

  // ─── Confirm: Guarda todo en BD ───
  const handleConfirm = async () => {
    if (!formData.agencia_uuid) return showMsg("ID de agencia inválido.", "error");
    if (equipos.length === 0) return showMsg("Agregá al menos un equipo antes de impactar.", "error");

    setIsSubmitting(true);

    try {
      const { data: perfil } = await supabase.from('perfiles').select('id').eq('email', userEmail).single();
      const perfilId = perfil ? perfil.id : null;

      // 1. Aplanar: cada detalle de cada equipo genera un registro individual
      const registrosParaInsertar = [];
      for (const eq of equipos) {
        const detallesArr = eq.detalles && eq.detalles.length > 0 ? eq.detalles : [{}];
        for (const det of detallesArr) {
          const especificaciones = {};
          if (eq.pide_nro && det.nro_terminal) {
            especificaciones.nro_terminal = `${eq.prefijo_nro || ''}${det.nro_terminal}`;
          }
          if (eq.pide_componentes) {
            if (det.procesador) especificaciones.procesador = det.procesador;
            if (det.disco) especificaciones.disco = det.disco;
          }

          registrosParaInsertar.push({
            agencia_id: formData.agencia_uuid,
            categoria: eq.familia,
            producto: eq.codigo === 'OTR-999'
              ? eq.descripcion_manual
              : (eq.nombre_producto || eq.codigo),
            marca: eq.marca || '-',
            estado: 'INSTALADO',
            especificaciones: Object.keys(especificaciones).length > 0 ? especificaciones : {}
          });
        }
      }

      const { data: insertados, error: insError } = await supabase
        .from('equipos')
        .insert(registrosParaInsertar)
        .select('id, categoria, producto');

      if (insError) throw insError;

      // 2. Auto-BOM: Insertar hijos para equipos que lo requieran
      let todosLosMovimientos = [];
      let hijosParaInsertar = [];

      for (const eqPadre of insertados) {
        const bomKey = getBomKey(eqPadre.categoria);

        if (bomKey && bomTemplates[bomKey]) {
          const hijos = bomTemplates[bomKey].map(hijo => ({
            agencia_id: formData.agencia_uuid,
            categoria: hijo.categoria,
            producto: hijo.producto,
            estado: 'INSTALADO',
            equipo_padre_id: eqPadre.id
          }));
          hijosParaInsertar.push(...hijos);
        }
      }

      if (hijosParaInsertar.length > 0) {
        const { data: hijosCreados, error: hijoError } = await supabase
          .from('equipos')
          .insert(hijosParaInsertar)
          .select('id');
        if (hijoError) throw hijoError;

        const movHijos = hijosCreados.map(hijo => ({
          equipo_id: hijo.id,
          agencia_id: formData.agencia_uuid,
          tipo: 'ALTA',
          condicion: 'NUEVO',
          observaciones: 'Auto-BOM: Componente interno relevado automáticamente',
          creado_por: perfilId
        }));
        todosLosMovimientos.push(...movHijos);
      }

      // 3. Movimientos de los padres
      const movPadres = insertados.map(eq => ({
        equipo_id: eq.id,
        agencia_id: formData.agencia_uuid,
        tipo: 'ALTA',
        condicion: 'USADO',
        observaciones: 'Relevamiento inicial de hardware comercial',
        creado_por: perfilId
      }));
      todosLosMovimientos.push(...movPadres);

      // 4. Impacto en bloque del historial de auditoría
      if (todosLosMovimientos.length > 0) {
        const { error: movError } = await supabase.from('movimientos_equipos').insert(todosLosMovimientos);
        if (movError) throw movError;
      }

      setMessage({ text: "Relevamiento guardado. Inventarios y dependencias BOM actualizados.", type: "success" });
      setFormData({ empresa: '', id: '', nombre: '', agencia_uuid: null });
      setIdHint({ text: '', type: '', found: null });
      setEquipos([]);
      setShowModal(false);

    } catch (error) {
      console.error("Error al guardar relevamiento:", error);
      showMsg(`Error transaccional: ${error.message || 'Consulte los logs.'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ultimoEquipoCompleto = equipos.length === 0 || isEquipoCompleto(equipos[0]);

  return {
    formData, idHint, handleEmpresaChange, handleIdChange,
    equipos, setEquipos, addEquipo, removeEquipo, handleEquipoChange,
    handleCantidadChange, handleDetalleChange,
    isSubmitting, message, showModal, setShowModal,
    handlePreview, handleConfirm,
    bomTemplates,
    ultimoEquipoCompleto
  };
};