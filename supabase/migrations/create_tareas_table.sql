-- ============================================================
-- Migración: Crear tabla `tareas`
-- Módulo de asignación de tareas por encargados a técnicos.
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS tareas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agencia_id      UUID REFERENCES agencias(id),
  descripcion     TEXT NOT NULL,
  asignado_a      UUID REFERENCES perfiles(id),
  estado          TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'COMPLETADA')),
  creado_por      UUID REFERENCES perfiles(id),
  fecha_creacion  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_agencia ON tareas(agencia_id);

-- Row Level Security
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer tareas"
  ON tareas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear tareas"
  ON tareas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar tareas"
  ON tareas FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar tareas"
  ON tareas FOR DELETE
  USING (auth.role() = 'authenticated');
