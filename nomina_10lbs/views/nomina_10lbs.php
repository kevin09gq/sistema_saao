<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina 10LBS</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/nomina_10lbs.css">
    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">
    <link rel="stylesheet" href="../css/modal10lbs.css">
    <link rel="stylesheet" href="../css/conceptos_totales.css">


    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina_10lbs" id="container-nomina_10lbs" hidden>
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina_10lbs">
            <div class="titulo-nomina_10lbs">Procesamiento de Nómina</div>
            <div class="subtitulo-nomina_10lbs">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel_raya" enctype="multipart/form-data" class="form-nomina-inline-10lbs">
                <div>
                    <label for="archivo_excel_lista_raya_10lbs">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de Raya
                    </label>
                    <input type="file" id="archivo_excel_lista_raya_10lbs" name="archivo_excel_lista_raya_10lbs"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel_biometrico_10lbs">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico
                    </label>
                    <input type="file" id="archivo_excel_biometrico_10lbs" name="archivo_excel_biometrico_10lbs"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_nomina_10lbs" class="btn-procesar-nomina_10lbs">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="container-tabla-nomina-10lbs" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-10lbs">
            <h3 id=nombre_nomina></h3>
            <div class="header-controls-10lbs">
                <span class="sem-info-10lbs" id="num_semana"></span>
                <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_actualizar_biometrico"
                    title="Actualizar Biometrico" aria-label="Actualizar Biometrico">
                    <i class="bi bi-person-badge"></i>
                </button>
                <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_establecer_horario_semanal"
                    title="Establecer Horario Semanal" aria-label="Establecer Horario Semanal">
                    <i class="bi bi-calendar-check"></i>
                </button>
                <button class="btn btn-outline-primary" type="button" id="btn_precios_cajas" title="Ajustar Precios de Cajas">
                    <i class="bi bi-box"></i>
                </button>
                <button class="btn btn-outline-primary" id="btn-seleccionar-empleados" title="Seleccionar empleados">
                    <i class="bi bi-people"></i>
                </button>
                <button class="btn-aplicar-copias btn btn-outline-success" id="btn_aplicar_copias_global"
                    title="Aplicar Tarjeta">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
                <button class="btn btn-outline-danger btn-delete-tarjeta" id="btn_delete_tarjeta" title="Quitar tarjeta"
                    aria-label="Quitar tarjeta">
                    <i class="bi bi-credit-card-2-back"></i>
                </button>
                <button class="btn btn-outline-danger" id="btn_modal_olvidos_masivos"
                    title="Perdonar olvidos de checador">
                    <i class="bi bi-clipboard-check"></i>
                </button>
                <button class="btn btn-outline-primary btn-suma" type="button" id="btn_conceptos_totales"
                    title="Totales por concepto" aria-label="Totales por concepto">
                    <i class="bi bi-calculator"></i>
                </button>
                <button class="btn btn-outline-primary btn-ticket-zebra" id="btn_ticket_pdf"
                    title="Descargar Todos los Tickets">
                    <i class="bi bi-ticket-perforated"></i>
                </button>
                <button class="btn btn-outline-success btn-ticket-zebra" id="btn_ticket_manual_10lbs"
                    title="Descargar Tickets Seleccionados">
                    <i class="bi bi-hand-index"></i>
                </button>

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
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_10lbs" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
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
    <?php include 'modals/modal10lbs.php'; ?>
    <?php include 'modals/modalPrecioCajas.php'; ?>
    <?php include 'modals/modalHorarios.php'; ?>
    <?php include 'modals/biometricoModal.php'; ?>
    <?php include 'modals/modalSeleccionarEmpleados.php'; ?>
    <?php include 'modals/modalOlvidos.php'; ?>
    <?php include 'modals/modalConceptosTotales.php'; ?>
    <?php include 'modals/modalExportarNomina.php'; ?>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/process_excel.js"></script>
    <script src="../js/saveGetNomina.js"></script>
    <script src="../js/configComponentes.js"></script>
    <script src="../js/showDataTable.js"></script>
    <script src="../js/filtroBusqueda.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/abrirModal.js"></script>

    <script src="../js/configModales/horariosSemanales.js"></script>
    <script src="../js/configModales/preciosCajas.js"></script>
    <script src="../js/configModales/actualizarBiomtrico.js"></script>
    <script src="../js/configModales/seleccionar_empleados.js"></script>
    <script src="../js/configModales/olvidosMasivos.js"></script>
    <script src="../js/configModales/conceptos_totales.js"></script>
    <script src="../js/configModales/exportarNominaExcel.js"></script>
    <script src="../js/configModal/establecerData.js"></script>
    <script src="../js/configModal/editarData.js"></script>
    <script src="../js/configModal/eventos.js"></script>
    <script src="../js/configModal/configModal.js"></script>
    <script src="../js/configModal/newConcepts.js"></script>
    <script src="../js/configModal/agregarCajasEmpacadas.js"></script>

</body>

</html>