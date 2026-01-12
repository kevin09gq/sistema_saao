-- Script para agregar la columna 'anio' a la tabla nomina_confianza
-- Ejecutar este script en tu base de datos MySQL

-- Paso 1: Agregar la columna anio después de id_empresa
ALTER TABLE nomina_confianza
ADD COLUMN anio INT NOT NULL DEFAULT 2026 AFTER id_empresa;

-- Paso 2 (OPCIONAL): Si ya tienes datos, actualizar con el año actual
-- UPDATE nomina_confianza
-- SET anio = 2026
-- WHERE anio = 2026;

-- Paso 3: Verificar la estructura de la tabla
DESCRIBE nomina_confianza;

-- La tabla ahora debería tener esta estructura:
-- +----------------------+--------------+------+-----+---------+----------------+
-- | Field                | Type         | Null | Key | Default | Extra          |
-- +----------------------+--------------+------+-----+---------+----------------+
-- | id_nomina_confianza  | int          | NO   | PRI | NULL    | auto_increment |
-- | id_empresa           | int          | NO   | MUL | NULL    |                |
-- | anio                 | int          | NO   |     | 2026    |                |
-- | numero_semana        | int          | NO   |     | NULL    |                |
-- | nomina               | longtext     | NO   |     | NULL    |                |
-- +----------------------+--------------+------+-----+---------+----------------+
