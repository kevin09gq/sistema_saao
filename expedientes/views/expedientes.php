<!DOCTYPE html>
<?php
include("../../config/config.php");
verificarSesion();
?>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control de Expedientes | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/expedientes.css?v=<?= filemtime(__DIR__ . '/../css/expedientes.css') ?>">
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body class="bg-body-tertiary expedientes-page">

    <?php include("../../public/views/navbar.php"); ?>

    <div class="container py-4">

        <!-- Header minimalista -->
        <div class="exp-page-header">
            <div class="exp-page-header-left">
                <div class="exp-page-icon">
                    <i class="bi bi-folder-check"></i>
                </div>
                <div>
                    <h1 class="exp-page-title">Control de Expedientes</h1>
                    <p class="exp-page-desc">Administra el catálogo de requisitos y lleva el control documental de cada trabajador.</p>
                </div>
            </div>
        </div>

        <div class="exp-tabs-nav" id="pestanasExpedientes" role="tablist">
            <button class="exp-tab-btn active" id="empleados-tab" data-bs-toggle="pill"
                data-bs-target="#tab-empleados" type="button" role="tab">
                <i class="bi bi-people"></i> Expedientes por Empleado
            </button>
            <button class="exp-tab-btn" id="catalogo-tab" data-bs-toggle="pill"
                data-bs-target="#tab-catalogo" type="button" role="tab">
                <i class="bi bi-list-check"></i> Catálogo de Requisitos
            </button>
        </div>

        <div class="tab-content" id="pestanasExpedientesContent">

            <!-- ============================ -->
            <!-- PESTAÑA 1: EMPLEADOS         -->
            <!-- ============================ -->
            <div class="tab-pane fade show active" id="tab-empleados" role="tabpanel">

                <!-- Filtros avanzados estilo vacaciones -->
                <div class="emp-filter-section">
                    <div class="row g-2.5 align-items-end">
                        <div class="col-lg-3 col-md-6">
                            <label class="emp-form-label">Buscar Empleado</label>
                            <div class="emp-input-wrapper">
                                <i class="bi bi-search emp-input-icon"></i>
                                <input type="text" id="buscadorEmpExp" class="emp-form-control" placeholder="Nombre o clave...">
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-3">
                            <label class="emp-form-label">Área</label>
                            <select id="filtroAreaEmp" class="emp-form-select">
                                <option value="-1">Todas las áreas</option>
                            </select>
                        </div>
                        <div class="col-lg-2 col-md-3">
                            <label class="emp-form-label">Departamento</label>
                            <select id="filtroDeptoEmp" class="emp-form-select">
                                <option value="-1">Todos los depto.</option>
                            </select>
                        </div>
                        <div class="col-lg-2 col-md-4">
                            <label class="emp-form-label">Estado Expediente</label>
                            <select id="filtroAvanceEmp" class="emp-form-select">
                                <option value="todos">Todos los avances</option>
                                <option value="completos">🟢 Completos (100%)</option>
                                <option value="incompletos">🟡 Incompletos (&lt;100%)</option>
                                <option value="sin_documentos">🔴 Sin documentos (0%)</option>
                            </select>
                        </div>
                        <div class="col-lg-2 col-md-5">
                            <label class="emp-form-label">Falta Requisito</label>
                            <select id="filtroFaltaRequisitoEmp" class="emp-form-select">
                                <option value="-1">Cualquier requisito</option>
                            </select>
                        </div>
                        <div class="col-lg-1 col-md-3">
                            <button id="btnLimpiarEmpExp" class="emp-btn-limpiar w-100" title="Limpiar Filtros">
                                <i class="bi bi-eraser"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Barra de Acciones y Exportación -->
                <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div class="text-muted small fw-semibold">
                        <i class="bi bi-table text-success me-1"></i> Listado de trabajadores y cumplimiento de expediente
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="emp-btn-action" id="btnExportarGeneral" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d; font-weight:600;">
                            <i class="bi bi-file-earmark-excel text-success"></i> Exportar General
                        </button>
                        <button type="button" class="emp-btn-action" id="btnExportarPersonalizado" style="background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; font-weight:600;">
                            <i class="bi bi-sliders text-primary"></i> Exportar Personalizado
                        </button>
                    </div>
                </div>

                <!-- Tabla estilo vacaciones -->
                <div class="emp-table-wrapper">
                    <div class="table-responsive">
                        <table class="table emp-table-custom" id="tablaEmpleadosExp">
                            <thead>
                                <tr>
                                    <th>Clave</th>
                                    <th>Empleado</th>
                                    <th>Departamento</th>
                                    <th>Área</th>
                                    <th>Progreso Expediente</th>
                                    <th class="text-end">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpoEmpleadosExp"></tbody>
                        </table>
                    </div>

                    <!-- Paginación integrada estilo vacaciones -->
                    <div class="emp-pagination-container">
                        <div id="infoEmpExp" class="emp-page-info"></div>
                        <nav>
                            <ul class="pagination emp-custom-pagination mb-0" id="paginacionEmpExp"></ul>
                        </nav>
                    </div>
                </div>

            </div>

            <!-- ============================ -->
            <!-- PESTAÑA 2: CATÁLOGO          -->
            <!-- ============================ -->
            <div class="tab-pane fade" id="tab-catalogo" role="tabpanel">

                <!-- Tabla estilo vacaciones -->
                <div class="emp-table-wrapper">
                    <!-- Sub-header de la tabla -->
                    <div class="cat-table-topbar">
                        <div class="cat-table-title">
                            <i class="bi bi-journals"></i>
                            Catálogo de Campos del Expediente
                        </div>
                        <button type="button" class="emp-btn-action" id="btnAgregarCampo" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d;">
                            <i class="bi bi-plus-lg"></i> Nuevo Campo
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table emp-table-custom" id="tablaCatalogo">
                            <thead>
                                <tr>
                                    <th>Nombre del Campo</th>
                                    <th class="text-center">Historial</th>
                                    <th class="text-center">Activo</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpoCatalogo"></tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- ========================================= -->
    <!-- MODAL: AGREGAR / EDITAR CAMPO DE CATÁLOGO -->
    <!-- ========================================= -->
    <div class="modal fade" id="modalCampoCatalogo" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg" style="border-radius:16px; overflow:hidden;">

                <!-- HEADER MINIMALISTA -->
                <div class="modal-header bg-white px-4 py-3 border-bottom border-light-subtle">
                    <div class="d-flex align-items-center gap-3">
                        <div class="emp-page-icon" style="width:42px; height:42px; font-size:1.2rem;">
                            <i class="bi bi-folder-plus"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold text-dark mb-0 fs-6" id="tituloModalCampo">Nuevo Campo del Expediente</h5>
                            <small class="text-muted" style="font-size:.8rem;">Define el dato que deseas registrar en el expediente</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <form id="formCampoCatalogo">
                    <input type="hidden" id="modal_id_expediente" value="0">

                    <div class="modal-body p-4" style="background-color: #f8fafc;">

                        <!-- SECCIÓN 1: NOMBRE -->
                        <div class="exp-modal-section">
                            <div class="exp-section-label mb-3">
                                <span class="exp-step-badge">1</span>
                                <span>Identificación del Campo</span>
                            </div>
                            <div>
                                <label for="modal_nombre" class="emp-form-label mb-1">
                                    Nombre del Campo <span class="text-danger">*</span>
                                </label>
                                <div class="emp-input-wrapper">
                                    <i class="bi bi-tag emp-input-icon"></i>
                                    <input type="text" class="emp-form-control" id="modal_nombre"
                                        placeholder="Ej: Entregó RFC, Estatura (m), INE – Vigencia..." required style="padding-left: 2.2rem;">
                                </div>
                                <div class="form-text mt-2 text-muted small">
                                    <i class="bi bi-lightbulb text-warning me-1"></i>
                                    Usa un nombre claro y descriptivo que cualquier persona pueda entender.
                                </div>
                            </div>
                        </div>

                        <hr class="my-3 text-muted opacity-25">

                        <!-- SECCIÓN 2: DATOS ADICIONALES (OPCIONAL) -->
                        <div class="exp-modal-section">
                            <div class="exp-section-label mb-2">
                                <span class="exp-step-badge">2</span>
                                <span>Datos Adicionales (Opcional)</span>
                            </div>
                            <p class="text-muted small mb-3 opacity-90">
                                <i class="bi bi-info-circle text-primary me-1"></i>
                                Todo requisito incluye por defecto la pregunta <strong>¿Entregó / Cuenta con este documento? (Sí/No)</strong>. Si además necesitas capturar datos adicionales, selecciónalos a continuación:
                            </p>

                            <!-- Hidden select para mantener compatibilidad con JS existente -->
                            <select class="d-none" id="modal_tipo_dato">
                                <option value=""></option>
                                <option value="DECIMAL">DECIMAL</option>
                                <option value="TEXT">TEXT</option>
                                <option value="DATE">DATE</option>
                                <option value="YEAR">YEAR</option>
                            </select>

                            <div class="tipo-dato-grid" id="tipoDatoGrid">
                                <div class="tipo-dato-card" data-tipo="TEXT">
                                    <div class="tipo-dato-icon">📝</div>
                                    <div class="tipo-dato-titulo">Texto</div>
                                    <div class="tipo-dato-desc">Folios, notas, comentarios</div>
                                </div>
                                <div class="tipo-dato-card" data-tipo="DATE">
                                    <div class="tipo-dato-icon">📅</div>
                                    <div class="tipo-dato-titulo">Fecha Completa</div>
                                    <div class="tipo-dato-desc">Vencimientos, entregas</div>
                                </div>
                                <div class="tipo-dato-card" data-tipo="YEAR">
                                    <div class="tipo-dato-icon">🗓️</div>
                                    <div class="tipo-dato-titulo">Vigencia / Año</div>
                                    <div class="tipo-dato-desc">Año inicio y fin de vigencia</div>
                                </div>
                                <div class="tipo-dato-card" data-tipo="DECIMAL">
                                    <div class="tipo-dato-icon">📐</div>
                                    <div class="tipo-dato-titulo">Número</div>
                                    <div class="tipo-dato-desc">cantidad</div>
                                </div>
                            </div>

                            <div id="ayudaTipoDato" class="exp-tipo-hint mt-3 d-none">
                                <i class="bi bi-info-circle-fill me-2 text-success"></i>
                                <span id="ayudaTipoDatoTexto"></span>
                            </div>
                        </div>

                        <hr class="my-3 text-muted opacity-25">

                        <!-- SECCIÓN 3: OPCIONES -->
                        <div class="exp-modal-section">
                            <div class="exp-section-label mb-3">
                                <span class="exp-step-badge">3</span>
                                <span>Opciones del Campo</span>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <div class="exp-toggle-card" id="cardHistorial">
                                        <div class="exp-toggle-icon text-primary">
                                            <i class="bi bi-clock-history fs-4"></i>
                                        </div>
                                        <div class="exp-toggle-info flex-grow-1">
                                            <div class="fw-semibold text-dark fs-7">Requiere Historial</div>
                                            <div class="text-muted small">Guarda valores anteriores al actualizar. Recomendado para vigencias.</div>
                                        </div>
                                        <div class="form-check form-switch mb-0 ms-2 fs-5">
                                            <input class="form-check-input exp-toggle-input toggle-activo" type="checkbox" id="modal_historial" role="switch">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- FOOTER -->
                    <div class="modal-footer border-top border-light-subtle bg-white px-4 py-3">
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <small class="text-muted"><i class="bi bi-asterisk text-danger me-1" style="font-size:.6rem"></i>Campos obligatorios</small>
                            <div class="d-flex gap-2">
                                <button type="button" class="emp-btn-limpiar px-3" data-bs-dismiss="modal">
                                    <i class="bi bi-x-lg me-1"></i> Cancelar
                                </button>
                                <button type="submit" class="emp-btn-action px-4 fw-semibold exp-btn-guardar" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d;">
                                    <i class="bi bi-save2 me-1"></i> Guardar Campo
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    </div>

    <!-- ========================================= -->
    <!-- MODAL: EXPEDIENTE COMPLETO DEL EMPLEADO   -->
    <!-- ========================================= -->
    <div class="modal fade" id="modalExpedienteEmpleado" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius:16px; overflow:hidden;">
                
                <!-- HEADER MINIMALISTA -->
                <div class="modal-header bg-white px-4 py-3 border-bottom border-light-subtle">
                    <div class="d-flex align-items-center gap-3">
                        <div class="emp-page-icon" style="width:42px; height:42px; font-size:1.2rem;">
                            <i class="bi bi-folder2-open"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold text-dark mb-0 fs-6" id="tituloExpedienteEmp">Expediente del Empleado</h5>
                            <small class="text-muted" style="font-size:.8rem;">Control de documentos y requisitos entregados</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-4" style="background-color: #f8fafc;">

                    <!-- TARJETA DE INFORMACIÓN DEL EMPLEADO -->
                    <div class="emp-modal-card mb-3" id="infoEmpleadoExpediente"></div>

                    <!-- BARRA DE PROGRESO -->
                    <div class="emp-modal-card mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="emp-form-label mb-0" style="font-size:0.75rem;">
                                <i class="bi bi-clipboard-check text-success me-1"></i>Progreso del Expediente
                            </span>
                            <span id="progresoTexto" class="fw-bold fs-7">0 / 0 completos</span>
                        </div>
                        <div class="emp-progress-track" style="height:9px; background:#e2e8f0;">
                            <div class="emp-progress-bar" id="progresoBarra" style="width:0%"></div>
                        </div>
                    </div>

                    <!-- CONTENEDOR DE CAMPOS/REQUISITOS -->
                    <div id="contenedorCamposExpediente"></div>

                </div>

                <!-- FOOTER -->
                <div class="modal-footer border-top border-light-subtle bg-white px-4 py-3">
                    <button type="button" class="emp-btn-action ms-auto" data-bs-dismiss="modal" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d; font-weight:600; padding: 0.55rem 1.25rem;">
                        <i class="bi bi-check-lg me-1"></i> Concluir Revisión
                    </button>
                </div>

            </div>
        </div>
    </div>

    <!-- ========================================= -->
    <!-- MODAL: HISTORIAL DE UN CAMPO               -->
    <!-- ========================================= -->
    <div class="modal fade" id="modalHistorialCampo" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg" style="border-radius:16px; overflow:hidden;">

                <!-- HEADER MINIMALISTA -->
                <div class="modal-header bg-white px-4 py-3 border-bottom border-light-subtle">
                    <div class="d-flex align-items-center gap-3">
                        <div class="emp-page-icon" style="width:42px; height:42px; min-width:42px; min-height:42px; flex-shrink:0; font-size:1.2rem; background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                            <i class="bi bi-clock-history"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold text-dark mb-0 fs-6">Historial de Cambios</h5>
                            <div class="text-muted small" style="font-size:.82rem;">Requisito: <strong id="historialNombreCampo" class="text-dark"></strong></div>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-4" style="background-color: #f8fafc;">
                    
                    <!-- BARRA DE BÚSQUEDA Y FILTRADO -->
                    <div id="barFiltroHistorial" class="mb-3 d-none">
                        <div class="row g-2 align-items-center">
                            <div class="col-md-7">
                                <div class="emp-input-wrapper">
                                    <i class="bi bi-search emp-input-icon"></i>
                                    <input type="text" id="buscadorHistorial" class="emp-form-control" placeholder="Buscar por fecha, estatus o dato registrado...">
                                </div>
                            </div>
                            <div class="col-md-5 text-md-end">
                                <span id="counterHistorial" class="emp-page-info fw-semibold text-muted small"></span>
                            </div>
                        </div>
                    </div>

                    <div id="contenedorHistorial"></div>
                </div>

                <div class="modal-footer border-top border-light-subtle bg-white px-4 py-2.5">
                    <button type="button" class="emp-btn-limpiar ms-auto px-4" data-bs-dismiss="modal">
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    </div>

    <!-- ========================================= -->
    <!-- MODAL: EXPORTAR A EXCEL CONFIGURABLE     -->
    <!-- ========================================= -->
    <div class="modal fade" id="modalExportarExcel" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg" style="border-radius:16px; overflow:hidden;">

                <!-- HEADER MINIMALISTA -->
                <div class="modal-header bg-white px-4 py-3 border-bottom border-light-subtle">
                    <div class="d-flex align-items-center gap-3">
                        <div class="emp-page-icon" style="width:42px; height:42px; font-size:1.2rem; background:#f0fdf4; color:#15803d; border-color:#bbf7d0;">
                            <i class="bi bi-file-earmark-excel"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold text-dark mb-0 fs-6">Exportación Personalizada a Excel</h5>
                            <small class="text-muted" style="font-size:.8rem;">Selecciona los filtros y las columnas que deseas extraer del expediente</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <form id="formExportarExcel" action="../php/exportar_excel.php" method="POST">
                    <input type="hidden" name="tipo_exportacion" value="personalizada">

                    <div class="modal-body p-4" style="background-color: #f8fafc;">

                        <!-- SECCIÓN 1: FILTROS DE PERSONAL -->
                        <div class="exp-modal-section">
                            <div class="exp-section-label mb-3">
                                <span class="exp-step-badge">1</span>
                                <span>Filtros de Ubicación y Empleados</span>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="emp-form-label">Área</label>
                                    <select name="id_area" id="expModalArea" class="emp-form-select">
                                        <option value="-1">Todas las áreas</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="emp-form-label">Departamento</label>
                                    <select name="id_departamento" id="expModalDepto" class="emp-form-select">
                                        <option value="-1">Todos los departamentos</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="emp-form-label">Estatus del Empleado</label>
                                    <select name="id_status" id="expModalStatus" class="emp-form-select">
                                        <option value="-1">Todos (Activos y Bajas)</option>
                                        <option value="1">Solo Activos</option>
                                        <option value="2">Solo Bajas</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="emp-form-label">Estado del Expediente</label>
                                    <select name="filtro_avance" id="expModalAvance" class="emp-form-select">
                                        <option value="todos">Todos los avances</option>
                                        <option value="completos">🟢 Completos (100%)</option>
                                        <option value="incompletos">🟡 Incompletos (&lt;100%)</option>
                                        <option value="sin_documentos">🔴 Sin documentos (0%)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr class="my-3 text-muted opacity-25">

                        <!-- SECCIÓN 2: SELECCIÓN DE REQUISITOS Y CAMPOS A EXTRAER -->
                        <div class="exp-modal-section">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="exp-section-label mb-0">
                                    <span class="exp-step-badge">2</span>
                                    <span>Requisitos y Campos a Extraer</span>
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-success py-1 px-2 text-nowrap" id="btnSeleccionarTodosReq" style="font-size:0.78rem;">
                                        <i class="bi bi-check-all me-1"></i> Seleccionar Todos
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary py-1 px-2 text-nowrap" id="btnDesmarcarTodosReq" style="font-size:0.78rem;">
                                        <i class="bi bi-x-lg me-1"></i> Desmarcar
                                    </button>
                                </div>
                            </div>
                            <p class="text-muted small mb-3 opacity-90">
                                <i class="bi bi-info-circle text-primary me-1"></i>
                                Selecciona los requisitos y marca qué campos extra específicos (observaciones, fechas, vigencias) deseas incluir en la exportación:
                            </p>

                            <div id="contenedorCheckboxesReq" style="max-height: 350px; overflow-y: auto;">
                                <!-- Filas dinámicas de requisitos -->
                            </div>
                        </div>

                    </div>

                    <!-- FOOTER -->
                    <div class="modal-footer border-top border-light-subtle bg-white px-4 py-3">
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <small class="text-muted"><i class="bi bi-file-earmark-excel text-success me-1"></i>Se descargará un archivo .xlsx profesional</small>
                            <div class="d-flex gap-2">
                                <button type="button" class="emp-btn-limpiar px-3" data-bs-dismiss="modal">
                                    Cancelar
                                </button>
                                <button type="submit" class="emp-btn-action px-4 fw-semibold exp-btn-guardar" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d;">
                                    <i class="bi bi-download me-1"></i> Generar y Descargar Excel
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    </div>

    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="../js/helpers.js?v=<?= filemtime(__DIR__ . '/../js/helpers.js') ?>"></script>
    <script src="../js/catalogo.js?v=<?= filemtime(__DIR__ . '/../js/catalogo.js') ?>"></script>
    <script src="../js/empleados.js?v=<?= filemtime(__DIR__ . '/../js/empleados.js') ?>"></script>
    <script src="../js/expediente.js?v=<?= filemtime(__DIR__ . '/../js/expediente.js') ?>"></script>
    <script src="../js/historial.js?v=<?= filemtime(__DIR__ . '/../js/historial.js') ?>"></script>
</body>
</html>
