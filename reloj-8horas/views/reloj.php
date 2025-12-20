<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <?php
    include "../../config/config.php";
    ?>

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../css/nomina_10lbs.css">

    <link rel="stylesheet" href="../css/nomina_styles.css">
    <link rel="stylesheet" href="../css/seleccion_modal_styles.css">
    <link rel="stylesheet" href="../css/detalles_modal.css">
    <link rel="stylesheet" href="../css/horario_modal.css">
    <link rel="stylesheet" href="../css/detalle_modal_dispersion.css">
    <link rel="stylesheet" href="../css/modal_sumas.css">
</head>

<body>

    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina" id="container-nomina">
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina">
            <div class="titulo-nomina">Procesamiento de Reloj 8 Hrs</div>
            <div class="subtitulo-nomina">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel" enctype="multipart/form-data" class="form-nomina-inline">
                <div>
                    <label for="archivo_excel">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de Raya
                    </label>
                    <input type="file" id="file_lista_raya" name="archivo_excel" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel2">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico
                    </label>
                    <input type="file" id="archivo_biometrico" name="archivo_excel2" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_archivos" class="btn btn-primary">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Tabla -->
    <div class="container-tabla-nomina" id="tabla-nomina-responsive" hidden>

        <div class="header-tabla">
            <h3 id=nombre_nomina>Este es un nombre temporal largo</h3>
            <div class="header-controls">
                <span class="sem-info" id="num_semana"></span>
            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla">
            <div class="filtros-container">

                <select class="filtro-departamento" name="Departamentos" id="departamentos-nomina">
                    <option value="PRODUCCION 40 LIBRAS">40 LIBRAS</option>
                    <option value="PRODUCCION 10 LIBRAS">10 LIBRAS</option>
                </select>
                <div class="busqueda-container" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="campo-busqueda">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda" title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
                
            </div>

            <!-- Botones de exportación -->
            <div class="export-buttons">
                <button class="btn-export-excel" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i>
                    Excel
                </button>
                <button class="btn-export-pdf" id="btn_export_pdf" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i>
                    PDF
                </button>
                <button class="btn-export-pdf-reporte" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i>
                    Reporte
                </button>
                <button class="btn-guardar-nomina" id="btn_guardar_nomina" title="Guardar nómina">
                    <i class="bi bi-save"></i>
                    Guardar Nómina
                </button>
                <button class="btn-limpiar-datos" id="btn_limpiar_datos">
                    <i class="bi bi-trash"></i>
                    Subir Nuevamente
                </button>
            </div>
        </div>

        <div id="tabla-nomina-container">
            <div class="table-responsive">
                <table class="table-nomina" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">PUESTO</th>
                            <th rowspan="2">SUELDO <br>NETO</th>
                            <th rowspan="2">INCENTIVO</th>
                            <th rowspan="2">EXTRA</th>
                            <th rowspan="2">TARJETA</th>
                            <th rowspan="2">PRÉSTAMO</th>
                            <th rowspan="2">INASISTENCIAS</th>
                            <th rowspan="2">UNIFORMES</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">Checador</th>
                            <th rowspan="2">F.A /<br>GAFET/<br>COFIA</th>
                            <th rowspan="2">SUELDO A <br>COBRAR</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-nomina-body">
                        <!-- Los datos se cargarán aquí dinámicamente -->
                    </tbody>
                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>

    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="<?= SWEETALERT ?>"></script>
    <!-- Script personalizado -->
    <script src="../js/process_excel.js"></script>
</body>

</html>