CREATE TABLE `cortes_relicario` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_nomina` int(11) NOT NULL,
  `nombre_cortador` varchar(150) NOT NULL,
  `folio` varchar(10) NOT NULL,
  `precio_reja` decimal(10,2) NOT NULL,
  `fecha_corte` date NOT NULL,
  FOREIGN KEY (id_nomina) REFERENCES nomina_relicario(id_nomina_relicario)
);

CREATE TABLE `cortes_relicario_tablas` (
  `id_corte` int(11) NOT NULL,
  `num_tabla` int(11) NOT NULL,
  `rejas` int(11) NOT NULL,
  foreign key (id_corte) references cortes_relicario(id)
);