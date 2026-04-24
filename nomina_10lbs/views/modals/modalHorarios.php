<div class="modal fade" id="modalHorarios" tabindex="-1" aria-labelledby="modalHorariosLabel" aria-hidden="true">
	<div class="modal-dialog modal-xl modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="modalHorariosLabel">Editar Horarios</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
			</div>
			<div class="modal-body">
				<div class="table-responsive">
					<table class="table table-striped table-bordered align-middle" id="tabla-horarios-modal">
						<thead class="table-success">
							<tr>
								<th class="text-center">DÍA</th>
								<th class="text-center">ENTRADA</th>
								<th class="text-center">ENTRADA COMIDA</th>
								<th class="text-center">TÉRMINO COMIDA</th>
								<th class="text-center">SALIDA</th>
							</tr>
						</thead>
						<tbody>
							<!-- Filas: Viernes -> Jueves -->
							<tr data-dia="Viernes">
								<td class="text-center fw-semibold text-primary">Viernes</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Viernes" name="entrada_viernes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Viernes" name="entrada_comida_viernes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Viernes" name="salida_comida_viernes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Viernes" name="salida_viernes" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Sábado">
								<td class="text-center fw-semibold text-primary">Sábado</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Sabado" name="entrada_sabado" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Sabado" name="entrada_comida_sabado" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Sabado" name="salida_comida_sabado" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Sabado" name="salida_sabado" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Domingo">
								<td class="text-center fw-semibold text-primary">Domingo</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Domingo" name="entrada_domingo" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Domingo" name="entrada_comida_domingo" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Domingo" name="salida_comida_domingo" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Domingo" name="salida_domingo" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Lunes">
								<td class="text-center fw-semibold text-primary">Lunes</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Lunes" name="entrada_lunes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Lunes" name="entrada_comida_lunes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Lunes" name="salida_comida_lunes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Lunes" name="salida_lunes" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Martes">
								<td class="text-center fw-semibold text-primary">Martes</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Martes" name="entrada_martes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Martes" name="entrada_comida_martes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Martes" name="salida_comida_martes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Martes" name="salida_martes" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Miércoles">
								<td class="text-center fw-semibold text-primary">Miércoles</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Miercoles" name="entrada_miercoles" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Miercoles" name="entrada_comida_miercoles" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Miercoles" name="salida_comida_miercoles" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Miercoles" name="salida_miercoles" placeholder="HH:MM"></td>
							</tr>
							<tr data-dia="Jueves">
								<td class="text-center fw-semibold text-primary">Jueves</td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Jueves" name="entrada_jueves" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Jueves" name="entrada_comida_jueves" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Jueves" name="salida_comida_jueves" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Jueves" name="salida_jueves" placeholder="HH:MM"></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
				<button type="button" class="btn btn-primary" id="btn_guardar_horarios_semanales">Guardar cambios</button>
			</div>
		</div>
	</div>
</div>