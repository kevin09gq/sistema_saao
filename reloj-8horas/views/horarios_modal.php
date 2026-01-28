<!-- Modal -->
<div class="modal fade" id="horariosModal" tabindex="-1" aria-labelledby="horariosModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">

            <div class="modal-header">
                <h1 class="modal-title fs-5" id="horariosModalLabel">Horarios Variables</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div class="table-responsive">


                    <!-- Inputs para copiar horarios (arriba de la tabla) -->
                    <div class="row mb-3 align-items-end">
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
                            <button type="button" class="btn btn-outline-primary" id="btn-copiar-horario">Copiar</button>
                        </div>
                    </div>

                    <table class="table table-bordered table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Día</th>
                                <th>Entrada</th>
                                <th>Salida Comida</th>
                                <th>Entrada Comida</th>
                                <th>Salida</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_horarios">
                            <?php
                            require_once __DIR__ . '/../../config/config.php';
                            $dias = defined('DIAS_SEMANA') ? constant('DIAS_SEMANA') : ["SABADO", "DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
                            for ($i = 1; $i <= 7; $i++): ?>
                                <tr>
                                    <td>
                                        <select class="form-select" name="horario_variable_dia[]">
                                            <option value="">Día</option>
                                            <?php foreach ($dias as $dia): ?>
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
                                    for (let i = 0; i < 5 && i < filas.length; i++) {
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
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary" id="btn-guardar-horario-variable">Guardar cambios</button>
            </div>

        </div>
    </div>
</div>