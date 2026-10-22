<?php
require_once __DIR__ . "/../conexion/conexion.php";
// Incluir la configuración para las rutas
require_once __DIR__ . "/../public/php/config.php";
require_once __DIR__ . "/../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("gafetes.ver_menu");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Gafetes</title>
    <link rel="icon" type="image/png" href="<?= ICONO_SISTEMA ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="css/estilos.css?v=<?= filemtime(__DIR__ . '/css/estilos.css') ?>">
    <link rel="stylesheet" href="../nomina/styles/nomina_styles.css">
    <link rel="stylesheet" href="css/casillero.css">
    <link rel="stylesheet" href="css/subir-fotos.css?v=<?= filemtime(__DIR__ . '/css/subir-fotos.css') ?>">
    <link rel="stylesheet" href="css/logos-gafetes.css">
    <link rel="stylesheet" href="css/confirmacion.css">
    <link rel="stylesheet" href="../public/styles/main.css">
   
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    
    <!-- Estilos de Gafetes y Modal de Actualización -->
    <link rel="stylesheet" href="css/gafetes.css?v=<?= filemtime(__DIR__ . '/css/gafetes.css') ?>">
</head>

<body>
    <?php
    // Incluir el navbar
    require_once __DIR__ . "/../navbar/navbar.php";
    ?>

    <div class="container-tabla-nomina">
        <div class="header-tabla">
            <div>
                <h3 class="m-0" style="font-weight: 700;">Generador de Gafetes</h3>
                <div class="subtitulo-nomina" style="margin: 4px 0 0 0; font-size: 13px;">Selecciona empleados, genera gafetes y administra fotos</div>
            </div>
            <div class="header-controls">
                <?php if (tienePermiso("gafetes.generar_gafetes")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="generarGafetes" title="Generar Gafetes">
                    <i class="bi bi-person-vcard text-primary"></i> Gafetes
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.generar_fotos")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="generarFoto" title="Generar Hoja de Fotos">
                    <i class="bi bi-camera text-success"></i> Foto
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.administrar_casillero")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="btnCasillero" title="Administrar Casillero">
                    <i class="bi bi-box-seam text-primary"></i> Casillero
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.subir_fotos")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="subirFotos" data-bs-toggle="modal" data-bs-target="#modalSubirFotos" title="Subir fotos">
                    <i class="bi bi-cloud-arrow-up text-info"></i> Subir Fotos
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.actualizar_logos")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="actualizarLogos" data-bs-toggle="modal" data-bs-target="#modalActualizarLogos" title="Actualizar logos">
                    <i class="bi bi-images text-success"></i> Logos
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.configurar_colores")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="btnConfigColoresAreas" data-bs-toggle="modal" data-bs-target="#modalColoresAreas" title="Colores por área">
                    <i class="bi bi-palette text-warning"></i> Colores
                </button>
                <?php endif; ?>

                <?php if (tienePermiso("gafetes.configurar_vigencia")): ?>
                <button class="btn btn-outline-secondary btn-sm" type="button" id="btnConfigVigencia" data-bs-toggle="modal" data-bs-target="#modalConfigVigencia" title="Configurar vigencia">
                    <i class="bi bi-calendar-check text-secondary"></i> Vigencia
                </button>
                <?php endif; ?>
              <!-- <button class="btn btn-outline-danger btn-sm" type="button" id="limpiarFotos" title="Limpiar fotos huérfanas">
                    <i class="bi bi-trash3"></i>
                </button>-->
            </div>
        </div>

        <div class="controles-tabla">
            <div class="filtros-container">
                <select class="filtro-departamento" id="filtroArea">
                    <option value="todos">Todas las áreas</option>
                </select>

                <select class="filtro-departamento" id="filtroDepartamento">
                    <option value="todos">Todos los departamentos</option>
                </select>

                <select class="filtro-departamento" id="filtroEstadoGafete">
                    <option value="todos">Todos</option>
                    <option value="vigente">Vigentes</option>
                    <option value="expirado">Expirados</option>
                    <option value="proximo">Próximo a vencer</option>
                    <option value="sin_fecha">Sin fecha</option>
                    <option value="seleccionados">Seleccionados</option>
                </select>

                <select class="filtro-departamento" id="filtroIMSS">
                    <option value="todos">Todos (IMSS)</option>
                    <option value="con_imss">Con IMSS</option>
                    <option value="sin_imss">Sin IMSS</option>
                </select>

                <button class="btn btn-sm btn-outline-secondary" type="button" id="limpiarFiltroEstadoBtn" title="Limpiar filtro" style="display:none;">
                    <i class="bi bi-eraser-fill"></i>
                </button>

                <button class="btn btn-sm btn-outline-primary" id="seleccionarTodos" title="Seleccionar todos los empleados">
                    <i class="bi bi-check-all"></i> Seleccionar Todos
                </button>
                <button class="btn btn-sm btn-outline-danger" id="deseleccionarTodos" title="Deseleccionar todos los empleados">
                    <i class="bi bi-x-square"></i> Quitar Selección
                </button>
                <button class="btn btn-sm btn-outline-success" id="seleccionarFotos" title="Seleccionar todas las fotos">
                    <i class="bi bi-images"></i> Seleccionar Fotos
                </button>
                <button class="btn btn-sm btn-outline-warning" id="deseleccionarFotos" title="Quitar selección de todas las fotos">
                    <i class="bi bi-x-circle"></i> Quitar Fotos
                </button>

                <div class="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="buscadorEmpleados">
                    <button type="button" id="limpiarBuscador" title="Limpiar" style="display:none;">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" id="tablaEmpleados">
                <thead>
                    <tr>
                        <th class="text-center">
                            Foto
                        </th>
                        <th id="sortClave" data-sortable>
                            Nombre <span class="sort-icon"></span>
                        </th>
                        <th>
                            Depto. / Área
                        </th>
                        <th>
                            Estado / IMSS
                        </th>
                        <th class="text-center">
                            Orden Nombre
                        </th>
                        <th class="text-center">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody id="cuerpoTabla">
                    <!-- Los empleados se cargarán aquí dinámicamente -->
                </tbody>
            </table>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center p-3" id="paginacion">
            <div class="text-muted" id="infoPaginacion">
                Mostrando <span id="inicio">0</span> a <span id="fin">0</span> de <span id="total">0</span> empleados
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0" id="controlesPaginacion">
                    <li class="page-item disabled" id="anteriorPagina">
                        <a class="page-link" href="#" tabindex="-1">Anterior</a>
                    </li>
                    <li class="page-item active"><a class="page-link" href="#" data-pagina="1">1</a></li>
                    <li class="page-item" id="siguientePagina">
                        <a class="page-link" href="#">Siguiente</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>

    <!-- Modal para subir fotos -->
    <div class="modal fade" id="modalSubirFotos" tabindex="-1" aria-labelledby="modalSubirFotosLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalSubirFotosLabel">
                        <i class="bi bi-cloud-upload text-success me-2"></i>Subir Fotos de Empleados
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body flex-grow-1 overflow-auto">

                    <!-- Nota informativa -->
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body py-2">
                            <p class="text-muted mb-0 small">
                                <i class="bi bi-info-circle me-1 text-success"></i>
                                Seleccione los empleados y sus respectivas fotos. Puede seleccionar varias fotos a la vez.
                            </p>
                        </div>
                    </div>

                    <!-- Empleados seleccionados -->
                    <div id="listaEmpleadosSeleccionados" class="mb-3"></div>

                    <!-- Seleccionar fotos -->
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-images me-2 text-success"></i>Seleccionar Fotos
                            </h6>
                            <input class="form-control" type="file" id="fotosEmpleados" multiple accept="image/*">
                            <div class="form-text mt-1">Seleccione las fotos correspondientes a los empleados seleccionados.</div>
                        </div>
                    </div>

                    <!-- Vista previa -->
                    <div id="vistaPreviaFotos" class="row g-2"></div>

                </div>
                <div class="modal-footer flex-shrink-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="btnSubirFotos">
                        <span class="spinner-border spinner-border-sm d-none me-1" role="status" aria-hidden="true" id="spinnerSubir"></span>
                        <i class="bi bi-cloud-upload me-1"></i>Subir Fotos
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para actualizar logos -->
    <div class="modal fade" id="modalActualizarLogos" tabindex="-1" aria-labelledby="modalActualizarLogosLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalActualizarLogosLabel">
                        <i class="bi bi-images text-primary me-2"></i>Actualizar Logos de Empresas y Áreas
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-primary d-flex align-items-center">
                        <i class="bi bi-info-circle-fill me-2 fs-5"></i>
                        <div>
                            <strong>Información importante</strong><br>
                            <small>Actualice los logos de las empresas y áreas. Estos logos aparecerán en los gafetes correspondientes.</small>
                        </div>
                    </div>

                    <!-- Pestañas para Empresas y Áreas -->
                    <ul class="nav nav-tabs" id="logosTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="empresas-tab" data-bs-toggle="tab" data-bs-target="#empresas" type="button" role="tab" aria-controls="empresas" aria-selected="true">
                                <i class="bi bi-building me-2"></i>Logos de Empresas
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="areas-tab" data-bs-toggle="tab" data-bs-target="#areas" type="button" role="tab" aria-controls="areas" aria-selected="false">
                                <i class="bi bi-geo-alt me-2"></i>Logos de Áreas
                            </button>
                        </li>
                    </ul>

                    <!-- Contenido de las pestañas -->
                    <div class="tab-content" id="logosTabContent">
                        <!-- Pestaña de Empresas -->
                        <div class="tab-pane fade show active" id="empresas" role="tabpanel" aria-labelledby="empresas-tab">
                            <div class="card border-0">
                                <div class="card-body">
                                    <div id="listaEmpresas" class="logo-grid">
                                        <!-- Las empresas se cargarán aquí dinámicamente -->
                                        <div class="text-center py-5">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando empresas...</span>
                                            </div>
                                            <p class="mt-2 text-muted">Cargando empresas...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pestaña de Áreas -->
                        <div class="tab-pane fade" id="areas" role="tabpanel" aria-labelledby="areas-tab">
                            <div class="card border-0">
                                <div class="card-body">
                                    <div id="listaAreas" class="logo-grid">
                                        <!-- Las áreas se cargarán aquí dinámicamente -->
                                        <div class="text-center py-5">
                                            <div class="spinner-border text-success" role="status">
                                                <span class="visually-hidden">Cargando áreas...</span>
                                            </div>
                                            <p class="mt-2 text-muted">Cargando áreas...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-danger btn-sm" id="limpiarLogos" title="Eliminar logos no utilizados">
                        <i class="bi bi-trash3"></i> Limpiar Logos
                    </button>
                    <div>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Cerrar
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" id="btnActualizarLogos">
                            <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true" id="spinnerLogos"></span>
                            <i class="bi bi-check-circle"></i> Actualizar Logos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para previsualizar gafetes -->
    <div class="modal fade" id="modalGafetes" tabindex="-1" aria-labelledby="modalGafetesLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalGafetesLabel">
                        <i class="bi bi-person-vcard text-primary me-2"></i>Vista Previa de Gafetes
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body flex-grow-1 overflow-auto" id="contenidoGafetes">
                    <!-- Aquí se mostrarán los gafetes -->
                </div>
                <div class="modal-footer flex-shrink-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cerrar
                    </button>
                    <button type="button" class="btn btn-primary" id="imprimirGafetes">
                        <i class="bi bi-printer me-1"></i>Imprimir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para previsualizar fotos -->
    <div class="modal fade" id="modalFotos" tabindex="-1" aria-labelledby="modalFotosLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalFotosLabel">
                        <i class="bi bi-camera text-success me-2"></i>Vista Previa de Fotos de Empleados
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body flex-grow-1 overflow-auto">
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body py-2">
                            <p class="text-muted mb-0 small">
                                <i class="bi bi-camera-fill me-1 text-success"></i>
                                <strong>Fotos listas para imprimir.</strong> A continuación se muestran las fotos de los empleados seleccionados.
                            </p>
                        </div>
                    </div>

                    <div id="listaEmpleadosFotos" class="mb-3">
                        <!-- Aquí se mostrará la lista de empleados seleccionados -->
                    </div>

                    <div id="contenidoFotos" class="border rounded p-3 bg-light">
                        <!-- Aquí se mostrarán las fotos -->
                    </div>
                </div>
                <div class="modal-footer flex-shrink-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="imprimirFotos">
                        <i class="bi bi-printer me-1"></i>Imprimir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Actualizar Empleado -->
    <div class="modal fade" id="modal_actualizar_empleado" tabindex="-1" aria-labelledby="modalActualizarEmpleadoLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <form id="form_modal_actualizar_empleado" class="d-flex flex-column h-100 overflow-hidden">
                    <div class="modal-header flex-shrink-0">
                        <h5 class="modal-title" id="modalActualizarEmpleadoLabel">
                            <i class="bi bi-pencil-square text-success me-2"></i>Actualizar Información del Empleado
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body flex-grow-1 overflow-auto">
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs mb-4" id="modalTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="tab-trabajador" data-bs-toggle="tab" data-bs-target="#tab_trabajador" type="button" role="tab" aria-controls="tab_trabajador" aria-selected="true">
                                    <i class="bi bi-person me-2"></i>Datos del Trabajador
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-emergencia" data-bs-toggle="tab" data-bs-target="#tab_emergencia" type="button" role="tab" aria-controls="tab_emergencia" aria-selected="false">
                                    <i class="bi bi-telephone-plus me-2"></i>Contacto de Emergencia
                                </button>
                            </li>
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <!-- ========================================== -->
                            <!-- TAB 1: DATOS DEL TRABAJADOR                -->
                            <!-- ========================================== -->
                            <div class="tab-pane fade show active" id="tab_trabajador" role="tabpanel" aria-labelledby="tab-trabajador">
                                <input type="hidden" id="modal_id_empleado" name="id_empleado">
                                <input type="hidden" id="empleado_id" value="">

                                <!-- ========================================= -->
                                <!-- 1. DATOS PERSONALES -->
                                <!-- ========================================= -->
                                <div class="card border-0 bg-light mb-4">
                                    <div class="card-body">
                                        <h6 class="fw-bold text-secondary mb-3">
                                            <i class="bi bi-person me-2 text-success"></i>Datos personales
                                        </h6>
                                        <div class="row g-3">
                                            <!-- Clave -->
                                            <div class="col-md-3">
                                                <label for="modal_clave_empleado" class="form-label fw-semibold">Clave</label>
                                                <input type="text" class="form-control" id="modal_clave_empleado" name="clave_empleado" placeholder="Clave">
                                            </div>

                                            <!-- Nombre -->
                                            <div class="col-md-3">
                                                <label for="modal_nombre_empleado" class="form-label fw-semibold">Nombre</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_nombre_empleado" name="nombre_empleado" placeholder="Nombre">
                                            </div>

                                            <!-- Apellido Paterno -->
                                            <div class="col-md-3">
                                                <label for="modal_apellido_paterno" class="form-label fw-semibold">Apellido Paterno</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_apellido_paterno" name="apellido_paterno" placeholder="Apellido paterno">
                                            </div>

                                            <!-- Apellido Materno -->
                                            <div class="col-md-3">
                                                <label for="modal_apellido_materno" class="form-label fw-semibold">Apellido Materno</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_apellido_materno" name="apellido_materno" placeholder="Apellido materno">
                                            </div>

                                            <!-- IMSS -->
                                            <div class="col-md-3">
                                                <label for="modal_imss" class="form-label fw-semibold">IMSS</label>
                                                <input type="text" class="form-control" id="modal_imss" name="imss" placeholder="Número de IMSS">
                                            </div>

                                            <!-- CURP -->
                                            <div class="col-md-3">
                                                <label for="modal_curp" class="form-label fw-semibold">CURP</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_curp" name="curp" maxlength="18" placeholder="CURP">
                                            </div>

                                            <!-- Domicilio -->
                                            <div class="col-md-6">
                                                <label for="modal_domicilio" class="form-label fw-semibold">Domicilio</label>
                                                <input type="text" class="form-control" id="modal_domicilio" name="domicilio" placeholder="Domicilio completo">
                                            </div>

                                            <!-- Sexo -->
                                            <div class="col-md-3">
                                                <label for="modal_sexo" class="form-label fw-semibold">Sexo</label>
                                                <select class="form-select" id="modal_sexo" name="sexo">
                                                    <option value="">Seleccionar</option>
                                                    <option value="M">Masculino</option>
                                                    <option value="F">Femenino</option>
                                                </select>
                                            </div>

                                            <!-- Grupo Sanguíneo -->
                                            <div class="col-md-3">
                                                <label for="modal_grupo_sanguineo" class="form-label fw-semibold">Grupo Sanguíneo</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_grupo_sanguineo" name="grupo_sanguineo" placeholder="Tipo sanguíneo">
                                            </div>

                                            <!-- Estado Civil -->
                                            <div class="col-md-3">
                                                <label for="modal_estado_civil" class="form-label fw-semibold">Estado Civil</label>
                                                <select class="form-select" id="modal_estado_civil" name="estado_civil">
                                                    <option value="">Seleccionar</option>
                                                    <option value="SOLTERO">Soltero(a)</option>
                                                    <option value="CASADO">Casado(a)</option>
                                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                                    <option value="VIUDO">Viudo(a)</option>
                                                    <option value="UNION_LIBRE">Unión Libre</option>
                                                </select>
                                            </div>

                                            <!-- Fecha de Nacimiento -->
                                            <div class="col-md-3">
                                                <label for="modal_fecha_nacimiento" class="form-label fw-semibold">Fecha de Nacimiento</label>
                                                <input type="date" class="form-control" id="modal_fecha_nacimiento" name="fecha_nacimiento">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- ========================================= -->
                                <!-- 2. DATOS DE CONTACTO Y SALUD -->
                                <!-- ========================================= -->
                                <div class="card border-0 bg-light mb-4">
                                    <div class="card-body">
                                        <h6 class="fw-bold text-secondary mb-3">
                                            <i class="bi bi-telephone me-2 text-success"></i>Datos de contacto y salud
                                        </h6>
                                        <div class="row g-3">
                                            <!-- Teléfono -->
                                            <div class="col-md-4">
                                                <label for="modal_telefono_empleado" class="form-label fw-semibold">Teléfono</label>
                                                <input type="tel" class="form-control" id="modal_telefono_empleado" name="telefono_empleado" maxlength="10" placeholder="10 dígitos">
                                            </div>

                                            <!-- Enfermedades / Alergias -->
                                            <div class="col-md-8">
                                                <label for="modal_enfermedades_alergias" class="form-label fw-semibold">Enfermedades / Alergias</label>
                                                <input type="text" class="form-control" id="modal_enfermedades_alergias" name="enfermedades_alergias" placeholder="Escriba las enfermedades o alergias...">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- ========================================= -->
                                <!-- 3. DATOS LABORALES -->
                                <!-- ========================================= -->
                                <div class="card border-0 bg-light mb-4">
                                    <div class="card-body">
                                        <h6 class="fw-bold text-secondary mb-3">
                                            <i class="bi bi-building me-2 text-success"></i>Datos laborales
                                        </h6>
                                        <div class="row g-3">
                                            <!-- Número de Casillero -->
                                            <div class="col-md-3">
                                                <label for="modal_num_casillero" class="form-label fw-semibold">Número de Casillero</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="modal_num_casillero" name="num_casillero" placeholder="Casillero">
                                                    <button class="btn btn-outline-success" type="button" id="btnAbrirCasillero" title="Abrir casillero">
                                                        <i class="bi bi-inbox"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <!-- Biométrico -->
                                            <div class="col-md-3">
                                                <label for="modal_biometrico" class="form-label fw-semibold">Biométrico</label>
                                                <input type="number" class="form-control" id="modal_biometrico" name="biometrico" min="0" placeholder="ID biométrico">
                                            </div>

                                            <!-- Fecha de Ingreso -->
                                            <div class="col-md-3">
                                                <label for="modal_fecha_ingreso" class="form-label fw-semibold">Fecha de Ingreso</label>
                                                <input type="date" class="form-control" id="modal_fecha_ingreso" name="fecha_ingreso">
                                            </div>

                                            <!-- Fecha de Reingreso -->
                                            <div class="col-md-3">
                                                <label for="modal_fecha_reingreso" class="form-label fw-semibold">Fecha de Reingreso</label>
                                                <input type="date" class="form-control" id="modal_fecha_reingreso" name="fecha_reingreso">
                                            </div>

                                            <!-- Empresa -->
                                            <div class="col-md-3">
                                                <label for="modal_empresa" class="form-label fw-semibold">Empresa</label>
                                                <select class="form-select" id="modal_empresa" name="id_empresa">
                                                    <option value="">Selecciona una empresa</option>
                                                </select>
                                            </div>

                                            <!-- Área -->
                                            <div class="col-md-3">
                                                <label for="modal_area" class="form-label fw-semibold">Área</label>
                                                <select class="form-select" id="modal_area" name="id_area">
                                                    <option value="">Selecciona un área</option>
                                                </select>
                                            </div>

                                            <!-- Departamento -->
                                            <div class="col-md-3">
                                                <label for="modal_departamento" class="form-label fw-semibold">Departamento</label>
                                                <select class="form-select" id="modal_departamento" name="id_departamento">
                                                    <!-- Opciones dinámicas -->
                                                </select>
                                            </div>

                                            <!-- Puesto -->
                                            <div class="col-md-3">
                                                <label for="modal_puesto" class="form-label fw-semibold">Puesto</label>
                                                <select class="form-select" id="modal_puesto" name="id_puestoEspecial">
                                                    <option value="">Selecciona un puesto</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- ========================================== -->
                            <!-- TAB 2: CONTACTO DE EMERGENCIA              -->
                            <!-- ========================================== -->
                            <div class="tab-pane fade" id="tab_emergencia" role="tabpanel" aria-labelledby="tab-emergencia">
                                <div class="card border-0 bg-light mb-3">
                                    <div class="card-body">
                                        <h6 class="fw-bold text-secondary mb-3">
                                            <i class="bi bi-person-lines-fill me-2 text-success"></i>Información del contacto de emergencia
                                        </h6>
                                        <div class="row g-3">
                                            <!-- Nombre -->
                                            <div class="col-md-4">
                                                <label for="modal_emergencia_nombre" class="form-label fw-semibold">Nombre</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_emergencia_nombre" name="emergencia_nombre" placeholder="Nombre del contacto">
                                            </div>

                                            <!-- Apellido Paterno -->
                                            <div class="col-md-4">
                                                <label for="modal_emergencia_ap_paterno" class="form-label fw-semibold">Apellido Paterno</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_emergencia_ap_paterno" name="emergencia_ap_paterno" placeholder="Apellido paterno">
                                            </div>

                                            <!-- Apellido Materno -->
                                            <div class="col-md-4">
                                                <label for="modal_emergencia_ap_materno" class="form-label fw-semibold">Apellido Materno</label>
                                                <input type="text" class="form-control text-uppercase" id="modal_emergencia_ap_materno" name="emergencia_ap_materno" placeholder="Apellido materno">
                                            </div>

                                            <!-- Teléfono -->
                                            <div class="col-md-4">
                                                <label for="modal_emergencia_telefono" class="form-label fw-semibold">Teléfono</label>
                                                <input type="tel" class="form-control" id="modal_emergencia_telefono" name="emergencia_telefono" maxlength="10" placeholder="10 dígitos">
                                            </div>

                                            <!-- Parentesco -->
                                            <div class="col-md-4">
                                                <label for="modal_emergencia_parentesco" class="form-label fw-semibold">Parentesco</label>
                                                <input type="text" class="form-control" id="modal_emergencia_parentesco" name="emergencia_parentesco" placeholder="Relación con el empleado">
                                            </div>

                                            <!-- Domicilio -->
                                            <div class="col-md-12">
                                                <label for="modal_emergencia_domicilio" class="form-label fw-semibold">Domicilio</label>
                                                <textarea class="form-control" id="modal_emergencia_domicilio" name="emergencia_domicilio" rows="2" placeholder="Ingrese el domicilio del contacto de emergencia..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer flex-shrink-0">
                        <span id="nombre_empleado_footer" class="fw-semibold text-success me-auto">-</span>
                        <button type="button" id="btn_cancelar" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="submit" id="btn_actualizar" class="btn btn-success">
                            <i class="bi bi-check-lg me-1"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Actualizar Foto de Perfil (estilo gestión empleados) -->
    <div class="modal fade" id="modalActualizarFoto" tabindex="-1" aria-labelledby="modalActualizarFotoLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <!-- ENCABEZADO -->
                <div class="modal-header">
                    <h5 class="modal-title" id="modalActualizarFotoLabel">
                        <i class="bi bi-camera me-2"></i> Foto de perfil
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <!-- CUERPO -->
                <div class="modal-body">
                    <form id="formActualizarFoto" enctype="multipart/form-data">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <h6 class="fw-bold text-secondary mb-3">
                                    <i class="bi bi-image me-2"></i> Fotografía
                                </h6>
                                <!-- Vista previa del avatar -->
                                <div class="d-flex justify-content-center mb-4">
                                    <div id="contenedorPreviewFotoModal" class="avatar-modal-preview">
                                        <!-- Aquí se inyecta la foto o las iniciales -->
                                    </div>
                                </div>
                                <!-- Selector de archivo -->
                                <div>
                                    <label for="inputFotoEmpleado" class="form-label fw-semibold">
                                        Seleccionar nueva imagen
                                    </label>
                                    <input type="file" id="inputFotoEmpleado" name="foto" accept="image/jpeg,image/png,image/webp,image/gif" class="form-control">
                                    <div class="form-text text-muted">
                                        Formatos permitidos: <strong>JPG, PNG, WEBP, GIF</strong> (Máximo 5 MB).
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- PIE DE MODAL -->
                <div class="modal-footer d-flex justify-content-between align-items-center flex-nowrap">
                    <div>
                        <button type="button" id="btnEliminarFotoPerfil" class="btn btn-outline-danger btn-sm text-nowrap" title="Eliminar foto actual">
                            <i class="bi bi-trash me-1"></i> Eliminar foto
                        </button>
                    </div>
                    <div class="d-flex gap-2 ms-auto">
                        <button type="button" class="btn btn-secondary btn-sm text-nowrap" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg me-1"></i> Cerrar
                        </button>
                        <button type="button" id="btnGuardarFoto" class="btn btn-success btn-sm text-nowrap">
                            <i class="bi bi-check-lg me-1"></i> Guardar Foto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para editar casillero -->
    <div class="modal fade" id="modalEditarCasillero" tabindex="-1" aria-labelledby="modalEditarCasilleroLabel" aria-hidden="true" style="z-index: 1061;">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalEditarCasilleroLabel">
                        <i class="bi bi-pencil-square text-success me-2"></i>Editar Casillero
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body flex-grow-1 overflow-auto">

                    <!-- Contenedor para mostrar información del empleado asignado -->
                    <div id="infoEmpleadoAsignado" class="mb-3"></div>

                    <!-- Pestañas -->
                    <ul class="nav nav-tabs mb-3" id="casilleroTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="editar-tab" data-bs-toggle="tab" data-bs-target="#editar" type="button" role="tab" aria-controls="editar" aria-selected="true">
                                <i class="bi bi-pencil-square me-1"></i>Editar
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="asignar-tab" data-bs-toggle="tab" data-bs-target="#asignar" type="button" role="tab" aria-controls="asignar" aria-selected="false">
                                <i class="bi bi-person-plus me-1"></i>Asignar Empleado
                            </button>
                        </li>
                    </ul>

                    <!-- Contenido de las pestañas -->
                    <div class="tab-content" id="casilleroTabsContent">

                        <!-- Pestaña Editar -->
                        <div class="tab-pane fade show active" id="editar" role="tabpanel" aria-labelledby="editar-tab">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-hash me-2 text-success"></i>Número de Casillero
                                    </h6>
                                    <form id="formEditarCasillero">
                                        <input type="hidden" id="casillero_id" name="casillero_id">
                                        <div class="mb-3">
                                            <label for="nuevo_numero" class="form-label fw-semibold">Nuevo Número</label>
                                            <input type="text" class="form-control" id="nuevo_numero" name="nuevo_numero" placeholder="Ej: 1, 1A, 2B..." required>
                                            <div class="form-text">Ingrese el nuevo número identificador para este casillero.</div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Pestaña Asignar Empleado -->
                        <div class="tab-pane fade" id="asignar" role="tabpanel" aria-labelledby="asignar-tab">
                            <div class="card border-0 bg-light mb-3">
                                <div class="card-body">
                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-person-search me-2 text-success"></i>Buscar Empleado
                                    </h6>
                                    <div class="input-group mb-2">
                                        <span class="input-group-text bg-white border-end-0">
                                            <i class="bi bi-search text-muted"></i>
                                        </span>
                                        <input type="text" class="form-control border-start-0 pe-5" id="buscarEmpleado" placeholder="Nombre o ID del empleado">
                                        <button class="btn btn-outline-success" type="button" id="btnBuscarEmpleado">
                                            <i class="bi bi-search me-1"></i>Buscar
                                        </button>
                                        <button class="btn btn-outline-secondary" type="button" id="btnLimpiarBusquedaEmpleado" title="Limpiar búsqueda">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Escriba el nombre o ID del empleado y presione Buscar</div>
                                </div>
                            </div>

                            <div id="resultadoBusqueda" class="mt-2">
                                <div class="text-center text-muted py-3">
                                    <i class="bi bi-person-lines-fill fs-1"></i>
                                    <p class="mt-2 mb-0">Busque un empleado para asignar al casillero</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer flex-shrink-0">
                    <button type="button" class="btn btn-danger me-auto" id="btnEliminarCasillero">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="btnGuardarCambios">
                        <i class="bi bi-check-lg me-1"></i>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para agregar nuevo casillero -->
    <div class="modal fade" id="modalAgregarCasillero" tabindex="-1" aria-labelledby="modalAgregarCasilleroLabel" aria-hidden="true" style="z-index: 1071;">
        <div class="modal-dialog">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalAgregarCasilleroLabel">
                        <i class="bi bi-plus-circle text-success me-2"></i>Agregar Nuevo Casillero
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <!-- Número del casillero -->
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-hash me-2 text-success"></i>Número del Casillero
                            </h6>
                            <form id="formAgregarCasillero">
                                <div class="mb-3">
                                    <label for="numeroCasillero" class="form-label fw-semibold">Número identificador</label>
                                    <input type="text" class="form-control" id="numeroCasillero" name="numeroCasillero" placeholder="Ej: 1, 1A, 2B, etc." required>
                                    <div class="form-text">Ingrese el número identificador único para el nuevo casillero.</div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <!-- Nota informativa -->
                    <div class="card border-0 bg-light">
                        <div class="card-body py-2">
                            <p class="text-muted mb-0 small">
                                <i class="bi bi-info-circle me-1 text-success"></i>
                                <strong>Nota:</strong> El sistema validará automáticamente que el número no entre en conflicto con los existentes. Por ejemplo, si ya existe "1", no podrá crear "1A" y viceversa.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer flex-shrink-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="btnConfirmarAgregar">
                        <i class="bi bi-plus-circle me-1"></i>Agregar Casillero
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Configurar colores por área -->
    <div class="modal fade" id="modalColoresAreas" tabindex="-1" aria-labelledby="modalColoresAreasLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                <div class="modal-header flex-shrink-0">
                    <h5 class="modal-title" id="modalColoresAreasLabel">
                        <i class="bi bi-palette-fill text-warning me-2"></i>Colores por Área
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info mb-3">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Selecciona un color (paleta) o escribe un valor en formato <strong>#RRGGBB</strong> o <strong>rgb(r,g,b)</strong>.
                    </div>

                    <div class="table-responsive">
                        <table class="table table-sm align-middle" id="tablaColoresAreas">
                            <thead>
                                <tr>
                                    <th>Área</th>
                                    <th style="width:90px;">Vista</th>
                                    <th style="width:260px;">Fondo</th>
                                    <th style="width:260px;">Texto (nombre)</th>
                                    <th style="width:110px;">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpoColoresAreas">
                                <!-- Se carga por JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" id="btnRecargarAreas">
                        <i class="bi bi-arrow-clockwise"></i> Recargar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Configurar vigencia de gafetes -->
    <div class="modal fade" id="modalConfigVigencia" tabindex="-1" aria-labelledby="modalConfigVigenciaLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalConfigVigenciaLabel">
                        <i class="bi bi-calendar-check text-secondary me-2"></i>Configurar Vigencia
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body py-2">
                            <p class="text-muted mb-0 small">
                                <i class="bi bi-info-circle me-1"></i>
                                Establece el tiempo de vigencia para los gafetes. Puedes configurar separadamente para empleados con y sin IMSS.
                            </p>
                        </div>
                    </div>

                    <!-- Configuración para CON IMSS -->
                    <div class="card border-0 bg-light mb-3">
                        <div class="card-body">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-shield-lock me-2 text-success"></i>Empleados CON IMSS
                            </h6>
                            <div class="row align-items-center g-3">
                                <div class="col-md-5">
                                    <label for="con_imss_valor" class="form-label fw-semibold">Valor</label>
                                    <input type="number" class="form-control" id="con_imss_valor" min="1" value="1">
                                </div>
                                <div class="col-md-7">
                                    <label for="con_imss_unidad" class="form-label fw-semibold">Unidad</label>
                                    <select class="form-select" id="con_imss_unidad">
                                        <option value="days">Días</option>
                                        <option value="weeks">Semanas</option>
                                        <option value="months">Meses</option>
                                        <option value="years" selected>Años</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Configuración para SIN IMSS -->
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-person-x me-2 text-secondary"></i>Empleados SIN IMSS
                            </h6>
                            <div class="row align-items-center g-3">
                                <div class="col-md-5">
                                    <label for="sin_imss_valor" class="form-label fw-semibold">Valor</label>
                                    <input type="number" class="form-control" id="sin_imss_valor" min="1" value="45">
                                </div>
                                <div class="col-md-7">
                                    <label for="sin_imss_unidad" class="form-label fw-semibold">Unidad</label>
                                    <select class="form-select" id="sin_imss_unidad">
                                        <option value="days" selected>Días</option>
                                        <option value="weeks">Semanas</option>
                                        <option value="months">Meses</option>
                                        <option value="years">Años</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="btnResetConfigVigencia">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Restablecer
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cerrar
                    </button>
                    <button type="button" class="btn btn-success btn-sm" id="btnGuardarConfigVigencia">
                        <i class="bi bi-check-circle me-1"></i>Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="js/actualizarLogos.js?v=<?php echo filemtime(__DIR__ . '/js/actualizarLogos.js'); ?>"></script>
    <script src="js/generarFotos.js?v=<?php echo filemtime(__DIR__ . '/js/generarFotos.js'); ?>"></script>
    <script src="js/funciones.js?v=<?php echo filemtime(__DIR__ . '/js/funciones.js'); ?>"></script>
    <script src="js/configColoresAreas.js?v=<?php echo filemtime(__DIR__ . '/js/configColoresAreas.js'); ?>"></script>
    <script src="js/subirFotos.js?v=<?php echo filemtime(__DIR__ . '/js/subirFotos.js'); ?>"></script>
    <script src="js/casillero.js?v=<?php echo filemtime(__DIR__ . '/js/casillero.js'); ?>"></script>
    <script>
        // Abrir modal de Casillero desde el botón junto al campo "Número de Casillero"
        document.addEventListener('DOMContentLoaded', function() {
            const btnAbrirCasillero = document.getElementById('btnAbrirCasillero');
            if (btnAbrirCasillero) {
                btnAbrirCasillero.addEventListener('click', function() {
                    // Si existe la función para cargar el modal, úsala; luego mostrarlo
                    if (typeof cargarModalCasillero === 'function') {
                        cargarModalCasillero().then(() => {
                            const modalEl = document.getElementById('modalCasillero');
                            if (modalEl) {
                                const modal = new bootstrap.Modal(modalEl);
                                modal.show();
                            }
                        });
                    } else {
                        // Fallback: si ya está en el DOM, mostrarlo directamente
                        const modalEl = document.getElementById('modalCasillero');
                        if (modalEl) {
                            const modal = new bootstrap.Modal(modalEl);
                            modal.show();
                        }
                    }
                });
            }
        });
    </script>
</body>

</html>