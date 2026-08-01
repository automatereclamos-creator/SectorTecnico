import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useUsuariosManager = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ text: '', type: '' });

    const ROLES_DISPONIBLES = ['admin', 'encargado', 'encargado_stock', 'auditor', 'soporte', 'tecnico', 'mantenimiento'];

    const mostrarMensaje = (text, type) => {
        setMensaje({ text, type });
        setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
    };

    const fetchUsuarios = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .order('activo', { ascending: false }) // Los activos primero
                .order('nombre_completo', { ascending: true });

            if (error) throw error;
            setUsuarios(data || []);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            mostrarMensaje("Error al cargar los usuarios.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const agregarUsuario = async (nuevoUsuario) => {
        if (!nuevoUsuario.email || !nuevoUsuario.nombre_completo || !nuevoUsuario.rol) {
            return mostrarMensaje("Completá todos los campos.", "error");
        }

        setIsLoading(true);
        try {
            // Nota: Si usás Supabase Auth, idealmente el ID del perfil debe coincidir con el Auth ID.
            // Acá insertamos el perfil directo en la tabla para la gestión interna.
            const { error } = await supabase.from('perfiles').insert([{
                email: nuevoUsuario.email.trim().toLowerCase(),
                nombre_completo: nuevoUsuario.nombre_completo,
                rol: nuevoUsuario.rol,
                activo: true
            }]);

            if (error) throw error;

            mostrarMensaje("Usuario agregado exitosamente.", "success");
            fetchUsuarios();
            return true; // Para limpiar el formulario visualmente
        } catch (error) {
            console.error("Error agregando usuario:", error);
            mostrarMensaje(`Error: ${error.message}`, "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const actualizarRol = async (id, nuevoRol) => {
        try {
            const { error } = await supabase.from('perfiles').update({ rol: nuevoRol }).eq('id', id);
            if (error) throw error;
            mostrarMensaje("Rol actualizado.", "success");
            fetchUsuarios();
        } catch (error) {
            console.error("Error actualizando rol:", error);
            mostrarMensaje("Error al actualizar el rol.", "error");
        }
    };

    const toggleEstado = async (id, estadoActual) => {
        try {
            const { error } = await supabase.from('perfiles').update({ activo: !estadoActual }).eq('id', id);
            if (error) throw error;
            mostrarMensaje(estadoActual ? "Usuario dado de baja (Inactivo)." : "Usuario reactivado.", "success");
            fetchUsuarios();
        } catch (error) {
            console.error("Error cambiando estado:", error);
            mostrarMensaje("Error al cambiar el estado.", "error");
        }
    };

    return {
        usuarios,
        isLoading,
        mensaje,
        ROLES_DISPONIBLES,
        fetchUsuarios,
        agregarUsuario,
        actualizarRol,
        toggleEstado
    };
};