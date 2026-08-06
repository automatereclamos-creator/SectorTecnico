import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getCalculatedTotal } from '../utils/timeUtils';
import { useMateriales } from './useMateriales';
import { fetchBomTemplates, getBomKey } from '../services/bomService';
import { storageService } from '../services/storageService';

export const useTaskForm = (userEmail = '') => {
  const initialFormState = {
    empresa: '',
    id: '',
    agencia_uuid: null,
    nombre: '',
    fecha: new Date().toISOString().split("T")[0],
    trabajo: '',
    horaInicio: '',
    horaFin: '',
    tecnico1: '',
    tecnico2: '',
    tecnico3: '',
    observaciones: '',
    originRowId: null,
    originTareaId: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [reclamosPendientes, setReclamosPendientes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [idHint, setIdHint] = useState({ text: '', type: '', found: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [agenciasDB, setAgenciasDB] = useState({});
  const [perfilesDB, setPerfilesDB] = useState({});
  const [miPerfilId, setMiPerfilId] = useState(null);
  const [equiposEnAgencia, setEquiposEnAgencia] = useState([]);
  const [bomTemplates, setBomTemplates] = useState({});

  const totalObj = getCalculatedTotal(formData.horaInicio, formData.horaFin);
  const { materiales, addMaterial, removeMaterial, handleMaterialChange, resetMateriales, matError } = useMateriales();

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  useEffect(() => {
    const cargarDatosMaestros = async () => {
      try {
        const { data: agData } = await supabase.from('agencias').select('id, id_agencia, empresa, nombre').eq('activa', true);
        if (agData) {
          const mapping = {};
          agData.forEach(ag => {
            const emp = String(ag.empresa).trim().toLowerCase();
            if (!mapping[emp]) mapping[emp] = {};
            mapping[emp][String(ag.id_agencia).trim()] = { uuid: ag.id, nombre: ag.nombre };
          });
          setAgenciasDB(mapping);
        }

        const { data: perfData } = await supabase.from('perfiles').select('id, email, nombre_completo').eq('activo', true);
        if (perfData) {
          const mappingPerf = {};
          perfData.forEach(p => {
            mappingPerf[p.nombre_completo] = p.id;
            if (p.email === userEmail) {
              setMiPerfilId(p.id);
              setFormData(prev => ({ ...prev, tecnico1: p.nombre_completo }));
            }
          });
          setPerfilesDB(mappingPerf);
        }

        // Cargar plantillas BOM desde BD
        const templates = await fetchBomTemplates();
        setBomTemplates(templates);
      } catch (err) {
        console.error("Error cargando maestros:", err);
      }
    };
    cargarDatosMaestros();
  }, [userEmail]);

  const fetchReclamos = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('reclamos')
        .select(`id, falla_reportada, telefono, estado, fecha_carga, agencias ( id, id_agencia, empresa, nombre )`)
        .eq('estado', 'PENDIENTE')
        .order('fecha_carga', { ascending: false });

      if (data) {
        setReclamosPendientes(data.map(r => ({
          rowId: r.id, id: r.agencias?.id_agencia, empresa: r.agencias?.empresa,
          nombre: r.agencias?.nombre, agencia_uuid: r.agencias?.id,
          informa: r.falla_reportada, telefono: r.telefono, carga: r.usuario || 'Agente'
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTareas = async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getTareasPendientes();
      setTareasPendientes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamos();
    fetchTareas();
  }, []);

  useEffect(() => {
    const autoSelect = localStorage.getItem('autoSelectTask');
    if (autoSelect && !isLoading) {
      try {
        const parsed = JSON.parse(autoSelect);
        if (parsed.tipo === 'reclamo') {
          const found = reclamosPendientes.find(r => r.rowId === parsed.rowId);
          if (found) {
            setTimeout(() => handleSelectReclamo(found), 100);
          }
        } else {
          const found = tareasPendientes.find(t => t.rowId === parsed.rowId);
          if (found) {
            setTimeout(() => handleSelectTarea(found), 100);
          }
        }
        localStorage.removeItem('autoSelectTask');
      } catch (e) {
        console.error('Error auto-selecting task:', e);
      }
    }
  }, [isLoading, reclamosPendientes, tareasPendientes]);

  useEffect(() => {
    const fetchEquipos = async () => {
      if (!formData.agencia_uuid) return setEquiposEnAgencia([]);
      const { data } = await supabase.from('equipos')
        .select('id, categoria, producto, marca, serie_fabricante, equipo_padre_id, especificaciones')
        .eq('agencia_id', formData.agencia_uuid)
        .eq('estado', 'INSTALADO');
      setEquiposEnAgencia(data || []);
    };
    fetchEquipos();
  }, [formData.agencia_uuid]);

  const handleSelectReclamo = (reclamo) => {
    setFormData({
      ...initialFormState,
      empresa: reclamo.empresa || '', id: reclamo.id || '',
      nombre: reclamo.nombre || '', agencia_uuid: reclamo.agencia_uuid || null,
      originRowId: reclamo.rowId || null, originTareaId: null, tecnico1: formData.tecnico1
    });
    resetMateriales();
    setIdHint({ text: "✓ Datos del reclamo cargados", type: "ok", found: true });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTarea = (tarea) => {
    setFormData({
      ...initialFormState,
      empresa: tarea.empresa || '', id: tarea.id || '',
      nombre: tarea.nombre || '', agencia_uuid: tarea.agencia_uuid || null,
      originRowId: null, originTareaId: tarea.rowId || null,
      trabajo: ``,
      tecnico1: formData.tecnico1
    });
    resetMateriales();
    setIdHint({ text: "✓ Datos de la tarea cargados", type: "ok", found: true });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNuevaSolucion = () => {
    setFormData(prev => ({ ...initialFormState, tecnico1: prev.tecnico1 }));
    resetMateriales();
    setIdHint({ text: '', type: '', found: null });
    setIsFormVisible(true);
  };

  const handleCancelarFormulario = () => {
    setIsFormVisible(false);
    setFormData(prev => ({ ...initialFormState, tecnico1: prev.tecnico1 }));
    resetMateriales();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, empresa: value, id: '', nombre: '', agencia_uuid: null }));
    setIdHint({ text: '', type: '', found: null });
  };

  const handleIdChange = (e) => {
    const val = e.target.value.trim();
    setFormData(prev => ({ ...prev, id: val, agencia_uuid: null }));

    if (!formData.empresa) {
      setIdHint({ text: '', type: '', found: null });
      return;
    }

    const empNorm = String(formData.empresa).trim().toLowerCase();
    const agEncontrada = agenciasDB[empNorm]?.[val];

    if (agEncontrada) {
      setFormData(prev => ({ ...prev, nombre: agEncontrada.nombre, agencia_uuid: agEncontrada.uuid }));
      setIdHint({ text: "✓ Agencia encontrada", type: "ok", found: true });
    } else {
      setFormData(prev => ({ ...prev, nombre: "", agencia_uuid: null }));
      setIdHint({ text: val ? "ID no encontrado" : "", type: "err", found: val ? false : null });
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(previewContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [previewContent]);

  const handleOpenModal = () => {
    if (!formData.empresa) return showMsg("Seleccioná la empresa.", "error");
    if (!formData.trabajo || !formData.nombre) return showMsg("Completá los campos obligatorios.", "error");

    const tecnicosArr = [formData.tecnico1, formData.tecnico2, formData.tecnico3].filter(Boolean);
    const tecnicosStr = tecnicosArr.join(", ") || "—";

    let lines = [];
    if (formData.id) lines.push(`ID: ${formData.id}`);
    lines.push(`NOMBRE: ${formData.nombre}`);
    lines.push(`SOLUCIÓN:\n${formData.trabajo}`);

    if (materiales.length > 0) {
      lines.push(``);
      materiales.forEach(m => {
        if (m.tipo === 'AGREGAR') {
          const serie = (m.pide_serie && m.in_serie) ? ` [SN: ${m.prefijo_serie}${m.in_serie}]` : '';
          lines.push(`- ALTA: 1x ${m.in_nombre || m.in_codigo}${serie}`);
        } else if (m.tipo === 'QUITAR') {
          const eq = equiposEnAgencia.find(e => e.id === m.out_equipo_id);
          const nom = eq ? `${eq.producto}` : 'Equipo retirado';
          const ser = eq && eq.serie_fabricante ? ` [${eq.equipo_padre_id ? 'Term' : 'SN'}: ${eq.serie_fabricante}]` : '';
          lines.push(`- BAJA: 1x ${nom}${ser}`);
        } else if (m.tipo === 'CAMBIAR') {
          const eq = equiposEnAgencia.find(e => e.id === m.out_equipo_id);
          const nomOut = eq ? `${eq.producto}` : 'Equipo retirado';
          const serOut = eq && eq.serie_fabricante ? ` [${eq.equipo_padre_id ? 'Term' : 'SN'}: ${eq.serie_fabricante}]` : '';
          const serieIn = (m.pide_serie && m.in_serie) ? ` [SN: ${m.prefijo_serie}${m.in_serie}]` : '';
          const nomIn = m.in_nombre || m.in_codigo;
          lines.push(`- CAMBIO: Salió ${nomOut}${serOut} -> Entró ${nomIn}${serieIn}`);
        }
      });
    }

    lines.push(``);
    lines.push(`TÉCNICOS: ${tecnicosStr}`);
    setPreviewContent(lines.join("\n"));
    setModalOpen(true);
    window.scrollTo(0, 0);
  };

  const handleConfirmSubmit = async () => {
    if (!formData.agencia_uuid) return showMsg("Agencia no válida en DB. Verifique el ID.", "error");

    setIsSubmitting(true);
    try {
      const { data: ofiTecnica } = await supabase.from('agencias').select('id').eq('id_agencia', '1213').single();
      const uuidOficinaTecnica = ofiTecnica ? ofiTecnica.id : null;

      const { data: solData, error: solError } = await supabase.from('soluciones').insert([{
        agencia_id: formData.agencia_uuid,
        reclamo_id: formData.originRowId || null,
        trabajo_realizado: formData.trabajo,
        fecha: formData.fecha,
        hora_inicio: formData.horaInicio || null,
        hora_fin: formData.horaFin || null,
        total_horas: totalObj?.text || null,
        observaciones: formData.observaciones || null,
        creado_por: miPerfilId || null
      }]).select('id').single();

      if (solError) throw solError;
      const nuevaSolId = solData.id;

      if (materiales.length > 0) {
        for (const m of materiales) {

          if (m.tipo === 'AGREGAR' || m.tipo === 'CAMBIAR') {
            const serieFull = (m.pide_serie && m.prefijo_serie && m.in_serie) ? `${m.prefijo_serie}${m.in_serie}` : (m.in_serie || null);

            const especificaciones = {};
            if (m.pide_nro && m.in_nro_terminal) especificaciones.nro_terminal = `${m.prefijo_nro}${m.in_nro_terminal}`;
            if (m.pide_componentes) {
              especificaciones.procesador = m.in_procesador;
              especificaciones.disco = m.in_disco;
            }

            await supabase.from('soluciones_insumos').insert([{
              solucion_id: nuevaSolId,
              insumo_codigo: m.in_codigo,
              cantidad: parseInt(m.in_cantidad) || 1,
              estado: 'ALTA',
              condicion: m.in_condicion,
              serie: serieFull
            }]);

            const { data: nEq } = await supabase.from('equipos').insert([{
              agencia_id: formData.agencia_uuid,
              categoria: m.in_familia,
              producto: m.in_nombre || m.in_codigo,
              marca: m.in_marca,
              serie_fabricante: serieFull,
              estado: 'INSTALADO',
              especificaciones: Object.keys(especificaciones).length > 0 ? especificaciones : {}
            }]).select('id').single();

            if (nEq) {
              await supabase.from('movimientos_equipos').insert([{
                equipo_id: nEq.id,
                solucion_id: nuevaSolId,
                agencia_id: formData.agencia_uuid,
                tipo: 'ALTA',
                condicion: m.in_condicion,
                creado_por: miPerfilId
              }]);

              // ── Auto-BOM: Inserción de Hijos desde BD ──
              const bomKey = getBomKey(m.in_familia);

              if (bomKey && bomTemplates[bomKey]) {
                const hijosParaInsertar = bomTemplates[bomKey].map(hijo => ({
                  agencia_id: formData.agencia_uuid,
                  categoria: hijo.categoria,
                  producto: hijo.producto,
                  estado: 'INSTALADO',
                  equipo_padre_id: nEq.id
                }));

                const { data: hijosInsertados } = await supabase.from('equipos').insert(hijosParaInsertar).select('id');

                if (hijosInsertados && hijosInsertados.length > 0) {
                  const movimientosHijos = hijosInsertados.map(hijo => ({
                    equipo_id: hijo.id,
                    solucion_id: nuevaSolId,
                    agencia_id: formData.agencia_uuid,
                    tipo: 'ALTA',
                    condicion: 'NUEVO',
                    creado_por: miPerfilId,
                    observaciones: `Auto-BOM: Componente interno de ${m.in_nombre || m.in_codigo}`
                  }));
                  await supabase.from('movimientos_equipos').insert(movimientosHijos);
                }
              }
            }
          }

          if (m.tipo === 'QUITAR' || m.tipo === 'CAMBIAR') {
            if (m.out_equipo_id) {
              const updateData = { estado: 'EN TALLER', actualizado_en: new Date().toISOString() };
              if (uuidOficinaTecnica) updateData.agencia_id = uuidOficinaTecnica;

              await supabase.from('equipos').update(updateData).eq('id', m.out_equipo_id);

              await supabase.from('movimientos_equipos').insert([{
                equipo_id: m.out_equipo_id,
                solucion_id: nuevaSolId,
                agencia_id: formData.agencia_uuid,
                tipo: 'BAJA',
                condicion: 'USADO',
                creado_por: miPerfilId
              }]);

              if (uuidOficinaTecnica) {
                await supabase.from('movimientos_equipos').insert([{
                  equipo_id: m.out_equipo_id,
                  solucion_id: nuevaSolId,
                  agencia_id: uuidOficinaTecnica,
                  tipo: 'ALTA',
                  condicion: 'USADO',
                  observaciones: 'Ingreso a Oficina Técnica por retiro',
                  creado_por: miPerfilId
                }]);
              }

              // ── Cascada BAJA: Mover hijos junto con el padre ──
              const { data: hijosDelPadre } = await supabase.from('equipos')
                .select('id')
                .eq('equipo_padre_id', m.out_equipo_id)
                .eq('estado', 'INSTALADO');

              if (hijosDelPadre && hijosDelPadre.length > 0) {
                const idsHijos = hijosDelPadre.map(h => h.id);

                // Mover hijos a EN TALLER
                await supabase.from('equipos')
                  .update(updateData)
                  .in('id', idsHijos);

                // Registrar movimientos de BAJA para cada hijo
                const movBajaHijos = idsHijos.map(hijoId => ({
                  equipo_id: hijoId,
                  solucion_id: nuevaSolId,
                  agencia_id: formData.agencia_uuid,
                  tipo: 'BAJA',
                  condicion: 'USADO',
                  observaciones: 'Cascada: retirado junto con equipo padre',
                  creado_por: miPerfilId
                }));
                await supabase.from('movimientos_equipos').insert(movBajaHijos);

                if (uuidOficinaTecnica) {
                  const movAltaHijos = idsHijos.map(hijoId => ({
                    equipo_id: hijoId,
                    solucion_id: nuevaSolId,
                    agencia_id: uuidOficinaTecnica,
                    tipo: 'ALTA',
                    condicion: 'USADO',
                    observaciones: 'Cascada: ingreso a Oficina Técnica con equipo padre',
                    creado_por: miPerfilId
                  }));
                  await supabase.from('movimientos_equipos').insert(movAltaHijos);
                }
              }
            }
          }
        }
      }

      const techs = [formData.tecnico1, formData.tecnico2, formData.tecnico3].filter(Boolean).map(n => ({ solucion_id: nuevaSolId, perfil_id: perfilesDB[n] })).filter(t => t.perfil_id);
      if (techs.length > 0) await supabase.from('soluciones_tecnicos').insert(techs);

      if (formData.originRowId) await supabase.from('reclamos').update({ estado: 'SOLUCIONADO' }).eq('id', formData.originRowId);
      if (formData.originTareaId) await supabase.from('tareas').update({ estado: 'COMPLETADA' }).eq('id', formData.originTareaId);

      setModalOpen(false);
      const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(previewContent)}`;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = urlWhatsApp;
      } else {
        window.open(urlWhatsApp, '_blank');
      }

      setFormData(prev => ({ ...initialFormState, tecnico1: prev.tecnico1 }));
      resetMateriales();
      setIsFormVisible(false);
      fetchReclamos();
      fetchTareas();

    } catch (err) {
      console.error("Error en DB:", err);
      showMsg("Error al guardar en la base de datos.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, reclamosPendientes, tareasPendientes, idHint, modalOpen, previewContent, isSubmitting, isLoading, isCopied, message, totalObj,
    isFormVisible, handleNuevaSolucion, handleCancelarFormulario, fetchReclamos, fetchTareas,
    handleChange, handleEmpresaChange, handleIdChange, handleOpenModal, setModalOpen, handleCopy, handleConfirmSubmit, handleSelectReclamo, handleSelectTarea,
    materiales, addMaterial, removeMaterial, handleMaterialChange, matError, equiposEnAgencia
  };
};