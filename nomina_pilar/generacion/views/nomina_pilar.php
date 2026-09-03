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
    <title>Nomina Rancho Pilar</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    <!-- JQuery UI css -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">

    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">
    <link rel="stylesheet" href="../css/modalDetallesNomina.css">
    <link rel="stylesheet" href="../css/conceptos_totales.css">

    <!-- ESTILOS PARA LA TABLA DE CORTE Y PODA -->
    <link rel="stylesheet" href="../css/tablaCorte.css">
</head>

<body class="bg-secondary-subtle">
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../../public/views/navbar.php"
    ?>

    <!-- CONTENEDOR DE LOS DATOS DE LA NOMINA -->

    <div class="container" id="contenedor-data" hidden>

        <div class="row justify-content-center align-items-center vh-100">

            <div class="col-md-8 col-lg-6">

                <div class="card shadow-lg border-0">

                    <div class="card-header bg-success text-white text-center py-3">
                        <h3 class="mb-0">
                            Módulo de Nómina
                        </h3>
                    </div>

                    <div class="card-body bg-light p-4">


                        <div class="mb-3">
                            <label for="fecha_inicio" class="form-label fw-semibold">
                                Fecha de Inicio
                            </label>
                            <input
                                type="date"
                                class="form-control"
                                id="fecha_inicio"
                                name="fecha_inicio">
                        </div>

                        <div class="mb-3">
                            <label for="fecha_fin" class="form-label fw-semibold">
                                Fecha de Fin
                            </label>
                            <input
                                type="date"
                                class="form-control"
                                id="fecha_fin"
                                name="fecha_fin">
                        </div>

                        <div class="row">

                            <div class="col-md-6 mb-3">
                                <label for="semana" class="form-label fw-semibold">
                                    Número de Semana
                                </label>
                                <input
                                    type="number"
                                    class="form-control"
                                    id="numero_semana"
                                    name="numero_semana"
                                    min="1"
                                    max="53"
                                    placeholder="Ej. 27">
                            </div>

                            <div class="col-md-6 mb-3">
                                <label for="anio" class="form-label fw-semibold">
                                    Año
                                </label>
                                <input
                                    type="number"
                                    class="form-control"
                                    id="anio"
                                    name="anio"
                                    value="2026">
                            </div>

                        </div>

                        <div class="d-grid mt-4">
                            <button class="btn btn-success" id="btn-continuar">
                                Continuar
                            </button>
                        </div>

                        <div class="d-grid mt-4">
                            <button class="btn btn-secondary" id="btn-recuperar-nomina">
                                Recuperar Nómina
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <!-- CONTENEDOR PARA CONFIGURAR LOS VALORES ECONÓMICOS DEL RELICARIO -->

    <div class="container py-5" id="config-valores-pilar" hidden>
        <div class="row justify-content-center">
            <div class="col-lg-11">
                <div class="card border-0 shadow-sm">
                    <div class="row g-0">
                        <!-- Columna Izquierda: Valores Económicos -->
                        <div class="col-md-5 bg-light p-4 border-end">
                            <h6 class="text-uppercase fw-bold text-dark mb-4">Valores Económicos</h6>

                            <div class="mb-4">
                                <label for="precio_pasaje_pilar" class="form-label">Precio Pasaje</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="precio_pasaje_pilar"
                                        class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="pago_tardeada_pilar" class="form-label">Pago Tardeada</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_tardeada_pilar"
                                        class="form-control form-control-sm" placeholder="0.00" step="0.01" min="0">
                                </div>
                            </div>

                            <div class="mb-0">
                                <label for="pago_comida_pilar" class="form-label">Pago Comida</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" id="pago_comida_pilar" class="form-control form-control-sm"
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
                                <button class="btn btn-primary" id="btn_config_avanzar_pilar" type="button">
                                    Procesar Nómina <i class="bi bi-arrow-right-short ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- CONTENEDOR DE LA TABLA DE NÓMINA -->

    <div class="container-tabla-nomina-pilar" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-pilar">
            <div class="header-titulo-semana">
                <h3 id=nombre_nomina></h3>
                <span class="sem-info-pilar" id="num_semana"></span>
            </div>
            <div class="header-controls-pilar">

                <!-- Grupo Ranchos -->
                <div class="dropdown">
                    <button class="btn btn-toolbar-group dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-grid-3x3-gap-fill"></i>
                        <span>Ranchos</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-nomina shadow-sm">
                        <li>
                            <h6 class="dropdown-header"><i class="bi bi-tools me-1"></i>Gestión de Ranchos</h6>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_modal_corte">
                                <i class="bi bi-truck"></i>
                                <span>Corte Limón</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_modal_poda">
                                <i class="bi bi-scissors"></i>
                                <span>Poda Árboles</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Grupo 1: Servicios -->
                <div class="dropdown">
                    <button class="btn btn-toolbar-group dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-grid-3x3-gap-fill"></i>
                        <span>Servicios</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-nomina shadow-sm">
                        <li>
                            <h6 class="dropdown-header"><i class="bi bi-tools me-1"></i>Acciones de Servicio</h6>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn-ocultar-empleados">
                                <i class="bi bi-people text-primary"></i>
                                <span>Ocultar Empleados</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn-agregar-nuevos-empleados">
                                <i class="bi bi-person-plus text-primary"></i>
                                <span>Agregar Nuevos Empleados</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_aplicar_festividades">
                                <i class="bi bi-calendar-event text-primary"></i>
                                <span>Aplicar Festividades</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_justificar_ausencias">
                                <i class="bi bi-question-circle text-primary"></i>
                                <span>Justificar Ausencias</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_dias_extra">
                                <i class="bi bi-calendar-plus text-success"></i>
                                <span>Agregar / Quitar Días Extra</span>
                            </button>
                        </li>

                    </ul>
                </div>

                <!-- Grupo 2: Configuración -->
                <div class="dropdown">
                    <button class="btn btn-toolbar-group dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-gear-fill"></i>
                        <span>Configuración</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-nomina shadow-sm">
                        <li>
                            <h6 class="dropdown-header"><i class="bi bi-sliders me-1"></i>Opciones de Configuración</h6>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_actualizar_valores_pilar">
                                <i class="bi bi-wallet2"></i>
                                <span>Actualizar Valores Economicos</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_gestionar_valores_economicos">
                                <i class="bi bi-person-gear"></i>
                                <span>Asingnar y Quitar Valores Economicos</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_config_conceptos">
                                <i class="bi bi-gear text-primary"></i>
                                <span>Configurar Conceptos</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_olvidos_checador">
                                <i class="bi bi-clipboard-check text-danger"></i>
                                <span>Perdonar Olvidos de Checador</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_add_percepciones_deducciones">
                                <i class="bi bi-patch-plus text-primary"></i>
                                <span>Agregar Percepciones / Deducciones</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_dispersion_tarjeta">
                                <i class="bi bi-list-columns-reverse text-info"></i>
                                <span>Ver Dispersión de Tarjeta</span>
                            </button>
                        </li>

                    </ul>
                </div>

                <!-- Grupo 3: Procesamiento -->
                <div class="dropdown">
                    <button class="btn btn-toolbar-group dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-cpu-fill"></i>
                        <span>Procesamiento</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-nomina shadow-sm">
                        <li>
                            <h6 class="dropdown-header"><i class="bi bi-lightning-charge me-1"></i>Acciones de Procesamiento</h6>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_lista_raya">
                                <i class="bi bi-file-earmark-excel text-primary"></i>
                                <span>Actualizar Lista de Raya</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_biometrico">
                                <i class="bi bi-person-lines-fill text-primary"></i>
                                <span>Actualizar Biometrico</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_redondear_sueldos">
                                <i class="bi bi-arrow-repeat text-success"></i>
                                <span>Redondear Sueldos </span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_cambiar_departamento">
                                <i class="bi bi-arrow-left-right text-warning"></i>
                                <span>Cambiar Departamento</span>
                            </button>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <h6 class="dropdown-header"><i class="bi bi-ticket me-1"></i>Tickets</h6>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-ticket-zebra" type="button" id="btn_ticket_pdf">
                                <i class="bi bi-ticket-perforated text-primary"></i>
                                <span>Descargar Tickets</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-ticket-zebra" type="button" id="btn_ticket_seleccion">
                                <i class="bi bi-hand-index text-success"></i>
                                <span>Tickets Seleccionados</span>
                            </button>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-suma" type="button" id="btn_conceptos_totales">
                                <i class="bi bi-calculator text-primary"></i>
                                <span>Totales por Concepto</span>
                            </button>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-pilar">
            <div class="filtros-container-pilar">
                <select class="filtro-departamento-pilar" id="filtro-departamento">
                    <!-- Se poblará dinámicamente -->
                </select>

                <div class="busqueda-container-pilar" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-pilar" placeholder="Buscar..." id="busqueda-nomina-pilar">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda"
                        title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-pilar">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_pilar" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
                </button>

            </div>
        </div>

        <div id="tabla-nomina-container-pilar" class="tabla-nomina-container-pilar">
            <div class="table-responsive-pilar">
                <table class="table-nomina-pilar" id="tabla-nomina">
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
                    <tbody id="tabla-nomina-body-pilar">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>
                    <tfoot id="tabla-nomina-foot-pilar">
                        <!-- Fila de totales se generará dinámicamente -->
                    </tfoot>
                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>

        <!-- CONTENEDOR DE LA NOMINA DE CORTE -->
        <div id="tabla-corte-container" class="tabla-nomina-container-corte" hidden>
            <div class="table-responsive-corte">
                <table class="table-nomina-corte" id="tabla-nomina-corte">
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
                    <tbody id="tabla-body-corte">
                        <!-- Filas de la tabla se generarán dinámicamente -->
                    </tbody>

                </table>
            </div>
        </div>

        <!-- CONTENEDOR DE LA NOMINA DE PODA -->
        <div id="tabla_poda_container" class="tabla-nomina-container-corte" hidden>
            <div class="table-responsive-corte">
                <table class="table-nomina-corte" id="tabla_poda">
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


    <!-- Incluir el modal -->
    <?php include 'modals/modalListaRaya.php'; ?>
    <?php include 'modals/modalBiometrico.php'; ?>
    <?php include 'modals/modalDetallesNomina.php'; ?>
    <?php include 'modals/modalConfigConceptos.php'; ?>
    <?php include 'modals/modalValoresEconomicos.php'; ?>
    <?php include 'modals/modalOlvidoChecador.php'; ?>
    <?php include 'modals/modalAddPercepcionDeduccion.php'; ?>
    <?php include 'modals/modalDispersionTarjeta.php'; ?>
    <?php include 'modals/modalRedondearSueldos.php'; ?>
    <?php include 'modals/modalOcultarEmpleados.php'; ?>
    <?php include 'modals/modalNuevosEmpleados.php'; ?>
    <?php include 'modals/modalGestionarValoresEconomicos.php'; ?>
    <?php include 'modals/modalFestividades.php'; ?>
    <?php include 'modals/modalJustificarAusencias.php'; ?>
    <?php include 'modals/modalDiasExtra.php'; ?>
    <?php include 'modals/modalCambiarDepartamento.php'; ?>
    <?php include 'modals/modalExportarNomina.php'; ?>
    <?php include 'modals/modalConceptosTotales.php'; ?>
    <?php include 'modals/modalTicketsEmpleados.php'; ?>
    <?php include 'modals/modal_seleccion_tickets_pilar.php'; ?>

    <!-- MODALES DEL CORTE -->
    <?php require_once __DIR__ . '/modalsCorte/modalCorte.php'; ?>
    <?php require_once __DIR__ . '/modalsCorte/modalCorteEditar.php'; ?>
    <?php require_once __DIR__ . '/modalsCorte/modalCorteNominaEditar.php'; ?>

    <!-- MODALES DEL PODA -->
    <?php require_once __DIR__ . '/modalsPoda/modalPoda.php'; ?>
    <?php require_once __DIR__ . '/modalsPoda/modalPodaDetalles.php'; ?>
    <?php require_once __DIR__ . '/modalsPoda/modalPodaDetallesExtra.php'; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Archivo JS específico -->
    <script src="../js/crearEstructuraJson.js"></script>
    <script src="../js/configVista.js"></script>
    <script src="../js/mostrarEmpleados.js"></script>
    <script src="../js/filtroBusqueda.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/guardarNomina.js"></script>
    <script src="../js/recuperarNomina.js"></script>
    <script src="../js/exportarNominaExcel.js"></script>
    <script src="../js/ticket_pdf.js"></script>
    <script src="../js/ticket_seleccion_pilar.js"></script>

    <script src="../js/modals/listaDeRaya.js"></script>
    <script src="../js/modals/biometrico.js"></script>
    <script src="../js/modals/obtenerDiasTrabajados.js"></script>
    <script src="../js/modals/configConceptos.js"></script>
    <script src="../js/modals/actualizarValoresEconomicos.js"></script>
    <script src="../js/modals/olvidoChecador.js"></script>
    <script src="../js/modals/agregarPercepcionesDeducciones.js"></script>
    <script src="../js/modals/dispersionTarjeta.js"></script>
    <script src="../js/modals/redondearSueldos.js"></script>
    <script src="../js/modals/ocultarEmpleados.js"></script>
    <script src="../js/modals/nuevosEmpleados.js"></script>
    <script src="../js/modals/gestionarValoresEconomicos.js"></script>
    <script src="../js/modals/festividades.js"></script>
    <script src="../js/modals/justificarAusencias.js"></script>
    <script src="../js/modals/diasExtra.js"></script>
    <script src="../js/modals/cambiarDepartamento.js"></script>
    <script src="../js/modals/conceptos_totales.js"></script>

    <script src="../js/modalsDetalles/establecerDataEmpleado.js"></script>
    <script src="../js/modalsDetalles/editarDataEmpleado.js"></script>
    <script src="../js/modalsDetalles/crearNuevosConceptos.js"></script>
    <script src="../js/modalsDetalles/calculosDetallesNomina.js"></script>
    <script src="../js/modalsDetalles/incidencias.js"></script>
    <script src="../js/modalsDetalles/mostrarIncidencias.js"></script>

    <!-- SCRIPTS DEL CORTE -->
    <script src="../js/configModalCorte/configCorte.js"></script>
    <script src="../js/configModalCorte/showTablaCorte.js"></script>
    <script src="../js/configModalCorte/abrirModalDetallesCorte.js"></script>

    <!-- SCRIPTS DEL PODA -->
    <script src="../js/configModalPoda/config_poda.js"></script>
    <script src="../js/configModalPoda/tabla_poda.js"></script>
    <script src="../js/configModalPoda/detalles_modal.js"></script>

</body>

</html>