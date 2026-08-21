import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { storageService } from '../services/storageService';
import { formatearFechaTZ } from '../utils/timezone';

export const useMantenimientoForm = (userEmail = '', onModuloCerrado) => {
  // Estado principal
  const [empresa, setEmpresa] = useState('');
  const [empresaBloqueada, setEmpresaBloqueada] = useState(false);
  const [agenciasLista, setAgenciasLista] = useState([]); // [{ id, nombre, uuid }]
  const [observaciones, setObservaciones] = useState('');

  // Estado del input de búsqueda (agregar agencias)
  const [inputId, setInputId] = useState('');
  const [inputNombre, setInputNombre] = useState('');
  const [inputUuid, setInputUuid] = useState(null);
  const [idHint, setIdHint] = useState({ text: '', type: '', found: null });

  // Datos maestros
  const [agenciasDB, setAgenciasDB] = useState({});
  const [miPerfilId, setMiPerfilId] = useState(null);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Carga de datos maestros
  useEffect(() => {
    const cargarDatosMaestros = async () => {
      try {
        const { data: agData } = await supabase
          .from('agencias')
          .select('id, id_agencia, empresa, nombre')
          .eq('activa', true);

        if (agData) {
          const mapping = {};
          agData.forEach(ag => {
            const emp = String(ag.empresa).trim().toLowerCase();
            if (!mapping[emp]) mapping[emp] = {};
            mapping[emp][String(ag.id_agencia).trim()] = { uuid: ag.id, nombre: ag.nombre };
          });
          setAgenciasDB(mapping);
        }

        if (userEmail) {
          const { data: perfData } = await supabase
            .from('perfiles')
            .select('id')
            .eq('email', userEmail)
            .single();

          if (perfData) {
            setMiPerfilId(perfData.id);
          }
        }
      } catch (err) {
        console.error("Error cargando maestros mantenimiento:", err);
      }
    };
    cargarDatosMaestros();
  }, [userEmail]);

  // ── Handlers ──

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    setEmpresa(value);
    setAgenciasLista([]);
    setEmpresaBloqueada(false);
    limpiarInput();
  };

  const limpiarInput = () => {
    setInputId('');
    setInputNombre('');
    setInputUuid(null);
    setIdHint({ text: '', type: '', found: null });
  };

  const handleIdChange = (e) => {
    const val = e.target.value.trim();
    setInputId(val);
    setInputUuid(null);

    if (!empresa) {
      setIdHint({ text: '', type: '', found: null });
      return;
    }

    const empNorm = String(empresa).trim().toLowerCase();
    const agEncontrada = agenciasDB[empNorm]?.[val];

    if (agEncontrada) {
      // Verificar que no esté ya agregada
      const yaExiste = agenciasLista.some(a => a.id === val);
      if (yaExiste) {
        setInputNombre(agEncontrada.nombre);
        setInputUuid(null);
        setIdHint({ text: "⚠ Ya está en la lista", type: "err", found: false });
      } else {
        setInputNombre(agEncontrada.nombre);
        setInputUuid(agEncontrada.uuid);
        setIdHint({ text: "✓ Agencia encontrada — presioná Agregar", type: "ok", found: true });
      }
    } else {
      setInputNombre('');
      setInputUuid(null);
      setIdHint({ text: val ? "ID no encontrado" : "", type: "err", found: val ? false : null });
    }
  };

  const handleAgregarAgencia = () => {
    if (!inputUuid || !inputId || !inputNombre) return;

    const yaExiste = agenciasLista.some(a => a.id === inputId);
    if (yaExiste) {
      showMsg("Esa agencia ya está en la lista.", "error");
      return;
    }

    setAgenciasLista(prev => [...prev, { id: inputId, nombre: inputNombre, uuid: inputUuid }]);
    setEmpresaBloqueada(true);
    limpiarInput();
  };

  const handleQuitarAgencia = (idAgencia) => {
    setAgenciasLista(prev => {
      const nueva = prev.filter(a => a.id !== idAgencia);
      if (nueva.length === 0) {
        setEmpresaBloqueada(false);
      }
      return nueva;
    });
  };

  const handleObservacionesChange = (e) => {
    setObservaciones(e.target.value);
  };

  // ── Submit: guarda todas + abre WhatsApp ──

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!empresa) return showMsg("Seleccioná la empresa.", "error");
    if (agenciasLista.length === 0) return showMsg("Agregá al menos una agencia.", "error");

    setIsSubmitting(true);
    try {
      for (const ag of agenciasLista) {
        await storageService.saveMantenimiento({
          empresa,
          id: ag.id,
          uuid: ag.uuid,
          nombre: ag.nombre,
          observaciones: observaciones || null,
          perfilId: miPerfilId
        });
      }

      // Armar mensaje de WhatsApp
      const fecha = formatearFechaTZ(new Date());
      let lines = [];
      lines.push(`MANTENIMIENTO ${empresa.toUpperCase()}`);
      lines.push(`Fecha: ${fecha}`);
      lines.push('');
      agenciasLista.forEach(ag => {
        lines.push(`✅ ${ag.id} - ${ag.nombre}`);
      });
      if (observaciones) {
        lines.push('');
        lines.push(`Observaciones: ${observaciones}`);
      }

      const textoWA = lines.join('\n');
      const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(textoWA)}`;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = urlWhatsApp;
      } else {
        window.open(urlWhatsApp, '_blank');
      }

      showMsg(`${agenciasLista.length} agencias registradas con éxito`, "success");

      // Limpiar todo
      setAgenciasLista([]);
      setObservaciones('');
      setEmpresa('');
      setEmpresaBloqueada(false);
      limpiarInput();

      // Cerrar formulario tras 2 segundos
      setTimeout(() => {
        if (onModuloCerrado) onModuloCerrado();
      }, 2000);

    } catch (err) {
      console.error("Error guardando mantenimientos:", err);
      showMsg("Error al registrar los mantenimientos en el servidor.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    empresa,
    empresaBloqueada,
    agenciasLista,
    observaciones,
    inputId,
    inputNombre,
    inputUuid,
    idHint,
    isSubmitting,
    message,
    handleEmpresaChange,
    handleIdChange,
    handleAgregarAgencia,
    handleQuitarAgencia,
    handleObservacionesChange,
    handleSubmit
  };
};
