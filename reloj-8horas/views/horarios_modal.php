<!-- =================================================== 
MODAL DE HORARIOS VARIABLES
Este modal permite al usuario ingresar los horarios
para aquellos empleados que no tienen un horario fijo,
principalmente para 40 y 10 libras, pero también
aplica en empleado de de produccion
=====================================================-->
<div class="modal fade" id="horariosModal" tabindex="-1" aria-labelledby="horariosModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">

            <div class="modal-header">
                <h1 class="modal-title fs-5" id="horariosModalLabel">Horarios Variables</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">

                <!-- Inputs para copiar horarios (arriba de la tabla) -->
                <div class="row g-2 mb-3 align-items-end">
                    <div class="col">
                        <label for="input_copiar_entrada" class="form-label mb-0">Entrada</label>
                        <input type="time" class="form-control" id="input_copiar_entrada">
                    </div>
                    <div class="col">
                        <label for="input_copiar_salida_comida" class="form-label mb-0">Salida Comida</label>
                        <input type="time" class="form-control" id="input_copiar_salida_comida">
                    </div>
                    <div class="col">
                        <label for="input_copiar_entrada_comida" class="form-label mb-0">Entrada Comida</label>
                        <input type="time" class="form-control" id="input_copiar_entrada_comida">
                    </div>
                    <div class="col">
                        <label for="input_copiar_salida" class="form-label mb-0">Salida</label>
                        <input type="time" class="form-control" id="input_copiar_salida">
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-outline-primary" id="btn-copiar-horario" title="Copiar horario"><i class="bi bi-copy"></i></button>
                    </div>
                </div>

                <div class="table-responsive">

                    <table class="table table-bordered table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Día</th>
                                <th>
                                    <span class="me-2" title="Comienzo de la jornada laboral">Entrada</span>
                                </th>
                                <th>
                                    <span class="me-2" title="Inicio de la hora de la comida">Salida Comida</span>
                                </th>
                                <th>
                                    <span class="me-2" title="Fin de la comida">Entrada comida</span>
                                </th>
                                <th>
                                    <span class="me-2" title="Fin de la jornada laboral">Salida</span>
                                </th>
                                <th>Eventos</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_horarios">
                            <?php for ($i = 1; $i <= 7; $i++): ?>
                                <tr>
                                    <td>
                                        <select class="form-select" name="horario_variable_dia[]">
                                            <option value="">Seleccionar...</option>
                                            <?php foreach (DIAS_SEMANA as $dia): ?>
                                                <option value="<?= htmlspecialchars($dia) ?>"><?= htmlspecialchars($dia) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                    <td>
                                        <input type="time" class="form-control" name="horario_variable_entrada[]" placeholder="Entrada">
                                    </td>
                                    <td>
                                        <input type="time" class="form-control" name="horario_variable_salida_comida[]" placeholder="Salida Comida">
                                    </td>
                                    <td>
                                        <input type="time" class="form-control" name="horario_variable_entrada_comida[]" placeholder="Entrada Comida">
                                    </td>
                                    <td>
                                        <input type="time" class="form-control" name="horario_variable_salida[]" placeholder="Salida">
                                    </td>
                                    <td>
                                        <input type="hidden" name="horario_variable_evento[]" value="">
                                        <div class="d-flex gap-1">
                                            <button type="button" class="btn btn-sm btn-outline-danger btn-limpiar-fila-horario" title="Limpiar fila">
                                                <i class="bi bi-eraser"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-primary btn-evento-dia" title="Definir evento del día">
                                                <i class="bi bi-calendar-event"></i>
                                            </button>
                                            <span class="badge bg-secondary evento-badge d-none"></span>
                                        </div>
                                    </td>
                                </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>

                    <!-- Script para copiar horarios a los primeros 5 registros -->
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const btnCopiar = document.getElementById('btn-copiar-horario');
                            if (btnCopiar) {
                                btnCopiar.addEventListener('click', function() {
                                    const entrada = document.getElementById('input_copiar_entrada').value;
                                    const salidaComida = document.getElementById('input_copiar_salida_comida').value;
                                    const entradaComida = document.getElementById('input_copiar_entrada_comida').value;
                                    const salida = document.getElementById('input_copiar_salida').value;
                                    const tbody = document.getElementById('tbody_horarios');
                                    if (!tbody) return;
                                    const filas = tbody.querySelectorAll('tr');
                                    for (let i = 0; i < 7 && i < filas.length; i++) {
                                        const inputs = filas[i].querySelectorAll('input[type="time"]');
                                        if (inputs.length === 4) {
                                            inputs[0].value = entrada;
                                            inputs[1].value = salidaComida;
                                            inputs[2].value = entradaComida;
                                            inputs[3].value = salida;
                                        }
                                    }
                                });
                            }
                        });
                    </script>
                </div>

                <div>
                    <h6 class="mb-3">Aplicar a:</h6>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="checkBoxProduccion" value="Produccion">
                        <label class="form-check-label" for="checkBoxProduccion">Producción</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="checkBoxProduccion40Libras" value="Produccion 40 Libras" checked>
                        <label class="form-check-label" for="checkBoxProduccion40Libras">Producción 40 Lbs</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="checkBoxProduccion10Libras" value="Produccion 10 Libras" checked>
                        <label class="form-check-label" for="checkBoxProduccion10Libras">Producción 10 Lbs</label>
                    </div>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
                <button type="button" class="btn btn-primary fw-bold" id="btn-guardar-horario-variable"><i class="bi bi-save me-2"></i>Guardar cambios</button>
            </div>

        </div>
    </div>
</div>