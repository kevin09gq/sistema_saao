<!DOCTYPE html>
<html lang="es">

<!--Incluir config.php para iniciar sesión -->
<?php
include "../../../config/config.php";
verificarSesion(); // Proteger esta página
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Nomina Huasteca</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    <link rel="stylesheet" href="../css/encabezadosDetalle.css">
    <link rel="stylesheet" href="../css/tablaNominaDetalle.css">
    <link rel="stylesheet" href="../../generacion/css/modalDetallesNomina.css">
    <link rel="stylesheet" href="../../generacion/css/conceptos_totales.css">


</head>

<body class="bg-secondary-subtle">
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../../public/views/navbar.php"
    ?>


    <!-- CONTENEDOR DE LA TABLA DE NÓMINA -->

    <div class="container-tabla-nomina-huasteca" id="tabla-nomina-responsive">
        <div class="header-tabla-huasteca">
            <div class="header-titulo-semana">
                <h3 id="nombre_nomina"></h3>
                <span class="sem-info-huasteca" id="num_semana"></span>
            </div>
            <div class="header-controls-huasteca">

                <button class="btn btn-outline-info" type="button" id="btnDispersionTarjeta">
                    <i class="bi bi-list-columns-reverse text-info"></i>
                    <span>Ver Dispersión de Tarjeta</span>
                </button>

                <button class="btn btn-outline-primary" type="button" id="btnConceptosTotales">
                    <i class="bi bi-calculator text-primary"></i>
                    <span>Totales por Concepto</span>
                </button>

            </div>
        </div>
        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-huasteca">
            <div class="filtros-container-huasteca">
                <select class="filtro-departamento-huasteca" id="detalle-filtro-departamento">
                    <!-- Se poblará dinámicamente -->
                </select>

                <div class="busqueda-container-huasteca" id="detalle-busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-huasteca" placeholder="Buscar..." id="detalle-busqueda-nomina-huasteca">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="detalle-btn-clear-busqueda"
                        title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-huasteca">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-warning" id="btnRegresar" title="Regresar">
                    <i class="bi bi-arrow-left"></i> Regresar
                </button>

            </div>
        </div>

        <div id="tabla-nomina-container-huasteca" class="tabla-nomina-container-huasteca">
            <div class="table-responsive-huasteca">
                <table class="table-nomina-huasteca" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2"> NOMBRE </th>
                            <th rowspan="2" class="col-jornalero">DÍAS <br> TRAB.</th>
                            <th rowspan="2">SUELDO <br> SEMANAL</th>
                            <th rowspan="2">PASAJE</th>
                            <th rowspan="2">COMIDA</th>
                            <th rowspan="2">EXTRAS</th>
                            <th rowspan="2">Total Percepciones</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">AJUSTES <br> AL SUB</th>
                            <th rowspan="2">AUSENTISMO</th>
                            <th rowspan="2">PERMISO</th>
                            <th rowspan="2">RETARDOS</th>
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
                    <tbody id="detalle-tabla-nomina-body-huasteca">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>
                    <tfoot id="detalle-tabla-nomina-foot-huasteca">
                        <!-- Fila de totales se generará dinámicamente -->
                    </tfoot>
                </table>
            </div>
            <ul id="detalle-paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>


    <!-- Menú contextual simple para la tabla -->
    <div id="context-menu"
        style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm-item" data-action="ver" style="padding:6px 12px;cursor:pointer;">Ver detalles</div>
    </div>


    <!-- Incluir el modal -->
    <?php include 'modals/modalNominaHistorial.php'; ?>
    <?php include 'modals/modalVerDispersionTarjeta.php'; ?>
    <?php include 'modals/modalTotalPorConceptos.php'; ?>
    <?php include 'modals/modalExportarNomina.php'; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Archivo JS específico -->
     
    <script src="../js/mostrarNomina.js"></script>
    <script src="../js/configHistorial.js"></script>
    <script src="../js/filtroBusqueda.js"></script>
    <script src="../js/establecerDataModal.js"></script>
    <script src="../../generacion/js/modalsDetalles/mostrarIncidencias.js"></script>
    <script src="../js/verDispersionTarjeta.js"></script>
    <script src="../js/establecerTotalesConceptos.js"></script>
    <script src="../js/exportarNominaExcel.js"></script>



</body>

</html>