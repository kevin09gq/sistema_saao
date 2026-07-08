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
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

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
                        <div class="card nav-link active" id="areas-tab" data-bs-toggle="tab" data-bs-target="#areas"
                            role="tab" aria-controls="areas" aria-selected="true">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-diagram-3"></i> Áreas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="departamentos-tab" data-bs-toggle="tab"
                            data-bs-target="#departamentos" role="tab" aria-controls="departamentos"
                            aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-building"></i> Departamentos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="nominas-tab" data-bs-toggle="tab" data-bs-target="#nominas"
                            role="tab" aria-controls="nominas" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-wallet2"></i> Nóminas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="puestos-tab" data-bs-toggle="tab" data-bs-target="#puestos"
                            role="tab" aria-controls="puestos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-briefcase"></i> Puestos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="turnos-tab" data-bs-toggle="tab" data-bs-target="#turnos"
                            role="tab" aria-controls="turnos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-clock-history"></i> Turnos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="festividades-tab" data-bs-toggle="tab"
                            data-bs-target="#festividades" role="tab" aria-controls="festividades"
                            aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-calendar-date"></i> Festividades</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="empresas-tab" data-bs-toggle="tab" data-bs-target="#empresas"
                            role="tab" aria-controls="empresas" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-building-fill"></i> Empresas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="ranchos-tab" data-bs-toggle="tab" data-bs-target="#ranchos"
                            role="tab" aria-controls="ranchos" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-leaf-fill me-2"></i>Ranchos</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="tabulador-tab" data-bs-toggle="tab" data-bs-target="#tabulador"
                            role="tab" aria-controls="tabulador" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-table"></i> Tabulador</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="usuario-tab" data-bs-toggle="tab" data-bs-target="#usuario"
                            role="tab" aria-controls="usuario" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-person-gear"></i> Usuario</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="exportar-importar-tab" data-bs-toggle="tab"
                            data-bs-target="#exportar-importar" role="tab" aria-controls="exportar-importar"
                            aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-database"></i> Exportar/Importar</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="precios-cajas-tab" data-bs-toggle="tab" data-bs-target="#precios-cajas"
                            role="tab" aria-controls="precios-cajas" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-tag-fill"></i> Precios Cajas</h6>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <div class="card nav-link" id="tablas-lft-tab" data-bs-toggle="tab" data-bs-target="#tablas-lft"
                            role="tab" aria-controls="tablas-lft" aria-selected="false">
                            <div class="card-body p-1">
                                <h6 class="card-title my-0"><i class="bi bi-file-earmark-spreadsheet"></i> Tablas LFT</h6>
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
                                            <input type="text" class="search-box" id="search-areas"
                                                placeholder="Buscar área...">
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
                                            <input type="text" class="form-control" id="nombre_area" name="nombre_area"
                                                required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="imagen_area" class="form-label">Imagen del Área</label>
                                            <div class="image-upload-container" id="imagen-area-container">
                                                <div class="current-image-preview mb-2" id="area-image-preview"
                                                    style="display: none;">
                                                    <img id="preview_imagen_area" src="" alt="Vista previa"
                                                        class="img-thumbnail" style="max-height: 150px;">
                                                    <button type="button" class="btn btn-sm btn-danger remove-image"
                                                        id="btn-remove-area-image" data-area-id=""
                                                        data-target="imagen_area" style="display:inline-block;"><i
                                                            class="bi bi-x-circle"></i> Quitar</button>
                                                </div>
                                                <input type="file" class="form-control" id="imagen_area"
                                                    name="imagen_area" accept="image/*">
                                                <small class="form-text text-muted">Formatos permitidos: JPG, PNG.
                                                    Tamaño máximo: 2MB</small>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Color de fondo (Área)</label>
                                            <div class="d-flex align-items-center gap-2">
                                                <input type="color" class="form-control form-control-color" id="picker_color_area_fondo" value="#06320C" title="Elegir fondo">
                                                <input type="text" class="form-control" id="colores" name="colores" placeholder="#RRGGBB o rgb(r,g,b)">
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Color de texto (Área)</label>
                                            <div class="d-flex align-items-center gap-2">
                                                <input type="color" class="form-control form-control-color" id="picker_color_area_texto" value="#FFFFFF" title="Elegir texto">
                                                <input type="text" class="form-control" id="colores_texto" name="colores_texto" placeholder="#RRGGBB o rgb(r,g,b)">
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Vista previa</label>
                                            <div class="rounded border d-flex align-items-center justify-content-center" id="preview_area_colores" style="width:160px;height:40px;background:#06320C;">
                                                <span id="preview_area_texto" style="font-weight:700;font-size:14px;color:#FFFFFF;">Nombre</span>
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-area"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-area"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
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
                                            <input type="text" class="search-box" id="search-departamentos"
                                                placeholder="Buscar departamento...">
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
                                            <label for="nombre_departamento" class="form-label">Nombre del
                                                Departamento</label>
                                            <input type="text" class="form-control" id="nombre_departamento"
                                                name="nombre_departamento" required>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success"
                                                id="btn-guardar-departamento"><i class="bi bi-save"></i>
                                                Guardar</button>
                                            <button type="button" class="btn btn-secondary"
                                                id="btn-cancelar-departamento"><i class="bi bi-x-circle"></i>
                                                Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- NÓMINAS -->
                    <div class="tab-pane fade " id="nominas" role="tabpanel">
                        <div class="row mt-4">
                            <!-- Tabla de Nombres de Nómina -->
                            <div class="col-md-7" id="nominas-list-container">
                                <div class="table-container" id="nominas-table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Tipos de Nómina</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-nominas"
                                                placeholder="Buscar nómina...">
                                        </div>
                                    </div>
                                    <div class="table-responsive" id="nominas-table-responsive">
                                        <table class="table table-hover" id="tabla-nominas">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Área</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="nominas-tbody">
                                                <!-- Ejemplo de registros -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <!-- Formulario Nombre de Nómina -->
                            <div class="col-md-5">
                                <div class="alert alert-primary mb-0 shadow-sm" id="alert-select-nomina">
                                    <i class="bi bi-info-circle me-2"></i> Seleccione una nómina de la tabla para editarla.
                                </div>
                                <div class="form-container" style="display: none;" id="form-update-nomina-container">
                                    <h5 class="mb-3 text-primary"><i class="bi bi-pencil-square"></i> Modificar Nómina</h5>
                                    <form id="nominaForm">
                                        <input type="hidden" id="nomina_id" name="nomina_id" required>
                                        <div class="mb-3">
                                            <label for="nombre_nomina" class="form-label">Nombre de la Nómina</label>
                                            <input type="text" class="form-control" id="nombre_nomina"
                                                name="nombre_nomina" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="select_area_nomina" class="form-label">Área vinculada</label>
                                            <select class="form-select" id="select_area_nomina" name="id_area" required>
                                                <!-- Se llenará dinámicamente -->
                                            </select>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary" id="btn-guardar-nomina"><i
                                                    class="bi bi-save"></i> Actualizar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-nomina"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
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
                                            <input type="text" class="search-box" id="search-puestos"
                                                placeholder="Buscar puesto...">
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
                                            <input type="text" class="form-control" id="nombre_puesto"
                                                name="nombre_puesto" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="direccion_puesto" class="form-label">Dirección del
                                                Puesto</label>
                                            <input type="text" class="form-control" id="direccion_puesto"
                                                name="direccion_puesto">
                                        </div>
                                        <div class="mb-3">
                                            <label for="color_hex" class="form-label">Color (Hexadecimal)</label>
                                            <div class="d-flex align-items-center gap-2">
                                                <input type="color" class="form-control form-control-color"
                                                    id="color_picker" value="#000000" title="Elige un color">
                                                <input type="text" class="form-control" id="color_hex" name="color_hex"
                                                    placeholder="#000000" maxlength="7">
                                            </div>
                                            <small class="text-muted">Formato #RRGGBB. Puedes elegir con el selector o
                                                escribir el valor.</small>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-puesto"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-puesto"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>

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
                                            <input type="text" class="search-box" id="search-turnos"
                                                placeholder="Buscar Turno...">
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
                                            <button type="submit" class="btn btn-success" id="btn-guardar-turno"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-turno"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
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
                                        <select class="form-select form-select-lg w-25" id="select_anio_festividad">
                                            <option value="">Cargando años...</option>
                                        </select>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-festividades"
                                                placeholder="Buscar Festividad...">
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
                                            <input type="text" class="form-control" id="nombre_festividad"
                                                name="nombre_festividad" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="fecha_festividad" class="form-label">Fecha festividad</label>
                                            <input type="date" class="form-control" id="fecha_festividad"
                                                name="fecha_festividad" required>
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
                                            <input type="text" class="form-control" id="observacion" name="observacion"
                                                max="100">
                                        </div>


                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-festividad"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary"
                                                id="btn-cancelar-festividad"><i class="bi bi-x-circle"></i>
                                                Cancelar</button>
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
                                            <input type="text" class="search-box" id="search-empresas"
                                                placeholder="Buscar empresa...">
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
                                            <input type="text" class="form-control" id="nombre_empresa"
                                                name="nombre_empresa" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="rfc_empresa" class="form-label">RFC de la Empresa</label>
                                            <input type="text" class="form-control" id="rfc_empresa" name="rfc_empresa">
                                        </div>
                                        <div class="mb-3">
                                            <label for="domicilio_fiscal" class="form-label">Domicilio Fiscal</label>
                                            <input type="text" class="form-control" id="domicilio_fiscal"
                                                name="domicilio_fiscal">
                                        </div>
                                        <div class="mb-3">
                                            <label for="logo_empresa" class="form-label">Logo de la Empresa</label>
                                            <div class="image-upload-container">
                                                <div class="current-image-preview mb-2" style="display: none;">
                                                    <img id="preview_logo_empresa" src="" alt="Vista previa"
                                                        class="img-thumbnail" style="max-height: 150px;">
                                                    <button type="button" class="btn btn-sm btn-danger remove-image"
                                                        id="btn-remove-empresa-image" data-target="logo_empresa"><i
                                                            class="bi bi-x-circle"></i> Quitar</button>
                                                </div>
                                                <input type="file" class="form-control" id="logo_empresa"
                                                    name="logo_empresa" accept="image/*">
                                                <small class="form-text text-muted">Formatos permitidos: JPG, PNG.
                                                    Tamaño máximo: 2MB</small>
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-empresa"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-empresa"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
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
                                            <input type="text" class="search-box" id="search-ranchos"
                                                placeholder="Buscar Ranchos...">
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
                                                <label for="num_arboles" class="form-label">Num. Tablas</label>
                                                <input type="number" class="form-control" name="num_arboles"
                                                    id="num_arboles" placeholder="Número de tablas">
                                            </div>
                                            <div class="col-12 col-md-6 mb-3">

                                                <label class="form-label">&nbsp;</label><br>
                                                <button type="button" class="btn btn-primary w-100"
                                                    data-bs-toggle="modal" data-bs-target="#modalHorarioJornaleros">
                                                    <i class="bi bi-calendar3 me-2"></i>Horario jornalero
                                                </button>

                                                <!-- Modal para asignar el horario al jornalero -->
                                                <div class="modal fade" id="modalHorarioJornaleros" tabindex="-1"
                                                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                    <div class="modal-dialog modal-xl">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h1 class="modal-title fs-5" id="exampleModalLabel">
                                                                    Horario de Jornalero</h1>
                                                                <button type="button" class="btn-close"
                                                                    data-bs-dismiss="modal" aria-label="Close"></button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <div class="table-responsive">

                                                                    <!-- Formulario para copiar -->
                                                                    <div class="mb-4">
                                                                        <div class="row g-2">
                                                                            <div class="col-12 col-md-4">
                                                                                <label class="form-label"
                                                                                    for="ref_entrada">Entrada</label>
                                                                                <input type="time" id="ref_entrada"
                                                                                    class="form-control"
                                                                                    placeholder="Entrada">
                                                                            </div>
                                                                            <div class="col-12 col-md-4">
                                                                                <label class="form-label"
                                                                                    for="ref_salida">Salida</label>
                                                                                <input type="time" id="ref_salida"
                                                                                    class="form-control"
                                                                                    placeholder="Salida">
                                                                            </div>
                                                                            <div class="col-auto">
                                                                                <label class="form-label"
                                                                                    for="btnCopiarHorarios">&ensp;</label><br>
                                                                                <button type="button"
                                                                                    id="btnCopiarHorarios"
                                                                                    class="btn btn-outline-primary my-auto"
                                                                                    title="Copiar horarios"><i
                                                                                        class="bi bi-copy"></i></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <!-- Tabla del horario -->
                                                                    <table class="table table-borderless">
                                                                        <thead>
                                                                            <tr class="text-center">
                                                                                <th>Día</th>
                                                                                <th>Entrada</th>
                                                                                <th>Salida</th>
                                                                                <th>Descanso</th>
                                                                                <th>Acciones</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody id="tbody_horarios">
                                                                            <?php for ($i = 1; $i <= 7; $i++): ?>
                                                                                <tr>
                                                                                    <td>
                                                                                        <!-- <input type="text" class="form-control" name="horario_dia[]" placeholder="Día"> -->
                                                                                        <select class="form-select"
                                                                                            name="horario_dia[]">
                                                                                            <option selected value="">
                                                                                                Seleccionar...</option>

                                                                                            <?php foreach (DIAS_SEMANA as $dia): ?>
                                                                                                <option
                                                                                                    value="<?php echo $dia; ?>">
                                                                                                    <?php echo $dia; ?></option>
                                                                                            <?php endforeach; ?>

                                                                                        </select>

                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time"
                                                                                            class="form-control"
                                                                                            name="horario_entrada[]"
                                                                                            placeholder="Entrada">
                                                                                    </td>
                                                                                    <td>
                                                                                        <input type="time"
                                                                                            class="form-control"
                                                                                            name="horario_salida[]"
                                                                                            placeholder="Salida">
                                                                                    </td>
                                                                                    <td class="text-center">
                                                                                        <div
                                                                                            class="d-inline form-check form-switch d-inline-flex align-items-center">
                                                                                            <input
                                                                                                class="form-check-input chk-descanso"
                                                                                                type="checkbox"
                                                                                                name="horario_descanso[]"
                                                                                                value="1">
                                                                                        </div>
                                                                                    </td>
                                                                                    <td class="text-center">

                                                                                        <!-- Botón para limpiar la fila -->
                                                                                        <button type="button"
                                                                                            class="d-inline btn btn-danger btn-sm btn-eliminar-fila"
                                                                                            title="Limpiar fila">
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
                                            <button type="submit" class="btn btn-success"
                                                id="btn-guardar-rancho">Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-rancho"
                                                onclick="resetearFormulario()">Cancelar</button>
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
                                        <h5 class="mb-0 text-center"><i class="bi bi-table"></i> Tabulador de Costos
                                        </h5>
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

                                                    <th class="bg-warning text-dark">Seleccionar</th>
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
                                    <form id="importarBDForm" action="../php/importar_bd.php" method="POST"
                                        enctype="multipart/form-data">
                                        <div class="mb-3">
                                            <label for="archivo_bd" class="form-label">Archivo SQL</label>
                                            <input type="file" class="form-control" id="archivo_bd" name="archivo_bd"
                                                accept=".sql" required>
                                            <small class="form-text text-muted">Seleccione un archivo .sql para
                                                importar.</small>
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
                        <div class="row mt-4">
                            <div class="col-md-5 offset-md-3">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-person-gear"></i> Actualizar Datos del Usuario</h5>
                                    <form id="formUsuario">
                                        <div class="mb-3">
                                            <label for="correo" class="form-label">Correo Electrónico</label>
                                            <input type="email" class="form-control" id="correo" name="correo"
                                                placeholder="ejemplo@correo.com" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="password_actual" class="form-label">Contraseña Actual</label>
                                            <div class="input-group">
                                                <input type="password" class="form-control" id="password_actual"
                                                    name="password_actual" placeholder="Tu contraseña actual" required>
                                                <button class="btn btn-outline-secondary" type="button"
                                                    id="togglePasswordActual">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted">Necesaria para confirmar cualquier cambio.</small>
                                        </div>

                                        <div class="mb-3">
                                            <label for="password_nueva" class="form-label">Nueva Contraseña</label>
                                            <div class="input-group">
                                                <input type="password" class="form-control" id="password_nueva"
                                                    name="password_nueva" placeholder="Mínimo 8 caracteres">
                                                <button class="btn btn-outline-secondary" type="button"
                                                    id="togglePasswordNueva">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted">Dejar vacío si solo deseas actualizar tu correo.</small>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-usuario"><i
                                                    class="bi bi-save"></i> Actualizar Información</button>
                                            <button type="reset" class="btn btn-secondary" id="btn-cancelar-usuario"><i
                                                    class="bi bi-x-circle"></i> Restaurar Campos</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PRECIOS CAJAS -->
                    <div class="tab-pane fade" id="precios-cajas" role="tabpanel">
                        <div class="row mt-4">
                            <div class="col-md-7">
                                <div class="table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Lista de Precios</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-precios"
                                                placeholder="Buscar precio...">
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-hover" id="tabla-precios">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tipo</th>
                                                    <th>Color</th>
                                                    <th>Valor</th>
                                                    <th>Precio</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="precios-tbody">
                                                <!-- Se cargará dinámicamente -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Agregar Precio</h5>
                                    <form id="precioCajaForm">
                                        <input type="hidden" id="precio_id" name="precio_id">

                                        <div class="mb-3">
                                            <label for="tipo_precio" class="form-label">Tipo de Clasificación</label>
                                            <select class="form-select" name="tipo_precio" id="tipo_precio" required>
                                                <option value="NUMERO_DE_BOLSA" selected>NUMERO_DE_BOLSA</option>
                                                <option value="PESO">PESO</option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="valor_caja" class="form-label">Valor (Ej. 14:2 o 40 lbs)</label>
                                            <input type="text" class="form-control" id="valor_caja" name="valor_caja" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="precio_caja" class="form-label">Precio por Caja ($)</label>
                                            <input type="number" class="form-control" id="precio_caja" name="precio_caja" step="0.01" min="0" required>
                                        </div>

                                        <div class="mb-3">
                                            <label for="color_hex_caja" class="form-label">Color (Hexadecimal)</label>
                                            <div class="d-flex align-items-center gap-2">
                                                <input type="color" class="form-control form-control-color"
                                                    id="color_picker_caja" value="#000000" title="Elige un color">
                                                <input type="text" class="form-control" id="color_hex_caja" name="color_hex"
                                                    placeholder="#000000" maxlength="7" value="#000000">
                                            </div>
                                            <small class="text-muted">Formato #RRGGBB. Puedes elegir con el selector o
                                                escribir el valor.</small>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-precio"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-precio"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TABLAS LFT -->
                    <div class="tab-pane fade" id="tablas-lft" role="tabpanel">
                        <div class="row mt-4">
                            <!-- Lista de Versiones -->
                            <div class="col-md-7">
                                <div class="table-container">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5><i class="bi bi-list-ul"></i> Versiones de Ley LFT</h5>
                                        <div class="search-box-container">
                                            <input type="text" class="search-box" id="search-versiones-lft"
                                                placeholder="Buscar versión...">
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-hover" id="tabla-versiones-lft">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nombre</th>
                                                    <th>Vigencia</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="versiones-lft-tbody">
                                                <!-- Cargado dinámicamente -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <!-- Formulario de Versión -->
                            <div class="col-md-5">
                                <div class="form-container">
                                    <h5 class="mb-3"><i class="bi bi-plus-circle"></i> Configurar Versión</h5>
                                    <form id="versionLftForm">
                                        <input type="hidden" id="id_version_vacaciones" name="id_version_vacaciones">

                                        <div class="mb-3">
                                            <label for="nombre_version" class="form-label">Nombre de la Versión</label>
                                            <input type="text" class="form-control" id="nombre_version" name="nombre_version" required placeholder="Ej: Reforma 2023">
                                        </div>

                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="fecha_inicio_vigencia_lft" class="form-label">Inicio Vigencia</label>
                                                <input type="date" class="form-control" id="fecha_inicio_vigencia_lft" name="fecha_inicio_vigencia" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="fecha_fin_vigencia_lft" class="form-label">Fin Vigencia</label>
                                                <input type="date" class="form-control" id="fecha_fin_vigencia_lft" name="fecha_fin_vigencia">
                                                <small class="text-muted">Dejar vacío si es la actual.</small>
                                            </div>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-success" id="btn-guardar-version-lft"><i
                                                    class="bi bi-save"></i> Guardar</button>
                                            <button type="button" class="btn btn-secondary" id="btn-cancelar-version-lft"><i
                                                    class="bi bi-x-circle"></i> Cancelar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para configurar Días de Vacaciones por Versión -->
    <?php include 'modals/modalVacaciones.php'; ?>

    <!-- Modal para mostrar la imagen del área -->
    <?php include 'modals/modalImagenArea.php'; ?>

    <!-- Modal para mostrar el logo de la empresa -->
    <?php include 'modals/modalLogoEmpresa.php'; ?>

    <!-- Modal para ver los detalles de la información del rancho -->
    <?php include 'modals/modalInfoRanchos.php'; ?>

    <!-- Modal para Asignar Departamentos a Nómina -->
    <?php include 'modals/modalDepartamentosNominas.php'; ?>

    <!-- NUEVO MODAL PARA LOS DETALLES DE AREA Y SUS DEPARTAMENTOS -->
    <?php include 'modals/modalAreaDepartamento.php'; ?>

    <!-- NUEVO MODAL PARA LOS DETALLES POR DEPARTAMENTO Y SUS AREAS -->
    <?php include 'modals/modalDepartamentoArea.php'; ?>

    <!-- NUEVO MODAL PARA LOS DETALLES LOS PUESTOS POR DEPARTAMENTO -->
    <?php include 'modals/modalPuestoDepartamento.php'; ?>

    <!-- NUEVO MODAL PARA VER LOS DEPARTAMENTOS ASIGNADOS A UN PUESTO -->
    <?php include 'modals/modalDepartamentoPuesto.php'; ?>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- JS personalizado -->
    <script src="../js/config_departamentos.js"></script>
    <script src="../js/config_puestos.js"></script>
    <script src="../js/config_areas.js"></script>
    <script src="../js/config_nominas.js"></script>

    <!-- Agregue este js para los turnos -->
    <script src="../js/config_turnos.js"></script>
    <script src="../js/config_festividades.js"></script>
    <script src="../js/config_ranchos.js"></script>

    <script src="../js/config_empresas.js"></script>
    <script src="../js/obtener_tabulador.js"></script>
    <script src="../js/config_tabulador.js"></script>
    <script src="../js/edit_credenciales.js"></script>
    <script src="../js/config_precios_cajas.js"></script>
    <script src="../js/config_tablasLFT.js"></script>
    <script src="../../../nomina/js/rangos_horas.js"></script>
    <script src="../../../public/js/validaciones.js"></script>

</body>

</html>