<div class="modal-dispersion" id="modal-dispersion" style="display:none;">
    <div class="modal-dispersion-content">
        <span class="modal-dispersion-close" id="cerrar-modal-dispersion">&times;</span>

        <div class="header-dispersion">
            <h4 class="titulo-dispersion">
                <i class="bi bi-currency-dollar"></i>
                Actualizar Tarjeta
            </h4>
        </div>

        <div class="contenido-dispersion">
            <!-- Información del empleado -->
            <div class="info-empleado-dispersion">
                <div class="dato-empleado">
                    <span class="etiqueta-empleado">Clave:</span>
                    <span class="valor-empleado" id="disp-clave">--</span>
                </div>
                <div class="dato-empleado">
                    <span class="etiqueta-empleado">Nombre:</span>
                    <span class="valor-empleado" id="disp-nombre">--</span>
                </div>
            </div>

            <!-- Campo de Tarjeta con header estilizado -->
            <div class="campo-sueldo-container">
                <div class="campo-sueldo-header">
                    <i class="bi bi-cash-stack"></i>
                    <span>Tarjeta</span>
                </div>
                <div class="input-container">
                    <span class="simbolo-peso">$</span>
                    <input type="number"
                        step="0.01"
                        class="input-sueldo-neto"
                        id="disp-sueldo-neto"
                        placeholder="0.00">
                </div>
            </div>
        </div>

        <!-- Footer con botones -->
        <div class="footer-dispersion">
            <button type="button" class="btn-cancelar-dispersion" id="btn-cancelar-dispersion">
                <i class="bi bi-x-circle"></i>
                Cancelar
            </button>
            <button type="button" class="btn-guardar-dispersion" id="btn-guardar-dispersion">
                <i class="bi bi-check-circle"></i>
                Guardar
            </button>
        </div>
    </div> 
</div>

