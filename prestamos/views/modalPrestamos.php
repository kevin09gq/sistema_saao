<!-- Modal para registrar un nuevo préstamo -->
<div class="modal fade" id="modalNuevoPresupuesto" tabindex="-1" aria-labelledby="modalNuevoPresupuestoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalNuevoPresupuestoLabel">Registrar Nuevo Préstamo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="formNuevoPrestamo">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="nombreEmpleado" class="form-label">Buscar Empleado</label>
                            <div style="position: relative;">
                                <input type="text" class="form-control" id="nombreEmpleado" name="nombreEmpleado" placeholder="Escribe nombre, apellido o clave..." autocomplete="off" required>
                                <input type="hidden" id="empleadoIdSeleccionado" name="empleadoIdSeleccionado">
                                <div id="listaEmpleados" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ddd; border-radius: 5px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label for="descripcionPrestamo" class="form-label">Descripción del Préstamo</label>
                            <textarea class="form-control" id="descripcionPrestamo" name="descripcionPrestamo" rows="2" placeholder="Ej: Préstamo para gastos personales" required></textarea>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="conceptoPrestamo" class="form-label">Concepto</label>
                            <input type="text" class="form-control" id="conceptoPrestamo" name="conceptoPrestamo" placeholder="Ej: Emergencia médica" required>
                        </div>
                        <div class="col-md-6">
                            <label for="montoConcepto" class="form-label">Monto del Concepto</label>
                            <input type="number" step="0.01" class="form-control" id="montoConcepto" name="montoConcepto" placeholder="Ej: 5000" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="totalSemanas" class="form-label">Total de Semanas</label>
                            <input type="number" class="form-control" id="totalSemanas" name="totalSemanas" placeholder="Ej: 10" required>
                        </div>
                        <div class="col-md-6">
                            <label for="montoSemanal" class="form-label">Monto Semanal</label>
                            <input type="number" step="0.01" class="form-control" id="montoSemanal" name="montoSemanal" placeholder="Ej: 500" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="submit" form="formNuevoPrestamo" class="btn btn-primary">Guardar Préstamo</button>
            </div>
        </div>
    </div>
</div>