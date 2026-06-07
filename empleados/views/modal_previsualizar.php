<div class="modal fade" id="modal_previsualizar" tabindex="-1" aria-labelledby="modalPrevisualizarLabel" aria-hidden="true">
	<div class="modal-dialog modal-fullscreen">
		<div class="modal-content border-0 shadow">
			<div class="modal-header bg-success text-white">
				<div class="d-flex align-items-center gap-3">
					<i class="bi bi-eye fs-4"></i>
					<div>
						<h5 class="modal-title mb-0" id="modalPrevisualizarLabel">Previsualización de datos</h5>
						<small class="opacity-75">Así se verá la información en el archivo Excel.</small>
					</div>
					<span class="badge bg-light text-success ms-2" id="preview_total_empleados">0 empleados</span>
				</div>
				<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
			</div>

			<div class="modal-body bg-light p-0">
				<!-- Barra de herramientas -->
				<div class="d-flex justify-content-between align-items-center px-3 py-2 bg-white border-bottom">
					<div class="d-flex align-items-center gap-2">
						<span class="text-muted small"><i class="bi bi-table me-1"></i>Vista previa de los datos seleccionados</span>
					</div>
					<div class="d-flex gap-2">
						<button type="button" class="btn btn-sm btn-outline-success" id="btn_preview_descargar" title="Descargar desde previsualización">
							<i class="bi bi-download me-1"></i>Descargar Excel
						</button>
					</div>
				</div>

				<!-- Pestañas -->
				<ul class="nav nav-tabs px-3 pt-2 bg-white d-none" id="preview_tabs" role="tablist">
					<li class="nav-item" role="presentation" id="preview_tab_info_item">
						<button class="nav-link active" id="preview-tab-info" data-bs-toggle="tab" data-bs-target="#preview_pane_info" type="button" role="tab">
							<i class="bi bi-people me-1"></i>Información
						</button>
					</li>
					<li class="nav-item d-none" role="presentation" id="preview_tab_horario_item">
						<button class="nav-link" id="preview-tab-horario" data-bs-toggle="tab" data-bs-target="#preview_pane_horario" type="button" role="tab">
							<i class="bi bi-clock me-1"></i>Horarios
						</button>
					</li>
					<li class="nav-item d-none" role="presentation" id="preview_tab_horario_oficial_item">
						<button class="nav-link" id="preview-tab-horario-oficial" data-bs-toggle="tab" data-bs-target="#preview_pane_horario_oficial" type="button" role="tab">
							<i class="bi bi-clock-history me-1"></i>Horario Oficial
						</button>
					</li>
					<li class="nav-item d-none" role="presentation" id="preview_tab_reingresos_item">
						<button class="nav-link" id="preview-tab-reingresos" data-bs-toggle="tab" data-bs-target="#preview_pane_reingresos" type="button" role="tab">
							<i class="bi bi-arrow-repeat me-1"></i>Reingresos
						</button>
					</li>
				</ul>

				<!-- Contenido de pestañas -->
				<div class="tab-content preview-table-wrapper" id="preview_tab_content">

					<!-- Pestaña Información -->
					<div class="tab-pane fade show active h-100" id="preview_pane_info" role="tabpanel">
						<div class="text-center text-muted py-5" id="preview_estado_carga">
							<div class="spinner-border text-success" role="status"></div>
							<div class="mt-2">Cargando previsualización...</div>
						</div>
						<div class="table-responsive d-none" id="preview_table_container">
							<table class="table table-bordered table-sm table-hover mb-0 preview-excel-table" id="preview_table">
								<thead id="preview_thead"></thead>
								<tbody id="preview_tbody"></tbody>
							</table>
						</div>
						<div class="d-none" id="preview_sin_datos">
							<div class="alert alert-warning m-4 text-center">
								<i class="bi bi-exclamation-triangle me-2"></i>No se encontraron datos para la selección realizada.
							</div>
						</div>
					</div>

					<!-- Pestaña Horarios (reloj) -->
					<div class="tab-pane fade h-100" id="preview_pane_horario" role="tabpanel">
						<div class="p-3" id="preview_horarios_reloj_content"></div>
					</div>

					<!-- Pestaña Horario Oficial -->
					<div class="tab-pane fade h-100" id="preview_pane_horario_oficial" role="tabpanel">
						<div class="p-3" id="preview_horarios_oficial_content"></div>
					</div>

					<!-- Pestaña Reingresos -->
					<div class="tab-pane fade h-100" id="preview_pane_reingresos" role="tabpanel">
						<div class="p-3" id="preview_reingresos_content"></div>
					</div>

				</div>
			</div>

			<div class="modal-footer bg-white py-2">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
			</div>
		</div>
	</div>
