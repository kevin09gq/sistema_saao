<?php
require_once __DIR__ . "/../public/php/config.php";
require_once __DIR__ . "/../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("aguinaldos.ver_menu");
verificarPermiso("aguinaldos.generar_aguinaldo");
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generar Aguinaldo | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos Bootstrap y Fuentes -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="css/aguinaldo.css">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body>

    <?php require_once __DIR__ . '/../navbar/navbar.php'; ?>

    <main class="container-fluid py-4">

        <!-- 1. FORMULARIO CENTRALIZADO -->
        <!-- NOTA: Para ocultar agregar la clase 'd-none' -->
        <div id="contenedor_formulario" class="d-flex align-items-center justify-content-center" style="min-height: 65vh;">
            <div class="form-central-card w-100">
                <div class="form-central-header">
                    <div class="form-central-icon">
                        <i class="bi bi-gift-fill"></i>
                    </div>
                    <h2 class="form-central-title">Cálculo de Aguinaldo</h2>
                    <p class="form-central-desc">Configura los parámetros para procesar el cálculo del periodo</p>
                </div>
                <div class="form-central-body">
                    <form id="form_aguinaldo" method="post">
                        <div class="mb-3">
                            <label for="anio" class="form-label">Año a procesar</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-calendar-event"></i></span>
                                <input type="number" class="form-control text-center fw-semibold" id="anio" name="anio" placeholder="Ej. 2024" min="2000" max="2099" autocomplete="off">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="id_departamento_confg">Departamento</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-diagram-3"></i></span>
                                <select class="form-select" name="id_departamento_confg" id="id_departamento_confg">
                                    <option value="-1" selected>--- Seleccionar ---</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="dias_pago" class="form-label">Días de Pago</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-cash-coin"></i></span>
                                <input type="number" class="form-control text-center fw-semibold" id="dias_pago" name="dias_pago" placeholder="Ej. 15" min="1" max="31" autocomplete="off">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-success w-100 justify-content-center py-2">
                            <i class="bi bi-gear-fill me-2"></i>Procesar Cálculo
                        </button>
                    </form>

                    <!-- Enlace de volver atrás -->
                    <div class="text-center mt-3 pt-2 border-top">
                        <a href="aguinaldo.php" class="text-secondary text-decoration-none small fw-semibold">
                            <i class="bi bi-arrow-left me-1"></i>Volver al historial
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. CONTENEDOR DE RESULTADOS -->
        <!-- NOTA: Para ocultar agregar la clase 'd-none' -->
        <div id="contenedor_tabla_aguinaldo" class="d-none">

            <!-- Encabezado del módulo -->
            <div class="module-header mb-4">
                <div class="module-header-left">
                    <div class="module-icon">
                        <i class="bi bi-gift-fill"></i>
                    </div>
                    <div>
                        <h1 class="module-title mb-0">Cálculo de Aguinaldo (<span id="anio_calculo_label">TMP</span>)</h1>
                        <p class="module-subtitle mb-0">Gestión de incidencias, deducciones y dispersión de aguinaldo</p>
                    </div>
                </div>
            </div>

            <!-- Barra de Acciones y Herramientas -->
            <div class="card border-0 shadow-sm p-3 mb-4">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    
                    <!-- Grupo 1: Configuración & Validaciones -->
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <button type="button" class="btn-action-tool" id="btn_configuracion" title="Configurar parámetros para el cálculo del Aguinaldo">
                            <i class="bi bi-wrench-adjustable text-success"></i> Incidencias
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_redondeos" title="Configurar Redondeos para el Aguinaldo">
                            <i class="bi bi-cash-coin text-warning"></i> Redondeos
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_tarjetas" title="Ver Dispersión de Tarjetas">
                            <i class="bi bi-credit-card text-primary"></i> Tarjetas
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_visibilidad" title="Ocultar o Mostrar empleados en la tabla">
                            <i class="bi bi-eye text-info"></i> Visibilidad
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_sin_derecho" title="Ver Empleados sin derecho a Aguinaldo">
                            <i class="bi bi-person-fill-dash text-danger"></i> No Aplica
                        </button>
                    </div>

                    <!-- Grupo 2: Reportes, Tickets y Acciones Principales -->
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <button type="button" class="btn-action-tool" id="btn_reportes" title="Generar Reportes en EXCEL">
                            <i class="bi bi-file-earmark-excel text-success"></i> Reportes
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_ticket_pdf" title="Descargar Tickets General">
                            <i class="bi bi-ticket-perforated text-primary"></i> Ticket
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_ticket_seleccion_aguinaldo" title="Seleccionar Empleados para Tickets">
                            <i class="bi bi-check2-square text-secondary"></i> Selección
                        </button>

                        <div class="vr mx-1 opacity-25 d-none d-md-block"></div>

                        <button type="button" class="btn btn-success" id="btn_guardar" title="Guardar los cambios">
                            <i class="bi bi-download me-1"></i> Guardar
                        </button>
                        <button type="button" class="btn-action-tool" id="btn_resetear" title="Resetear el proceso y eliminar los datos procesados">
                            <i class="bi bi-arrow-counterclockwise text-secondary"></i> Resetear
                        </button>
                        <button type="button" class="btn-action-tool btn-action-danger" id="btn_cerrar" title="Cerrar el proceso y volver al formulario inicial">
                            <i class="bi bi-x-circle text-danger"></i> Cerrar
                        </button>
                    </div>

                </div>
            </div>

            <!-- Filtros de Búsqueda -->
            <div class="toolbar-card mb-4">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label" for="busqueda">Búsqueda</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input class="form-control" type="text" id="busqueda" placeholder="Buscar por nombre o clave...">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label" for="id_empresa">Empresa</label>
                        <select class="form-select" id="id_empresa">
                            <option value="-1" selected>Todas las empresas</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label" for="id_area">Área</label>
                        <select class="form-select" id="id_area">
                            <option value="-1" selected>Todas las áreas</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label" for="id_departamento">Departamento</label>
                        <select class="form-select" id="id_departamento" disabled>
                            <option value="-1" selected>Todos</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label" for="limite">Mostrar</label>
                        <select class="form-select" id="limite">
                            <option value="10" selected>10 registros</option>
                            <option value="25">25 registros</option>
                            <option value="50">50 registros</option>
                            <option value="100">100 registros</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabla de Resultados -->
            <div class="card border-0 shadow-sm">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" id="tabla_aguinaldo">
                        <thead>
                            <tr>
                                <th class="text-center">N°</th>
                                <th class="text-center">CLAVE</th>
                                <th>NOMBRE</th>
                                <th class="text-center">EMPRESA</th>
                                <th class="text-center">NSS</th>
                                <th class="text-center">SUELDO DIARIO</th>
                                <th class="text-center">DÍAS TRAB.</th>
                                <th class="text-center">MESES TRAB.</th>
                                <th class="text-center">AGUINALDO</th>
                                <th class="text-center">ISR</th>
                                <th class="text-center">DISPERSIÓN TARJETA</th>
                                <th class="text-center">NETO PAGAR</th>
                                <th class="text-center">REDONDEO</th>
                                <th class="text-center">TOTAL REDONDEADO</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider text-center" id="cuerpo_tabla_aguinaldo">
                            <tr>
                                <td colspan="14" class="py-4 text-muted">No hay datos procesados para mostrar.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <div class="card-footer bg-white py-3">
                    <nav aria-label="Page navigation" id="contenedor-paginacion">
                        <ul class="pagination justify-content-center" id="paginacion">
                            <!-- Se genera dinámicamente -->
                        </ul>
                    </nav>
                </div>
            </div>

        </div> <!-- Fin Contenedor de Resultados -->

        <!-- Menú contextual simple para la tabla de corte -->
        <div id="context_menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
            <div class="cm_item" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎 Ver detalles</div>
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

    <!-- Scripts necesarios para el funcionamiento de la página -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Scripts del módulo -->
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