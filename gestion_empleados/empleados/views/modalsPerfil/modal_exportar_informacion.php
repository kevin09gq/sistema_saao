<?php

$camposEmpleado = [
	['id' => 'imss', 'label' => 'IMSS'],
	['id' => 'rfc_empleado', 'label' => 'RFC'],
	['id' => 'curp', 'label' => 'CURP'],
	['id' => 'sexo', 'label' => 'Sexo'],
	['id' => 'fecha_nacimiento', 'label' => 'Fecha de nacimiento'],
	['id' => 'domicilio', 'label' => 'Domicilio'],
	['id' => 'telefono_empleado', 'label' => 'Teléfono'],
	['id' => 'grupo_sanguineo', 'label' => 'Grupo sanguíneo'],
	['id' => 'estado_civil', 'label' => 'Estado civil'],
	['id' => 'biometrico', 'label' => 'Biométrico'],
	['id' => 'num_casillero', 'label' => 'Número de casillero'],
	['id' => 'salario_semanal', 'label' => 'Salario semanal'],
	['id' => 'salario_diario', 'label' => 'Salario diario'],
	['id' => 'fecha_alta_empresa', 'label' => 'Fecha alta empresa'],
	['id' => 'fecha_alta_imss', 'label' => 'Fecha alta IMSS'],
	['id' => 'id_area', 'label' => 'Área'],
	['id' => 'id_departamento', 'label' => 'Departamento'],
	['id' => 'id_empresa', 'label' => 'Empresa'],
	['id' => 'id_puestoEspecial', 'label' => 'Puesto'],
	['id' => 'horario_reloj', 'label' => 'Horarios'],
    ['id' => 'horario_oficial', 'label' => 'Horario oficial'],
    ['id' => 'reingresos', 'label' => 'Reingresos'],
    
	['id' => 'status_nss', 'label' => 'Estatus'],
    ['id' => 'horario_fijo', 'label' => 'Horario fijo'],
];

$camposEmergencia = [
	['id' => 'emergencia_nombre', 'label' => 'Nombre'],
	['id' => 'emergencia_ap_paterno', 'label' => 'Apellido paterno'],
	['id' => 'emergencia_ap_materno', 'label' => 'Apellido materno'],
	['id' => 'emergencia_telefono', 'label' => 'Teléfono'],
	['id' => 'emergencia_parentesco', 'label' => 'Parentesco'],
	['id' => 'emergencia_domicilio', 'label' => 'Domicilio'],
];

$camposBeneficiario = [
	['id' => 'beneficiario_nombre', 'label' => 'Nombre'],
	['id' => 'beneficiario_ap_paterno', 'label' => 'Apellido paterno'],
	['id' => 'beneficiario_ap_materno', 'label' => 'Apellido materno'],
	['id' => 'beneficiario_parentesco', 'label' => 'Parentesco'],
	['id' => 'beneficiario_porcentaje', 'label' => 'Porcentaje'],
];

$renderChecklist = function (array $campos, string $prefijo) {
	foreach ($campos as $campo) {
		$inputId = $prefijo . '_' . $campo['id'];
		?>
		<label class="form-check list-group-item d-flex align-items-center gap-2 mb-2 rounded-3 campo-exportacion-item" for="<?= $inputId ?>">
			<input class="form-check-input mt-0 campo-exportacion-checkbox" type="checkbox" id="<?= $inputId ?>" name="campos_exportar[]" value="<?= $campo['id'] ?>">
			<span><?= $campo['label'] ?></span>
		</label>
		<?php
	}
};
?>

