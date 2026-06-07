<div class="modal fade" id="modal_departamentos_area" tabindex="-1" aria-labelledby="modal_departamentos_area_label"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="modal_departamentos_area_label">Departamentos del Área: <span
                        id="nombre_area_detalle_dep">prueba</span></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info mb-2">
                    <i class="bi bi-info-circle me-2"></i>Seleccione los departamentos que forman parte del área.
                </div>
                <div class="mb-2">
                    <label class="form-label">Seleccionar departamentos</label>
                    <div class="input-group mb-3">
                        <select class="form-select" name="select_dep_area" id="select_dep_area"
                            aria-describedby="btn_agregar_dep_area"></select>
                        <button class="btn btn-outline-success" type="button" id="btn_agregar_dep_area"><i
                                class="bi bi-diagram-3-fill me-2"></i>Asignar</button>
                    </div>
                    <input type="number" id="id_area_modal_dep" hidden>
                </div>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>DEPARTAMENTO</th>
                            <th>ACCION</th>
                        </tr>
                    </thead>
                    <tbody id="tbody_dep_area"></tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>