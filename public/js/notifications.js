// Funcionalidad para el botón de notificación
document.getElementById('notificationButton').addEventListener('click', function() {
    // Cargar y mostrar notificaciones en el panel lateral
    loadNotifications();
    // Mostrar el panel de notificaciones
    document.getElementById('notificationPanel').classList.add('show');
});

// Función para cerrar el panel de notificaciones
function closeNotificationPanel() {
    document.getElementById('notificationPanel').classList.remove('show');
}

// Variable para almacenar el intervalo de verificación
let notificationInterval;

// Función para verificar gafetes vencidos
function checkExpiredBadges() {
    fetch('gafetes/php/verificarVigenciaGafetes.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const vencidos = data.total_vencidos || 0;
                const proximos = data.total_proximos || 0;
                const totalGeneral = vencidos + proximos;

                // Actualizar el número en el badge con el total general
                document.getElementById('notificationBadge').textContent = totalGeneral;

                // Mostrar notificación toast si hay algo y el panel no está abierto
                if (totalGeneral > 0 && !document.getElementById('notificationPanel').classList.contains('show')) {
                    showNotificationToast(vencidos, proximos);
                }
            } else {
                document.getElementById('notificationBadge').textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error al verificar gafetes vencidos:', error);
        });
}

// Función para mostrar notificación toast
function showNotificationToast(vencidos, proximos) {
    // Crear elemento toast si no existe
    if (!document.getElementById('badgeNotificationToast')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        
        const toastHTML = `
            <div id="badgeNotificationToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto" id="toastTitle">Gafetes</strong>
                    <small class="text-muted">ahora</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body" id="toastBody"></div>
            </div>
        `;
        
        toastContainer.innerHTML = toastHTML;
        document.body.appendChild(toastContainer);
    }

    // Actualizar contenido del toast dinámicamente
    const total = (vencidos || 0) + (proximos || 0);
    const titleEl = document.getElementById('toastTitle');
    const bodyEl = document.getElementById('toastBody');
    if (titleEl && bodyEl) {
        titleEl.textContent = 'Gafetes';
        const partes = [];
        if (vencidos) partes.push(`${vencidos} vencido(s)`);
        if (proximos) partes.push(`${proximos} próximo(s) a vencer`);
        bodyEl.textContent = `Hay ${total} gafete(s): ${partes.join(' y ')}. Por favor, revise.`;
    }

    // Inicializar y mostrar el toast (siempre mostrar)
    const toast = new bootstrap.Toast(document.getElementById('badgeNotificationToast'));
    toast.show();
}

// Función para cargar notificaciones en el panel lateral
function loadNotifications() {
    fetch('gafetes/php/verificarVigenciaGafetes.php')
        .then(response => response.json())
        .then(data => {
            const notificationsContent = document.getElementById('notificationPanelContent');

            if (data.success && (data.total_vencidos > 0 || data.total_proximos > 0)) {
                let html = '';

                if (data.total_proximos > 0) {
                    html += `
                        <div class="notification-section">
                            <div class="section-header d-flex align-items-center justify-content-between">
                                <h6 class="mb-2">Próximos a vencer (7 días)</h6>
                                <span class="badge bg-warning text-dark">${data.total_proximos}</span>
                            </div>
                    `;
                    data.gafetes_proximos.forEach(g => {
                        html += `
                            <div class="notification-item warning">
                                <div class="notification-title">
                                    <h6>${g.nombre} ${g.ap_paterno || ''} ${g.ap_materno || ''}</h6>
                                    <span class="badge bg-warning text-dark">Próximo a vencer</span>
                                </div>
                                <div class="notification-content">
                                    <p class="mb-1">
                                        <strong>Clave:</strong> ${g.clave_empleado}<br>
                                        <strong>Fecha de creación:</strong> ${g.fecha_creacion}<br>
                                        <strong>Fecha de vencimiento:</strong> ${g.fecha_vigencia}
                                    </p>
                                </div>
                                <div class="notification-meta">
                                    <small><i class="bi bi-hourglass-split"></i> Restan ${g.dias_restantes} día(s)</small>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }

                if (data.total_vencidos > 0) {
                    html += `
                        <div class="notification-section mt-3">
                            <div class="section-header d-flex align-items-center justify-content-between">
                                <h6 class="mb-2">Vencidos</h6>
                                <span class="badge bg-danger">${data.total_vencidos}</span>
                            </div>
                    `;
                    data.gafetes_vencidos.forEach(gafete => {
                        const hoy = new Date();
                        const fechaVigencia = new Date(gafete.fecha_vigencia);
                        const diasVencidos = Math.floor((hoy - fechaVigencia) / (1000 * 60 * 60 * 24));
                        html += `
                            <div class="notification-item expired">
                                <div class="notification-title">
                                    <h6>${gafete.nombre} ${gafete.ap_paterno || ''} ${gafete.ap_materno || ''}</h6>
                                    <span class="badge bg-danger">Vencido</span>
                                </div>
                                <div class="notification-content">
                                    <p class="mb-1">
                                        <strong>Clave:</strong> ${gafete.clave_empleado}<br>
                                        <strong>Fecha de creación:</strong> ${gafete.fecha_creacion}<br>
                                        <strong>Fecha de vencimiento:</strong> ${gafete.fecha_vigencia}
                                    </p>
                                </div>
                                <div class="notification-meta">
                                    <small><i class="bi bi-clock"></i> ${diasVencidos} días vencido</small>
                                    <small><i class="bi bi-exclamation-triangle"></i> Requiere atención</small>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }

                notificationsContent.innerHTML = html;
            } else {
                notificationsContent.innerHTML = `
                    <div class="no-notifications">
                        <i class="bi bi-bell"></i>
                        <h5>No hay notificaciones</h5>
                        <p class="mb-0">No hay notificaciones pendientes en este momento.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error al cargar notificaciones:', error);
            document.getElementById('notificationPanelContent').innerHTML = `
                <div class="no-notifications">
                    <i class="bi bi-exclamation-circle"></i>
                    <h5>Error</h5>
                    <p class="mb-0">Error al cargar notificaciones. Por favor, intente nuevamente.</p>
                </div>
            `;
        });
}

// Función para actualizar manualmente el contador de notificaciones
function updateNotificationCount() {
    checkExpiredBadges();
}

// Iniciar verificación periódica (cada 30 segundos)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar inmediatamente al cargar la página
    checkExpiredBadges();
    
    // Verificar cada 30 segundos
    notificationInterval = setInterval(checkExpiredBadges, 30000);
});