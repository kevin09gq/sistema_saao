<!-- Modal Actualizar Empleado -->
<div class="modal fade" id="modal_actualizar_empleado" tabindex="-1" aria-labelledby="modalActualizarEmpleadoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="form_modal_actualizar_empleado">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalActualizarEmpleadoLabel"><i class="bi bi-pencil-square me-2"></i>Actualizar Empleado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <!-- Datos del empleado -->
                    <input type="hidden" id="modal_id_empleado" name="id_empleado">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="modal_clave_empleado" class="form-label">Clave</label>
                            <input type="text" class="form-control" id="modal_clave_empleado" name="clave_empleado" readonly>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_nombre_empleado" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="modal_nombre_empleado" name="nombre_empleado">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_apellido_paterno" class="form-label">Apellido Paterno</label>
                            <input type="text" class="form-control" id="modal_apellido_paterno" name="apellido_paterno">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="modal_apellido_materno" class="form-label">Apellido Materno</label>
                            <input type="text" class="form-control" id="modal_apellido_materno" name="apellido_materno">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_domicilio" class="form-label">Domicilio</label>
                            <input type="text" class="form-control" id="modal_domicilio" name="domicilio">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_imss" class="form-label">IMSS</label>
                            <input type="text" class="form-control" id="modal_imss" name="imss">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="modal_curp" class="form-label">CURP</label>
                            <input type="text" class="form-control" id="modal_curp" name="curp">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_sexo" class="form-label">Sexo</label>
                            <select class="form-select" id="modal_sexo" name="sexo">
                                <option value="">Selecciona</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_grupo_sanguineo" class="form-label">Grupo Sanguíneo</label>
                            <input type="text" class="form-control" id="modal_grupo_sanguineo" name="grupo_sanguineo">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="modal_enfermedades_alergias" class="form-label">Enfermedades/Alergias</label>
                            <input type="text" class="form-control" id="modal_enfermedades_alergias" name="enfermedades_alergias">
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="modal_fecha_ingreso" class="form-label">Fecha de Ingreso</label>
                            <input type="date" class="form-control" id="modal_fecha_ingreso" name="fecha_ingreso">
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="modal_departamento" class="form-label">Departamento</label>
                            <select class="form-select" id="modal_departamento" name="id_departamento">

                            </select>
                        </div>
                    </div>
                    <hr>
                    <!-- Contacto de emergencia -->
                    <div class="form-section-title mb-3">
                        <i class="bi bi-exclamation-triangle-fill section-icon"></i>
                        <span class="fs-5 fw-semibold">Contacto de Emergencia</span>
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="modal_emergencia_nombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="modal_emergencia_nombre" name="emergencia_nombre">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_emergencia_ap_paterno" class="form-label">Apellido Paterno</label>
                            <input type="text" class="form-control" id="modal_emergencia_ap_paterno" name="emergencia_ap_paterno">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="modal_emergencia_ap_materno" class="form-label">Apellido Materno</label>
                            <input type="text" class="form-control" id="modal_emergencia_ap_materno" name="emergencia_ap_materno">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="modal_emergencia_telefono" class="form-label">Teléfono</label>
                            <input type="text" class="form-control" id="modal_emergencia_telefono" name="emergencia_telefono">
                        </div>
                        <div class="col-md-5 mb-3">
                            <label for="modal_emergencia_domicilio" class="form-label">Domicilio</label>
                            <input type="text" class="form-control" id="modal_emergencia_domicilio" name="emergencia_domicilio">
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="modal_emergencia_parentesco" class="form-label">Parentesco</label>
                            <input type="text" class="form-control" id="modal_emergencia_parentesco" name="emergencia_parentesco">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" id="btn_actualizar" class="btn btn-primary">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>
</div>