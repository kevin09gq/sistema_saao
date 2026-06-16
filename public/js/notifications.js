/**
 * notifications.js
 * Sistema de notificaciones de aniversarios laborales.
 *
 * Tipos de notificación que se manejan:
 *   PROXIMO  → El aniversario ocurre en 1 o 2 días (alerta previa)
 *   HOY      → El aniversario es exactamente hoy (celebración)
 *   RECIENTE → El aniversario ocurrió hace 1 o 2 días (recordatorio)
 */

// ======================================================
// CONFIGURACIÓN GLOBAL DEL MÓDULO
// ======================================================
const NOTIF_CONFIG = {
    // Ruta al archivo PHP que devuelve las notificaciones
    endpoint: '/sistema_saao/public/php/notificaciones.php',
    // Intervalo de refresco automático: cada 5 minutos
    pollingMs: 5 * 60 * 1000,
    // ID del modal de notificaciones en el DOM
    modalId: 'modalNotificaciones',
};

// ======================================================
// INICIALIZACIÓN — espera a que jQuery esté disponible
// ======================================================
(function iniciarCuandoJqueryEste() {
    if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
        // jQuery aún no ha cargado, reintentar en 50 ms
        setTimeout(iniciarCuandoJqueryEste, 50);
        return;
    }

    $(document).ready(function () {
        // Cargar notificaciones al iniciar y repetir cada 5 min
        obtenerYMostrarNotificaciones();
        setInterval(obtenerYMostrarNotificaciones, NOTIF_CONFIG.pollingMs);

        // Crear el modal en el DOM si no existe
        crearModalSiNoExiste();

        // Conectar el botón de la campana con el modal
        vincularBotonCampana();
    });
})();

// ======================================================
// FETCH PRINCIPAL
// Consulta el servidor y actualiza el indicador + la lista
// ======================================================
function obtenerYMostrarNotificaciones() {
    $.ajax({
        url: NOTIF_CONFIG.endpoint,
        type: 'POST',
        data: { action: 'obtenerNotificaciones' },
        dataType: 'json',
        success: function (respuesta) {
            if (respuesta.error) {
                console.warn('[Notificaciones] Error del servidor:', respuesta.error);
                return;
            }
            // Actualizar el número en la campana del navbar
            actualizarContadorNavbar(respuesta.total);
            // Pintar la lista dentro del modal
            mostrarListaEnModal(respuesta.notificaciones);
        },
        error: function (xhr, estado, errorDetalle) {
            console.warn('[Notificaciones] Error HTTP', xhr.status, errorDetalle);
        }
    });
}

// ======================================================
// CONTADOR EN EL NAVBAR
// Muestra o esconde el número rojo sobre la campana
// ======================================================
function actualizarContadorNavbar(totalNotificaciones) {
    const elementoContador = $('#notificationBadge');
    elementoContador.text(totalNotificaciones);

    if (totalNotificaciones > 0) {
        // Mostrar el indicador con animación de pulso
        elementoContador.removeClass('d-none').addClass('notif-badge-pulse');
    } else {
        // Ocultar el indicador si no hay notificaciones
        elementoContador.addClass('d-none').removeClass('notif-badge-pulse');
    }
}

// ======================================================
// LISTA DE NOTIFICACIONES EN EL MODAL
// Recorre el array y construye cada tarjeta
// ======================================================
function mostrarListaEnModal(listaNotificaciones) {
    const elementoLista = $('#notifLista');
    elementoLista.empty();

    // Si no hay notificaciones, mostrar estado vacío
    if (!listaNotificaciones || listaNotificaciones.length === 0) {
        elementoLista.html(crearMensajeSinNotificaciones());
        return;
    }

    // Construir y agregar una tarjeta por cada notificación
    $.each(listaNotificaciones, function (indice, notificacion) {
        elementoLista.append(crearTarjetaNotificacion(notificacion));
    });
}

// ── Construye el HTML de una tarjeta individual ────────
function crearTarjetaNotificacion(notificacion) {
    // Obtener colores, icono y texto según el tipo (PROXIMO / HOY / RECIENTE)
    const configuracion  = obtenerConfiguracionTipo(notificacion.tipo, notificacion.dias_diferencia);
    const iniciales      = obtenerIniciales(notificacion.nombre);
    const fechaLegible   = formatearFecha(notificacion.fecha_aniversario);
    const tipoCss        = notificacion.tipo.toLowerCase(); // "proximo", "hoy", "reciente"

    return `
        <div class="notif-item notif-tipo-${tipoCss}">
            <div class="notif-avatar notif-avatar-${tipoCss}">${iniciales}</div>
            <div class="notif-content">
                <div class="notif-header-row">
                    <span class="notif-nombre">${notificacion.nombre}</span>
                    <span class="notif-badge-tipo notif-badge-${tipoCss}">${configuracion.etiqueta}</span>
                </div>
                <div class="notif-desc">
                    <i class="${configuracion.icono}"></i> ${configuracion.mensaje(notificacion)}
                </div>
                <div class="notif-fecha">
                    <i class="bi bi-calendar3"></i> ${fechaLegible} &nbsp;·&nbsp;
                    <i class="bi bi-person-badge"></i> Clave: ${notificacion.clave_empleado}
                </div>
            </div>
        </div>`;
}

