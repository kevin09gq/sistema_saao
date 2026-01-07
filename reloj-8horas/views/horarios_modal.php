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
                            <?php for ($i = 1; $i <= 7; $i++): ?>
                                <tr>
                                    <td>
                                        <input type="text" class="form-control" name="horario_variable_dia[]" placeholder="Día" style="text-transform: uppercase;">
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