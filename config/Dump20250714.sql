-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: control_nomina
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anio`
--

DROP TABLE IF EXISTS `anio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anio` (
  `id_anio` int NOT NULL AUTO_INCREMENT,
  `numero_anio` int NOT NULL,
  PRIMARY KEY (`id_anio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anio`
--

LOCK TABLES `anio` WRITE;
/*!40000 ALTER TABLE `anio` DISABLE KEYS */;
/*!40000 ALTER TABLE `anio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia_dia`
--

DROP TABLE IF EXISTS `asistencia_dia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia_dia` (
  `id_asistencia_dia` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `clave_empleado` int DEFAULT NULL,
  `id_semana` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `horas_comida` decimal(4,2) DEFAULT NULL,
  `horas_trabajadas` decimal(4,2) DEFAULT NULL,
  `minutos_trabajados` int DEFAULT NULL,
  PRIMARY KEY (`id_asistencia_dia`),
  KEY `id_empleado` (`id_empleado`),
  KEY `id_semana` (`id_semana`),
  KEY `clave_empleado` (`clave_empleado`),
  CONSTRAINT `asistencia_dia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `asistencia_dia_ibfk_2` FOREIGN KEY (`id_semana`) REFERENCES `info_semana` (`id_semana`),
  CONSTRAINT `asistencia_dia_ibfk_3` FOREIGN KEY (`clave_empleado`) REFERENCES `info_empleados` (`clave_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia_dia`
--

LOCK TABLES `asistencia_dia` WRITE;
/*!40000 ALTER TABLE `asistencia_dia` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencia_dia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia_semana`
--

DROP TABLE IF EXISTS `asistencia_semana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia_semana` (
  `id_asistencia_semana` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `clave_empleado` int DEFAULT NULL,
  `id_semana` int NOT NULL,
  `total_horas_trabajadas` decimal(6,2) DEFAULT NULL,
  `total_minutos_trabajados` int DEFAULT NULL,
  `total_horas_comida` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`id_asistencia_semana`),
  KEY `id_empleado` (`id_empleado`),
  KEY `id_semana` (`id_semana`),
  KEY `clave_empleado` (`clave_empleado`),
  CONSTRAINT `asistencia_semana_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `asistencia_semana_ibfk_2` FOREIGN KEY (`id_semana`) REFERENCES `info_semana` (`id_semana`),
  CONSTRAINT `asistencia_semana_ibfk_3` FOREIGN KEY (`clave_empleado`) REFERENCES `info_empleados` (`clave_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia_semana`
--

LOCK TABLES `asistencia_semana` WRITE;
/*!40000 ALTER TABLE `asistencia_semana` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencia_semana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacto_emergencia`
--

DROP TABLE IF EXISTS `contacto_emergencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacto_emergencia` (
  `id_contacto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `ap_paterno` varchar(100) DEFAULT NULL,
  `ap_materno` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `domicilio` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_contacto`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacto_emergencia`
--

LOCK TABLES `contacto_emergencia` WRITE;
/*!40000 ALTER TABLE `contacto_emergencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacto_emergencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id_departamento` int NOT NULL AUTO_INCREMENT,
  `nombre_departamento` varchar(100) NOT NULL,
  PRIMARY KEY (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,'Administración'),(2,'Personal de Confianza Produccion'),(3,'Seguridad Vigilancia e Intendencia'),(4,'Produccion 40 Libras'),(5,'Produccion 10 Libras'),(6,'Rancho Relicario\n'),(7,'Ranchos'),(8,'Administracion Sucursal CdMx');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado_contacto`
--

DROP TABLE IF EXISTS `empleado_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleado_contacto` (
  `id_empleado_contacto` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `id_contacto` int DEFAULT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_empleado_contacto`),
  KEY `id_empleado` (`id_empleado`),
  KEY `empleado_contacto_ibfk_2` (`id_contacto`),
  CONSTRAINT `empleado_contacto_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `empleado_contacto_ibfk_2` FOREIGN KEY (`id_contacto`) REFERENCES `contacto_emergencia` (`id_contacto`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado_contacto`
--

LOCK TABLES `empleado_contacto` WRITE;
/*!40000 ALTER TABLE `empleado_contacto` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleado_contacto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gafetes`
--

DROP TABLE IF EXISTS `gafetes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gafetes` (
  `id_gafete` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `clave_empleado` int DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_gafete`),
  KEY `id_empleado` (`id_empleado`),
  KEY `clave_empleado` (`clave_empleado`),
  CONSTRAINT `gafetes_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `gafetes_ibfk_2` FOREIGN KEY (`clave_empleado`) REFERENCES `info_empleados` (`clave_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gafetes`
--

LOCK TABLES `gafetes` WRITE;
/*!40000 ALTER TABLE `gafetes` DISABLE KEYS */;
/*!40000 ALTER TABLE `gafetes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inasistencias`
--

DROP TABLE IF EXISTS `inasistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inasistencias` (
  `id_inasistencia` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `id_semana` int NOT NULL,
  `fecha` date NOT NULL,
  `minutos_no_trabajados` int DEFAULT NULL,
  PRIMARY KEY (`id_inasistencia`),
  KEY `id_empleado` (`id_empleado`),
  KEY `id_semana` (`id_semana`),
  CONSTRAINT `inasistencias_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `inasistencias_ibfk_2` FOREIGN KEY (`id_semana`) REFERENCES `info_semana` (`id_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inasistencias`
--

LOCK TABLES `inasistencias` WRITE;
/*!40000 ALTER TABLE `inasistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `inasistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_admin`
--

DROP TABLE IF EXISTS `info_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_admin` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ap_paterno` varchar(100) DEFAULT NULL,
  `ap_materno` varchar(100) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `info_admin_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_admin`
--

LOCK TABLES `info_admin` WRITE;
/*!40000 ALTER TABLE `info_admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_empleados`
--

DROP TABLE IF EXISTS `info_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_empleados` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL,
  `id_status` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ap_paterno` varchar(100) NOT NULL,
  `ap_materno` varchar(100) NOT NULL,
  `domicilio` text,
  `imss` varchar(20) DEFAULT NULL,
  `curp` varchar(20) DEFAULT NULL,
  `sexo` enum('M','F') NOT NULL,
  `enfermedades_alergias` text,
  `grupo_sanguineo` varchar(5) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `id_departamento` int DEFAULT NULL,
  `clave_empleado` int NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `clave_empleado` (`clave_empleado`),
  KEY `id_rol` (`id_rol`),
  KEY `id_status` (`id_status`),
  KEY `id_departamento` (`id_departamento`),
  CONSTRAINT `info_empleados_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `info_empleados_ibfk_2` FOREIGN KEY (`id_status`) REFERENCES `status` (`id_status`),
  CONSTRAINT `info_empleados_ibfk_3` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_empleados`
--

LOCK TABLES `info_empleados` WRITE;
/*!40000 ALTER TABLE `info_empleados` DISABLE KEYS */;
INSERT INTO `info_empleados` VALUES (10,2,1,'LETICIA','ALVAREZ','SOSA',NULL,NULL,NULL,'F',NULL,NULL,NULL,1,3),(11,2,1,'GUADALUPE','GUTIERREZ','MELENDEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,9),(12,2,1,'DORA GUILLERMINA','GARCIA','CELIS',NULL,NULL,NULL,'F',NULL,NULL,NULL,1,15),(13,2,1,'MANUEL ANTONIO','SAAVEDRA','BONILLA',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,19),(14,2,1,'GAMALIEL','PADILLA','VILLEGAS',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,40),(15,2,1,'EVA MARIA','LARA','BARRIOS',NULL,NULL,NULL,'F',NULL,NULL,NULL,1,88),(16,2,1,'JOAN','MELO','HERNANDEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,93),(17,2,1,'IVETTE','BRINGAS','MEJIA',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,99),(18,2,1,'ZAIDE ABIGAHIL','BARRIENTOS','GOMEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,166),(19,2,1,'ESMERALDA','LORENZO','BARTOLOME',NULL,NULL,NULL,'F',NULL,NULL,NULL,1,178),(20,2,1,'IVAN','GARCIA','OCHOA',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,179),(21,2,1,'RAMON ARTURO','RODRIGUEZ','ARROYO',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,240),(22,2,1,'ERICK ADRIAN','ROMAN','MENDEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,1,272),(23,2,1,'FIDENCIO','ABURTO','JIMENEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,2),(24,2,1,'OMAR URIEL','FLORES','ROJAS',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,7),(25,2,1,'ROBERTO','RIVERA','HERNANDEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,16),(26,2,1,'ESMERALDA','ROCHA','GARCIA',NULL,NULL,NULL,'F',NULL,NULL,NULL,2,17),(27,2,1,'GERMAN','JUAREZ','SANTANA',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,36),(28,2,1,'RENATO','PEÑA','RAMIREZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,41),(29,2,1,'MAYRA LILIANA','AGUILAR','DOMINGUEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,2,94),(30,2,1,'EDMAR','PREZA','JUAREZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,116),(31,2,1,'JULISSA','ANDRADE','GARCIA',NULL,NULL,NULL,'F',NULL,NULL,NULL,2,155),(32,2,1,'FELIPE DE JESUS','QUINTERO','ALBA',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,222),(33,2,1,'MARCOS RAFAEL','NAVA','GONZALEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,260),(34,2,1,'RAUL','AGUILERA','SALAZAR',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,282),(35,2,1,'FRANCISCO DE JESUS','GUERRERO','PREZA',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,287),(36,2,1,'JOVANY','GARCIA','ALBA',NULL,NULL,NULL,'M',NULL,NULL,NULL,2,295),(41,2,1,'MIGUEL','HERNANDEZ','MAZA',NULL,NULL,NULL,'M',NULL,NULL,NULL,3,33),(42,2,1,'GLORIA','RUIZ','ROBLES',NULL,NULL,NULL,'F',NULL,NULL,NULL,3,320),(44,2,1,'JESUS GERARDO','OREA DE','JESUS',NULL,NULL,NULL,'M',NULL,NULL,NULL,3,12),(45,2,1,'ALICIA','ABUNDIO','SANTOS',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,1),(46,2,1,'LUCIA','COSSIO','MENDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,4),(47,2,1,'GUADALUPE','ENCARNACION','FLORES',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,6),(48,2,1,'JOSE','RODRIGUEZ','ORTIZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,18),(49,2,1,'PATRICIA','VILLEGAS','GUEVARA',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,24),(50,2,1,'PAULINA','ZARATE','ANTONIO',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,26),(51,2,1,'JOSE LUIS','RODRIGUEZ','ESPINOSA',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,71),(52,2,1,'GUADALUPE','DOMINGUEZ','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,102),(53,2,1,'SIXTO','GIL','VAZQUEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,110),(54,2,1,'ELIZABETH','RODRIGUEZ','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,124),(55,2,1,'TERESA','POLO','JUAREZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,197),(56,2,1,'VICTOR MANUEL','BAUTISTA','MORALES',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,200),(57,2,1,'SUGEYDI','RIVERA','ARCOS',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,214),(58,2,1,'FLOR DE ROCIO','HERNANDEZ','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,220),(59,2,1,'LUIS ALBERTO','CAMACHO','HERRERA',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,225),(60,2,1,'RUTH','MARTINEZ','JUAREZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,235),(61,2,1,'HERIBERTO','MORGADO','HERRERA',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,236),(62,2,1,'GRISELDA','LOPEZ','JUAN',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,253),(63,2,1,'LUCIA','RUIZ','FILOBELLO',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,254),(64,2,1,'SERGIO','JUAREZ','GOMEZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,255),(65,2,1,'CONSUELO YANELI','GUZMAN','ALARCON','','','','F','','',NULL,4,257),(66,2,1,'SUSILY ZULEMA','LANZAGORTA','TOSCANO',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,273),(67,2,1,'KARINA','ALBA','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,274),(68,2,1,'YAMILETH','COSSIO','MENDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,275),(69,2,1,'OSCAR','RIVERA','LANDERO',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,290),(70,2,1,'MARIA DEL SOL','JUAREZ','VENTURA',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,294),(71,2,1,'ANA KAREN','PREZA','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,296),(72,2,1,'RICARDO ALFONSO','PINO','RUIZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,307),(73,2,1,'PAMELA','LARA','RIVERA',NULL,NULL,NULL,'F',NULL,NULL,NULL,4,311),(74,2,1,'VICTOR HUGO','PERDOMO','PREZA',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,336),(75,2,1,'LEANDRO','MIRANDA','ABAD',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,338),(76,2,1,'LUIS ANTONIO','HERNANDEZ','RAMOS',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,339),(77,2,1,'ALFONSO','HERNANDEZ','GARCIA',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,340),(78,2,1,'JOSUE DANIEL','LERDO','POSADAS',NULL,NULL,NULL,'M',NULL,NULL,NULL,4,341),(79,2,1,'MARIA GUADALUPE','LUNA','HERNANDEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,81),(80,2,1,'ESTHER','PREZA','ORTIZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,97),(81,2,1,'JUANA','LANDERO','LOZANO',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,100),(82,2,1,'GUADALUPE IVON','SANCHEZ DE','JESUS',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,139),(83,2,1,'MARIA DEL CARMEN','SANCHEZ DE','JESUS',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,140),(84,2,1,'NOELIA','CAMPOS','ESTEBAN',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,163),(85,2,1,'FATIMA MICHEL','JUAREZ','PREZA',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,171),(86,2,1,'MARIA DE LOS ANGELES','DIAZ','SANCHEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,186),(87,2,1,'LIZETH','LOPEZ','MARTINEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,209),(88,2,1,'ROSALBA','JUAREZ','PILAR',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,215),(89,2,1,'ALMA IDALIA','SANTIAGO','SALAZAR',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,221),(90,2,1,'SULLY IRANY','PARRA','SOLANO',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,227),(91,2,1,'MARIELY','VAZQUEZ','RUIZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,5,286),(92,2,1,'JERONIMO','MARQUEZ','DAMIAN',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,242),(93,2,1,'SALVADOR','REYES','MURRIETA',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,304),(94,2,1,'VICTOR HUGO','MARTINEZ','ROMERO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,329),(95,2,1,'LUIS EDUARDO','MARTINEZ','ROMERO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,330),(96,2,1,'ISMAEL','LOZANO','ALARCON',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,333),(97,2,1,'FELIX','DE LA CRUZ','GALICIA',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,342),(98,2,1,'ALEJANDRO','LOPEZ','BELLO','','','','M','','',NULL,6,343),(99,2,1,'CESAR','MORALES','UBALDO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,344),(100,2,1,'FERNANDO','ROSAS','PARRALES',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,345),(101,2,1,'GUADALUPE','VAZQUEZ','RAMIRO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,346),(102,2,1,'JESUS ALBERTO','HERNANDEZ','RAMIREZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,347),(103,2,1,'LEONARDO','PEREZ','SOTO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,348),(104,2,1,'MARIA','RAMIRO','LUCIANO',NULL,NULL,NULL,'F',NULL,NULL,NULL,6,349),(105,2,1,'PABLO','PEREZ','SOTO',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,350),(106,2,1,'RAYMUNDO','PEREZ','JUAREZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,351),(107,2,1,'VICTOR EMILIO','ALBINO','CALDERON',NULL,NULL,NULL,'M',NULL,NULL,NULL,6,353),(108,2,1,'JOSE','AARON','CADENA',NULL,NULL,NULL,'M',NULL,NULL,NULL,7,27),(109,2,1,'AMADA','GARCIA','MARTINEZ',NULL,NULL,NULL,'F',NULL,NULL,NULL,7,194),(110,2,1,'BEATRIZ','LOPEZ','LERDO',NULL,NULL,NULL,'F',NULL,NULL,NULL,7,196),(111,2,1,'MAGALY','VELAZCO','ASCENCION',NULL,NULL,NULL,'F',NULL,NULL,NULL,7,208),(112,2,1,'VICTOR MANUEL','RODRIGUEZ','CRUZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,7,292),(113,2,1,'LIZBETH','LUGO DE','FERMIN',NULL,NULL,NULL,'F',NULL,NULL,NULL,7,334),(114,2,1,'IRMA DEL CARMEN','SALINAS','CASTELLANOS',NULL,NULL,NULL,'F',NULL,NULL,NULL,8,206),(115,2,1,'LEAL PABLO AXEL','ESPINOSA','DIAZ',NULL,NULL,NULL,'M',NULL,NULL,NULL,8,337),(116,2,1,'Jose','Perdomo','Hernandez','','','','M','','',NULL,1,99999);
/*!40000 ALTER TABLE `info_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_semana`
--

DROP TABLE IF EXISTS `info_semana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_semana` (
  `id_semana` int NOT NULL AUTO_INCREMENT,
  `dia_apertura` date NOT NULL,
  `dia_cierre` date NOT NULL,
  `mes` int NOT NULL,
  `num_semana` int NOT NULL,
  `id_anio` int NOT NULL,
  PRIMARY KEY (`id_semana`),
  KEY `id_anio` (`id_anio`),
  CONSTRAINT `info_semana_ibfk_1` FOREIGN KEY (`id_anio`) REFERENCES `anio` (`id_anio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_semana`
--

LOCK TABLES `info_semana` WRITE;
/*!40000 ALTER TABLE `info_semana` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_semana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nomina`
--

DROP TABLE IF EXISTS `nomina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nomina` (
  `id_nomina` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `clave_empleado` int NOT NULL,
  `dia_apertura` date NOT NULL,
  `dia_cierre` date NOT NULL,
  `id_semana` int NOT NULL,
  `sueldo_neto` decimal(10,2) DEFAULT NULL,
  `incentivo` decimal(10,2) DEFAULT NULL,
  `extra` decimal(10,2) DEFAULT NULL,
  `vacaciones` decimal(10,2) DEFAULT NULL,
  `prestamo` decimal(10,2) DEFAULT NULL,
  `inasistencias` decimal(10,2) DEFAULT NULL,
  `uniformes` decimal(10,2) DEFAULT NULL,
  `isr` decimal(10,2) DEFAULT NULL,
  `imss` decimal(10,2) DEFAULT NULL,
  `tarjeta` decimal(10,2) DEFAULT NULL,
  `id_pgdf_colfa` int DEFAULT NULL,
  `sueldo_cobrar` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_nomina`),
  KEY `id_empleado` (`id_empleado`),
  KEY `clave_empleado` (`clave_empleado`),
  KEY `id_semana` (`id_semana`),
  CONSTRAINT `nomina_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `info_empleados` (`id_empleado`),
  CONSTRAINT `nomina_ibfk_2` FOREIGN KEY (`clave_empleado`) REFERENCES `info_empleados` (`clave_empleado`),
  CONSTRAINT `nomina_ibfk_3` FOREIGN KEY (`id_semana`) REFERENCES `info_semana` (`id_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina`
--

LOCK TABLES `nomina` WRITE;
/*!40000 ALTER TABLE `nomina` DISABLE KEYS */;
/*!40000 ALTER TABLE `nomina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'admin'),(2,'empleado');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `id_status` int NOT NULL AUTO_INCREMENT,
  `nombre_status` varchar(50) NOT NULL,
  PRIMARY KEY (`id_status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (1,'Activo'),(2,'Baja');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-14 12:57:05
