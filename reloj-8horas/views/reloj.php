<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reloj Checador | Sistema SAAO</title>
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
    <link rel="stylesheet" href="../css/eventos_modal.css">
</head>

<body>

    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Formulario principal -->
    <div class="container-nomina" id="container-reloj">
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina">
            <div class="titulo-nomina">Procesamiento de Reloj 8 Hrs</div>
            <div class="subtitulo-nomina">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel" enctype="multipart/form-data" class="form-nomina-inline">

                <!-- LISTA DE RAYA (OBLIGATORIO) -->
                <div>
                    <label for="archivo_excel">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de raya <span class="text-danger">*</span>
                    </label>
                    <input type="file" id="file_lista_raya" name="archivo_excel" accept=".xls,.xlsx" required>
                </div>

                <!-- BIOMETRICO DE LA CENTRAL (OBLIGATORIO) -->
                <div>
                    <label for="archivo_excel2">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico Empaque <span class="text-danger">*</span>
                    </label>
                    <input type="file" id="archivo_biometrico_central" name="archivo_excel2" accept=".xls,.xlsx" required>
                </div>

                <!-- ============================================= -->
                <!-- BIOMETRICOS DE RANCHOS (OPCIONALES)          -->
                <!-- Para agregar un nuevo rancho, simplemente     -->
                <!-- copiar este bloque y cambiar el data-rancho   -->
                <!-- ============================================= -->

                <!-- BIOMETRICO DE RANCHO RELICARIO (OPCIONAL) -->
                <div>
                    <label for="biometrico_rancho_relicario">
                        <i class="bi bi-file-earmark-excel-fill text-success"></i> Biometrico Rancho Relicario
                    </label>
                    <input type="file" 
                           class="input-biometrico-rancho" 
                           id="biometrico_rancho_relicario" 
                           name="biometrico_rancho_relicario" 
                           data-rancho="Relicario"
                           accept=".xls,.xlsx">
                </div>

                <!-- BIOMETRICO DE RANCHO PILAR (OPCIONAL) -->
                <div>
                    <label for="biometrico_rancho_pilar">
                        <i class="bi bi-file-earmark-excel-fill text-success"></i> Biometrico Rancho Pilar
                    </label>
                    <input type="file" 
                           class="input-biometrico-rancho" 
                           id="biometrico_rancho_pilar" 
                           name="biometrico_rancho_pilar" 
                           data-rancho="Pilar"
                           accept=".xls,.xlsx">
                </div>

                <!-- RANCHO HEUASTECA (PROXIMAMENTE)
                <div>
                    <label for="biometrico_rancho_huasteca">
                        <i class="bi bi-file-earmark-excel-fill text-success"></i> Biometrico Rancho Huasteca
                    </label>
                    <input type="file" 
                           class="input-biometrico-rancho" 
                           id="biometrico_rancho_huasteca" 
                           name="biometrico_rancho_huasteca" 
                           data-rancho="Huasteca"
                           accept=".xls,.xlsx">
                </div>
                -->

                <div>
                    <button type="button" id="btn_procesar_archivos" class="btn btn-primary">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>

        </div>
    </div>

    <!-- Tabla -->
    <div class="container-tabla-nomina" id="tabla-reloj-responsive" hidden>
        <div class="header-tabla">
            <h3 id="titulo_reloj">Este es un nombre temporal largo</h3>
            <div class="header-controls">
                <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#horariosModal">
                    <i class="bi bi-clock-history me-2"></i>Horarios Variables
                </button>
                <span class="sem-info" id="num_semana"></span>
            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla">
            <div class="filtros-container">
                <select class="filtro-departamento" name="departamentos" id="departamentos-reloj">
                    <!-- Aqui van los departamentos -->
                </select>
                <select class="filtro-departamento" name="puestos" id="puestos-reloj">
                    <!-- Aqui van los departamentos -->
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
                <button class="btn-limpiar-datos" id="btn_guardar_datos">
                    <i class="bi bi-floppy"></i>
                    Guardar datos
                </button>
                <button class="btn-limpiar-datos" id="btn_limpiar_datos">
                    <i class="bi bi-trash"></i>
                    Subir Nuevamente
                </button>
            </div>
        </div>

        <div id="tabla-reloj-container">
            <div class="table-responsive" id="tablas-reloj">
                <!-- Aqui van a ir las tablas de los empleados, por cada empleado existirá una tabla -->
                <!-- Para no hacer muy larga la interfaz, en el paginado se listaran tablas de cinco en cinco -->
            </div>
            <ul id="paginacion-reloj" class="pagination mb-3" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>



    <?php include 'detalles_modal.php'; ?>
    <?php include 'horarios_modal.php'; ?>
    <?php include 'eventos_modal.php'; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="<?= SWEETALERT ?>"></script>
    <!-- Script personalizado -->

    <script src="../js/process_excel.js"></script>
    <script src="../js/interfaz.js"></script>
    <script src="../js/llenar_modal.js"></script>
    <script src="../js/horarios_variable.js"></script>
    <script src="../js/guardar_datos.js"></script>


    <script src="../js/generar_pdf.js"></script>
    <script src="../js/generar_excel.js"></script>


    <script>
        // Listener para exportar a PDF
        document.addEventListener('DOMContentLoaded', function() {
            const btnPDF = document.getElementById('btn_export_pdf');
            if (btnPDF) {
                btnPDF.addEventListener('click', function() {
                    // Obtener los datos procesados del reloj
                    let datos = null;
                    try {
                        datos = sessionStorage.getItem('reloj-ocho');
                        if (datos) datos = JSON.parse(datos);
                    } catch (e) {
                        datos = null;
                    }
                    if (!datos) {
                        alert('No hay datos para exportar. Procesa primero los archivos.');
                        return;
                    }
                    // Obtener los filtros aplicados desde interfaz.js
                    const datosFiltrados = obtenerDatosFiltrados();
                    generarReportePDF(datosFiltrados);
                });
            }

            // Listener para exportar a Excel
            const btnExcel = document.getElementById('btn_export_excel');
            if (btnExcel) {
                btnExcel.addEventListener('click', function() {
                    // Obtener los datos procesados del reloj
                    let datos = null;
                    try {
                        datos = sessionStorage.getItem('reloj-ocho');
                        if (datos) datos = JSON.parse(datos);
                    } catch (e) {
                        datos = null;
                    }
                    if (!datos) {
                        alert('No hay datos para exportar. Procesa primero los archivos.');
                        return;
                    }
                    // Obtener los filtros aplicados desde interfaz.js
                    const datosFiltrados = obtenerDatosFiltrados();
                    generarReporteExcel(datosFiltrados);
                });
            }
        });
    </script>

</body>

</html>