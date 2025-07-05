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

</head>

<body>
    <?php include("../../public/views/navbar.php"); ?>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <!-- Botón para subir archivo Excel con estilos profesionales -->
                <div class="mb-4">
                    <form method="post" action="subir_excel.php" enctype="multipart/form-data" class="row g-2 align-items-center bg-light p-3 rounded shadow-sm">
                        <div class="col-auto">
                            <label for="archivo_excel" class="form-label mb-0 fw-semibold text-success">
                                <i class="bi bi-file-earmark-excel-fill fs-3"></i> Subir archivo Excel:
                            </label>
                        </div>
                        <div class="col">
                            <input type="file" class="form-control border-success" id="archivo_excel" name="archivo_excel" accept=".xls,.xlsx" required>
                        </div>
                        <div class="col-auto">
                            <button type="submit" class="btn btn-success px-4 shadow">
                                <i class="bi bi-upload me-1"></i> Cargar Excel
                            </button>
                        </div>
                    </form>
                </div>
                <div class="card">
                    <div class="card-header text-center">
                        <span class="form-section-title justify-content-center">
                            <i class="bi bi-person-plus-fill section-icon"></i>
                            <span class="fs-4 fw-bold">Registrar Nuevo Empleado</span>
                        </span>
                    </div>
                    <div class="card-body">
                        <form method="" action="" id="form_registro_empleado">
                            <!-- Información del trabajador -->
                            <div class="form-section-title">
                                <i class="bi bi-person-badge-fill section-icon"></i>
                                <span class="fs-5 fw-semibold">Información del trabajador</span>
                            </div>
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label for="clave_trabajador" class="form-label">Clave de Empleado</label>
                                    <input type="text" class="form-control" id="clave_trabajador" name="clave_empleado">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="nombre_trabajador" class="form-label">Nombre(s)</label>
                                    <input type="text" class="form-control" id="nombre_trabajador" name="nombre" >
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
                            <div class="mb-3">
                                <label for="domicilio_trabajador" class="form-label">Domicilio</label>
                                <input type="text" class="form-control" id="domicilio_trabajador" name="domicilio">
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
                                    <label for="sexo_trabajador" class="form-label">Sexo</label>
                                    <select class="form-select" id="sexo_trabajador" name="sexo">
                                        <option value="">Selecciona</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="grupo_sanguineo_trabajador" class="form-label">Grupo Sanguíneo</label>
                                    <input type="text" class="form-control" id="grupo_sanguineo_trabajador" name="grupo_sanguineo" >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="enfermedades_alergias_trabajador" class="form-label">Enfermedades/Alergias</label>
                                <textarea class="form-control" id="enfermedades_alergias_trabajador" name="enfermedades_alergias" rows="2"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label for="departamento_trabajador" class="form-label">Departamento</label>
                                    <select class="form-select" id="departamento_trabajador" name="id_departamento">
                                        <option value="">Selecciona un departamento</option>
                                        
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="fecha_ingreso_trabajador" class="form-label">Fecha de Ingreso</label>
                                    <input type="date" class="form-control" id="fecha_ingreso_trabajador" name="fecha_ingreso">
                                </div>
                            </div>
                            <hr class="my-4">

                            <!-- En caso de emergencia -->
                            <div class="form-section-title">
                                <i class="bi bi-exclamation-triangle-fill section-icon"></i>
                                <span class="fs-5 fw-semibold">En caso de emergencia</span>
                            </div>
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
                                    <input type="text" class="form-control" id="domicilio_emergencia" name="emergencia_domicilio">
                                </div>
                            </div>
                            <!-- Botón de registro -->
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
    <script src="../controllers/leer_excel.js"></script>

</body>

</html>