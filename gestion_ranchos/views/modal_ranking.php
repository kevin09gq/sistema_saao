<div class="modal fade" id="modal_ranking" tabindex="-1" aria-labelledby="modalLabelRanking" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content border-0 shadow">

            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title" id="modalLabelRanking">
                    <i class="bi bi-trophy-fill text-warning me-2"></i>Top 10: Mejores Resultados
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center text-muted" scope="col">Lugar</th>
                                <th class="text-center text-muted" scope="col">Número de tabla</th>
                                <th class="text-center text-muted" scope="col">Rejas extraídas</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_ranking">
                            <!-- Aquí se llenará dinámicamente con JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>