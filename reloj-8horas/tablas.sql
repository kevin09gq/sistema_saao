CREATE TABLE historial_biometrico (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_empresa int(11) NOT NULL DEFAULT 1 COMMENT '1=SAAO, 2=SB',
  biometrios longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(biometrios)),
  num_sem int(11) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  observacion varchar(120) NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  INDEX idx_empresa_semana (id_empresa, num_sem, fecha_inicio, fecha_fin)
);