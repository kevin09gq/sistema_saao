<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Nómina 40LBS</title>
    <?php
    include "../../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <!-- Bootstrap CSS y Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- Google Fonts Inter para estética premium -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Estilos personalizados para el historial -->
    <link rel="stylesheet" href="../css/historial.css">
</head>

<body>
    <?php
    // Incluir el navbar
    include "../../../public/views/navbar.php";
    ?>

    <!-- Contenedor principal de la tabla de historial -->
    <div class="container container-tabla-nomina-40lbs mt-5">

        <!-- Encabezado de la Sección -->
        <div class="header-tabla-40lbs">
            <div class="header-titulo-semana">
                <div class="historial-title-container">
                    <i class="bi bi-clock-history historial-icon"></i>
                    <h3 class="m-0">Historial de Nóminas - 40 LBS</h3>
                </div>
            </div>

            <div class="header-controls-40lbs">
                <a href="../../views/nomina_40lbs.php" class="btn-historial-action">
                    <i class="bi bi-arrow-left"></i> Volver a Nómina
                </a>
            </div>
        </div>

        <!-- Controles de Filtros y Búsqueda -->
        <div class="controles-tabla-40lbs">
            <div class="filtros-container-40lbs">
                <!-- Selector de Año -->
                <select class="filtro-departamento-40lbs" id="filtro-anio" aria-label="Filtrar por año">
                  
                </select>

                <!-- Campo de Búsqueda -->
                <div class="busqueda-container-40lbs">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-40lbs" placeholder="Buscar por semana..." id="buscar-semana">
                    <button type="button" id="btn-clear-busqueda" title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>

            <!-- Información de estatus de visualización -->
            <div class="table-info-text d-none d-md-block">
                Registros de Nóminas 40 LBS
            </div>
        </div>

        <!-- Contenedor de la Tabla -->
        <div id="tabla-nomina-container-40lbs" class="tabla-nomina-container-40lbs">
            <div class="table-responsive-40lbs">
                <table class="table-historial" id="tabla-historial-nominas">
                    <thead>
                        <tr>
                            <th>Año</th>
                            <th>Nómina / Semana</th>
                            <th>Total Percepciones</th>
                            <th>Total Deducciones</th>
                            <th>Neto a Pagar</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-nominas">
                        <!-- Aquí se llenarán las filas de nóminas dinámicamente con JavaScript -->
                    </tbody>
                </table>
            </div>

            <!-- Pie de tabla con paginación idéntica a la de la imagen -->
            <div class="table-footer-container">

                <div class="table-info-text" id="info-paginacion"> </div>

                <ul class="pagination-custom" id="paginacion-nominas"> </ul>

            </div>
        </div>
    </div>

    <!-- Bootstrap JS y dependencias necesarias -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Script personalizado para manejar la lógica del historial -->
    <script src="../js/establecerNominas.js"></script>
</body>

</html>