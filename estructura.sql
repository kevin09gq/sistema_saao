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
    colores VARCHAR(20) DEFAULT NULL,
    colores_texto VARCHAR(20) DEFAULT NULL,
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
CREATE TABLE departamentos_puestos (
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
    FOREIGN KEY (id_area) REFERENCES areas (id_area) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla de colores para la asistencia
CREATE TABLE asistencia_colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sexo ENUM('M', 'F') NOT NULL UNIQUE,
    color_hex VARCHAR(7) NOT NULL
);

-- =============================
-- TABLAS DE ADMINISTRACION DE USUARIOS
-- =============================

-- Crear tabla estatus
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
    nombre_admin VARCHAR(100) NOT NULL,
    id_rol INT NOT NULL,
    correo VARCHAR(100) NOT NULL,
    id_status INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_status) REFERENCES status (id_status) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE MÓDULOS Y PERMISOS DINÁMICOS
-- =============================

CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    clave_modulo VARCHAR(100) NOT NULL UNIQUE,
    nombre_modulo VARCHAR(100) NOT NULL
);

CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_modulo INT NOT NULL,
    clave_permiso VARCHAR(150) NOT NULL UNIQUE,
    nombre_permiso VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    FOREIGN KEY (id_modulo) REFERENCES modulos (id_modulo) ON UPDATE CASCADE
);

CREATE TABLE admin_permisos (
    id_admin_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    id_permiso INT NOT NULL,
    FOREIGN KEY (id_admin) REFERENCES info_admin (id_admin) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES permisos (id_permiso) ON UPDATE CASCADE ON DELETE CASCADE
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
    sexo ENUM('M', 'F'),
    enfermedades_alergias VARCHAR(150),
    grupo_sanguineo VARCHAR(5),
    fecha_nacimiento DATE,
    fecha_alta_empresa DATE,
    fecha_alta_imss DATE,
    ruta_foto VARCHAR(255),
    fecha_creacion DATE,
    fecha_vigencia DATE,
    salario_semanal DECIMAL(10, 2) DEFAULT 0,
    salario_diario DECIMAL(18, 10) DEFAULT 0,
    id_puestoEspecial INT,
    id_departamento INT,
    id_area INT,
    id_empresa INT,
    biometrico INT,
    telefono_empleado VARCHAR(15),
    status_nss TINYINT(1) DEFAULT 0,
    rfc_empleado VARCHAR(13),
    estado_civil VARCHAR(50),
    horario_fijo TINYINT(1) DEFAULT 1 FOREIGN KEY (id_rol) REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_status) REFERENCES status (id_status) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_puestoEspecial) REFERENCES puestos_especiales (id_puestoESpecial) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_area) REFERENCES areas (id_area) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla horarios_oficiales
CREATE TABLE horarios_oficiales (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario_oficial LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
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
    porcentaje DECIMAL(5, 2) DEFAULT 0,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_beneficiario) REFERENCES beneficiarios (id_beneficiario) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla relacion empleado_contacto
CREATE TABLE empleado_contacto (
    id_empleado_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_contacto INT NOT NULL,
    parentesco VARCHAR(100),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_contacto) REFERENCES contacto_emergencia (id_contacto) ON UPDATE CASCADE ON DELETE CASCADE
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
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLA ASIGNACION DE EXPEDIENTES
-- =============================

-- Crear tabla catalogo_expediente
CREATE TABLE catalogo_expediente (
    id_expediente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_dato VARCHAR(255) NOT NULL,
    historial BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Almacena los valores reales de cada empleado para cada campo del expediente
CREATE TABLE campo_expediente (
    id_campo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_expediente INT NOT NULL,
    valor TEXT NULL,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_expediente) REFERENCES catalogo_expediente (id_expediente) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE (id_empleado, id_expediente)
);

-- Guarda el historial de cambios cuando un campo tiene activada la opción de historial
CREATE TABLE historial_expediente (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_campo INT NOT NULL,
    valor TEXT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_campo) REFERENCES campo_expediente (id_campo) ON UPDATE CASCADE ON DELETE CASCADE
);
-- =============================
-- TABLA ASIGNACION DE CASILLEROS
-- =============================

