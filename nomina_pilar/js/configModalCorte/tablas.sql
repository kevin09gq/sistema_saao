CREATE TABLE cortes_pilar (
  id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_nomina int(11) NOT NULL,
  nombre_cortador varchar(150) NOT NULL,
  folio varchar(10) NOT NULL,
  precio_reja decimal(10,2) NOT NULL,
  fecha_corte date NOT NULL,
  FOREIGN KEY (id_nomina) REFERENCES nomina_pilar(id_nomina_pilar)
);

CREATE TABLE cortes_pilar_tablas (
  id_corte int(11) NOT NULL,
  num_tabla int(11) NOT NULL,
  rejas int(11) NOT NULL,
  foreign key (id_corte) references cortes_pilar(id)
);





-- Nomina principal
CREATE TABLE nomina_pilar (
    id_nomina_pilar INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    numero_semana INT NOT NULL,
    nomina_pilar LONGTEXT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);