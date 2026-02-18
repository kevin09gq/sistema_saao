<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina Relicario</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/nomina_relicario.css">
    <link rel="stylesheet" href="../css/tablaNomina.css">
    <link rel="stylesheet" href="../css/encabezados.css">
    <link rel="stylesheet" href="../css/modalCoordinador.css">


    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina_relicario" id="container-nomina_relicario">
        <!-- Contenedor tipo navbar para formulario y filtros -->
        <div class="navbar-nomina_relicario">
            <div class="titulo-nomina_relicario">Procesamiento de Nómina Relicario</div>
            <div class="subtitulo-nomina_relicario">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel_raya" enctype="multipart/form-data" class="form-nomina-inline-relicario">
                <div>
                    <label for="archivo_excel_lista_raya_relicario">
                        <i class="bi bi-file-earmark-excel-fill"></i> Lista de Raya
                    </label>
                    <input type="file" id="archivo_excel_lista_raya_relicario" name="archivo_excel_lista_raya_relicario" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel_biometrico_relicario">
                        <i class="bi bi-file-earmark-excel-fill"></i> Biometrico
                    </label>
                    <input type="file" id="archivo_excel_biometrico_relicario" name="archivo_excel_biometrico_relicario" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_nomina_relicario" class="btn-procesar-nomina_relicario">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="container-tabla-nomina-relicario" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla-relicario">
            <h3 id=nombre_nomina></h3>
            <div class="header-controls-relicario">
                <span class="sem-info-relicario" id="num_semana"></span>
                <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_actualizar_biometrico" title="Actualizar Biometrico" aria-label="Actualizar Biometrico">
                    <i class="bi bi-person-badge"></i>
                </button>
                <button class="btn btn-outline-primary btn-horarios" type="button" id="btn_establecer_horario_semanal" title="Establecer Horario Semanal" aria-label="Establecer Horario Semanal">
                    <i class="bi bi-calendar-check"></i>
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
                <button class="btn btn-outline-primary btn-ticket-zebra" id="btn_ticket_pdf" title="Descargar Ticket">
                    <i class="bi bi-ticket-perforated"></i>
                </button>
                <button class="btn btn-outline-secondary btn-ticket-zebra" id="btn_ticket_manual" title="Descargar Ticket Manual">
                    <i class="bi bi-ticket-perforated"></i>
                </button>
                <button class="btn btn-outline-danger btn-delete-tarjeta" id="btn_delete_tarjeta" title="Quitar tarjeta" aria-label="Quitar tarjeta">
                    <i class="bi bi-credit-card-2-back"></i>
                </button>


            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla-relicario">
            <div class="filtros-container-relicario">

                <!-- <select class="filtro-departamento-relicario" id="filtro-puesto">
                    <option value="1" selected>Jornalero Base</option>
                    <option value="2">Jornalero Vivero</option>
                    <option value="3">Jornalero De Apoyo</option>
                    <option value="4">Coordinador Rancho</option>
                    <option value="5">Coordinador Vivero</option>
                </select> -->

                <select class="filtro-departamento-relicario" id="filtro_departamento">
                    <!-- Departamento -->
                </select>

                <select class="filtro-departamento-relicario" id="filtro_puesto">
                    <!-- Departamento -->
                </select>



                <div class="busqueda-container-relicario" id="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda-relicario" placeholder="Buscar..." id="busqueda-nomina-relicario">
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="btn-clear-busqueda" title="Limpiar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>

            </div>


            <!-- Botones de exportación -->
            <div class="export-buttons-relicario">
                <button class="btn btn-outline-success me-2" id="btn_export_excel" title="Exportar a Excel">
                    <i class="bi bi-file-earmark-excel"></i> Excel
                </button>

                <button class="btn btn-outline-danger me-2" id="btn_export_pdf_reporte" title="Exportar a PDF">
                    <i class="bi bi-file-earmark-pdf"></i> Reporte
                </button>
                <button class="btn btn-outline-primary me-2" id="btn_guardar_nomina_relicario" title="Guardar nómina">
                    <i class="bi bi-save"></i> Guardar Nómina
                </button>
                <button class="btn btn-outline-warning" id="btn_limpiar_datos" title="Subir Nuevamente">
                    <i class="bi bi-trash"></i> Subir Nuevamente
                </button>
                <button class="btn btn-outline-info" id="btnReasignarDepartamento" title="Reasignar Departamentos">
                    <i class="bi bi-arrow-left-right"></i> Reasignar
                </button>


            </div>
        </div>

        <div id="tabla-nomina-container-relicario" class="tabla-nomina-container-relicario">
            <div class="table-responsive-relicario">
                <table class="table-nomina-relicario" id="tabla-nomina">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">SUELDO <br> SEMANAL</th>
                            <th rowspan="2">PASAJE</th>
                            <th rowspan="2">EXTRAS</th>
                            <th rowspan="2">Total Percepciones</th>
                            <th rowspan="2">ISR</th>
                            <th rowspan="2">IMSS</th>
                            <th rowspan="2">INFONAVIT</th>
                            <th rowspan="2">AJUSTES <br> AL SUB</th>
                            <th rowspan="2">AUSENTISMO</th>
                            <th rowspan="2">PERMISO</th>
                            <th rowspan="2">RETARDOS</th>
                            <th rowspan="2">UNIFORMES</th>
                            <th rowspan="2">CHECADOR</th>
                            <th rowspan="2">F.A/GAFET/COFIA</th>
                            <th rowspan="2">TOTAL DE <br> DEDUCCIONES</th>
                            <th rowspan="2">NETO A RECIBIR</th>
                            <th rowspan="2">DISPERSION DE <br> TARJETA</th>
                            <th rowspan="2">IMPORTE EN EFECTIVO</th>
                            <th rowspan="2">PRÉSTAMO</th>
                            <th rowspan="2">TOTAL A <br>RECIBIR</th>
                            <th rowspan="2">REDONDEADO</th>
                            <th rowspan="2">TOTAL EFECTIVO <br> REDONDEADO</th>

                        </tr>
                    </thead>
                    <tbody id="tabla-nomina-body-relicario">
                        <!-- Filas de la tabla se generarán dinámicamente -->



                    </tbody>

                </table>
            </div>
            <ul id="paginacion-nomina" class="pagination my-5" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>

    <!-- Menú contextual simple para la tabla -->
    <div id="context-menu" style="position:absolute;z-index:10000;display:none;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);padding:4px;">
        <div class="cm-item" data-action="ver" style="padding:6px 12px;cursor:pointer;">Ver detalles</div>
    </div>


    <!-- Incluir el modal -->

    <?php include "modalCoordinador.php"; ?>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="<?= JQUERY_INPUTMASK ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Archivo JS específico -->
    <script src="../js/process_excel.js"></script>
    <script src="../js/showDataTable.js"></script>
    <script src="../js/configComponentes.js"></script>
    <script src="../js/saveGetNomina.js"></script>
    <script src="../js/storage.js"></script>
    <script src="../js/busquedaFiltrado.js"></script>
    <script src="../js/abrirModal.js"></script>
    <script src="../js/configModalCoordinador/configModal.js"></script>
    <script src="../js/configModalCoordinador/establecerData.js"></script>
    <script src="../js/configModalCoordinador/editarData.js"></script>
    <script src="../js/configModalCoordinador/newConcepts.js"></script>


</body>

</html>