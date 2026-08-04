<!-- Modal -->
<div class="modal fade" id="modal_detalles" tabindex="-1" aria-labelledby="modalDetallesLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="modalDetallesLabel">Histórico Reparto Utilidades - <span class="badge bg-success" id="titulo_modal">TEMPORAL</span></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body" style="overflow-y: auto;">
                <!-- Filtros -->
                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <label class="form-label" for="detalle_busqueda">Busqueda:</label>
                        <input type="text" id="detalle_busqueda" class="form-control form-control-sm" placeholder="Buscar empleado...">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label" for="detalle_departamento">Departamento:</label>
                        <select id="detalle_departamento" class="form-select form-select-sm"></select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label" for="detalle_empresa">Empresa:</label>
                        <select id="detalle_empresa" class="form-select form-select-sm"></select>
                    </div>

                    <input type="text" id="detalle_empleados" hidden>
                    <input type="number" id="detalle_anio" hidden>
                    <input type="number" id="detalle_id_departamento" hidden>
                    <input type="text" id="detalle_nombre_departamento" hidden>
                </div>

                <!-- Tabla de Resultados -->
                <div class="table-responsive">
                    <table class="table table-sm table-striped table-hover shadow-sm">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>CLAVE</th>
                                <th>NOMBRE EMPLEADO</th>
                                <th>PUESTO</th>
                                <th>SALARIO</th>
                                <th class="text-center">DIAS PTU</th>
                                <th>PTU TOTAL</th>
                                <th>DISPERSION<br>TARJETA</th>
                                <th>NETO<br>PAGAR</th>
                                <th>REDONDEO</th>
                                <th>PAGAR<br>REDONDEADO</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider" id="cuerpo_tabla_detalles">
                            <!-- Los registros irán aquí -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <span>Fecha de Registro: <span id="fecha_registro_modal"></span></span>
                <button type="button" class="btn btn-success fw-bold ms-auto" id="btn_generar_excel_detalles"><i class="bi bi-file-earmark-excel-fill me-2"></i>Generar Excel</button>
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
            </div>

        </div>
    </div>
</div>