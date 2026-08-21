<!-- modal para actualizar valores de palmilla -->
<div class="modal fade" id="modalActualizarValores" tabindex="-1" aria-labelledby="modalActualizarValoresLabel" aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content">

            <div class="modal-header">

                <h5 class="modal-title" id="modalActualizarValoresLabel">
                    Actualizar valores de Palmilla
                </h5>

                <button type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Cerrar">
                </button>

            </div>

            <div class="modal-body">

                <div class="mb-3">

                    <label for="precio_pasaje_actualizar" class="form-label">
                        Precio de pasaje
                    </label>

                    <div class="input-group">

                        <span class="input-group-text">$</span>

                        <input
                            type="number"
                            class="form-control"
                            id="precio_pasaje_actualizar"
                            min="0"
                            step="0.01"
                        >

                    </div>

                </div>


                <div class="mb-3">

                    <label for="pago_comida_actualizar" class="form-label">
                        Pago de comida
                    </label>

                    <div class="input-group">

                        <span class="input-group-text">$</span>

                        <input
                            type="number"
                            class="form-control"
                            id="pago_comida_actualizar"
                            min="0"
                            step="0.01"
                        >

                    </div>

                </div>


                <div class="mb-3">

                    <label for="pago_tardeada_actualizar" class="form-label">
                        Pago de tardeada
                    </label>

                    <div class="input-group">

                        <span class="input-group-text">$</span>

                        <input
                            type="number"
                            class="form-control"
                            id="pago_tardeada_actualizar"
                            min="0"
                            step="0.01"
                        >

                    </div>

                </div>

            </div>

            <div class="modal-footer">

                <button type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal">
                    Cancelar
                </button>

                <button type="button"
                        class="btn btn-success"
                        id="btn_guardar_valores">
                    Guardar cambios
                </button>

            </div>

        </div>

    </div>

</div>