<!-- Modal de Sumas Totales para Empleados Sin Seguro -->
<div class="modal fade" id="modal_suma_sin_seguro" tabindex="-1" aria-labelledby="modalSumaSinSeguroLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalSumaSinSeguroLabel">
                    <i class="bi bi-calculator"></i>
                    Totales de Nómina - Sin Seguro
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Cuerpo -->
            <div class="modal-body">
                <div class="sumas-list">
                    <div class="suma-row">
                        <span class="suma-concepto">SUELDO NETO:</span>
                        <span class="suma-amount positivo" id="suma_sin_seguro_sueldo_neto">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">INCENTIVO:</span>
                        <span class="suma-amount positivo" id="suma_sin_seguro_incentivo">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">EXTRA:</span>
                        <span class="suma-amount positivo" id="suma_sin_seguro_extra">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">TARJETA:</span>
                        <span class="suma-amount positivo" id="suma_sin_seguro_tarjeta">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">PRÉSTAMO:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_prestamo">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">INASISTENCIAS:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_inasistencias">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">UNIFORMES:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_uniformes">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">INFONAVIT:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_infonavit">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">ISR:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_isr">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">IMSS:</span>
                        <span class="suma-amount negativo" id="suma_sin_seguro_imss">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">CHECADOR:</span>
                        <span class="suma-amount neutro" id="suma_sin_seguro_checador">$0.00</span>
                    </div>
                    <div class="suma-row">
                        <span class="suma-concepto">F.A / GAFET / COFIA:</span>
                        <span class="suma-amount neutro" id="suma_sin_seguro_fa_gafet">$0.00</span>
                    </div>

                    <div class="suma-row total">
                        <span class="suma-concepto">SUELDO A COBRAR:</span>
                        <span class="suma-amount final" id="suma_sin_seguro_sueldo_cobrar">$0.00</span>
                    </div>
                </div>
            </div>

            <!-- Pie -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>

        </div> <!-- modal-content -->
    </div> <!-- modal-dialog -->
</div> <!-- modal -->
