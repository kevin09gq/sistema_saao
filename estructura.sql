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
    correo VARCHAR(100),
    contrasena VARCHAR(255),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- Tabla de status
CREATE TABLE status (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nombre_status VARCHAR(50) NOT NULL
);

-- Nueva tabla de departamentos
CREATE TABLE departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL
);

-- Tabla de contacto de emergencia
CREATE TABLE contacto_emergencia (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    telefono VARCHAR(20),
    domicilio VARCHAR(255)
);

-- Tabla de empleados (ajustada para usar departamentos)
CREATE TABLE info_empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_status INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ap_paterno VARCHAR(100),
    ap_materno VARCHAR(100),
    domicilio TEXT(500),
    imss VARCHAR(20),
    curp VARCHAR(20),
    sexo ENUM('M','F'),
    enfermedades_alergias TEXT,
    grupo_sanguineo VARCHAR(5),
    fecha_ingreso DATE,
    id_departamento INT,
    clave_empleado INT NOT NULL UNIQUE,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_status) REFERENCES status(id_status),
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
);


-- Tabla de relación empleado-contacto de emergencia
CREATE TABLE empleado_contacto (
    id_empleado_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_contacto INT NOT NULL,
    parentesco VARCHAR(100),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (id_contacto) REFERENCES contacto_emergencia(id_contacto)
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
    clave_empleado INT,
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
    clave_empleado INT,
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
    clave_empleado INT NOT NULL,
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
    FOREIGN KEY (clave_empleado) REFERENCES info_empleados(clave_empleado),
    FOREIGN KEY (id_semana) REFERENCES info_semana(id_semana)
);

-- Tabla de gafetes
CREATE TABLE gafetes (
    id_gafete INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    clave_empleado INT,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    foto VARCHAR(255),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados(id_empleado),
    FOREIGN KEY (clave_empleado) REFERENCES info_empleados(clave_empleado)
);

-- Insertar estatus true y false
INSERT INTO status (nombre_status) VALUES ('Activo'), ('Baja');

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


-- Adminstracion
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'LETICIA', 'ALVAREZ', 'SOSA', 'F', 1, 3);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'GUADALUPE', 'GUTIERREZ', 'MELENDEZ', 'M', 1, 9);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'DORA GUILLERMINA', 'GARCIA', 'CELIS', 'F', 1, 15);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'MANUEL ANTONIO', 'SAAVEDRA', 'BONILLA', 'M', 1, 19);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'GAMALIEL', 'PADILLA', 'VILLEGAS', 'M', 1, 40);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'EVA MARIA', 'LARA', 'BARRIOS', 'F', 1, 88);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'JOAN', 'MELO', 'HERNANDEZ', 'M', 1, 93);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'IVETTE', 'BRINGAS', 'MEJIA', 'M', 1, 99);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'ZAIDE ABIGAHIL', 'BARRIENTOS', 'GOMEZ', 'M', 1, 166);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'ESMERALDA', 'LORENZO', 'BARTOLOME', 'F', 1, 178);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'IVAN', 'GARCIA', 'OCHOA', 'M', 1, 179);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'RAMON ARTURO', 'RODRIGUEZ', 'ARROYO', 'M', 1, 240);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'ERICK ADRIAN', 'ROMAN', 'MENDEZ', 'M', 1, 272);

-- Personal de Confianza Produccion

INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'FIDENCIO', 'ABURTO', 'JIMENEZ', 'M', 2, 2);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'OMAR URIEL', 'FLORES', 'ROJAS', 'M', 2, 7);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'ROBERTO', 'RIVERA', 'HERNANDEZ', 'M', 
2, 16);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'ESMERALDA', 'ROCHA', 'GARCIA', 'F', 2, 17);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'GERMAN', 'JUAREZ', 'SANTANA', 'M', 2, 36);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'RENATO', 'PEÑA', 'RAMIREZ', 'M', 2, 41);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'MAYRA LILIANA', 'AGUILAR', 'DOMINGUEZ', 'F', 2, 94);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'EDMAR', 'PREZA', 'JUAREZ', 'M', 2, 116);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'JULISSA', 'ANDRADE', 'GARCIA', 'F', 2, 155);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'FELIPE DE JESUS', 'QUINTERO', 'ALBA', 'M', 2, 222);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'MARCOS RAFAEL', 'NAVA', 'GONZALEZ', 'M', 2, 260);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'RAUL', 'AGUILERA', 'SALAZAR', 'M', 2, 282);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'FRANCISCO DE JESUS', 'GUERRERO', 'PREZA', 'M', 2, 287);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'JOVANY', 'GARCIA', 'ALBA', 'M', 2, 295);

