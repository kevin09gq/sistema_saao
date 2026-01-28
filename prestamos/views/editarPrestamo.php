<?php
include __DIR__ . "/../../config/config.php";
require_once __DIR__ . '/../../conexion/conexion.php';
verificarSesion();


$id = $_GET['prestamo'] ?? null;

if (!$id) {
    header('Location: index.php');
    exit;
}

// Verificar si el préstamo tiene abonos
if ($id) {
    // Prepara la sentencia para saber si hay abonos
    $stmt = $conexion->prepare("SELECT COUNT(*) as total FROM prestamos_abonos WHERE id_prestamo = ?");
    $stmt->bind_param('i', $id);
    // Ejecuta la consulta
    $stmt->execute();
    // Obtiene el resultado
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    // Verifica si tiene abonos
    $tieneAbonos = $row['total'] > 0;

    // Si tiene abonos, muestra una alerta y redirige back
    if ($tieneAbonos) {
        echo '<script src="' . SWEETALERT . '"></script>';
        echo '<script>
            document.addEventListener("DOMContentLoaded", function() {
                Swal.fire({
                    icon: "warning",
                    title: "Préstamo con abonos",
                    text: "Este préstamo ya tiene abonos y no puede ser editado.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    window.history.back();
                });
            });
        </script>';
        exit;
    }
}


