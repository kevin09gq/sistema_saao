<?php
// contratos/views/lista_empleados.php
 include "../../config/config.php";
 verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Empleados - Generar contratos</title>
  <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/lista_empleados.css">
  <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>
<body>
  <?php include '../../public/views/navbar.php'; ?>
  <div class="container py-4">
    <!-- Header -->
    <div class="page-header">
      <h1><i class="bi bi-people-fill"></i> Lista de Empleados</h1>
      <p>Selecciona un empleado y una plantilla para generar su contrato laboral</p>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <a href="<?= $rutaRaiz ?>/contratos/contratos.php" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left-circle me-1"></i>
          Regresar a Contratos
        </a>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filter-card">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label for="filtroDepartamento"><i class="bi bi-building"></i> Filtrar por Departamento</label>
          <select id="filtroDepartamento" class="form-select">
            <option value="">Todos los departamentos</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="ordenarPor"><i class="bi bi-sort-down"></i> Ordenar por</label>
          <select id="ordenarPor" class="form-select">
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
            <option value="clave_asc">Clave (Ascendente)</option>
            <option value="clave_desc">Clave (Descendente)</option>
            <option value="departamento">Departamento</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="buscarEmpleado"><i class="bi bi-search"></i> Buscar</label>
          <input type="text" id="buscarEmpleado" class="form-control" placeholder="Nombre o clave...">
        </div>
        <div class="col-md-2">
          <button id="btnLimpiarFiltros" class="btn btn-outline-secondary w-100">
            <i class="bi bi-x-circle"></i> Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-card">
      <div class="table-card-header">
        <i class="bi bi-table"></i> Empleados Registrados
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0" id="tablaEmpleados">
          <thead>
            <tr>
              <th class="text-nowrap">Clave</th>
              <th>Nombre Completo</th>
              <th class="text-nowrap">Departamento</th>
              <th style="min-width:220px">Plantilla de Contrato</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Se llena por JS -->
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      <div class="pagination-container">
        <div class="info-text">
          Mostrando <strong id="infoInicio">0</strong> a <strong id="infoFin">0</strong> de <strong id="infoTotal">0</strong> empleados
        </div>
        <nav>
          <ul class="pagination" id="paginacion">
            <!-- Se llena por JS -->
          </ul>
        </nav>
      </div>
    </div>
  </div>

   <script src="<?= JQUERY_JS ?>"></script>
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>
  <script src="<?= $rutaRaiz ?>/contratos/js/lista_empleados.js"></script>
</body>
</html>
