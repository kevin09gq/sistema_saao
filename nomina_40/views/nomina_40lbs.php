<!DOCTYPE html>
<html lang="es">

<!--Incluir config.php para iniciar sesión -->
<?php
include "../../config/config.php";
verificarSesion(); // Proteger esta página
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Módulo de Nómina</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">
</head>

<body class="bg-secondary-subtle">
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- CONTENEDOR DE LOS DATOS DE LA NOMINA -->

    <div class="container" id="contenedor-data">

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

                    </div>

                </div>

            </div>

        </div>

    </div>

    <!-- CONTENEDOR DE LA TABLA DE NÓMINA -->

    <div class="container-tabla-nomina-40lbs" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-40lbs">
            <div class="header-titulo-semana">
                <h3 id=nombre_nomina>NÓMINA DEL 27 JUNIO AL 03 DE JULIO DEL 2026</h3>
                <span class="sem-info-40lbs" id="num_semana">212</span>
            </div>
            <div class="header-controls-40lbs">

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
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_establecer_horario_semanal">
                                <i class="bi bi-calendar-check text-primary"></i>
                                <span>Establecer Horario Semanal</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_marcajes">
                                <i class="bi bi-clock-history text-primary"></i>
                                <span>Ajustar Marcaje</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn-seleccionar-empleados">
                                <i class="bi bi-people text-primary"></i>
                                <span>Seleccionar Empleados</span>
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
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_actualizar_biometrico">
                                <i class="bi bi-person-badge text-primary"></i>
                                <span>Actualizar Biométrico</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_modal_olvidos_masivos">
                                <i class="bi bi-clipboard-check text-danger"></i>
                                <span>Perdonar Olvidos de Checador</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_add_percepciones_deducciones">
                                <i class="bi bi-patch-plus text-primary"></i>
                                <span>Percepciones / Deducciones</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_ver_dispersion">
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
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_sueldo_base">
                                <i class="bi bi-currency-dollar text-primary"></i>
                                <span>Actualizar Sueldo Base</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_redondear_sueldos">
                                <i class="bi bi-arrow-repeat text-success"></i>
                                <span>Redondear Sueldos Masivo</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-aplicar-copias" type="button" id="btn_aplicar_copias_global" hidden>
                                <i class="bi bi-arrow-clockwise text-success"></i>
                                <span>Aplicar Tarjeta</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-delete-tarjeta" type="button" id="btn_delete_tarjeta" hidden>
                                <i class="bi bi-credit-card-2-back text-danger"></i>
                                <span>Quitar Tarjeta</span>
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2" type="button" id="btn_abrir_add_remove_tarjeta">
                                <i class="bi bi-person-gear text-info"></i>
                                <span>Configurar Tarjeta / Impuestos</span>
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
                            <button class="dropdown-item d-flex align-items-center gap-2 btn-ticket-zebra" type="button" id="btn_ticket_manual_40lbs">
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
        <div class="controles-tabla-40lbs">
            <div class="filtros-container-40lbs">
                <select class="filtro-departamento-40lbs" id="filtro-departamento">
                    <!-- Se poblará dinámicamente -->
                </select>

                <div class="busqueda-container-40lbs" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-40lbs" placeholder="Buscar..." id="busqueda-nomina-40lbs">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda"
                        title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-40lbs">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_40lbs" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
                </button>

            </div>
        </div>

        <div id="tabla-nomina-container-40lbs" class="tabla-nomina-container-40lbs">
            <div class="table-responsive-40lbs">
                <table class="table-nomina-40lbs" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">SUELDO <br> NETO</th>
                            <th rowspan="2">INCENTIVO</th>
                            <th rowspan="2">EXTRAS</th>
                            <th rowspan="2">Total Percepciones</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">AJUSTES <br> AL SUB</th>
                            <th rowspan="2">AUSENTISMO</th>
                            <th rowspan="2">PERMISO</th>
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
                    <tbody id="tabla-nomina-body-40lbs">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>

    <!-- Incluir el modal -->
    <?php include 'modals/modalListaRaya.php'; ?>

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
    <script src="../js/modals/listaDeRaya.js"></script>

</body>

</html>