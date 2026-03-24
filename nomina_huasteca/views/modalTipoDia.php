<div class="modal fade" id="modal-tipo-dia" tabindex="-1" aria-labelledby="modalTipoDiaLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" style="max-width:420px;">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title" id="modalTipoDiaLabel">Seleccionar tipo de día</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>

      <div class="modal-body">

        <div class="d-grid gap-2">
          <button type="button" class="btn btn-outline-primary btn-tipo-dia" data-tipo="VACACIONES">
            <i class="bi bi-umbrella-fill me-2"></i>Vacaciones
          </button>

          <button type="button" class="btn btn-outline-secondary btn-tipo-dia" data-tipo="DESCANSO">
            <i class="bi bi-house-door-fill me-2"></i>Día de descanso
          </button>

          <button type="button" class="btn btn-outline-warning btn-tipo-dia" data-tipo="ENFERMEDAD">
            <i class="bi bi-heart-pulse-fill me-2"></i>Enfermedad
          </button>

          <button type="button" class="btn btn-outline-success btn-tipo-dia" data-tipo="FESTIVO">
            <i class="bi bi-balloon-fill me-2"></i>Día festivo
          </button>

          <button type="button" class="btn btn-outline-dark btn-tipo-dia" data-tipo="">
            <i class="bi bi-x-circle me-2"></i>Quitar tipo
          </button>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
          Cerrar
        </button>
      </div>

    </div>
  </div>
</div>