-- Crear tabla casilleros
CREATE TABLE casilleros ( num_casillero varchar(50) PRIMARY KEY );

-- Crear tabla empleado_casillero
CREATE TABLE empleado_casillero (
    id_empleado INT NOT NULL,
    num_casillero VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (num_casillero) REFERENCES casilleros (num_casillero) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE TURNOS Y FESTIVIDADES
-- =============================

-- Crear tabla turnos
CREATE TABLE turnos (
    id_turno INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(30) NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    max DECIMAL(10, 2) NOT NULL
);

-- Crear tabla festividades
CREATE TABLE festividades (
    id_festividad INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fecha DATE,
    tipo ENUM(
        'NACIONAL',
        'LOCAL',
        'INTERNO'
    ) DEFAULT 'NACIONAL',
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
    monto decimal(10, 2) NOT NULL,
    semana int(11) NOT NULL,
    anio int(11) NOT NULL,
    fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
    estado enum(
        'activo',
        'liquidado',
        'pausado'
    ) NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_prestamo),
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON DELETE CASCADE
);

-- Crear tabla prestamos_abonos
CREATE TABLE prestamos_abonos (
    id_abono int(11) NOT NULL AUTO_INCREMENT,
    id_prestamo int(11) NOT NULL,
    monto_pago decimal(10, 2) NOT NULL,
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
    id_aguinaldo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jsonAguinaldo LONGTEXT NOT NULL,
    id_departamento INT NOT NULL,
    anio YEAR NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- =============================
-- TABLAS DE VACACIONES LFT
-- =============================

-- 1. Tabla para las versiones de la ley (historial de reformas)
CREATE TABLE versiones_vacaciones_lft (
    id_version_vacaciones INT AUTO_INCREMENT PRIMARY KEY,
    nombre_version VARCHAR(100) NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE NULL
);

-- 2. Tabla para los días de vacaciones según antigüedad
CREATE TABLE dias_vacaciones_lft (
    id_dias_vacaciones INT AUTO_INCREMENT PRIMARY KEY,
    id_version_vacaciones INT NOT NULL,
    anios_antiguedad_inicio INT NOT NULL,
    anios_antiguedad_fin INT NULL,
    dias_vacaciones_correspondientes INT NOT NULL,
    FOREIGN KEY (id_version_vacaciones) REFERENCES versiones_vacaciones_lft (id_version_vacaciones) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ==========================================
-- TABLAS DE CONTROL DE VACACIONES DE EMPLEADOS
-- ==========================================

CREATE TABLE vacaciones_periodos (
    id_periodo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    num_ciclo INT NOT NULL DEFAULT 1,
    fecha_aniversario DATE NOT NULL,
    anios_antiguedad INT NOT NULL,
    id_version_vacaciones INT NOT NULL,
    dias_derecho DECIMAL(10, 3) NOT NULL,
    dias_tomados DECIMAL(10, 3) NOT NULL DEFAULT 0,
    saldo DECIMAL(10, 3) NOT NULL DEFAULT 0,
    estatus ENUM('ACTIVO', 'VENCIDO') NOT NULL DEFAULT 'ACTIVO',
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_version_vacaciones) REFERENCES versiones_vacaciones_lft (id_version_vacaciones) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE kardex_vacaciones (
    id_kardex INT AUTO_INCREMENT PRIMARY KEY,
    id_periodo INT NOT NULL,
    id_empleado INT NOT NULL,
    num_ciclo INT NOT NULL DEFAULT 1,
    concepto VARCHAR(200) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    dias_movimiento DECIMAL(10, 3) NOT NULL,
    saldo_resultante DECIMAL(10, 3) NOT NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (id_periodo) REFERENCES vacaciones_periodos (id_periodo) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE prima_vacacional_empleados (
    id_prima_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_kardex INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    numero_semana INT NOT NULL,
    anio INT NOT NULL,
    fecha_pago DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_vacaciones DECIMAL(10, 3) NOT NULL,
    septimo_dia DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
    festivos INT NOT NULL DEFAULT 0,
    incluir_septimo_dia TINYINT NOT NULL DEFAULT 1,
    incluir_festivos TINYINT NOT NULL DEFAULT 1,
    salario_diario DECIMAL(10, 2) NOT NULL,
    porcentaje_prima DECIMAL(5, 2) NOT NULL,
    monto_prima_vacacional DECIMAL(10, 2) NOT NULL,
    dispersion_tarjeta DECIMAL(10, 2) NOT NULL DEFAULT 0,
    isr DECIMAL(10, 2) NOT NULL DEFAULT 0,
    imss DECIMAL(10, 2) NOT NULL DEFAULT 0,
    infonavit DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_pagado DECIMAL(10, 2) NOT NULL,
    dias_disfrutados DECIMAL(10, 3) NULL DEFAULT NULL,
    dias_pagadas DECIMAL(10, 3) NULL DEFAULT NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_kardex) REFERENCES kardex_vacaciones (id_kardex) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLA DE HORARIOS RELOJ 8 HRS
-- =============================

-- Crear tabla empleado_horario_reloj
CREATE TABLE empleado_horario_reloj (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    horario LONGTEXT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE
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
    FOREIGN KEY (empleado_id) REFERENCES info_empleados (id_empleado) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE CONTROL DE NÓMINAS
-- =============================

-- Una nómina pertenece a una sola área.
-- De esa área se eligen los departamentos que participan en la nómina.
CREATE TABLE nombre_nominas (
    id_nomina INT AUTO_INCREMENT PRIMARY KEY,
    nombre_nomina VARCHAR(100) NOT NULL,
    id_area INT NULL,
    FOREIGN KEY (id_area) REFERENCES areas (id_area) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Departamentos seleccionados del área para participar en la nómina
CREATE TABLE nomina_departamento (
    id_nomina_departamento INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    id_departamento INT NOT NULL,
    id_empresa INT NOT NULL,
    color_depto_nomina VARCHAR(7) DEFAULT '#FF0000',
    FOREIGN KEY (id_nomina) REFERENCES nombre_nominas (id_nomina) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA 40 LBS
-- =============================

-- Crear tabla tabulador
CREATE TABLE tabulador (
    id_tabulador INT PRIMARY KEY,
    id_empresa INT NOT NULL,
    info_tabulador LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa)
);

-- Crear tabla nomina_40lbs
CREATE TABLE nomina_40lbs (
    id_nomina_40lbs INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_40lbs LONGTEXT NOT NULL,
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE nomina_40lbs_jornal (
    id_nomina_40lbs_jornal INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_40lbs_jornal LONGTEXT NOT NULL,
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA 10 LBS
-- =============================

CREATE TABLE nomina_10lbs (
    id_nomina_10lbs INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_10lbs LONGTEXT NOT NULL,
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de precios de cajas
CREATE TABLE precios_cajas (
    id_precio_caja INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('NUMERO_DE_BOLSA', 'PESO') NOT NULL,
    valor VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
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
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
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
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_relicario
CREATE TABLE cortes_relicario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NULL,
    nombre_cortador VARCHAR(150) NOT NULL,
    folio VARCHAR(10) NOT NULL,
    precio_reja DECIMAL(10, 2) NOT NULL,
    fecha_corte DATE NOT NULL,
    estado TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_nomina) REFERENCES nomina_relicario (id_nomina_relicario) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_relicario_tablas
CREATE TABLE cortes_relicario_tablas (
    id_corte INT(11) NOT NULL,
    num_tabla INT(11) NOT NULL,
    rejas INT(11) NOT NULL,
    FOREIGN KEY (id_corte) REFERENCES cortes_relicario (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla principal: podas_relicario
CREATE TABLE podas_relicario (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina) REFERENCES nomina_relicario (id_nomina_relicario) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_relicario
CREATE TABLE podas_movimientos_relicario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda) REFERENCES podas_relicario (id_poda) ON UPDATE CASCADE ON DELETE CASCADE
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
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_pilar
CREATE TABLE cortes_pilar (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NULL,
    nombre_cortador VARCHAR(150) NOT NULL,
    folio VARCHAR(10) NOT NULL,
    precio_reja DECIMAL(10, 2) NOT NULL,
    fecha_corte DATE NOT NULL,
    estado TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_nomina) REFERENCES nomina_pilar (id_nomina_pilar) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_pilar_tablas
CREATE TABLE cortes_pilar_tablas (
    id_corte INT NOT NULL,
    num_tabla INT NOT NULL,
    rejas INT NOT NULL,
    FOREIGN KEY (id_corte) REFERENCES cortes_pilar (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla principal: podas_pilar
CREATE TABLE podas_pilar (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina) REFERENCES nomina_pilar (id_nomina_pilar) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_pilar
CREATE TABLE podas_movimientos_pilar (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda) REFERENCES podas_pilar (id_poda) ON UPDATE CASCADE ON DELETE CASCADE
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
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_huasteca
CREATE TABLE cortes_huasteca (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NULL,
    nombre_cortador VARCHAR(150) NOT NULL,
    folio VARCHAR(10) NOT NULL,
    precio_reja DECIMAL(10, 2) NOT NULL,
    fecha_corte DATE NOT NULL,
    estado TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_nomina) REFERENCES nomina_huasteca (id_nomina_huasteca) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_huasteca_tablas
CREATE TABLE cortes_huasteca_tablas (
    id_corte INT NOT NULL,
    num_tabla INT NOT NULL,
    rejas INT NOT NULL,
    FOREIGN KEY (id_corte) REFERENCES cortes_huasteca (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE podas_huasteca (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina) REFERENCES nomina_huasteca (id_nomina_huasteca) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_huasteca
CREATE TABLE podas_movimientos_huasteca (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda) REFERENCES podas_huasteca (id_poda) ON UPDATE CASCADE ON DELETE CASCADE
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
    total_percepciones DECIMAL(14, 2) DEFAULT 0,
    total_deducciones DECIMAL(14, 2) DEFAULT 0,
    total_neto DECIMAL(14, 2) DEFAULT 0,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_palmilla
CREATE TABLE cortes_palmilla (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NULL,
    nombre_cortador VARCHAR(150) NOT NULL,
    folio VARCHAR(10) NOT NULL,
    precio_reja DECIMAL(10, 2) NOT NULL,
    fecha_corte DATE NOT NULL,
    estado TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_nomina) REFERENCES nomina_palmilla (id_nomina_palmilla) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Crear tabla cortes_palmilla_tablas
CREATE TABLE cortes_palmilla_tablas (
    id_corte INT(11) NOT NULL,
    num_tabla INT(11) NOT NULL,
    rejas INT(11) NOT NULL,
    FOREIGN KEY (id_corte) REFERENCES cortes_palmilla (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla principal: podas_palmilla
CREATE TABLE podas_palmilla (
    id_poda INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_nomina) REFERENCES nomina_palmilla (id_nomina_palmilla) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de movimientos: podas_movimientos_palmilla
CREATE TABLE podas_movimientos_palmilla (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_poda INT NOT NULL,
    concepto VARCHAR(150) DEFAULT 'PODA',
    fecha DATE NOT NULL,
    arboles_podados INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    es_extra BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_poda) REFERENCES podas_palmilla (id_poda) ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================
-- TABLAS DE NÓMINA PTU
-- =============================
CREATE TABLE repartos_utilidades (
    id_utilidad INT NOT NULL AUTO_INCREMENT,
    anio INT NOT NULL,
    id_departamento INT NOT NULL,
    json_empleados JSON NOT NULL,
    fecha_creacion DATETIME,
    PRIMARY KEY (id_utilidad),
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================
-- INSERTAR DATOS
-- =============================

-- Insertar estatus true y false
INSERT INTO status (nombre_status) VALUES ('Activo'), ('Baja');

-- Insertar roles
INSERT INTO rol (nombre_rol) VALUES ('admin'), ('empleado');


-- Insertar Modulos
INSERT INTO
    modulos (clave_modulo, nombre_modulo)
VALUES (
        'actualizar_empleados',
        'Actualizar Empleados'
    ),
    (
        'registrar_empleados',
        'Registrar Empleados'
    ),
    (
        'prestamos',
        'Registro y Abono de Préstamos'
    ),
    ('aguinaldos', 'Aguinaldos'),
    ('ptu', 'PTU'),
    ('reloj_8hrs', 'Reloj 8 Hrs'),
    (
        'tickets_manuales',
        'Tickets Manuales'
    ),
    ('vacaciones', 'Vacaciones'),
    ('gafetes', 'Gafetes'),
    ('contratos', 'Contratos'),
    ('expedientes', 'Expedientes'),
    (
        'asistencia',
        'Lista de Asistencia'
    ),
    (
        'claves_autorizacion',
        'Claves de Autorización'
    ),
    ('nominas', 'Nominas'),
    ('cortes', 'Gestion de Cortes'),
    (
        'configuracion',
        'Configuración de Sistema'
    ),
    (
        'panel_admin',
        'Panel de Administración'
    ),
    ('casilleros', 'Casilleros')

-- Insertar Permisos Para de actualizar Empleado
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        1,
        'empleados.ver_menu',
        'Visualizar Actualización de Empleados',
        'Permite visualizar la actualización de Empleados en el menú lateral'
    ),
    (
        1,
        'empleados.actualizar_foto',
        'Actualizar Foto del Empleado',
        'Permite actualizar la foto del empleado'
    ),
    (
        1,
        'empleados.actualizar_nss',
        'Actualizar NSS del Empleado',
        'Permite actualizar el NSS del empleado'
    ),
    (
        1,
        'empleados.actualizar_status',
        'Actualizar Status del Empleado',
        'Permite actualizar el status del empleado'
    ),
    (
        1,
        'empleados.ver_informacion',
        'Visualizar Información del Empleado',
        'Permite visualizar la información del empleado'
    ),
    (
        1,
        'empleados.editar_informacion',
        'Editar Información del Empleado',
        'Permite editar la información del empleado'
    ),
    (
        1,
        'empleados.ver_salarios',
        'Visualizar Salarios del Empleado',
        'Permite visualizar los salarios del empleado'
    ),
    (
        1,
        'empleados.ver_contacto_emergencia',
        'Visualizar Contacto de Emergencia',
        'Permite visualizar el contacto de emergencia'
    ),
    (
        1,
        'empleados.editar_contacto_emergencia',
        'Editar Contacto de Emergencia',
        'Permite editar el contacto de emergencia'
    ),
    (
        1,
        'empleados.ver_beneficiarios',
        'Visualizar Beneficiarios',
        'Permite visualizar los beneficiarios del empleado'
    ),
    (
        1,
        'empleados.editar_beneficiarios',
        'Editar Beneficiarios',
        'Permite editar los beneficiarios del empleado'
    ),
    (
        1,
        'empleados.ver_reingresos',
        'Visualizar Reingresos',
        'Permite visualizar el apartado de reingresos'
    ),
    (
        1,
        'empleados.ver_fecha_alta_empresa',
        'Visualizar Fecha Alta Empresa',
        'Permite visualizar la fecha de alta en la empresa'
    ),
    (
        1,
        'empleados.editar_fecha_alta_empresa',
        'Editar Fecha Alta Empresa',
        'Permite editar la fecha de alta en la empresa'
    ),
    (
        1,
        'empleados.ver_fecha_alta_imss',
        'Visualizar Fecha Alta IMSS',
        'Permite visualizar la fecha de alta ante el IMSS'
    ),
    (
        1,
        'empleados.editar_fecha_alta_imss',
        'Editar Fecha Alta IMSS',
        'Permite editar la fecha de alta ante el IMSS'
    ),
    (
        1,
        'empleados.ver_historial_reingresos',
        'Visualizar Historial de Reingresos',
        'Permite visualizar el historial de reingresos'
    ),
    (
        1,
        'empleados.editar_historial_reingresos',
        'Editar Historial de Reingresos',
        'Permite editar el historial de reingresos'
    ),
    (
        1,
        'empleados.ver_horarios',
        'Visualizar Horarios',
        'Permite visualizar los horarios de los empleados'
    ),
    (
        1,
        'empleados.editar_horarios',
        'Editar Horarios',
        'Permite editar los horarios de los empleados'
    ),
    (
        1,
        'empleados.ver_horarios_oficiales',
        'Visualizar Horarios Oficiales',
        'Permite visualizar los horarios oficiales'
    ),
    (
        1,
        'empleados.editar_horarios_oficiales',
        'Editar Horarios Oficiales',
        'Permite editar los horarios oficiales'
    );

-- Insertar Permisos Para Registro
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        2,
        'registro_empleados.ver_menu',
        'Registrar Empleados',
        'Permite visualizar el apartado de registro de empleados en el menú lateral'
    );

-- Insertar Permisos para prestamos

INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        3,
        'prestamos.ver_menu',
        'Visualzar Prestamos',
        'Permite visualizar el apartado de Prestamos de empleados en el menú lateral'
    ),
    (
        3,
        'prestamos.registrar_prestamo',
        'Registrar Prestamo',
        'Permite registrar nuevos préstamos para los empleados'
    ),
    (
        3,
        'prestamos.editar_prestamo',
        'Editar Prestamo',
        'Permite editar los préstamos existentes de los empleados'
    ),
    (
        3,
        'prestamos.registrar_abono',
        'Registrar Abono',
        'Permite registrar nuevos abonos para los préstamos de los empleados'
    ),
    (
        3,
        'prestamos.editar_abono',
        'Editar Abono',
        'Permite editar los abonos existentes de los préstamos de los empleados'
    ),
    (
        3,
        'prestamos.editar_plan_pago',
        'Editar Plan de Pago',
        'Permite editar el plan de pago de los préstamos de los empleados'
    );

-- Insertar Permisos para Aguinaldos
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        4,
        'aguinaldos.ver_menu',
        'Visualizar Aguinaldos',
        'Permite visualizar el apartado de Aguinaldos en el menú lateral'
    ),
    (
        4,
        'aguinaldos.generar_aguinaldo',
        'Generar Aguinaldo',
        'Permite generar nuevos aguinaldos para los empleados'
    ),
    (
        4,
        'aguinaldos.eliminar_aguinaldo',
        'Eliminar Aguinaldo',
        'Permite eliminar la información de aguinaldos existentes de los empleados'
    );

-- Insertar Permisos para PTU
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        5,
        'ptu.ver_menu',
        'Visualizar PTU',
        'Permite visualizar el apartado de PTU en el menú lateral'
    ),
    (
        5,
        'ptu.generar_ptu',
        'Generar PTU',
        'Permite generar nuevos PTU para los empleados'
    ),
    (
        5,
        'ptu.eliminar_ptu',
        'Eliminar PTU',
        'Permite eliminar la información de PTU existentes de los empleados'
    );

-- Insertar Permisos para reloj 8 hrs
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        6,
        'reloj_8hrs.ver_menu',
        'Visualizar Reloj 8 Hrs',
        'Permite visualizar el apartado de Reloj 8 Hrs en el menú lateral'
    ),
    (
        6,
        'reloj_8hrs.ver_historial',
        'Ver Historial',
        'Permite visualizar el historial de Reloj 8 Hrs'
    );

-- Insertar Permisos para tickets manuales
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        7,
        'tickets_manuales.ver_menu',
        'Visualizar tickets Manuales',
        'Permite visualizar el apartado de tickets Manuales en el menú lateral para crear tickets de empleados'
    );

-- Insertar Permisos para el control de vacaciones
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        8,
        'vacaciones.ver_menu',
        'Visualizar Vacaciones',
        'Permite visualizar el apartado de Vacaciones en el menú lateral para gestionar las vacaciones de los empleados'
    );

-- Insertar Permisos para el control de gafetes
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        9,
        'gafetes.ver_menu',
        'Visualizar Gafetes',
        'Permite visualizar el apartado de Gafetes en el menú lateral para gestionar los gafetes de los empleados'
    );

-- Insertar Permisos para el control de contratos
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        10,
        'contratos.ver_menu',
        'Visualizar Contratos',
        'Permite visualizar el apartado de Contratos en el menú lateral para gestionar los contratos     de los empleados'
    ),
    (
        10,
        'contratos.generar_contratos',
        'Generar Contratos de Empleados',
        'Permite generar nuevos contratos para los empleados'
    ),
    (
        10,
        'contratos.personalizar_contratos',
        'Personalizar Contratos de Empleados',
        'Permite personalizar los contratos de los empleados'
    );

-- Insertar Permisos para el control de Expedientes
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        11,
        'expedientes.ver_menu',
        'Visualizar Expedientes',
        'Permite visualizar el apartado de Expedientes en el menú lateral para gestionar los expedientes de los empleados'
    );

-- Insertar Permisos para el control de Lista de asistencia
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        12,
        'asistencia.ver_menu',
        'Visualizar Lista de Asistencia',
        'Permite visualizar el apartado de Lista de Asistencia en el menú lateral para gestionar la asistencia de los empleados'
    );

-- Insertar Permisos para el control de Claves de autorización
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        13,
        'claves_autorizacion.ver_menu',
        'Visualizar Claves de Autorización',
        'Permite visualizar el apartado de Claves de Autorización en el menú lateral para gestionar las claves de autorización'
    );

-- Insertar Permisos para el control de Nominas
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        14,
        'nomina.crear_nomina40lbs',
        'Crear Nómina 40 Lbs',
        'Permite crear la nómina de 40 Libras de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina40lbs_jornal',
        'Crear Nómina 40 Lbs Por salario Diario',
        'Permite crear la nómina de 40 Libras de los empleados que trabajan por sueldo diario'
    ),
    (
        14,
        'nomina.crear_nomina10lbs',
        'Crear Nómina 10 Lbs',
        'Permite crear la nómina de 10 Libras de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina_confianza',
        'Crear Nómina Confianza',
        'Permite crear la nómina de Confianza de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina_relicario',
        'Crear Nómina Relicario',
        'Permite crear la nómina de Relicario de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina_pilar',
        'Crear Nómina Pilar',
        'Permite crear la nómina de Pilar de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina_huasteca',
        'Crear Nómina Huasteca',
        'Permite crear la nómina de Huasteca de los empleados'
    ),
    (
        14,
        'nomina.crear_nomina_palmilla',
        'Crear Nómina Palmilla',
        'Permite crear la nómina de Palmilla de los empleados'
    ),
    (
        14,
        'nomina.ver_historial40lbs',
        'Ver el Historial y Estadísticas de Nómina 40 Lbs',
        'Permite ver el historial y las estadísticas de la nómina de 40 Libras de los empleados'
    ),
    (
        14,
        'nomina.ver_historial40lbs_jornal',
        'Ver el Historial y Estadísticas de Nómina 40 Lbs Por salario Diario',
        'Permite ver el historial y las estadísticas de la nómina de 40 Libras de los empleados que trabajan por sueldo diario'
    ),
    (
        14,
        'nomina.ver_historial10lbs',
        'Ver el Historial y Estadísticas de Nómina 10 Lbs',
        'Permite ver el historial y las estadísticas de la nómina de 10 Libras de los empleados'
    ),
    (
        14,
        'nomina.ver_historial_confianza',
        'Ver el Historial y Estadísticas de Nómina Confianza',
        'Permite ver el historial y las estadísticas de la nómina de Confianza de los empleados'
    ),
    (
        14,
        'nomina.ver_historial_relicario',
        'Ver el Historial y Estadísticas de Nómina Relicario',
        'Permite ver el historial y las estadísticas de la nómina de Relicario de los empleados'
    ),
    (
        14,
        'nomina.ver_historial_pilar',
        'Ver el Historial y Estadísticas de Nómina Pilar',
        'Permite ver el historial y las estadísticas de la nómina de Pilar de los empleados'
    ),
    (
        14,
        'nomina.ver_historial_huasteca',
        'Ver el Historial y Estadísticas de Nómina Huasteca',
        'Permite ver el historial y las estadísticas de la nómina de Huasteca de los empleados'
    ),
    (
        14,
        'nomina.ver_historial_palmilla',
        'Ver el Historial y Estadísticas de Nómina Palmilla',
        'Permite ver el historial y las estadísticas de la nómina de Palmilla de los empleados'
    );

-- Insertar Permisos para el control de Nominas
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        15,
        'cortes.ver_menu',
        'Visualizar Vales de Corte',
        'Permite visualizar el apartado de Vales de Corte en el menú lateral para gestionar los vales de corte de cada Rancho'
    ),
    (
        15,
        'cortes.agregar_corte',
        'Agregar Corte',
        'Permite agregar un nuevo corte de cada Rancho'
    ),
    (
        15,
        'cortes.editar_corte',
        'Modificar Corte',
        'Permite editar un corte existente de cada Rancho'
    ),
    (
        15,
        'cortes.cancelar_corte',
        'Cancelar Corte',
        'Permite cancelar un corte existente de cada Rancho'
    );

-- Insertar Permisos para las configuraciones del sistema
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        16,
        'configuracion.ver_menu',
        'Visualizar Configuración',
        'Permite visualizar el apartado de Configuración en el menú lateral para gestionar la configuración del sistema'
    );

