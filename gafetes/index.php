<?php
include("../conexion/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Gafetes</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/estilos.css">
    <link rel="stylesheet" href="../public/styles/main.css">
</head>
<body>
    <!-- Incluir la barra de navegación -->
    <?php include("../public/views/navbar.php"); ?>
    
    <div class="container mt-4">
        <h2 class="text-center mb-4">Generador de Gafetes</h2>
        
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">Departamentos</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group" id="listaDepartamentos">
                            <a href="#" class="list-group-item list-group-item-action active" data-departamento="todos">
                                <i class="bi bi-people-fill me-2"></i>Todos los empleados
                            </a>
                            <!-- Los departamentos se cargarán aquí dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <div class="d-flex align-items-center" style="flex-wrap: nowrap;">
                            <h5 class="card-title mb-0 me-3">Empleados</h5>
                            <div class="btn-toolbar ms-auto" role="toolbar" aria-label="Herramientas de selección">
                                <div class="btn-group btn-group-sm" role="group">
                                    <button id="seleccionarTodos" class="btn btn-light">
                                        <i class="bi bi-check2-square"></i> Seleccionar todos
                                    </button>
                                    <button id="deseleccionarTodos" class="btn btn-light">
                                        <i class="bi bi-square"></i> Deseleccionar
                                    </button>
                                    <button id="generarGafetes" class="btn btn-warning">
                                        <i class="bi bi-card-checklist"></i> Generar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="input-group input-group-sm mt-2">
                            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                            <input type="text" id="buscadorEmpleados" class="form-control" placeholder="Buscar por nombre o clave...">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="tablaEmpleados">
                                <thead>
                                    <tr>
                                        <th id="sortClave" data-sortable>
                                            Clave <span class="sort-icon"></span>
                                        </th>
                                        <th>Nombre</th>
                                        <th>Departamento</th>
                                        <th>Área</th>
                                        <th>Seleccionar</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpoTabla">
                                    <!-- Los empleados se cargarán aquí dinámicamente -->
                                </tbody>
                            </table>
                            <div class="d-flex justify-content-between align-items-center mt-3" id="paginacion">
                                <div class="text-muted" id="infoPaginacion">
                                    Mostrando <span id="inicio">0</span> a <span id="fin">0</span> de <span id="total">0</span> empleados
                                </div>
                                <nav>
                                    <ul class="pagination pagination-sm mb-0" id="controlesPaginacion">
                                        <li class="page-item disabled" id="anteriorPagina">
                                            <a class="page-link" href="#" tabindex="-1">Anterior</a>
                                        </li>
                                        <li class="page-item active"><a class="page-link" href="#" data-pagina="1">1</a></li>
                                        <li class="page-item" id="siguientePagina">
                                            <a class="page-link" href="#">Siguiente</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para previsualizar gafetes -->
    <div class="modal fade" id="modalGafetes" tabindex="-1" aria-labelledby="modalGafetesLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalGafetesLabel">Vista Previa de Gafetes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="contenidoGafetes">
                    <!-- Aquí se mostrarán los gafetes -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="imprimirGafetes">
                        <i class="bi bi-printer"></i> Imprimir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/funciones.js"></script>
</body>
</html>