<div class="modal fade" id="modal_exportar_informacion" tabindex="-1" aria-labelledby="modalExportarInformacionLabel" aria-hidden="true">
	<div class="modal-dialog modal-xl modal-dialog-scrollable modal-exportar-info">
		<div class="modal-content border-0 shadow">
			<div class="modal-header bg-success text-white">
				<div>
					<h5 class="modal-title mb-0" id="modalExportarInformacionLabel">
						<i class="bi bi-funnel-fill me-2"></i>Exporta información
					</h5>
					<small class="opacity-75">Vista para seleccionar empleados y campos antes de generar el archivo.</small>
				</div>
				<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
			</div>

			<div class="modal-body bg-light">
				<div class="alert alert-success py-2 mb-3 d-flex justify-content-between align-items-center">
					<span>Si seleccionas horarios o reingresos, la clave y el nombre se muestran como encabezado de cada empleado; la hoja de información solo se genera si seleccionas esos campos.</span>
					<div class="form-check form-switch mb-0">
						<input class="form-check-input" type="checkbox" role="switch" id="check_unir_hojas_exportar" checked>
						<label class="form-check-label small fw-semibold" for="check_unir_hojas_exportar">Unir información en una sola hoja</label>
					</div>
				</div>
				<div class="row g-4">
					<div class="col-lg-5">
						<div class="card shadow-sm h-100">
							<div class="card-header bg-white d-flex justify-content-between align-items-center">
								<div>
									<h6 class="mb-0">Campos disponibles</h6>
									<small class="text-muted">Haz clic en cada sección para mostrar u ocultar sus campos.</small>
								</div>
								<span class="badge text-bg-success">3 secciones</span>
							</div>
							<div class="card-body panel-scroll">
								<div class="accordion accordion-flush" id="accordionCamposExportar">
									<div class="accordion-item mb-3 border rounded-3 overflow-hidden">
										<h2 class="accordion-header" id="headingEmpleado">
											<button class="accordion-button collapsed fw-semibold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEmpleado" aria-expanded="false" aria-controls="collapseEmpleado">
												Información del empleado
											</button>
										</h2>
										<div id="collapseEmpleado" class="accordion-collapse collapse" aria-labelledby="headingEmpleado" data-bs-parent="#accordionCamposExportar">
											<div class="accordion-body pt-2">
												<div class="list-group list-group-flush field-group">
													<?php $renderChecklist($camposEmpleado, 'empleado'); ?>
												</div>
											</div>
										</div>
									</div>

									<div class="accordion-item mb-3 border rounded-3 overflow-hidden">
										<h2 class="accordion-header" id="headingEmergencia">
											<button class="accordion-button collapsed fw-semibold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEmergencia" aria-expanded="false" aria-controls="collapseEmergencia">
												Emergencia
											</button>
										</h2>
										<div id="collapseEmergencia" class="accordion-collapse collapse" aria-labelledby="headingEmergencia" data-bs-parent="#accordionCamposExportar">
											<div class="accordion-body pt-2">
												<div class="list-group list-group-flush field-group">
													<?php $renderChecklist($camposEmergencia, 'emergencia'); ?>
												</div>
											</div>
										</div>
									</div>

									<div class="accordion-item border rounded-3 overflow-hidden">
										<h2 class="accordion-header" id="headingBeneficiarios">
											<button class="accordion-button collapsed fw-semibold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBeneficiarios" aria-expanded="false" aria-controls="collapseBeneficiarios">
												Beneficiarios
											</button>
										</h2>
										<div id="collapseBeneficiarios" class="accordion-collapse collapse" aria-labelledby="headingBeneficiarios" data-bs-parent="#accordionCamposExportar">
											<div class="accordion-body pt-2">
												<div class="list-group list-group-flush field-group">
													<?php $renderChecklist($camposBeneficiario, 'beneficiario'); ?>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-lg-7">
						<div class="card shadow-sm h-100">
							<div class="card-header bg-white d-flex flex-wrap gap-3 justify-content-between align-items-center">
								<div>
									<h6 class="mb-0">Lista de empleados</h6>
									<small class="text-muted">Cada registro tendrá su checkbox para seleccionarlo.</small>
								</div>
								<div class="d-flex flex-wrap gap-2">
									<select class="form-select form-select-sm" id="filtro-area-exportar" style="width: 150px;">
										<option value="todos">Todas las áreas</option>
									</select>
									<select class="form-select form-select-sm" id="filtro-departamento-exportar" style="width: 180px;">
										<option value="todos">Todos los departamentos</option>
									</select>
									<select class="form-select form-select-sm" id="filtro-seguro-exportar" style="width: 140px;">
										<option value="todos">Todos</option>
										<option value="con_seguro">Con Seguro</option>
										<option value="sin_seguro">Sin Seguro</option>
									</select>
									<div class="input-group input-group-sm employee-search position-relative">
										<span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
										<input type="text" class="form-control border-start-0" id="buscador-empleados-exportar" placeholder="Buscar empleado">
										<button type="button" id="btn-clear-buscador-exportar" class="btn-clear-search d-none" title="Limpiar">
											<i class="bi bi-x"></i>
										</button>
									</div>
								</div>
							</div>
							<div class="card-body">
								<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
									<div class="form-check">
										<input class="form-check-input" type="checkbox" id="check_todos_empleados_exportar">
										<label class="form-check-label fw-semibold" for="check_todos_empleados_exportar">Seleccionar todos</label>
									</div>
									<span class="badge text-bg-success" id="contador_empleados_exportar">0 empleados</span>
								</div>

								<div class="employee-list border rounded-3 bg-white p-2" id="lista_empleados_exportar">
									<div class="text-center text-muted py-5" id="estado_carga_empleados_exportar">
										<div class="spinner-border text-success" role="status" aria-hidden="true"></div>
										<div class="mt-2">Cargando empleados...</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="modal-footer bg-white">
				<button type="button" class="btn btn-outline-success" id="btn_previsualizar_empleados">
					<i class="bi bi-eye me-2"></i>Previsualización
				</button>
				<button type="button" class="btn btn-success" id="btn_descargar_excel_empleados">
					<i class="bi bi-file-earmark-excel me-2"></i>Descargar Excel
				</button>
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
			</div>
		</div>
	</div>
</div>
