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

        <!-- Calendario Estático -->
        <div class="mb-4">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                <i class="bi bi-calendar3"></i> Calendario Mayo 2026
            </h3>
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <div class="calendar-month">Mayo 2026</div>
                </div>
                <div class="calendar-grid">
                    <!-- Nombres de días -->
                    <div class="calendar-day-name">Lun</div>
                    <div class="calendar-day-name">Mar</div>
                    <div class="calendar-day-name">Mié</div>
                    <div class="calendar-day-name">Jue</div>
                    <div class="calendar-day-name">Vie</div>
                    <div class="calendar-day-name">Sáb</div>
                    <div class="calendar-day-name">Dom</div>

                    <!-- Días del mes -->
                    <div class="calendar-day">1</div>
                    <div class="calendar-day">2</div>
                    <div class="calendar-day">3</div>
                    <div class="calendar-day">4</div>
                    <div class="calendar-day vacaciones">5</div>
                    <div class="calendar-day vacaciones">6</div>
                    <div class="calendar-day vacaciones">7</div>
                    
                    <div class="calendar-day vacaciones">8</div>
                    <div class="calendar-day vacaciones">9</div>
                    <div class="calendar-day">10</div>
                    <div class="calendar-day">11</div>
                    <div class="calendar-day festivo">12</div>
                    <div class="calendar-day">13</div>
                    <div class="calendar-day">14</div>
                    
                    <div class="calendar-day today">15</div>
                    <div class="calendar-day aniversario">16</div>
                    <div class="calendar-day">17</div>
                    <div class="calendar-day">18</div>
                    <div class="calendar-day">19</div>
                    <div class="calendar-day">20</div>
                    <div class="calendar-day">21</div>
                    
                    <div class="calendar-day">22</div>
                    <div class="calendar-day">23</div>
                    <div class="calendar-day">24</div>
                    <div class="calendar-day">25</div>
                    <div class="calendar-day">26</div>
                    <div class="calendar-day">27</div>
                    <div class="calendar-day">28</div>
                    
                    <div class="calendar-day">29</div>
                    <div class="calendar-day aniversario-proximo">30</div>
                    <div class="calendar-day">31</div>
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #10b981;"></div> Vacaciones
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #f59e0b;"></div> Festivos
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #8b5cf6;"></div> Aniversario
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #c084fc; border: 1px dashed #7c3aed;"></div> Próx. Aniversario
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid var(--accent-green);"></div> Hoy
                    </div>
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