</div>

<style>
	.preview-table-wrapper {
		height: calc(100vh - 140px);
		overflow: auto;
	}

	.preview-excel-table {
		font-size: 0.78rem;
		border-collapse: collapse;
		white-space: nowrap;
		min-width: 100%;
	}

	.preview-excel-table thead th {
		background-color: #06750E;
		color: #fff;
		border: 1px solid #055a0a;
		padding: 6px 10px;
		position: sticky;
		top: 0;
		z-index: 2;
		font-weight: 600;
		text-align: center;
		white-space: nowrap;
	}

	.preview-excel-table tbody td {
		border: 1px solid #dee2e6;
		padding: 4px 8px;
		vertical-align: middle;
		white-space: nowrap;
		max-width: 320px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Cuando la celda tiene saltos de línea explícitos (<br>) */
	.preview-excel-table tbody td.has-breaks {
		white-space: normal;
		overflow: visible;
		text-overflow: unset;
	}

	.preview-excel-table tbody tr:nth-child(even) {
		background-color: #f8fff8;
	}

	.preview-excel-table tbody tr:hover {
		background-color: #e6f4ea;
	}

	/* Columna de número de fila estilo Excel */
	.preview-excel-table thead th.row-number-header,
	.preview-excel-table tbody td.row-number-cell {
		background-color: #f0f0f0;
		color: #666;
		text-align: center;
		font-weight: 600;
		width: 40px;
		min-width: 40px;
		border-right: 2px solid #ccc;
		white-space: nowrap;
	}

	/* Encabezado de grupo (fila superior) */
	.preview-excel-table thead th.group-header-cell {
		background-color: #f8f9fa;
		color: #212529;
		border: 1px solid #dee2e6;
		border-bottom: 2px solid #06750E;
		padding: 7px 12px;
		font-size: 0.82rem;
		font-weight: 700;
		text-align: center;
		letter-spacing: 0.3px;
		text-transform: uppercase;
		position: sticky;
		top: 0;
		z-index: 3;
	}

	.preview-excel-table thead th.group-header-cell.group-empleado {
		background-color: #e8f5e9;
		color: #1b5e20;
		border-bottom-color: #2e7d32;
	}

	.preview-excel-table thead th.group-header-cell.group-emergencia {
		background-color: #fff3e0;
		color: #e65100;
		border-bottom-color: #ef6c00;
	}

	.preview-excel-table thead th.group-header-cell.group-beneficiario {
		background-color: #e3f2fd;
		color: #0d47a1;
		border-bottom-color: #1565c0;
	}

	/* La fila de columnas debajo del grupo header queda sticky debajo de él */
	.preview-excel-table thead th:not(.group-header-cell) {
		position: sticky;
		top: var(--group-header-height, 0px);
		z-index: 2;
	}

	/* Bloque de horario por empleado */
	.preview-horario-bloque {
		margin-bottom: 1.5rem;
	}

	.preview-horario-bloque .empleado-header {
		background-color: #f0f8f0;
		border: 1px solid #c3e6cb;
		border-radius: 6px 6px 0 0;
		padding: 8px 14px;
		font-weight: 600;
		font-size: 0.85rem;
		color: #155724;
	}

	.preview-horario-bloque table {
		font-size: 0.78rem;
		border-collapse: collapse;
		width: 100%;
		max-width: 600px;
	}

	.preview-horario-bloque table thead th {
		background-color: #06750E;
		color: #fff;
		border: 1px solid #055a0a;
		padding: 5px 12px;
		font-weight: 600;
		text-align: center;
		white-space: nowrap;
	}

	.preview-horario-bloque table tbody td {
		border: 1px solid #dee2e6;
		padding: 4px 10px;
		text-align: center;
		white-space: nowrap;
	}

	.preview-horario-bloque table tbody tr:nth-child(even) {
		background-color: #f8fff8;
	}

	.preview-horario-bloque table tbody tr:hover {
		background-color: #e6f4ea;
	}

	#preview_tabs .nav-link {
		font-size: 0.85rem;
		padding: 6px 14px;
		color: #198754;
		border: none;
		border-bottom: 2px solid transparent;
	}

	#preview_tabs .nav-link.active {
		color: #06750E;
		border-bottom: 2px solid #06750E;
		font-weight: 600;
		background: transparent;
	}
</style>
