<!-- Modal Selección Tipo de Ticket (General) -->
<div class="modal fade" id="modalSeleccionTicket" tabindex="-1" aria-labelledby="modalSeleccionTicketLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-danger text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modalSeleccionTicketLabel">
                    <i class="bi bi-ticket-perforated fs-4 me-2"></i>
                    Descargar Tickets de Utilidades
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 bg-light">
                <p class="text-muted mb-4">Selecciona el tipo de ticket que deseas descargar para los empleados visibles:</p>
                <div class="d-grid gap-3">
                    <button class="btn btn-outline-danger btn-lg shadow-sm fw-bold py-3" id="btn_ticket_normal">
                        <i class="bi bi-ticket-perforated me-2"></i> Ticket Normal
                    </button>
                    <button class="btn btn-outline-info btn-lg shadow-sm fw-bold py-3" id="btn_ticket_nombre">
                        <i class="bi bi-person-badge me-2"></i> Ticket Nombre
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>