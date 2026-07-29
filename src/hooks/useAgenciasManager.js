import { useState, useEffect, useMemo } from 'react';
import { fetchTodasLasAgencias, crearAgencia, actualizarAgencia, toggleEstadoAgencia } from '../services/agenciasService';

export const useAgenciasManager = () => {
    const [agencias, setAgencias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ text: '', type: '' });

    // Estados de control de búsqueda y paginación
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'alta', 'baja'
    const [paginaActual, setPaginaActual] = useState(1);
    const ITEMS_POR_PAGINA = 20;

    const mostrarMensaje = (text, type) => {
        setMensaje({ text, type });
        setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
    };

    const fetchAgencias = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTodasLasAgencias();
            setAgencias(data || []);
        } catch (error) {
            console.error("Error al cargar agencias:", error);
            mostrarMensaje("Error al cargar las agencias.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgencias();
    }, []);

    // Reiniciar a la página 1 cuando cambia el filtro o la búsqueda
    useEffect(() => {
        setPaginaActual(1);
    }, [searchQuery, filtroEstado]);

    // Filtrado de agencias en base a búsqueda y estado
    const agenciasFiltradas = useMemo(() => {
        return agencias.filter(ag => {
            // Filtro de estado
            if (filtroEstado === 'alta' && !ag.activa) return false;
            if (filtroEstado === 'baja' && ag.activa) return false;

            // Filtro de búsqueda (ID de agencia, Nombre o Empresa)
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase().trim();
                const matchesId = ag.id_agencia ? ag.id_agencia.toString().toLowerCase().includes(query) : false;
                const matchesNombre = ag.nombre ? ag.nombre.toLowerCase().includes(query) : false;
                const matchesEmpresa = ag.empresa ? ag.empresa.toLowerCase().includes(query) : false;
                return matchesId || matchesNombre || matchesEmpresa;
            }

            return true;
        });
    }, [agencias, searchQuery, filtroEstado]);

    // Paginación de agencias filtradas
    const totalPaginas = useMemo(() => {
        return Math.ceil(agenciasFiltradas.length / ITEMS_POR_PAGINA) || 1;
    }, [agenciasFiltradas]);

    const agenciasPaginadas = useMemo(() => {
        const indexInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        return agenciasFiltradas.slice(indexInicio, indexInicio + ITEMS_POR_PAGINA);
    }, [agenciasFiltradas, paginaActual]);

    // Crear una nueva agencia
    const agregarNuevaAgencia = async (nuevaAg) => {
        if (!nuevaAg.id_agencia || !nuevaAg.nombre || !nuevaAg.empresa) {
            mostrarMensaje("ID, Nombre y Empresa son obligatorios.", "error");
            return false;
        }

        setIsLoading(true);
        try {
            await crearAgencia(nuevaAg);
            mostrarMensaje("Agencia creada con éxito.", "success");
            await fetchAgencias();
            return true;
        } catch (error) {
            console.error("Error agregando agencia:", error);
            mostrarMensaje(`Error al crear: ${error.message || 'Error del servidor'}`, "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar datos de una agencia
    const guardarDetallesAgencia = async (id, datosActualizados) => {
        if (!datosActualizados.id_agencia || !datosActualizados.nombre || !datosActualizados.empresa) {
            mostrarMensaje("ID, Nombre y Empresa son obligatorios.", "error");
            return false;
        }

        setIsLoading(true);
        try {
            await actualizarAgencia(id, datosActualizados);
            mostrarMensaje("Agencia actualizada con éxito.", "success");
            await fetchAgencias();
            return true;
        } catch (error) {
            console.error("Error al actualizar agencia:", error);
            mostrarMensaje("Error al actualizar la agencia.", "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Dar de alta o baja (toggle estado)
    const toggleEstado = async (id, estadoActual) => {
        setIsLoading(true);
        try {
            await toggleEstadoAgencia(id, estadoActual);
            mostrarMensaje(estadoActual ? "Agencia dada de baja (Inactiva)." : "Agencia dada de alta (Activa).", "success");
            await fetchAgencias();
            return true;
        } catch (error) {
            console.error("Error cambiando estado:", error);
            mostrarMensaje("Error al cambiar el estado de la agencia.", "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener estadísticas rápidas
    const estadisticas = useMemo(() => {
        const total = agencias.length;
        const activas = agencias.filter(a => a.activa).length;
        const inactivas = total - activas;
        const totalAlfa = agencias.filter(a => a.empresa && a.empresa.toLowerCase().trim() === 'alfa').length;
        const totalPalpitos = agencias.filter(a => a.empresa && a.empresa.toLowerCase().trim() === 'palpitos').length;
        const totalTucuApuestas = agencias.filter(a => a.empresa && a.empresa.toLowerCase().trim() === 'tucuapuestas').length;
        return { total, activas, inactivas, totalAlfa, totalPalpitos, totalTucuApuestas };
    }, [agencias]);

    return {
        agencias: agenciasPaginadas,
        totalFiltrado: agenciasFiltradas.length,
        isLoading,
        mensaje,
        searchQuery,
        setSearchQuery,
        filtroEstado,
        setFiltroEstado,
        paginaActual,
        setPaginaActual,
        totalPaginas,
        agregarNuevaAgencia,
        guardarDetallesAgencia,
        toggleEstado,
        estadisticas
    };
};
