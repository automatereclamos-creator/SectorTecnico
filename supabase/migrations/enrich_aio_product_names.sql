-- =========================================================================================
-- MIGRATION: Enrich Generic Product Names (AIO / CPU) using especificaciones JSONB data
-- DESCRIPTION: This script updates the "producto" column of the "equipos" table
--              when the product is generically named (e.g., "AIO", "CPU") but has useful
--              information in the "especificaciones" JSONB column (procesador, disco).
--              Only generic names are updated; existing descriptive names are not altered.
-- =========================================================================================

UPDATE equipos
SET 
  producto = CASE 
    WHEN (especificaciones->>'procesador' IS NOT NULL AND especificaciones->>'procesador' != '-' AND 
          especificaciones->>'disco' IS NOT NULL AND especificaciones->>'disco' != '-') 
      THEN producto || ' (' || (especificaciones->>'procesador') || ' / ' || (especificaciones->>'disco') || ')'
    
    WHEN (especificaciones->>'procesador' IS NOT NULL AND especificaciones->>'procesador' != '-') 
      THEN producto || ' (' || (especificaciones->>'procesador') || ')'
      
    WHEN (especificaciones->>'disco' IS NOT NULL AND especificaciones->>'disco' != '-') 
      THEN producto || ' (' || (especificaciones->>'disco') || ')'
      
    ELSE producto 
  END
WHERE 
  -- Only target explicitly generic products
  (producto = 'AIO' OR producto = 'CPU')
  AND 
  -- And only update if there is actual useful data in JSONB to prevent appending empty parentheses
  (
    (especificaciones->>'procesador' IS NOT NULL AND especificaciones->>'procesador' != '-') OR 
    (especificaciones->>'disco' IS NOT NULL AND especificaciones->>'disco' != '-')
  );
