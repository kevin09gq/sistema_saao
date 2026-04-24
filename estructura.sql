-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS sistema_nomina;

USE sistema_nomina;

-- =============================
-- TABLAS PARA LA EMPRESA, AREAS, DEPARTAMENTOS Y PUESTOS ESPECIALES    
-- =============================

-- Crear tabla empresa
CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    logo_empresa VARCHAR(200) NULL,
    rfc_empresa VARCHAR(12) NULL,
    domicilio_fiscal VARCHAR(200) NULL,
    marca_empresa VARCHAR(200) NULL
);

-- Crear tabla areas
CREATE TABLE areas (
    id_area int(11) NOT NULL AUTO_INCREMENT,
    nombre_area varchar(100) NOT NULL,
    logo_area varchar(200) DEFAULT NULL,
    PRIMARY KEY (id_area)
);

-- Crear tabla departamentos
CREATE TABLE departamentos (
    id_departamento int(11) NOT NULL AUTO_INCREMENT,
    nombre_departamento varchar(100) NOT NULL,
    PRIMARY KEY (id_departamento)    
);

-- Crear tabla puestos_especiales
CREATE TABLE puestos_especiales (
    id_puestoEspecial int(11) NOT NULL AUTO_INCREMENT,
    nombre_puesto varchar(100) NOT NULL,
    direccion_puesto varchar(200) DEFAULT NULL,
    color_hex varchar(7) DEFAULT NULL,
    PRIMARY KEY (id_puestoEspecial)
);

-- Crear tabla relacion areas_departamentos
CREATE TABLE areas_departamentos (
    id_area_departamento INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    id_departamento INT NOT NULL,
    FOREIGN KEY (id_area) REFERENCES areas (id_area) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla relacion departamentos_puestos
CREATE TABLE  departamentos_puestos (
    id_departamento_puesto int(11) NOT NULL AUTO_INCREMENT,
    id_departamento int(11) DEFAULT NULL,
    id_puestoEspecial int(11) DEFAULT NULL,
    PRIMARY KEY (id_departamento_puesto),
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales (id_puestoEspecial) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla info_ranchos 
CREATE TABLE info_ranchos (
    id_info_rancho INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    horario_jornalero LONGTEXT NOT NULL,
    num_arboles INT NOT NULL,
    FOREIGN KEY (id_area)
    REFERENCES areas(id_area) ON UPDATE CASCADE ON DELETE CASCADE
);


-- =============================
-- TABLAS DE ADMINISTRACION DE USUARIOS
-- =============================

-- Crear tabla usuarios
CREATE TABLE status (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nombre_status VARCHAR(50) NOT NULL
);

-- Crear tabla rol
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE info_admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    correo VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE CASCADE
);


-- =============================
-- TABLAS DE EMPLEADOS
-- =============================

-- Crear tabla info_empleados
CREATE TABLE info_empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_status INT NOT NULL,
    clave_empleado VARCHAR(20) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    ap_paterno VARCHAR(50) NOT NULL,
    ap_materno VARCHAR(50) NOT NULL,
    domicilio VARCHAR(150),
    imss VARCHAR(20),
    curp VARCHAR(20),
    sexo ENUM('M','F'),
    enfermedades_alergias VARCHAR(150),
    grupo_sanguineo VARCHAR(5),
    fecha_nacimiento DATE,
    fecha_ingreso DATE,
    ruta_foto VARCHAR(255),
    fecha_creacion DATE,
    fecha_vigencia DATE,
    salario_semanal DECIMAL(10,2) DEFAULT 0,
    salario_diario DECIMAL(10,2) DEFAULT 0,
    id_puestoEspecial INT,
    id_departamento INT,
    id_area INT,
    id_empresa INT,
    biometrico INT,
    telefono_empleado VARCHAR(15),
    status_nss TINYINT(1) DEFAULT 0,
    rfc_empleado VARCHAR(13),
    estado_civil VARCHAR(50),
    horario_fijo TINYINT(1) DEFAULT 1
    
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_status) REFERENCES status(id_status) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales(id_puestoESpecial) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_area) REFERENCES areas(id_area) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla horarios_oficiales
CREATE TABLE horarios_oficiales (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario_oficial LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
);


-- =============================
-- TABLAS DE BENEFICIARIOS Y 
-- CONTACTOS DE EMERGENCIA DEL EMPLEADO
-- =============================

CREATE TABLE beneficiarios (
    id_beneficiario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100)
);

