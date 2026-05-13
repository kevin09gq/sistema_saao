<?php
include_once __DIR__ . "/../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generar Aguinaldo | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos Bootstrap -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../public/views/navbar.php'; ?>

    <main class="container-fluid py-4">

        <!-- 1. FORMULARIO CENTRALIZADO -->
        <!-- NOTA: Para ocultar agregar la clase 'd-none' -->
        <div id="contenedor_formulario" class="row justify-content-center align-items-center" style="min-height: 40vh;">
            <div class="col-12 col-md-4">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h5 class="card-title text-center mb-4 text-success">Cálculo de Aguinaldo</h5>
                        <form id="form_aguinaldo" method="post">
                            <div class="mb-3">
                                <label for="anio" class="form-label fw-bold">Año a procesar</label>
                                <input type="number" class="form-control form-control-lg text-center" id="anio" name="anio" placeholder="Ej. 2024" min="2000" max="2099" autocomplete="off">
                            </div>
                            <div class="mb-3">
                                <label for="dias_pago" class="form-label fw-bold">Días de Pago</label>
                                <input type="number" class="form-control form-control-lg text-center" id="dias_pago" name="dias_pago" placeholder="Ej. 15" min="1" max="31" autocomplete="off">
                            </div>
                            <button type="submit" class="btn btn-success w-100 btn-lg shadow-sm">
                                <i class="bi bi-gear-fill me-2"></i>Procesar
                            </button>
                        </form>

                        <!-- Enlace de volver atrás -->
                        <div class="text-center mt-3">
                            <a href="index.php" class="text-secondary text-decoration-none small fw-semibold link-hover-custom">
                                <i class="bi bi-arrow-left-short me-1"></i>Volver al historial
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CONTENEDOR DE RESULTADOS -->
        <!-- NOTA: Para ocultar agregar la clase 'd-none' -->
        <div id="contenedor_tabla_aguinaldo" class="mt-4 d-none">

            <!-- TITULO DEL FORMULARIO -->
            <h2 class="mb-4 text-success fw-bolder text-uppercase"><i class="bi bi-gift me-2"></i>Cálculo de Aguinaldo (<span id="anio_calculo_label">TMP</span>)</h2>

            <!-- 2. BOTONES (ALINEADOS A LA DERECHA) -->
            <div class="d-flex justify-content-end gap-2 mb-3">
                <button class="btn btn-sm btn-outline-info fw-bold shadow-sm" id="btn_visibilidad" title="Ocultar o Mostrar empleados en la tabla">
                    <i class="bi bi-eye-slash me-1"></i>Visible
                </button>
                <button class="btn btn-sm btn-outline-danger fw-bold shadow-sm" id="btn_sin_derecho" title="Ver Empleados sin derecho a Aguinaldo">
                    <i class="bi bi-person-fill-dash me-1"></i>No Aplica
                </button>
                <button class="btn btn-sm btn-outline-warning fw-bold shadow-sm" id="btn_redondeos" title="Configurar Redondeos para el Aguinaldo">
                    <i class="bi bi-cash-coin me-1"></i>Redondeos
                </button>
                <button class="btn btn-sm btn-outline-success fw-bold shadow-sm" id="btn_tarjetas" title="Ver Dispersión de Tarjetas">
                    <i class="bi bi-credit-card me-1"></i>Tarjetas
                </button>
                <button class="btn btn-sm btn-outline-primary fw-bold shadow-sm" id="btn_ticket_pdf" title="Descargar Tickets General">
                    <i class="bi bi-ticket-perforated me-1"></i>Ticket
                </button>
                <button class="btn btn-sm btn-outline-warning fw-bold shadow-sm" id="btn_ticket_seleccion_aguinaldo" title="Seleccionar Empleados para Tickets">
                    <i class="bi bi-check2-square me-1"></i>Selección
                </button>
                <button class="btn btn-sm btn-primary fw-bold shadow-sm" id="btn_guardar" title="Guardar los cambios">
                    <i class="bi bi-download me-1"></i>Guardar
                </button>
                <button class="btn btn-sm btn-dark fw-bold shadow-sm" id="btn_configuracion" title="Configurar parámetros para el cálculo del Aguinaldo">
                    <i class="bi bi-wrench-adjustable me-1"></i> Incidencias
                </button>
                <button class="btn btn-sm btn-success text-white fw-bold shadow-sm" id="btn_reportes" title="Generar Reportes en EXCEL">
                    <i class="bi bi-file-earmark-pdf me-1"></i> Reportes
                </button>
                <button class="btn btn-sm btn-outline-secondary fw-bold shadow-sm" id="btn_resetear" title="Resetear el proceso y eliminar los datos procesados">
                    <i class="bi bi-arrow-counterclockwise me-1"></i> Resetear
                </button>
                <button class="btn btn-sm btn-outline-danger fw-bold shadow-sm" id="btn_cerrar" title="Cerrar el proceso y volver al formulario inicial">
                    <i class="bi bi-x-circle me-1"></i> Cerrar
                </button>
            </div>

            <!-- 3. FILTROS (ALINEADOS A LA IZQUIERDA) -->
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body bg-white rounded">
                    <div class="row g-3 align-items-end">
                        <div class="col-3">
                            <label class="form-label small fw-bold text-muted">Busqueda:</label>
                            <input class="form-control form-control-sm shadow-sm" type="text" id="busqueda" placeholder="Buscar...">
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
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. TABLA -->
            <div class="card shadow-sm">
                <div class="table-responsive mb-3">
                    <table class="table table-sm table-hover mb-0" id="tabla_aguinaldo">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center fs-6">N°</th>
                                <th class="text-center fs-6">CLAVE</th>
                                <th class="text-center fs-6">NOMBRE</th>
                                <th class="text-center fs-6">EMPRESA</th>
                                <th class="text-center fs-6">NSS</th>
                                <th class="text-center fs-6" width="100">SUELDO DIARIO</th>
                                <th class="text-center fs-6" width="100">DIAS TRABAJADOS</th>
                                <th class="text-center fs-6" width="100">MESES TRABAJADOS</th>
                                <th class="text-center fs-6">AGUINALDO</th>
                                <th class="text-center fs-6">ISR</th>
                                <th class="text-center fs-6" width="120">DISPERSION TARJETA</th>
                                <th class="text-center fs-6">NETO PAGAR</th>
                                <th class="text-center fs-6">REDONDEO</th>
                                <th class="text-center fs-6" width="100">NETO PAGAR REDONDEADO</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider text-center" id="cuerpo_tabla_aguinaldo">
                            <!-- Ejemplo de fila vacía o mensaje -->
                            <tr>
                                <td colspan="13" class="py-4 text-muted">No hay datos procesados para mostrar.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <nav aria-label="Page navigation" id="contenedor-paginacion">
                    <ul class="pagination justify-content-center" id="paginacion">
                        <!-- Se genera dinámicamente -->
                    </ul>
                </nav>
            </div>

        </div> <!-- Fin Section Results -->


        <!-- Menú contextual simple para la tabla de corte -->
        <div id="context_menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
            <div class="cm_item" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎​ Ver detalles</div>
        </div>

    </main>

    <?php require_once __DIR__  . '/modal_editar.php'; ?>
    <?php require_once __DIR__  . '/modal_configuracion.php'; ?>
    <?php require_once __DIR__  . '/modal_exportar.php'; ?>
    <?php require_once __DIR__  . '/modal_empleados_sin_derecho.php'; ?>
    <?php require_once __DIR__  . '/modal_visibilidad.php'; ?>
    <?php require_once __DIR__  . '/modal_redondeos.php'; ?>
    <?php require_once __DIR__  . '/modal_dispersion_tarjeta.php'; ?>
    <?php require_once __DIR__  . '/modal_tarjeta.php'; ?>
    <?php require_once __DIR__  . '/modal_seleccion_tickets_aguinaldo.php'; ?>

    <!--
    * ==============================================================
    * Scripts necesarios para el funcionamiento de la página
    * ==============================================================
    -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>


    <!-- Mis scripts personalizados -->
    <script src="js/index.js"></script>
    <script src="js/procesar.js"></script>
    <script src="js/interfaz.js"></script>
    <script src="js/ticket_aguinaldo_pdf.js"></script>
    <script src="js/editar_guinaldo.js"></script>
    <script src="js/configuracion.js"></script>
    <script src="js/exportar_aguinaldo.js"></script>
    <script src="js/sin_derecho.js"></script>
    <script src="js/visibilidad.js"></script>
    <script src="js/redondeos.js"></script>
    <script src="js/dispersion_tarjetas.js"></script>

</body>

</html>