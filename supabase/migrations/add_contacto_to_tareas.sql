-- ============================================================
-- Migración: Agregar columna `contacto` a la tabla `tareas`
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- ============================================================

ALTER TABLE tareas ADD COLUMN IF NOT EXISTS contacto TEXT;
