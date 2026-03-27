-- Tablas para los cortes de huasteca
CREATE TABLE cortes_huasteca (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina INT(11) NOT NULL,
  nombre_cortador VARCHAR(150) NOT NULL,
  folio VARCHAR(10) NOT NULL,
  precio_reja DECIMAL(10,2) NOT NULL,
  fecha_corte DATE NOT NULL,
  FOREIGN KEY (id_nomina) 
    REFERENCES nomina_huasteca(id_nomina_huasteca)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

CREATE TABLE cortes_huasteca_tablas (
  id_corte INT(11) NOT NULL,
  num_tabla INT(11) NOT NULL,
  rejas INT(11) NOT NULL,
  FOREIGN KEY (id_corte) 
    REFERENCES cortes_huasteca(id)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);