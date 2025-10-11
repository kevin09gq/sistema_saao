<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina</title>
    <?php 
    include "../../config/config.php";
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../styles/nomina_styles.css">
    <link rel="stylesheet" href="../styles/seleccion_modal_styles.css">
    <link rel="stylesheet" href="../styles/detalles_modal.css">
    <link rel="stylesheet" href="../styles/horario_modal.css">
    <link rel="stylesheet" href="../styles/detalle_modal_dispersion.css">
    <link rel="stylesheet" href="../styles/modal_sumas.css">
    <!-- SweetAlert2 CSS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
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
            <div class="titulo-nomina">Procesamiento de Nómina</div>
            <div class="subtitulo-nomina">Selecciona los archivos Excel para procesar la información</div>

            <form id="form_excel" enctype="multipart/form-data" class="form-nomina-inline">
                <div>
                    <label for="archivo_excel">
                        <i class="bi bi-file-earmark-excel-fill"></i> Nómina
                    </label>
                    <input type="file" id="archivo_excel" name="archivo_excel" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <label for="archivo_excel2">
                        <i class="bi bi-file-earmark-excel-fill"></i> Horario
                    </label>
                    <input type="file" id="archivo_excel2" name="archivo_excel2" accept=".xls,.xlsx" required>
                </div>
                <div>
                    <button type="button" id="btn_procesar_ambos">
                        <i class="bi bi-arrow-repeat"></i> Procesar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Tabla -->
    <div class="container-tabla-nomina" id="tabla-nomina-responsive" hidden>
        <div class="header-tabla">
            <h3 id=nombre_nomina></h3>
            <div class="header-controls">
                <span class="sem-info" id="num_semana"></span>
                <button class="btn-horarios" type="button" id="btn_horarios" data-bs-toggle="modal" data-bs-target="#horarios_modal">
                    <i class="bi bi-clock"></i>
                    Horarios
                </button>
                <div class="mini-tabs">
                    <button class="mini-tab active" type="button" id="btn_tabla_nomina">
                        <i class="bi bi-table"></i>
                    </button>
                    <button class="mini-tab" type="button" id="btn_tabla_dispersión">
                        <i class="bi bi-table"></i>
                    </button>
                </div>
                <button class="btn-suma" type="button" id="btn_suma">
                    <i class="bi bi-calculator"></i>
                </button>
                <button class="btn-suma" type="button" id="btn_suma_dispersion" hidden>
                    <i class="bi bi-calculator"></i>
                </button>
            </div>
        </div>

        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla">
            <div class="filtros-container">
                <select class="filtro-seguro" id="filtro-seguro" hidden>
                    <option value="con_seguro">Con seguro</option>
                    <option value="sin_seguro">Sin seguro</option>
                </select>

                <div class="busqueda-container" id="busqueda-container" hidden>
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="campo-busqueda">
                </div>
                <div class="busqueda-container" id="busqueda-container-dispersion" hidden>
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="campo-busqueda-dispersion">
                </div>
                <div class="busqueda-container" id="busqueda-container-sin-seguro" hidden>
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="campo-busqueda-sin-seguro">
                </div>
            </div>

            <button class="btn-agregar-todos" id="btn_mostrar_todos" hidden>
                <i class="bi bi-plus"></i>
                A Todos
            </button>
            <button class="btn-agregar-todos" id="btn_mostrar_algunos">
                <i class="bi bi-plus"></i>
                Seleccionar
            </button>

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
                <button class="btn-guardar-nomina" id="btn_guardar_nomina" title="Guardar nómina">
                    <i class="bi bi-save"></i>
                    Guardar Nómina
                </button>
                <button class="btn-limpiar-datos" id="btn_limpiar_datos" title="Limpiar datos y volver al inicio">
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

        <!-- Tabla de empleados sin seguros -->
        <div class="" id="tabla-sin-seguro-container" hidden>
            <div class="table-responsive">
                <table class="table-nomina" id="tabla-sin-seguro">
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
                    <tbody id="tabla-sin-seguro-body">
                        <!-- Los datos se cargarán aquí dinámicamente -->
                    </tbody>
                </table>
            </div>
            <ul id="paginacion-sin-seguro" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>

        <!-- Tabla de dispersión de tarjeta -->
        <div class="" id="tabla-dispersion-tarjeta" hidden>
            <div class="table-responsive">
                <table class="table-nomina" id="tabla-dispersion">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">CLAVE</th>
                            <th rowspan="2">NOMBRE</th>
                            <th rowspan="2">SUELDO <br>NETO</th>

                        </tr>
                    </thead>
                    <tbody id="tabla-dispersion-body">
                        <!-- Los datos se cargarán aquí dinámicamente -->
                    </tbody>
                </table>
            </div>
            <ul id="paginacion-dispersion" class="pagination" style="margin: 20px 0 0 0; justify-content: center;"></ul>
        </div>
    </div>

    <!-- Incluir el modal -->
    <?php include 'seleccion_modal.php'; ?>
    <?php include 'detalles_modal.php'; ?>
    <?php include 'horarios_modal.php'; ?>
    <?php include 'detalle_modal_dispersion.php'; ?>
    <?php include 'modal_sumas.php'; ?>
    <?php include 'modal_suma_dispersion.php'; ?>

    <!-- Menú contextual personalizado -->
    <div id="menu-contextual" hidden style="position:absolute; z-index:9999; background:#fff; border:1px solid #ccc; padding:6px 12px; font-size:14px; cursor:pointer;">
        Ver detalles
    </div>

    <!-- Menú contextual para dispersión -->
    <div id="menu-contextual-dispersion" hidden style="position:absolute; z-index:9999; background:#fff; border:1px solid #ccc; padding:6px 12px; font-size:14px; cursor:pointer; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
        Actualizar Sueldo
    </div>
    
    <!-- Menú contextual para empleados sin seguro -->
    <div id="menu-contextual-sin-seguro" hidden style="position:absolute; z-index:9999; background:#fff; border:1px solid #ccc; padding:6px 12px; font-size:14px; cursor:pointer;">
        Ver detalles
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Plugin Inputmask -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.7/jquery.inputmask.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="../../config/settings/js/obtener_tabulador.js"></script>
    <script src="../jsPrueba2/leer_excel.js"></script>
    <script src="../jsPrueba2/config_tabla.js"></script>
    <script src="../jsPrueba2/seleccion_empleados.js"></script>
    <script src="../jsPrueba2/detalles_modal.js"></script>
    <script src="../jsPrueba2/detalle_modal_dispersion.js"></script>
    <script src="../jsPrueba2/rangos_horarios.js"></script>
    <script src="../jsPrueba2/horarios_modal.js"></script>
    <script src="../jsPrueba2/calcular_sumas.js"></script>
    <script src="../jsPrueba2/guardar_nomina.js"></script>
    <script src="../jsPrueba2/generar_excel_pdf.js"></script>

</body>

</html>