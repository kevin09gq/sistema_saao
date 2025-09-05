<!DOCTYPE html>
<html lang="es">

<?php
include("../../config/config.php");
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar Empleado</title>
    <!-- Bootstrap CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Iconos Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../../public/styles/main.css">
    <link rel="stylesheet" href="../styles/registro_styles.css">
     <link rel="stylesheet" href="<?= $rutaRaiz ?>/plugins/toasts/vanillatoasts.css">
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
                                            <label for="curp_trabajador" class="form-label">CURP</label>
                                            <input type="text" class="form-control" id="curp_trabajador" name="curp">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="grupo_sanguineo_trabajador" class="form-label">Grupo Sanguíneo</label>
                                            <input type="text" class="form-control" id="grupo_sanguineo_trabajador" name="grupo_sanguineo">
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label for="num_casillero" class="form-label">Número de Casillero</label>
                                            <input type="text" class="form-control" id="num_casillero" name="num_casillero" placeholder="Ej: 101 o A15">
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
                            </div>

                            <!-- Botones de acción -->
                            <div class="mt-4 text-center">
                                <button type="submit" class="btn btn-success btn-lg px-5 me-2" id="btn_registrar_empleado">
                                    <i class="bi bi-person-check-fill me-2"></i>
                                    Registrar Empleado
                                </button>
                                <a href="../index.php" class="btn btn-danger btn-lg px-5">
                                    <i class="bi bi-x-circle-fill me-2"></i>
                                    Cancelar
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- JS personalizados -->
    <script src="../../public/js/validaciones.js"></script>
    <script src="../controllers/registro_empleado.js"></script>
     <script src="<?= $rutaRaiz ?>/plugins/toasts/vanillatoasts.js""></script

</body>

</html>