<!-- Modal para Actualizar Biométrico -->
<div class="modal fade" id="biometricoModal" tabindex="-1" aria-labelledby="biometricoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Header del Modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="biometricoModalLabel">
                    <i class="bi bi-person-badge"></i> Actualizar Biométrico
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Body del Modal -->
            <div class="modal-body">
                <!-- Búsqueda de empleados -->
                <div class="mb-3">
                    <label for="buscar-empleado-biometrico" class="form-label">Buscar empleado:</label>
                    <input type="text" class="form-control"  id="buscar-empleado-biometrico" placeholder="Escribe nombre o clave..."
                    >
                </div>

                <!-- Botones Seleccionar/Deseleccionar Todos -->
                <div class="mb-3 d-flex gap-2">
                    <button type="button" class="btn btn-outline-success btn-sm" id="btn-seleccionar-todos-biometrico">
                        <i class="bi bi-check-all"></i> Seleccionar Todo
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="btn-deseleccionar-todos-biometrico">
                        <i class="bi bi-x-circle"></i> Deseleccionar Todo
                    </button>
                </div>

                <!-- Contenedor de lista de empleados -->
                <div class="list-group" id="lista-empleados-biometrico" style="max-height: 400px; overflow-y: auto;">
                    <!-- Se llenará con jQuery -->
                </div>

                <!-- Sección de carga de archivo, oculta inicialmente -->
                <div id="seccion-archivo-biometrico" class="mt-4" style="display:none;">
                    <label for="archivo-biometrico-modal" class="form-label">Selecciona archivo Excel del biométrico</label>
                    <input type="file" id="archivo-biometrico-modal" class="form-control" accept=".xls,.xlsx">
                </div>
            </div>

            <!-- Footer del Modal -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-siguiente-biometrico">
                    <i class="bi bi-arrow-right"></i> Siguiente
                </button>
            </div>
        </div>
    </div>
</div>
