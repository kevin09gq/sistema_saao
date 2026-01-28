-- ====================================
-- TABLAS PARA EL MODULO DE PRESTAMOS
-- ====================================

CREATE TABLE IF NOT EXISTS `prestamos` (
  `id_prestamo` int(11) NOT NULL AUTO_INCREMENT,
  `id_empleado` int(11) NOT NULL,
  `folio` varchar(100) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `semana` int(11) NOT NULL,
  `anio` year(4) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('activo','liquidado','pausado') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_prestamo`),
  foreign key (`id_empleado`) references `info_empleados`(`id_empleado`) on delete cascade
);

CREATE TABLE IF NOT EXISTS `prestamos_abonos` (
  `id_abono` int(11) NOT NULL AUTO_INCREMENT,
  `id_prestamo` int(11) NOT NULL,
  `monto_pago` decimal(10,2) NOT NULL,
  `num_sem_pago` int(11) NOT NULL,
  `anio_pago` year(4) NOT NULL DEFAULT current_timestamp(),
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp(),
  `es_nomina` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_abono`),
  foreign key (`id_prestamo`) references `prestamos`(`id_prestamo`) on delete cascade
);

CREATE TABLE IF NOT EXISTS `planes_pagos` (
  `id_plan` int(11) NOT NULL AUTO_INCREMENT,
  `id_prestamo` int(11) NOT NULL,
  `sem_inicio` int(11) NOT NULL,
  `anio_inicio` year(4) NOT NULL,
  `sem_fin` int(11) NOT NULL,
  `anio_fin` int(11) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_plan`),
  foreign key (`id_prestamo`) references `prestamos`(`id_prestamo`) on delete cascade
);

CREATE TABLE IF NOT EXISTS `detalle_planes` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_plan` int(11) NOT NULL,
  `detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`detalle`)),
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_detalle`),
  foreign key (`id_plan`) references `planes_pagos`(`id_plan`) on delete cascade
);





-- ====================================
-- TABLAS QUE YA EXISTIAN EN EL SISTEMA
-- ==================================== 

CREATE TABLE IF NOT EXISTS `info_empleados` (
  `id_empleado` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `id_status` int(11) NOT NULL,
  `clave_empleado` varchar(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `ap_paterno` varchar(50) NOT NULL,
  `ap_materno` varchar(50) NOT NULL,
  `domicilio` varchar(150) DEFAULT NULL,
  `imss` varchar(20) DEFAULT NULL,
  `curp` varchar(20) DEFAULT NULL,
  `sexo` enum('M','F') DEFAULT NULL,
  `enfermedades_alergias` varchar(150) DEFAULT NULL,
  `grupo_sanguineo` varchar(5) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `ruta_foto` varchar(255) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_vigencia` date DEFAULT NULL,
  `salario_semanal` decimal(10,2) DEFAULT 0.00,
  `salario_diario` decimal(10,2) DEFAULT 0.00,
  `id_puestoEspecial` int(11) DEFAULT NULL,
  `id_departamento` int(11) DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  `biometrico` int(11) DEFAULT NULL,
  `telefono_empleado` varchar(10) DEFAULT NULL,
  `status_nss` tinyint(1) DEFAULT 0,
  `rfc_empleado` varchar(13) DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `horario_fijo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_empleado`),
  KEY `id_rol` (`id_rol`),
  KEY `id_status` (`id_status`),
  KEY `id_puestoEspecial` (`id_puestoEspecial`),
  KEY `id_departamento` (`id_departamento`),
  KEY `id_area` (`id_area`),
  KEY `id_empresa` (`id_empresa`)
);

CREATE TABLE IF NOT EXISTS `empresa` (
  `id_empresa` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(150) NOT NULL,
  `logo_empresa` varchar(200) DEFAULT NULL,
  `rfc_empresa` varchar(12) DEFAULT NULL,
  `domicilio_fiscal` varchar(200) DEFAULT NULL,
  `marca_empresa` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_empresa`)
);


CREATE TABLE IF NOT EXISTS `departamentos` (
  `id_departamento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_departamento` varchar(100) NOT NULL,
  PRIMARY KEY (`id_departamento`)
);