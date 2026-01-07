<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Préstamos</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>

    </style>
</head>

<body>
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col-12">
                <h1 class="text-center">
                    <i class="fas fa-hand-holding-usd"></i> Sistema de Préstamos
                </h1>
            </div>
        </div>

        <!-- Tabs de Navegación -->
        <ul class="nav nav-tabs mb-4" id="prestamosTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="nuevo-tab" data-bs-toggle="tab" data-bs-target="#nuevo" type="button" role="tab">
                    <i class="fas fa-plus-circle"></i> Nuevo Préstamo
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="abonos-tab" data-bs-toggle="tab" data-bs-target="#abonos" type="button" role="tab">
                    <i class="fas fa-money-bill-wave"></i> Registrar Abonos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="consulta-tab" data-bs-toggle="tab" data-bs-target="#consulta" type="button" role="tab">
                    <i class="fas fa-search"></i> Consultar Préstamos
                </button>
            </li>
        </ul>

        <!-- Contenido de Tabs -->
        <div class="tab-content" id="prestamosTabsContent">

            <!-- Tab 1: Nuevo Préstamo -->
            <div class="tab-pane fade show active" id="nuevo" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-plus-circle"></i> Registrar Nuevo Préstamo
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="formNuevoPrestamo">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="empleado" class="form-label">Empleado</label>
                                        <input type="text" class="form-control" id="empleado" placeholder="Ingrese el nombre del empleado" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="montoInicial" class="form-label">Monto Inicial del Préstamo</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" id="montoInicial" step="0.01" min="0" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="fechaCreacion" class="form-label">Fecha del Préstamo</label>
                                        <input type="date" class="form-control" id="fechaCreacion" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="montoRestante" class="form-label">Monto Restante</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" id="montoRestante" step="0.01" readonly>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-save"></i> Registrar Préstamo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Registrar Abonos -->
            <div class="tab-pane fade" id="abonos" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-money-bill-wave"></i> Registrar Abonos por Semana
                        </h5>
                    </div>
                    <div class="card-body">
                        <form id="formAbonos">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="prestamo" class="form-label">Préstamo</label>
                                        <select class="form-select" id="prestamo" required>
                                            <option value="">Seleccionar préstamo...</option>
                                            <option value="1">ABREGU FLORES JHON JAIRO - $1,000.00</option>
                                            <option value="2">ACOSTA BECERRA JAIRO ALEJANDRO - $500.00</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="numeroSemana" class="form-label">Número de Semana</label>
                                        <input type="number" class="form-control" id="numeroSemana" min="1" max="52" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="montoAbono" class="form-label">Monto del Abono</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" id="montoAbono" step="0.01" min="0" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-plus-circle"></i> Registrar Abono
                                </button>
                            </div>
                        </form>

                        <!-- Lista de Abonos Recientes -->
                        <div class="mt-4">
                            <h6>Abonos Registrados Hoy</h6>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Empleado</th>
                                            <th>Semana</th>
                                            <th>Monto Abono</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>ABREGU FLORES JHON JAIRO</td>
                                            <td>51</td>
                                            <td>$100.00</td>
                                            <td>2024-12-20</td>
                                            <td>
                                                <button class="btn btn-sm btn-warning">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 3: Consultar Préstamos -->
            <div class="tab-pane fade" id="consulta" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-search"></i> Consultar Préstamos Activos
                        </h5>
                    </div>
                    <div class="card-body">
                        <!-- Filtros -->
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <input type="text" class="form-control" placeholder="Buscar por empleado...">
                            </div>
                            <div class="col-md-3">
                                <select class="form-select">
                                    <option value="">Todos los estados</option>
                                    <option value="activo">Activo</option>
                                    <option value="liquidado">Liquidado</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <input type="date" class="form-control" placeholder="Fecha desde">
                            </div>
                            <div class="col-md-2">
                                <button class="btn btn-primary w-100">
                                    <i class="fas fa-search"></i> Buscar
                                </button>
                            </div>
                        </div>

                        <!-- Tabla de Préstamos -->
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Empleado</th>
                                        <th>Monto Inicial</th>
                                        <th>Monto Restante</th>
                                        <th>Fecha Creación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>ABREGU FLORES JHON JAIRO</td>
                                        <td>$1,000.00</td>
                                        <td>$750.00</td>
                                        <td>2024-12-01</td>
                                        <td><span class="badge badge-warning">Activo</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-info" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" title="Ver abonos">
                                                <i class="fas fa-list"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>ACOSTA BECERRA JAIRO ALEJANDRO</td>
                                        <td>$500.00</td>
                                        <td>$0.00</td>
                                        <td>2024-11-15</td>
                                        <td><span class="badge badge-success">Liquidado</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-info" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" title="Ver abonos">
                                                <i class="fas fa-list"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>ACOSTA BECERRA JHON FREDY</td>
                                        <td>$2,000.00</td>
                                        <td>$1,200.00</td>
                                        <td>2024-12-10</td>
                                        <td><span class="badge badge-warning">Activo</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-info" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" title="Ver abonos">
                                                <i class="fas fa-list"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Paginación -->
                        <nav aria-label="Page navigation">
                            <ul class="pagination justify-content-center">
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" tabindex="-1">Anterior</a>
                                </li>
                                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                <li class="page-item"><a class="page-link" href="#">2</a></li>
                                <li class="page-item"><a class="page-link" href="#">3</a></li>
                                <li class="page-item">
                                    <a class="page-link" href="#">Siguiente</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Detalles de Préstamo -->
        <div class="modal fade" id="modalDetalles" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles del Préstamo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>ID Préstamo:</strong> <span id="detalleId">1</span></p>
                                <p><strong>Empleado:</strong> <span id="detalleEmpleado">ABREGU FLORES JHON JAIRO</span></p>
                                <p><strong>Monto Inicial:</strong> $<span id="detalleInicial">1,000.00</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Monto Restante:</strong> $<span id="detalleRestante">750.00</span></p>
                                <p><strong>Fecha Creación:</strong> <span id="detalleFecha">2024-12-01</span></p>
                                <p><strong>Estado:</strong> <span class="badge badge-warning">Activo</span></p>
                            </div>
                        </div>

                        <hr>

                        <h6>Historial de Abonos</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Semana</th>
                                        <th>Monto Abono</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>50</td>
                                        <td>$100.00</td>
                                        <td>2024-12-15</td>
                                    </tr>
                                    <tr>
                                        <td>51</td>
                                        <td>$150.00</td>
                                        <td>2024-12-22</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/prestamos.js"></script>
    <script src="../js/config_prestamos.js"></script>

</body>

</html>