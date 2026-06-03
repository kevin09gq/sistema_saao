<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kardex de Vacaciones</title>
    <?php
    include "../../config/config.php";
    verificarSesion();
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/kardex.css">
    <link rel="stylesheet" href="../css/calendario.css">
    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <?php include "../../public/views/navbar.php" ?>

    <div class="container kardex-container">
        <!-- Navegación Superior / Acciones -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <a href="vacaciones.php" class="btn-back" id="btnVolver">
                <i class="bi bi-arrow-left"></i> Volver al listado
            </a>
            <button class="btn-download" id="btnRestaurar" style="background: #dc2626; margin-left: 10px;">
                <i class="bi bi-arrow-counterclockwise"></i> Restaurar Todo
            </button>
        </div>

        <!-- Encabezado: Información del Empleado -->
        <div class="kardex-header">
            <div class="emp-profile">
                <div class="emp-avatar-large" id="avatarEmpleado"></div>
                <div>
                    <h1 class="emp-name-title" id="nombreEmpleado"></h1>
                    <div class="emp-meta">
                        <span><i class="bi bi-hash"></i> <strong>Clave:</strong> <span id="claveEmpleado"></span></span>
                        <span><i class="bi bi-briefcase"></i> <strong>Depto:</strong> <span
                                id="deptoEmpleado"></span></span>
                        <span><i class="bi bi-calendar3"></i> <strong>Ingreso:</strong> <span
                                id="ingresoEmpleado"></span></span>
                        <span><i class="bi bi-clock-history"></i> <strong>Antigüedad:</strong> <span
                                id="antiguedadEmpleado"></span></span>
                    </div>
                </div>
            </div>
            <div class="text-end d-none d-md-block">
                <div class="summary-label">Estado Actual</div>
                <span class="badge-status status-activo" id="statusEmpleado"></span>
            </div>
        </div>

        <!-- Estadísticas Resumidas -->
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-label">Días Totales Ganados</div>
                    <div class="summary-value"><span id="diasTotales"></span> <span class="summary-unit">días</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-label">Días Utilizados</div>
                    <div class="summary-value" style="color: #dc2626;"><span id="diasUtilizados"></span> <span
                            class="summary-unit">días</span></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="summary-card">
                    <div class="summary-label">Saldo Disponible</div>
                    <div class="summary-value" style="color: #059669;"><span id="saldoDisponible"></span> <span
                            class="summary-unit">días</span></div>
                </div>
            </div>
        </div>

        <!-- Sección: Registrar Vacaciones y Calendario -->
        <div class="row g-4 mb-5">
            <!-- Formulario de Registro -->
            <div class="col-lg-5">
                <h2 class="section-title"><i class="bi bi-plus-circle"></i> Registrar Vacaciones</h2>
                <div class="card-form">
                    <form id="formRegistroVacaciones">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label-kardex">Fecha Inicio</label>
                                <input type="date" class="input-kardex" id="fechaInicio" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label-kardex">Fecha Fin</label>
                                <input type="date" class="input-kardex" id="fechaFin" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label-kardex">Concepto / Observaciones</label>
                                <textarea class="input-kardex" id="txtObservaciones" rows="2"
                                    placeholder="Ej. Vacaciones de Verano"></textarea>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label-kardex">Días a Descontar</label>
                                <input type="number" class="input-kardex" id="numDiasDescontar" step="0.5" value="0"
                                    readonly>
                            </div>
                            <div class="col-md-6 d-flex align-items-end">
                                <button type="submit" class="btn-register" id="btnRegistrarVacaciones">
                                    <i class="bi bi-check-lg"></i> Registrar Salida
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Componente de Calendario -->
            <div class="col-lg-7">
                <h2 class="section-title"><i class="bi bi-calendar3"></i> Calendario de Disponibilidad</h2>
                <div class="calendar-wrapper">
                    <div class="calendar-header">
                        <div class="calendar-month" id="calendarioMes"></div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-secondary py-0" id="btnMesAnterior"><i
                                    class="bi bi-chevron-left"></i></button>
                            <button class="btn btn-sm btn-outline-secondary py-0" id="btnMesSiguiente"><i
                                    class="bi bi-chevron-right"></i></button>
                        </div>
                    </div>
                    <div class="calendar-grid" id="calendarioGrid">
                        <!-- Se cargará dinámicamente -->

                    </div>
                    <div class="calendar-legend d-flex flex-wrap gap-2 justify-content-between">
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
                            <div class="legend-color" style="background: #3b82f6;"></div> Pago de Prima
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="border: 2px solid var(--primary-green);"></div> Hoy
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabla: Períodos de Vacaciones -->
        <h2 class="section-title"><i class="bi bi-calendar-range"></i> Períodos de Vacaciones</h2>
        <div class="card-table">
            <div class="table-responsive">
                <table class="table table-custom">
                    <thead>
                        <tr>
                            <th>Aniversario</th>
                            <th>Años</th>
                            <th>Versión LFT</th>
                            <th>Derecho</th>
                            <th>Tomados</th>
                            <th>Saldo</th>
                            <th class="text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPeriodos">
                        <!-- Los datos se cargan dinámicamente -->
                    </tbody>
                </table>
            </div>
            <!-- Paginación de Períodos -->
            <div
                class="pagination-container p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
                <div class="page-info text-muted small" id="infoPaginacionPeriodos">
                    Mostrando <strong>1</strong> a <strong>2</strong> de <strong>2</strong> períodos
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0" id="listaPaginacionPeriodos">
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-left"></i></a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-right"></i></a></li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- Tabla: Movimientos del Kardex -->
        <h2 class="section-title"><i class="bi bi-list-check"></i> Historial de Movimientos (Kardex)</h2>
        <div class="card-table mb-5">
            <div class="table-responsive">
                <table class="table table-custom">
                    <thead>
                        <tr>
                            <th>Fecha Registro</th>
                            <th>Concepto / Observaciones</th>
                            <th>Periodo Vacacional</th>
                            <th>Tipo</th>
                            <th>Días</th>
                            <th>Saldo Resultante</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyKardex">
                        <!-- Los datos se cargan dinámicamente -->
                    </tbody>
                </table>
            </div>
            <!-- Paginación del Kardex -->
            <div
                class="pagination-container p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
                <div class="page-info text-muted small" id="infoPaginacionKardex">
                    Mostrando <strong>1</strong> a <strong>3</strong> de <strong>3</strong> movimientos
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0" id="listaPaginacionKardex">
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-left"></i></a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-right"></i></a></li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- Tabla: Primas Vacacionales -->
        <h2 class="section-title"><i class="bi bi-currency-dollar"></i> Historial de Pagos</h2>
        <div class="card-table">
            <div class="table-responsive">
                <table class="table table-custom">
                    <thead>
                        <tr>
                            <th>Semana/Año</th>
                            <th>Fecha Pago</th>
                            <th>Periodo Vacacional</th>
                            <th class="text-end">Días Vac.</th>
                            <th class="text-end">Salario Diario</th>
                            <th class="text-end">Monto Prima</th>
                            <th class="text-end">ISR</th>
                            <th class="text-end">Tarjeta</th>
                            <th class="text-end">Total Neto</th>
                            <th class="text-center">Accion</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPrimas">
                        <!-- Los datos se cargan dinámicamente -->
                    </tbody>
                </table>
            </div>
            <!-- Paginación de Primas -->
            <div
                class="pagination-container p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
                <div class="page-info text-muted small" id="infoPaginacionPrimas">
                    Mostrando <strong>0</strong> a <strong>0</strong> de <strong>0</strong> primas
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0" id="listaPaginacionPrimas">
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-left"></i></a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item disabled"><a class="page-link" href="#"><i
                                    class="bi bi-chevron-right"></i></a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>

    <?php include "modalPrimaVacacional.php"; ?>

    <!-- Scripts y Librerías -->
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="../js/kardex/establecerDataEmpleado.js"></script>
    <script src="../js/kardex/establecerHistorialKardex.js"></script>
    <script src="../js/kardex/establecerHistorialPeriodos.js"></script>
    <script src="../js/kardex/establecerHistorialPrima.js"></script>
    <script src="../js/kardex/editarPrimaVacacional.js"></script>
    <script src="../js/kardex/registrarVacaciones.js"></script>
    <script src="../js/kardex/calendario.js"></script>
</body>

</html>