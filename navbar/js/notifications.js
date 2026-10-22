/**
 * notifications.js
 * Sistema de notificaciones de aniversarios laborales y vigencia de gafetes.
 * Muestra alertas en la campana del navbar y lista en el modal principal.
 * La generación, personalización y descarga de tarjetas conmemorativas se delega a felicitaciones.js.
 */

// ======================================================
// CONFIGURACIÓN GLOBAL DEL MÓDULO
// ======================================================
const NOTIF_CONFIG = {
    endpoint: '/sistema_saao/navbar/php/notificaciones.php',
    pollingMs: 5 * 60 * 1000,
    modalId: 'modalNotificaciones'
};

let notificacionesActuales = [];

// ======================================================
// INICIALIZACIÓN
// ======================================================
(function iniciarCuandoJqueryEste() {
    if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
        setTimeout(iniciarCuandoJqueryEste, 50);
        return;
    }

    $(document).ready(function () {
        obtenerYMostrarNotificaciones();
        setInterval(obtenerYMostrarNotificaciones, NOTIF_CONFIG.pollingMs);

        vincularBotonCampana();
        vincularBotonFelicitacion();
    });
})();

// ======================================================
// FETCH PRINCIPAL
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
            notificacionesActuales = respuesta.notificaciones || [];
            actualizarContadorNavbar(respuesta.total);
            mostrarListaEnModal(notificacionesActuales);
        },
        error: function (xhr, estado, errorDetalle) {
            console.warn('[Notificaciones] Error HTTP', xhr.status, errorDetalle);
        }
    });
}

// ======================================================
// CONTADOR EN EL NAVBAR
// ======================================================
function actualizarContadorNavbar(totalNotificaciones) {
    const elementoContador = $('#notificationBadge');
    elementoContador.text(totalNotificaciones);

    if (totalNotificaciones > 0) {
        elementoContador.removeClass('d-none').addClass('notif-badge-pulse');
    } else {
        elementoContador.addClass('d-none').removeClass('notif-badge-pulse');
    }
}

// ======================================================
// LISTA DE NOTIFICACIONES EN EL MODAL
// ======================================================
function mostrarListaEnModal(listaNotificaciones) {
    const elementoLista = $('#notifLista');
    elementoLista.empty();

    if (!listaNotificaciones || listaNotificaciones.length === 0) {
        elementoLista.html(crearMensajeSinNotificaciones());
        return;
    }

    $.each(listaNotificaciones, function (indice, notificacion) {
        elementoLista.append(crearTarjetaNotificacion(notificacion, indice));
    });
}

