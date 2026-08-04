<?php
require_once __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Reparto de Utilidades (PTU) | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <style>
        /* Estilos personalizados para un look más limpio 
        .table thead th {
            background-color: #f8f9fa;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
            padding: 1rem;
        }

        .table tbody td {
            padding: 1rem;
            vertical-align: middle; 
        } */

        .card {
            border: none;
            border-radius: 12px;
        }

        .btn-dropdown-custom {
            background: transparent;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }

        .badge-status {
            font-weight: 500;
        }
    </style>

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main class="container-fluid py-4">

        <div class="row">
            <div class="col-12">
                <h2 class="fw-bold text-dark">Historial de PTU</h2>
                <p class="text-muted">Gestión y seguimiento de repartos de utilidades.</p>
            </div>
        </div>

        <!-- Filtros y Botón en una sola línea -->
        <div class="card shadow-sm p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <!-- Grupo de Filtros (Alineados a la izquierda) -->
                <div class="d-flex flex-grow-1 gap-2 flex-wrap">
                    <div style="width: 350px;">
                        <div class="input-group shadow-sm">
                            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control border-start-0" placeholder="Buscar..." id="busqueda">
                        </div>
                    </div>

                    <div style="width: 160px;">
                        <select class="form-select shadow-sm" id="filtro_anio">
                            <!-- Las opciones se llenarán dinámicamente mediante JavaScript -->
                        </select>
                    </div>

                    <div style="width: 200px;">
                        <select class="form-select shadow-sm" id="filtro_departamento">
                            <!-- Las opciones se llenarán dinámicamente mediante JavaScript -->
                        </select>
                    </div>

                     <div style="width: 160px;">
                        <select class="form-select shadow-sm" id="filtro_limite">
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="-1">Todos</option>
                        </select>
                    </div>
                </div>

                <!-- Botón Nuevo (Alineado a la derecha) -->
                <div>
                    <a href="utilidad.php" class="btn btn-primary px-4">
                        <i class="bi bi-plus-lg me-2"></i>Nuevo
                    </a>
                </div>

            </div>
        </div>

        <!-- Tabla Estilizada -->
        <div class="card shadow-sm">
            <div class="card-body p-0">
                <table class="table tabla-sm table-hover mb-3">
                    <thead>
                        <tr>
                            <th class="ps-4 text-muted">N°</th>
                            <th class="text-muted">Año</th>
                            <th class="text-muted">Departamento</th>
                            <th class="text-muted">Empleados</th>
                            <th class="text-muted">Total PTU</th>
                            <th class="text-muted">Dispersión</th>
                            <th class="text-muted">Neto</th>
                            <th class="text-muted">Registro</th>
                            <th class="text-center text-muted">Opciones</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo_tabla_principal">
                        <tr>
                            <td class="ps-4 fw-bold">001</td>
                            <td>2026</td>
                            <td><span class="badge bg-primary-subtle text-primary">Operaciones</span></td>
                            <td>15</td>
                            <td class="text-success fw-semibold">$50,000</td>
                            <td>$45,000</td>
                            <td>$5,000</td>
                            <td class="text-muted small">11 Jul 2026</td>
                            <td class="text-center">
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-dropdown-custom" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                        <li>
                                            <button class="dropdown-item"><i class="bi bi-eye me-2"></i>Ver Detalles</button>
                                        </li>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                        <li>
                                            <button class="dropdown-item text-danger"><i class="bi bi-trash me-2"></i>Eliminar</button>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Paginación -->
                <nav aria-label="Page navigation" id="contenedor_paginacion">
                    <ul class="pagination justify-content-center" id="paginacion">
                        <!-- Se genera dinámicamente -->
                    </ul>
                </nav>
                <!-- Contenedor para almacenar la página actual -->
                <div id="pagina_actual" data-pagina="1" style="display:none;"></div>
            </div>
        </div>

        <?php require_once __DIR__ . '/modal_historial/modal_detalles.php'; ?>

    </main>

    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Script para manejar la lógica de la página -->
    <script src="../js/historial/index.js"></script>
    <script src="../js/historial/detalles.js"></script>

</body>

</html>