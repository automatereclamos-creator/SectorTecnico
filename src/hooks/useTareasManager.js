import { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { buscarAgencia, crearAgencia } from '../services/agenciasService';
import { supabase } from '../config/supabase';

// No initialTareaState needed, tasksList handles it dynamically

export const useTareasManager = () => {
  const [tareas, setTareas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroEmpresa, setFiltroEmpresa] = useState('TODAS');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 12;

  // Detalle y edición
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Drawer de creación
  const [isCreating, setIsCreating] = useState(false);
  const [tasksList, setTasksList] = useState([
    { empresa: '', id: '', nombre: '', descripcion: '', contacto: '', idHint: { text: '', type: '', found: null } }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Nueva Alta de Agencia + Tarea Inicial
  const [isRegisteringAgency, setIsRegisteringAgency] = useState(false);
  const [agencyFormData, setAgencyFormData] = useState({
    empresa: '',
    id_agencia: '',
    nombre: '',
    descripcion: '',
    contacto: ''
  });

  const mostrarMensaje = (text, type) => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
  };

  const fetchTareas = async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getAllTareas();
      setTareas(data || []);

      if (tareaSeleccionada) {
        const actualizada = data.find(t => t.rowId === tareaSeleccionada.rowId);
        if (actualizada) setTareaSeleccionada(actualizada);
      }
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      mostrarMensaje("Error al cargar las tareas.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = tareas.length;
    const pendientes = tareas.filter(t => t.estado === 'PENDIENTE').length;
    const completadas = tareas.filter(t => t.estado === 'COMPLETADA').length;
    return { total, pendientes, completadas };
  }, [tareas]);

  // Filtrado
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      if (filtroEstado !== 'TODOS') {
        if (t.estado !== filtroEstado) return false;
      }
      if (filtroEmpresa !== 'TODAS') {
        if (t.empresa?.toLowerCase() !== filtroEmpresa.toLowerCase()) return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const coincideId = t.id?.toLowerCase().includes(query);
        const coincideNombre = t.nombre?.toLowerCase().includes(query);
        const coincideDescripcion = t.descripcion?.toLowerCase().includes(query);
        const coincideAsignado = t.asignado?.toLowerCase().includes(query);
        return coincideId || coincideNombre || coincideDescripcion || coincideAsignado;
      }
      return true;
    });
  }, [tareas, filtroEstado, filtroEmpresa, searchQuery]);

  // Paginación
  const totalPaginas = Math.ceil(tareasFiltradas.length / filasPorPagina) || 1;
  const tareasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return tareasFiltradas.slice(inicio, inicio + filasPorPagina);
  }, [tareasFiltradas, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroEmpresa, searchQuery]);

  // --- Formulario de Creación ---

  const handleAddTask = () => {
    setTasksList(prev => [...prev, { empresa: '', id: '', nombre: '', descripcion: '', contacto: '', idHint: { text: '', type: '', found: null } }]);
  };

  const handleRemoveTask = (index) => {
    setTasksList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index, fieldName, value) => {
    setTasksList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [fieldName]: value };
      return updated;
    });
  };

  const handleEmpresaChange = (index, empresaValue) => {
    setTasksList(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        empresa: empresaValue,
        id: '',
        nombre: '',
        contacto: '',
        idHint: { text: '', type: '', found: null }
      };
      return updated;
    });
  };

  const handleIdChange = async (index, idValue) => {
    const val = idValue.trim();
    
    // Update ID immediately
    setTasksList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], id: val };
      return updated;
    });

    const currentEmpresa = tasksList[index]?.empresa || '';

    if (currentEmpresa === "Otros" || !val) {
      setTasksList(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], nombre: val ? "Otros" : "", idHint: { text: '', type: '', found: null } };
        return updated;
      });
      return;
    }
    
    if (!currentEmpresa) {
      setTasksList(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], idHint: { text: "Primero seleccioná la empresa", type: "err", found: null } };
        return updated;
      });
      return;
    }

    const agFound = await buscarAgencia(currentEmpresa, val);
    setTasksList(prev => {
      const updated = [...prev];
      if (agFound) {
        updated[index] = {
          ...updated[index],
          nombre: agFound.nombre,
          idHint: { text: "✓ Agencia encontrada", type: "ok", found: true }
        };
      } else {
        updated[index] = {
          ...updated[index],
          nombre: "",
          idHint: { text: "ID no encontrado", type: "err", found: false }
        };
      }
      return updated;
    });
  };

  const handleCopyTareas = () => {
    navigator.clipboard.writeText(previewContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleCrearTarea = (e) => {
    if (e) e.preventDefault();

    const validTasks = tasksList.filter(t => t.empresa && t.id && t.nombre && t.descripcion.trim());
    if (validTasks.length === 0) {
      return mostrarMensaje("Completá al menos una tarea válida con todos sus campos.", "error");
    }

    // Generar formato de email
    const fechaHoy = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    let lines = [];
    lines.push(`TAREAS PARA SECTOR TÉCNICO - ${fechaHoy}`);
    lines.push(`=======================================`);
    lines.push(``);

    validTasks.forEach((t, idx) => {
      lines.push(`TAREA #${idx + 1}:`);
      lines.push(`- Empresa: ${t.empresa}`);
      lines.push(`- Sucursal: ${t.nombre} (ID: ${t.id})`);
      if (t.contacto) {
        lines.push(`- Contacto: ${t.contacto}`);
      }
      lines.push(`- Trabajo: ${t.descripcion}`);
      lines.push(``);
      lines.push(`[Espacio para insertar fotos Tarea #${idx + 1}]`);
      lines.push(``);
      if (idx < validTasks.length - 1) {
        lines.push(`---------------------------------------`);
        lines.push(``);
      }
    });
    lines.push(`=======================================`);

    setPreviewContent(lines.join('\n'));
    setIsPreviewOpen(true);
  };

  const confirmarYEnviarMail = async (enviarMail = true) => {
    const validTasks = tasksList.filter(t => t.empresa && t.id && t.nombre && t.descripcion.trim());
    if (validTasks.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let creadoPorId = null;
      if (session?.user?.email) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('id')
          .eq('email', session.user.email)
          .single();
        creadoPorId = perfil?.id || null;
      }

      const promises = validTasks.map(t => 
        storageService.crearTarea({
          empresa: t.empresa,
          id: t.id,
          nombre: t.nombre,
          descripcion: t.descripcion,
          contacto: t.contacto,
          creado_por: creadoPorId
        })
      );
      await Promise.all(promises);

      if (enviarMail) {
        // Redireccionar a Gmail
        const fechaHoy = new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const subject = `Tarea Para sector Tecnico ${fechaHoy}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(previewContent)}`;
        window.open(gmailUrl, '_blank');
      }

      mostrarMensaje(
        enviarMail 
          ? `${promises.length} Tarea(s) creada(s) y enviada(s) con éxito.`
          : `${promises.length} Tarea(s) creada(s) con éxito.`,
        "success"
      );
      setTasksList([{ empresa: '', id: '', nombre: '', descripcion: '', contacto: '', idHint: { text: '', type: '', found: null } }]);
      setIsPreviewOpen(false);
      setIsCreating(false);
      await fetchTareas();
    } catch (error) {
      console.error("Error al crear y enviar tareas:", error);
      mostrarMensaje("Error al procesar las tareas.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Nueva Alta de Agencia + Tarea Inicial ---

  const handleAgencyFieldChange = (fieldName, value) => {
    setAgencyFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCrearAltaYTarea = async (e) => {
    if (e) e.preventDefault();

    const { empresa, id_agencia, nombre, descripcion, contacto } = agencyFormData;
    if (!empresa || !id_agencia || !nombre || !descripcion.trim()) {
      return mostrarMensaje("Completá todos los campos obligatorios.", "error");
    }

    setIsSubmitting(true);
    try {
      // 1. Validar duplicados de agencia en base de datos
      const { data: agExistente, error: checkError } = await supabase
        .from('agencias')
        .select('id')
        .eq('empresa', empresa.trim().toLowerCase())
        .eq('id_agencia', id_agencia.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (agExistente) {
        setIsSubmitting(false);
        return mostrarMensaje(`El punto de venta ${id_agencia} ya está registrado para la empresa ${empresa}.`, "error");
      }

      // 2. Crear la agencia en la base de datos
      const nuevaAgencia = await crearAgencia({
        empresa,
        id_agencia,
        nombre,
        activa: true
      });

      if (!nuevaAgencia) {
        throw new Error("No se pudo dar de alta la agencia");
      }

      // 3. Preparar la tarea para la previsualización del mail
      const fechaHoy = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      let lines = [];
      lines.push(`TAREAS PARA SECTOR TÉCNICO - ${fechaHoy}`);
      lines.push(`=======================================`);
      lines.push(``);
      lines.push(`TAREA #1 (NUEVO PUNTO DE VENTA):`);
      lines.push(`- Empresa: ${empresa}`);
      lines.push(`- Sucursal: ${nombre} (ID: ${id_agencia})`);
      if (contacto) {
        lines.push(`- Contacto: ${contacto}`);
      }
      lines.push(`- Trabajo: ${descripcion}`);
      lines.push(``);
      lines.push(`[Espacio para insertar fotos Tarea #1]`);
      lines.push(``);
      lines.push(`=======================================`);

      setPreviewContent(lines.join('\n'));

      // 4. Configurar listado temporal de tareas
      setTasksList([
        {
          empresa,
          id: id_agencia,
          nombre,
          descripcion,
          contacto
        }
      ]);

      // 5. Mostrar la previsualización y cerrar la modal de alta
      setIsRegisteringAgency(false);
      setAgencyFormData({ empresa: '', id_agencia: '', nombre: '', descripcion: '', contacto: '' });
      setIsPreviewOpen(true);

    } catch (error) {
      console.error("Error al registrar alta y tarea:", error);
      mostrarMensaje("Error al procesar la alta de la agencia y la tarea.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edición ---

  const activarEdicion = (tarea) => {
    setIsEditing(true);
    setEditData({
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      contacto: tarea.contacto || ''
    });
  };

  const guardarEdicion = async (id) => {
    if (!editData.descripcion) {
      return mostrarMensaje("La descripción es obligatoria.", "error");
    }
    setIsLoading(true);
    try {
      await storageService.actualizarTarea(id, editData);
      mostrarMensaje("Tarea actualizada.", "success");
      setIsEditing(false);
      await fetchTareas();
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      mostrarMensaje("Error al actualizar la tarea.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Toggle Estado ---

  const toggleEstado = async (tarea) => {
    const nuevoEstado = tarea.estado === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
    setIsLoading(true);
    try {
      await storageService.actualizarTarea(tarea.rowId, { estado: nuevoEstado });
      mostrarMensaje(nuevoEstado === 'COMPLETADA' ? "Tarea completada." : "Tarea reabierta.", "success");
      await fetchTareas();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      mostrarMensaje("Error al cambiar el estado.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Eliminar ---

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta tarea? Esta acción no se puede deshacer.")) {
      return;
    }
    setIsLoading(true);
    try {
      await storageService.eliminarTarea(id);
      mostrarMensaje("Tarea eliminada.", "success");
      setTareaSeleccionada(null);
      setIsEditing(false);
      await fetchTareas();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      mostrarMensaje("Error al eliminar la tarea.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tareas: tareasPaginadas,
    tareasFiltradas: tareasFiltradas.length,
    isLoading,
    mensaje,
    kpis,

    searchQuery, setSearchQuery,
    filtroEstado, setFiltroEstado,
    filtroEmpresa, setFiltroEmpresa,

    paginaActual, setPaginaActual,
    totalPaginas,

    tareaSeleccionada, setTareaSeleccionada,
    isEditing, setIsEditing,
    editData, setEditData,
    activarEdicion,
    guardarEdicion,
    toggleEstado,
    eliminarTarea,

    isCreating, setIsCreating,
    tasksList, setTasksList,
    isSubmitting,
    handleAddTask,
    handleRemoveTask,
    handleFieldChange,
    handleEmpresaChange,
    handleIdChange,
    handleCrearTarea,
    fetchTareas,

    isPreviewOpen, setIsPreviewOpen,
    previewContent,
    isCopied,
    handleCopyTareas,
    confirmarYEnviarMail,

    isRegisteringAgency, setIsRegisteringAgency,
    agencyFormData,
    handleAgencyFieldChange,
    handleCrearAltaYTarea
  };
};