CREATE TABLE contacto_emergencia (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    telefono VARCHAR(20),
    domicilio VARCHAR(900)
);

-- Crear tabla relacion empleado_beneficiario
CREATE TABLE empleado_beneficiario (
    id_empleado_beneficiario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_beneficiario INT NOT NULL,
    parentesco VARCHAR(100),
    porcentaje DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_beneficiario) REFERENCES beneficiarios(id_beneficiario) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla relacion empleado_contacto
CREATE TABLE empleado_contacto (
    id_empleado_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_contacto INT NOT NULL,
    parentesco VARCHAR(100),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_contacto) REFERENCES contacto_emergencia(id_contacto) ON UPDATE CASCADE ON DELETE CASCADE
);



-- =============================
-- TABLA HISTORIAL DE REINGRESOS/SALIDAS
-- =============================

-- Crear tabla historial_reingresos 
CREATE TABLE historial_reingresos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha_reingreso DATE NOT NULL,
    fecha_salida DATE NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLA ASIGNACION DE CASILLEROS
-- =============================

-- Crear tabla casilleros
CREATE TABLE casilleros (
  num_casillero varchar(50) PRIMARY KEY 
);

-- Crear tabla empleado_casillero
CREATE TABLE empleado_casillero (
    id_empleado INT NOT NULL,
    num_casillero VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (num_casillero) REFERENCES casilleros(num_casillero) ON UPDATE CASCADE ON DELETE CASCADE
);


-- =============================
-- TABLAS DE TURNOS Y FESTIVIDADES 
-- =============================

-- Crear tabla turnos
CREATE TABLE turnos (
  id_turno INT PRIMARY KEY AUTO_INCREMENT,
  descripcion VARCHAR (30) NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  max DECIMAL(10,2) NOT NULL
);

-- Crear tabla festividades
CREATE TABLE festividades (
  id_festividad INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (100),
  fecha DATE,
  tipo ENUM('NACIONAL', 'LOCAL', 'INTERNO') DEFAULT 'NACIONAL',
  observacion VARCHAR(100) NULL
);

-- ============================
-- TABLA DE AUTORIZACIONES
-- ============================

CREATE TABLE claves_autorizacion (
  id_autorizacion int(11) NOT NULL AUTO_INCREMENT,
  id_empleado int(11) NOT NULL,
  clave varchar(200) NOT NULL,
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_autorizacion),
  FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE historiales_autorizaciones (
  id int(11) NOT NULL AUTO_INCREMENT,
  id_clave int(11) NOT NULL,
  motivo text NOT NULL,
  fecha datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  FOREIGN KEY (id_clave) REFERENCES claves_autorizacion (id_autorizacion) ON DELETE CASCADE ON UPDATE CASCADE
);


-- =============================
-- TABLAS DE PRÉSTAMOS
-- =============================

-- Crear tabla prestamos
CREATE TABLE prestamos (
  id_prestamo int(11) NOT NULL AUTO_INCREMENT,
  id_empleado int(11) NOT NULL,
  folio varchar(100) NOT NULL,
  monto decimal(10,2) NOT NULL,
  semana int(11) NOT NULL,
  anio int(11) NOT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  estado enum('activo','liquidado','pausado') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (id_prestamo),
  FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON DELETE CASCADE
);

-- Crear tabla prestamos_abonos
CREATE TABLE prestamos_abonos (
  id_abono int(11) NOT NULL AUTO_INCREMENT,
  id_prestamo int(11) NOT NULL,
  monto_pago decimal(10,2) NOT NULL,
  num_sem_pago int(11) NOT NULL,
  anio_pago int(11) NOT NULL,
  fecha_pago datetime NOT NULL DEFAULT current_timestamp(),
  es_nomina tinyint(1) NOT NULL DEFAULT 1,
  pausado tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_abono),
  FOREIGN KEY (id_prestamo) REFERENCES prestamos (id_prestamo) ON DELETE CASCADE
);

-- Crear tabla planes_pagos
CREATE TABLE planes_pagos (
  id_plan int(11) NOT NULL AUTO_INCREMENT,
  id_prestamo int(11) NOT NULL,
  sem_inicio int(11) NOT NULL,
  anio_inicio int(11) NOT NULL,
  sem_fin int(11) NOT NULL,
  anio_fin int(11) NOT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_plan),
  FOREIGN KEY (id_prestamo) REFERENCES prestamos (id_prestamo) ON DELETE CASCADE
);

