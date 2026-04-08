<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina huasteca</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>

    <link rel="stylesheet" href="../css/nomina_huasteca.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">

    <!-- estilos para el corte -->
    <link rel="stylesheet" href="../css/tablaCorte.css">


    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/modalCoordinador.css">
    <link rel="stylesheet" href="../css/modalJornaleros.css">
    <link rel="stylesheet" href="../css/conceptos_totales.css">
    <link rel="stylesheet" href="../css/modal_seleccion_tickets.css">

</head>

<body>
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina_huasteca" id="container-nomina_huasteca" hidden>
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina_huasteca">
            <div class="titulo-nomina_huasteca">Procesamiento de Nómina huasteca</div>
            <div class="subtitulo-nomina_huasteca">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel_raya" enctype="multipart/form-data" class="form-nomina-inline-huasteca">
                <div>
                    <label for="archivo_excel_lista_raya_huasteca">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de Raya
                    </label>
                    <input type="file" id="archivo_excel_lista_raya_huasteca" name="archivo_excel_lista_raya_huasteca"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel_biometrico_huasteca">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico
                    </label>
                    <input type="file" id="archivo_excel_biometrico_huasteca" name="archivo_excel_biometrico_huasteca"
                        accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_nomina_huasteca" class="btn-procesar-nomina_huasteca">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div id="container-acceso-huasteca" hidden>

        <div class="container mt-4" style="max-width: 600px;">

            <!-- Nav Tabs Bootstrap nativo -->
            <ul class="nav nav-tabs" id="tabsAccesoHuasteca" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="tab-crear-nomina" data-bs-toggle="tab"
                        data-bs-target="#panel-crear-nomina" type="button" role="tab" aria-controls="panel-crear-nomina"
                        aria-selected="true">
                        <i class="bi bi-journal-plus"></i> Crear nómina
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-recuperar-nomina" data-bs-toggle="tab"
                        data-bs-target="#panel-recuperar-nomina" type="button" role="tab"
                        aria-controls="panel-recuperar-nomina" aria-selected="false">
                        <i class="bi bi-arrow-clockwise"></i> Recuperar nómina
                    </button>
                </li>
            </ul>

            <!-- Contenido de los tabs -->
            <div class="tab-content border border-top-0 rounded-bottom p-4 shadow-sm bg-white"
                id="tabsAccesoHuastecaContent">

                <!-- Panel: Crear nueva nómina -->
                <div class="tab-pane fade show active" id="panel-crear-nomina" role="tabpanel"
                    aria-labelledby="tab-crear-nomina">
                    <h5 class="mb-3 text-center"><i class="bi bi-journal-plus"></i> Crear nueva nómina</h5>
                    <form id="form_crear_nomina_huasteca" class="row g-3">
                        <div class="col-md-12">
                            <label for="semana_nomina_huasteca" class="form-label">No. Semana</label>
                            <input type="number" class="form-control" id="semana_nomina_huasteca"
                                name="semana_nomina_huasteca" min="1" max="53" placeholder="Ej. 5" required>
                        </div>
                        <div class="col-md-6">
                            <label for="fecha_inicio_nomina_huasteca" class="form-label">Fecha de inicio</label>
                            <input type="date" class="form-control" id="fecha_inicio_nomina_huasteca"
                                name="fecha_inicio_nomina_huasteca" required>
                        </div>
                        <div class="col-md-6">
                            <label for="fecha_cierre_nomina_huasteca" class="form-label">Fecha de cierre</label>
                            <input type="date" class="form-control" id="fecha_cierre_nomina_huasteca"
                                name="fecha_cierre_nomina_huasteca" required>
                        </div>
                        <div class="col-12 d-flex justify-content-center mt-3">
                            <button type="button" class="btn btn-success px-4" id="btn_crear_nomina_huasteca">
                                <i class="bi bi-plus-circle"></i> Crear Nómina
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Panel: Recuperar nómina -->
                <div class="tab-pane fade" id="panel-recuperar-nomina" role="tabpanel"
                    aria-labelledby="tab-recuperar-nomina">
                    <h5 class="mb-3 text-center"><i class="bi bi-arrow-clockwise"></i> Recuperar nómina</h5>
                    <form id="form_recuperar_nomina_huasteca" class="row g-3">
                        <div class="col-md-6">
                            <label for="anio_recuperar_nomina_huasteca" class="form-label">Año</label>
                            <input type="number" class="form-control" id="anio_recuperar_nomina_huasteca"
                                name="anio_recuperar_nomina_huasteca" min="2000" max="2100" placeholder="Ej. 2026"
                                required>
                        </div>
                        <div class="col-md-6">
                            <label for="semana_recuperar_nomina_huasteca" class="form-label">No. Semana</label>
                            <input type="number" class="form-control" id="semana_recuperar_nomina_huasteca"
                                name="semana_recuperar_nomina_huasteca" min="1" max="53" placeholder="Ej. 5" required>
                        </div>
                        <div class="col-12 d-flex justify-content-center mt-3">
                            <button type="button" class="btn btn-primary px-4" id="btn_recuperar_nomina_huasteca">
                                <i class="bi bi-search"></i> Recuperar Nómina
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>

    </div>

    <!-- Contenedor de Configuración de Valores -->
    <div class="container py-5" id="config-valores-huasteca" hidden>
        <div class="row justify-content-center">
            <div class="col-lg-11">
                <div class="card border-0 shadow-sm">
                    <div class="row g-0">
                        <!-- Columna Izquierda: Valores Económicos -->
                        <div class="col-md-5 bg-light p-4 border-end">
                            <h6 class="text-uppercase fw-bold text-dark mb-4">Valores Económicos</h6>

                            <div class="mb-4">
                                <label for="precio_pasaje_huasteca" class="form-label">Precio Pasaje</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="precio_pasaje_huasteca" class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="pago_tardeada_huasteca" class="form-label">Pago Tardeada</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_tardeada_huasteca" class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-0">
                                <label for="pago_comida_huasteca" class="form-label">Pago Comida</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_comida_huasteca" class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
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
                                <button class="btn btn-primary" id="btn_config_avanzar_huasteca" type="button">
                                    Procesar Nómina <i class="bi bi-arrow-right-short ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container-tabla-nomina-huasteca" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-huasteca">
            <h3 id=nombre_nomina></h3>
            <div class="header-controls-huasteca">
                <span class="sem-info-huasteca" id="num_semana"></span>
                <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                    data-bs-target="#modalCorte" title="Tickes de Corte de Rejas">
                    <i class="bi bi-truck"></i>
                </button>
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
                <button class="btn btn-outline-danger" id="btn_modal_olvidos_masivos" title="Perdonar olvidos de checador">
                    <i class="bi bi-clipboard-check"></i>
                </button>
                <button class="btn btn-outline-primary" id="btn_modal_dias_extra" title="Agregar día extra jornaleros">
                    <i class="bi bi-calendar-plus"></i>
                </button>
                   <button class="btn btn-outline-secondary" id="btn_abrir_modal_reasignar" title="Reasignar Empleado de Departamento">
                    <i class="bi bi-person-fill-gear"></i>
                </button>

            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-huasteca">
            <div class="filtros-container-huasteca">

                <select class="filtro-departamento-huasteca" id="filtro_departamento">
                    <!-- Departamento -->
                </select>

                <select class="filtro-departamento-huasteca" id="filtro_puesto">
                    <!-- Departamento -->
                </select>



                <div class="busqueda-container-huasteca" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-huasteca" placeholder="Buscar..."
                        id="busqueda-nomina-huasteca">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda"
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
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_huasteca" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
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
                            <th rowspan="2">DÍAS <br> TRAB.</th>
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
                            <th rowspan="2">CHECADOR</th>
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
                    <tbody id="tabla-nomina-body-huasteca">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination my-5" style="margin: 20px 0 0 0; justify-content: center;">
            </ul>
        </div>


        <div id="tabla-corte-container-huasteca" class="tabla-nomina-container-huasteca-corte" hidden>
            <div class="table-responsive-huasteca-corte">
                <table class="table-nomina-huasteca-corte" id="tabla-nomina-corte">
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
                    <tbody id="tabla-body-corte-huasteca">
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

    <!-- Incluir los modales -->
    <?php include "modals/modalCoordinador.php"; ?>
    <?php include "modals/modalJornaleros.php"; ?>
    <?php include "modals/modalSeleccionarEmpleados.php"; ?>
    <?php include "modals/modalConceptosTotales.php"; ?>
    <?php include "modals/biometricoModal.php"; ?>
    <?php include "modals/modalTardeadaPasaje.php"; ?>
    <?php include "modals/modalQuitarComidaPasaje.php"; ?>
    <?php include "modals/modalDiasInhabiles.php"; ?>
    <?php include "modals/modalTipoDia.php"; ?>
    <?php include "modals/modalExportarNomina.php"; ?>
    <?php include "modals/modal_seleccion_tickets_huasteca.php"; ?>
    <?php include "modals/modalDiasExtra.php"; ?>
    <?php include "modals/modalOlvidos.php"; ?>
    <?php include "modals/modalReasignarEmpleado.php"; ?>

    <!-- Modal para los cortes -->
    <?php include "modals/modalCorte.php"; ?>
    <?php include "modals/modalCorteNominaEditar.php"; ?>
    <?php include "modals/modalCorteEditar.php"; ?>



    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/createEstructuraNomina.js"></script>

    <script src="../js/configComponentes.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/showDataTable.js"></script>
    <script src="../js/busquedaFiltrado.js"></script>
    <script src="../js/saveGetNomina.js"></script>
    <script src="../js/abrirModal.js"></script>

    <script src="../js/configModales/seleccionar_empleados.js"></script>
    <script src="../js/configModales/conceptos_totales.js"></script>
    <script src="../js/configModales/actualizarBiomtrico.js"></script>
    <script src="../js/configModales/tardeadaPasaje.js"></script>
    <script src="../js/configModales/olvidosMasivos.js"></script>
    <script src="../js/configModales/exportarNominaExcel.js"></script>
    <script src="../js/configModales/reasignarEmpleado.js"></script>
   
   
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



    <script src="../js/ticket_pdf.js"></script>
    <script src="../js/ticket_seleccion_huasteca.js"></script>

    <!-- Cortes -->
    <script src="../js/configModalCorte/configCorte.js"></script>
    <script src="../js/configModalCorte/showTablaCorte.js"></script>
    <script src="../js/configModalCorte/abrirModalDetallesCorte.js"></script>

</body>

</html>