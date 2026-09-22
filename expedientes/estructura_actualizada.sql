CREATE TABLE catalogo_expediente (
    id_expediente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_dato VARCHAR(255) NOT NULL,
    historial BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla: campo_expediente
-- Almacena los valores reales de cada empleado para cada campo del expediente
CREATE TABLE campo_expediente (
    id_campo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_expediente INT NOT NULL,
    valor TEXT NULL,
    fecha_actualizacion DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado)
        REFERENCES info_empleados(id_empleado)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_expediente)
        REFERENCES catalogo_expediente(id_expediente)
        ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE (id_empleado, id_expediente)
);

-- Tabla: historial_expediente
-- Guarda el historial de cambios cuando un campo tiene activada la opción de historial
CREATE TABLE historial_expediente (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_campo INT NOT NULL,
    valor TEXT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_campo)
        REFERENCES campo_expediente(id_campo)
        ON UPDATE CASCADE ON DELETE CASCADE
);