-- Crear tabla detalle_planes
CREATE TABLE detalle_planes (
  id_detalle int(11) NOT NULL AUTO_INCREMENT,
  id_plan int(11) NOT NULL,
  detalle longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_detalle),
  FOREIGN KEY (id_plan) REFERENCES planes_pagos (id_plan) ON DELETE CASCADE,
  CONSTRAINT detalle_planes_chk_1 CHECK (json_valid(detalle))
);

-- =============================
-- TABLA DE AGUINALDOS
-- =============================


CREATE TABLE aguinaldos (
  id_aguinaldo INT NOT NULL,
  jsonAguinaldo LONGTEXT NOT NULL,
  anio INT NOT NULL,
  fecha_creacion DATETIME NOT NULL
) ;

-- =============================
-- TABLA DE HORARIOS RELOJ 8 HRS
-- =============================

-- Crear tabla empleado_horario_reloj
CREATE TABLE empleado_horario_reloj (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla historial_horarios_reloj
CREATE TABLE historial_biometrico (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_empresa int(11) NOT NULL DEFAULT 1 COMMENT '1=SAAO, 2=SB',
  biometrios longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(biometrios)),
  num_sem int(11) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  observacion varchar(120) NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp()
);

-- Crear tabla historial_incidencias_semanal
CREATE TABLE historial_incidencias_semanal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semana VARCHAR(10) NOT NULL,
    anio INT NOT NULL,
    empleado_id INT NOT NULL,
    id_empresa INT NOT NULL,
    vacaciones INT DEFAULT 0,
    ausencias INT DEFAULT 0,
    incapacidades INT DEFAULT 0,
    dias_trabajados INT DEFAULT 0,
    FOREIGN KEY (empleado_id) REFERENCES info_empleados(id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA DINAMICAS
-- =============================

-- Una nómina pertenece a una sola área.
-- De esa área se eligen los departamentos que participan en la nómina.
CREATE TABLE nombre_nominas (
  id_nomina INT AUTO_INCREMENT PRIMARY KEY,
  nombre_nomina VARCHAR(100) NOT NULL,
  id_area INT NULL,
  FOREIGN KEY (id_area) REFERENCES areas(id_area) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Departamentos seleccionados del área para participar en la nómina
CREATE TABLE nomina_departamento (
  id_nomina_departamento INT AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT NOT NULL,
  id_departamento INT NOT NULL,
  color_depto_nomina VARCHAR(7) DEFAULT '#FF0000',
  FOREIGN KEY (id_nomina) REFERENCES nombre_nominas(id_nomina) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA 40 LBS
-- =============================

-- Crear tabla tabulador
CREATE TABLE tabulador (
  id_tabulador INT  PRIMARY KEY,
  id_empresa INT NOT NULL,
  info_tabulador LONGTEXT NOT NULL,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- Crear tabla nomina_40lbs
CREATE TABLE nomina_40lbs(
    id_nomina_40lbs INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_40lbs LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);


-- =============================
-- TABLAS DE NÓMINA 40 LBS
-- =============================

CREATE TABLE nomina_10lbs(
    id_nomina_10lbs INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_10lbs LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLA DE PRECIOS DE CAJAS
-- =============================
CREATE TABLE precios_cajas (
    id_precio_caja INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('CALIBRE', 'PESO') NOT NULL,
    valor VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    color_hex VARCHAR(7)
);

-- =============================
-- TABLAS DE NÓMINA CONFIANZA
-- =============================

-- Crear tabla nomina_confianza
CREATE TABLE nomina_confianza (
    id_nomina_confianza INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA RELICARIO
-- =============================

-- Crear tabla nomina_relicario
CREATE TABLE nomina_relicario (
    id_nomina_relicario INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_relicario LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_relicario
CREATE TABLE cortes_relicario (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT(11) NOT NULL,
  nombre_cortador VARCHAR(150) NOT NULL,
  folio VARCHAR(10) NOT NULL,
  precio_reja DECIMAL(10,2) NOT NULL,
  fecha_corte DATE NOT NULL,
  FOREIGN KEY (id_nomina) 
    REFERENCES nomina_relicario(id_nomina_relicario)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Crear tabla cortes_relicario_tablas
CREATE TABLE cortes_relicario_tablas (
  id_corte INT(11) NOT NULL,
  num_tabla INT(11) NOT NULL,
  rejas INT(11) NOT NULL,
  FOREIGN KEY (id_corte) 
    REFERENCES cortes_relicario(id)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabla principal: podas_relicario
CREATE TABLE podas_relicario (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina)
        REFERENCES nomina_relicario (id_nomina_relicario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_relicario
CREATE TABLE podas_movimientos_relicario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda)
        REFERENCES podas_relicario (id_poda)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA PILAR
-- =============================

-- Crear tabla nomina_pilar
CREATE TABLE nomina_pilar (
    id_nomina_pilar INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_pilar LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_pilar
CREATE TABLE cortes_pilar (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT(11) NOT NULL,
  nombre_cortador VARCHAR(150) NOT NULL,
  folio VARCHAR(10) NOT NULL,
  precio_reja DECIMAL(10,2) NOT NULL,
  fecha_corte DATE NOT NULL,
  FOREIGN KEY (id_nomina) 
    REFERENCES nomina_pilar(id_nomina_pilar)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Crear tabla cortes_pilar_tablas
CREATE TABLE cortes_pilar_tablas (
  id_corte INT NOT NULL,
  num_tabla INT NOT NULL,
  rejas INT NOT NULL,
  FOREIGN KEY (id_corte) 
    REFERENCES cortes_pilar(id)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabla principal: podas_pilar
CREATE TABLE podas_pilar (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina)
        REFERENCES nomina_pilar (id_nomina_pilar)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_pilar
CREATE TABLE podas_movimientos_pilar (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda)
        REFERENCES podas_pilar (id_poda)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA HUASTECA
-- =============================

--- Crear tabla nomina_huasteca
CREATE TABLE nomina_huasteca (
    id_nomina_huasteca INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_huasteca LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_huasteca
CREATE TABLE cortes_huasteca (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT(11) NOT NULL,
  nombre_cortador VARCHAR(150) NOT NULL,
  folio VARCHAR(10) NOT NULL,
  precio_reja DECIMAL(10,2) NOT NULL,
  fecha_corte DATE NOT NULL,
  FOREIGN KEY (id_nomina) 
    REFERENCES nomina_huasteca(id_nomina_huasteca)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Crear tabla cortes_huasteca_tablas
CREATE TABLE cortes_huasteca_tablas (
  id_corte INT(11) NOT NULL,
  num_tabla INT(11) NOT NULL,
  rejas INT(11) NOT NULL,
  FOREIGN KEY (id_corte) 
    REFERENCES cortes_huasteca(id)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

CREATE TABLE podas_huasteca (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina)
        REFERENCES nomina_huasteca (id_nomina_huasteca)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_huasteca
CREATE TABLE podas_movimientos_huasteca (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda)
        REFERENCES podas_huasteca (id_poda)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA PALMILLA
-- =============================
 
 --- Crear tabla nomina_palmilla
CREATE TABLE nomina_palmilla (
    id_nomina_palmilla INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_palmilla LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_palmilla
CREATE TABLE cortes_palmilla (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT(11) NOT NULL,
  nombre_cortador VARCHAR(150) NOT NULL,
  folio VARCHAR(10) NOT NULL,
  precio_reja DECIMAL(10,2) NOT NULL,
  fecha_corte DATE NOT NULL,
  FOREIGN KEY (id_nomina) 
    REFERENCES nomina_palmilla(id_nomina_palmilla)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Crear tabla cortes_palmilla_tablas
CREATE TABLE cortes_palmilla_tablas (
  id_corte INT(11) NOT NULL,
  num_tabla INT(11) NOT NULL,
  rejas INT(11) NOT NULL,
  FOREIGN KEY (id_corte) 
    REFERENCES cortes_palmilla(id)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabla principal: podas_palmilla
CREATE TABLE podas_palmilla (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina)
        REFERENCES nomina_palmilla (id_nomina_palmilla)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_palmilla
CREATE TABLE podas_movimientos_palmilla (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda)
        REFERENCES podas_palmilla (id_poda)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =============================
-- ISERTAR DATOS
-- =============================

-- Insertar estatus true y false
INSERT INTO status (nombre_status) VALUES ('Activo'), ('Baja');

-- Insertar roles
INSERT INTO rol (nombre_rol) VALUES ('admin'), ('empleado');



-- Procedimiento para crear casilleros del 1 al 300
DELIMITER //
CREATE PROCEDURE crear_casilleros()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 300 DO
        INSERT INTO casilleros (num_casillero)
        VALUES (i);
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- Ejecutar el procedimiento
CALL crear_casilleros();



INSERT INTO tabulador (id_tabulador,id_empresa, info_tabulador) 