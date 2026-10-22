<!-- ==========================================================================
     MODAL: AGREGAR NUEVA EMPRESA
     Descripción: Modal para crear una nueva empresa en el sistema
     Campos del formulario:
       - nombre_empresa (obligatorio): Nombre de la empresa
       - rfc_empresa (opcional): RFC de la empresa (máx 12 caracteres)
       - logo_empresa (opcional): Archivo de imagen para el logo
       - domicilio_fiscal (opcional): Dirección fiscal de la empresa
     ========================================================================== -->
<div class="modal fade" id="modalAgregarEmpresa" tabindex="-1" aria-labelledby="modalAgregarEmpresaLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalAgregarEmpresaLabel">
                    <i class="bi bi-building-gear text-success me-2"></i>
                    Nueva empresa
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formAgregarEmpresa">
                    <div class="row g-3">
                        <!-- Nombre de la empresa (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="agregarNombreEmpresa">Nombre de la empresa</label>
                            <input type="text" class="form-control" id="agregarNombreEmpresa" name="nombre_empresa" required placeholder="Ingresa el nombre de la empresa">
                        </div>
                        <!-- RFC (opcional, máximo 12 caracteres) -->
                        <div class="col-md-6">
                            <label class="form-label" for="agregarRfcEmpresa">RFC</label>
                            <input type="text" class="form-control" id="agregarRfcEmpresa" name="rfc_empresa" placeholder="Ingresa el RFC" maxlength="12">
                        </div>
                        <!-- Logo de la empresa (upload de imagen) -->
                        <div class="col-md-6">
                            <label class="form-label" for="agregarLogoEmpresa">Logo de la empresa</label>
                            <input type="file" class="form-control" id="agregarLogoEmpresa" name="logo_empresa" accept="image/*">
                            <small class="text-muted">Formatos aceptados: JPG, PNG, GIF</small>
                        </div>
                        <!-- Domicilio fiscal (opcional) -->
                        <div class="col-12">
                            <label class="form-label" for="agregarDomicilioFiscal">Domicilio fiscal</label>
                            <input type="text" class="form-control" id="agregarDomicilioFiscal" name="domicilio_fiscal" placeholder="Ingresa el domicilio fiscal">
                        </div>
                    </div>
                    <!-- Nota informativa sobre campos obligatorios -->
                   
                </form>
            </div>
            <!-- Pie del modal con botones de acción -->
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnGuardarEmpresa">
                    <i class="bi bi-save2"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>
