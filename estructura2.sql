-- Crear Base de Datos
CREATE DATABASE IF NOT EXISTS control_nomina;
USE control_nomina;

-- =============================
-- TABLAS BASE
-- =============================

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL
);



CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL
);

CREATE TABLE logo_area (
    id_area_logo INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    ruta_logo VARCHAR(150) NOT NULL,
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
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
    nombre VARCHAR(50),
    ap_paterno VARCHAR(50),
    ap_materno VARCHAR(50),
    parentesco VARCHAR(50),
    telefono VARCHAR(20),
    domicilio VARCHAR(150)
);

CREATE TABLE info_empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_status INT NOT NULL,
    clave_empleado VARCHAR(20) NOT NULL UNIQUE,
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
    num_casillero INT,
    id_contactoEmergencia INT,
    id_puestoEspecial INT,
    id_departamento INT,
    id_area INT,
    id_empresa INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_contactoEmergencia) REFERENCES contacto_emergencia(id_contacto),
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales(id_puestoEspecial),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento),
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE info_gafetes (
    id_gafete INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)
);

CREATE TABLE foto_empleado (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    ruta_foto_empleado VARCHAR(255),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado)
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
    id_fechaNomina INT AUTO_INCREMENT PRIMARY KEY,
    numero_semana INT NULL,
    dia_inicio DATE NULL,
    dia_cierre DATE NULL,
    mes_inicio INT NULL,
    mes_cierre INT NULL,
    anio YEAR NULL
);

CREATE TABLE nomina (
    id_nomina INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_fechaNomina INT NOT NULL,
    sueldo_neto DECIMAL(10,2) DEFAULT 0,
    incentivo DECIMAL(10,2) DEFAULT 0,
    extra DECIMAL(10,2) DEFAULT 0,
    prestamo DECIMAL(10,2) DEFAULT 0,
    inasistencias DECIMAL(10,2) DEFAULT 0,
    uniformes DECIMAL(10,2) DEFAULT 0,
    infonavit DECIMAL(10,2) DEFAULT 0,
    isr DECIMAL(10,2) DEFAULT 0,
    imss DECIMAL(10,2) DEFAULT 0,
    checador DECIMAL(10,2) DEFAULT 0,
    fa_gafet_cofia DECIMAL(10,2) DEFAULT 0,
    sueldo_a_cobrar DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_fechaNomina) REFERENCES fecha_nomina(id_fechaNomina)
);

CREATE TABLE tarjeta (
    id_tarjeta INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_fechaNomina INT NOT NULL,
    tarjeta DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_fechaNomina) REFERENCES fecha_nomina(id_fechaNomina)
);
