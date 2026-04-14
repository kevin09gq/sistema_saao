
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
														<th class="text-center">TOTAL HORAS</th>
														<th class="text-center">HORAS COMIDA</th>
														<th class="text-center">MINUTOS</th>
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
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Viernes" name="total_horas_viernes" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Viernes" name="horas_comida_viernes" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Viernes" name="minutos_viernes" readonly></td>
							</tr>
							<tr data-dia="Sábado">
								<td class="text-center fw-semibold text-primary">Sábado</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Sabado" name="entrada_sabado" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Sabado" name="entrada_comida_sabado" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Sabado" name="salida_comida_sabado" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Sabado" name="salida_sabado" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Sabado" name="total_horas_sabado" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Sabado" name="horas_comida_sabado" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Sabado" name="minutos_sabado" readonly></td>
							</tr>
							<tr data-dia="Domingo">
								<td class="text-center fw-semibold text-primary">Domingo</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Domingo" name="entrada_domingo" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Domingo" name="entrada_comida_domingo" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Domingo" name="salida_comida_domingo" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Domingo" name="salida_domingo" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Domingo" name="total_horas_domingo" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Domingo" name="horas_comida_domingo" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Domingo" name="minutos_domingo" readonly></td>
							</tr>
							<tr data-dia="Lunes">
								<td class="text-center fw-semibold text-primary">Lunes</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Lunes" name="entrada_lunes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Lunes" name="entrada_comida_lunes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Lunes" name="salida_comida_lunes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Lunes" name="salida_lunes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Lunes" name="total_horas_lunes" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Lunes" name="horas_comida_lunes" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Lunes" name="minutos_lunes" readonly></td>
							</tr>
							<tr data-dia="Martes">
								<td class="text-center fw-semibold text-primary">Martes</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Martes" name="entrada_martes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Martes" name="entrada_comida_martes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Martes" name="salida_comida_martes" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Martes" name="salida_martes" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Martes" name="total_horas_martes" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Martes" name="horas_comida_martes" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Martes" name="minutos_martes" readonly></td>
							</tr>
							<tr data-dia="Miércoles">
								<td class="text-center fw-semibold text-primary">Miércoles</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Miercoles" name="entrada_miercoles" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Miercoles" name="entrada_comida_miercoles" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Miercoles" name="salida_comida_miercoles" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Miercoles" name="salida_miercoles" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Miercoles" name="total_horas_miercoles" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Miercoles" name="horas_comida_miercoles" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Miercoles" name="minutos_miercoles" readonly></td>
							</tr>
							<tr data-dia="Jueves">
								<td class="text-center fw-semibold text-primary">Jueves</td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada text-center input-hora" data-role="hora" data-dia="Jueves" name="entrada_jueves" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-entrada-comida text-center input-hora" data-role="hora" data-dia="Jueves" name="entrada_comida_jueves" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida-comida text-center input-hora" data-role="hora" data-dia="Jueves" name="salida_comida_jueves" placeholder="HH:MM"></td>
							<td class="text-center"><input type="text" class="form-control form-control-sm input-salida text-center input-hora" data-role="hora" data-dia="Jueves" name="salida_jueves" placeholder="HH:MM"></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm total-horas text-success text-center" data-dia="Jueves" name="total_horas_jueves" readonly></td>
								<td class="text-center"><input type="text" class="form-control form-control-sm horas-comida text-warning text-center" data-dia="Jueves" name="horas_comida_jueves" readonly></td>
								<td class="text-center"><input type="number" class="form-control form-control-sm minutos-dia text-muted text-center" data-dia="Jueves" name="minutos_jueves" readonly></td>
							</tr>
							<!-- Fila de totales (vista) -->
							<tr class="table-primary">
								<td class="text-center fw-bold">TOTAL</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td class="text-center"><input type="text" id="total_horas_semana" class="form-control form-control-sm total-horas text-success text-center" readonly></td>
								<td class="text-center"><input type="text" id="total_horas_comida_semana" class="form-control form-control-sm horas-comida text-warning text-center" readonly></td>
								<td class="text-center"><input type="number" id="total_minutos_semana" class="form-control form-control-sm minutos-dia text-muted text-center" readonly></td>
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

