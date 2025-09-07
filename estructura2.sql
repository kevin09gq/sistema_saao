-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS sistema_nomina;
USE sistema_nomina;

-- =============================
-- TABLAS BASE
-- =============================

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    logo_empresa VARCHAR(200) NULL
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
    nombre_puesto VARCHAR(100) NOT NULL
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
CREATE TABLE contacto_emergencia (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    telefono VARCHAR(20),
    domicilio VARCHAR(255)
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
    num_casillero VARCHAR(100), 
    ruta_foto VARCHAR(255),
    fecha_creacion DATE,
    fecha_vigencia DATE,
    salario_semanal DECIMAL(10,2) DEFAULT 0,
    salario_mensual DECIMAL(10,2) DEFAULT 0,
    id_puestoEspecial INT,
    id_departamento INT,
    id_area INT,
    id_empresa INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales(id_puestoEspecial),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE empleado_contacto (
    id_empleado_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_contacto INT NOT NULL,
    parentesco VARCHAR(100),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_contacto) REFERENCES contacto_emergencia(id_contacto)
);



-- =============================
-- TABLAS DE ADMINISTRACIÓN
-- =============================

CREATE TABLE info_admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- =============================
-- TABLAS DE NÓMINA
-- =============================


CREATE TABLE fecha_nomina (
    num_semana INT NOT NULL,
    ano VARCHAR(6) NOT NULL,
    PRIMARY KEY (num_semana)
);


CREATE TABLE nomina (
    id_empleado INT NOT NULL,
    numero_semana INT NOT NULL,
    incentivo DECIMAL NULL,
    extras DECIMAL NULL,
    prestamo DECIMAL NULL,
    inasistencias DECIMAL NULL,
    uniformes DECIMAL NULL,
    infonavit DECIMAL NULL,
    isr DECIMAL NULL,
    immss DECIMAL NULL,
    checadora DECIMAL NULL,
    fa_gafet_cofian DECIMAL NULL,
    sueldo_a_cobrar DECIMAL NULL,
    minutos_extras DECIMAL NULL,
    minutos_trabajados DECIMAL NULL,
    actividades_especiales DECIMAL NULL,
    bono_antiguedad DECIMAL NULL,
    bono_puesto DECIMAL NULL,
    inasistencias_descuenta DECIMAL NULL,
    inasistencias_minutos DECIMAL NULL,
    sueldo_base DECIMAL NULL,
    sueldo_extra  DECIMAL NULL,
    sueldo_extra_final DECIMAL NULL,
    tiempo_redondeado VARCHAR(10),
    total_extra_calculado DECIMAL NULL,
    total_minutos_redondeados DECIMAL NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (numero_semana) REFERENCES fecha_nomina(num_semana)
);

CREATE TABLE tarjeta (
    id_empleado INT NOT NULL,
    num_semana INT NOT NULL,
    tarjeta DECIMAL DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (num_semana) REFERENCES fecha_nomina(num_semana)
);


CREATE TABLE horarios_semanales (
    numero_semana INT NOT NULL,
    dia VARCHAR(20) NOT NULL,
    entrada_comer VARCHAR,
    salida_comer VARCHAR,
    salida VARCHAR,
    total_horas VARCHAR,
    horas_comida VARCHAR
    FOREIGN KEY (numero_semana) REFERENCES fecha_nomina(num_semana)
);

CREATE TABLE registros_redondeados (
    id_empleado INT NOT NULL,
    num_semana INT NOT NULL,
    dia VARCHAR(20),
    fecha VARCHAR(20),
    hora_entrada VARCHAR(20),
    entrada_comer VARCHAR(20),
    salida_comer VARCHAR(20),
    salida VARCHAR(20),
    hora_comida VARCHAR(20),
    entrada_temprana VARCHAR(20),
    salida_tardia VARCHAR(20),
    trabajado VARCHAR(20),
    olvido_checador BOOLEAN,
    FOREIGN KEY (num_semana) REFERENCES fecha_nomina(num_semana),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)
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


