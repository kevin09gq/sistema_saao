<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nómina</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../styles/nomina_styles.css">
</head>

<body>
    <?php
    include "../../public/views/navbar.php"
    ?>

    <!-- Contenedor principal centrado -->
    <div class="container-nomina" id="container-nomina" >
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
    <div class="container-tabla-nomina">
        <!-- Controles de filtro y búsqueda -->
        <div class="controles-tabla">
            <div class="filtros-container">
                <select class="filtro-departamento" id="filtro-departamento">
                    <option value="todos">Todos</option>
                    <option value="produccion-40">Producción 40 Libras</option>
                    <option value="produccion-10">Producción 10 Libras</option>
                    <option value="rancho">Rancho Relicario</option>
                    <option value="ranchos">Ranchos</option>
                    <option value="administracion">Administración</option>
                </select>
                
                <div class="busqueda-container">
                    <i class="bi bi-search"></i>
                    <input type="text" class="campo-busqueda" placeholder="Buscar..." id="campo-busqueda">
                </div>
            </div>
            
            <button class="btn-agregar-empleado" id="btn-agregar-empleado">
                <i class="bi bi-plus"></i>
                Agregar Empleado
            </button>
        </div>

        <div class="header-tabla">
            <h3>NÓMINA DEL 20 AL 26 DE JUNIO DEL 2025</h3>
            <span class="sem-info">SEM 26</span>
        </div>

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
                    <tr>
                        <td>1</td>
                        <td>ABUNDIO SANTOS ALICIA</td>
                        <td>40 LIBRAS</td>
                        <td>$ 1,951.50</td>
                        <td>$ 250.00</td>
                        <td>$ 1,887.50</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                </tbody>
            </table>
        </div>
    </div>

    <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!--JS Personalizado-->
    <script src="../js/leer_excel.js"></script>
</body>

</html>