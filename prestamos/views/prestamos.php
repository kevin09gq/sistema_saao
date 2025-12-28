<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Préstamos</title>

    <?php
    include "../../config/config.php";
    include "../../conexion/conexion.php";
    ?>

    <link rel="stylesheet" href="../css/prestamos.css">

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
</head>

<body>
    <div class="main-container">
        <!-- Filtros y búsqueda -->
        <section class="filtros-section">
            <div class="filtros-container">
                <div class="filtro-grupo">
                    <label for="buscarPrestamo"><i class="bi bi-search"></i> Buscar:</label>
                    <input type="text" id="buscarPrestamo" placeholder="Buscar por empleado, clave o descripción...">
                </div>
                <div class="filtro-grupo">
                    <label for="filtroEstado"><i class="bi bi-funnel"></i> Estado:</label>
                    <select id="filtroEstado">
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="activo">Activo</option>
                        <option value="pagado">Pagado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div class="filtro-grupo">
                    <label for="filtroFecha"><i class="bi bi-calendar"></i> Fecha:</label>
                    <input type="date" id="filtroFecha">
                </div>
                <div class="filtro-grupo">
                    <label for="filtroDepartamento"><i class="bi bi-building"></i> Departamento:</label>
                    <select id="filtroDepartamento">
                        <option value="">Todos</option>
                      
                    </select>
                </div>
                <div class="filtro-grupo">
                    <label for="filtroSeguro"><i class="bi bi-shield-check"></i> Seguro IMSS:</label>
                    <select id="filtroSeguro">
                        <option value="">Todos</option>
                        <option value="con">Con seguro</option>
                        <option value="sin">Sin seguro</option>
                    </select>
                </div>
                <div class="filtro-grupo">
                    <label>&nbsp;</label>
                    <button class="btn-nuevo-prestamo" id="btnNuevoPrestamo">
                        <i class="bi bi-plus-lg"></i> Nuevo Préstamo
                    </button>
                </div>
            </div>
        </section>

        <!-- Estadísticas rápidas -->
        <section class="estadisticas-section">
            <div class="stat-card">
                <div class="stat-icon activo">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-info">
                    <h3>Préstamos Activos</h3>
                    <p class="stat-number"></p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon pendiente">
                    <i class="bi bi-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>Pendientes</h3>
                    <p class="stat-number"></p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon total">
                    <i class="bi bi-currency-dollar"></i>
                </div>
                <div class="stat-info">
                    <h3>Total Prestado</h3>
                    <p class="stat-number"></p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon pagado">
                    <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>Pagados</h3>
                    <p class="stat-number"></p>
                </div>
            </div>
        </section>

        <!-- Tabla de préstamos -->
        <section class="tabla-section">
            <table class="tabla-prestamos">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Empleado</th>
                        <th>Monto</th>
                        <th>Semanas</th>
                        <th>Pago Semanal</th>
                        <th>Estado</th>
                        <th>Fecha Inicio</th>
                        <th>Progreso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaPrestamosBody">
                    <!-- Datos de ejemplo -->
                  
                </tbody>
            </table>

            <!-- Controles de paginación -->
            <div id="controlesPaginacion" class="paginacion-container">
                <div class="paginacion-info">
                    <span id="infoPaginacion">Mostrando 1-4 de 5 préstamos</span>
                </div>
                <div class="paginacion-botones">
                    <button id="btnPaginaAnterior" class="btn-pagina">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </button>
                    <div id="numerosPagina" class="numeros-pagina">
                        <!-- Los números se generan dinámicamente -->
                    </div>
                    <button id="btnPaginaSiguiente" class="btn-pagina">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        </section>

    
     
        <?php include "modalPrestamos.php"; ?>
        <?php include "modalActualizarPrestamos.php"; ?>
    </div>
    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="../js/configPrestamos.js"></script>
    <script src="../js/nuevosPrestamos.js"></script>
    <script src="../js/filtro_busqueda.js"></script>
    <script src="../js/estadisticas.js"></script>
    <script src="../js/paginacion.js"></script>
    <script src="../js/actualizarPrestamos.js"></script>
</body>

</html>