<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar abono | Sistema SAAO</title>
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

                    <form method="post" id="form-editar-abono">

                        <div class="d-flex">
                            <h4 class="card-title me-auto my-auto">Editar abono</h4>
                            <button type="submit" class="btn btn-success ms-auto">
                                <i class="bi bi-save2-fill me-2"></i>Guardar cambios
                            </button>
                            <button type="button" class="btn btn-secondary ms-2" id="btnCancelar">Cancelar</button>
                        </div>

                        <hr>



                        <div class="row gx-3">

                            <h5>Datos generales del prestamo</h5>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="empleado" class="form-label">Empleado</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="empleado" disabled>
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="folio_prestamo" class="form-label">Folio del prestamo</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="folio_prestamo" disabled>
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="fecha_asignacion" class="form-label">Fecha en que fue asignado el prestamo</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="fecha_asignacion" disabled>
                            </div>

                            <br class="my-3">

                            <h5>Datos del Abono</h5>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="monto_abono" class="form-label">Monto del Abono</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="monto_abono" name="monto_abono" required readonly>
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="semana" class="form-label">Semana</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="semana" name="semana" required readonly>
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="anio" class="form-label">Año</label>
                                <input type="text" class="form-control form-control-lg shadow-sm" id="anio" name="anio" required readonly>
                            </div>

                            <!-- Este será el unico campo que realmente se puede editar -->
                            <div class="col-12 col-md-6 mb-3">
                                <label for="fecha_pago" class="form-label">Fecha de pago</label>
                                <input type="datetime-local" class="form-control form-control-lg shadow-sm" id="fecha_pago" name="fecha_pago" required>
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

    <script src="../js/editarAbono.js"></script>

    <!-- BHL -->

</body>

</html>