<!DOCTYPE html>
<html lang="es">

<?php
include("../../config.php");
verificarSesion(); // Proteger esta página
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración del Sistema</title>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="../styles/configuracion.css">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php include("../../../public/views/navbar.php"); ?>

    <div class="container mt-4">
        <div class="card main-card mb-5">
            <div class="card-header">
                <h4 class="form-section-title">
                    <i class="bi bi-gear-fill section-icon"></i>
                    <span class="titulo-config">Configuración del Sistema</span>
                </h4>
            </div>
            <div class="card-body">


                <!-- Pestañas de navegación -->
                <div class="row row-cols-1 row-cols-md-5 g-2" id="configTabs" role="tablist">
                    <div class="col">
                        <div class="card nav-link active" id="areas-tab"
                            data-bs-toggle="tab" data-bs-target="#areas"
                            role="tab" aria-controls="areas" aria-selected="true">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-diagram-3"></i> Áreas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="departamentos-tab"
                            data-bs-toggle="tab" data-bs-target="#departamentos"
                            role="tab" aria-controls="departamentos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-building"></i> Departamentos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="puestos-tab"
                            data-bs-toggle="tab" data-bs-target="#puestos"
                            role="tab" aria-controls="puestos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-briefcase"></i> Puestos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="turnos-tab"
                            data-bs-toggle="tab" data-bs-target="#turnos"
                            role="tab" aria-controls="turnos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-clock-history"></i> Turnos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="festividades-tab"
                            data-bs-toggle="tab" data-bs-target="#festividades"
                            role="tab" aria-controls="festividades" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-calendar-date"></i> Festividades</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="empresas-tab"
                            data-bs-toggle="tab" data-bs-target="#empresas"
                            role="tab" aria-controls="empresas" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-building-fill"></i> Empresas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="ranchos-tab"
                            data-bs-toggle="tab" data-bs-target="#ranchos"
                            role="tab" aria-controls="ranchos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-leaf-fill me-2"></i>Ranchos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="tabulador-tab"
                            data-bs-toggle="tab" data-bs-target="#tabulador"
                            role="tab" aria-controls="tabulador" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-table"></i> Tabulador</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="usuario-tab"
                            data-bs-toggle="tab" data-bs-target="#usuario"
                            role="tab" aria-controls="usuario" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-person-gear"></i> Usuario</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="exportar-importar-tab"
                            data-bs-toggle="tab" data-bs-target="#exportar-importar"
                            role="tab" aria-controls="exportar-importar" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-database"></i> Exportar/Importar</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenido de las pestañas -->
                <div class="tab-content" id="configTabsContent">

                    <!-- ÁREAS - Con gestión de imágenes -->
                    <div class="tab-pane fade show active" id="areas" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-7" id="areas-list-container">
                                <div class="table-container" id="areas-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Áreas</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-areas" placeholder="Buscar área...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="areas-table-responsive">
                                        <table class="table table-hover" id="tabla-areas">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="areas-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Área</h5>
                                    <form id="areaForm" enctype="multipart/form-data">
                                        <input type="hidden" id="area_id" name="area_id">
                                        <div class="mb-3">
                                            <label for="nombre_area" class="form-label">Nombre del Área</label>
                                            <input type="text" class="form-control" id="nombre_area" name="nombre_area" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="imagen_area" class="form-label">Imagen del Área</label>
                                            <div class="image-upload-container" id="imagen-area-container">
                                                <div class="current-image-preview mb-2" id="area-image-preview" style="display: none;">
                                                    <img id="preview_imagen_area" src="" alt="Vista previa" class="img-thumbnail" style="max-height: 150px;">
                                                    <button type="button" class="btn btn-sm btn-danger remove-image" id="btn-remove-area-image" data-area-id="" data-target="imagen_area" style="display:inline-block;"><i class="bi bi-x-circle"></i> Quitar</button>
                                                </div>
                                                <input type="file" class="form-control" id="imagen_area" name="imagen_area" accept="image/*">
                                                <small class="form-text text-muted">Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB</small>
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-area"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-area"><i class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- DEPARTAMENTOS - Simplificado -->
                    <div class="tab-pane fade " id="departamentos" role="tabpanel">
                        <div class="row mt-4">
                            <!-- Tabla -->
                            <div class="col-md-7" id="departamentos-list-container">
                                <div class="table-container" id="departamentos-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Departamentos</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-departamentos" placeholder="Buscar departamento...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="departamentos-table-responsive">
                                        <table class="table table-hover" id="tabla-departamentos">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="departamentos-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <!-- Formulario -->
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Departamento</h5>
                                    <form id="departamentoForm">
                                        <input type="hidden" id="departamento_id" name="departamento_id">
                                        <div class="mb-3">
                                            <label for="nombre_departamento" class="form-label">Nombre del Departamento</label>
                                            <input type="text" class="form-control" id="nombre_departamento" name="nombre_departamento" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="id_area_departamento" class="form-label">Área perteneciente</label>
                                            <select class="form-select" name="id_area_departamento" id="id_area_departamento">
                                                <!-- Se llenará dinámicamente con las áreas disponibles -->
                                            </select>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-departamento"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-departamento"><i class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PUESTOS - Simplificado -->
                    <div class="tab-pane fade" id="puestos" role="tabpanel">
                        <div class="row mt-4">

                            <!-- Tabla para listar los puestos -->
                            <div class="col-md-7" id="puestos-list-container">
                                <div class="table-container" id="puestos-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Puestos</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-puestos" placeholder="Buscar puesto...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="puestos-table-responsive">
                                        <table class="table table-hover" id="tabla-puestos">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="puestos-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <!-- Formulario para nuevo puesto -->
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Puesto</h5>
                                    <form id="puestoForm">
                                        <input type="hidden" id="puesto_id" name="puesto_id">
                                        <div class="mb-3">
                                            <label for="nombre_puesto" class="form-label">Nombre del Puesto</label>
                                            <input type="text" class="form-control" id="nombre_puesto" name="nombre_puesto" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="direccion_puesto" class="form-label">Dirección del Puesto</label>
                                            <input type="text" class="form-control" id="direccion_puesto" name="direccion_puesto">
                                        </div>
                                        <div class="mb-3">
                                            <label for="color_hex" class="form-label">Color (Hexadecimal)</label>
                                            <div class="d-flex align-items-center gap-2">
                                                <input type="color" class="form-control form-control-color" id="color_picker" value="#000000" title="Elige un color">
                                                <input type="text" class="form-control" id="color_hex" name="color_hex" placeholder="#000000" maxlength="7">
                                            </div>
                                            <small class="text-muted">Formato #RRGGBB. Puedes elegir con el selector o escribir el valor.</small>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-puesto"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-puesto"><i class="bi bi-x-circle"></i> Cancelar</button>

                                        </div>
                                    </form>
                                </div>

                            </div>

                            <hr class="my-3">

                            <!-- Tabla para listar la relacion de puestos y departamentos -->
                            <div class="col-md-7" id="departamentos-puestos-list-container">
                                <div class="table-container" id="departamentos-puestos-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de relaciones</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-departamentos-puestos" placeholder="Buscar relación...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="departamentos-puestos-table-responsive">
                                        <table class="table table-hover" id="tabla-departamentos-puestos">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Departamento</th>
                                                    <th>Puesto</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="departamentos-puestos-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <!-- Formulario para relacionar un puesto con un departamento -->
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Asignar puesto a departamento</h5>
                                    <form id="departamento-puesto-form">

                                        <input type="hidden" id="departamento_puesto_id" name="departamento_puesto_id">

                                        <div class="mb-3">
                                            <label for="select_departamento" class="form-label">Departamento</label>
                                            <select class="form-select" name="select_departamento" id="select_departamento">
                                                <!-- Se llenará dinámicamente con las áreas disponibles -->
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="select_puesto" class="form-label">Puesto</label>
                                            <select class="form-select" name="select_puesto" id="select_puesto">
                                                <!-- Se llenará dinámicamente con las áreas disponibles -->
                                            </select>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-departamento-puesto"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-departamento-puesto"><i class="bi bi-x-circle"></i> Cancelar</button>

                                        </div>
                                    </form>
                                </div>

                            </div>

                        </div>
                    </div>

                    <!-- TURNOS- Horas de entrada y salida -->
                    <div class="tab-pane fade" id="turnos" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-7" id="turnos-list-container">
                                <div class="table-container" id="turnos-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Turnos</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-turnos" placeholder="Buscar Turno...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="turnos-table-responsive">
                                        <table class="table table-hover" id="tabla-turnos">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Descripción</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="turnos-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Turno</h5>
                                    <form id="turnoForm">
                                        <input type="hidden" id="turno_id" name="turno_id">

                                        <div class="mb-3">
                                            <label for="descripcion" class="form-label">Turno</label>
                                            <select class="form-select" name="descripcion" id="descripcion">
                                                <option value="DIURNA" selected>DIURNA</option>
                                                <option value="NOCTURNA">NOCTURNA</option>
                                                <option value="MIXTA">MIXTA</option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="hora_inicio" class="form-label">Hora de Inicio</label>
                                            <input type="time" class="form-control" id="hora_inicio" name="hora_inicio">
                                        </div>

                                        <div class="mb-3">
                                            <label for="hora_fin" class="form-label">Hora Fin</label>
                                            <input type="time" class="form-control" id="hora_fin" name="hora_fin">
                                        </div>

                                        <div class="mb-3">
                                            <label for="max" class="form-label">Horas máximas</label>
                                            <input type="number" class="form-control" id="max" name="max"
                                                placeholder="Horas máximas" required step="any" min="0">
                                        </div>


                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-turno"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-turno"><i class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FESTIVIDADES -->
                    <div class="tab-pane fade" id="festividades" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-7" id="festividades-list-container">
                                <div class="table-container" id="festividades-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de festividades</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-festividades" placeholder="Buscar Festividad...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="festividades-table-responsive">
                                        <table class="table table-hover" id="tabla-festividades">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Festividad</th>
                                                    <th>Fecha</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="festividades-tbody">
                                                <!-- Ejemplo de registros -->

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Festividad</h5>
                                    <form id="festividadForm">
                                        <input type="hidden" id="festividad_id" name="festividad_id">

                                        <div class="mb-3">
                                            <label for="nombre_festividad" class="form-label">Nombre festividad</label>
                                            <input type="text" class="form-control" id="nombre_festividad" name="nombre_festividad" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="fecha_festividad" class="form-label">Fecha festividad</label>
                                            <input type="date" class="form-control" id="fecha_festividad" name="fecha_festividad" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="tipo_festividad" class="form-label">Nivel</label>
                                            <select class="form-select" name="tipo_festividad" id="tipo_festividad">
                                                <option value="NACIONAL" selected>NACIONAL</option>
                                                <option value="LOCAL">LOCAL</option>
                                                <option value="INTERNO">INTERNO</option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="observacion" class="form-label">Observación</label>
                                            <input type="text" class="form-control" id="observacion" name="observacion" max="100">
                                        </div>


                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-festividad"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-festividad"><i class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- EMPRESAS - Con gestión de imágenes -->
                    <div class="tab-pane fade" id="empresas" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-7">
                                <div class="table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Empresas</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-empresas" placeholder="Buscar empresa...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="empresas-table-responsive">
                                        <table class="table table-hover" id="tabla-empresas">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="empresas-tbody">
                                                <!-- Ejemplo de registros -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Empresa</h5>
                                    <form id="empresaForm" enctype="multipart/form-data">
                                        <input type="hidden" id="empresa_id" name="empresa_id">
                                        <div class="mb-3">
                                            <label for="nombre_empresa" class="form-label">Nombre de la Empresa</label>
                                            <input type="text" class="form-control" id="nombre_empresa" name="nombre_empresa" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="rfc_empresa" class="form-label">RFC de la Empresa</label>
                                            <input type="text" class="form-control" id="rfc_empresa" name="rfc_empresa">
                                        </div>
                                        <div class="mb-3">
                                            <label for="domicilio_fiscal" class="form-label">Domicilio Fiscal</label>
                                            <input type="text" class="form-control" id="domicilio_fiscal" name="domicilio_fiscal">
                                        </div>
                                        <div class="mb-3">
                                            <label for="logo_empresa" class="form-label">Logo de la Empresa</label>
                                            <div class="image-upload-container">
                                                <div class="current-image-preview mb-2" style="display: none;">
                                                    <img id="preview_logo_empresa" src="" alt="Vista previa" class="img-thumbnail" style="max-height: 150px;">
                                                    <button type="button" class="btn btn-sm btn-danger remove-image" id="btn-remove-empresa-image" data-target="logo_empresa"><i class="bi bi-x-circle"></i> Quitar</button>
                                                </div>
                                                <input type="file" class="form-control" id="logo_empresa" name="logo_empresa" accept="image/*">
                                                <small class="form-text text-muted">Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB</small>
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-empresa"><i class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-empresa"><i class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ranchos -->
                    <div class="tab-pane fade" id="ranchos" role="tabpanel">
                        <div class="row mt-4">

                            <div class="col-md-7" id="ranchos-list-container">
                                <div class="table-container" id="ranchos-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul me-2"></i>Información de los ranchos</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-ranchos" placeholder="Buscar Ranchos...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="ranchos-table-responsive">
                                        <table class="table table-hover" id="tabla-ranchos">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Rancho</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="ranchos-tbody">
                                                <!-- Ejemplo de registros -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Ranchos</h5>
                                    <form id="ranchosForm">

                                        <input type="number" id="id_info_rancho" hidden>

                                        <div class="mb-3">
                                            <label for="id_rancho" class="form-label">Seleccionar rancho:</label>
                                            <select class="form-select" name="id_rancho" id="id_rancho">
                                                <!-- Se llenará dinámicamente con los ranchos disponibles -->
                                            </select>
                                        </div>

                                        <div class="row">
                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="costo_jornal" class="form-label">Pago Jornal</label>
                                                <input type="number" class="form-control" name="costo_jornal" id="costo_jornal" placeholder="Ingrese el pago jornal">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="costo_tardeada" class="form-label">Pago Tardeada</label>
                                                <input type="number" class="form-control" name="costo_tardeada" id="costo_tardeada" placeholder="Ingrese el pago tardeada">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="costo_pasaje" class="form-label">Pago Pasaje</label>
                                                <input type="number" class="form-control" name="costo_pasaje" id="costo_pasaje" placeholder="Ingrese el pago pasaje">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="costo_comida" class="form-label">Pago Comida</label>
                                                <input type="number" class="form-control" name="costo_comida" id="costo_comida" placeholder="Ingrese el pago comida">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="num_arboles" class="form-label">Num. Árboles</label>
                                                <input type="number" class="form-control" name="num_arboles" id="num_arboles" placeholder="Ingrese el número de árboles">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">

                                                <label class="form-label">&nbsp;</label><br>
                                                <button type="button" class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#modalHorarioJornaleros">
                                                    <i class="bi bi-calendar3 me-2"></i>Horario jornalero
                                                </button>

                                                <!-- Modal para asignar el horario al jornalero -->
                                                <div class="modal fade" id="modalHorarioJornaleros" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                    <div class="modal-dialog modal-xl">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h1 class="modal-title fs-5" id="exampleModalLabel">Horario Jornalero</h1>
                                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <div class="table-responsive">

                                                                    <!-- Formulario para copiar -->
                                                                    <div class="mb-4">
                                                                        <div class="row g-2">
                                                                            <div class="col">
                                                                                <label class="form-label" for="ref_entrada">Entrada</label>
                                                                                <input type="time" id="ref_entrada" class="form-control" placeholder="Entrada">
                                                                            </div>
                                                                            <div class="col">
                                                                                <label class="form-label" for="ref_salida_comida">Salida Comida</label>
                                                                                <input type="time" id="ref_salida_comida" class="form-control" placeholder="Salida Comida">
                                                                            </div>
                                                                            <div class="col">
                                                                                <label class="form-label" for="ref_entrada_comida">Entrada Comida</label>
                                                                                <input type="time" id="ref_entrada_comida" class="form-control" placeholder="Entrada Comida">
                                                                            </div>
                                                                            <div class="col">
                                                                                <label class="form-label" for="ref_salida">Salida</label>
                                                                                <input type="time" id="ref_salida" class="form-control" placeholder="Salida">
                                                                            </div>
                                                                            <div class="col-auto">
                                                                                <label class="form-label" for="btnCopiarHorarios">&ensp;</label><br>
                                                                                <button type="button" id="btnCopiarHorarios" class="btn btn-outline-primary my-auto" title="Copiar horarios"><i class="bi bi-copy"></i></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- Tabla del horario -->
                                                                    <table class="table table-borderless">
                                                                        <thead>
                                                                            <tr class="text-center">
                                                                                <th>Día</th>
                                                                                <th>Entrada</th>
                                                                                <th>Salida Comida</th>
                                                                                <th>Entrada Comida</th>
                                                                                <th>Salida</th>
                                                                                <th>Acciones</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="tbody_horarios">
                                                                            <?php for ($i = 1; $i <= 7; $i++): ?>
                                                                                <tr>
                                                                                    <td>
                                                                                        <!-- <input type="text" class="form-control" name="horario_dia[]" placeholder="Día"> -->
                                                                                        <select class="form-select" name="horario_dia[]">
                                                                                            <option selected value="">Seleccionar...</option>

                                                                                            <?php foreach (DIAS_SEMANA as $dia): ?>
                                                                                                <option value="<?php echo $dia; ?>"><?php echo $dia; ?></option>
                                                                                            <?php endforeach; ?>

                                                                                        </select>

                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time" class="form-control" name="horario_entrada[]" placeholder="Entrada">
                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time" class="form-control" name="horario_salida_comida[]" placeholder="Salida Comida">
                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time" class="form-control" name="horario_entrada_comida[]" placeholder="Entrada Comida">
                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time" class="form-control" name="horario_salida[]" placeholder="Salida">
                                                                                    </td>
                                                                                    <td class="text-center">

                                                                                        <!-- Botón para limpiar la fila -->
                                                                                        <button type="button" class="d-inline btn btn-danger btn-sm btn-eliminar-fila" title="Limpiar fila">
                                                                                            <i class="bi bi-trash"></i>
                                                                                        </button>

                                                                                    </td>
                                                                                </tr>
                                                                            <?php endfor; ?>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>




                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-rancho">Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-rancho" onclick="resetearFormulario()">Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- TABULADOR - Solo interfaz -->
                    <div class="tab-pane fade" id="tabulador" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5 class="mb-0 text-center"><i class="bi bi-table"></i> Tabulador de Costos</h5>
                                        <div>
                                            <button type="button" class="btn btn-primary me-2" id="btn-agregar-fila">
                                                <i class="bi bi-plus-circle"></i> Agregar Fila
                                            </button>
                                            <button type="button" class="btn btn-warning me-2" id="btn-agregar-extra">
                                                <i class="bi bi-plus-circle-dotted"></i> Agregar Hora Extra
                                            </button>
                                            <button type="button" class="btn btn-danger me-2" id="btn-eliminar-fila">
                                                <i class="bi bi-dash-circle"></i> Eliminar Fila
                                            </button>
                                            <button type="button" class="btn btn-success" id="btn-actualizar-tabulador">
                                                <i class="bi bi-arrow-repeat"></i> Actualizar
                                            </button>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table tabulador-table" style="min-width:700px;">
                                            <thead>
                                                <tr>
                                                    <th class="bg-warning text-dark">De la hora</th>
                                                    <th class="bg-warning text-dark">A la</th>
                                                    <th class="bg-warning text-dark">Minutos Trabajados</th>
                                                    <th class="bg-warning text-dark">Sueldo Semanal</th>
                                                    <th class="bg-warning text-dark">Costo del minuto</th>
                                                    <th class="bg-warning text-dark">Adicional</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tabulador-tbody">
                                                <!-- Filas del tabulador se cargarán aquí dinámicamente -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- EXPORTAR/IMPORTAR - Base de Datos  -->
                    <div class="tab-pane fade" id="exportar-importar" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-download"></i> Exportar Base de Datos</h5>

                                    <div class="form-actions">
                                        <a href="../php/exportar_bd.php" class="btn btn-success" id="btn-exportar-bd">
                                            <i class="bi bi-file-earmark-arrow-down"></i> Exportar
                                        </a>
                                    </div>

                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-upload"></i> Importar Base de Datos</h5>
                                    <form id="importarBDForm" action="../php/importar_bd.php" method="POST" enctype="multipart/form-data">
                                        <div class="mb-3">
                                            <label for="archivo_bd" class="form-label">Archivo SQL</label>
                                            <input type="file" class="form-control" id="archivo_bd" name="archivo_bd" accept=".sql" required>
                                            <small class="form-text text-muted">Seleccione un archivo .sql para importar.</small>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-importar-bd">
                                                <i class="bi bi-file-earmark-arrow-up"></i> Importar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- USUARIO -->
                    <div class="tab-pane fade" id="usuario" role="tabpanel">
                        <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                            <div class="card shadow-lg border-0" style="width: 100%; max-width: 500px;">
                                <div class="card-header bg-success text-white text-center">
                                    <h5 class="mb-0"><i class="bi bi-person-gear"></i> Editar Información de Usuario</h5>
                                </div>
                                <div class="card-body">
                                    <form id="formUsuario">
                                        <div class="mb-4">
                                            <label for="correo" class="form-label">Correo Electrónico</label>
                                            <input type="email" class="form-control" id="correo" name="correo" placeholder="usuario@ejemplo.com" required>
                                        </div>
                                        <div class="mb-4">
                                            <label for="password_actual" class="form-label">Contraseña Actual</label>
                                            <div class="input-group">
                                                <input type="password" class="form-control" id="password_actual" name="password_actual" placeholder="••••••••" required>
                                                <button class="btn btn-outline-secondary" type="button" id="togglePasswordActual">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted">Ingresa tu contraseña actual para confirmar los cambios.</small>
                                        </div>
                                        <div class="mb-4">
                                            <label for="password_nueva" class="form-label">Nueva Contraseña</label>
                                            <div class="input-group">
                                                <input type="password" class="form-control" id="password_nueva" name="password_nueva" placeholder="••••••••">
                                                <button class="btn btn-outline-secondary" type="button" id="togglePasswordNueva">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted">Dejar en blanco si no deseas cambiarla.</small>
                                        </div>
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-success">
                                                <i class="bi bi-save"></i> Guardar Cambios
                                            </button>
                                            <button type="reset" class="btn btn-secondary">
                                                <i class="bi bi-x-circle"></i> Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>
        <br>
    </div>

    <!-- Modal para mostrar la imagen del área -->
    <div class="modal fade" id="modalAreaImagen" tabindex="-1" aria-labelledby="modalAreaTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalAreaTitle">Imagen del Área</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="modalAreaImage" src="" alt="Imagen del área" class="img-fluid rounded shadow-sm" style="max-height: 400px;">
                </div>
                <div class="modal-footer">
                    <p id="modalAreaFooter" class="text-muted small w-100 text-center mb-0"></p>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para mostrar el logo de la empresa -->
    <div class="modal fade" id="modalEmpresaLogo" tabindex="-1" aria-labelledby="modalEmpresaLogoTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalEmpresaLogoTitle">Logo de la Empresa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="modalEmpresaLogoImage" src="" alt="Logo de la empresa" class="img-fluid rounded shadow-sm" style="max-height: 400px; display: none;">
                    <p id="modalEmpresaLogoFooter" class="text-muted small w-100 text-center mb-0"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para ver los detalles de la información del rancho -->
    <div class="modal fade" id="modalInfoRancho" tabindex="-1" aria-labelledby="modalInfoRanchoLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="modalInfoRanchoLabel">Detalles de la información del rancho</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive mb-4">
                        <h6 class="mb-3">Información general</h6>
                        <table class="table table-hover table-bordered shadow-sm">
                            <thead>
                                <tr class="text-center">
                                    <th>Rancho</th>
                                    <th>Jornal</th>
                                    <th>Tardeada</th>
                                    <th>Pasaje</th>
                                    <th>Comida</th>
                                    <th>N.árboles</th>
                                </tr>
                            </thead>
                            <tbody id="body-info-rancho"></tbody>
                        </table>
                    </div>

                    <div class="table-responsive">
                        <h6 class="mb-3">Horarios de los jornaleros</h6>
                        <table class="table table-hover table-bordered shadow-sm">
                            <thead>
                                <tr class="text-center">
                                    <th>Día</th>
                                    <th>Entrada</th>
                                    <th>Salida Comida</th>
                                    <th>Entrada Comida</th>
                                    <th>Salida</th>
                                </tr>
                            </thead>
                            <tbody id="body-rancho-horario-jornaleros"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- JS personalizado -->
    <script src="../js/config_departamentos.js"></script>
    <script src="../js/config_puestos.js"></script>
    <script src="../js/config_areas.js"></script>

    <!-- Agregue este js para los turnos -->
    <script src="../js/config_turnos.js"></script>
    <script src="../js/config_festividades.js"></script>
    <script src="../js/config_ranchos.js"></script>

    <script src="../js/config_empresas.js"></script>
    <script src="../js/obtener_tabulador.js"></script>
    <script src="../js/config_tabulador.js"></script>
    <script src="../js/edit_credenciales.js"></script>
    <script src="../../../nomina/js/rangos_horas.js"></script>
    <script src="../../../public/js/validaciones.js"></script>

</body>

</html>