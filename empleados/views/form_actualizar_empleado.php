<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Empleados</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles/actualizar_empleado.css">
</head>

<body>
    <?php include("../../public/views/navbar.php"); ?>
    <div class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div class="d-flex align-items-center gap-2">
                <select class="form-select me-2" id="filtroDepartamento" style="min-width:200px;">
                  

                </select>
                <input type="text" class="search-box me-2" placeholder="Buscar..." id="buscadorEmpleado">
                <button class="btn btn-add" id="btnAgregarEmpleado">+ Agregar Empleado</button>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" id="pestanasEstado" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-status="Todos" type="button" role="tab">Todos</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="activos-tab" data-bs-toggle="tab" data-status="Activo" type="button" role="tab">Activos</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="inactivos-tab" data-bs-toggle="tab" data-status="Inactivo" type="button" role="tab">Inactivos</button>
            </li>
        </ul>
        <!-- Tabla -->
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>Nombre / Departamento</th>
                        <th>Clave</th>
                        <th>Status</th>
                        <th class="text-end">Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaEmpleadosCuerpo">
                    <!-- Filas dinámicas -->
                </tbody>
            </table>
        </div>
        <!-- Paginación -->
        <nav class="mt-3">
            <ul class="pagination" id="paginacion">
                <!-- Paginación dinámica -->
            </ul>
        </nav>
    </div>

    <!-- Modal para actualizar información -->
    <div class="modal fade" id="modalActualizarEmpleado" tabindex="-1" aria-labelledby="modalActualizarEmpleadoLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalActualizarEmpleadoLabel">Actualizar Información del Empleado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <form id="formularioActualizarEmpleado">
                        <input type="hidden" id="actualizarClave" name="clave">
                        <div class="mb-3">
                            <label for="actualizarNombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="actualizarNombre" name="nombre" required>
                        </div>
                        <div class="mb-3">
                            <label for="actualizarDepartamento" class="form-label">Departamento</label>
                            <input type="text" class="form-control" id="actualizarDepartamento" name="departamento" required>
                        </div>
                        <div class="mb-3">
                            <label for="actualizarEstado" class="form-label">Estado</label>
                            <select class="form-select" id="actualizarEstado" name="status" required>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../controllers/paginacion.js"></script>
    <script src="../controllers/config_actualizar.js"></script>
</body>

</html>