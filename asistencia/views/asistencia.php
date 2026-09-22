<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asistencia</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/asistencia.css">
</head>

<body>
    <?php
    include "../../public/views/navbar.php";
    ?>

    <div class="container asistencia-container">
        <!-- Minimalist Filters Section -->
        <div class="filter-section">
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label-custom">Buscar Empleado</label>
                    <div class="search-input-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" id="inputBusqueda" class="form-control-custom w-100" placeholder="Nombre o clave...">
                        <i class="bi bi-x-circle-fill clear-search-icon d-none" id="btnClearSearch" title="Limpiar búsqueda"></i>
                    </div>
                </div>
                <div class="col-md-2">
                    <label class="form-label-custom">Área</label>
                    <select id="selectArea" class="form-select-custom w-100">
                        <option value="" selected>Todas las Áreas</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label-custom">Departamento</label>
                    <select id="selectDepartamento" class="form-select-custom w-100">
                        <option value="" selected>Todos los Departamentos</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label-custom">IMSS</label>
                    <select id="selectIMSS" class="form-select-custom w-100">
                        <option value="" selected>Todos</option>
                        <option value="1">Con Seguro</option>
                        <option value="0">Sin Seguro</option>
                    </select>
                </div>
                <div class="col-md-1 d-flex align-items-end gap-2">
                    <button id="btnLimpiar" class="btn-action w-100 justify-content-center" style="height: 40px; border-color: transparent; background: var(--soft-gray);">
                        <i class="bi bi-eraser"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Excel Actions Bar -->
        <div class="excel-actions-bar">
            <button id="btnGenerarExcel" class="btn-action btn-generate-excel">
                <i class="bi bi-file-earmark-spreadsheet"></i> Generar Excel
            </button>
        </div>

        <!-- Table Wrapper -->
        <div class="table-wrapper">
            <div class="table-responsive">
                <table class="table table-custom" id="tablaAsistencia">
                    <thead>
                        <tr>
                            <th width="50">
                                <div class="check-header">
                                    <input type="checkbox" id="checkAll" class="custom-check" title="Seleccionar página actual">
                                </div>
                            </th>
                            <th width="100">Clave</th>
                            <th>Empleado</th>
                            <th>Departamento</th>
                            <th>Área</th>
                            <th class="text-center">IMSS</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyAsistencia">
                        <!-- Los datos se cargarán dinámicamente desde index.js -->
                        <tr>
                            <td colspan="6" class="text-center p-4">
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

    <!-- Modal Configuración Excel -->
    <?php include "modalConfigExcel.php"; ?>
    <!-- Modal Previsualización Excel -->
    <?php include "modalPreviewExcel.php"; ?>

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>
    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/asistencia.js"></script>
</body>

</html>
