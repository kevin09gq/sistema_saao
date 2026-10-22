//====================================================
// FUNCIÓN PARA DESPLAZAR AUTOMÁTICAMENTE HACIA EL ELEMENTO ACTIVO
//====================================================

function desplazarHaciaElementoActivo() {

    var contenedorScroll = $('#saaoSidebarNav');
    if (!contenedorScroll.length) {
        return;
    }

    // Buscar el enlace activo actual
    var elementoActivo = $('.saao-sidebar-body .saao-submenu-link.active, .saao-sidebar-body .saao-menu-link.active').first();

    // Si no hay enlace activo directo, buscar acordeón abierto
    if (!elementoActivo.length) {
        elementoActivo = $('.saao-sidebar-body .saao-accordion-item.open').first();
    }

    if (elementoActivo.length) {
        // Asegurar que los contenedores padres estén desplegados
        elementoActivo.parents('.saao-accordion-item').addClass('open');
        elementoActivo.parents('.saao-sub-dropdown').addClass('open');

        // Calcular posición de scroll óptima centrando el elemento
        setTimeout(function () {
            var scrollActual = contenedorScroll.scrollTop();
            var topContenedor = contenedorScroll.offset().top;
            var topElemento = elementoActivo.offset().top;
            var posicionDeseada = scrollActual + (topElemento - topContenedor) - 70;

            contenedorScroll.stop().animate({
                scrollTop: Math.max(0, posicionDeseada)
            }, 260);
        }, 80);
    }
}


//====================================================
// FUNCIÓN PARA ABRIR EL MENÚ LATERAL (SIDEBAR)
//====================================================

function abrirSidebar() {

    // obtener elementos del sidebar y backdrop
    var sidebar = $('#saaoSidebar');
    var backdrop = $('#saaoSidebarBackdrop');

    if (!sidebar.length || !backdrop.length) {
        return;
    }

    // hacer visibles los elementos antes de la animación
    sidebar.css('visibility', 'visible');
    backdrop.css('visibility', 'visible');

    // forzar reflow para animación suave
    sidebar[0].offsetHeight;

    // activar clases de apertura
    sidebar.addClass('active');
    backdrop.addClass('active');

    // bloquear el scroll de fondo
    $('body').css('overflow', 'hidden');

    // re-detectar y marcar módulo activo por si se navegó dinámicamente
    marcarModuloActivo();

    // Auto-scroll al módulo activo para no tener que buscarlo manualmente
    desplazarHaciaElementoActivo();

    // enfocar el buscador de módulos sin provocar salto de scroll
    var searchInput = document.getElementById('saaoModuleSearch');
    if (searchInput) {
        setTimeout(function () {
            if (typeof searchInput.focus === 'function') {
                searchInput.focus({ preventScroll: true });
            }
        }, 220);
    }
}


//====================================================
// FUNCIÓN PARA CERRAR EL MENÚ LATERAL (SIDEBAR)
//====================================================

function cerrarSidebar() {

    var sidebar = $('#saaoSidebar');
    var backdrop = $('#saaoSidebarBackdrop');

    if (!sidebar.length || !backdrop.length) {
        return;
    }

    // remover clases activas para animación de salida
    sidebar.removeClass('active');
    backdrop.removeClass('active');

    // restaurar el scroll de la página
    $('body').css('overflow', '');

    // ocultar completamente al finalizar la animación
    setTimeout(function () {
        if (!sidebar.hasClass('active')) {
            sidebar.css('visibility', 'hidden');
            backdrop.css('visibility', 'hidden');
        }
    }, 320);
}


//====================================================
// FUNCIÓN PARA INICIALIZAR EVENTOS DE APERTURA Y CIERRE
//====================================================

function inicializarEventosSidebar() {

    // botón para abrir el menú lateral
    $('#saaoBtnMenuTrigger').off('click').on('click', function (e) {
        e.preventDefault();
        abrirSidebar();
    });

    // botón de la cruz (X) para cerrar el menú lateral
    $('#saaoSidebarClose').off('click').on('click', function (e) {
        e.preventDefault();
        cerrarSidebar();
    });

    // clic en el fondo oscuro exterior para cerrar
    $('#saaoSidebarBackdrop').off('click').on('click', function (e) {
        e.preventDefault();
        cerrarSidebar();
    });

    // cerrar menú al presionar la tecla Escape
    $(document).off('keydown.saaoSidebar').on('keydown.saaoSidebar', function (e) {
        if (e.key === 'Escape' && $('#saaoSidebar').hasClass('active')) {
            cerrarSidebar();
        }
    });
}


