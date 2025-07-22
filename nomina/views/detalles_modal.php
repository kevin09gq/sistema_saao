<div class="modal-detalles" id="modal-detalles" style="display:none;">
    <div class="modal-detalles-content">
        <span class="modal-detalles-close" id="cerrar-modal-detalles">&times;</span>
        <ul class="nav nav-tabs mb-3" id="modalTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tab-info" data-bs-toggle="tab" data-bs-target="#tab_info" type="button" role="tab" aria-controls="tab_info" aria-selected="true">
                    Trabajador
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-conceptos" data-bs-toggle="tab" data-bs-target="#tab_conceptos" type="button" role="tab" aria-controls="tab_conceptos" aria-selected="false">
                    Conceptos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-registros" data-bs-toggle="tab" data-bs-target="#tab_registros" type="button" role="tab" aria-controls="tab_registros" aria-selected="false">
                    Registros
                </button>
            </li>
        </ul>
        <div class="tab-content">
            <!-- Info Trabajador -->
            <div class="tab-pane fade show active" id="tab_info" role="tabpanel" aria-labelledby="tab-info">
                <h4 style="margin-bottom:10px;">Detalles del empleado</h4>
                <div class="info-trabajador">
                    <div id="campo-nombre"><strong>Nombre:</strong> ALVAREZ SOSA LETICIA</div>
                    <div id="campo-clave"><strong>Clave:</strong> 3</div>
                    <div id="campo-neto-pagar"><strong>Neto a pagar:</strong> $1266.68</div>
                    <div id="campo-horas-totales"><strong>Horas totales:</strong> 37.10</div>
                    <div id="campo-tiempo-total"><strong>Tiempo total:</strong> 37:06</div>
                </div>
            </div>
            <!-- Conceptos -->
            <div class="tab-pane fade" id="tab_conceptos" role="tabpanel" aria-labelledby="tab-conceptos">
                <h4 style="margin-bottom:10px;">Conceptos</h4>
                <div class="conceptos-cards" id="conceptos-cards">
                    <!-- Aqui se ingresaran los conceptos del empleado -->
                </div>
            </div>
            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">
                <h4 style="margin-bottom:10px;">Registros de Entrada y Salida</h4>
                <ul class="registros-timeline" id="registros-cards">
                   

                </ul>
                <div class="registros-totales">
                    Horas totales: <span id="horas-totales">37.10</span> &nbsp; | &nbsp; Tiempo total: <span id="tiempo-total">37:06</span>
                </div>
            </div>
        </div>
        <div class="modal-detalles-footer" style="margin-top:24px; text-align:right;">
            <button type="button" id="btn-cancelar-detalles" class="btn btn-secondary" style="margin-right:10px;">Cancelar</button>
            <button type="button" id="btn-guardar-detalles" class="btn btn-success">Guardar</button>
        </div>
    </div>
</div>