-- Seguridad Vigilancia e Intendencia
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'JESUS GERARDO', 'OREA DE', 'JESUS', 'M', 3, 12);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'MIGUEL', 'HERNANDEZ', 'MAZA', 'M', 3, 33);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
VALUES (2, 1, 'GLORIA', 'RUIZ', 'ROBLES', 'F', 3, 320);

-- Produccion 40 Libras"
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado) 
VALUES (2, 1, 'ALICIA', 'ABUNDIO', 'SANTOS', 'F', 4, 1);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LUCIA', 'COSSIO', 'MENDEZ', 'F', 4, 4);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'GUADALUPE', 'ENCARNACION', 'FLORES', 'F', 4, 6);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JOSE', 'RODRIGUEZ', 'ORTIZ', 'M', 4, 18);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'PATRICIA', 'VILLEGAS', 'GUEVARA', 'F', 4, 24);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'PAULINA', 'ZARATE', 'ANTONIO', 'F', 4, 26);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JOSE LUIS', 'RODRIGUEZ', 'ESPINOSA', 'M', 4, 71);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'GUADALUPE', 'DOMINGUEZ', 'HERNANDEZ', 'F', 4, 102);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SIXTO', 'GIL', 'VAZQUEZ', 'M', 4, 110);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ELIZABETH', 'RODRIGUEZ', 'HERNANDEZ', 'F', 4, 124);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'TERESA', 'POLO', 'JUAREZ', 'F', 4, 197);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'VICTOR MANUEL', 'BAUTISTA', 'MORALES', 'M', 4, 200);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SUGEYDI', 'RIVERA', 'ARCOS', 'F', 4, 214);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'FLOR DE ROCIO', 'HERNANDEZ', 'HERNANDEZ', 'F', 4, 220);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LUIS ALBERTO', 'CAMACHO', 'HERRERA', 'M', 4, 225);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'RUTH', 'MARTINEZ', 'JUAREZ', 'F', 4, 235);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'HERIBERTO', 'MORGADO', 'HERRERA', 'M', 4, 236);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'GRISELDA', 'LOPEZ', 'JUAN', 'F', 4, 253);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LUCIA', 'RUIZ', 'FILOBELLO', 'F', 4, 254);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SERGIO', 'JUAREZ', 'GOMEZ', 'M', 4, 255);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'CONSUELO YANELI', 'GUZMAN', 'ALARCON', 'F', 4, 257);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SUSILY ZULEMA', 'LANZAGORTA', 'TOSCANO', 'F', 4, 273);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'KARINA', 'ALBA', 'HERNANDEZ', 'F', 4, 274);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'YAMILETH', 'COSSIO', 'MENDEZ', 'F', 4, 275);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'OSCAR', 'RIVERA', 'LANDERO', 'M', 4, 290);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIA DEL SOL', 'JUAREZ', 'VENTURA', 'F', 4, 294);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ANA KAREN', 'PREZA', 'HERNANDEZ', 'F', 4, 296);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'RICARDO ALFONSO', 'PINO', 'RUIZ', 'M', 4, 307);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'PAMELA', 'LARA', 'RIVERA', 'F', 4, 311);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'VICTOR HUGO', 'PERDOMO', 'PREZA', 'M', 4, 336);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LEANDRO', 'MIRANDA', 'ABAD', 'M', 4, 338);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LUIS ANTONIO', 'HERNANDEZ', 'RAMOS', 'M', 4, 339);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ALFONSO', 'HERNANDEZ', 'GARCIA', 'M', 4, 340);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JOSUE DANIEL', 'LERDO', 'POSADAS', 'M', 4, 341);

