// Variable para almacenar el intervalo de verificación
let notificationInterval;
const API_URL = '/sistema_saao/gafetes/php/verificarVigenciaGafetes.php';

// Funcionalidad para el botón de notificación (si existe)
const notificationButton = document.getElementById('notificationButton');
if (notificationButton) {
    notificationButton.addEventListener('click', function() {
        loadNotifications();
        const panel = document.getElementById('notificationPanel');
        if (panel) panel.classList.add('show');
    });
}

// Función para cerrar el panel de notificaciones
function closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.remove('show');
}

// Función para verificar gafetes vencidos
function checkExpiredBadges() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const vencidos = data.total_vencidos || 0;
                const proximos = data.total_proximos || 0;
                const totalGeneral = vencidos + proximos;

                // Actualizar el número en el badge con el total general
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.textContent = totalGeneral;
                    // Ocultar badge si es 0
                    badge.style.display = totalGeneral > 0 ? 'block' : 'none';
                }

                // Mostrar notificación toast si hay algo y el panel no está abierto (y no estamos en la vista de notificaciones)
                const isNotificationPage = document.getElementById('vencidos-tab') !== null;
                const panel = document.getElementById('notificationPanel');
                const isPanelOpen = panel && panel.classList.contains('show');

                if (totalGeneral > 0 && !isPanelOpen && !isNotificationPage) {
                    showNotificationToast(vencidos, proximos);
                }

                // Si estamos en la página de notificaciones, cargar el contenido
                if (isNotificationPage) {
                    renderFullNotifications(data);
                }
            } else {
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                }
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

    // Inicializar y mostrar el toast
    const toastEl = document.getElementById('badgeNotificationToast');
    if (toastEl && typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Función para cargar notificaciones en el panel lateral (legacy)
function loadNotifications() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const notificationsContent = document.getElementById('notificationPanelContent');
            if (!notificationsContent) return;

            if (data.success && (data.total_vencidos > 0 || data.total_proximos > 0)) {
                notificationsContent.innerHTML = generateNotificationsHTML(data, 'panel');
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
            const content = document.getElementById('notificationPanelContent');
            if (content) {
                content.innerHTML = `
                    <div class="no-notifications">
                        <i class="bi bi-exclamation-circle"></i>
                        <h5>Error</h5>
                        <p class="mb-0">Error al cargar notificaciones.</p>
                    </div>
                `;
            }
        });
}

// Función para renderizar notificaciones en la página completa (Tabs)
function renderFullNotifications(data) {
    const vencidosContainer = document.getElementById('notifications-vencidos-content');
    const proximosContainer = document.getElementById('notifications-proximos-content');
    const badgeVencidos = document.getElementById('badge-vencidos');
    const badgeProximos = document.getElementById('badge-proximos');

    if (!vencidosContainer || !proximosContainer) return;

    // Actualizar contadores de las pestañas
    if (badgeVencidos) badgeVencidos.textContent = data.total_vencidos;
    if (badgeProximos) badgeProximos.textContent = data.total_proximos;

    // Renderizar Vencidos
    if (data.total_vencidos > 0) {
        vencidosContainer.innerHTML = generateListHTML(data.gafetes_vencidos, 'vencido');
    } else {
        vencidosContainer.innerHTML = `
            <div class="no-notifications-full">
                <i class="bi bi-check-circle text-success"></i>
                <h3 class="fw-bold">No hay gafetes vencidos</h3>
                <p class="text-muted">Todos los empleados tienen sus gafetes al día.</p>
            </div>
        `;
    }

    // Renderizar Próximos
    if (data.total_proximos > 0) {
        proximosContainer.innerHTML = generateListHTML(data.gafetes_proximos, 'proximo');
    } else {
        proximosContainer.innerHTML = `
            <div class="no-notifications-full">
                <i class="bi bi-calendar-check text-info"></i>
                <h3 class="fw-bold">No hay vencimientos próximos</h3>
                <p class="text-muted">No hay gafetes que venzan en los próximos 7 días.</p>
            </div>
        `;
    }
}

// Función para generar HTML de lista para las pestañas
function generateListHTML(gafetes, type) {
    let html = `<div class="notification-list">`;
    
    gafetes.forEach(g => {
        let infoExtra = '';
        if (type === 'vencido') {
            const dVencidos = g.dias_vencidos || 0;
            infoExtra = `<span class="me-3 text-danger"><strong>Vencido hace:</strong> ${dVencidos} días</span>`;
        } else {
            infoExtra = `<span class="me-3 text-warning"><strong>Días restantes:</strong> ${g.dias_restantes} días</span>`;
        }

        html += `
            <div class="notification-list-item">
                <div class="d-flex align-items-center w-100">
                    <div class="notif-icon-circle ${type} me-3">
                        <i class="bi ${type === 'vencido' ? 'bi-person-x-fill' : 'bi-person-exclamation'} fs-5"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <div class="d-flex align-items-center flex-wrap">
                                <div class="notif-user-name me-3">${g.nombre} ${g.ap_paterno || ''} ${g.ap_materno || ''}</div>
                                <span class="status-pill ${type} mb-0">${type === 'vencido' ? 'Vencido' : 'Próximo'}</span>
                            </div>
                            <a href="/sistema_saao/gafetes/gafetes.php" class="btn btn-sm btn-outline-${type === 'vencido' ? 'danger' : 'warning'} px-3">
                                <i class="bi bi-pencil-square me-1"></i> Gestionar
                            </a>
                        </div>
                        <div class="notif-info-text">
                            <span class="me-3"><strong>Clave:</strong> ${g.clave_empleado}</span>
                            ${infoExtra}
                            <span><strong>Fecha Vencimiento:</strong> ${g.fecha_vigencia}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    return html;
}

// Función para generar el HTML del panel lateral (legacy)
function generateNotificationsHTML(data, type = 'panel') {
    let html = '';
    // Esta función se mantiene solo para el panel lateral si se usa en otras vistas
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
                        <span class="badge bg-warning text-dark">Próximo</span>
                    </div>
                    <div class="notification-content">
                        <p class="mb-1 small">
                            <strong>Clave:</strong> ${g.clave_empleado}<br>
                            <strong>Vencimiento:</strong> ${g.fecha_vigencia}
                        </p>
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
        data.gafetes_vencidos.forEach(g => {
            html += `
                <div class="notification-item expired">
                    <div class="notification-title">
                        <h6>${g.nombre} ${g.ap_paterno || ''} ${g.ap_materno || ''}</h6>
                        <span class="badge bg-danger">Vencido</span>
                    </div>
                    <div class="notification-content">
                        <p class="mb-1 small">
                            <strong>Clave:</strong> ${g.clave_empleado}<br>
                            <strong>Vencimiento:</strong> ${g.fecha_vigencia}
                        </p>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    return html;
}

// Función para actualizar manualmente el contador de notificaciones
function updateNotificationCount() {
    checkExpiredBadges();
}

// Iniciar verificación periódica
document.addEventListener('DOMContentLoaded', function() {
    // Verificar inmediatamente al cargar la página
    checkExpiredBadges();
    
    // Verificar cada 30 segundos
    notificationInterval = setInterval(checkExpiredBadges, 30000);
});
