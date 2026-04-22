<?php
include __DIR__ . "/../../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registros de Aguinaldos | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!--
    * ==============================================================
    * Hojas de estilo necesarias para el funcionamiento de la página
    * ==============================================================
    -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../../public/views/navbar.php'; ?>

    <main>

        <div class="container">

            <div class="my-3">
                <h3 class="text-success"><i class="bi bi-gift-fill me-2"></i>Registro de Aguinaldos</h3>
            </div>

            <!-- Filtros de búsqueda -->
            <div class="row g-2 mt-3 align-items-end">

                <!-- Botón volver -->
                <div class="col-12 col-md-auto">
                    <button type="button"
                        class="btn btn-sm btn-outline-secondary shadow-sm w-100"
                        onclick="window.history.back();"><i class="bi bi-arrow-left"></i></button>
                </div>

                <!-- Buscar -->
                <div class="col-12 col-md-3">
                    <input type="text"
                        class="form-control form-control-sm shadow-sm"
                        id="busqueda"
                        name="busqueda"
                        placeholder="Buscar..."
                        title="Buscar por motivo o autorizado por">
                </div>

                <div class="col-12 col-md-1">
                    <select class="form-select form-select-sm shadow-sm"
                        id="anio"
                        name="anio"
                        title="Seleccionar año de filtrado">
                        <option value="-1">-----</option>
                        <!-- Se comienza a generar desde el año 2026 -->
                        <!-- Por defecto se selecciona el año en turno -->
                        <?php for ($i = 2026; $i <= date('Y'); $i++) : ?>
                            <option <?= $i == date('Y') ? 'selected' : '' ?> value="<?= $i ?>"><?= $i ?></option>
                        <?php endfor; ?>
                    </select>
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

                <!-- Ordenar por -->
                <div class="col-12 col-md-2">
                    <select class="form-select form-select-sm shadow-sm"
                        id="columna"
                        name="columna"
                        title="Seleccionar columna">
                        <option value="nombre" selected>Nombre</option>
                        <option value="anio">Año</option>
                        <option value="dias">Días trabajados</option>
                        <option value="sueldo">Sueldo diario</option>
                        <option value="aguinaldo">Aguinaldo</option>
                        <option value="fecha_pago">Fecha de pago</option>
                    </select>
                </div>

                <div class="col-12 col-md-2">
                    <select class="form-select form-select-sm shadow-sm"
                        id="orden"
                        name="orden"
                        title="Seleccionar orden">
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                </div>


                <!-- Cantidad por página -->
                <div class="col-12 col-md-1">
                    <select class="form-select form-select-sm shadow-sm"
                        id="limite"
                        name="limite"
                        title="Cantidad de filas por página">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="-1">Todos</option>
                    </select>
                </div>

            </div>



            <!-- Tabla de resultados -->
            <div class="my-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="">
                            <table class="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th class="bg-success text-white text-center">CV</th>
                                        <th class="bg-success text-white text-center">EMPLEADO</th>
                                        <th class="bg-success text-white text-center">AÑO</th>
                                        <th class="bg-success text-white text-center">SUELDO DIARIO</th>
                                        <th class="bg-success text-white text-center">DIAS TRABAJADOS</th>
                                        <th class="bg-success text-white text-center">AGUINALDO</th>
                                        <th class="bg-success text-white text-center">FECHA PAGO</th>
                                        <th class="bg-success text-white text-center">OPCIONES</th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider" id="cuerpo_tabla_aguinaldo_registro">
                                    <tr>
                                        <td colspan="8" class="text-center text-muted">Cargando información...</td>
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

        </div>

    </main>

    <?php require_once __DIR__ . "/modal_detalles.php" ?>


    <!--
    * ======================================================
    * Scripts necesarios para el funcionamiento de la página
    * ======================================================
    -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>

    <script src="../../js/historial/index.js"></script>

</body>

</html>