$stmt = $conexion->prepare("SELECT 
        p.id_prestamo,
        p.folio,
        p.monto AS monto_prestamo,
        DATE_FORMAT(p.fecha_registro, '%Y-%m-%d') AS fecha_registro_prestamo,
        
        
        e.id_empleado,
        CONCAT(e.id_empleado, ' - ', e.nombre, ' ', e.ap_paterno, ' ', e.ap_paterno, ' - ' , d.nombre_departamento) AS empleado,
        
        pp.id_plan,
        pp.sem_inicio AS sem_inicio_plan,
        pp.anio_inicio AS anio_inicio_plan,
        pp.sem_fin AS sem_fin_plan,
        pp.anio_fin AS anio_fin_plan,
        
        dp.id_detalle,
        dp.detalle
        
    FROM prestamos p
    INNER JOIN info_empleados e ON p.id_empleado = e.id_empleado
    INNER JOIN departamentos d ON e.id_departamento = d.id_departamento
    INNER JOIN planes_pagos pp ON pp.id_prestamo = p.id_prestamo
    INNER JOIN detalle_planes dp ON dp.id_plan = pp.id_plan
    WHERE p.id_prestamo = ?");

$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$prestamo = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar prestamo | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container">
            <div class="card shadow-sm mt-3 mb-5">
                <div class="card-body">

                    <form method="post" id="form-editar-prestamo">

                        <div class="d-flex">
                            <h4 class="card-title me-auto my-auto">Editar prestamo</h4>
                            <button type="submit" class="btn btn-success ms-auto">
                                <i class="bi bi-save2-fill"></i> Guardar Cambios
                            </button>
                            <button type="button" class="btn btn-secondary ms-2" id="btnCancelar" onclick="window.history.back();">Volver</button>
                        </div>

                        <hr>

                        <h5>Datos generales del prestamo</h5>

                        <!-- Datos generales del prestamo -->
                        <div class="row g-2 mb-4">
                            <div class="col-12 col-md-6">
                                <label for="empleado" class="form-label">Empleado</label>

                                <div class="input-group mb-3">
                                    <input type="text" class="form-control form-control-lg shadow-sm" placeholder="Nombre del empleado" id="empleado" name="empleado" required value="<?= $prestamo['empleado'] ?>">
                                    <button class="btn border border-2 shadow-sm" type="button" id="btn-limpiar-busqueda" title="Limpiar busqueda">
                                        <i class="bi bi-x-circle"></i>
                                    </button>
                                </div>

                                <!-- ID del empleado -->
                                <input type="number" name="id_empleado" id="id_empleado" required value="<?= $prestamo['id_empleado'] ?>" hidden>
                                <!-- ID del préstamo -->
                                <input type="number" name="id_prestamo" id="id_prestamo" required value="<?= $prestamo['id_prestamo'] ?>" hidden>
                                <!-- ID del plan de pago -->
                                <input type="number" name="id_plan" id="id_plan" required value="<?= $prestamo['id_plan'] ?>" hidden>
                                <!-- ID del detalle del plan -->
                                <input type="number" name="id_detalle" id="id_detalle" required value="<?= $prestamo['id_detalle'] ?>" hidden>
                            </div>

                            <div class="col-12 col-md-3">
                                <label for="folio" class="form-label">Folio</label>
                                <input value="<?= $prestamo['folio'] ?>" type="text" class="form-control form-control-lg shadow-sm" id="folio" name="folio" placeholder="Folio del prestamo" required>
                            </div>
                        </div>

                        <div class="row g-2">
                            <div class="col-12 col-md-6">
                                <label for="monto" class="form-label">Monto $</label>
                                <input value="<?= $prestamo['monto_prestamo'] ?>" type="number" class="form-control form-control-lg shadow-sm" id="monto" name="monto" placeholder="Monto del prestamo" required>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="fecha" class="form-label">Fecha</label>
                                <input value="<?= $prestamo['fecha_registro_prestamo'] ?>" type="date" class="form-control form-control-lg shadow-sm" id="fecha" name="fecha" required>
                            </div>
                        </div>

                        <!-- Seccion para el plan de pago del prestamo -->

                        <hr class="my-4">

                        <h5>Plan de pago</h5>

                        <div id="contenedor-plan-pago">
                            <div class="row g-2">
                                <!-- Duración del plan de pago -->
                                <div class="col-12 col-md-4">
                                    <label for="num_semana" class="form-label">Número de semanas</label>
                                    <input placeholder="0" type="number" id="num_semana" name="num_semana" class="form-control form-control-lg shadow-sm" min="1" value="5" required>
                                </div>

                                <!-- Monto del prestamo / duración del plan de pago -->
                                <div class="col-12 col-md-4">
                                    <label for="pago_semana" class="form-label">Pago por semana $</label>
                                    <input placeholder="0.0" type="number" id="pago_semana" name="pago_semana" class="form-control form-control-lg shadow-sm" min="0" step="0.01" required>
                                </div>

                                <!-- Semana en que inicia el pago -->
                                <div class="col-12 col-md-4">
                                    <label for="semana_inicio" class="form-label">Semana inicio</label>
                                    <select name="semana_inicio" id="semana_inicio" class="form-select form-select-lg" required>
                                        <?php
                                        for ($i = 1; $i <= 52; $i++) {
                                            echo "<option value='$i'>Semana $i</option>";
                                        }
                                        ?>
                                    </select>
                                </div>
                            </div>

                            <!-- Semana en que termina el pago = duración en semanas + semana inicio -->
                            <div class="row mt-3">
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Semana fin</label>
                                    <!-- Este input es solo para mostrar el resultado al usuario -->
                                    <input placeholder="Inicio del pago" type="text" id="semana_fin_tmp" class="form-control form-control-lg shadow-sm" readonly required>

                                    <!-- Estos inputs son los que guardan el valor real -->
                                    <input type="number" id="semana_fin" hidden>
                                    <input type="number" id="anio_fin" hidden>
                                </div>
                            </div>

                            <div id="plan_table" class="mt-3">
                                <!-- La tabla se genera dinámicamente desde JavaScript -->
                            </div>
                        </div>



                    </form>



                </div>
            </div>

        </div>

    </main>

    <!--
    * ======================================================
    * Scripts necesarios para el funcionamiento de la página
    * ======================================================
    -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>

    <script>
        // Datos del préstamo para JavaScript
        const PRESTAMO_DATA = {
            id_prestamo: <?= json_encode($prestamo['id_prestamo']) ?>,
            id_empleado: <?= json_encode($prestamo['id_empleado']) ?>,
            empleado: <?= json_encode($prestamo['empleado']) ?>,
            folio: <?= json_encode($prestamo['folio']) ?>,
            monto: <?= json_encode($prestamo['monto_prestamo']) ?>,
            fecha: <?= json_encode($prestamo['fecha_registro_prestamo']) ?>,
            // Plan de pago
            id_plan: <?= json_encode($prestamo['id_plan']) ?>,
            sem_inicio: <?= json_encode($prestamo['sem_inicio_plan']) ?>,
            anio_inicio: <?= json_encode($prestamo['anio_inicio_plan']) ?>,
            sem_fin: <?= json_encode($prestamo['sem_fin_plan']) ?>,
            anio_fin: <?= json_encode($prestamo['anio_fin_plan']) ?>,
            // Detalle del plan
            id_detalle: <?= json_encode($prestamo['id_detalle']) ?>,
            detalle: <?= $prestamo['detalle'] ?>
        };
    </script>
    <script src="../js/editarPrestamo.js"></script>


    <!-- BHL -->

</body>

</html>

<?php
$stmt->close();
$conexion->close();
