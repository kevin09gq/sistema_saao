<!DOCTYPE html>
<html lang="es">

<?php
include("../../config/config.php");
verificarSesion();
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar Empleado</title>
    <!-- Bootstrap CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../../public/styles/main.css">
    <link rel="stylesheet" href="../styles/registro_styles.css">

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php include("../../public/views/navbar.php"); ?>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <!-- Formulario para subir archivo Excel -->


                <div class="card">
                    <div class="card-header text-center bg-primary text-white">
                        <span class="form-section-title justify-content-center">
                            <i class="bi bi-person-plus-fill section-icon fs-3 me-2"></i>
                            <span class="fs-5 fw-semibold titulo-empleado">Registrar Nuevo Empleado</span>
                        </span>
                    </div>
                    <div class="card-body">
                        <form method="" action="" id="form_registro_empleado">
                            <!-- Nav tabs -->
                            <ul class="nav nav-tabs mb-4" id="registroTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="tab-trabajador" data-bs-toggle="tab" data-bs-target="#tab_trabajador" type="button" role="tab" aria-controls="tab_trabajador" aria-selected="true">
                                        <i class="bi bi-person-badge-fill me-2"></i>Información del Trabajador
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="tab-emergencia" data-bs-toggle="tab" data-bs-target="#tab_emergencia" type="button" role="tab" aria-controls="tab_emergencia" aria-selected="false">
                                        <i class="bi bi-exclamation-triangle-fill me-2"></i>Contacto de Emergencia
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="tab-beneficiarios" data-bs-toggle="tab" data-bs-target="#tab_beneficiarios" type="button" role="tab" aria-controls="tab_beneficiarios" aria-selected="false">
                                        <i class="bi bi-people-fill me-2"></i>Beneficiarios
                                    </button>
                                </li>

                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="tab-horarios" data-bs-toggle="tab" data-bs-target="#tab_horarios" type="button" role="tab" aria-controls="tab_horarios" aria-selected="false">
                                        <i class="bi bi-people-fill me-2"></i>Horarios
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="tab-horarios-oficiales" data-bs-toggle="tab" data-bs-target="#tab_horarios_oficiales" type="button" role="tab" aria-controls="tab_horarios_oficiales" aria-selected="false">
                                        <i class="bi bi-calendar-check me-2"></i>Horarios Oficiales
                                    </button>
                                </li>
                            </ul>

                            <!-- Tab content -->
                            <div class="tab-content" id="registroTabsContent">

                                <!-- Tab Información del trabajador -->
                                <div class="tab-pane fade show active" id="tab_trabajador" role="tabpanel" aria-labelledby="tab-trabajador">
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="clave_trabajador" class="form-label">Clave de Empleado</label>
                                            <input type="text" class="form-control" id="clave_trabajador" name="clave_empleado">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="nombre_trabajador" class="form-label">Nombre(s)</label>
                                            <input type="text" class="form-control" id="nombre_trabajador" name="nombre">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="apellido_paterno" class="form-label">Apellido Paterno</label>
                                            <input type="text" class="form-control" id="apellido_paterno" name="ap_paterno">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="apellido_materno" class="form-label">Apellido Materno</label>
                                            <input type="text" class="form-control" id="apellido_materno" name="ap_materno">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="domicilio_trabajador" class="form-label">Domicilio</label>
                                            <textarea class="form-control" id="domicilio_trabajador" name="domicilio" rows="2"></textarea>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                                            <input type="date" class="form-control" id="fecha_nacimiento" name="fecha_nacimiento">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="sexo_trabajador" class="form-label">Sexo</label>
                                            <select class="form-select" id="sexo_trabajador" name="sexo">
                                                <option value="">Selecciona</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="imss_trabajador" class="form-label">IMSS</label>
                                            <input type="text" class="form-control" id="imss_trabajador" name="imss">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="status_nss" class="form-label">Estatus NSS</label>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="status_nss" name="status_nss" disabled>
                                                <label class="form-check-label" for="status_nss">Activo</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="curp_trabajador" class="form-label">CURP</label>
                                            <input type="text" class="form-control" id="curp_trabajador" name="curp">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="grupo_sanguineo_trabajador" class="form-label">Grupo Sanguíneo</label>
                                            <input type="text" class="form-control" id="grupo_sanguineo_trabajador" name="grupo_sanguineo">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="rfc_trabajador" class="form-label">RFC</label>
                                            <input type="text" class="form-control" id="rfc_trabajador" name="rfc" placeholder="Ej: ABCD123456E78">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="estado_civil_trabajador" class="form-label">Estado Civil</label>
                                            <select class="form-select" id="estado_civil_trabajador" name="estado_civil">
                                                <option value="">Selecciona</option>
                                                <option value="SOLTERO">Soltero/a</option>
                                                <option value="CASADO">Casado/a</option>
                                                <option value="DIVORCIADO">Divorciado/a</option>
                                                <option value="VIUDO">Viudo/a</option>
                                                <option value="UNION_LIBRE">Unión Libre</option>

                                            </select>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="num_casillero" class="form-label">Número de Casillero</label>
                                            <div class="input-group">
                                                <button class="btn btn-outline-info" type="button" id="btnAbrirCasilleroRegistro" title="Seleccionar casillero">
                                                    <i class="bi bi-inbox"></i>
                                                </button>
                                                <input type="text" class="form-control" id="num_casillero" name="num_casillero" placeholder="Ej: 101 o A15">
                                            </div>
                                        </div>

                                        <div class="col-md-3 mb-3">
                                            <label for="biometrico" class="form-label">Biométrico</label>
                                            <input type="number" class="form-control" id="biometrico" name="biometrico" min="0" placeholder="ID biométrico">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="telefono_empleado" class="form-label">Teléfono</label>
                                            <input type="number" class="form-control" id="telefono_empleado" name="telefono_empleado" min="0" placeholder="Teléfono">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="empresa_trabajador" class="form-label">Empresa</label>
                                            <select class="form-select" id="empresa_trabajador" name="id_empresa">
                                                <option value="">Selecciona una empresa</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="enfermedades_alergias_trabajador" class="form-label">Enfermedades/Alergias</label>
                                            <textarea class="form-control" id="enfermedades_alergias_trabajador" name="enfermedades_alergias" rows="2"></textarea>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="area_trabajador" class="form-label">Área</label>
                                            <select class="form-select" id="area_trabajador" name="id_area">
                                                <option value="">Selecciona un área</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="departamento_trabajador" class="form-label">Departamento</label>
                                            <select class="form-select" id="departamento_trabajador" name="id_departamento">
                                                <option value="">Selecciona un departamento</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="puesto_trabajador" class="form-label">Puesto</label>
                                            <select class="form-select" id="puesto_trabajador" name="id_puesto">
                                                <option value="">Selecciona un puesto</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="fecha_ingreso_trabajador" class="form-label">Fecha de Ingreso</label>
                                            <input type="date" class="form-control" id="fecha_ingreso_trabajador" name="fecha_ingreso">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="salario_semanal" class="form-label">Salario Semanal</label>
                                            <input type="number" class="form-control" id="salario_semanal" name="salario_semanal" step="0.01" placeholder="0.00">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="salario_diario" class="form-label">Salario Diario</label>
                                            <input type="number" class="form-control" id="salario_diario" name="salario_diario" step="0.01" placeholder="0.00">
                                        </div>
                                    </div>
                                    <div class="row px-3">
                                        <div class="col-md-6 form-check form-switch">
                                            <input class="form-check-input" type="checkbox" role="switch" id="switchCheckHorarioFijo" checked>
                                            <label class="form-check-label" for="switchCheckHorarioFijo">Horario fijo</label>
                                        </div>
                                    </div>

                                </div>

                                <!-- Tab Contacto de emergencia -->
                                <div class="tab-pane fade" id="tab_emergencia" role="tabpanel" aria-labelledby="tab-emergencia">
                                    <div class="row">
                                        <div class="col-md-3 mb-3">
                                            <label for="nombre_emergencia" class="form-label">Nombre</label>
                                            <input type="text" class="form-control" id="nombre_emergencia" name="emergencia_nombre">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="ap_paterno_emergencia" class="form-label">Apellido Paterno</label>
                                            <input type="text" class="form-control" id="ap_paterno_emergencia" name="emergencia_ap_paterno">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="ap_materno_emergencia" class="form-label">Apellido Materno</label>
                                            <input type="text" class="form-control" id="ap_materno_emergencia" name="emergencia_ap_materno">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="parentesco_emergencia" class="form-label">Parentesco</label>
                                            <input type="text" class="form-control" id="parentesco_emergencia" name="emergencia_parentesco">
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="telefono_emergencia" class="form-label">Teléfono</label>
                                            <input type="text" class="form-control" id="telefono_emergencia" name="emergencia_telefono">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="domicilio_emergencia" class="form-label">Domicilio</label>
                                            <textarea class="form-control" id="domicilio_emergencia" name="emergencia_domicilio" rows="2"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab Beneficiarios -->
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

                                <!-- Tab Horarios -->
                                <div class="tab-pane fade" id="tab_horarios" role="tabpanel" aria-labelledby="tab-horarios">
                                    <div class="row">
                                        <div class="col-12">
                                            <h6 class="mb-3">Horarios Reloj Checador</h6>
                                            <table class="table table-bordered table-hover">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Día</th>
                                                        <th>Entrada</th>
                                                        <th>Salida Comida</th>
                                                        <th>Entrada Comida</th>
                                                        <th>Salida</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody_horarios">
                                                    <?php for ($i = 1; $i <= 7; $i++): ?>
                                                        <tr>
                                                            <td>
                                                                <input type="text" class="form-control" name="horario_dia[]" placeholder="Día">
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
                                                        </tr>
                                                    <?php endfor; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane fade" id="tab_horarios_oficiales" role="tabpanel" aria-labelledby="tab-horarios-oficiales">
                                    <div class="row">
                                        <div class="col-12">
                                            <h6 class="mb-3">Horarios Oficiales</h6>
                                            <table class="table table-bordered table-hover">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Día</th>
                                                        <th>Entrada</th>
                                                        <th>Salida Comida</th>
                                                        <th>Entrada Comida</th>
                                                        <th>Salida</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="tbody_horarios_oficiales">
                                                    <?php for ($i = 1; $i <= 7; $i++): ?>
                                                        <tr>
                                                            <td>
                                                                <input type="text" class="form-control" name="horario_oficial_dia[]" placeholder="Día">
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
                                                        </tr>
                                                    <?php endfor; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Botones de acción -->
                            <div class="mt-4 text-center">
                                <button type="submit" class="btn btn-success btn-lg px-5 me-2" id="btn_registrar_empleado">
                                    <i class="bi bi-person-check-fill me-2"></i>
                                    Registrar Empleado
                                </button>
                                <button type="button" class="btn btn-danger btn-lg px-5" id="btn_cancelar_form">
                                    <i class="bi bi-x-circle-fill me-2"></i>
                                    Cancelar
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- JS personalizados -->
    <script src="../../public/js/validaciones.js"></script>
    <script src="../controllers/registro_empleado.js"></script>
    <script src="../controllers/casillero_registro.js"></script>


</body>

</html>