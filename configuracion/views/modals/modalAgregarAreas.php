<!-- ==========================================================================
     MODAL: AGREGAR NUEVA ÁREA
     Descripción: Modal para crear una nueva área en el sistema
     Campos del formulario:
       - nombre_area (obligatorio): Nombre del área
       - logo_area (opcional): Archivo de imagen para el logo
       - colores (opcional): Color de fondo en formato hexadecimal
       - colores_texto (opcional): Color de texto en formato hexadecimal
     ========================================================================== -->
<div class="modal fade" id="modalAgregarArea" tabindex="-1" aria-labelledby="modalAgregarAreaLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalAgregarAreaLabel">
                    <i class="bi bi-diagram-3 text-success me-2"></i>
                    Nueva área
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formAgregarArea">
                    <div class="row g-3">
                        <!-- Nombre del área (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="agregarNombreArea">Nombre del área</label>
                            <input type="text" class="form-control" id="agregarNombreArea" name="nombre_area" required placeholder="Ingresa el nombre del área">
                        </div>
                        <!-- Logo del área (upload de imagen) -->
                        <div class="col-md-6">
                            <label class="form-label" for="agregarLogoArea">Logo del área</label>
                            <input type="file" class="form-control" id="agregarLogoArea" name="logo_area" accept="image/*">
                            <small class="text-muted">Formatos aceptados: JPG, PNG, GIF</small>
                        </div>
                        <!-- Color de fondo (opcional) -->
                        <div class="col-md-6">
                            <label class="form-label" for="agregarColores">Color de fondo</label>
                            <div class="input-group">
                                <input type="color" class="form-control form-control-color" id="agregarColores" name="colores" value="#6c757d" style="width: 60px;">
                                <input type="text" class="form-control" id="agregarColoresText" name="colores_text" value="#6c757d" placeholder="#6c757d" maxlength="7">
                            </div>
                        </div>
                        <!-- Color de texto (opcional) -->
                        <div class="col-md-6">
                            <label class="form-label" for="agregarColoresTexto">Color de texto</label>
                            <div class="input-group">
                                <input type="color" class="form-control form-control-color" id="agregarColoresTexto" name="colores_texto" value="#ffffff" style="width: 60px;">
                                <input type="text" class="form-control" id="agregarColoresTextoText" name="colores_texto_text" value="#ffffff" placeholder="#ffffff" maxlength="7">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <!-- Pie del modal con botones de acción -->
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnGuardarArea">
                    <i class="bi bi-save2"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>
