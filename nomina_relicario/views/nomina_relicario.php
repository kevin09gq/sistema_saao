<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina relicario</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/nomina_relicario.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">

    <!-- estilos para el corte -->
    <link rel="stylesheet" href="../css/tablaCorte.css">

    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/modalCoordinador.css">
    <link rel="stylesheet" href="../css/modalJornaleros.css">
    <link rel="stylesheet" href="../css/conceptos_totales.css">
    <link rel="stylesheet" href="../css/ticket_manual.css">

    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">

    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina_relicario" id="container-nomina_relicario" hidden>
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina_relicario">
            <div class="titulo-nomina_relicario">Procesamiento de Nómina relicario</div>
            <div class="subtitulo-nomina_relicario">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel_raya" enctype="multipart/form-data" class="form-nomina-inline-relicario">
                <div>
                    <label for="archivo_excel_lista_raya_relicario">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de Raya
                    </label>
                    <input type="file" id="archivo_excel_lista_raya_relicario" name="archivo_excel_lista_raya_relicario"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel_biometrico_relicario">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico
                    </label>
                    <input type="file" id="archivo_excel_biometrico_relicario" name="archivo_excel_biometrico_relicario"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_nomina_relicario" class="btn-procesar-nomina_relicario">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Contenedor de Configuración de Valores -->
    <div class="container py-5" id="config-valores-relicario" hidden>
        <div class="row justify-content-center">
            <div class="col-lg-11">
                <div class="card border-0 shadow-sm">
                    <div class="row g-0">
                        <!-- Columna Izquierda: Valores Económicos -->
                        <div class="col-md-5 bg-light p-4 border-end">
                            <h6 class="text-uppercase fw-bold text-dark mb-4">Valores Económicos</h6>

                            <div class="mb-4">
                                <label for="precio_pasaje_relicario" class="form-label">Precio Pasaje</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="precio_pasaje_relicario"
                                        class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="pago_tardeada_relicario" class="form-label">Pago Tardeada</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_tardeada_relicario"
                                        class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-0">
                                <label for="pago_comida_relicario" class="form-label">Pago Comida</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_comida_relicario" class="form-control form-control-sm"
                                        placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Columna Derecha: Configuración de Horarios -->
                        <div class="col-md-7 p-4">
                            <h6 class="text-uppercase fw-bold text-dark mb-4">Asignación de Horarios</h6>

                            <div class="table-responsive">
                                <table class="table table-hover table-sm align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="text-start fw-semibold text-secondary">Departamento</th>
                                            <th class="text-center fw-semibold text-secondary">Horario</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabla-config-horarios">
                                        <tr>
                                            <td colspan="2" class="text-center py-4">
                                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                                <span class="text-muted small">Cargando...</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="mt-4 text-end">
                                <button class="btn btn-primary" id="btn_config_avanzar_relicario" type="button">
                                    Procesar Nómina <i class="bi bi-arrow-right-short ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="container-tabla-nomina-relicario" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-relicario">
            <div class="header-titulo-semana">
                <h3 id=nombre_nomina></h3>
                <span class="sem-info-relicario" id="num_semana"></span>
            </div>
            <div class="header-controls-relicario">
                <!-- Grupo 1: Servicios -->
                <div class="btn-group-relicario btn-group-servicios">
                    <button type="button" class="btn btn-outline-primary" title="Tickes de Poda de Árboles" id="btn_modal_poda">
                        <i class="bi bi-scissors"></i>
                    </button>
                    <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                        data-bs-target="#modalCorte" title="Tickes de Corte de Rejas">
                        <i class="bi bi-truck"></i>
                    </button>

                </div>

                <!-- Grupo 2: Configuración -->
                <div class="btn-group-relicario btn-group-config">
                    <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_actualizar_biometrico"
                        title="Actualizar Biometrico" aria-label="Actualizar Biometrico">
                        <i class="bi bi-person-badge"></i>
                    </button>
                    <button class="btn btn-outline-primary actualizar-valores" type="button" id="btn_actualizar_valores"
                        title="Actualizar Valores" aria-label="Actualizar Valores pasaje y tardeada">
                        <i class="bi bi-gear"></i>
                    </button>
                    <button class="btn btn-outline-primary quitrar-comida-pasaje" type="button"
                        id="btn_quitar_comida_pasaje" title="Quitar Comida y Pasaje" aria-label="Quitar Comida y Pasaje">
                        <i class="bi bi-x-circle"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_establecer_dias_justificados"
                        title="dias justificados" aria-label="dias-justificados">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-outline-primary" id="btn-seleccionar-empleados" title="Seleccionar empleados">
                        <i class="bi bi-people"></i>
                    </button>
                    <button class="btn btn-outline-primary" id="btn_modal_dias_extra" title="Agregar día extra jornaleros">
                        <i class="bi bi-calendar-plus"></i>
                    </button>
                    <button class="btn btn-outline-danger" id="btn_modal_olvidos_masivos"
                        title="Perdonar olvidos de checador">
                        <i class="bi bi-clipboard-check"></i>
                    </button>
                </div>

                <!-- Grupo 3: Procesamiento -->
                <div class="btn-group-relicario btn-group-procesamiento">
                    <button class="btn-aplicar-copias btn btn-outline-success" id="btn_aplicar_copias_global"
                        title="Aplicar Tarjeta">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-delete-tarjeta" id="btn_delete_tarjeta" title="Quitar tarjeta"
                        aria-label="Quitar tarjeta">
                        <i class="bi bi-credit-card-2-back"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-suma" type="button" id="btn_conceptos_totales"
                        title="Totales por concepto" aria-label="Totales por concepto">
                        <i class="bi bi-calculator"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-ticket-zebra" id="btn_ticket_pdf" title="Descargar Ticket">
                        <i class="bi bi-ticket-perforated"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-ticket-zebra" id="btn_ticket_manual"
                        title="Descargar Ticket Manual">
                        <i class="bi bi-ticket-perforated"></i>
                    </button>
                    <button class="btn btn-outline-secondary" id="btn_abrir_modal_reasignar"
                        title="Reasignar Empleado de Departamento">
                        <i class="bi bi-person-fill-gear"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-relicario">
            <div class="filtros-container-relicario">

                <select class="filtro-departamento-relicario" id="filtro_departamento">
                    <!-- Departamento -->
                </select>

                <select class="filtro-departamento-relicario" id="filtro_puesto">
                    <!-- Puestos -->
                </select>



                <div class="busqueda-container-relicario" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-relicario" placeholder="Buscar..."
                        id="busqueda-nomina-relicario">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda"
                        title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-relicario">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_relicario" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
                </button>

            </div>
        </div>

        <div id="tabla-nomina-container-relicario" class="tabla-nomina-container-relicario">
            <div class="table-responsive-relicario">
                <table class="table-nomina-relicario" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2"> NOMBRE </th>
                            <th rowspan="2" class="col-jornalero">DÍAS <br> TRAB.</th>
                            <th rowspan="2">SUELDO <br> SEMANAL</th>
                            <th rowspan="2" class="col-jornalero">PASAJE</th>
                            <th rowspan="2" class="col-jornalero">COMIDA</th>
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
                    <tbody id="tabla-nomina-body-relicario">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination my-5" style="margin: 20px 0 0 0; justify-content: center;">
            </ul>
        </div>


        <div id="tabla-corte-container-relicario" class="tabla-nomina-container-relicario-corte" hidden>
            <div class="table-responsive-relicario-corte">
                <table class="table-nomina-relicario-corte" id="tabla-nomina-corte">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">CONCEPTO</th>
                            <th rowspan="2">V</th>
                            <th rowspan="2">SA</th>
                            <th rowspan="2">DO</th>
                            <th rowspan="2">L</th>
                            <th rowspan="2">MA</th>
                            <th rowspan="2">MI</th>
                            <th rowspan="2">J</th>
                            <th rowspan="2">TOTAL<br>REJAS</th>
                            <th rowspan="2">PRECIO<br>POR REJA</th>
                            <th rowspan="2">TOTAL<br>EFECTIVO</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-body-corte-relicario">
                        <!-- Filas de la tabla se generarán dinámicamente -->
                    </tbody>

                </table>
            </div>
        </div>

        <div id="tabla_poda_container" class="tabla-nomina-container-relicario-corte" hidden>
            <div class="table-responsive-relicario-corte">
                <table class="table-nomina-relicario-corte" id="tabla_poda">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">CONCEPTO</th>
                            <th rowspan="2">V</th>
                            <th rowspan="2">SA</th>
                            <th rowspan="2">DO</th>
                            <th rowspan="2">L</th>
                            <th rowspan="2">MA</th>
                            <th rowspan="2">MI</th>
                            <th rowspan="2">J</th>
                            <th rowspan="2">TOTAL<br>ARBOLES</th>
                            <th rowspan="2">PAGO</th>
                            <th rowspan="2">TOTAL<br>EFECTIVO</th>
                        </tr>
                    </thead>
                    <tbody id="tabla_body_poda">
                        <!-- Filas de la tabla se generarán dinámicamente -->
                    </tbody>

                </table>
            </div>
        </div>

    </div>

    <!-- Menú contextual simple para la tabla -->
    <div id="context-menu"
        style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm-item" data-action="ver" style="padding:6px 12px;cursor:pointer;">Ver detalles</div>
    </div>
    <!-- Menú contextual simple para la tabla de corte -->
    <div id="context_menu_corte"
        style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm_item_corte" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎​ Ver detalles</div>
    </div>
    <!-- Menú contextual simple para la tabla de poda -->
    <div id="context_menu_poda"
        style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm_item_poda" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎​ Ver detalles</div>
    </div>


    <!-- Incluir los modales -->
    <?php include "modalsNomina/modalCoordinador.php"; ?>
    <?php include "modalsNomina/modalJornaleros.php"; ?>
    <?php include "modalsNomina/modalTipoDia.php"; ?>
    <?php include "modalsNomina/biometricoModal.php"; ?>
    <?php include "modalsNomina/modalSeleccionarEmpleados.php"; ?>
    <?php include "modalsNomina/modalTardeadaPasaje.php"; ?>
    <?php include "modalsNomina/modalDiasInhabiles.php"; ?>
    <?php include "modalsNomina/modalQuitarComidaPasaje.php"; ?>
    <?php include "modalsNomina/modalConceptosTotales.php"; ?>
    <?php include "modalsNomina/modalExportarNomina.php"; ?>
    <?php include "modalsNomina/modalSeleccionarEmpleados.php"; ?>
    <?php include "modalsNomina/modalDiasExtra.php"; ?>
    <?php include "modalsNomina/modalOlvidos.php"; ?>
    <?php include "modalsNomina/modalReasignarEmpleado.php"; ?>

    <?php include "modalsNomina/modal_seleccion_tickets_relicario.php"; ?>
    <?php include "modalsNomina/modal_ticket_manual_relicario.php"; ?>


    <!-- Modal para los cortes -->
    <?php include "modalsCorte/modalCorte.php"; ?>
    <?php include "modalsCorte/modalCorteNominaEditar.php"; ?>
    <?php include "modalsCorte/modalCorteEditar.php"; ?>

    <!-- Modal para la poda -->
    <?php include __DIR__ . "/modalsPoda/modalPoda.php"; ?>
    <?php include __DIR__ . "/modalsPoda/modalPodaDetalles.php"; ?>
    <?php include __DIR__ . "/modalsPoda/modalPodaDetallesExtra.php"; ?>






    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/process_excel.js"></script>

    <!-- Archivos JS para funcionalidades adicionales -->
    <script src="../js/showDataTable.js"></script>
    <script src="../js/configComponentes.js"></script>
    <script src="../js/saveGetNomina.js"></script>
    <script src="../js/busquedaFiltrado.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/abrirModal.js"></script>

    <script src="../js/configModalCoordinador/establecerData.js"></script>
    <script src="../js/configModalCoordinador/configModal.js"></script>
    <script src="../js/configModalCoordinador/editarData.js"></script>
    <script src="../js/configModalCoordinador/newConcepts.js"></script>
    <script src="../js/configModalCoordinador/eventos.js"></script>
    <script src="../js/configModalCoordinador/justificacionCoordinador.js"></script>

    <script src="../js/configModalJornaleros/sueldoSemanal.js"></script>
    <script src="../js/configModalJornaleros/establecerData.js"></script>
    <script src="../js/configModalJornaleros/editarData.js"></script>
    <script src="../js/configModalJornaleros/configModal.js"></script>
    <script src="../js/configModalJornaleros/sueldoSemanal.js"></script>
    <script src="../js/configModalJornaleros/eventos.js"></script>
    <script src="../js/configModalJornaleros/newConcepts.js"></script>
    <script src="../js/configModalJornaleros/agregarDiasTrabajados.js"></script>

    <script src="../js/configModales/actualizarBiomtrico.js"></script>
    <script src="../js/configModales/exportarNominaExcel.js"></script>
    <script src="../js/configModales/olvidosMasivos.js"></script>
    <script src="../js/configModales/conceptos_totales.js"></script>
    <script src="../js/configModales/seleccionar_empleados.js"></script>
    <script src="../js/configModales/tardeadaPasaje.js"></script>
    <script src="../js/configModales/reasignarEmpleado.js"></script>

    <script src="../js/configModalCorte/configCorte.js"></script>
    <script src="../js/configModalCorte/showTablaCorte.js"></script>
    <script src="../js/configModalCorte/abrirModalDetallesCorte.js"></script>

    <script src="../js/ticket_pdf.js"></script>
    <script src="../js/ticket_seleccion_relicario.js"></script>

    <script src="../js/configModalPoda/config_poda.js"></script>
    <script src="../js/configModalPoda/tabla_poda.js"></script>
    <script src="../js/configModalPoda/detalles_modal.js"></script>



</body>

</html>