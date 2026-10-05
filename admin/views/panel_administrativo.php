<!DOCTYPE html>
<html lang="es">

<?php

require_once __DIR__ . "/../../public/php/config.php";

require_once __DIR__ . "/../../public/php/verificarSesion.php";

verificarSesion(); // Proteger esta página

// Verificar si el usuario tiene permiso para ver el panel administrativo
verificarPermiso("panel_admin.ver_menu"); 

?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Administrativo - CITRICOS SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Bootstrap CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../css/admin.css">
    <!-- Estilos de empleados para mantener ética de colores -->
    <link rel="stylesheet" href="../../gestion_empleados/empleados/css/empleados.css">
</head>

<body class="bg-light">

    <?php require_once __DIR__ . "/../../navbar/navbar.php"; ?>

    <div class="container-fluid py-4">

        <!-- ========================================== -->
        <!-- FILTROS Y BUSQUEDA -->
        <!-- ========================================== -->

        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <div class="row g-3 align-items-end">

                    <!-- Buscar -->
                    <div class="col-md-4">

                        <label for="inputBuscarUsuario" class="form-label fw-semibold small text-muted">
                            Buscar usuario
                        </label>

                        <input
                            type="search"
                            id="inputBuscarUsuario"
                            class="form-control form-control-sm"
                            placeholder="Nombre o correo...">

                    </div>

                    <!-- Rol -->
                    <div class="col-md-3">

                        <label for="selectRolUsuario" class="form-label fw-semibold small text-muted">
                            Rol
                        </label>

                        <select id="selectRolUsuario" class="form-select form-select-sm">
                            <option value="todos">Todos los roles</option>
                            <option value="1">Administrador</option>
                            <option value="3">Estándar</option>
                        </select>

                    </div>

                    <!-- Botón para agregar nuevo usuario -->
                    <div class="col-md-5">

                        <div class="d-flex gap-2 justify-content-md-end">

                            <button
                                type="button"
                                id="btnNuevoUsuario"
                                class="btn btn-success btn-sm">
                                <i class="bi bi-person-plus"></i> Nuevo usuario
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- ========================================== -->
        <!-- TABLA DE USUARIOS -->
        <!-- ========================================== -->

        <div class="card border-0 shadow-sm">

            <div class="card-header bg-white py-3">

                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-success bg-opacity-10 rounded p-2">
                            <i class="bi bi-people-fill text-success fs-5"></i>
                        </div>
                        <h6 class="mb-0 fw-semibold text-success">Panel Administrativo</h6>
                    </div>

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

                </div>

            </div>


            <div class="table-responsive">

                <table id="tablaUsuarios" class="table table-hover align-middle mb-0">

                    <thead class="table-success">

                        <tr>

                            <th>
                                Nombre de usuario
                            </th>

                            <th>
                                Correo electrónico
                            </th>

                            <th class="text-center">
                                Estado
                            </th>

                            <th class="text-center">
                                Acción
                            </th>

                        </tr>

                    </thead>


                    <tbody id="tbodyUsuarios">


                    </tbody>

                </table>

            </div>


            <!-- ========================================== -->
            <!-- PAGINACIÓN -->
            <!-- ========================================== -->

            <div class="card-footer bg-white py-3">

                <div class="d-flex justify-content-center">

                    <nav aria-label="Navegación de usuarios">
                        <ul class="pagination pagination-sm mb-0" id="paginacionUsuarios">
                        </ul>
                    </nav>

                </div>

            </div>
        </div>

    </div>

    <?php include "modals/modalPermisos.php"; ?>
    <?php include "modals/modalEditarInformacion.php"; ?>
    <?php include "modals/modalNuevoUsuario.php"; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Script de Panel Administrativo -->
    <script src="../js/panel_administrativo.js"></script>
    <script src="../js/filtroBusqueda.js"></script>

    <script src="../js/modals/permisos.js"></script>
    <script src="../js/modals/editarInformacion.js"></script>
    <script src="../js/modals/EliminarEmpleado.js"></script>
    <script src="../js/modals/CrearNuevoUsuario.js"></script>
</body>

</html>