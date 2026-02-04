<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo prestamo | Sistema SAAO</title>
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

                    <form method="post" id="form-nuevo-prestamo">

                        <div class="d-flex">
                            <button type="button"
                                    class="btn btn-sm btn-outline-secondary my-auto me-2"
                                    onclick="window.history.back()"
                                    ><i class="bi bi-arrow-left"></i></button>

                            <h4 class="card-title me-auto my-auto">Nuevo prestamo</h4>
                            <button type="submit" class="btn btn-success ms-auto" title="Guardar prestamo">
                                <i class="bi bi-floppy-fill me-2"></i>Guardar Prestamo
                            </button>
                        </div>

                        <hr>

                        <h5>Datos generales del prestamo</h5>

                        <!-- Datos generales del prestamo -->
                        <div class="row g-2 mb-4">
                            <div class="col-12 col-md-6">
                                <label for="empleado" class="form-label">Empleado</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="empleado" name="empleado" placeholder="Nombre del empleado" required>
                                <input type="number" name="id_empleado" id="id_empleado" hidden required>
                            </div>

                            <div class="col-12 col-md-3">
                                <label for="folio" class="form-label">Folio</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="folio" name="folio" placeholder="Folio del prestamo" required>
                            </div>
                        </div>

                        <div class="row g-2">
                            <div class="col-12 col-md-6">
                                <label for="monto" class="form-label">Monto $</label>
                                <input type="number" class="form-control form-control-lg shadow-sm" id="monto" name="monto" placeholder="Monto del prestamo" required>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="fecha" class="form-label">Fecha</label>
                                <input type="date" class="form-control form-control-lg shadow-sm" id="fecha" name="fecha" required value="<?= date('Y-m-d') ?>">
                            </div>
                        </div>

                        <!-- Alerta para decir que el empleado ya tiene adeudos -->
                        <div id="contenedor-alerta"></div>

                        <!-- Seccion para el plan de pago del prestamo -->

                        <hr class="my-4">

                        <h5>Plan de pago</h5>

                        <div id="contenedor-plan-pago">
                            <div class="row g-2">
                                <div class="col-12 col-md-2">
                                    <label for="num_semana" class="form-label">Número de semanas</label>
                                    <input placeholder="0" type="number" id="num_semana" name="num_semana" class="form-control form-control-lg shadow-sm" min="1" value="5" required>
                                </div>

                                <div class="col-12 col-md-3">
                                    <label for="pago_semana" class="form-label">Pago por semana $</label>
                                    <input placeholder="0.0" type="number" id="pago_semana" name="pago_semana" class="form-control form-control-lg shadow-sm" min="0" step="0.01" required>
                                </div>

                                <div class="col-12 col-md-4">
                                    <label for="semana_inicio" class="form-label">Semana inicio</label>
                                    <select name="semana_inicio" id="semana_inicio" class="form-select form-select-lg" required>
                                        <?php for ($i = 1; $i <= 52; $i++) : ?>
                                            <option <?= $i == date('W') ? 'selected' : '' ?> value="<?= $i ?>">Semana <?= $i ?></option>
                                        <?php endfor; ?>
                                    </select>
                                </div>

                                <div class="col-12 col-md-2">
                                    <label for="anio_inicio" class="form-label">Año inicio</label>
                                    <input placeholder="0" type="number" id="anio_inicio" name="anio_inicio" class="form-control form-control-lg shadow-sm" min="1" value="<?= date('Y') ?>" required>
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Semana fin</label>
                                    <input placeholder="Inicio del pago" type="text" id="semana_fin_tmp" class="form-control form-control-lg shadow-sm" readonly required>

                                    <input type="number" id="semana_fin" hidden>
                                    <input type="number" id="anio_fin" hidden>
                                </div>
                            </div>

                            <div id="plan_table" class="mt-3"></div>
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

    <script src="../js/nuevo.js"></script>

    <!-- BHL -->

</body>

</html>