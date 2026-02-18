-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS sistema_nomina;
USE sistema_nomina;

-- =============================
-- TABLAS BASE
-- =============================

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    logo_empresa VARCHAR(200) NULL,
    rfc_empresa VARCHAR(12) NULL,
    domicilio_fiscal VARCHAR(200) NULL,
    marca_empresa VARCHAR(2s00) NULL
);


CREATE TABLE IF NOT EXISTS areas (
  id_area int(11) NOT NULL AUTO_INCREMENT,
  nombre_area varchar(100) NOT NULL,
  logo_area varchar(200) DEFAULT NULL,
  PRIMARY KEY (id_area)
);

CREATE TABLE IF NOT EXISTS departamentos (
  id_departamento int(11) NOT NULL AUTO_INCREMENT,
  nombre_departamento varchar(100) NOT NULL,
  id_area int(11) DEFAULT NULL,
  PRIMARY KEY (id_departamento),
  FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

CREATE TABLE IF NOT EXISTS puestos_especiales (
  id_puestoEspecial int(11) NOT NULL AUTO_INCREMENT,
  nombre_puesto varchar(100) NOT NULL,
  direccion_puesto varchar(200) DEFAULT NULL,
  color_hex varchar(7) DEFAULT NULL,
  PRIMARY KEY (id_puestoEspecial)
);

CREATE TABLE info_ranchos (
  id_info_rancho int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_area int NOT NULL,
  costo_jornal decimal(10,2) NOT NULL,
  costo_tardeada decimal(10,2) NOT NULL,
  costo_pasaje decimal(10,2) NOT NULL,
  costo_comida decimal(10,2) NOT NULL,
  horario_jornalero longtext,
  num_arboles int NOT NULL,
  FOREIGN KEY (id_area) REFERENCES areas(id_area) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Esta tabla relaciona departamentos con
-- los puestos
CREATE TABLE IF NOT EXISTS departamentos_puestos (
  id_departamento_puesto int(11) NOT NULL AUTO_INCREMENT,
  id_departamento int(11) DEFAULT NULL,
  id_puestoEspecial int(11) DEFAULT NULL,
  PRIMARY KEY (id_departamento_puesto),
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
  FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales(id_puestoEspecial)
);

CREATE TABLE status (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nombre_status VARCHAR(50) NOT NULL
);

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);


-- =============================
-- TABLAS DE EMPLEADOS
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
    
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales(id_puestoEspecial),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- =============================
-- TABLA HISTORIAL DE REINGRESOS/SALIDAS
-- =============================
CREATE TABLE historial_reingresos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha_reingreso DATE NOT NULL,
    fecha_salida DATE NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)
);


CREATE TABLE empleado_contacto (
    id_empleado_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_contacto INT NOT NULL,
    parentesco VARCHAR(100),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_contacto) REFERENCES contacto_emergencia(id_contacto)
);

CREATE TABLE empleado_beneficiario (
    id_empleado_beneficiario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_beneficiario INT NOT NULL,
    parentesco VARCHAR(100),
    porcentaje DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_beneficiario) REFERENCES beneficiarios(id_beneficiario)
);

CREATE TABLE casilleros (
  num_casillero varchar(50) PRIMARY KEY 
);

CREATE TABLE empleado_casillero (
    id_empleado INT NOT NULL,
    num_casillero VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (num_casillero) REFERENCES casilleros(num_casillero)
);


-- =============================
-- TABLAS DE ADMINISTRACIÓN
-- =============================

CREATE TABLE info_admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    correo VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- =============================
-- TABLAS DE NÓMINA 40 LBS
-- =============================

CREATE TABLE nomina (
  id_nomina_json INT  PRIMARY KEY,
  id_empresa INT NOT NULL,
  datos_nomina JSON NOT NULL,
  id_horario INT,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
  FOREIGN KEY (id_horario) REFERENCES horarios_oficiales(id_horario)
);

CREATE TABLE horarios_oficiales (
  id_horario INT  PRIMARY KEY,
  horario_json JSON NOT NULL
);

CREATE TABLE tabulador (
  id_tabulador INT  PRIMARY KEY,
  id_empresa INT NOT NULL,
  info_tabulador JSON NOT NULL,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);


CREATE TABLE nomina_40lbs(
    id_nomina_40lbs INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_40lbs LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);



-- =============================
-- TABLAS DE NÓMINA CONFIANZA
-- =============================

CREATE TABLE horarios_oficiales (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario_oficial LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)  
);

CREATE TABLE nomina_confianza (
    id_nomina_confianza INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- =============================
-- TABLAS DE NÓMINA RELICARIO
-- =============================

CREATE TABLE nomina_relicario (
    id_nomina_relicario INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_relicario LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);


-- =============================
-- TABLAS DE TURNOS Y FESTIVIDADES BHL
-- =============================

CREATE TABLE turnos (
  id_turno INT PRIMARY KEY AUTO_INCREMENT,
  descripcion VARCHAR (30) NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  max DECIMAL(10,2) NOT NULL
);

CREATE TABLE festividades (
  id_festividad INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (100),
  fecha DATE,
  tipo ENUM('NACIONAL', 'LOCAL', 'INTERNO') DEFAULT 'NACIONAL',
  observacion VARCHAR(100) NULL
);


-- ============================
-- Tablas para la AUTORIZACION
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
-- TABLA DE HORARIOS RELOJ 8 HRS
-- =============================

CREATE TABLE empleado_horario_reloj (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)  
);

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
    FOREIGN KEY (empleado_id) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);


-- =============================
-- ISERTAR DATOS
-- =============================

-- Insertar estatus true y false
INSERT INTO status (nombre_status) VALUES ('Activo'), ('Baja');

-- Insertar roles
INSERT INTO rol (nombre_rol) VALUES ('admin'), ('empleado');

-- Insertar empresas
INSERT INTO empresa (nombre_empresa) VALUES 
('Citricos SAAO'),
('SB citric´s group');

-- Insertar tipos de nómina
INSERT INTO tipos_nomina (nombre_nomina, descripcion) VALUES 
('Nómina 40 LBS', 'Nómina para empleados de 40 libras'),
('Nómina Confianza', 'Nómina para empleados de confianza'),
('Nómina Relicario', 'Nómina para empleados del relicario');


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
VALUES (
    1,1,
    '[
      {
        "rango": { "desde": "01:00", "hasta": "20:59" },
        "minutos": 1259,
        "sueldo_base": 1350.00,
        "sueldo_especial": 1550.00,
        "costo_por_minuto": 1.07
      },
      {
        "rango": { "desde": "21:00", "hasta": "30:59" },
        "minutos": 1859,
        "sueldo_base": 1550.00,
        "sueldo_especial": 1750.00,
        "costo_por_minuto": 0.83
      },
      {
        "rango": { "desde": "31:00", "hasta": "40:59" },
        "minutos": 2459,
        "sueldo_base": 1750.00,
        "sueldo_especial": 1950.00,
        "costo_por_minuto": 0.71
      },
      {
        "rango": { "desde": "41:00", "hasta": "48:00" },
        "minutos": 2880,
        "sueldo_base": 1952.00,
        "sueldo_especial": 2152.00,
        "costo_por_minuto": 0.67
      },
      {
        "rango": { "desde": "48:01", "hasta": "en adelante" },
        "tipo": "hora_extra",
        "costo_por_minuto": 1.34
      }
    ]'
);