<!-- ==========================================================================
     MODAL PRINCIPAL DE NOTIFICACIONES SAAO
     Muestra aniversarios laborales y vigencia de gafetes
     ========================================================================== -->
<div class="modal fade" id="modalNotificaciones" tabindex="-1"
     aria-labelledby="notifModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable notif-modal-dialog">
        <div class="modal-content notif-modal-content">

            <!-- Encabezado del modal -->
            <div class="modal-header notif-modal-header">
                <div class="notif-modal-title-wrap">
                    <i class="bi bi-bell-fill notif-modal-icon"></i>
                    <h5 class="modal-title" id="notifModalLabel">Notificaciones</h5>
                </div>
                <!-- Badge que muestra el total de notificaciones activas -->
                <span class="notif-total-badge" id="notifTotalBadge">0</span>
                <button type="button" class="btn-close btn-close-white"
                        data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <!-- Cuerpo con scroll vertical para la lista de notificaciones -->
            <div class="modal-body notif-modal-body" id="notifLista">
                <div class="notif-vacio">
                    <i class="bi bi-bell-slash"></i>
                    <p>Cargando notificaciones…</p>
                </div>
            </div>

            <!-- Pie con nota informativa -->
            <div class="modal-footer notif-modal-footer">
                <small class="notif-footer-texto">
                    <i class="bi bi-info-circle"></i>
                    Se muestran aniversarios, cumpleaños y vigencias de gafetes.
                </small>
            </div>

        </div>
    </div>
</div>
