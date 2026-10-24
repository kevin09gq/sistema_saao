<!-- ==========================================================================
     MODAL: EDITAR ÁREA
     Descripción: Modal para editar los datos de un área existente
     ========================================================================== -->
     
<div class="modal fade" id="modalEditarArea" tabindex="-1" aria-labelledby="modalEditarAreaLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalEditarAreaLabel">
                    <i class="bi bi-diagram-3 text-success me-2"></i>
                    Editar área
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formEditarArea">
                    <!-- Campo oculto para el ID del área -->
                    <input type="hidden" id="editarIdArea" name="id_area">
                    <div class="row g-3">
                        <!-- Nombre del área (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="editarNombreArea">Nombre del área</label>
                            <input type="text" class="form-control" id="editarNombreArea" name="nombre_area" required placeholder="Ingresa el nombre del área">
                        </div>
                        <!-- Color de fondo (opcional) -->
                        <div class="col-md-6">
                            <label class="form-label" for="editarColores">Color de fondo</label>
                            <div class="input-group">
                                <input type="color" class="form-control form-control-color" id="editarColores" name="colores" value="#6c757d" style="width: 60px;">
                                <input type="text" class="form-control" id="editarColoresText" name="colores_text" value="#6c757d" placeholder="#6c757d" maxlength="7">
                            </div>
                        </div>
                        <!-- Color de texto (opcional) -->
                        <div class="col-md-6">
                            <label class="form-label" for="editarColoresTexto">Color de texto</label>
                            <div class="input-group">
                                <input type="color" class="form-control form-control-color" id="editarColoresTexto" name="colores_texto" value="#ffffff" style="width: 60px;">
                                <input type="text" class="form-control" id="editarColoresTextoText" name="colores_texto_text" value="#ffffff" placeholder="#ffffff" maxlength="7">
                            </div>
                        </div>
                    </div>
                
                </form>
            </div>
            <!-- Pie del modal con botones de acción -->
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnActualizarArea">
                    <i class="bi bi-save2"></i> Actualizar
                </button>
            </div>
        </div>
    </div>
</div>
