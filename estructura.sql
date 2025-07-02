CREATE DATABASE IF NOT EXISTS control_nomina;
USE control_nomina;

-- Tabla de roles
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

-- Tabla de administradores/usuarios
CREATE TABLE info_admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    correo VARCHAR(100),
    contrasena VARCHAR(255),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- Tabla de status
CREATE TABLE status (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nombre_status VARCHAR(50) NOT NULL
);

-- Tabla de áreas
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL
);

-- Tabla de puestos
CREATE TABLE puestos (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_puesto VARCHAR(100) NOT NULL
);

-- Tabla de contacto de emergencia
CREATE TABLE contacto_emergencia (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    parentesco VARCHAR(50),
    telefono VARCHAR(20),
    domicilio VARCHAR(255)
);

-- Tabla de empleados
CREATE TABLE info_empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_status INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    domicilio VARCHAR(255),
    imss VARCHAR(20),
    curp VARCHAR(20),
    sexo ENUM('M','F'),
    enfermedades_alergias TEXT,
    grupo_sanguineo VARCHAR(5),
    fecha_ingreso DATE,
    id_contactoEmergencia INT,
    id_area INT,
    id_puesto INT,
    clave_empleado VARCHAR(20) UNIQUE, -- Agregado para relación con gafetes y asistencia
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_contactoEmergencia) REFERENCES contacto_emergencia(id_contacto),
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto)
);

-- Tabla de años
CREATE TABLE anio (
    id_anio INT AUTO_INCREMENT PRIMARY KEY,
    numero_anio INT NOT NULL
);

-- Tabla de información de semana
CREATE TABLE info_semana (
    id_semana INT AUTO_INCREMENT PRIMARY KEY,
    dia_apertura DATE NOT NULL,
    dia_cierre DATE NOT NULL,
    mes INT NOT NULL,
    num_semana INT NOT NULL,
    id_anio INT NOT NULL,
    FOREIGN KEY (id_anio) REFERENCES anio(id_anio)
);

-- Tabla de asistencia por semana
CREATE TABLE asistencia_semana (
    id_asistencia_semana INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    clave_empleado VARCHAR(20),
    id_semana INT NOT NULL,
    total_horas_trabajadas DECIMAL(6,2),
    total_minutos_trabajados INT,
    total_horas_comida DECIMAL(6,2),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_semana) REFERENCES info_semana(id_semana),
    FOREIGN KEY (clave_empleado) REFERENCES info_empleados(clave_empleado)
);

-- Tabla de asistencia por día
CREATE TABLE asistencia_dia (
    id_asistencia_dia INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    clave_empleado VARCHAR(20),
    id_semana INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    horas_comida DECIMAL(4,2),
    horas_trabajadas DECIMAL(4,2),
    minutos_trabajados INT,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_semana) REFERENCES info_semana(id_semana),
    FOREIGN KEY (clave_empleado) REFERENCES info_empleados(clave_empleado)
);

-- Tabla de inasistencias
CREATE TABLE inasistencias (
    id_inasistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_semana INT NOT NULL,
    fecha DATE NOT NULL,
    minutos_no_trabajados INT,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_semana) REFERENCES info_semana(id_semana)
);

-- Tabla de nómina
CREATE TABLE nomina (
    id_nomina INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    dia_apertura DATE NOT NULL,
    dia_cierre DATE NOT NULL,
    id_semana INT NOT NULL,
    sueldo_neto DECIMAL(10,2),
    incentivo DECIMAL(10,2),
    extra DECIMAL(10,2),
    vacaciones DECIMAL(10,2),
    prestamo DECIMAL(10,2),
    inasistencias DECIMAL(10,2),
    uniformes DECIMAL(10,2),
    isr DECIMAL(10,2),
    imss DECIMAL(10,2),
    tarjeta DECIMAL(10,2),
    id_pgdf_colfa INT,
    sueldo_cobrar DECIMAL(10,2),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_semana) REFERENCES info_semana(id_semana)
);

-- Tabla de gafetes
CREATE TABLE gafetes (
    id_gafete INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    clave_empleado VARCHAR(20),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    foto VARCHAR(255),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (clave_empleado) REFERENCES info_empleados(clave_empleado)
);