-- Insertar Permisos para el panel de administración del sistema
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        17,
        'panel_admin.ver_menu',
        'Visualizar Panel de Administración',
        'Permite visualizar el apartado de Panel de Administración en el menú lateral para gestionar los permisos del sistema'
    );

-- Insertar Permisos para Administración de los Casilleros
INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        18,
        'casilleros.ver_menu',
        'Visualizar Casilleros',
        'Permite visualizar el apartado de Casilleros en el menú lateral para gestionar los casilleros del sistema'
    );


    INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        14,
        'nomina.ver_estadisticas_nomina',
        'Visualizar Estadísticas de las Nóminas',
        'Permite visualizar el apartado de Estadísticas de Nómina en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.crear_responsivas',
        'Realizar Responsivas de Nómina',
        'Permite Realizar las responsivas de nominas'
    );


        INSERT INTO
    permisos (
        id_modulo,
        clave_permiso,
        nombre_permiso,
        descripcion
    )
VALUES (
        14,
        'nomina.ver_estadisticas40lbs',
        'Visualizar Estadísticas de 40 Lbs',
        'Permite visualizar el apartado de Estadísticas de 40 Lbs en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas40lbs_jornal',
        'Visualizar Estadísticas de 40 Lbs por Jornal',
        'Permite visualizar el apartado de Estadísticas de 40 Lbs por Jornal en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas10lbs',
        'Visualizar Estadísticas de 10 Lbs',
        'Permite visualizar el apartado de Estadísticas de 10 Lbs en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas_confianza',
        'Visualizar Estadísticas de Confianza',
        'Permite visualizar el apartado de Estadísticas de Confianza en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas_relicario',
        'Visualizar Estadísticas de Relicario',
        'Permite visualizar el apartado de Estadísticas de Relicario en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas_pilar',
        'Visualizar Estadísticas de Pilar',
        'Permite visualizar el apartado de Estadísticas de Pilar en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas_huasteca',
        'Visualizar Estadísticas de Huasteca',
        'Permite visualizar el apartado de Estadísticas de Huasteca en el menú lateral para gestionar las estadísticas de la nómina'
    ),
    (
        14,
        'nomina.ver_estadisticas_palmilla',
        'Visualizar Estadísticas de Palmilla',
        'Permite visualizar el apartado de Estadísticas de Palmilla en el menú lateral para gestionar las estadísticas de la nómina'
    );