import { useState, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { buscarAgencia, actualizarTelefonoAgencia } from '../services/agenciasService';
import { hoyISO } from '../utils/timezone';

const initialClaimState = {
  empresa: '',
  id: '',
  nombre: '',
  informa: '',
  horario: '',
  telefono: '',
  carga: ''
};

const initialSolucionState = {
  empresa: '',
  id: '',
  nombre: '',
  trabajo: '',
  horaInicio: '',
  horaFin: '',
  tecnico1: '',
  tecnico2: '',
  tecnico3: '',
  observaciones: '',
  originRowId: null
};

export const useReclamosManager = () => {
  const [reclamos, setReclamos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  // Estados de filtrado y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS', 'PENDIENTE', 'SOLUCIONADO'
  const [filtroEmpresa, setFiltroEmpresa] = useState('TODAS'); // 'TODAS', 'Alfa', 'Palpitos', 'Otros'

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 12;

  // Reclamo seleccionado y edición
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Drawer/Modal de Creación de nuevo Reclamo
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialClaimState);
  const [idHint, setIdHint] = useState({ text: '', type: '', found: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Drawer de Solución (sin materiales) ──
  const [isSolucionando, setIsSolucionando] = useState(false);
  const [solFormData, setSolFormData] = useState(initialSolucionState);
  const [solIdHint, setSolIdHint] = useState({ text: '', type: '', found: null });
  const [solModalOpen, setSolModalOpen] = useState(false);
  const [solPreviewContent, setSolPreviewContent] = useState('');
  const [solIsSubmitting, setSolIsSubmitting] = useState(false);
  const [solIsCopied, setSolIsCopied] = useState(false);

  const mostrarMensaje = (text, type) => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
  };

  const fetchReclamos = async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getAllReclamos();
      setReclamos(data || []);
      
      // Si hay un reclamo seleccionado, actualizamos su referencia con los nuevos datos
      if (reclamoSeleccionado) {
        const actualizado = data.find(r => r.rowId === reclamoSeleccionado.rowId);
        if (actualizado) {
          setReclamoSeleccionado(actualizado);
        }
      }
    } catch (error) {
      console.error("Error al cargar reclamos:", error);
      mostrarMensaje("Error al cargar los reclamos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamos();
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = reclamos.length;
    const pendientes = reclamos.filter(r => r.estado === 'PENDIENTE').length;
    const solucionados = reclamos.filter(r => r.estado === 'SOLUCIONADO' || r.estado === 'RESUELTO').length;
    return { total, pendientes, solucionados };
  }, [reclamos]);

  // Lista filtrada
  const reclamosFiltrados = useMemo(() => {
    return reclamos.filter(r => {
      // Filtro por Estado
      if (filtroEstado !== 'TODOS') {
        const estadoSimple = (r.estado === 'SOLUCIONADO' || r.estado === 'RESUELTO') ? 'SOLUCIONADO' : 'PENDIENTE';
        if (estadoSimple !== filtroEstado) return false;
      }
      
      // Filtro por Empresa
      if (filtroEmpresa !== 'TODAS') {
        if (r.empresa?.toLowerCase() !== filtroEmpresa.toLowerCase()) return false;
      }

      // Filtro por Búsqueda (Texto libre)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const coincideId = r.id?.toLowerCase().includes(query);
        const coincideNombre = r.nombre?.toLowerCase().includes(query);
        const coincideInforma = r.informa?.toLowerCase().includes(query);
        const coincideCarga = r.carga?.toLowerCase().includes(query);
        return coincideId || coincideNombre || coincideInforma || coincideCarga;
      }

      return true;
    });
  }, [reclamos, filtroEstado, filtroEmpresa, searchQuery]);

  // Lista paginada
  const totalPaginas = Math.ceil(reclamosFiltrados.length / filasPorPagina) || 1;
  const reclamosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return reclamosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [reclamosFiltrados, paginaActual]);

  // Resetear página al filtrar
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroEmpresa, searchQuery]);

  // Manejo de cambios en formulario de creación
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEmpresaChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, empresa: value, id: '', nombre: '', horario: '', telefono: '' }));
    setIdHint({ text: '', type: '', found: null });
  };

  const handleCreateIdChange = async (e) => {
    const val = e.target.value.trim();
    setFormData(prev => ({ ...prev, id: val }));

    if (!formData.empresa) {
      setIdHint({ text: "Primero seleccioná la empresa", type: "err", found: null });
      return;
    }

    const agFound = await buscarAgencia(formData.empresa, val);
    if (agFound) {
      setFormData(prev => ({ 
        ...prev, 
        nombre: agFound.nombre,
        telefono: agFound.telefono || ''
      }));
      setIdHint({ text: "✓ Agencia encontrada", type: "ok", found: true });
    } else {
      setFormData(prev => ({ ...prev, nombre: "" }));
      setIdHint({ text: "ID no encontrado", type: "err", found: false });
    }
  };

  // Crear Reclamo
  const handleCrearReclamo = async (e) => {
    if (e) e.preventDefault();
    if (!formData.empresa || !formData.id || !formData.nombre || !formData.informa || !formData.carga) {
      return mostrarMensaje("Completá los campos obligatorios.", "error");
    }

    setIsSubmitting(true);
    try {
      await storageService.saveTarea({
        ...formData,
        tipo: 'reclamo'
      });

      // Sincronizar el teléfono a la tabla de agencias
      if (formData.telefono) {
        await actualizarTelefonoAgencia(formData.empresa, formData.id, formData.telefono);
      }

      mostrarMensaje("Reclamo registrado con éxito.", "success");
      
      // Limpiar y cerrar drawer
      setFormData(initialClaimState);
      setIdHint({ text: '', type: '', found: null });
      setIsCreating(false);
      
      // Recargar lista
      await fetchReclamos();
    } catch (error) {
      console.error("Error al registrar reclamo:", error);
      mostrarMensaje("Error al registrar el reclamo.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar Edición
  const activarEdicion = (reclamo) => {
    setIsEditing(true);
    setEditData({
      informa: reclamo.informa,
      telefono: reclamo.telefono,
      horario: reclamo.horario,
      carga: reclamo.carga,
      estado: reclamo.estado
    });
  };

  // Guardar Cambios de Edición
  const guardarEdicion = async (id) => {
    if (!editData.informa || !editData.carga) {
      return mostrarMensaje("Por favor, completá los campos obligatorios.", "error");
    }

    setIsLoading(true);
    try {
      await storageService.actualizarReclamo(id, editData);

      // Sincronizar el teléfono a la tabla de agencias
      if (editData.telefono && reclamoSeleccionado) {
        await actualizarTelefonoAgencia(
          reclamoSeleccionado.empresa,
          reclamoSeleccionado.id,
          editData.telefono
        );
      }

      mostrarMensaje("Reclamo actualizado.", "success");
      setIsEditing(false);
      await fetchReclamos();
    } catch (error) {
      console.error("Error actualizando reclamo:", error);
      mostrarMensaje("Error al actualizar el reclamo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar Estado (Pérndiente <=> Solucionado)
  const toggleEstado = async (reclamo) => {
    const nuevoEstado = (reclamo.estado === 'SOLUCIONADO' || reclamo.estado === 'RESUELTO') ? 'PENDIENTE' : 'SOLUCIONADO';
    setIsLoading(true);
    try {
      await storageService.actualizarReclamo(reclamo.rowId, {
        informa: reclamo.informa,
        telefono: reclamo.telefono,
        horario: reclamo.horario,
        carga: reclamo.carga,
        estado: nuevoEstado
      });
      
      mostrarMensaje(nuevoEstado === 'SOLUCIONADO' ? "Reclamo resuelto con éxito." : "Reclamo reabierto.", "success");
      await fetchReclamos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      mostrarMensaje("Error al cambiar el estado.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar Reclamo
  const eliminarReclamo = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar permanentemente este reclamo? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoading(true);
    try {
      await storageService.eliminarReclamo(id);
      mostrarMensaje("Reclamo eliminado permanentemente.", "success");
      setReclamoSeleccionado(null);
      setIsEditing(false);
      await fetchReclamos();
    } catch (error) {
      console.error("Error al eliminar reclamo:", error);
      mostrarMensaje("Error al eliminar el reclamo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handlers del Drawer de Solución ──

  const handleSolChange = (e) => {
    const { name, value } = e.target;
    setSolFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSolEmpresaChange = (e) => {
    const value = e.target.value;
    setSolFormData(prev => ({ ...prev, empresa: value, id: '', nombre: '' }));
    setSolIdHint({ text: '', type: '', found: null });
  };

  const handleSolIdChange = async (e) => {
    const val = e.target.value.trim();
    setSolFormData(prev => ({ ...prev, id: val }));

    if (!solFormData.empresa) {
      setSolIdHint({ text: 'Primero seleccioná la empresa', type: 'err', found: null });
      return;
    }

    const agFound = await buscarAgencia(solFormData.empresa, val);
    if (agFound) {
      setSolFormData(prev => ({ ...prev, nombre: agFound.nombre }));
      setSolIdHint({ text: '✓ Agencia encontrada', type: 'ok', found: true });
    } else {
      setSolFormData(prev => ({ ...prev, nombre: '' }));
      setSolIdHint({ text: val ? 'ID no encontrado' : '', type: 'err', found: val ? false : null });
    }
  };

  // Abrir drawer de solución desde un reclamo seleccionado
  const abrirSolucionDesdeReclamo = (reclamo) => {
    setSolFormData({
      ...initialSolucionState,
      empresa: reclamo.empresa || '',
      id: reclamo.id || '',
      nombre: reclamo.nombre || '',
      originRowId: reclamo.rowId || null
    });
    setSolIdHint({ text: '✓ Datos del reclamo cargados', type: 'ok', found: true });
    setIsSolucionando(true);
  };

  // Abrir drawer de solución nuevo (sin reclamo)
  const abrirNuevaSolucion = () => {
    setSolFormData(initialSolucionState);
    setSolIdHint({ text: '', type: '', found: null });
    setIsSolucionando(true);
  };

  const cerrarSolucion = () => {
    setIsSolucionando(false);
    setSolFormData(initialSolucionState);
    setSolIdHint({ text: '', type: '', found: null });
    setSolModalOpen(false);
  };

  // Preview de la solución
  const handleSolOpenModal = () => {
    if (!solFormData.empresa) return mostrarMensaje('Seleccioná la empresa.', 'error');
    if (!solFormData.trabajo || !solFormData.nombre) return mostrarMensaje('Completá los campos obligatorios.', 'error');

    const tecnicosArr = [solFormData.tecnico1, solFormData.tecnico2, solFormData.tecnico3].filter(Boolean);
    const tecnicosStr = tecnicosArr.join(', ') || '—';

    let lines = [];
    if (solFormData.id) lines.push(`ID: ${solFormData.id}`);
    lines.push(`NOMBRE: ${solFormData.nombre}`);
    lines.push(`SOLUCIÓN:\n${solFormData.trabajo}`);
    lines.push('');
    lines.push(`TÉCNICOS: ${tecnicosStr}`);

    setSolPreviewContent(lines.join('\n'));
    setSolModalOpen(true);
  };

  const handleSolCopy = useCallback(() => {
    navigator.clipboard.writeText(solPreviewContent).then(() => {
      setSolIsCopied(true);
      setTimeout(() => setSolIsCopied(false), 2000);
    });
  }, [solPreviewContent]);

  // Confirmar y guardar solución
  const handleSolConfirmSubmit = async (enviarWA = true) => {
    setSolIsSubmitting(true);
    try {
      await storageService.saveTarea({
        empresa: solFormData.empresa,
        id: solFormData.id,
        nombre: solFormData.nombre,
        trabajo: solFormData.trabajo,
        fecha: hoyISO(),
        hora_inicio: solFormData.horaInicio || null,
        hora_fin: solFormData.horaFin || null,
        tecnico1: solFormData.tecnico1 || '',
        tecnico2: solFormData.tecnico2 || '',
        tecnico3: solFormData.tecnico3 || '',
        observaciones: solFormData.observaciones || '',
        originRowId: solFormData.originRowId || null
      });

      setSolModalOpen(false);

      // Enviar por WhatsApp solo si enviarWA es true
      if (enviarWA) {
        const urlWA = `https://wa.me/?text=${encodeURIComponent(solPreviewContent)}`;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = urlWA;
        } else {
          window.open(urlWA, '_blank');
        }
      }

      mostrarMensaje(
        enviarWA 
          ? 'Solución registrada con éxito y abierta en WhatsApp.' 
          : 'Solución registrada localmente con éxito.', 
        'success'
      );
      cerrarSolucion();
      await fetchReclamos();
    } catch (err) {
      console.error('Error al guardar solución:', err);
      mostrarMensaje('Error al guardar la solución.', 'error');
    } finally {
      setSolIsSubmitting(false);
    }
  };

  return {
    reclamos: reclamosPaginados,
    reclamosFiltradosTotal: reclamosFiltrados.length,
    isLoading,
    mensaje,
    kpis,
    
    // Filtros
    searchQuery,
    setSearchQuery,
    filtroEstado,
    setFiltroEstado,
    filtroEmpresa,
    setFiltroEmpresa,
    
    // Paginación
    paginaActual,
    setPaginaActual,
    totalPaginas,

    // Detalle y ABM
    reclamoSeleccionado,
    setReclamoSeleccionado,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    activarEdicion,
    guardarEdicion,
    toggleEstado,
    eliminarReclamo,

    // Drawer de Creación
    isCreating,
    setIsCreating,
    formData,
    setFormData,
    idHint,
    isSubmitting,
    handleCreateChange,
    handleCreateEmpresaChange,
    handleCreateIdChange,
    handleCrearReclamo,
    fetchReclamos,

    // Drawer de Solución
    isSolucionando,
    setIsSolucionando,
    solFormData,
    solIdHint,
    solModalOpen,
    setSolModalOpen,
    solPreviewContent,
    solIsSubmitting,
    solIsCopied,
    handleSolChange,
    handleSolEmpresaChange,
    handleSolIdChange,
    handleSolOpenModal,
    handleSolCopy,
    handleSolConfirmSubmit,
    abrirSolucionDesdeReclamo,
    abrirNuevaSolucion,
    cerrarSolucion
  };
};
