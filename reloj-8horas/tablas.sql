CREATE TABLE historial_biometrico (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  biometrios longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(biometrios)),
  num_sem int(11) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  observacion varchar(120) NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp()
);