<!-- Modal de Horarios -->
<div class="modal fade" id="horarios_modal" tabindex="-1" aria-labelledby="horariosModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-body">
                <div class="horarios-container">
                    <div class="table-responsive">
                        <table class="tabla-horarios">
                            <thead>
                                <tr>
                                    <th class="encabezado-dia">Día</th>
                                    <th class="encabezado-tiempo">Entrada</th>
                                    <th class="encabezado-tiempo">Salida Comida</th>
                                    <th class="encabezado-tiempo">Entrada Comida</th>
                                    <th class="encabezado-tiempo">Salida</th>
                                    <th class="encabezado-tiempo">Total Horas</th>
                                    <th class="encabezado-tiempo">Horas Comida</th>
                                </tr>
                            </thead>
                            <tbody>
                              
                            </tbody>
                            <tfoot>
                                <tr class="fila-total">
                                    <td class="etiqueta-total">TOTAL</td>
                                    <td class="celda-total-general"></td>
                                    <td class="celda-total-general"></td>
                                    <td class="celda-total-general"></td>
                                    <td class="celda-total-general"></td>
                                    <td class="celda-total-horas-semana">00:00</td>
                                    <td class="celda-total-comida-semana">00:00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary" id="guardar-cambios">Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>

