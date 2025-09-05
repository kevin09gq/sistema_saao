<!DOCTYPE html>
<?php
include("../../config/config.php");
?>
<html lang="es">


<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Empleados</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../styles/actualizar_empleado.css">
    <link rel="stylesheet" href="<?= $rutaRaiz ?>/plugins/toasts/vanillatoasts.css">
</head>

<body>
    <?php include("../../public/views/navbar.php"); ?>
    <div class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div class="d-flex align-items-center gap-2">
                <select class="form-select me-2" id="filtroDepartamento" style="min-width:200px;">

                </select>
                <input type="text" class="search-box me-2" placeholder="Buscar..." id="buscadorEmpleado">
                <button class="btn btn-add" id="btnAgregarEmpleado">+ Agregar Empleado</button>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" id="pestanasEstado" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-status="Todos" type="button" role="tab">Todos</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="activos-tab" data-bs-toggle="tab" data-status="Activo" type="button" role="tab">Activos</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="inactivos-tab" data-bs-toggle="tab" data-status="Inactivo" type="button" role="tab">Inactivos</button>
            </li>
        </ul>
        <!-- Tabla -->
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>Nombre / Departamento</th>
                        <th>Clave</th>
                        <th>Status</th>
                        <th class="text-end">Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaEmpleadosCuerpo">
                    <!-- Filas dinámicas -->
                </tbody>
            </table>
        </div>
        <!-- Paginación -->
        <nav class="mt-3">
            <ul class="pagination" id="paginacion">
                <!-- Paginación dinámica -->
            </ul>
        </nav>
    </div>

    <!-- Modal Actualizar Empleado con Tabs -->
    <div class="modal fade" id="modal_actualizar_empleado" tabindex="-1" aria-labelledby="modalActualizarEmpleadoLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <form id="form_modal_actualizar_empleado">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="modalActualizarEmpleadoLabel">
                            <i class="bi bi-pencil-square me-2"></i>Actualizar Empleado
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Nav tabs -->
                        <ul class="nav nav-tabs mb-3" id="modalTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="tab-trabajador" data-bs-toggle="tab" data-bs-target="#tab_trabajador" type="button" role="tab" aria-controls="tab_trabajador" aria-selected="true">
                                    Trabajador
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-emergencia" data-bs-toggle="tab" data-bs-target="#tab_emergencia" type="button" role="tab" aria-controls="tab_emergencia" aria-selected="false">
                                    Contacto de emergencia
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
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_clave_empleado" class="form-label">Clave</label>
                                        <input type="text" class="form-control" id="modal_clave_empleado" name="clave_empleado">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_nombre_empleado" class="form-label">Nombre</label>
                                        <input type="text" class="form-control" id="modal_nombre_empleado" name="nombre_empleado">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_apellido_paterno" class="form-label">Apellido Paterno</label>
                                        <input type="text" class="form-control" id="modal_apellido_paterno" name="apellido_paterno">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_apellido_materno" class="form-label">Apellido Materno</label>
                                        <input type="text" class="form-control" id="modal_apellido_materno" name="apellido_materno">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_imss" class="form-label">IMSS</label>
                                        <input type="text" class="form-control" id="modal_imss" name="imss">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_curp" class="form-label">CURP</label>
                                        <input type="text" class="form-control" id="modal_curp" name="curp">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="modal_domicilio" class="form-label">Domicilio</label>
                                        <textarea class="form-control" id="modal_domicilio" name="domicilio" rows="2"></textarea>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_sexo" class="form-label">Sexo</label>
                                        <select class="form-select" id="modal_sexo" name="sexo">
                                            <option value="">Selecciona</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_grupo_sanguineo" class="form-label">Grupo Sanguíneo</label>
                                        <input type="text" class="form-control" id="modal_grupo_sanguineo" name="grupo_sanguineo">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                                        <input type="date" class="form-control" id="modal_fecha_nacimiento" name="fecha_nacimiento">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_num_casillero" class="form-label">Número de Casillero</label>
                                        <input type="text" class="form-control" id="modal_num_casillero" name="num_casillero" placeholder="Ej: 101 o A15">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_enfermedades_alergias" class="form-label">Enfermedades/Alergias</label>
                                        <input type="text" class="form-control" id="modal_enfermedades_alergias" name="enfermedades_alergias">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_fecha_ingreso" class="form-label">Fecha de Ingreso</label>
                                        <input type="date" class="form-control" id="modal_fecha_ingreso" name="fecha_ingreso">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <!-- Espacio vacío para mantener simetría -->
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_departamento" class="form-label">Departamento</label>
                                        <select class="form-select" id="modal_departamento" name="id_departamento">
                                            <!-- Opciones dinámicas -->
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_empresa" class="form-label">Empresa</label>
                                        <select class="form-select" id="modal_empresa" name="id_empresa">
                                            <option value="">Selecciona una empresa</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_area" class="form-label">Área</label>
                                        <select class="form-select" id="modal_area" name="id_area">
                                            <option value="">Selecciona un área</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_puesto" class="form-label">Puesto</label>
                                        <select class="form-select" id="modal_puesto" name="id_puestoEspecial">
                                            <option value="">Selecciona un puesto</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <!-- Contacto de emergencia -->
                            <div class="tab-pane fade" id="tab_emergencia" role="tabpanel" aria-labelledby="tab-emergencia">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_emergencia_nombre" class="form-label">Nombre</label>
                                        <input type="text" class="form-control" id="modal_emergencia_nombre" name="emergencia_nombre">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_emergencia_ap_paterno" class="form-label">Apellido Paterno</label>
                                        <input type="text" class="form-control" id="modal_emergencia_ap_paterno" name="emergencia_ap_paterno">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_emergencia_ap_materno" class="form-label">Apellido Materno</label>
                                        <input type="text" class="form-control" id="modal_emergencia_ap_materno" name="emergencia_ap_materno">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_emergencia_telefono" class="form-label">Teléfono</label>
                                        <input type="text" class="form-control" id="modal_emergencia_telefono" name="emergencia_telefono">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_emergencia_parentesco" class="form-label">Parentesco</label>
                                        <input type="text" class="form-control" id="modal_emergencia_parentesco" name="emergencia_parentesco">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="modal_emergencia_domicilio" class="form-label">Domicilio</label>
                                        <textarea class="form-control" id="modal_emergencia_domicilio" name="emergencia_domicilio" rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btn_cancelar" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" id="btn_actualizar" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../controllers/paginacion.js"></script>
    <script src="../controllers/config_actualizar.js"></script>
    <script src="../../public/js/validaciones.js"></script>
    <script src="<?= $rutaRaiz ?>/plugins/toasts/vanillatoasts.js""></script

</body>

</html>