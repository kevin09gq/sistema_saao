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
            if (data.success && data.total_vencidos > 0) {
                // Actualizar el número en el badge
                document.getElementById('notificationBadge').textContent = data.total_vencidos;
                
                // Mostrar notificación toast si el panel no está abierto
                if (!document.getElementById('notificationPanel').classList.contains('show')) {
                    showNotificationToast(data.total_vencidos);
                }
            } else {
                // No hay gafetes vencidos
                document.getElementById('notificationBadge').textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error al verificar gafetes vencidos:', error);
        });
}

// Función para mostrar notificación toast
function showNotificationToast(count) {
    // Crear elemento toast si no existe
    if (!document.getElementById('badgeNotificationToast')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        
        const toastHTML = `
            <div id="badgeNotificationToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-warning text-dark">
                    <strong class="me-auto">Gafetes Vencidos</strong>
                    <small class="text-muted">ahora</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    Hay ${count} gafete(s) que han expirado. Por favor, genere nuevos gafetes.
                </div>
            </div>
        `;
        
        toastContainer.innerHTML = toastHTML;
        document.body.appendChild(toastContainer);
        
        // Inicializar y mostrar el toast
        const toast = new bootstrap.Toast(document.getElementById('badgeNotificationToast'));
        toast.show();
    }
}

// Función para cargar notificaciones en el panel lateral
function loadNotifications() {
    fetch('gafetes/php/verificarVigenciaGafetes.php')
        .then(response => response.json())
        .then(data => {
            const notificationsContent = document.getElementById('notificationPanelContent');
            
            if (data.success && data.total_vencidos > 0) {
                let html = '';
                
                data.gafetes_vencidos.forEach(gafete => {
                    // Calcular días vencidos
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