function crearTarjetaNotificacion(notificacion, indice) {
    // Si es notificación de cumpleaños (CUMPLE_HOY, CUMPLE_PROXIMO, CUMPLE_RECIENTE)
    if (notificacion.tipo === 'CUMPLE_HOY' || notificacion.tipo === 'CUMPLE_PROXIMO' || notificacion.tipo === 'CUMPLE_RECIENTE') {
        const configuracion = obtenerConfiguracionTipo(notificacion.tipo, notificacion.dias_diferencia);
        const iniciales = obtenerIniciales(notificacion.nombre);
        const fechaLegible = formatearFechaCumple(notificacion.fecha_cumpleanos || notificacion.fecha_nacimiento);
        const tipoCss = notificacion.tipo.toLowerCase();

        return `
            <div class="notif-item notif-tipo-${tipoCss}">
                <div class="notif-avatar notif-avatar-${tipoCss}">${iniciales}</div>
                <div class="notif-content">
                    <div class="notif-header-row">
                        <span class="notif-nombre" title="${notificacion.nombre}">${notificacion.nombre}</span>
                        <span class="notif-badge-tipo notif-badge-${tipoCss}">${configuracion.etiqueta}</span>
                    </div>
                    <div class="notif-desc">
                        <i class="${configuracion.icono}"></i> ${configuracion.mensaje(notificacion)}
                    </div>
                    <div class="notif-meta-bar">
                        <div class="notif-fecha">
                            <i class="bi bi-cake2"></i> ${fechaLegible} &nbsp;·&nbsp;
                            <i class="bi bi-person-badge"></i> Clave: ${notificacion.clave_empleado}
                        </div>
                        <button type="button" class="notif-btn-felicitacion notif-btn-felicitacion-${tipoCss}" 
                                data-indice="${indice}" title="Descargar o ver tarjeta de felicitación de cumpleaños">
                            <i class="bi bi-gift-fill"></i>
                            <span>Felicitación</span>
                            <i class="bi bi-download opacity-75"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    }

    // Si es notificación de gafete
    if (notificacion.tipo === 'GAFETE_VENCIDO' || notificacion.tipo === 'GAFETE_PROXIMO') {
        const configuracion = obtenerConfiguracionTipo(notificacion.tipo);
        const iniciales = obtenerIniciales(notificacion.nombre);
        const fechaLegible = formatearFecha(notificacion.fecha_vigencia);
        const tipoCss = notificacion.tipo.toLowerCase();

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

    // Si es aniversario laboral (HOY, PROXIMO, RECIENTE)
    const configuracion = obtenerConfiguracionTipo(notificacion.tipo, notificacion.dias_diferencia);
    const iniciales = obtenerIniciales(notificacion.nombre);
    const fechaLegible = formatearFecha(notificacion.fecha_aniversario);
    const tipoCss = notificacion.tipo.toLowerCase();

    return `
        <div class="notif-item notif-tipo-${tipoCss}">
            <div class="notif-avatar notif-avatar-${tipoCss}">${iniciales}</div>
            <div class="notif-content">
                <div class="notif-header-row">
                    <span class="notif-nombre" title="${notificacion.nombre}">${notificacion.nombre}</span>
                    <span class="notif-badge-tipo notif-badge-${tipoCss}">${configuracion.etiqueta}</span>
                </div>
                <div class="notif-desc">
                    <i class="${configuracion.icono}"></i> ${configuracion.mensaje(notificacion)}
                </div>
                <div class="notif-meta-bar">
                    <div class="notif-fecha">
                        <i class="bi bi-calendar3"></i> ${fechaLegible} &nbsp;·&nbsp;
                        <i class="bi bi-person-badge"></i> Clave: ${notificacion.clave_empleado}
                    </div>
                    <button type="button" class="notif-btn-felicitacion notif-btn-felicitacion-${tipoCss}" 
                            data-indice="${indice}" title="Descargar o ver tarjeta de felicitación">
                        <i class="bi bi-gift-fill"></i>
                        <span>Felicitación</span>
                        <i class="bi bi-download opacity-75"></i>
                    </button>
                </div>
            </div>
        </div>`;
}

function crearMensajeSinNotificaciones() {
    return `
        <div class="notif-vacio">
            <i class="bi bi-bell-slash"></i>
            <p>Sin notificaciones pendientes</p>
        </div>`;
}

function obtenerConfiguracionTipo(tipo) {
    const configuraciones = {
        CUMPLE_HOY: {
            etiqueta: '🎂 Cumpleaños Hoy',
            icono: 'bi bi-cake2-fill',
            mensaje: (n) =>
                `¡Hoy es su cumpleaños! Cumple <strong>${n.edad} año${n.edad > 1 ? 's' : ''}</strong>.`,
        },
        CUMPLE_PROXIMO: {
            etiqueta: '🎂 Próximo Cumple',
            icono: 'bi bi-gift',
            mensaje: (n) =>
                `Cumplirá <strong>${n.edad} año${n.edad > 1 ? 's' : ''}</strong> en <strong>${n.dias_diferencia === 1 ? '1 día' : n.dias_diferencia + ' días'}</strong>.`,
        },
        CUMPLE_RECIENTE: {
            etiqueta: '🎂 Cumpleaños',
            icono: 'bi bi-cake2',
            mensaje: (n) =>
                `Celebró su cumpleaños (<strong>${n.edad} año${n.edad > 1 ? 's' : ''}</strong>) hace <strong>${n.dias_diferencia === 1 ? '1 día' : n.dias_diferencia + ' días'}</strong>.`,
        },
        PROXIMO: {
            etiqueta: '📅 Próximo',
            icono: 'bi bi-clock',
            mensaje: (n) =>
                `Cumple <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad ` +
                `en <strong>${n.dias_diferencia === 1 ? '1 día' : '2 días'}</strong>.`,
        },
        HOY: {
            etiqueta: '🎉 Hoy',
            icono: 'bi bi-stars',
            mensaje: (n) =>
                `¡Hoy cumple <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad!`,
        },
        RECIENTE: {
            etiqueta: '✅ Cumplido',
            icono: 'bi bi-check-circle',
            mensaje: (n) =>
                `Cumplió <strong>${n.anios} año${n.anios > 1 ? 's' : ''}</strong> de antigüedad hace ` +
                `<strong>${n.dias_diferencia === 1 ? '1 día' : '2 días'}</strong>.`,
        },
        GAFETE_VENCIDO: {
            etiqueta: '❌ Vencido',
            icono: 'bi bi-exclamation-triangle',
            mensaje: (n) =>
                `El gafete vence desde hace <strong>${n.dias_vencidos} día${n.dias_vencidos > 1 ? 's' : ''}</strong>.`,
        },
        GAFETE_PROXIMO: {
            etiqueta: '⚠️ Por vencer',
            icono: 'bi bi-exclamation-circle',
            mensaje: (n) =>
                `El gafete vence en <strong>${n.dias_restantes} día${n.dias_restantes > 1 ? 's' : ''}</strong>.`,
        },
    };

    return configuraciones[tipo] ?? configuraciones['PROXIMO'];
}

function vincularBotonCampana() {
    $(document).on('click', '#notificationNavbarButton', function (evento) {
        evento.preventDefault();
        sincronizarContadorModal();
        const modal = new bootstrap.Modal(document.getElementById(NOTIF_CONFIG.modalId));
        modal.show();
    });
}

function sincronizarContadorModal() {
    const totalActual = parseInt($('#notificationBadge').text()) || 0;
    const textoContador = totalActual > 0
        ? totalActual + ' nueva' + (totalActual > 1 ? 's' : '')
        : 'Al día';
    $('#notifTotalBadge').text(textoContador);
}

function vincularBotonFelicitacion() {
    $(document).on('click', '.notif-btn-felicitacion', function (evento) {
        evento.preventDefault();
        evento.stopPropagation();
        const indice = parseInt($(this).data('indice'));
        const notif = notificacionesActuales[indice];
        if (notif && typeof abrirModalFelicitacion === 'function') {
            abrirModalFelicitacion(notif);
        }
    });
}

function obtenerIniciales(nombreCompleto) {
    const palabras = nombreCompleto.trim().split(' ').filter(Boolean);
    const primeraLetra = palabras[0]?.charAt(0) || '';
    const segundaLetra = palabras[1]?.charAt(0) || '';
    return (primeraLetra + segundaLetra).toUpperCase();
}

function formatearFecha(fechaString) {
    if (!fechaString) return '---';
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [anio, mes, dia] = fechaString.split('-').map(Number);
    return `${dia} ${nombresMeses[mes - 1]} ${anio}`;
}

function formatearFechaCumple(fechaString) {
    if (!fechaString) return '---';
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const parts = fechaString.split('-').map(Number);
    if (parts.length >= 3) {
        const dia = parts[2];
        const mes = parts[1];
        return `${dia} ${nombresMeses[mes - 1]}`;
    }
    return fechaString;
}
