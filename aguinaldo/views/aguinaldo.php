<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aguinaldo | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!--
    * ==============================================================
    * Hojas de estilo necesarias para el funcionamiento de la página
    * ==============================================================
    -->

    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/aguinaldo.css">


    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container-fluid">

            <div class="my-3">
                <h3 class="text-success"><i class="bi bi-gift-fill me-2"></i>Calcular Aguinaldos</h3>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex justify-content-center justify-content-md-end gap-2 mb-2 flex-wrap">
                
                <button
                    type="button"
                    id="btn_exportar_excel"
                    class="btn btn-sm btn-success fw-bold shadow-sm"
                    title="Generar documentos excel">
                    <i class="bi bi-file-earmark-excel-fill me-2"></i>Excel
                </button>
                <button
                    type="button"
                    id="btn_guardar_aguinaldo"
                    class="btn btn-sm btn-primary fw-bold shadow-sm"
                    title="Guardar los cambios en la base de datos">
                    <i class="bi bi-download me-2"></i>Guardar
                </button>
                <button
                    type="button"
                    id="btn_modal_configuracion"
                    class="btn btn-sm btn-outline-secondary fw-bold shadow-sm"
                    title="Configuración general para todos">
                    <i class="bi bi-file-earmark-excel-fill me-2"></i>Configurar
                </button>
                <button
                    type="button"
                    id="btn_resetear_aguinaldo"
                    class="btn btn-sm btn-warning fw-bold shadow-sm"
                    title="Resetear el cálculo del aguinaldo">
                    <i class="bi bi-arrow-clockwise me-2"></i>Resetear
                </button>
            </div>



            <!-- Filtros de búsqueda -->
            <div class="row g-2 mb-3 align-items-end">

                <!-- Año -->
                <div class="col-12 col-md-1">
                    <select class="form-select form-select-sm shadow-sm"
                        id="anio"
                        name="anio"
                        title="Seleccionar año">

                        <?php for ($i = 2026; $i <= date('Y') + 1; $i++) : ?>
                            <option <?= $i == date('Y') ? 'selected' : '' ?> value="<?= $i ?>"><?= $i ?></option>
                        <?php endfor; ?>

                    </select>
                </div>

                <!-- Buscar -->
                <div class="col-12 col-md-4">
                    <input type="text"
                        class="form-control form-control-sm shadow-sm"
                        id="busqueda"
                        name="busqueda"
                        placeholder="Buscar..."
                        title="Buscar por motivo o autorizado por">
                </div>

                <!-- Departamento -->
                <div class="col-12 col-md-2">
                    <select class="form-select form-select-sm shadow-sm"
                        id="departamento"
                        name="departamento"
                        title="Filtrar por departamento">
                        <option value="-1">Todos los departamentos</option>
                    </select>
                </div>

                <!-- Cantidad por página -->
                <div class="col-12 col-md-1">
                    <select class="form-select form-select-sm shadow-sm"
                        id="limite"
                        name="limite"
                        title="Cantidad de filas por página">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="-1">Todos</option>
                    </select>
                </div>

            </div>

            <!-- Tabla de resultados -->
            <div class="table-responsive my-3">
                <div class="card shadow-sm">
                    <div class="card-body p-1">
                        <div class="table-responsive">
                            <table class="table table-hover" id="tabla_aguinaldo">
                                <thead>
                                    <tr>
                                        <th class="text-center fs-6">CLAVE</th>
                                        <th class="text-center fs-6">NOMBRE</th>
                                        <th class="text-center fs-6">EMPRESA</th>
                                        <th class="text-center fs-6">NSS</th>
                                        <th class="text-center fs-6" width="100">SUELDO DIARIO</th>
                                        <th class="text-center fs-6" width="100">DIAS TRABAJADOS</th>
                                        <th class="text-center fs-6" width="100">MESES TRABAJADOS</th>
                                        <th class="text-center fs-6">AGUINALDO</th>
                                        <th class="text-center fs-6">ISR</th>
                                        <th class="text-center fs-6" width="100">DISPERSION TARJETA</th>
                                        <th class="text-center fs-6">NETO PAGAR</th>
                                        <th class="text-center fs-6">REDONDEO</th>
                                        <th class="text-center fs-6" width="100">NETO PAGAR REDONDEADO</th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider" id="cuerpo-tabla-aguinaldo">
                                    <tr>
                                        <td colspan="6" class="text-center text-muted">Cargando información...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Paginación -->
                        <nav aria-label="Page navigation" id="contenedor-paginacion">
                            <ul class="pagination justify-content-center" id="paginacion">
                                <!-- Se genera dinámicamente -->
                            </ul>
                        </nav>

                    </div>
                </div>
            </div>



            <!-- Menú contextual simple para la tabla de corte -->
            <div id="context_menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
                <div class="cm_item" data-action="ver" style="padding:6px 12px;cursor:pointer;">🔎​ Ver detalles</div>
            </div>

        </div>

    </main>

    <!-- Llamar a los modales -->
    <?php include __DIR__ . '/modal_configuracion.php'; ?>
    <?php include __DIR__ . '/modal_editar.php'; ?>
    <?php include __DIR__ . '/modal_exportar.php'; ?>


    <!--
    * ==============================================================
    * Scripts necesarios para el funcionamiento de la página
    * ==============================================================
    -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>

    <script src="../js/index.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/show_tabla.js"></script>
    <script src="../js/componentes.js"></script>
    <script src="../js/editar_aguinaldo.js"></script>
    <script src="../js/procesar_rayas.js"></script>
    <script src="../js/exportar_aguinaldo.js"></script>

    <script>

        $(".modal-dialog").draggable({
            handle: ".modal-header"
        });
        
    </script>

</body>

</html>