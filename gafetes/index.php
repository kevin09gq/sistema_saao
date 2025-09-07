<?php
include("../conexion/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Gafetes</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/estilos.css">
    <link rel="stylesheet" href="css/subir-fotos.css">
    <link rel="stylesheet" href="css/logos-gafetes.css">
    <link rel="stylesheet" href="css/confirmacion.css">
    <link rel="stylesheet" href="../public/styles/main.css">
</head>
<body>
    <!-- Incluir la barra de navegación -->
    <?php include("../public/views/navbar.php"); ?>
    
    <div class="container mt-4">
        <h2 class="text-center mb-4">Generador de Gafetes</h2>
        
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">Departamentos</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group" id="listaDepartamentos">
                            <a href="#" class="list-group-item list-group-item-action active" data-departamento="todos">
                                <i class="bi bi-people-fill me-2"></i>Todos los empleados
                            </a>
                            <!-- Los departamentos se cargarán aquí dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card">
                    <!-- Encabezado con título y búsqueda -->
                    <div class="card-header bg-success text-white">
                        <div class="d-flex align-items-center justify-content-between">
                            <h5 class="card-title mb-0">Empleados</h5>
                            <div class="d-flex">
                                <div class="input-group input-group-sm" style="width: 250px;">
                                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                    <input type="text" id="buscadorEmpleados" class="form-control" placeholder="Buscar empleado...">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Barra de acciones -->
                    <div class="card-header bg-light border-bottom py-2">
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <span class="text-muted small me-3">Seleccionar empleados:</span>
                                <div class="btn-group btn-group-sm">
                                    <button id="seleccionarTodos" class="btn btn-success">
                                        <i class="bi bi-check2-square"></i> Todos
                                    </button>
                                    <button id="deseleccionarTodos" class="btn btn-warning">
                                        <i class="bi bi-square"></i> Ninguno
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex flex-wrap gap-2">
                                <button id="generarGafetes" class="btn btn-warning btn-sm">
                                    <i class="bi bi-card-checklist"></i> Generar Gafetes
                                </button>
                                <button id="generarFoto" class="btn btn-secondary btn-sm">
                                    <i class="bi bi-camera-fill"></i> Generar Foto
                                </button>
                                <button id="subirFotos" class="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#modalSubirFotos">
                                    <i class="bi bi-cloud-upload"></i> Subir Fotos
                                </button>
                                <button id="actualizarLogos" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalActualizarLogos">
                                    <i class="bi bi-images"></i> Actualizar Logos
                                </button>
                                <button id="limpiarFotos" class="btn btn-outline-danger btn-sm" title="Eliminar fotos no utilizadas">
                                    <i class="bi bi-trash3"></i> Limpiar Fotos
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="tablaEmpleados">
                                <thead>
                                    <tr>
                                        <th id="sortClave" data-sortable>
                                            Clave <span class="sort-icon"></span>
                                        </th>
                                        <th>Nombre</th>
                                        <th>Departamento</th>
                                        <th>Área</th>
                                        <th>Seleccionar</th>
                                        <th>Editar</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpoTabla">
                                    <!-- Los empleados se cargarán aquí dinámicamente -->
                                </tbody>
                            </table>
                            <div class="d-flex justify-content-between align-items-center mt-3" id="paginacion">
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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para subir fotos -->
    <div class="modal fade" id="modalSubirFotos" tabindex="-1" aria-labelledby="modalSubirFotosLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalSubirFotosLabel">Subir Fotos de Empleados</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        Seleccione los empleados y sus respectivas fotos. Puede seleccionar varias fotos a la vez.
                    </div>
                    
                    <div id="listaEmpleadosSeleccionados" class="mb-3">
                        <!-- Aquí se mostrarán los empleados seleccionados -->
                    </div>
                    
                    <div class="mb-3">
                        <label for="fotosEmpleados" class="form-label">Seleccionar Fotos</label>
                        <input class="form-control" type="file" id="fotosEmpleados" multiple accept="image/*">
                        <div class="form-text">Seleccione las fotos correspondientes a los empleados seleccionados.</div>
                    </div>
                    
                    <div id="vistaPreviaFotos" class="row g-2">
                        <!-- Aquí se mostrará la vista previa de las fotos seleccionadas -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnSubirFotos">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true" id="spinnerSubir"></span>
                        Subir Fotos
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para actualizar logos -->
    <div class="modal fade" id="modalActualizarLogos" tabindex="-1" aria-labelledby="modalActualizarLogosLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalActualizarLogosLabel">
                        <i class="bi bi-images"></i> Actualizar Logos de Empresas y Áreas
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
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
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalGafetesLabel">Vista Previa de Gafetes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="contenidoGafetes">
                    <!-- Aquí se mostrarán los gafetes -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="imprimirGafetes">
                        <i class="bi bi-printer"></i> Imprimir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para previsualizar fotos -->
    <div class="modal fade" id="modalFotos" tabindex="-1" aria-labelledby="modalFotosLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title" id="modalFotosLabel">Vista Previa de Fotos de Empleados</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-success d-flex align-items-center">
                        <i class="bi bi-camera-fill me-2"></i>
                        <div>
                            <strong>Fotos listas para imprimir</strong><br>
                            <small>A continuación se muestran las fotos de los empleados seleccionados.</small>
                        </div>
                    </div>
                    
                    <div id="listaEmpleadosFotos" class="mb-3">
                        <!-- Aquí se mostrará la lista de empleados seleccionados -->
                    </div>
                    
                    <div id="contenidoFotos" class="border rounded p-3 bg-light">
                        <!-- Aquí se mostrarán las fotos -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="imprimirFotos">
                        <i class="bi bi-printer"></i> Imprimir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Actualizar Empleado -->
    <div class="modal fade" id="modal_actualizar_empleado" tabindex="-1" aria-labelledby="modalActualizarEmpleadoLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <form id="form_modal_actualizar_empleado">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="modalActualizarEmpleadoLabel">
                            <i class="bi bi-pencil-square"></i> Actualizar Información del Empleado
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs mb-4" id="modalTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="tab-trabajador" data-bs-toggle="tab" data-bs-target="#tab_trabajador" type="button" role="tab" aria-controls="tab_trabajador" aria-selected="true">
                                    <i class="bi bi-person-badge"></i> Datos del Trabajador
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-foto" data-bs-toggle="tab" data-bs-target="#tab_foto" type="button" role="tab" aria-controls="tab_foto" aria-selected="false">
                                    <i class="bi bi-camera"></i> Foto del Empleado
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-emergencia" data-bs-toggle="tab" data-bs-target="#tab_emergencia" type="button" role="tab" aria-controls="tab_emergencia" aria-selected="false">
                                    <i class="bi bi-exclamation-triangle"></i> Contacto de Emergencia
                                </button>
                            </li>
                        </ul>
                        <!-- Tab panes -->
                        <div class="tab-content">
                            <!-- Trabajador -->
                            <div class="tab-pane fade show active" id="tab_trabajador" role="tabpanel" aria-labelledby="tab-trabajador">
                                <input type="hidden" id="modal_id_empleado" name="id_empleado">
                                <div class="row">
                                    <input type="hidden" id="empleado_id" value="">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_clave_empleado" class="form-label">Clave</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-key"></i></span>
                                            <input type="text" class="form-control" id="modal_clave_empleado" name="clave_empleado" placeholder="Clave del empleado">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_nombre_empleado" class="form-label">Nombre</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person"></i></span>
                                            <input type="text" class="form-control" id="modal_nombre_empleado" name="nombre_empleado" placeholder="Nombre del empleado">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_apellido_paterno" class="form-label">Apellido Paterno</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                            <input type="text" class="form-control" id="modal_apellido_paterno" name="apellido_paterno" placeholder="Apellido paterno">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_apellido_materno" class="form-label">Apellido Materno</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                            <input type="text" class="form-control" id="modal_apellido_materno" name="apellido_materno" placeholder="Apellido materno">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_imss" class="form-label">IMSS</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
                                            <input type="text" class="form-control" id="modal_imss" name="imss" placeholder="Número de IMSS">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_curp" class="form-label">CURP</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-card-text"></i></span>
                                            <input type="text" class="form-control" id="modal_curp" name="curp" placeholder="Clave Única de Registro de Población">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-8 mb-4">
                                        <label for="modal_domicilio" class="form-label">Domicilio</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-house-door"></i></span>
                                            <textarea class="form-control" id="modal_domicilio" name="domicilio" rows="2" placeholder="Domicilio completo"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_sexo" class="form-label">Sexo</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-gender-ambiguous"></i></span>
                                            <select class="form-select" id="modal_sexo" name="sexo">
                                                <option value="">Selecciona</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_grupo_sanguineo" class="form-label">Grupo Sanguíneo</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-droplet"></i></span>
                                            <input type="text" class="form-control" id="modal_grupo_sanguineo" name="grupo_sanguineo" placeholder="Tipo sanguíneo">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                                            <input type="date" class="form-control" id="modal_fecha_nacimiento" name="fecha_nacimiento">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_num_casillero" class="form-label">Número de Casillero</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-inbox"></i></span>
                                            <input type="text" class="form-control" id="modal_num_casillero" name="num_casillero" placeholder="Ej: 101 o A15">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_enfermedades_alergias" class="form-label">Enfermedades/Alergias</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-bandaid"></i></span>
                                            <input type="text" class="form-control" id="modal_enfermedades_alergias" name="enfermedades_alergias" placeholder="Enfermedades o alergias">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_fecha_ingreso" class="form-label">Fecha de Ingreso</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-calendar-check"></i></span>
                                            <input type="date" class="form-control" id="modal_fecha_ingreso" name="fecha_ingreso">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <!-- Espacio vacío para mantener simetría -->
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_departamento" class="form-label">Departamento</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-building"></i></span>
                                            <select class="form-select" id="modal_departamento" name="id_departamento">
                                                <!-- Opciones dinámicas -->
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_empresa" class="form-label">Empresa</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-building-check"></i></span>
                                            <select class="form-select" id="modal_empresa" name="id_empresa">
                                                <option value="">Selecciona una empresa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_area" class="form-label">Área</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                                            <select class="form-select" id="modal_area" name="id_area">
                                                <option value="">Selecciona un área</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_puesto" class="form-label">Puesto</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-briefcase"></i></span>
                                            <select class="form-select" id="modal_puesto" name="id_puestoEspecial">
                                                <option value="">Selecciona un puesto</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Foto del empleado -->
                            <div class="tab-pane fade" id="tab_foto" role="tabpanel" aria-labelledby="tab-foto">
                                <div class="row justify-content-center">
                                    <div class="col-md-8">
                                        <div class="card">
                                            <div class="card-header bg-info text-white">
                                                <h6 class="card-title mb-0">
                                                    <i class="bi bi-camera-fill me-2"></i>Fotografía del Empleado
                                                </h6>
                                            </div>
                                            <div class="card-body text-center">
                                                <!-- Vista previa de la foto actual -->
                                                <div class="mb-4">
                                                    <h6 class="mb-3">Foto Actual</h6>
                                                    <div id="foto_preview_container" class="d-inline-block">
                                                        <img id="foto_preview" src="" alt="Foto del empleado" 
                                                             class="img-thumbnail" 
                                                             style="width: 200px; height: 240px; object-fit: cover; display: none;">
                                                        <div id="no_foto_preview" class="text-muted">
                                                            <i class="bi bi-person-circle" style="font-size: 100px;"></i>
                                                            <p class="mt-2">No hay foto disponible</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- Input para subir nueva foto -->
                                                <div class="mb-4">
                                                    <label for="nueva_foto" class="form-label">Seleccionar nueva foto</label>
                                                    <div class="input-group">
                                                        <input type="file" class="form-control" id="nueva_foto" name="nueva_foto" 
                                                               accept="image/*" capture="environment">
                                                        <label class="input-group-text" for="nueva_foto">
                                                            <i class="bi bi-folder2-open"></i>
                                                        </label>
                                                    </div>
                                                    <div class="form-text">
                                                        Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                                                    </div>
                                                </div>
                                                
                                                <!-- Vista previa de la nueva foto -->
                                                <div class="mb-4" id="nueva_foto_preview_container" style="display: none;">
                                                    <h6>Vista previa de la nueva foto:</h6>
                                                    <img id="nueva_foto_preview" src="" alt="Vista previa" 
                                                         class="img-thumbnail" 
                                                         style="width: 200px; height: 240px; object-fit: cover;">
                                                </div>
                                                
                                                <!-- Botones de acción -->
                                                <div class="d-flex justify-content-center gap-3">
                                                    <button type="button" id="btn_subir_foto" class="btn btn-success" disabled>
                                                        <i class="bi bi-upload"></i> Subir Foto
                                                    </button>
                                                    <button type="button" id="btn_eliminar_foto" class="btn btn-danger">
                                                        <i class="bi bi-trash"></i> Eliminar Foto
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Contacto de emergencia -->
                            <div class="tab-pane fade" id="tab_emergencia" role="tabpanel" aria-labelledby="tab-emergencia">
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_emergencia_nombre" class="form-label">Nombre</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person"></i></span>
                                            <input type="text" class="form-control" id="modal_emergencia_nombre" name="emergencia_nombre" placeholder="Nombre del contacto">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_emergencia_ap_paterno" class="form-label">Apellido Paterno</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                            <input type="text" class="form-control" id="modal_emergencia_ap_paterno" name="emergencia_ap_paterno" placeholder="Apellido paterno">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_emergencia_ap_materno" class="form-label">Apellido Materno</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                            <input type="text" class="form-control" id="modal_emergencia_ap_materno" name="emergencia_ap_materno" placeholder="Apellido materno">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_emergencia_telefono" class="form-label">Teléfono</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                                            <input type="text" class="form-control" id="modal_emergencia_telefono" name="emergencia_telefono" placeholder="Teléfono de contacto">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-4">
                                        <label for="modal_emergencia_parentesco" class="form-label">Parentesco</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-people"></i></span>
                                            <input type="text" class="form-control" id="modal_emergencia_parentesco" name="emergencia_parentesco" placeholder="Relación con el empleado">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 mb-4">
                                        <label for="modal_emergencia_domicilio" class="form-label">Domicilio</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bi bi-house-door"></i></span>
                                            <textarea class="form-control" id="modal_emergencia_domicilio" name="emergencia_domicilio" rows="2" placeholder="Domicilio del contacto"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btn_cancelar" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Cancelar
                        </button>
                        <button type="submit" id="btn_actualizar" class="btn btn-primary">
                            <i class="bi bi-check-circle"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/actualizarLogos.js"></script>
    <script src="js/funciones.js"></script>
    <script src="js/subirFotos.js"></script>
    <script src="js/generarFotos.js"></script>
</body>
</html>
