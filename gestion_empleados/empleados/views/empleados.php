<!DOCTYPE html>
<html lang="es">

<!--Incluir config.php para iniciar sesión -->
<?php
require_once  __DIR__ . "/../../../public/php/config.php";

require_once __DIR__ . "/../../../public/php/verificarSesion.php";

// Proteger esta página
verificarSesion(); 

// Verifica que tenga permiso para entrar a esta página
verificarPermiso("empleados.ver_menu");

?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Empleados</title>
    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>

    <link rel="stylesheet" href="../css/empleados.css">
    <link rel="stylesheet" href="../css/exportar_informacion.css">
</head>

<body class="bg-light">

    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    require_once  __DIR__ . "/../../../navbar/navbar.php";

    ?>

    <div class="container-fluid py-4">


        <!-- ========================================== -->
        <!-- FILTROS -->
        <!-- ========================================== -->

        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <div class="row g-3 align-items-end">

                    <!-- Área -->
                    <div class="col-md-2">

                        <label for="selectArea" class="form-label fw-semibold small text-muted">
                            Área
                        </label>

                        <select id="selectArea" class="form-select form-select-sm">

                        </select>

                    </div>

                    <!-- Departamento -->
                    <div class="col-md-2">

                        <label for="selectDepartamento" class="form-label fw-semibold small text-muted">
                            Departamento
                        </label>

                        <select id="selectDepartamento" class="form-select form-select-sm">

                        </select>

                    </div>

                    <!-- Buscar -->
                    <div class="col-md-3">

                        <label for="inputBuscar" class="form-label fw-semibold small text-muted">
                            Buscar
                        </label>

                        <input
                            type="search"
                            id="inputBuscar"
                            class="form-control form-control-sm"
                            placeholder="Nombre o clave...">

                    </div>

                    <!-- Botones principales -->
                    <div class="col-md-5">

                        <div class="d-flex gap-2 justify-content-md-end">

                            <a
                                href="../../registro/views/registro.php"
                                id="btnNuevoEmpleado"
                                class="btn btn-success btn-sm">
                                <i class="bi bi-person-add"></i> Nuevo empleado
                            </a>

                            <button
                                type="button"
                                id="btnExportar"
                                class="btn btn-outline-success btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#modal_exportar_informacion">
                                <i class="bi bi-cloud-download"></i> Exportar
                            </button>

                            <!-- Menú para ordenar -->
                            <div class="dropdown">
                                <button
                                    type="button"
                                    id="btnOrdenar"
                                    class="btn btn-outline-success btn-sm dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title="Ordenar lista de empleados">
                                    <i class="bi bi-arrow-down-up me-1"></i> Ordenar
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                    <li>
                                        <h6 class="dropdown-header text-muted small fw-bold">MAYOR A MENOR</h6>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center gap-2" onclick="ordenarEmpleados('nombre', 'desc')">
                                            <i class="bi bi-sort-alpha-up-alt text-success"></i> Nombre (Z → A)
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center gap-2" onclick="ordenarEmpleados('clave', 'desc')">
                                            <i class="bi bi-sort-numeric-up-alt text-success"></i> Clave (Mayor a menor)
                                        </button>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li>
                                        <h6 class="dropdown-header text-muted small fw-bold">MENOR A MAYOR</h6>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center gap-2" onclick="ordenarEmpleados('nombre', 'asc')">
                                            <i class="bi bi-sort-alpha-down text-secondary"></i> Nombre (A → Z)
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center gap-2" onclick="ordenarEmpleados('clave', 'asc')">
                                            <i class="bi bi-sort-numeric-down text-secondary"></i> Clave (Menor a mayor)
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- ========================================== -->
        <!-- TABLA -->
        <!-- ========================================== -->

        <div class="card border-0 shadow-sm">

            <div class="card-header bg-white py-3">

                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">


                    <!-- Status Filter Tabs -->
                    <div class="d-flex gap-1">

                        <button
                            type="button"
                            id="tabTodos"
                            class="btn btn-sm status-tab active"
                            data-status="todos">

                            Todos

                        </button>

                        <button
                            type="button"
                            id="tabActivos"
                            class="btn btn-sm status-tab"
                            data-status="activos">

                            Activos

                        </button>

                        <button
                            type="button"
                            id="tabInactivos"
                            class="btn btn-sm status-tab"
                            data-status="inactivos">

                            Inactivos

                        </button>

                    </div>

                    <!-- IMSS Filter Tabs -->
                    <div class="d-flex gap-1">

                        <button
                            type="button"
                            id="tabImssTodos"
                            class="btn btn-sm imss-tab active"
                            data-status-imss="todos">

                            IMSS: Todos

                        </button>

                        <button
                            type="button"
                            id="tabImssActivos"
                            class="btn btn-sm imss-tab"
                            data-status-imss="activos">

                            IMSS: Activos

                        </button>

                        <button
                            type="button"
                            id="tabImssInactivos"
                            class="btn btn-sm imss-tab"
                            data-status-imss="inactivos">

                            IMSS: Inactivos

                        </button>

                    </div>

                </div>

            </div>


            <div class="table-responsive">

                <table id="tablaEmpleados" class="table table-hover align-middle mb-0">

                    <thead class="table-success">

                        <tr>

                            <th class="text-center">
                                Foto
                            </th>

                            <th role="button" onclick="alternarOrden('nombre')" class="user-select-none" title="Clic para ordenar por nombre">
                                Nombre <i id="iconoOrdenNombre" class="bi bi-arrow-down-up text-muted ms-1 small"></i>
                            </th>

                            <th role="button" onclick="alternarOrden('clave')" class="user-select-none" title="Clic para ordenar por clave">
                                Clave <i id="iconoOrdenClave" class="bi bi-arrow-down-up text-muted ms-1 small"></i>
                            </th>

                            <th class="text-center">
                                NSS
                            </th>

                            <th class="text-center">
                                Status
                            </th>

                            <th class="text-center">
                                Acción
                            </th>

                        </tr>

                    </thead>


                    <tbody id="tbodyEmpleados">



                    </tbody>

                </table>

            </div>


            <!-- ========================================== -->
            <!-- PAGINACIÓN -->
            <!-- ========================================== -->

            <div class="card-footer bg-white">

                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">


                    <nav>

                        <ul id="paginacionEmpleados" class="pagination pagination-sm mb-0">

                        </ul>

                    </nav>

                </div>

            </div>

        </div>

    </div>

    <!-- Incluir Modales -->
    <?php include "modalsPerfil/modalInformacionPersonal.php"; ?>
    <?php include "modalsPerfil/modalContactoEmergencia.php"; ?>
    <?php include "modalsPerfil/modalBeneficiarios.php"; ?>
    <?php include "modalsPerfil/modalReingresos.php"; ?>
    <?php include "modalsPerfil/modalHorarios.php"; ?>
    <?php include "modalsPerfil/modalHorariosOficiales.php"; ?>
    <?php include "modalsPerfil/modalCasillerosDisponibles.php"; ?>
    <?php include "modalsPerfil/modalBiometricoDisponible.php"; ?>
    <?php include "modalsPerfil/modalClavesDisponibles.php"; ?>
    <?php include "modalsPerfil/modalActualizarFoto.php"; ?>
    <?php include "modalsPerfil/modal_exportar_informacion.php"; ?>
    <?php include "modalsPerfil/modal_previsualizar.php"; ?>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Archivo JS específico -->

    <script>
        // Pasar permisos de PHP a JavaScript
        const permisosUsuario = <?php echo json_encode($_SESSION["permisos"] ?? []); ?>;
    </script>

    <script src="<?= PERMISOS_JS ?>"></script>
    <script src="../js/modalsPerfil/permisosPerfil.js"></script>
    <script src="../js/mostrarEmpleados.js"></script>
    <script src="../js/filtroBusqueda.js"></script>
    <script src="../js/exportar_informacion.js"></script>

    <script src="../js/modalsPerfil/establecerInformacionPersonal.js"></script>
    <script src="../js/modalsPerfil/editarInformacionPersonal.js"></script>
    <script src="../js/modalsPerfil/establecerContactoEmergencia.js"></script>
    <script src="../js/modalsPerfil/establecerHorarios.js"></script>
    <script src="../js/modalsPerfil/establecerBeneficiarios.js"></script>
    <script src="../js/modalsPerfil/establecerReingresos.js"></script>
    <script src="../js/modalsPerfil/establecerHorariosOficiales.js"></script>
    <script src="../js/modalsPerfil/establecerCasillerosDisponibles.js"></script>
    <script src="../js/modalsPerfil/establecerBiometricoDisponible.js"></script>
    <script src="../js/modalsPerfil/establecerClaveDisponible.js"></script>
    <script src="../js/modalsPerfil/actualizarFoto.js"></script>
    <script src="../js/modalsPerfil/actualizarNss.js"></script>
    <script src="../js/modalsPerfil/actualizarStatusEmpleado.js"></script>
    <script src="../js/modalsPerfil/permisosPerfil.js"></script>
</body>

</html>