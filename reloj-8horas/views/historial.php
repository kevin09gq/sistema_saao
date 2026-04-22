<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Incidencias Semanales</title>
    <link rel="stylesheet" href="../../public/styles/navbar_styles.css">
    <link rel="stylesheet" href="../css/historial.css">
    <?php
    include "../../config/config.php";
    ?>

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
</head>

<body>
    <?php
    $rutaRaiz = '/sistema_saao';
    include "../../public/views/navbar.php";
    ?>

    <div class="container-historial">
        
        <!-- CARD 1: FILTROS Y CONTROLES INTEGRADOS -->
        <div class="card overflow-hidden">
            <div class="card-body p-4">
                
                <!-- Selector de Modo (Alineado dentro del Card) -->
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <span class="text-uppercase fw-bold text-muted small"><i class="bi bi-funnel me-2"></i>Filtros de consulta</span>
                    <div class="btn-group mode-selector" role="group">
                        <button type="button" id="btn_modo_semana" class="btn btn-outline-success active">Por Semana</button>
                        <button type="button" id="btn_modo_persona" class="btn btn-outline-success">Por Persona</button>
                    </div>
                </div>

                <!-- Filtros Semana -->
                <div id="filtros_semana_bar">
                    <div class="row g-4 align-items-end">
                        <div class="col-md-3">
                            <label for="filtro_empresa" class="form-label text-uppercase">Empresa</label>
                            <select id="filtro_empresa" class="form-select">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="filtro_anio" class="form-label text-uppercase">Año</label>
                            <select id="filtro_anio" class="form-select" disabled>
                                <option value="">Año</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="filtro_semana" class="form-label text-uppercase">Semana</label>
                            <select id="filtro_semana" class="form-select" disabled>
                                <option value="">Semana</option>
                            </select>
                        </div>
                        <div class="col-md-5">
                            <label for="filtro_departamento" class="form-label text-uppercase">Departamento</label>
                            <select id="filtro_departamento" class="form-select">
                                <option value="">Todos los departamentos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Filtros Persona -->
                <div id="contenedor_persona" style="display:none;">
                    <div class="row g-4 align-items-end mb-4">
                        <div class="col-md-3">
                            <label for="persona_empresa" class="form-label text-uppercase">Empresa</label>
                            <select id="persona_empresa" class="form-select">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="persona_anio" class="form-label text-uppercase">Año</label>
                            <select id="persona_anio" class="form-select" disabled>
                                <option value="">Año</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="persona_semana" class="form-label text-uppercase">Semana</label>
                            <select id="persona_semana" class="form-select" disabled>
                                <option value="">Semana</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="persona_departamento" class="form-label text-uppercase">Departamento</label>
                            <select id="persona_departamento" class="form-select">
                                <option value="">Todos los departamentos</option>
                            </select>
                        </div>
                    </div>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <label for="persona_mostrar" class="form-label text-uppercase">Ordenar Resultados</label>
                            <select id="persona_mostrar" class="form-select">
                                <option value="todos">Todos los empleados</option>
                                <option value="vacaciones-desc">Vacaciones (Mayor a menor)</option>
                                <option value="vacaciones-asc">Vacaciones (Menor a mayor)</option>
                                <option value="ausencias-desc">Ausencias (Mayor a menor)</option>
                                <option value="ausencias-asc">Ausencias (Menor a mayor)</option>
                                <option value="incapacidades-desc">Incapacidades (Mayor a menor)</option>
                                <option value="incapacidades-asc">Incapacidades (Menor a mayor)</option>
                                <option value="dias_trabajados-desc">Días Pagados (Descendente)</option>
                                <option value="dias_trabajados-asc">Días Pagados (Ascendente)</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label for="persona_buscar" class="form-label text-uppercase">Filtro por Nombre/Clave</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" id="persona_buscar" class="form-control" placeholder="Escribe el nombre del empleado...">
                                <button id="btn_limpiar_persona_buscar" class="btn btn-outline-secondary" type="button" style="display: none;">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CARD 2: RESULTADOS CON ENCABEZADO VERDE -->
        <div class="card overflow-hidden">
            <div class="table-responsive">
                
                <!-- Tabla Semana -->
                <div id="contenedor_semana">
                    <table class="table table-hover align-middle mb-0 text-center" id="tabla_historial">
                        <thead>
                            <tr>
                                <th class="py-3">Semana</th>
                                <th class="py-3">Vacaciones</th>
                                <th class="py-3">Ausencias</th>
                                <th class="py-3">Incapacidades</th>
                                <th class="py-3">Días Pagados</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_historial">
                            <tr>
                                <td colspan="5" class="py-5 text-muted">Cargando información...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tabla Persona -->
                <div id="contenedor_persona_table" style="display:none;">
                    <table class="table table-hover align-middle mb-0 text-center w-100">
                        <thead>
                            <tr>
                                <th class="py-3 text-start ps-4" style="min-width:300px;">Empleado</th>
                                <th class="py-3">Vacaciones</th>
                                <th class="py-3">Ausencias</th>
                                <th class="py-3">Incapacidades</th>
                                <th class="py-3">Días pagados</th>
                            </tr>
                        </thead>
                        <tbody id="persona_tbody">
                            <tr>
                                <td colspan="5" class="py-4 text-muted">Ajusta los filtros para mostrar resultados</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
            
            <div id="semana_paginacion" class="pagination-container"></div>
            <div id="persona_paginacion" class="pagination-container" style="display:none;"></div>
        </div>

    </div>

    <!-- Modal Detalle -->
    <div id="modal_detalle_semana" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:1050; overflow:auto; background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header py-3 bg-light border-bottom-0">
                    <h5 id="modal_titulo_semana" class="modal-title fw-bold small text-uppercase text-muted">Detalle de Incidencias</h5>
                    <button onclick="cerrarModalDetalle()" type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 pt-0">
                    <div class="row g-3 mb-4">
                        <div class="col-md-4">
                            <label class="form-label text-uppercase">Orden</label>
                            <select id="modal_orden_dir_simple" class="form-select form-select-sm">
                                <option value="desc">Descendente</option>
                                <option value="asc">Ascendente</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label text-uppercase">Búsqueda</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                                <input type="text" id="modal_buscar_empleado" class="form-control" placeholder="Nombre o clave...">
                            </div>
                        </div>
                    </div>
                    <div class="table-responsive rounded border">
                        <table class="table table-hover mb-0 text-center">
                            <thead class="table-light small fw-bold text-uppercase">
                                <tr>
                                    <th class="text-start ps-3">Empleado</th>
                                    <th>Vacaciones</th>
                                    <th>Ausencias</th>
                                    <th>Incapacidades</th>
                                    <th>Días pagados</th>
                                </tr>
                            </thead>
                            <tbody id="modal_tbody_detalle" class="small"></tbody>
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
    <script src="../js/historial.js"></script>
</body>

</html>