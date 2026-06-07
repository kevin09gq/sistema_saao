<div class="modal fade" id="modal_area_departamento" tabindex="-1" aria-labelledby="modal_area_departamento_label"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="modal_area_departamento_label">Áreas del Departamento: <span
                        id="nombre_depa_area">prueba</span></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info mb-2">
                    <i class="bi bi-info-circle me-2"></i>Seleccione las áreas a las que pertenece el departamento.
                </div>
                <div class="mb-2">
                    <label class="form-label">Seleccionar áreas</label>
                    <div class="input-group mb-3">
                        <select class="form-select" name="select_area_dep" id="select_area_dep"
                            aria-describedby="btn_agregar_area_dep"></select>
                        <button class="btn btn-outline-success" type="button" id="btn_agregar_area_dep"><i
                                class="bi bi-diagram-3-fill me-2"></i>Asignar</button>
                    </div>
                    <input type="number" id="id_departamento_modal_area" hidden>
                </div>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>ÁREA</th>
                            <th>ACCION</th>
                        </tr>
                    </thead>
                    <tbody id="tbody_area_dep"></tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>