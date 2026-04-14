<!-- =================================================== 
*** MODAL DE INCIDENCIAS ***
Este modal se utiliza para mostrar y gestionar las incidencias
de vacaciones e incapacidades de los empleados durante el
periodo, esto proviene de la lista de raya
=====================================================-->
<div class="modal fade" id="modalIncidencias" tabindex="-1" aria-labelledby="modalIncidenciasLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="modalIncidenciasLabel">
                    <i class="bi bi-calendar-event me-2"></i>Incidencias - Vacaciones e Incapacidades
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">

                <!-- Mensaje informativo -->
                <div class="alert alert-info py-2 mb-3" role="alert">
                    <i class="bi bi-info-circle me-1"></i>
                    <small>Aquí se listan los empleados que tienen <strong>vacaciones</strong> o <strong>incapacidades</strong> según la lista de raya. 
                    Selecciona los días específicos para cada empleado.</small>
                </div>

                <!-- Contenedor de carga -->
                <div id="incidencias-loading" class="text-center py-4" style="display:none;">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 text-muted">Buscando empleados con incidencias...</p>
                </div>

                <!-- Mensaje cuando no hay incidencias -->
                <div id="incidencias-vacio" class="text-center py-4" style="display:none;">
                    <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
                    <p class="mt-2 text-muted">No se encontraron empleados con vacaciones o incapacidades pendientes.</p>
                </div>

                <!-- Tabla principal de empleados con incidencias -->
                <div id="incidencias-contenido" style="display:none;">
                    <table class="table table-sm table-hover mb-0" id="tabla-incidencias">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 30px;"></th>
                                <th>Empleado</th>
                                <th>Departamento</th>
                                <th class="text-center">
                                    <span class="badge bg-success">Vacaciones</span>
                                </th>
                                <th class="text-center">
                                    <span class="badge bg-primary">Incapacidades</span>
                                </th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-incidencias">
                            <!-- Se llena dinámicamente -->
                        </tbody>
                    </table>
                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-success" id="btn-guardar-incidencias">
                    <i class="bi bi-save me-1"></i>Guardar Incidencias
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    #modalIncidencias .detalle-dias-row { background-color: #f8f9fa; }
    #modalIncidencias .detalle-dias-row td { padding: 0; }
    #modalIncidencias .detalle-dias-container { padding: 10px 15px; }
    #modalIncidencias .tabla-dias-incidencia { font-size: 0.85rem; margin-bottom: 0; }
    #modalIncidencias .tabla-dias-incidencia th { font-size: 0.75rem; text-transform: uppercase; color: #6c757d; }
    #modalIncidencias .tabla-dias-incidencia td { vertical-align: middle; }
    #modalIncidencias .check-incapacidad:checked { background-color: #0d6efd; border-color: #0d6efd; }
    #modalIncidencias .check-vacacion:checked { background-color: #198754; border-color: #198754; }
    #modalIncidencias .fila-empleado-incidencia { cursor: pointer; }
    #modalIncidencias .fila-empleado-incidencia:hover { background-color: #e9ecef; }
    #modalIncidencias .fila-empleado-incidencia .flecha-expand { transition: transform 0.2s; }
    #modalIncidencias .fila-empleado-incidencia.expandido .flecha-expand { transform: rotate(90deg); }
    #modalIncidencias .badge-estado-pendiente { background-color: #ffc107; color: #000; }
    #modalIncidencias .badge-estado-completo { background-color: #198754; }
    #modalIncidencias .badge-estado-parcial { background-color: #fd7e14; }
    #modalIncidencias .contador-seleccion { font-size: 0.8rem; font-weight: 600; }
    #modalIncidencias .tipo-actual-badge { font-size: 0.7rem; padding: 2px 6px; }
</style>