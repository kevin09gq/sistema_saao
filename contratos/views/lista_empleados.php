<?php
// contratos/views/lista_empleados.php
require_once __DIR__ . "/../../public/php/config.php";
require_once __DIR__ . "/../../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("contratos.ver_menu");
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Empleados - Generar Contratos</title>
  <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

  <!-- Bootstrap 5 -->
  <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
  <!-- SweetAlert2 -->
  <script src="<?= SWEETALERT ?>"></script>

  <!-- Estilos propios consistentes con empleados.css -->
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/lista_empleados.css">
</head>

<body class="bg-light">
  <?php require_once __DIR__ . "/../../navbar/navbar.php"; ?>

  <div class="container-fluid py-4 px-md-4">

    <!-- ==========================================
         ENCABEZADO / ACCIONES SUPERIORES
         ========================================== -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1 class="h4 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
          <i class="bi bi-file-earmark-person text-success"></i> Generar Contratos de Empleados
        </h1>
        <div class="text-muted small">Selecciona un empleado y la plantilla correspondiente para generar su contrato laboral</div>
      </div>
      <div id="btn_plantillas" hidden>
        <a href="<?= $rutaRaiz ?>/contratos/views/plantillas.php" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1" >
          <i class="bi bi-file-earmark-text"></i> Ir a Plantillas
        </a>
      </div>
    </div>

    <!-- ==========================================
         FILTROS (Estilo Kardex / Empleados)
         ========================================== -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">

          <!-- Área -->
          <div class="col-md-2">
            <label for="filtroArea" class="form-label fw-semibold small text-muted">
              Área
            </label>
            <select id="filtroArea" class="form-select form-select-sm">
              <option value="">Todas las áreas</option>
            </select>
          </div>

          <!-- Departamento (Bloqueado hasta seleccionar área) -->
          <div class="col-md-3">
            <label for="filtroDepartamento" class="form-label fw-semibold small text-muted">
              Departamento
            </label>
            <select id="filtroDepartamento" class="form-select form-select-sm" disabled>
              <option value="">Departamento</option>
            </select>
          </div>

          <!-- Ordenar por -->
          <div class="col-md-2">
            <label for="ordenarPor" class="form-label fw-semibold small text-muted">
              Ordenar por
            </label>
            <select id="ordenarPor" class="form-select form-select-sm">
              <option value="nombre_asc">Nombre (A → Z)</option>
              <option value="nombre_desc">Nombre (Z → A)</option>
              <option value="clave_asc">Clave (Menor a mayor)</option>
              <option value="clave_desc">Clave (Mayor a menor)</option>
              <option value="area">Área</option>
              <option value="departamento">Departamento</option>
            </select>
          </div>

          <!-- Buscar -->
          <div class="col-md-3">
            <label for="buscarEmpleado" class="form-label fw-semibold small text-muted">
              Buscar
            </label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input type="search" id="buscarEmpleado" class="form-control form-control-sm border-start-0" placeholder="Nombre o clave...">
            </div>
          </div>

          <!-- Botón Limpiar -->
          <div class="col-md-2">
            <button id="btnLimpiarFiltros" class="btn btn-outline-secondary btn-sm w-100" type="button">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Limpiar
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ==========================================
         TABLA DE EMPLEADOS (Estilo Kardex / Empleados)
         ========================================== -->
    <div class="card border-0 shadow-sm">

      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span class="fw-bold small text-uppercase text-muted" style="letter-spacing: 0.5px;">
            <i class="bi bi-people-fill text-success me-1"></i> Empleados Registrados
          </span>
          <div class="text-muted small">
            Mostrando <strong id="infoInicio" class="text-dark">0</strong> a <strong id="infoFin" class="text-dark">0</strong> de <strong id="infoTotal" class="text-dark">0</strong> empleados
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" id="tablaEmpleados">
          <thead class="table-success">
            <tr>
              <th class="text-center" style="width: 120px;">Clave</th>
              <th>Nombre Completo</th>
              <th>Área</th>
              <th>Departamento</th>
              <th style="min-width: 250px;">Plantilla de Contrato</th>
              <th class="text-center" style="width: 130px;">Acción</th>
            </tr>
          </thead>
          <tbody>
            <!-- Se llena dinámicamente por JS -->
          </tbody>
        </table>
      </div>

      <!-- ==========================================
           PAGINACIÓN
           ========================================== -->
      <div class="card-footer bg-white py-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="text-muted small">
            Generación rápida de contratos laborales en formato PDF y editable
          </div>
          <nav aria-label="Navegación de páginas">
            <ul class="pagination pagination-sm mb-0" id="paginacion">
              <!-- Se llena dinámicamente por JS -->
            </ul>
          </nav>
        </div>
      </div>

    </div>

  </div>

   <script>
        // Pasar permisos de PHP a JavaScript
        const permisosUsuario = <?php echo json_encode($_SESSION["permisos"] ?? []); ?>;
    </script>

  <script src="<?= JQUERY_JS ?>"></script>
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= PERMISOS_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/contratos/js/permisos.js"></script>
  <script src="<?= $rutaRaiz ?>/contratos/js/lista_empleados.js"></script>

</body>

</html>