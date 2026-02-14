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