-- Produccion 10 Libras"
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIA GUADALUPE', 'LUNA', 'HERNANDEZ', 'F', 5, 81);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ESTHER', 'PREZA', 'ORTIZ', 'F', 5, 97);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JUANA', 'LANDERO', 'LOZANO', 'F', 5, 100);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'GUADALUPE IVON', 'SANCHEZ DE', 'JESUS', 'F', 5, 139);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIA DEL CARMEN', 'SANCHEZ DE', 'JESUS', 'F', 5, 140);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'NOELIA', 'CAMPOS', 'ESTEBAN', 'F', 5, 163);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'FATIMA MICHEL', 'JUAREZ', 'PREZA', 'F', 5, 171);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIA DE LOS ANGELES', 'DIAZ', 'SANCHEZ', 'F', 5, 186);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LIZETH', 'LOPEZ', 'MARTINEZ', 'F', 5, 209);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ROSALBA', 'JUAREZ', 'PILAR', 'F', 5, 215);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ALMA IDALIA', 'SANTIAGO', 'SALAZAR', 'F', 5, 221);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SULLY IRANY', 'PARRA', 'SOLANO', 'F', 5, 227);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIELY', 'VAZQUEZ', 'RUIZ', 'F', 5, 286);
 
-- RANCHO RELICARIO
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JERONIMO', 'MARQUEZ', 'DAMIAN', 'M', 6, 242);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'SALVADOR', 'REYES', 'MURRIETA', 'M', 6, 304);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'VICTOR HUGO', 'MARTINEZ', 'ROMERO', 'M', 6, 329);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LUIS EDUARDO', 'MARTINEZ', 'ROMERO', 'M', 6, 330);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ISMAEL', 'LOZANO', 'ALARCON', 'M', 6, 333);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'FELIX', 'DE LA CRUZ', 'GALICIA', 'M', 6, 342);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'ALEJANDRO', 'LOPEZ', 'BELLO', 'M', 6, 343);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'CESAR', 'MORALES', 'UBALDO', 'M', 6, 344);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'FERNANDO', 'ROSAS', 'PARRALES', 'M', 6, 345);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'GUADALUPE', 'VAZQUEZ', 'RAMIRO', 'M', 6, 346);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JESUS ALBERTO', 'HERNANDEZ', 'RAMIREZ', 'M', 6, 347);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LEONARDO', 'PEREZ', 'SOTO', 'M', 6, 348);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MARIA', 'RAMIRO', 'LUCIANO', 'F', 6, 349);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'PABLO', 'PEREZ', 'SOTO', 'M', 6, 350);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'RAYMUNDO', 'PEREZ', 'JUAREZ', 'M', 6, 351);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'VICTOR EMILIO', 'ALBINO', 'CALDERON', 'M', 6, 353);
 
 -- Ranchos
 
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'JOSE', 'AARON', 'CADENA', 'M', 7, 27);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'AMADA', 'GARCIA', 'MARTINEZ', 'F', 7, 194);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'BEATRIZ', 'LOPEZ', 'LERDO', 'F', 7, 196);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'MAGALY', 'VELAZCO', 'ASCENCION', 'F', 7, 208);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'VICTOR MANUEL', 'RODRIGUEZ', 'CRUZ', 'M', 7, 292);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LIZBETH', 'LUGO DE', 'FERMIN', 'F', 7, 334);

-- Administracion Sucursal CdMx

INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'IRMA DEL CARMEN', 'SALINAS', 'CASTELLANOS', 'F', 8, 206);
INSERT INTO info_empleados (id_rol, id_status, nombre, ap_paterno, ap_materno, sexo, id_departamento, clave_empleado)
 VALUES (2, 1, 'LEAL PABLO AXEL', 'ESPINOSA', 'DIAZ', 'M', 8, 337);

