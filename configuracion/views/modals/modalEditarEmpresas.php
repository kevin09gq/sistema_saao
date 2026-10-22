<!-- ==========================================================================
     MODAL: EDITAR EMPRESA
     Descripción: Modal para editar los datos de una empresa existente
     ========================================================================== -->
     
<div class="modal fade" id="modalEditarEmpresa" tabindex="-1" aria-labelledby="modalEditarEmpresaLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalEditarEmpresaLabel">
                    <i class="bi bi-building-gear text-success me-2"></i>
                    Editar empresa
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formEditarEmpresa">
                    <!-- Campo oculto para el ID de la empresa -->
                    <input type="hidden" id="editarIdEmpresa" name="id_empresa">
                    <div class="row g-3">
                        <!-- Nombre de la empresa (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="editarNombreEmpresa">Nombre de la empresa </label>
                            <input type="text" class="form-control" id="editarNombreEmpresa" name="nombre_empresa" required placeholder="Ingresa el nombre de la empresa">
                        </div>
                        <!-- RFC (opcional, máximo 12 caracteres) -->
                        <div class="col-12">
                            <label class="form-label" for="editarRfcEmpresa">RFC</label>
                            <input type="text" class="form-control" id="editarRfcEmpresa" name="rfc_empresa" placeholder="Ingresa el RFC" maxlength="12">
                        </div>
                        <!-- Domicilio fiscal (opcional) -->
                        <div class="col-12">
                            <label class="form-label" for="editarDomicilioFiscal">Domicilio fiscal</label>
                            <input type="text" class="form-control" id="editarDomicilioFiscal" name="domicilio_fiscal" placeholder="Ingresa el domicilio fiscal">
                        </div>
                    </div>
                
                </form>
            </div>
            <!-- Pie del modal con botones de acción -->
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnActualizarEmpresa">
                    <i class="bi bi-save2"></i> Actualizar
                </button>
            </div>
        </div>
    </div>
</div>
