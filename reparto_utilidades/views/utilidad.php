<?php
require_once __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reparto de Utilidades (PTU) | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos Bootstrap -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>

    <style>
        /* Aplica a los encabezados de la tabla */
        table th {
            font-size: 12px;
            /* Un poco más grande para diferenciar */
            font-weight: bold;
            /* Opcional, para resaltar */
        }

        /** Aplica para el cuerpo de la tabla */
        #cuerpo_tabla_ptu td {
            /* Ajusta según lo que necesites */
            font-size: 13px;
            /* Opcional, mejora la legibilidad */
            line-height: 1.4;
            /* Centrado vertical */
            vertical-align: middle;
        }

        /* Esto asegura que el cuerpo del modal no crezca más allá de la pantalla */
        .modal-dialog-scrollable .modal-body {
            overflow-y: auto;
            max-height: 70vh;
            /* Ajusta este valor (vh = viewport height) según necesites */
        }
    </style>
</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main class="container-fluid py-4">

        <div class="row g-4">

            <!-- SECCIÓN DE CONFIGURACIÓN -->
            <div id="cuerpo_config_ptu" class="row">

                <!-- TÍTULO DE LA TABLA DE ACCIÓN CON ENLACE DE REGRESO -->
                <h2 class="mb-4 text-primary fw-bolder text-uppercase my-4 d-flex align-items-center">
                    <!-- Enlace con flecha hacia la izquierda -->
                    <a href="historial.php" class="text-primary me-3 text-decoration-none" title="Ir al Historial de registros">
                        <i class="bi bi-arrow-left-circle-fill"></i> <!-- O puedes usar "bi-arrow-left" si la prefieres sin círculo -->
                    </a>

                    <!-- Icono y Texto original -->
                    <i class="bi bi-safe2 me-2"></i>Reparto de Utilidades (PTU)
                </h2>

                <!-- SECCIÓN 1: DÍAS DE PAGO POR DEPARTAMENTO -->
                <div id="seccion_1_configuracion" class="col-12 col-xl-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary mb-4"><i class="bi bi-calendar-check me-2"></i>1. Configuración de Días y Año</h5>
                            <div class="mb-4">
                                <label for="anio" class="form-label fw-bold">Año a procesar</label>
                                <input type="number" class="form-control" id="anio" placeholder="Ej. 2024" min="2000" max="2099">
                            </div>

                            <table class="table table-sm table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Departamento</th>
                                        <th width="150">Días de Utilidad</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpo_tabla_dias_pago">
                                    <!-- Esto se genera dinámicamente con JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: TIPO DE SALARIO -->
                <div id="seccion_2_salarios" class="col-12 col-xl-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary mb-4"><i class="bi bi-cash-stack me-2"></i>2. Configuración de Salarios</h5>
                            <div class="table-responsive small">
                                <table class="table table-sm table-hover align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Departamento</th>
                                            <th>Origen Salario</th>
                                            <th width="150">Monto Manual</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cuerpo_tabla_salarios">
                                        <!-- Esto se genera con el js -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="text-end mt-3">
                                <button class="btn btn-primary" id="btn_procesar_ptu">
                                    <i class="bi bi-gear-fill me-2"></i>Calcular PTU
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 3: TABLA DE RESULTADOS -->
            <!-- NOTA: Para ocultar inicialmente, agregar d-none -->
            <div id="seccion_3_resultados" class="col-12 mt-5 d-none">
                <!-- TÍTULO DE LA TABLA DE ACCIÓN -->
                <h2 class="mb-4 text-primary fw-bolder text-uppercase">
                    <i class="bi bi-safe2 me-2"></i>Reparto de Utilidades (PTU) - <span id="span_anio">0000</span>
                </h2>

                <!-- BOTONES DE ACCIÓN (Derecha) -->
                <div class="d-flex flex-wrap justify-content-end gap-3 mb-3">

                    <div class="btn-group shadow-sm" role="group">
                        <button class="btn btn-sm btn-outline-info fw-bold" id="btn_visibilidad"><i class="bi bi-eye-fill me-1"></i>Visible</button>
                        <button class="btn btn-sm btn-outline-warning fw-bold" id="btn_redondeo"><i class="bi bi-cash-coin me-1"></i>Redondeo</button>
                        <button class="btn btn-sm btn-outline-success fw-bold" id="btn_tarjeta"><i class="bi bi-credit-card-fill me-1"></i>Tarjeta</button>
                        <button class="btn btn-sm btn-outline-dark fw-bold" id="btn_fechas"><i class="bi bi-calendar-event me-1"></i>Fechas</button>
                        <button class="btn btn-sm btn-dark fw-bold" id="btn_configuracion"><i class="bi bi-gear-fill me-1"></i>Listas</button>
                    </div>

                    <div class="btn-group shadow-sm" role="group">
                        <button class="btn btn-sm btn-success fw-bold" id="btn_reporte"><i class="bi bi-file-earmark-excel-fill me-1"></i>Reporte</button>
                        <button class="btn btn-sm btn-danger fw-bold" id="btn_ticket_pdf"><i class="bi bi-ticket-perforated me-1"></i>Tickets</button>
                        <button class="btn btn-sm btn-outline-danger fw-bold" id="btn_ticket_seleccion_ptu"><i class="bi bi-person-check me-1"></i>Selección</button>
                    </div>

                    <div class="btn-group shadow-sm" role="group">
                        <button class="btn btn-sm btn-primary fw-bold" id="btn_guardar"><i class="bi bi-download me-1"></i>Guardar</button>
                        <button class="btn btn-sm btn-outline-danger fw-bold" id="btn_cerrar"><i class="bi bi-x-circle me-1"></i>Cerrar</button>
                    </div>

                </div>

                <!-- FILTROS -->
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body bg-white rounded">
                        <div class="row g-3 align-items-end">
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted">Búsqueda:</label>
                                <input class="form-control form-control-sm shadow-sm" type="text" id="busqueda" placeholder="Nombre o clave...">
                            </div>
                            <div class="col-auto">
                                <label class="form-label small fw-bold text-muted">Departamento</label>
                                <select class="form-select form-select-sm" id="id_departamento">
                                    <option value="-1" selected>Todos los departamentos</option>
                                </select>
                            </div>
                            <div class="col-auto">
                                <label class="form-label small fw-bold text-muted">Empresa</label>
                                <select class="form-select form-select-sm" id="id_empresa">
                                    <option value="-1" selected>Todas las empresas</option>
                                </select>
                            </div>
                            <div class="col-auto">
                                <label class="form-label small fw-bold text-muted">Mostrar</label>
                                <select class="form-select form-select-sm" style="width: 80px;" id="limite">
                                    <option value="10" selected>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TABLA -->
                <div class="card shadow-sm">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-hover mb-0" id="tabla_ptu">
                            <thead class="table-light">
                                <tr class="text-center">
                                    <th class="fs-7">#</th>
                                    <th class="fs-7">CLAVE</th>
                                    <th class="fs-7">NOMBRE EMPLEADO</th>
                                    <th class="fs-7">NSS</th>
                                    <th class="fs-7">EMPRESA</th>
                                    <th class="fs-7">SALARIO</th>
                                    <th class="fs-7">PUESTO</th>
                                    <th class="fs-7 text-end">PTU TOTAL</th>
                                    <th width="150" class="fs-7 text-end">DISPERSION TARJETA</th>
                                    <th class="fs-7 text-end">NETO A PAGAR</th>
                                    <th class="fs-7 text-end">REDONDEO</th>
                                    <th width="150" class="fs-7 text-end">NETO PAGAR REDONDEADO</th>
                                </tr>
                            </thead>
                            <tbody class="text-center" id="cuerpo_tabla_ptu"><!-- Esto se genera dinámicamente --></tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    <nav aria-label="Page navigation" id="contenedor-paginacion">
                        <ul class="pagination justify-content-center" id="paginacion">
                            <!-- Se genera dinámicamente -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>


        <!-- Menú contextual simple para la tabla de corte -->
        <div id="context_menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
            <div class="cm_item" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎​ Ver detalles</div>
        </div>
    </main>

    <?php include __DIR__ . '/modal/modal_detalles.php'; ?>
    <?php include __DIR__ . '/modal/modal_visibilidad.php'; ?>
    <?php include __DIR__ . '/modal/modal_redondeos.php'; ?>
    <?php include __DIR__ . '/modal/modal_dispersion_tarjeta.php'; ?>
    <?php include __DIR__ . '/modal/modal_tarjeta.php'; ?>
    <?php include __DIR__ . '/modal/modal_configuracion.php'; ?>
    <?php include __DIR__ . '/modal/modal_exportar.php'; ?>
    <?php include __DIR__ . '/modal/modal_seleccion_fechas.php'; ?>

    <!-- MODALES PARA LOS TICKETS -->
    <?php require_once __DIR__ . '/modal/modal_seleccion_tickets_ptu.php' ?>
    <?php require_once __DIR__ . '/modal/modal_tickets_empleados.php' ?>

    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>

    <!-- Script personalizado -->
    <script src="../js/index.js"></script>
    <script src="../js/procesar.js"></script>
    <script src="../js/interfaz.js"></script>
    <script src="../js/detalles.js"></script>
    <script src="../js/visibilidad.js"></script>
    <script src="../js/redondeos.js"></script>
    <script src="../js/tarjeta.js"></script>
    <script src="../js/configuracion.js"></script>
    <script src="../js/exportar.js"></script>
    <script src="../js/seleccion_fechas.js"></script>

    <!-- Scripts para los tickets -->
    <script src="../js/ticket_ptu_pdf.js"></script>




</body>

</html>