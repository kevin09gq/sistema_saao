<!DOCTYPE html>
<?php
include("../../config/config.php");
verificarSesion();
?>
<html lang="es">


<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Empleados</title>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../styles/actualizar_empleado.css">
    <style>
        .buscador-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        .buscador-wrap .search-box {
            padding-right: 2.4rem;
        }

        .btn-clear-search {
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: #94a3b8;
            font-size: 18px;
            cursor: pointer;
        }

        .btn-clear-search:hover {
            color: #ef4444;
        }
    </style>

    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php include("../../public/views/navbar.php"); ?>
    <div class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div class="d-flex align-items-center gap-2">
                <select class="form-select me-2" id="filtroDepartamento" style="min-width:200px;">
                    <!-- Opciones dinámicas -->
                </select>
                <div class="buscador-wrap me-2">
                    <input type="text" class="search-box" placeholder="Buscar..." id="buscadorEmpleado">
                    <button type="button" id="btn-clear-buscador-empleado" class="btn-clear-search" title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
                <button class="btn btn-add" id="btnAgregarEmpleado">
                    <a href="form_registro.php" style="text-decoration: none">+ Agregar Empleado</a>
                </button>
            </div>
            <!-- Dropdown para ordenamiento -->
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownOrdenamiento" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-sort-alpha-down"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownOrdenamiento">
                    <li><button class="dropdown-item" id="ordenNombreAsc">Nombre Ascendente</button></li>
                    <li><button class="dropdown-item" id="ordenNombreDesc">Nombre Descendente</button></li>
                    <li><button class="dropdown-item" id="ordenClaveAsc">Clave Ascendente</button></li>
                    <li><button class="dropdown-item" id="ordenClaveDesc">Clave Descendente</button></li>
                </ul>
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
                        <th>NSS</th>
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
        <div class="modal-dialog modal-xl">
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
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-reingresos" data-bs-toggle="tab" data-bs-target="#tab_reingresos" type="button" role="tab" aria-controls="tab_reingresos" aria-selected="false">
                                    Reingresos
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-beneficiarios" data-bs-toggle="tab" data-bs-target="#tab_beneficiarios" type="button" role="tab" aria-controls="tab_beneficiarios" aria-selected="false">
                                    Beneficiarios
                                </button>
                            </li>

                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-horarios" data-bs-toggle="tab" data-bs-target="#tab_horarios" type="button" role="tab" aria-controls="tab_horarios" aria-selected="false">
                                    Horarios
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tab-horarios-oficiales" data-bs-toggle="tab" data-bs-target="#tab_horarios_oficiales" type="button" role="tab" aria-controls="tab_horarios_oficiales" aria-selected="false">
                                    Horarios Oficiales
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
                                        <label for="modal_rfc" class="form-label">RFC</label>
                                        <input type="text" class="form-control" id="modal_rfc" name="rfc" placeholder="Ej: ABCD123456E78">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_estado_civil" class="form-label">Estado Civil</label>
                                        <select class="form-select" id="modal_estado_civil" name="estado_civil">
                                            <option value="">Selecciona</option>
                                            <option value="SOLTERO">Soltero/a</option>
                                            <option value="CASADO">Casado/a</option>
                                            <option value="DIVORCIADO">Divorciado/a</option>
                                            <option value="VIUDO">Viudo/a</option>
                                            <option value="UNION_LIBRE">Unión Libre</option>

                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_num_casillero" class="form-label">Número de Casillero</label>
                                        <div class="input-group">
                                            <button class="btn btn-outline-info" type="button" id="btnAbrirCasilleroEmpleado" title="Seleccionar casillero">
                                                <i class="bi bi-inbox"></i>
                                            </button>
                                            <input type="text" class="form-control" id="modal_num_casillero" name="num_casillero" placeholder="Ej: 101 o A15">
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_biometrico" class="form-label">Biométrico</label>
                                        <input type="number" class="form-control" id="modal_biometrico" name="biometrico" min="0" placeholder="ID biométrico">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_telefono_empleado" class="form-label">Teléfono</label>
                                        <input type="text" class="form-control" id="modal_telefono_empleado" name="telefono_empleado" placeholder="Teléfono del empleado">
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
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_salario_semanal" class="form-label">Salario Semanal</label>
                                        <input type="number" step="0.01" class="form-control" id="modal_salario_semanal" name="salario_semanal" placeholder="0.00">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="modal_salario_diario" class="form-label">Salario Diario</label>
                                        <input type="number" step="0.01" class="form-control" id="modal_salario_diario" name="salario_diario" placeholder="0.00">
                                    </div>
                                </div>

                                <div class="row px-3">
                                    <div class="col-md-6 form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch" id="modal_switchCheckHorarioFijo" checked>
                                        <label class="form-check-label" for="modal_switchCheckHorarioFijo">Horario fijo</label>
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

                            <!-- Reingresos -->
                            <div class="tab-pane fade" id="tab_reingresos" role="tabpanel" aria-labelledby="tab-reingresos">
                                <div class="mb-3">
                                    <h6>Historial de Reingresos y Salidas</h6>
                                    <table class="table table-bordered table-sm" id="tabla_historial_reingresos">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Fecha de Reingreso</th>
                                                <th>Fecha Baja</th>
                                                <th>Acciones</th>

                                            </tr>
                                        </thead>
                                        <tbody id="tbody_historial_reingresos">

                                        </tbody>
                                    </table>
                                    <button type="button" class="btn btn-outline-primary btn-sm mt-3" id="btn_nuevo_reingreso">
                                        <i class="bi bi-plus-circle"></i> Nuevo reingreso
                                    </button>
                                </div>
                            </div>

                            <!-- Beneficiarios -->
                            <div class="tab-pane fade" id="tab_beneficiarios" role="tabpanel" aria-labelledby="tab-beneficiarios">
                                <div class="row">
                                    <div class="col-12">
                                        <h6 class="mb-3">Beneficiarios</h6>
                                        <table class="table table-bordered table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Apellido Paterno</th>
                                                    <th>Apellido Materno</th>
                                                    <th>Parentesco</th>
                                                    <th>Porcentaje (%)</th>
                                                    <th style="width: 80px;">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody_beneficiarios">
                                                <?php for ($i = 1; $i <= 5; $i++): ?>
                                                    <tr>
                                                        <td>
                                                            <input type="text" class="form-control" name="beneficiario_nombre[]" placeholder="Nombre">
                                                        </td>
                                                        <td>
                                                            <input type="text" class="form-control" name="beneficiario_ap_paterno[]" placeholder="Apellido Paterno">
                                                        </td>
                                                        <td>
                                                            <input type="text" class="form-control" name="beneficiario_ap_materno[]" placeholder="Apellido Materno">
                                                        </td>
                                                        <td>
                                                            <input type="text" class="form-control" name="beneficiario_parentesco[]" placeholder="Parentesco">
                                                        </td>
                                                        <td>
                                                            <input type="number" class="form-control porcentaje-beneficiario text-center" name="beneficiario_porcentaje[]" placeholder="%" min="0" max="100" step="1">
                                                        </td>
                                                        <td class="text-center">
                                                            <button type="button" class="btn btn-danger btn-sm btn-eliminar-beneficiario" title="Limpiar fila">
                                                                <i class="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                <?php endfor; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="row mt-4">
                                    <div class="col-md-4 offset-md-8">
                                        <div class="input-group">
                                            <span class="input-group-text">Total Porcentaje</span>
                                            <input type="number" class="form-control text-center" id="total_porcentaje_beneficiarios" readonly>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Horarios -->
                            <div class="tab-pane fade" id="tab_horarios" role="tabpanel" aria-labelledby="tab-horarios">
                                <div class="row">
                                    <div class="col-12">
                                        <h6 class="mb-3">Horarios de reloj checador</h6>

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

                                        <div class="table-responsive">
                                            <table class="table table-bordered table-hover">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Día</th>
                                                        <th>Entrada</th>
                                                        <th>Salida Comida</th>
                                                        <th>Entrada Comida</th>
                                                        <th>Salida</th>
                                                        <th>Acciones</th>
                                                        <th>¿Descanso?</th>
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
                                                                <button type="button" class="d-inline btn btn-danger btn-sm btn-eliminar-horario" title="Limpiar fila">
                                                                    <i class="bi bi-trash"></i>
                                                                </button>

                                                            </td>
                                                            <td class="text-center">
                                                                <!-- valor por defecto -->
                                                                <div class="d-inline form-check form-switch d-inline-flex align-items-center">
                                                                    <input
                                                                        class="form-check-input chk-descanso"
                                                                        type="checkbox"
                                                                        name="horario_descanso[]"
                                                                        value="1">
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    <?php endfor; ?>
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <!-- Horarios Oficiales -->
                            <div class="tab-pane fade" id="tab_horarios_oficiales" role="tabpanel" aria-labelledby="tab-horarios-oficiales">
                                <div class="row">
                                    <div class="col-12">
                                        <h6 class="mb-3">Horarios Oficiales</h6>
                                        <div class="mb-4">
                                            <div class="row g-2">
                                                <div class="col">
                                                    <label class="form-label" for="ref_of_entrada">Entrada</label>
                                                    <input type="time" id="ref_of_entrada" class="form-control" placeholder="Entrada">
                                                </div>
                                                <div class="col">
                                                    <label class="form-label" for="ref_of_salida_comida">Salida Comida</label>
                                                    <input type="time" id="ref_of_salida_comida" class="form-control" placeholder="Salida Comida">
                                                </div>
                                                <div class="col">
                                                    <label class="form-label" for="ref_of_entrada_comida">Entrada Comida</label>
                                                    <input type="time" id="ref_of_entrada_comida" class="form-control" placeholder="Entrada Comida">
                                                </div>
                                                <div class="col">
                                                    <label class="form-label" for="ref_of_salida">Salida</label>
                                                    <input type="time" id="ref_of_salida" class="form-control" placeholder="Salida">
                                                </div>
                                                <div class="col-auto">
                                                    <label class="form-label" for="btnCopiarHorariosOficiales">&ensp;</label><br>
                                                    <button type="button" id="btnCopiarHorariosOficiales" class="btn btn-primary my-auto" title="Copiar horarios oficiales"><i class="bi bi-copy"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-bordered table-hover">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Día</th>
                                                        <th>Entrada</th>
                                                        <th>Salida Comida</th>
                                                        <th>Entrada Comida</th>
                                                        <th>Salida</th>
                                                        <th style="width: 80px;">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody_horarios_oficiales">
                                                    <?php for ($i = 1; $i <= 7; $i++): ?>
                                                        <tr>
                                                            <td>
                                                                <!-- <input type="text" class="form-control" name="horario_oficial_dia[]" placeholder="Día"> -->
                                                                <select class="form-select" name="horario_oficial_dia[]">
                                                                    <option selected value="">Seleccionar...</option>

                                                                    <?php foreach (DIAS_SEMANA as $dia): ?>
                                                                        <option value="<?php echo $dia; ?>"><?php echo $dia; ?></option>
                                                                    <?php endforeach; ?>

                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input type="time" class="form-control" name="horario_oficial_entrada[]" placeholder="Entrada">
                                                            </td>
                                                            <td>
                                                                <input type="time" class="form-control" name="horario_oficial_salida_comida[]" placeholder="Salida Comida">
                                                            </td>
                                                            <td>
                                                                <input type="time" class="form-control" name="horario_oficial_entrada_comida[]" placeholder="Entrada Comida">
                                                            </td>
                                                            <td>
                                                                <input type="time" class="form-control" name="horario_oficial_salida[]" placeholder="Salida">
                                                            </td>
                                                            <td class="text-center">
                                                                <button type="button" class="btn btn-danger btn-sm btn-eliminar-horario-oficial" title="Limpiar fila">
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
                    <div class="modal-footer">
                        <span class="badge fs-6 bg-success me-auto" id="label-nombre-empleado"></span>

                        <button type="button" id="btn_cancelar" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" id="btn_actualizar" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="modal fade" id="modal_historial_reingreso" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reingreso</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="modal_hist_id_historial">
                    <div class="mb-3">
                        <label for="modal_hist_fecha_reingreso" class="form-label">Fecha de reingreso</label>
                        <input type="date" class="form-control" id="modal_hist_fecha_reingreso">
                    </div>
                    <div class="mb-3">
                        <label for="modal_hist_fecha_salida" class="form-label">Fecha de baja</label>
                        <input type="date" class="form-control" id="modal_hist_fecha_salida">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btn_guardar_historial">Guardar</button>
                </div>
            </div>
        </div>
    </div>
    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="../controllers/paginacion.js"></script>
    <script src="../controllers/config_actualizar.js"></script>
    <script src="../controllers/casillero_empleado.js"></script>
    <script src="../../public/js/validaciones.js"></script>