// ── Mensaje cuando no hay notificaciones activas ───────
function crearMensajeSinNotificaciones() {
    return `
        <div class="notif-vacio">
            <i class="bi bi-bell-slash"></i>
            <p>Sin notificaciones pendientes</p>
        </div>`;
}

// ======================================================
// CONFIGURACIÓN POR TIPO DE NOTIFICACIÓN
// Define etiqueta, icono y mensaje de cada tipo
// ======================================================
function obtenerConfiguracionTipo(tipo) {
    const configuraciones = {
        // 📅 Próximo: el aniversario aún no ha llegado
        PROXIMO: {
            etiqueta: '📅 Próximo',
            icono: 'bi bi-clock',
            mensaje: (n) =>
                `Cumple <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad ` +
                `en <strong>${n.dias_diferencia === 1 ? '1 día' : '2 días'}</strong>.`,
        },
        // 🎉 Hoy: es el día del aniversario
        HOY: {
            etiqueta: '🎉 Hoy',
            icono: 'bi bi-stars',
            mensaje: (n) =>
                `¡Hoy cumple <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad!`,
        },
        // ✅ Reciente: el aniversario ya ocurrió (1–2 días antes)
        RECIENTE: {
            etiqueta: '✅ Cumplido',
            icono: 'bi bi-check-circle',
            mensaje: (n) =>
                `Cumplió <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad hace ` +
                `<strong>${n.dias_diferencia === 1 ? '1 día' : '2 días'}</strong>.`,
        },
    };

    // Si el tipo no se reconoce, usar PROXIMO como fallback
    return configuraciones[tipo] ?? configuraciones['PROXIMO'];
}

// ======================================================
// MODAL DE NOTIFICACIONES
// Se inserta dinámicamente en el body una sola vez
// ======================================================
function crearModalSiNoExiste() {
    if ($('#' + NOTIF_CONFIG.modalId).length === 0) {
        $('body').append(generarHTMLModal());
    }
}

// ── Genera la estructura HTML completa del modal ──────
function generarHTMLModal() {
    return `
    <div class="modal fade" id="${NOTIF_CONFIG.modalId}" tabindex="-1"
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
                        Se muestran aniversarios próximos (2 días antes), del día y recientes (2 días después).
                    </small>
                </div>

            </div>
        </div>
    </div>`;
}

// ======================================================
// BOTÓN DE LA CAMPANA EN EL NAVBAR
// Al hacer clic, abre el modal de notificaciones
// ======================================================
function vincularBotonCampana() {
    $(document).on('click', '#notificationNavbarButton', function (evento) {
        // Evitar que el enlace navegue a otra página
        evento.preventDefault();

        // Actualizar el texto del badge dentro del modal antes de abrirlo
        sincronizarContadorModal();

        const modal = new bootstrap.Modal(document.getElementById(NOTIF_CONFIG.modalId));
        modal.show();
    });
}

// ── Sincroniza el contador del modal con el del navbar ─
function sincronizarContadorModal() {
    const totalActual = parseInt($('#notificationBadge').text()) || 0;
    const textoContador = totalActual > 0
        ? totalActual + ' nueva' + (totalActual > 1 ? 's' : '')
        : 'Al día';
    $('#notifTotalBadge').text(textoContador);
}

// ======================================================
// UTILIDADES
// ======================================================

// Obtiene las 2 primeras letras del nombre completo para el avatar
function obtenerIniciales(nombreCompleto) {
    const palabras = nombreCompleto.trim().split(' ').filter(Boolean);
    const primeraLetra  = palabras[0]?.charAt(0) || '';
    const segundaLetra  = palabras[1]?.charAt(0) || '';
    return (primeraLetra + segundaLetra).toUpperCase();
}

// Convierte "2026-06-16" → "16 Jun 2026"
function formatearFecha(fechaString) {
    if (!fechaString) return '---';
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [anio, mes, dia] = fechaString.split('-').map(Number);
    return `${dia} ${nombresMeses[mes - 1]} ${anio}`;
}
