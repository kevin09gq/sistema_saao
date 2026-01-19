<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nomina Confianza</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../css/nomina_confianza.css">
    <link rel="stylesheet" href="../css/conceptsModal.css">
    <link rel="stylesheet" href="../css/prestamosModal.css">
    <link rel="stylesheet" href="../css/conceptos_totales.css">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>

    <style>

    </style>

</head>

<body>
      <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina" id="container-nomina" hidden>
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina">
            <div class="titulo-nomina">Procesamiento de Nómina de Confianza</div>
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
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico <span class="text-muted">(Opcional)</span>
                    </label>
                    <input type="file" id="archivo_biometrico" name="archivo_excel2" accept=".xls,.xlsx">
                </div>
                <div>
                    <button type="button" id="btn_procesar_archivos" class="btn btn-primary">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="container-tabla-nomina" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla">
            <h3 id=nombre_nomina></h3>
            <div class="header-controls">
                <span class="sem-info" id="num_semana"></span>
                <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_actualizar_horarios" title="Actualizar horarios" aria-label="Actualizar Biometrico">
                    <i class="bi bi-clock"></i>
                </button>
                <button class="btn btn-outline-primary" id="btn-seleccionar-empleados" title="Seleccionar empleados">
                    <i class="bi bi-people"></i>
                </button>
                <button class="btn-aplicar-copias btn btn-outline-success" id="btn_aplicar_copias_global" title="Aplicar Tarjeta">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
                <button class="btn btn-outline-primary btn-suma" type="button" id="btn_conceptos_totales" title="Totales por concepto" aria-label="Totales por concepto">
                    <i class="bi bi-calculator"></i>
                </button>
                <button class="btn-ticket-zebra" id="btn_ticket_pdf" title="Ticket Zebra">
                    <i class="bi bi-printer"></i>
                    Ticket Zebra
                </button>


            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla">
            <div class="filtros-container">
                <select class="filtro-departamento" id="filtro-departamento">
                </select>

                <select class="filtro-departamento" id="filtro-empresa">               
                </select>


                <div class="busqueda-container" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="busqueda-nomina-confianza">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda" title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>
             
                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_confianza" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
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
                            <th rowspan="2">SUELDO <br> SEMANAL</th>
                            <th rowspan="2">EXTRAS</th>
                            <th rowspan="2">Total Percepciones</th>
                            <th rowspan="2">RETARDOS</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">AJUSTES <br> AL SUB</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">PERMISO</th>
                            <th rowspan="2">INASISTENCIAS</th>
                            <th rowspan="2">UNIFORMES</th>
                            <th rowspan="2">CHECADOR</th>
                            <th rowspan="2">TOTAL DE <br> DEDUCCIONES</th>
                            <th rowspan="2">PRÉSTAMO</th>
                            <th rowspan="2">DISPERSION DE TARJETA</th>
                            <th rowspan="2">NETO A RECIBIR</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-nomina-body">



                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>

    <!-- Menú contextual simple para la tabla -->
    <div id="context-menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm-item" data-action="ver" style="padding:6px 12px;cursor:pointer;">Ver detalles</div>
    </div>

    <!-- Modal de detalles (incluir plantilla) -->
    <?php include 'conceptsModal.php'; ?>
    <?php include 'modalPrestamos.php'; ?>
    <?php include 'modalSeleccionarEmpleados.php'; ?>
    <?php include 'modalConceptosTotales.php'; ?>
    <?php include 'modalExportExcel.php'; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Script personalizado -->
    <script src="../js/storage.js"></script>
    <script src="../js/process_excel.js"></script>
    <script src="../js/showDataTable.js"></script>
    <script src="../js/filtrado.js"></script>
    <script src="../js/config_modal_concepts.js"></script>
    <script src="../js/establecer_data.js"></script>
    <script src="../js/newConcepts.js"></script>
    <script src="../js/editarConcepts.js"></script>
    <script src="../js/eventos.js"></script>
    <script src="../js/uniformes.js"></script>
    <script src="../js/permisos.js"></script>
    <script src="../js/saveNominaConfianza.js"></script>
    <script src="../js/export_nomina_excel.js"></script>
    <script src="../js/seleccionar_empleados.js"></script>
    <script src="../js/conceptos_totales.js"></script>
    <script src="../js/export_encabezado_pdf.js"></script>
    <script src="../js/ticket_pdf.js"></script>

</body>

</html>