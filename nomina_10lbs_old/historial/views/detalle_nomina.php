<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalle Nómina 10LBS</title>
    <?php
    include "../../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../../css/nomina_10lbs.css">
    <link rel="stylesheet" href="../../css/encabezados.css">
    <link rel="stylesheet" href="../../css/tablaNomina.css">
    <link rel="stylesheet" href="../../css/conceptos_totales.css">
    <link rel="stylesheet" href="../../css/modal10lbs.css">


    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../../public/views/navbar.php"
    ?>

    <div class="container-tabla-nomina-10lbs" id="tabla-nomina-responsive">
        <div class="header-tabla-10lbs">
            <div class="header-titulo-semana">
                <h3 id=nombre_nomina></h3>
                <span class="sem-info-10lbs" id="num_semana"></span>
            </div>
            <div class="header-controls-10lbs">
                <!-- Grupo 1: Servicios -->
                <div class="btn-group-10lbs btn-group-servicios">


                    <button class="btn btn-outline-primary" type="button" id="btn_capturar_clientes"
                        title="Capturar Clientes" aria-label="Visualizar Clientes">
                        <i class="bi bi-people-fill"></i>
                    </button>
                    <button class="btn btn-outline-primary" type="button" id="btn_cajas_general" title="Visualizar Cajas">
                        <i class="bi bi-grid-3x3-gap"></i>
                    </button>
                </div>

                <!-- Grupo 2: Configuración -->
                <div class="btn-group-10lbs btn-group-config">

                    <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_establecer_horario_semanal"
                        title="Establecer Horario Semanal" aria-label="Establecer Horario Semanal">
                        <i class="bi bi-calendar-check"></i>
                    </button>
                    <button class="btn btn-outline-info" id="btn_ver_dispersion" title="Ver Dispersión de Tarjeta">
                        <i class="bi bi-list-columns-reverse"></i>
                    </button>


                </div>

                <!-- Grupo 3: Procesamiento -->
                <div class="btn-group-10lbs btn-group-procesamiento">
                    <button class="btn btn-outline-primary btn-suma" type="button" id="btn_conceptos_totales"
                        title="Totales por concepto" aria-label="Totales por concepto">
                        <i class="bi bi-calculator"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-10lbs">
            <div class="filtros-container-10lbs">
                <select class="filtro-departamento-10lbs" id="filtro-departamento">
                    <!-- Se poblará dinámicamente -->
                </select>

                <div class="busqueda-container-10lbs" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-10lbs" placeholder="Buscar..." id="busqueda-nomina-10lbs">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda"
                        title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-10lbs">
                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>

                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Regresar a Historial de Nóminas">
                    <i class="bi bi-arrow-left"></i> Regresar
                </button>

            </div>
        </div>

        <div id="tabla-nomina-container-10lbs" class="tabla-nomina-container-10lbs">
            <div class="table-responsive-10lbs">
                <table class="table-nomina-10lbs" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">SUELDO <br> NETO</th>
                            <th rowspan="2">EXTRAS</th>
                            <th rowspan="2">Total Percepciones</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">AJUSTES <br> AL SUB</th>
                            <th rowspan="2" class="d-none">AUSENTISMO</th>
                            <th rowspan="2">PERMISO</th>
                            <th rowspan="2">UNIFORMES</th>
                            <th rowspan="2">BIOMETRICO</th>
                            <th rowspan="2">F.A/GAFET/COFIA</th>
                            <th rowspan="2">TOTAL DE <br> DEDUCCIONES</th>
                            <th rowspan="2">NETO A RECIBIR</th>
                            <th rowspan="2">DISPERSION DE <br> TARJETA</th>
                            <th rowspan="2">IMPORTE EN EFECTIVO</th>
                            <th rowspan="2">PRÉSTAMO</th>
                            <th rowspan="2">TOTAL A <br>RECIBIR</th>
                            <th rowspan="2">REDONDEADO</th>
                            <th rowspan="2">TOTAL EFECTIVO <br> REDONDEADO</th>

                        </tr>
                    </thead>
                    <tbody id="tabla-nomina-body-10lbs">
                        <!-- Filas de la tabla se generarán dinámicamente -->

                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>

    <!-- Menú contextual simple para la tabla -->
    <div id="context-menu"
        style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm-item" data-action="ver" style="padding:6px 12px;cursor:pointer;">Ver detalles</div>
    </div>


    <!-- Incluir el modal -->
    <?php include "modal10lbs.php"; ?>
    <?php include "modalEstablecerClientes.php"; ?>
    <?php include "modalCajasEmpacadas.php"; ?>
    <?php include "modalHorarioSemanal.php"; ?>
    <?php include "modalTotalConceptos.php"; ?>
    <?php include "modalDispersionTarjeta.php"; ?>



    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->

    <script src="../js/showDetalleNomina.js"></script>
    <script src="../js/filtroHistorial.js"></script>
    <script src="../js/abrirModalEmpleado.js"></script>
    <script src="../js/establecerDataEmpleado.js"></script>
    <script src="../js/establecerClientes.js"></script>
    <script src="../js/establecerCajasEmpacadas.js"></script>
    <script src="../js/establecerHorarioSemanal.js"></script>
    <script src="../js/establecerDispersionTarjeta.js"></script>
    <script src="../js/establecerTotalConceptos.js"></script>
    <script src="../js/exportarNomina.js"></script>
</body>

</html>