//====================================================
// FUNCIÓN PARA CONTROLAR LOS ACORDEONES DEL MENÚ
//====================================================

function controlarAcordeones() {

    // acordeón principal de módulos (Empleados, Documentos, Nóminas)
    $('.saao-accordion-toggle').off('click').on('click', function (e) {
        e.preventDefault();

        // obtener el item contenedor
        var parentItem = $(this).closest('.saao-accordion-item');

        // alternar estado de apertura
        parentItem.toggleClass('open');
    });

    // sub-desplegables de segundo nivel (Reloj 8 Horas, Historial Nóminas)
    $('.saao-sub-toggle').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // obtener el contenedor del sub-dropdown
        var parentSub = $(this).closest('.saao-sub-dropdown');

        // alternar estado del sub-desplegable
        parentSub.toggleClass('open');
    });
}


//====================================================
// FUNCIÓN PARA FILTRAR MÓDULOS EN TIEMPO REAL
//====================================================

function inicializarBuscadorModulos() {

    var searchInput = $('#saaoModuleSearch');

    if (!searchInput.length) {
        return;
    }

    searchInput.off('input').on('input', function () {

        // obtener el texto buscado en minúsculas y sin espacios extras
        var query = $(this).val().toLowerCase().trim();

        var menuItems = $('.saao-sidebar-body .saao-menu-item');
        var categories = $('.saao-menu-category');

        // si el buscador está vacío, restaurar todos los elementos y volver a marcar activo
        if (query === '') {
            menuItems.show();
            menuItems.find('.saao-submenu-link').show();
            categories.show();
            marcarModuloActivo();
            return;
        }

        // ocultar categorías mientras se busca
        categories.hide();

        // evaluar cada módulo y sus sub-enlaces
        menuItems.each(function () {
            var item = $(this);
            var linkText = item.find('.saao-menu-link span').first().text().toLowerCase();
            var subLinks = item.find('.saao-submenu-link');
            var coincidenciaInterna = false;

            // evaluar si coincide alguna opción dentro del submenú
            if (subLinks.length > 0) {
                subLinks.each(function () {
                    var subLink = $(this);
                    var subText = subLink.text().toLowerCase();

                    if (subText.indexOf(query) !== -1) {
                        subLink.show();
                        coincidenciaInterna = true;
                    } else {
                        subLink.hide();
                    }
                });
            }

            // mostrar el módulo si coincide el título o alguna sub-opción
            if (linkText.indexOf(query) !== -1 || coincidenciaInterna) {
                item.show();

                // abrir el acordeón automáticamente si coincide
                if (item.hasClass('saao-accordion-item')) {
                    item.addClass('open');
                }
            } else {
                item.hide();
            }
        });
    });
}


//====================================================
// FUNCIÓN PARA MARCAR EL MÓDULO ACTIVO SEGÚN LA URL
//====================================================

