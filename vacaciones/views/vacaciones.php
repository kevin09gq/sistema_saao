<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vacaciones</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/vacaciones.css">
</head>

<body>
    <?php
    include "../../public/views/navbar.php"
    ?>

    <div class="container vacation-container">
        <!-- Minimalist Filters Section -->
        <div class="filter-section">
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label-custom">Buscar Empleado</label>
                    <input type="text" id="inputBusqueda" class="form-control-custom w-100" placeholder="Nombre o clave...">
                </div>
                <div class="col-md-3">
                    <label class="form-label-custom">Área</label>
                    <select id="selectArea" class="form-select-custom w-100">
                        <option value="" selected>Todas las Áreas</option>
                        <option value="1">Campo</option>
                        <option value="2">Empaque</option>
                        <option value="3">Oficina</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label-custom">Departamento</label>
                    <select id="selectDepartamento" class="form-select-custom w-100">
                        <option value="" selected>Todos los Departamentos</option>
                        <option value="1">Administración</option>
                        <option value="2">Producción</option>
                        <option value="3">Logística</option>
                        <option value="4">Mantenimiento</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button id="btnLimpiar" class="btn-action w-100 justify-content-center" style="height: 40px; border-color: transparent; background: var(--soft-gray);">
                        <i class="bi bi-eraser"></i> Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>

        <!-- Table Wrapper -->
        <div class="table-wrapper">
            <div class="table-responsive">
                <table class="table table-custom" id="tablaVacaciones">
                    <thead>
                        <tr>
                            <th width="50">#</th>
                            <th width="100">Clave</th>
                            <th>Empleado / Departamento</th>
                            <th>Aniversario</th>
                            <th>Antigüedad</th>
                            <th class="text-center">Estatus</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyVacaciones">
                        <!-- Los datos se cargarán dinámicamente desde index.js -->
                        <tr>
                            <td colspan="7" class="text-center p-4">
                                <div class="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                                <span class="text-muted">Cargando empleados...</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Professional Pagination -->
            <div class="pagination-container">
                <div id="infoPaginacion" class="page-info">
                    <!-- Se cargará dinámicamente -->
                </div>
                <nav>
                    <ul id="paginationList" class="pagination custom-pagination mb-0">
                        <!-- Se cargará dinámicamente -->
                    </ul>
                </nav>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/index.js"></script>
</body>

</html>