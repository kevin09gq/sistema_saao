<div class="modal-detalles" id="modal-detalles" style="display:none;">
    <div class="modal-detalles-content">
        <span class="modal-detalles-close" id="cerrar-modal-detalles">&times;</span>
        <ul class="nav nav-tabs mb-3" id="modalTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tab-info" data-bs-toggle="tab" data-bs-target="#tab_info" type="button" role="tab" aria-controls="tab_info" aria-selected="true">
                    Trabajador
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-conceptos" data-bs-toggle="tab" data-bs-target="#tab_conceptos" type="button" role="tab" aria-controls="tab_conceptos" aria-selected="false">
                    Conceptos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-registros" data-bs-toggle="tab" data-bs-target="#tab_registros" type="button" role="tab" aria-controls="tab_registros" aria-selected="false">
                    Registros
                </button>
            </li>
        </ul>
        <div class="tab-content">
            <!-- Info Trabajador -->
            <div class="tab-pane fade show active" id="tab_info" role="tabpanel" aria-labelledby="tab-info">
                <h4 style="margin-bottom:10px;">Detalles del empleado</h4>
                <div class="info-trabajador">
                    <div><strong>Nombre:</strong> ALVAREZ SOSA LETICIA</div>
                    <div><strong>Clave:</strong> 3</div>
                    <div><strong>Neto a pagar:</strong> $1266.68</div>
                    <div><strong>Horas totales:</strong> 37.10</div>
                    <div><strong>Tiempo total:</strong> 37:06</div>
                </div>
            </div>
            <!-- Conceptos -->
            <div class="tab-pane fade" id="tab_conceptos" role="tabpanel" aria-labelledby="tab-conceptos">
                <h4 style="margin-bottom:10px;">Conceptos</h4>
                <div class="conceptos-cards">
                    <div class="concepto-card">
                        <div class="concepto-codigo">16</div>
                        <div class="concepto-nombre">Préstamo infonavit (CF)</div>
                        <input class="concepto-resultado" type="text" value="186.22">
                    </div>
                    <div class="concepto-card">
                        <div class="concepto-codigo">45</div>
                        <div class="concepto-nombre">I.S.R. (mes)</div>
                        <input class="concepto-resultado" type="text" value="194.24">
                    </div>
                    <div class="concepto-card">
                        <div class="concepto-codigo">52</div>
                        <div class="concepto-nombre">I.M.S.S.</div>
                        <input class="concepto-resultado" type="text" value="32.86">
                    </div>
                </div>
            </div>
            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">
                <h4 style="margin-bottom:10px;">Registros de Entrada y Salida</h4>
                <ul class="registros-timeline">
                    <li>
                        <div class="registro-fecha">21/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">22/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">23/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="10:12">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="12:54">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="02:42">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">23/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="14:00">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="18:02">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="04:02">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">24/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="08:59">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="13:27">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="04:28">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">24/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="15:17">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="19:20">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="04:03">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">24/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="19:21">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">25/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="09:16">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="13:07">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="03:51">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">25/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="14:10">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="19:24">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="05:14">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">26/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="09:22">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="13:11">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="03:49">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">26/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="14:00">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="14:09">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="00:09">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">26/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="19:06">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">27/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="09:26">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="13:07">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="03:41">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="registro-fecha">27/06/2025</div>
                        <div class="registro-datos">
                            <div class="registro-row">
                                <label class="registro-label">Entrada:</label>
                                <input class="registro-input" type="text" value="15:16">
                                <label class="registro-label">Salida:</label>
                                <input class="registro-input" type="text" value="20:23">
                            </div>
                            <div class="registro-row">
                                <label class="registro-label">Trabajado:</label>
                                <input class="registro-input" type="text" value="05:07">
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="registros-totales">
                    Horas totales: <span id="horas-totales">37.10</span> &nbsp; | &nbsp; Tiempo total: <span id="tiempo-total">37:06</span>
                </div>
            </div>
        </div>
        <div class="modal-detalles-footer" style="margin-top:24px; text-align:right;">
            <button type="button" id="btn-cancelar-detalles" class="btn btn-secondary" style="margin-right:10px;">Cancelar</button>
            <button type="button" id="btn-guardar-detalles" class="btn btn-success">Guardar</button>
        </div>
    </div>
</div>
