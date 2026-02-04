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

            <!-- ====================================
            INFORMACIÓN DE LOS PRESTAMOS DEL EMPLEADO
            ===================================== -->
            <h5>Préstamos del empleado</h5>
            <div class="card shadow-sm mb-4">
                <div class="card-body">

                    <!-- <div class="d-flex justify-content-between align-items-center mb-3">

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
                    </div> -->

                    <!-- Filtros para los prestamos -->
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">

                        <!-- Lado izquierdo -->
                        <div class="d-flex align-items-center gap-2">

                            <!-- Ordenar -->
                            <div class="dropdown">
                                <button class="btn btn-sm btn-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title="Ordenar">
                                    <i class="bi bi-sort-alpha-down"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <button class="dropdown-item" id="btnMasRecientePrestamo">
                                            Más recientes
                                        </button>
                                    </li>
                                    <li>
                                        <button class="dropdown-item" id="btnMasAntiguoPrestamo">
                                            Más antiguos
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <!-- Buscar -->
                            <input type="text"
                                class="form-control form-control-sm"
                                id="busqueda_prestamo"
                                name="busqueda_prestamo"
                                placeholder="Buscar..."
                                style="max-width: 200px;">

                            <!-- Cantidad por página -->
                            <select class="form-select form-select-sm"
                                id="limite_prestamo"
                                name="limite_prestamo"
                                title="Registros por página"
                                style="width: 110px;">
                                <option value="5" selected>5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="-1">Todos</option>
                            </select>

                        </div>

                        <!-- Lado derecho -->
                        <div>
                            <a class="btn btn-sm btn-outline-primary" href="nuevo.php">
                                Nuevo
                            </a>
                        </div>

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

            <!-- ====================================
            INFORMACIÓN DE LOS ABONOS DEL EMPLEADO
            ===================================== -->
            <h5>Abonos del empleado</h5>
            <div class="card shadow-sm mb-4">
                <div class="card-body">

                    <!-- Filtros para los Abonos -->
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">

                        <!-- Lado izquierdo -->
                        <div class="d-flex align-items-center gap-2">

                            <!-- Ordenar -->
                            <div class="dropdown">
                                <button class="btn btn-sm btn-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title="Ordenar">
                                    <i class="bi bi-sort-alpha-down"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <button class="dropdown-item" id="btnMasRecienteAbono">
                                            Más recientes
                                        </button>
                                    </li>
                                    <li>
                                        <button class="dropdown-item" id="btnMasAntiguoAbono">
                                            Más antiguos
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <!-- Buscar -->
                            <input type="text"
                                class="form-control form-control-sm"
                                id="busqueda_abono"
                                name="busqueda_abono"
                                placeholder="Buscar..."
                                style="max-width: 200px;">

                            <!-- Cantidad por página -->
                            <select class="form-select form-select-sm"
                                id="limite_abono"
                                name="limite_abono"
                                title="Registros por página"
                                style="width: 110px;">
                                <option value="5" selected>5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="-1">Todos</option>
                            </select>

                        </div>

                        <!-- Lado derecho -->
                        <div>
                            <button type="button" class="btn btn-sm btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#modalAbono">
                                Abonar
                            </button>
                        </div>

                    </div>


                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th class="bg-success text-white text-center">Folio</th>
                                    <th class="bg-success text-white text-center">Semana de Abono</th>
                                    <th class="bg-success text-white text-center">Monto</th>
                                    <th class="bg-success text-white text-center">Fecha</th>
                                    <th class="bg-success text-white text-center">Observacion</th>
                                    <th class="bg-success text-white text-center">Origen</th>
                                    <th class="bg-success text-white text-center">Accion</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-abonos"></tbody>
                        </table>
                    </div>
                    <nav aria-label="Page navigation" id="paginacion-abonos"></nav>
                </div>
            </div>

            <!-- ====================================
            INFORMACIÓN DE LOS PLANES Y DETALLES
            ===================================== -->
            <h5>Planes de pago</h5>
            <div class="card shadow-sm mb-5">
                <div class="card-body">


                    <!-- Filtros para los Planes -->
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">

                        <!-- Lado izquierdo -->
                        <div class="d-flex align-items-center gap-2">

                            <!-- Ordenar -->
                            <div class="dropdown">
                                <button class="btn btn-sm btn-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title="Ordenar">
                                    <i class="bi bi-sort-alpha-down"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <button class="dropdown-item" id="btnMasRecientePlan">
                                            Más recientes
                                        </button>
                                    </li>
                                    <li>
                                        <button class="dropdown-item" id="btnMasAntiguoPlan">
                                            Más antiguos
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <!-- Buscar -->
                            <input type="text"
                                class="form-control form-control-sm"
                                id="busqueda_plan"
                                name="busqueda_plan"
                                placeholder="Buscar..."
                                style="max-width: 200px;">

                            <!-- Cantidad por página -->
                            <select class="form-select form-select-sm"
                                id="limite_plan"
                                name="limite_plan"
                                title="Registros por página"
                                style="width: 110px;">
                                <option value="5" selected>5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="-1">Todos</option>
                            </select>

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