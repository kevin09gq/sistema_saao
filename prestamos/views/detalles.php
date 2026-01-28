<?php
include __DIR__ . "/../../config/config.php";

verificarSesion();

$id = $_GET['id_empleado'] ?? null;

if (!$id) {
    header('Location: index.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Título de la página -->
    <title>Detalles del Prestamo | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container">

            <div class="d-flex">
                <button type="button" class="btn btn-sm btn-outline-secondary me-2 my-auto" onclick="window.history.back();" title="Regresar..."><i class="bi bi-arrow-left"></i></button>
                <h3 class="my-3">Detalles del Prestamo</h3>
            </div>


            <!-- iNFORMACIÓN DEL EMPLEADO -->
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h5 class="mb-3">Información general</h5>
                    <div class="row g-3" id="detalle-empleado">
                        <div class="col-12 col-md-6">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Empleado</div>
                                <div id="detalle-empleado-nombre">-</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Clave</div>
                                <div id="detalle-empleado-clave">-</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Departamento</div>
                                <div id="detalle-empleado-departamento">-</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Empresa</div>
                                <div id="detalle-empleado-empresa">-</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Histórico prestado</div>
                                <div id="detalle-historico-total">$ 0.00</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3">
                            <div class="border rounded p-3 bg-white shadow-sm">
                                <div class="fw-semibold">Deuda activa</div>
                                <div id="detalle-historico-deuda">$ 0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- INFORMACIÓN DE LOS PRESTAMOS DEL EMPLEADO -->
            <div class="card shadow-sm mb-4">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center mb-3">

                        <h5 class="me-auto">Préstamos del empleado</h5>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Filtro">
                                <i class="bi bi-sort-alpha-down"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <button class="dropdown-item" id="btnMasRecientePrestamo">Más Recientes</button>
                                </li>
                                <li>
                                    <button class="dropdown-item" id="btnMasAntiguoPrestamo">Más Antiguos</button>
                                </li>
                            </ul>
                        </div>
                        <a class="btn btn-sm btn-outline-primary ms-2" href="nuevo.php">Nuevo</a>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th class="bg-success text-white text-center">Folio</th>
                                    <th class="bg-success text-white text-center">Monto</th>
                                    <th class="bg-success text-white text-center">Abonado</th>
                                    <th class="bg-success text-white text-center">Deuda</th>
                                    <th class="bg-success text-white text-center">Estado</th>
                                    <th class="bg-success text-white text-center">Fecha</th>
                                    <th class="bg-success text-white text-center">Opcion</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-prestamos">
                            </tbody>
                        </table>
                    </div>
                    <nav aria-label="Page navigation" id="paginacion-prestamos"></nav>
                </div>
            </div>

            <!-- INFORMACIÓN DE LOS ABONOS DEL EMPLEADO -->
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="me-auto">Abonos del empleado</h5>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Filtro">
                                <i class="bi bi-sort-alpha-down"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <button class="dropdown-item" id="btnMasRecienteAbono">Más Recientes</button>
                                </li>
                                <li>
                                    <button class="dropdown-item" id="btnMasAntiguoAbono">Más Antiguos</button>
                                </li>
                            </ul>
                        </div>
                        <!-- Button trigger modal -->
                        <button type="button" class="btn btn-sm btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#modalAbono">
                            Abonar
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th class="bg-success text-white text-center">Folio</th>
                                    <th class="bg-success text-white text-center">Semana de Abono</th>
                                    <th class="bg-success text-white text-center">Monto</th>
                                    <th class="bg-success text-white text-center">Fecha</th>
                                    <th class="bg-success text-white text-center">Origen</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-abonos"></tbody>
                        </table>
                    </div>
                    <nav aria-label="Page navigation" id="paginacion-abonos"></nav>
                </div>
            </div>

            <!-- INFORMACIÓN DE LOS PLANES DE PAGO DEL EMPLEADO -->
            <div class="card shadow-sm mb-5">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="me-auto">Planes de pago</h5>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Filtro">
                                <i class="bi bi-sort-alpha-down"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <button class="dropdown-item" id="btnMasRecientePlan">Más Recientes</button>
                                </li>
                                <li>
                                    <button class="dropdown-item" id="btnMasAntiguoPlan">Más Antiguos</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th class="bg-success text-white text-center">Folio</th>
                                    <th class="bg-success text-white text-center">Semana Inicio</th>
                                    <th class="bg-success text-white text-center">Semana Fin</th>
                                    <th class="bg-success text-white text-center">Fecha registro</th>
                                    <th class="bg-success text-white text-center">Opcion</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-planes"></tbody>
                        </table>
                    </div>
                    <nav aria-label="Page navigation" id="paginacion-planes"></nav>
                </div>
            </div>

        </div>

    </main>

    <?php require_once __DIR__ . '/modal_detalles_plan.php'; ?>
    <?php require_once __DIR__ . '/modal_nuevo_abono.php'; ?>
    <?php require_once __DIR__ . '/modal_seleccionar_detalle.php'; ?>

    <!--
    * ======================================================
    * Scripts necesarios para el funcionamiento de la página
    * ======================================================
    -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>

    <script>
        window.ID_EMPLEADO_DETALLES = <?= (int)$id ?>;
    </script>

    <script src="../js/detalles.js"></script>

</body>

</html>