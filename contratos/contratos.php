<?php
$rutaRaiz = "/sistema_saao";
include("../config/config.php");
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contratos - Módulo</title>
  <!-- Rutas relativas -->
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/public/styles/navbar_styles.css">
  <link rel="stylesheet" href="./styles/contratos.css">
  <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>
<body>
  <?php include("../public/views/navbar.php"); ?>
  
  <div class="container py-5">
    <!-- Header -->
    <div class="page-header">
      <h1>
        <i class="bi bi-file-earmark-text"></i>
        Módulo de Contratos
      </h1>
      <p>Administra plantillas y genera contratos laborales de forma rápida y profesional</p>
    </div>

    <!-- Cards de módulos -->
    <div class="row g-4">
      <!-- Plantillas -->
      <div class="col-12 col-md-6">
        <div class="module-card">
          <div class="module-card-icon">
            <i class="bi bi-file-earmark-code"></i>
          </div>
          <div class="module-card-body">
            <h5 class="module-card-title">Plantillas de Contratos</h5>
            <p class="module-card-text">
              Crea, edita o elimina plantillas de contrato personalizadas. 
              Utiliza placeholders dinámicos {{...}} para automatizar el llenado de datos.
            </p>
            <a href="./views/plantillas.php" class="module-btn">
              <i class="bi bi-gear"></i>
              Administrar Plantillas
            </a>
          </div>
        </div>
      </div>

      <!-- Generar Contrato -->
      <div class="col-12 col-md-6">
        <div class="module-card">
          <div class="module-card-icon">
            <i class="bi bi-file-earmark-plus"></i>
          </div>
          <div class="module-card-body">
            <h5 class="module-card-title">Generar Contratos</h5>
            <p class="module-card-text">
              Selecciona un empleado de la lista, elige una plantilla y genera contratos 
              con información precargada desde la base de datos.
            </p>
            <a href="./views/lista_empleados.php" class="module-btn">
              <i class="bi bi-plus-circle"></i>
              Ir a Generar
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="<?= JQUERY_JS ?>"></script>
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>
</body>
</html>