<!DOCTYPE html>
<html lang="es">

<?php
include "../../config/config.php";
verificarSesion(); // Proteger esta página
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
</head>

<body class="bg-light">

    <?php include "../../public/views/navbar.php"; ?>

    <div class="container-fluid py-4">

        <!-- ========================================== -->
        <!-- FILTROS -->
        <!-- ========================================== -->

        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <div class="row g-3 align-items-end">

                    <!-- Buscar -->
                    <div class="col-md-4">

                        <label for="inputBuscarUsuario" class="form-label fw-semibold small text-muted">
                            Buscar
                        </label>

                        <input
                            type="search"
                            id="inputBuscarUsuario"
                            class="form-control form-control-sm"
                            placeholder="Nombre o correo...">

                    </div>

                    <!-- Filtro por Rol -->
                    <div class="col-md-3">

                        <label for="filtroRol" class="form-label fw-semibold small text-muted">
                            Rol
                        </label>

                        <select class="form-select form-select-sm" id="filtroRol">
                            <option value="todos">Todos los Roles</option>
                            <option value="1">Solo Administradores</option>
                            <option value="2">Solo Estándar</option>
                        </select>

                    </div>

                    <!-- Botones principales -->
                    <div class="col-md-5">

                        <div class="d-flex gap-2 justify-content-md-end">

                            <button
                                type="button"
                                class="btn btn-success btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#modalCrearUsuario">
                                <i class="bi bi-person-plus"></i> Nuevo Usuario
                            </button>

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

                    <!-- Título -->
                    <div>
                        <h5 class="mb-0 text-dark fw-semibold">
                            <i class="bi bi-shield-lock-fill text-success me-2"></i>
                            Usuarios del Sistema
                        </h5>
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

                <table class="table table-hover align-middle mb-0">

                    <thead class="table-success">

                        <tr>

                            <th class="ps-4">
                                ID
                            </th>

                            <th>
                                Usuario / Correo
                            </th>

                            <th>
                                Rol
                            </th>

                            <th class="text-center">
                                Estado
                            </th>

                            <th class="text-center pe-4">
                                Acción
                            </th>

                        </tr>

                    </thead>


                    <tbody id="tbodyUsuarios">

                        <tr>
                            <td colspan="5" class="text-center py-4">
                                <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                Cargando usuarios...
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

    <?php include "modals/modalPermisos.php"; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Script de Panel Administrativo -->
    <script src="../js/panel_administrativo.js"></script>
    <script src="../js/filtroBusqueda.js"></script>

    <script src="../js/modals/permisos.js"></script>

</body>

</html>