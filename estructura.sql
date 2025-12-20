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


CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL,
    logo_area VARCHAR(200) NULL
);


CREATE TABLE departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL
);

CREATE TABLE puestos_especiales (
    id_puestoEspecial INT AUTO_INCREMENT PRIMARY KEY,
    nombre_puesto VARCHAR(100) NOT NULL,
    direccion_puesto VARCHAR(200) NULL,
    color_hex VARCHAR(7) NULL
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
-- TABLAS DE NÓMINA
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

-- =============================
-- TABLAS DE TURNOS Y FESTIVIDADES BHL
-- =============================

CREATE TABLE turnos (
  id_turno INT PRIMARY KEY AUTO_INCREMENT,
  descripcion VARCHAR (30),
  hora_inicio TIME,
  hora_fin TIME,
  estado TINYINT DEFAULT 1
);

CREATE TABLE festividades (
  id_festividad INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR (100),
  fecha DATE,
  tipo ENUM('NACIONAL', 'LOCAL', 'INTERNO') DEFAULT 'NACIONAL',
  observaciones VARCHAR(100) NULL
);

CREATE TABLE empleado_turno (
  id_empleado_turno INT PRIMARY KEY AUTO_INCREMENT,
  id_empleado INT,
  id_turno_base INT NULL,
  id_turno_sabado INT NULL,
  FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
  FOREIGN KEY (id_turno_base) REFERENCES turnos(id_turno),
  FOREIGN KEY (id_turno_sabado) REFERENCES turnos(id_turno),
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

-- Insertar áreas
INSERT INTO areas (nombre_area) VALUES 
('Empaque'),
('Rancho Relicario'),
('Rancho Pilar'),
('Rancho Huasteca');

-- Insertar puestos especiales
INSERT INTO puestos_especiales (nombre_puesto) VALUES 
('Flejadores'),
('Patineros'),
('Aux corridas'),
('Foleadores');

-- Insertar departamentos
INSERT INTO departamentos (id_departamento, nombre_departamento) VALUES
(1, 'Administración'),
(2, 'Personal de Confianza Produccion'),
(3, 'Seguridad Vigilancia e Intendencia'),
(4, 'Produccion 40 Libras'),
(5, 'Produccion 10 Libras'),
(6, 'Rancho Relicario'),
(7, 'Ranchos'),
(8, 'Administracion Sucursal CdMx');

-- Insertar estado civil
INSERT INTO estado_civil (nombre_estado_civil) VALUES 
('Soltero(a)'),
('Casado(a)'),
('Viudo(a)'),
('Divorciado(a)'),
('Unión Libre'),
('Separado(a)');

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