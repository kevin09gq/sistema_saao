<?php
include "../../../config/config.php";
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial - Sistema SAAO</title>
    
    <!-- CSS de Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../../../public/styles/navbar_styles.css">
    <link rel="stylesheet" href="css/historial_v2.css">
</head>

<body class="bg-light">
    <?php
    $rutaRaiz = '/sistema_saao';
    include "../../../public/views/navbar.php";
    ?>

    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-12">
                <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 15px;">
                    <div class="card-body p-4 bg-white">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                                <i class="bi bi-calendar-check text-success fs-3"></i>
                            </div>
                            <div>
                                <h1 class="h3 mb-0 fw-bold text-dark">Historial de Incidencias</h1>
                                <p class="text-muted mb-0">Gestión avanzada de asistencias, faltas y vacaciones</p>
                            </div>
                        </div>

                        <!-- Selector de Modo (Tabs de Bootstrap) -->
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <ul class="nav nav-pills bg-light p-1 rounded-3" id="pills-tab" role="tablist" style="width: fit-content;">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active px-4 fw-semibold" id="pills-semana-tab" data-bs-toggle="pill" data-bs-target="#pills-semana" type="button" role="tab">
                                        <i class="bi bi-calendar-range me-2"></i>Por semana
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link px-4 fw-semibold" id="pills-persona-tab" data-bs-toggle="pill" data-bs-target="#pills-persona" type="button" role="tab">
                                        <i class="bi bi-person-badge me-2"></i>Por persona
                                    </button>
                                </li>
                            </ul>

                            <button id="btn_regresar_lista_top" class="btn btn-outline-primary btn-sm rounded-pill px-4 shadow-sm" style="display: none;">
                                <i class="bi bi-arrow-left-circle me-2"></i>Regresar a la lista de semanas
                            </button>
                        </div>

                        <!-- Filtros Generales -->
                        <div class="row g-3 p-3 bg-light rounded-3 border border-light">
                            <div class="col-md-3">
                                <label class="form-label fw-bold small text-uppercase">Empresa</label>
                                <select id="filtro_empresa" class="form-select border-0 shadow-sm">
                                    <option value="">Cargando empresas...</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-bold small text-uppercase">Año</label>
                                <select id="filtro_anio" class="form-select border-0 shadow-sm" disabled>
                                    <option value="">Selecciona año</option>
                                </select>
                            </div>
                            <div class="col-md-2" id="contenedor_filtro_semana">
                                <label class="form-label fw-bold small text-uppercase">Semana</label>
                                <select id="filtro_semana" class="form-select border-0 shadow-sm" disabled>
                                    <option value="">Todas</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold small text-uppercase">Departamento</label>
                                <select id="filtro_departamento" class="form-select border-0 shadow-sm">
                                    <option value="">Todos los departamentos</option>
                                </select>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button id="btn_limpiar_filtros" class="btn btn-outline-secondary w-100 border-0 shadow-sm bg-white">
                                    <i class="bi bi-eraser me-2"></i>Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="tab-content" id="pills-tabContent">
            <!-- Vista Por Semana -->
            <div class="tab-pane fade show active" id="pills-semana" role="tabpanel">
                <div class="card border-0 shadow-sm" style="border-radius: 15px;">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0" id="tabla_semana">
                                <thead class="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th class="ps-4 border-0">Semana</th>
                                        <th class="border-0">Vacaciones</th>
                                        <th class="border-0">Ausencias</th>
                                        <th class="border-0">Incapacidades</th>
                                        <th class="border-0 text-center">Días Pagados</th>
                                        <th class="pe-4 border-0 text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody_semana">
                                    <tr>
                                        <td colspan="6" class="text-center py-5">
                                            <div class="text-muted">
                                                <i class="bi bi-funnel fs-1 d-block mb-3"></i>
                                                Selecciona Empresa y Año para comenzar
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0 py-3" id="paginacion_semana"></div>
                </div>
            </div>

            <!-- Vista Por Persona -->
            <div class="tab-pane fade" id="pills-persona" role="tabpanel">
                <div class="card border-0 shadow-sm mb-4" style="border-radius: 15px;">
                    <div class="card-body">
                        <div class="row g-3 align-items-center">
                            <div class="col-md-4">
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                                    <input type="text" id="persona_buscar" class="form-control border-start-0 ps-0 shadow-none" placeholder="Buscar empleado por nombre...">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <select id="persona_orden" class="form-select shadow-none">
                                    <option value="nombre_asc">Nombre (A-Z)</option>
                                    <option value="vacaciones-desc">Más Vacaciones</option>
                                    <option value="ausencias-desc">Más Ausencias</option>
                                    <option value="incapacidades-desc">Más Incapacidades</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card border-0 shadow-sm" style="border-radius: 15px;">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0" id="tabla_persona">
                                <thead class="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th class="ps-4 border-0">Empleado</th>
                                        <th class="border-0">Vacaciones</th>
                                        <th class="border-0">Ausencias</th>
                                        <th class="border-0">Incapacidades</th>
                                        <th class="border-0 text-center">Días Pagados</th>
                                        <th class="pe-4 border-0 text-end">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody_persona">
                                    <tr>
                                        <td colspan="6" class="text-center py-5 text-muted">
                                            Selecciona filtros para visualizar datos
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0 py-3" id="paginacion_persona"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Detalle Empleados -->
    <div class="modal fade" id="modalDetalle" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow" style="border-radius: 20px;">
                <div class="modal-header border-0 pb-0">
                    <div>
                        <h5 class="modal-title fw-bold" id="modalTitulo">Detalle de Semana</h5>
                        <p class="text-muted small mb-0" id="modalSubtitulo"></p>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="tabla_modal">
                            <thead class="bg-light small text-uppercase">
                                <tr>
                                    <th>Empleado</th>
                                    <th>Vacaciones</th>
                                    <th>Ausencias</th>
                                    <th>Incapacidades</th>
                                    <th class="text-center">Días Pagados</th>
                                </tr>
                            </thead>
                            <tbody id="tbody_modal"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="js/historial_v2.js"></script>
</body>

</html>