function marcarModuloActivo() {

    var rutaActual = window.location.pathname.toLowerCase();
    var enlaces = $('.saao-sidebar-body a');

    // limpiar estados activos anteriores
    enlaces.removeClass('active');

    var mejorCoincidencia = null;
    var mayorLongitud = 0;
    var coincidenciaExactaEncontrada = false;

    enlaces.each(function () {
        var link = $(this);
        var href = link.attr('href');

        // ignorar enlaces vacíos o javascript
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return;
        }

        // limpiar la ruta del enlace
        var hrefLimpio = href.split('?')[0].toLowerCase();

        // 1. Coincidencia exacta por nombre de archivo (prioridad máxima)
        var nombreArchivoActual = rutaActual.split('/').pop();
        var nombreArchivoEnlace = hrefLimpio.split('/').pop();

        if (nombreArchivoActual === nombreArchivoEnlace) {
            mejorCoincidencia = link;
            mayorLongitud = hrefLimpio.length;
            coincidenciaExactaEncontrada = true;
        }

        // Si ya encontramos coincidencia exacta, no seguir buscando por coincidencia parcial
        if (coincidenciaExactaEncontrada) {
            return; // Solo salta a la siguiente iteración, no detiene el each
        }

        // 2. Coincidencia de ruta completa
        if (rutaActual === hrefLimpio) {
            if (hrefLimpio.length > mayorLongitud) {
                mayorLongitud = hrefLimpio.length;
                mejorCoincidencia = link;
            }
        }
        // 3. Coincidencia para subpáginas (ej. detalle_nomina.php) mediante la carpeta del módulo (ej. /nomina_40lbs/historial/)
        else {
            var indiceViews = rutaActual.lastIndexOf('/views/');
            var carpetaModulo = indiceViews !== -1 ? rutaActual.substring(0, indiceViews) : '';
            if (carpetaModulo && hrefLimpio.indexOf(carpetaModulo) !== -1) {
                if (hrefLimpio.length > mayorLongitud) {
                    mayorLongitud = hrefLimpio.length;
                    mejorCoincidencia = link;
                }
            }
        }
        // 4. Coincidencia para página de inicio
        if (hrefLimpio.indexOf('index.php') !== -1 && (rutaActual.endsWith('/') || rutaActual.endsWith('/sistema_saao/'))) {
            if (!mejorCoincidencia) {
                mejorCoincidencia = link;
            }
        }
    });

    // Aplicar estado activo y desplegar acordeones padres
    if (mejorCoincidencia && mejorCoincidencia.length) {
        mejorCoincidencia.addClass('active');

        // abrir el acordeón padre
        var parentAccordion = mejorCoincidencia.closest('.saao-accordion-item');
        if (parentAccordion.length) {
            parentAccordion.addClass('open');
        }

        // abrir sub-acordeón si aplica
        var parentSub = mejorCoincidencia.closest('.saao-sub-dropdown');
        if (parentSub.length) {
            parentSub.addClass('open');
        }
    }
}


//====================================================
// FUNCIÓN PARA AGREGAR SOMBRA EN TOPBAR AL HACER SCROLL
//====================================================

function controlarScrollTopbar() {

    var topbar = $('.saao-topbar');
    var ventana = $(window);

    if (!topbar.length) {
        return;
    }

    ventana.off('scroll.saaoTopbar').on('scroll.saaoTopbar', function () {
        if (ventana.scrollTop() > 15) {
            topbar.addClass('scrolled');
        } else {
            topbar.removeClass('scrolled');
        }
    });
}


//====================================================
// FUNCIÓN PARA CONFIRMAR CIERRE DE SESIÓN
//====================================================

function confirmarCerrarSesion() {

    $('.btn-salir').off('click').on('click', function (e) {
        e.preventDefault();

        // verificar si SweetAlert2 está disponible
        if (typeof Swal !== 'undefined') {

            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir del sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2d6a4f',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then(function (result) {
                if (result.isConfirmed) {
                    window.location.href = '/sistema_saao/login/php/cerrarSesion.php';
                }
            });

        } else {

            // confirmación estándar del navegador
            if (confirm('¿Estás seguro de que deseas salir del sistema?')) {
                window.location.href = '/sistema_saao/login/php/cerrarSesion.php';
            }
        }
    });
}


//====================================================
// FUNCIÓN PARA INICIALIZAR LA BARRA DE NAVEGACIÓN
//====================================================

function inicializarNavbar() {

    // inicializar eventos de apertura y cierre del sidebar
    inicializarEventosSidebar();

    // inicializar acordeones del menú
    controlarAcordeones();

    // inicializar buscador de módulos
    inicializarBuscadorModulos();

    // marcar módulo activo según la página actual
    marcarModuloActivo();

    // inicializar sombra en la barra superior al hacer scroll
    controlarScrollTopbar();

    // inicializar confirmación para cerrar sesión
    confirmarCerrarSesion();
}


//====================================================
// INICIALIZACIÓN CUANDO EL DOM Y SCRIPTS ESTÁN LISTOS
//====================================================

document.addEventListener('DOMContentLoaded', function () {
    inicializarNavbar();
});
