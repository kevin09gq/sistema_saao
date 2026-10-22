/**
 * felicitaciones.js
 * Módulo para generación y personalización de tarjetas conmemorativas de aniversario.
 * NO contiene código HTML en cadenas: el modal reside en navbar/views/modalFelicitacion.php.
 * 
 * Incluye:
 * - Amplio motor generador de lenguaje dinámico (decenas de miles de combinaciones).
 * - Renderizado Canvas en alta resolución (1080x1080) con tipografía destacada de 19.5px.
 * - Cambio interactivo de temas, regeneración de frases con un clic, descarga PNG y copiado al portapapeles.
 */

// Estado del módulo
const FELICITACIONES_STATE = {
    modalId: 'modalFelicitacionAniversario',
    canvasId: 'canvasFelicitacion',
    notificacionActual: null,
    temaActual: 'esmeralda',
    colorPersonalizado: null,   // Color central personalizado
    colorContraste: null,       // Color de contraste personalizado
    colorTexto: '#ffffff',      // Color de las palabras / letras
    mensajeActual: null,
    animacionConfetiId: null,
    logoImg: null,              // Logo SAAO pre-cargado en caché
    logoListo: false            // Flag: true cuando el logo ya está disponible
};

// Pre-cargar el logo SAAO al iniciar el módulo
(function precargarLogoSAAO() {
    const img = new Image();
    img.onload = function () {
        FELICITACIONES_STATE.logoImg = img;
        FELICITACIONES_STATE.logoListo = true;
    };
    img.onerror = function () {
        FELICITACIONES_STATE.logoListo = false;
    };
    img.src = '/sistema_saao/public/img/logo.jpg';
})();

// ======================================================
// 1. AMPLIO MOTOR GENERADOR DINÁMICO DE FRASES
// ======================================================
// Más de 90,000 combinaciones posibles de tono corporativo y emotivo
function generarMensajeCumpleanosIA(notif) {
    const edad = notif?.edad || notif?.anios || '';
    const edadTxt = edad ? `sus ${edad} años de vida` : 'un año más de vida';

    const aperturas = [
        'Hoy nos unimos con inmensa alegría para celebrar',
        'En Cítricos SAAO festejamos con gran entusiasmo',
        'Con sincero aprecio y afecto institucional conmemoramos',
        'Es un verdadero placer festejar y compartir',
        'Toda la familia de Cítricos SAAO aplaude y celebra',
        'Con gran gozo y cálido cariño nos sumamos a festejar',
        'Hoy es un día muy especial para festejar y reconocer'
    ];

    const elogios = [
        'el cumpleaños de un integrante muy valioso de nuestro equipo, agradeciendo su entusiasmo, calidez y dedicación.',
        'tu vida, tu carisma y la excelente energía positiva que compartes día con día con cada uno de tus compañeros.',
        'este nuevo aniversario de vida, aplaudiendo tu nobleza, compañerismo y dedicación permanente.',
        'tu fecha especial, reconociendo tu calidad humana, compromiso y el valioso aporte que brindas a diario.',
        'tu cumpleaños, celebrando a una persona ejemplar cuyo esfuerzo, carisma y alegría enriquecen a nuestra institución.',
        'un año más en tu trayectoria personal, celebrando tu bondad, perseverancia y espíritu colaborativo.'
    ];

    const deseos = [
        'Deseamos de corazón que la salud, el amor, la paz y la prosperidad colmen tu camino en todo momento.',
        'Que este nuevo año de vida esté colmado de bendiciones, proyectos realizados y sonrisas inolvidables.',
        'Que cada anhelo que guardas en tu corazón se concrete con éxito y veas florecer todas tus metas.',
        'Que pases un día maravilloso en compañía de tus seres queridos, rodeado de dicha, armonía y bienestar.',
        'Que la alegría de este día sea solo el inicio de un año extraordinario lleno de triunfos personales y profesionales.'
    ];

    const cierres = [
        '¡Muchas felicidades y que cumplas muchos años más repletos de dicha y éxito!',
        '¡Un fuerte abrazo de felicitación de parte de toda la familia Cítricos SAAO en tu día!',
        '¡Feliz cumpleaños hoy y siempre!',
        '¡Que la vida continúe premiándote con abundante salud, amor y grandes satisfacciones!',
        '¡Enhorabuena en tu cumpleaños y nuestros mejores deseos para ti!'
    ];

    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
        cuerpo: `${r(aperturas)} ${edadTxt}, ${r(elogios)} ${r(deseos)}`,
        cierre: r(cierres)
    };
}

function generarMensajeIA(notif) {
    if (notif && (notif.es_cumpleanos || (notif.tipo && notif.tipo.startsWith('CUMPLE')))) {
        return generarMensajeCumpleanosIA(notif);
    }

    const anios = notif?.anios || 1;
    const aniosTxt = anios === 1 ? 'este primer año' : `estos ${anios} años`;

    const aperturas = [
        'Hoy celebramos con profundo orgullo y gratitud',
        'Con gran admiración y sincero aprecio conmemoramos',
        'En Cítricos SAAO aplaudimos con especial entusiasmo',
        'Es un inmenso honor festejar y reconocer',
        'Destacamos con alegría, admiración y respeto',
        'Rendimos un cálido y muy merecido homenaje a',
        'Agradecemos de todo corazón y celebramos',
        'Nos llena de satisfacción y orgullo conmemorar',
        'Festejamos con gran júbilo y admiración institucional',
        'Reconocemos con profundo respeto y estima profesional',
        'Es motivo de gran fiesta y orgullo compartir',
        'Aplaudimos con gratitud y entusiasmo el camino de'
    ];

    const virtudes = [
        'tu perseverancia, constancia y entrega inquebrantable',
        'tu profesionalismo, lealtad y compromiso continuo',
        'tu entusiasmo, valiosa dedicación y calidez humana',
        'tu disciplina, talento y vocación de servicio',
        'tu esfuerzo diario, responsabilidad y espíritu de equipo',
        'tu energía positiva, integridad y entrega cotidiana',
        'tu liderazgo positivo, generosidad y compromiso firme',
        'tu pasión por la excelencia, ética y dedicación ejemplar',
        'tu fidelidad institucional, esfuerzo y espíritu colaborativo',
        'tu tenacidad, dinamismo y permanente entrega profesional',
        'tu compañerismo, excelencia operativa y perseverancia',
        'tu valioso compromiso, empatía y dedicación constante'
    ];

    const trayectorias = [
        `a lo largo de ${aniosTxt} de impecable trayectoria en nuestra empresa.`,
        `durante ${aniosTxt} formando parte activa y valiosa de nuestra gran familia.`,
        `en ${aniosTxt} de servicio, compañerismo y dedicación constante.`,
        `dejando una huella ejemplar en cada paso de ${aniosTxt} con nosotros.`,
        `construyendo juntos el éxito de nuestra empresa durante ${aniosTxt}.`,
        `sumando tu talento y lealtad ininterrumpida a lo largo de ${aniosTxt}.`,
        `compartiendo logros, retos y grandes vivencias en ${aniosTxt}.`,
        `siendo protagonista del crecimiento de Cítricos SAAO en ${aniosTxt}.`
    ];

    const impactos = [
        'Tu labor diaria es un pilar indispensable que inspira y fortalece nuestro crecimiento.',
        'Cada meta conquistada por la empresa lleva impresa la huella de tu valioso esfuerzo.',
        'Tu energía y constancia impulsan día tras día el éxito y futuro de Cítricos SAAO.',
        'Eres un ejemplo de lealtad y excelencia que enriquece a toda nuestra organización.',
        'Tu entrega cotidiana nos motiva a seguir alcanzando grandes logros en equipo.',
        'Tu dedicación y entrega diaria hacen una diferencia positiva y trascendente.',
        'Tu ejemplo inspira a las nuevas generaciones y consolida la fortaleza de nuestro equipo.',
        'Gracias por ser parte esencial del motor humano que mueve a nuestra institución.',
        'El valor de tu aporte cotidiano es fundamental en cada paso que damos hacia adelante.',
        'Tu calidez y profesionalismo son un reflejo fiel de los valores de Cítricos SAAO.'
    ];

    const cierres = [
        '¡Muchas felicidades y que sigan cosechando innumerables éxitos!',
        '¡Enhorabuena por este gran aniversario laboral y gracias por ser parte de nuestra historia!',
        '¡Que este día sea el reflejo de muchos años más de prosperidad y logros compartidos!',
        '¡Gracias por tu dedicación incondicional y feliz aniversario!',
        '¡Felicidades de corazón por este gran logro en tu trayectoria profesional!',
        '¡Que vengan muchos años más repletos de satisfacciones personales y laborales!',
        '¡Nuestra admiración, respeto y más calurosas felicitaciones en tu día!',
        '¡Con orgullo y gratitud te deseamos un muy feliz aniversario de servicio!'
    ];

    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
        cuerpo: `${r(aperturas)} ${r(virtudes)} ${r(trayectorias)} ${r(impactos)}`,
        cierre: r(cierres)
    };
}

// ======================================================
// 2. INICIALIZACIÓN DE EVENTOS DEL MODAL
// ======================================================
(function iniciarCuandoJqueryEste() {
    if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
        setTimeout(iniciarCuandoJqueryEste, 50);
        return;
    }

    $(document).ready(function () {
        vincularEventosModuloFelicitacion();
    });
})();

function vincularEventosModuloFelicitacion() {
    // Botón para generar nueva frase al instante
    $(document).on('click', '#btnCambiarFraseIA', function () {
        if (!FELICITACIONES_STATE.notificacionActual) return;

        const btn = $(this);
        btn.addClass('active');

        // Generar una frase totalmente nueva
        FELICITACIONES_STATE.mensajeActual = generarMensajeIA(FELICITACIONES_STATE.notificacionActual);

        // Volver a dibujar en Canvas
        renderizarTarjetaFelicitacion(
            FELICITACIONES_STATE.notificacionActual,
            FELICITACIONES_STATE.temaActual,
            FELICITACIONES_STATE.mensajeActual
        );

        mostrarToastFelicitacion('¡Nueva frase generada!');
        setTimeout(() => btn.removeClass('active'), 350);
    });

    // Selector de estilos de la paleta (Swatches circulares de gala)
    $(document).on('click', '.felicitacion-swatch', function () {
        const nuevoTema = $(this).data('tema');
        $('.felicitacion-swatch').removeClass('active');
        $('#labelColorPicker').removeClass('active');
        $(this).addClass('active');

        FELICITACIONES_STATE.temaActual = nuevoTema;
        FELICITACIONES_STATE.colorPersonalizado = null;
        FELICITACIONES_STATE.colorContraste = null;
        $('#grupoColoresPersonalizados').removeClass('active-custom');

        if (FELICITACIONES_STATE.notificacionActual) {
            renderizarTarjetaFelicitacion(
                FELICITACIONES_STATE.notificacionActual,
                FELICITACIONES_STATE.temaActual,
                FELICITACIONES_STATE.mensajeActual
            );
        }
    });

    // Color Central (panel izquierdo)
    $(document).on('input change', '#inputColorCentral', function () {
        const hex = $(this).val();
        // Actualizar dot y preview de gradiente
        $('#previewColorCentral').css('background', hex);
        actualizarPreviewGradiente();
        // Desactivar swatches predefinidos
        $('.felicitacion-swatch').removeClass('active');
        $('#grupoColoresPersonalizados').addClass('active-custom');
        // Guardar en estado
        FELICITACIONES_STATE.temaActual = 'personalizado';
        FELICITACIONES_STATE.colorPersonalizado = hex;
        if (!FELICITACIONES_STATE.colorContraste) {
            FELICITACIONES_STATE.colorContraste = $('#inputColorContraste').val();
        }

        // Si el fondo se vuelve claro y el texto estaba en blanco por defecto, auto-adaptar a carbón oscuro
        if (esColorClaro(hex) && FELICITACIONES_STATE.colorTexto === '#ffffff') {
            actualizarPaletaTexto('#0f172a');
        } else if (!esColorClaro(hex) && FELICITACIONES_STATE.colorTexto === '#0f172a') {
            actualizarPaletaTexto('#ffffff');
        }

        if (FELICITACIONES_STATE.notificacionActual) {
            renderizarTarjetaFelicitacion(
                FELICITACIONES_STATE.notificacionActual,
                FELICITACIONES_STATE.temaActual,
                FELICITACIONES_STATE.mensajeActual
            );
        }
    });

    // Color de Contraste (panel derecho)
    $(document).on('input change', '#inputColorContraste', function () {
        const hex = $(this).val();
        // Actualizar dot y preview de gradiente
        $('#previewColorContraste').css('background', hex);
        actualizarPreviewGradiente();
        // Desactivar swatches predefinidos
        $('.felicitacion-swatch').removeClass('active');
        $('#grupoColoresPersonalizados').addClass('active-custom');
        // Guardar en estado
        FELICITACIONES_STATE.temaActual = 'personalizado';
        FELICITACIONES_STATE.colorContraste = hex;
        if (!FELICITACIONES_STATE.colorPersonalizado) {
            FELICITACIONES_STATE.colorPersonalizado = $('#inputColorCentral').val();
        }
        if (FELICITACIONES_STATE.notificacionActual) {
            renderizarTarjetaFelicitacion(
                FELICITACIONES_STATE.notificacionActual,
                FELICITACIONES_STATE.temaActual,
                FELICITACIONES_STATE.mensajeActual
            );
        }
    });

    // ======================================================
    // PALETA DE COLORES PARA LAS PALABRAS / LETRAS
    // ======================================================
    // Muestras rápidas de color para el texto
    $(document).on('click', '.felicitacion-text-swatch', function () {
        const color = $(this).data('color-texto');
        if (!color) return;
        actualizarPaletaTexto(color);

        if (FELICITACIONES_STATE.notificacionActual) {
            renderizarTarjetaFelicitacion(
                FELICITACIONES_STATE.notificacionActual,
                FELICITACIONES_STATE.temaActual,
                FELICITACIONES_STATE.mensajeActual
            );
        }
    });

    // Selector libre de color para las palabras (panel con input[type=color])
    $(document).on('input change', '#inputColorTexto', function () {
        const color = $(this).val();
        FELICITACIONES_STATE.colorTexto = color;
        $('#previewColorTexto').css('background', color);

        $('.felicitacion-text-swatch').removeClass('active');
        $(`.felicitacion-text-swatch[data-color-texto="${color.toLowerCase()}"]`).addClass('active');

        if (FELICITACIONES_STATE.notificacionActual) {
            renderizarTarjetaFelicitacion(
                FELICITACIONES_STATE.notificacionActual,
                FELICITACIONES_STATE.temaActual,
                FELICITACIONES_STATE.mensajeActual
            );
        }
    });

    // Descargar imagen en PNG de alta resolución
    $(document).on('click', '#btnDescargarTarjeta', function () {
        const canvas = document.getElementById(FELICITACIONES_STATE.canvasId);
        if (!canvas || !FELICITACIONES_STATE.notificacionActual) return;

        const notif = FELICITACIONES_STATE.notificacionActual;
        const nombreLimpio = (notif.nombre || 'Colaborador')
            .trim()
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_')
        const esCumple = notif.es_cumpleanos || (notif.tipo && notif.tipo.startsWith('CUMPLE'));
        const prefijo = esCumple ? 'Cumpleanos' : 'Felicitacion';
        const anios = notif.edad || notif.anios || 1;
        const nombreArchivo = `${prefijo}_${nombreLimpio}_${anios}Anios_SAAO.png`;

        const link = document.createElement('a');
        link.download = nombreArchivo;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        mostrarToastFelicitacion('¡Descargando imagen en alta resolución!');
    });

    // Copiar imagen directamente al portapapeles
    $(document).on('click', '#btnCopiarTarjeta', function () {
        const canvas = document.getElementById(FELICITACIONES_STATE.canvasId);
        if (!canvas) return;

        if (!navigator.clipboard || !window.ClipboardItem) {
            mostrarToastFelicitacion('Copia no soportada por el navegador. Usa "Descargar PNG".');
            return;
        }

        canvas.toBlob(function (blob) {
            if (!blob) {
                mostrarToastFelicitacion('Error al generar la imagen.');
                return;
            }
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function () {
                mostrarToastFelicitacion('¡Imagen copiada! Puedes pegarla con Ctrl+V en WhatsApp o correo.');
            }).catch(function (err) {
                console.warn(err);
                mostrarToastFelicitacion('No se pudo copiar automáticamente. Usa "Descargar PNG".');
            });
        }, 'image/png');
    });
}

// ======================================================
// 3. APERTURA Y CONTROL DEL MODAL
// ======================================================
// Actualiza el preview visual del degradado entre los dos colores elegidos
function actualizarPreviewGradiente() {
    const c1 = $('#inputColorCentral').val() || '#10b981';
    const c2 = $('#inputColorContraste').val() || '#064e3b';
    $('#previewGradiente').css('background', `linear-gradient(to right, ${c1}, ${c2})`);
}

// Sincroniza visualmente la paleta y el input de color de letras
function actualizarPaletaTexto(hexColor) {
    FELICITACIONES_STATE.colorTexto = hexColor;
    $('#inputColorTexto').val(hexColor);
    $('#previewColorTexto').css('background', hexColor);
    $('.felicitacion-text-swatch').removeClass('active');
    $(`.felicitacion-text-swatch[data-color-texto="${hexColor.toLowerCase()}"]`).addClass('active');
}

function abrirModalFelicitacion(notificacion) {
    const esCumple = notificacion?.es_cumpleanos || (notificacion?.tipo && notificacion.tipo.startsWith('CUMPLE'));
    FELICITACIONES_STATE.notificacionActual = notificacion;
    FELICITACIONES_STATE.temaActual = esCumple ? 'rosanacar' : 'esmeralda';
    FELICITACIONES_STATE.colorPersonalizado = null;
    FELICITACIONES_STATE.colorContraste = null;
    FELICITACIONES_STATE.colorTexto = '#ffffff';
    FELICITACIONES_STATE.mensajeActual = generarMensajeIA(notificacion);

    // Restablecer swatch activo según el tipo
    $('.felicitacion-swatch').removeClass('active');
    $('#grupoColoresPersonalizados').removeClass('active-custom');
    $(`[data-tema="${FELICITACIONES_STATE.temaActual}"]`).addClass('active');

    // Resetear inputs y dots a los colores por defecto
    const cCentral = esCumple ? '#f4b6c2' : '#10b981';
    const cContraste = esCumple ? '#5a3543' : '#064e3b';
    $('#inputColorCentral').val(cCentral);
    $('#inputColorContraste').val(cContraste);
    $('#previewColorCentral').css('background', cCentral);
    $('#previewColorContraste').css('background', cContraste);
    actualizarPreviewGradiente();

    // Resetear paleta de letras a blanco clásico
    actualizarPaletaTexto('#ffffff');

    // Actualizar badge de años y cabecera del modal
    if (esCumple) {
        $('#felicitacionModalLabel').find('.fw-bold').text('Tarjeta de Cumpleaños');
        $('#felicitacionModalLabel').find('i').first().attr('class', 'bi bi-cake2-fill text-pink fs-5');
        const edadTexto = (notificacion.edad || notificacion.anios || '') + ' Años de Vida';
        $('#modalAnivBadge').removeClass('bg-success-subtle text-success border-success-subtle')
                            .addClass('bg-pink-subtle text-pink border-pink-subtle')
                            .text(edadTexto);
    } else {
        $('#felicitacionModalLabel').find('.fw-bold').text('Tarjeta Conmemorativa de Aniversario');
        $('#felicitacionModalLabel').find('i').first().attr('class', 'bi bi-award-fill text-success fs-5');
        const aniosTexto = notificacion.anios + (notificacion.anios === 1 ? ' Año' : ' Años');
        $('#modalAnivBadge').removeClass('bg-pink-subtle text-pink border-pink-subtle')
                            .addClass('bg-success-subtle text-success border-success-subtle')
                            .text(aniosTexto);
    }

    // Renderizar la tarjeta
    renderizarTarjetaFelicitacion(
        FELICITACIONES_STATE.notificacionActual,
        FELICITACIONES_STATE.temaActual,
        FELICITACIONES_STATE.mensajeActual
    );

    // Abrir el modal que ya reside en el DOM (cargado vía PHP)
    const modalEl = document.getElementById(FELICITACIONES_STATE.modalId);
    if (modalEl) {
        const modalInst = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInst.show();
    }

    // Disparar confeti
    lanzarConfetiFelicitacion();
}

function mostrarToastFelicitacion(mensaje) {
    const toast = $('#felicitacionToast');
    $('#felicitacionToastText').text(mensaje);
    toast.addClass('show');
    setTimeout(() => toast.removeClass('show'), 3000);
}

// ======================================================
// 4. MOTOR DE RENDERIZADO EN CANVAS (1080x1080)
// ======================================================

// Generador dinámico de paleta de gala a partir de cualquier color HEX elegido por el usuario
function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
        c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Detecta si un color es claro o luminoso (ITU-R BT.709) para contraste perfecto
function esColorClaro(hex) {
    if (!hex) return false;
    const rgb = hexToRgb(hex);
    const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return lum > 0.55;
}

function generarConfiguracionColor(hexCentral, hexContraste) {
    const rgbC = hexToRgb(hexCentral);
    const rgbD = hexToRgb(hexContraste);

    // El fondo usa el color central para el centro brillante y el contraste para las esquinas
    const bg1 = hexContraste;   // esquina superior-izquierda (oscuro/contraste)
    const bg2 = hexCentral;     // punto medio (el color principal que elige el usuario)
    const bg3 = hexContraste;   // esquina inferior-derecha (oscuro/contraste)

    // Viñeta usa el color de contraste oscurecido
    const vigRgb = rgbD;
    const vignetteColor = `rgba(${Math.round(vigRgb.r * 0.35)}, ${Math.round(vigRgb.g * 0.35)}, ${Math.round(vigRgb.b * 0.35)}, 0.80)`;

    // Acento claro derivado del color central
    const light = rgbToHex(
        rgbC.r + (255 - rgbC.r) * 0.75,
        rgbC.g + (255 - rgbC.g) * 0.75,
        rgbC.b + (255 - rgbC.b) * 0.75
    );
    const darkC = rgbToHex(rgbC.r * 0.5, rgbC.g * 0.5, rgbC.b * 0.5);

    return {
        bg1: bg1,
        bg2: bg2,
        bg3: bg3,
        glowColor: `rgba(${rgbC.r}, ${rgbC.g}, ${rgbC.b}, 0.35)`,
        glowSecondary: `rgba(${rgbD.r}, ${rgbD.g}, ${rgbD.b}, 0.18)`,
        gold1: '#ffffff',
        gold2: hexCentral,
        gold3: darkC,
        goldRing: '#ffd700',
        frameGold: '#ffd700',
        pillBg: `rgba(${Math.round(rgbD.r * 0.3)}, ${Math.round(rgbD.g * 0.3)}, ${Math.round(rgbD.b * 0.3)}, 0.75)`,
        pillBorder: `rgba(${rgbC.r}, ${rgbC.g}, ${rgbC.b}, 0.65)`,
        accentText: light,
        ribbonBg1: '#fffbeb',
        ribbonBg2: '#ffd700',
        ribbonBg3: '#b45309',
        ribbonTextColor: '#1c1917',
        vignetteColor: vignetteColor
    };
}

function obtenerConfiguracionTema(tema) {
    if (tema === 'personalizado' && FELICITACIONES_STATE.colorPersonalizado) {
        return generarConfiguracionColor(
            FELICITACIONES_STATE.colorPersonalizado,
            FELICITACIONES_STATE.colorContraste || FELICITACIONES_STATE.colorPersonalizado
        );
    }

    const temas = {
        esmeralda: {
            bg1: '#012117',
            bg2: '#064e3b',
            bg3: '#02241b',
            glowColor: 'rgba(245, 158, 11, 0.22)',
            glowSecondary: 'rgba(16, 185, 129, 0.16)',
            gold1: '#fffbeb',
            gold2: '#f59e0b',
            gold3: '#b45309',
            goldRing: '#fde047',
            frameGold: '#d4af37',
            pillBg: 'rgba(0, 0, 0, 0.38)',
            pillBorder: 'rgba(254, 240, 138, 0.5)',
            accentText: '#fef08a',
            ribbonBg1: '#fef08a',
            ribbonBg2: '#f59e0b',
            ribbonBg3: '#b45309',
            ribbonTextColor: '#02241b',
            vignetteColor: 'rgba(0, 18, 10, 0.72)',
        },
        gala: {
            bg1: '#030712',
            bg2: '#111827',
            bg3: '#020617',
            glowColor: 'rgba(251, 191, 36, 0.25)',
            glowSecondary: 'rgba(217, 119, 6, 0.15)',
            gold1: '#ffffff',
            gold2: '#fbbf24',
            gold3: '#d97706',
            goldRing: '#ffd700',
            frameGold: '#f59e0b',
            pillBg: 'rgba(17, 24, 39, 0.7)',
            pillBorder: 'rgba(251, 191, 36, 0.55)',
            accentText: '#fef3c7',
            ribbonBg1: '#fffbeb',
            ribbonBg2: '#fbbf24',
            ribbonBg3: '#d97706',
            ribbonTextColor: '#0f172a',
            vignetteColor: 'rgba(2, 5, 15, 0.72)',
        },
        citrus: {
            bg1: '#1c1917',
            bg2: '#431407',
            bg3: '#180803',
            glowColor: 'rgba(249, 115, 22, 0.28)',
            glowSecondary: 'rgba(251, 191, 36, 0.16)',
            gold1: '#ffedd5',
            gold2: '#f97316',
            gold3: '#ea580c',
            goldRing: '#fbbf24',
            frameGold: '#fb923c',
            pillBg: 'rgba(41, 14, 5, 0.65)',
            pillBorder: 'rgba(253, 186, 116, 0.55)',
            accentText: '#fed7aa',
            ribbonBg1: '#ffedd5',
            ribbonBg2: '#f97316',
            ribbonBg3: '#c2410c',
            ribbonTextColor: '#270c03',
            vignetteColor: 'rgba(18, 5, 0, 0.72)',
        },
        rubi: {
            bg1: '#1f040a',
            bg2: '#4c0519',
            bg3: '#27070f',
            glowColor: 'rgba(244, 63, 94, 0.32)',
            glowSecondary: 'rgba(251, 191, 36, 0.18)',
            gold1: '#fff1f2',
            gold2: '#fb7185',
            gold3: '#be123c',
            goldRing: '#fecdd3',
            frameGold: '#fb7185',
            pillBg: 'rgba(76, 5, 25, 0.7)',
            pillBorder: 'rgba(251, 113, 133, 0.55)',
            accentText: '#ffe4e6',
            ribbonBg1: '#fff1f2',
            ribbonBg2: '#f43f5e',
            ribbonBg3: '#9f1239',
            ribbonTextColor: '#4c0519',
            vignetteColor: 'rgba(18, 2, 8, 0.72)',
        },
        obsidiana: {
            bg1: '#000000',
            bg2: '#0d0d0d',
            bg3: '#050505',
            glowColor: 'rgba(255, 215, 0, 0.35)',
            glowSecondary: 'rgba(245, 158, 11, 0.2)',
            gold1: '#ffffff',
            gold2: '#ffd700',
            gold3: '#b45309',
            goldRing: '#fde047',
            frameGold: '#ffd700',
            pillBg: 'rgba(24, 24, 27, 0.85)',
            pillBorder: 'rgba(255, 215, 0, 0.65)',
            accentText: '#fef08a',
            ribbonBg1: '#ffffff',
            ribbonBg2: '#ffd700',
            ribbonBg3: '#b45309',
            ribbonTextColor: '#000000',
            vignetteColor: 'rgba(0, 0, 0, 0.82)',
        },
        rosanacar: {
            bg1: '#2e1720',
            bg2: '#5a3543',
            bg3: '#1e0e15',
            glowColor: 'rgba(244, 182, 194, 0.28)',
            glowSecondary: 'rgba(253, 228, 207, 0.18)',
            gold1: '#fff1f2',
            gold2: '#f4b6c2',
            gold3: '#be7c8a',
            goldRing: '#fecdd3',
            frameGold: '#f4b6c2',
            pillBg: 'rgba(74, 40, 51, 0.75)',
            pillBorder: 'rgba(244, 182, 194, 0.6)',
            accentText: '#ffe4e6',
            ribbonBg1: '#fff5f7',
            ribbonBg2: '#f4b6c2',
            ribbonBg3: '#be7c8a',
            ribbonTextColor: '#4a212d',
            vignetteColor: 'rgba(25, 10, 16, 0.72)',
        },
        salvia: {
            bg1: '#13261f',
            bg2: '#2a483b',
            bg3: '#0d1a15',
            glowColor: 'rgba(167, 212, 188, 0.25)',
            glowSecondary: 'rgba(236, 253, 245, 0.15)',
            gold1: '#f0fdf4',
            gold2: '#a7d4bc',
            gold3: '#5b8a72',
            goldRing: '#dcfce7',
            frameGold: '#a7d4bc',
            pillBg: 'rgba(26, 50, 40, 0.75)',
            pillBorder: 'rgba(167, 212, 188, 0.55)',
            accentText: '#dcfce7',
            ribbonBg1: '#f0fdf4',
            ribbonBg2: '#a7d4bc',
            ribbonBg3: '#446b57',
            ribbonTextColor: '#13261f',
            vignetteColor: 'rgba(10, 20, 16, 0.72)',
        },
        champagne: {
            bg1: '#241e15',
            bg2: '#4a3e2c',
            bg3: '#18130c',
            glowColor: 'rgba(232, 207, 153, 0.25)',
            glowSecondary: 'rgba(253, 230, 138, 0.16)',
            gold1: '#fffdf7',
            gold2: '#e8cf99',
            gold3: '#a1854f',
            goldRing: '#fef08a',
            frameGold: '#e8cf99',
            pillBg: 'rgba(53, 44, 31, 0.75)',
            pillBorder: 'rgba(232, 207, 153, 0.55)',
            accentText: '#fef9c3',
            ribbonBg1: '#fffbeb',
            ribbonBg2: '#e8cf99',
            ribbonBg3: '#947842',
            ribbonTextColor: '#2e2413',
            vignetteColor: 'rgba(20, 16, 10, 0.72)',
        },
        azul_sereno: {
            bg1: '#162331',
            bg2: '#2b3e52',
            bg3: '#0e1721',
            glowColor: 'rgba(186, 215, 238, 0.25)',
            glowSecondary: 'rgba(148, 163, 184, 0.18)',
            gold1: '#f8fafc',
            gold2: '#93c5fd',
            gold3: '#475569',
            goldRing: '#bfdbfe',
            frameGold: '#93c5fd',
            pillBg: 'rgba(32, 48, 64, 0.75)',
            pillBorder: 'rgba(147, 197, 253, 0.55)',
            accentText: '#e0f2fe',
            ribbonBg1: '#f8fafc',
            ribbonBg2: '#93c5fd',
            ribbonBg3: '#3b82f6',
            ribbonTextColor: '#0f172a',
            vignetteColor: 'rgba(12, 19, 28, 0.72)',
        },
        lavanda: {
            bg1: '#23182b',
            bg2: '#423052',
            bg3: '#160e1c',
            glowColor: 'rgba(216, 180, 254, 0.25)',
            glowSecondary: 'rgba(233, 213, 255, 0.15)',
            gold1: '#faf5ff',
            gold2: '#d8b4fe',
            gold3: '#8b5cf6',
            goldRing: '#e9d5ff',
            frameGold: '#d8b4fe',
            pillBg: 'rgba(53, 38, 66, 0.75)',
            pillBorder: 'rgba(216, 180, 254, 0.55)',
            accentText: '#f3e8ff',
            ribbonBg1: '#faf5ff',
            ribbonBg2: '#d8b4fe',
            ribbonBg3: '#7c3aed',
            ribbonTextColor: '#2e1065',
            vignetteColor: 'rgba(18, 11, 23, 0.72)',
        },
        moca: {
            bg1: '#251c17',
            bg2: '#47372d',
            bg3: '#17110e',
            glowColor: 'rgba(234, 212, 190, 0.25)',
            glowSecondary: 'rgba(247, 231, 206, 0.15)',
            gold1: '#fdfaf7',
            gold2: '#d4b297',
            gold3: '#8a6b53',
            goldRing: '#f5ebe0',
            frameGold: '#d4b297',
            pillBg: 'rgba(54, 41, 33, 0.75)',
            pillBorder: 'rgba(212, 178, 151, 0.55)',
            accentText: '#f5ebe0',
            ribbonBg1: '#fdfaf7',
            ribbonBg2: '#d4b297',
            ribbonBg3: '#78533a',
            ribbonTextColor: '#291a10',
            vignetteColor: 'rgba(20, 14, 11, 0.72)',
        }
    };

    return temas[tema] || temas.esmeralda;
}

// Router de diseño: decide si renderizar la tarjeta conmemorativa de aniversario o la festiva de cumpleaños
function renderizarTarjetaFelicitacion(notif, tema, mensajeObj) {
    if (!notif) return;
    const esCumple = notif.es_cumpleanos || (notif.tipo && notif.tipo.startsWith('CUMPLE'));

    if (esCumple) {
        renderizarTarjetaCumpleanos(notif, tema, mensajeObj);
    } else {
        renderizarTarjetaAniversario(notif, tema, mensajeObj);
    }
}

// ======================================================
// DISEÑO 1: TARJETA CONMEMORATIVA DE ANIVERSARIO LABORAL
// (Estilo Diploma de Gala / Reconocimiento Institucional)
// ======================================================
function renderizarTarjetaAniversario(notif, tema, mensajeObj) {
    const canvas = document.getElementById(FELICITACIONES_STATE.canvasId);
    if (!canvas || !notif) return;
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1080;

    const cfg = obtenerConfiguracionTema(tema);
    const mensaje = mensajeObj || generarMensajeIA(notif);

    const colorTexto = FELICITACIONES_STATE.colorTexto || '#ffffff';
    const esTextoClaro = esColorClaro(colorTexto);

    // 1. Fondo con degradado
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, cfg.bg1);
    bgGrad.addColorStop(0.5, cfg.bg2);
    bgGrad.addColorStop(1, cfg.bg3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Resplandor radial festivo
    const radialGlow = ctx.createRadialGradient(W / 2, 300, 20, W / 2, 300, 420);
    radialGlow.addColorStop(0, cfg.glowColor);
    radialGlow.addColorStop(0.5, cfg.glowSecondary);
    radialGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, W, H);

    // Viñeta oscura suave en bordes
    const vigColor = cfg.vignetteColor || 'rgba(0, 0, 0, 0.65)';
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 780);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, vigColor);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // 2. Marcos de Gala Dorados
    const goldGrad = ctx.createLinearGradient(0, 0, W, H);
    goldGrad.addColorStop(0, cfg.gold1);
    goldGrad.addColorStop(0.3, cfg.gold2);
    goldGrad.addColorStop(0.7, cfg.gold3);
    goldGrad.addColorStop(1, cfg.gold1);

    ctx.save();
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.42)';
    ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, W - 108, H - 108);

    dibujarEsquinasOrnamentalesFeliz(ctx, 40, 40, W - 80, H - 80, cfg.frameGold);
    dibujarDiamanteFeliz(ctx, W / 2, 40, 6, cfg.goldRing);
    dibujarDiamanteFeliz(ctx, W / 2, H - 40, 6, cfg.goldRing);
    dibujarDiamanteFeliz(ctx, 40, H / 2, 6, cfg.goldRing);
    dibujarDiamanteFeliz(ctx, W - 40, H / 2, 6, cfg.goldRing);
    ctx.restore();

    // 3. Destellos estelares y burbujas festivas
    dibujarParticulasFestivasFeliz(ctx, cfg.goldRing);

    // 4. Encabezado SAAO
    ctx.save();
    const pillW = 390;
    const pillH = 44;
    const pillX = (W - pillW) / 2;
    const pillY = 82;

    dibujarRectanguloRedondeadoFeliz(ctx, pillX, pillY, pillW, pillH, 22);
    ctx.fillStyle = cfg.pillBg;
    ctx.fill();
    ctx.strokeStyle = cfg.pillBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = cfg.gold1;
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('★  C Í T R I C O S   S A A O  ★', W / 2, pillY + pillH / 2);

    ctx.fillStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)';
    ctx.font = '600 12.5px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('R E C O N O C I M I E N T O   I N S T I T U C I O N A L', W / 2, 150);
    ctx.restore();

    // 5. Medallón Central (Años cumplidos)
    const medX = W / 2;
    const medY = 295;
    const medR = 102;

    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.28)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 28; i++) {
        const angulo = (i * Math.PI * 2) / 28;
        const x1 = medX + Math.cos(angulo) * (medR + 4);
        const y1 = medY + Math.sin(angulo) * (medR + 4);
        const x2 = medX + Math.cos(angulo) * (medR + 14);
        const y2 = medY + Math.sin(angulo) * (medR + 14);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(medX, medY, medR, 0, Math.PI * 2);
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(medX, medY, medR - 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    const innerVelvet = ctx.createRadialGradient(medX, medY, 5, medX, medY, medR - 10);
    const medCenterBg = esColorClaro(cfg.bg2) ? '#0f172a' : cfg.bg2;
    const medOuterBg = esColorClaro(cfg.bg2) ? '#020617' : '#021a12';
    innerVelvet.addColorStop(0, medCenterBg);
    innerVelvet.addColorStop(1, medOuterBg);
    ctx.fillStyle = innerVelvet;
    ctx.beginPath();
    ctx.arc(medX, medY, medR - 10, 0, Math.PI * 2);
    ctx.fill();

    const numGrad = ctx.createLinearGradient(medX, medY - 50, medX, medY + 30);
    numGrad.addColorStop(0, '#ffffff');
    numGrad.addColorStop(0.3, cfg.gold1);
    numGrad.addColorStop(0.7, cfg.gold2);
    numGrad.addColorStop(1, cfg.gold3);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = numGrad;
    ctx.font = '900 92px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(notif.anios || '1'), medX, medY - 6);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = cfg.accentText;
    ctx.font = '800 17px "Inter", sans-serif';
    ctx.letterSpacing = '5px';
    const aniosWord = (notif.anios === 1 ? 'AÑO' : 'AÑOS');
    ctx.fillText(aniosWord, medX, medY + 52);

    ctx.font = '12px "Inter", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('★  ★  ★', medX, medY + 72);
    ctx.restore();

    // 6. Cinta 3D
    dibujarCinta3DFeliz(ctx, medX, 396, 460, 46, cfg, '★  T R A Y E C T O R I A   &   L E A L T A D  ★');

    // 7. Nombre y Datos del Colaborador
    ctx.save();
    ctx.fillStyle = esTextoClaro ? 'rgba(254, 240, 138, 0.92)' : 'rgba(30, 41, 59, 0.88)';
    ctx.font = '600 13px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('SE OTORGA LA PRESENTE DISTINCIÓN CON CARIÑO Y GRATITUD A:', medX, 480);

    const nombre = (notif.nombre || 'Colaborador').toUpperCase();
    let fontSizeNombre = 44;
    if (nombre.length > 30) fontSizeNombre = 32;
    else if (nombre.length > 22) fontSizeNombre = 38;

    if (esTextoClaro) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
    } else {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
    }
    ctx.fillStyle = colorTexto;
    ctx.font = `800 ${fontSizeNombre}px "Inter", sans-serif`;
    ctx.letterSpacing = '1px';
    ctx.fillText(nombre, medX, 528);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const divGrad = ctx.createLinearGradient(medX - 250, 552, medX + 250, 552);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.3, cfg.gold2);
    divGrad.addColorStop(0.5, cfg.gold1);
    divGrad.addColorStop(0.7, cfg.gold2);
    divGrad.addColorStop(1, 'transparent');

    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(medX - 250, 552);
    ctx.lineTo(medX + 250, 552);
    ctx.stroke();

    dibujarDiamanteFeliz(ctx, medX, 552, 5, cfg.gold1);

    let metaTexto = '';
    if (notif.puesto && notif.departamento) {
        metaTexto = `${notif.puesto}  ·  ${notif.departamento}  ·  Clave: ${notif.clave_empleado}`;
    } else if (notif.departamento) {
        metaTexto = `Departamento: ${notif.departamento}  ·  Clave: ${notif.clave_empleado}`;
    } else {
        metaTexto = `Colaborador Clave: ${notif.clave_empleado}  ·  Familia Cítricos SAAO`;
    }

    ctx.fillStyle = esTextoClaro ? '#cbd5e1' : 'rgba(30, 41, 59, 0.85)';
    ctx.font = '600 15px "Inter", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(metaTexto, medX, 578);
    ctx.restore();

    // 8. TARJETA DE MENSAJE DINÁMICO
    const cardX = 100;
    const cardY = 608;
    const cardW = 880;
    const cardH = 224;

    ctx.save();
    dibujarRectanguloRedondeadoFeliz(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fillStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fill();
    ctx.strokeStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Comillas de ambientación
    ctx.fillStyle = esTextoClaro ? 'rgba(254, 240, 138, 0.22)' : 'rgba(0, 0, 0, 0.16)';
    ctx.font = 'italic 75px "Georgia", serif';
    ctx.fillText('“', cardX + 28, cardY + 62);
    ctx.fillText('”', cardX + cardW - 48, cardY + cardH - 8);

    ctx.font = '600 19px "Inter", sans-serif';
    ctx.fillStyle = colorTexto;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.15px';

    let yCursor = dibujarTextoCentradoMultilineaFeliz(
        ctx,
        mensaje.cuerpo,
        medX,
        cardY + 52,
        760,
        28
    );

    ctx.fillStyle = esTextoClaro ? cfg.accentText : (esColorClaro(cfg.accentText) ? '#78350f' : cfg.accentText);
    ctx.font = '800 19.5px "Inter", sans-serif';
    ctx.letterSpacing = '0.4px';
    ctx.fillText(mensaje.cierre, medX, yCursor + 22);
    ctx.restore();

    // 9. Pie Conmemorativo (Fecha, Sello, Firma)
    const fechaLarga = formatearFechaLargaFeliz(notif.fecha_aniversario);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = esTextoClaro ? '#94a3b8' : '#475569';
    ctx.font = '600 11.5px "Inter", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('FECHA CONMEMORATIVA', 140, 892);

    ctx.fillStyle = colorTexto;
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.letterSpacing = '0.3px';
    ctx.fillText(fechaLarga, 140, 918);

    ctx.textAlign = 'center';
    dibujarSelloOficialFeliz(ctx, medX, 910, cfg.goldRing);

    ctx.textAlign = 'right';
    ctx.fillStyle = esTextoClaro ? '#94a3b8' : '#475569';
    ctx.font = '600 11.5px "Inter", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('DIRECCIÓN DE CAPITAL HUMANO', W - 140, 892);

    ctx.fillStyle = colorTexto;
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.letterSpacing = '0.3px';
    ctx.fillText('Cítricos SAAO, S.A. de C.V.', W - 140, 918);

    ctx.textAlign = 'center';
    ctx.fillStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.45)';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`Folio Oficial: SAAO-ANIV-${notif.clave_empleado}-${notif.anios}Y · Certificado Digital Conmemorativo`, medX, 995);
    ctx.restore();
}

// ======================================================
// DISEÑO 2: TARJETA FESTIVA DE CUMPLEAÑOS
// (Estilo Celebración / Fiesta / Globos / Pastel / Guirnaldas)
// ======================================================
function renderizarTarjetaCumpleanos(notif, tema, mensajeObj) {
    const canvas = document.getElementById(FELICITACIONES_STATE.canvasId);
    if (!canvas || !notif) return;
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1080;

    const cfg = obtenerConfiguracionTema(tema);
    const mensaje = mensajeObj || generarMensajeIA(notif);
    const colorTexto = FELICITACIONES_STATE.colorTexto || '#ffffff';
    const esTextoClaro = esColorClaro(colorTexto);

    // 1. Fondo Festivo Vibrante (Radial + Gradiente)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, cfg.bg1);
    bgGrad.addColorStop(0.5, cfg.bg2);
    bgGrad.addColorStop(1, cfg.bg3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Resplandor cálido festivo centrado en la parte superior
    const glowFestivo = ctx.createRadialGradient(W / 2, 270, 20, W / 2, 270, 480);
    glowFestivo.addColorStop(0, cfg.glowColor);
    glowFestivo.addColorStop(0.5, cfg.glowSecondary);
    glowFestivo.addColorStop(1, 'transparent');
    ctx.fillStyle = glowFestivo;
    ctx.fillRect(0, 0, W, H);

    // Viñeta suave
    const vigColor = cfg.vignetteColor || 'rgba(0, 0, 0, 0.65)';
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 430, W / 2, H / 2, 780);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, vigColor);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // 2. Marco Festivo Redondeado Moderno
    ctx.save();
    const marcoRadio = 26;
    dibujarRectanguloRedondeadoFeliz(ctx, 36, 36, W - 72, H - 72, marcoRadio);
    const goldGrad = ctx.createLinearGradient(0, 0, W, H);
    goldGrad.addColorStop(0, cfg.gold1);
    goldGrad.addColorStop(0.3, cfg.gold2);
    goldGrad.addColorStop(0.7, cfg.gold3);
    goldGrad.addColorStop(1, cfg.gold1);
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Marco interno punteado festivo
    dibujarRectanguloRedondeadoFeliz(ctx, 48, 48, W - 96, H - 96, marcoRadio - 6);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Guirnalda de Banderines de Fiesta (Bunting Garland)
    dibujarGuirnaldaCumpleanos(ctx, 48, W, cfg);

    // 4. Globos Festivos 3D en las Esquinas Superiores
    // Izquierda
    dibujarGloboCumpleanos(ctx, 115, 185, 36, cfg.gold2, cfg.gold3, 'rgba(255,255,255,0.7)', -12);
    dibujarGloboCumpleanos(ctx, 165, 235, 42, cfg.ribbonBg2 || '#ec4899', cfg.ribbonBg3 || '#db2777', 'rgba(255,255,255,0.75)', 8);
    // Derecha
    dibujarGloboCumpleanos(ctx, W - 115, 185, 36, cfg.gold2, cfg.gold3, 'rgba(255,255,255,0.7)', 12);
    dibujarGloboCumpleanos(ctx, W - 165, 235, 42, cfg.ribbonBg2 || '#ec4899', cfg.ribbonBg3 || '#db2777', 'rgba(255,255,255,0.75)', -8);

    // 5. Confeti y Serpentinas Celebratorias
    dibujarConfetiCumpleanos(ctx, W, H, cfg);

    // 6. Cápsula Institucional Superior
    ctx.save();
    const pillW = 340;
    const pillH = 38;
    const pillX = (W - pillW) / 2;
    const pillY = 66;

    dibujarRectanguloRedondeadoFeliz(ctx, pillX, pillY, pillW, pillH, 19);
    ctx.fillStyle = cfg.pillBg;
    ctx.fill();
    ctx.strokeStyle = cfg.pillBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = cfg.gold1;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('★  C Í T R I C O S   S A A O  ★', W / 2, pillY + pillH / 2);
    ctx.restore();

    // 7. Gran Título "¡FELIZ CUMPLEAÑOS!"
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    const titleGrad = ctx.createLinearGradient(W / 2 - 250, 125, W / 2 + 250, 125);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.2, cfg.gold1);
    titleGrad.addColorStop(0.5, cfg.goldRing);
    titleGrad.addColorStop(0.8, cfg.gold2);
    titleGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = titleGrad;
    ctx.font = '900 44px "Inter", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('¡ F E L I Z   C U M P L E A Ñ O S !', W / 2, 134);
    ctx.restore();

    // 8. Emblema Central de Cumpleaños: Pastel de Fiesta con Velas y Medallón de Edad
    const cx = W / 2;
    const cy = 285;
    dibujarCentroCumpleanos(ctx, cx, cy, notif, cfg, esTextoClaro);

    // 9. Sección del Homenajeado (Nombre y Puesto)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = esTextoClaro ? 'rgba(254, 240, 138, 0.92)' : 'rgba(30, 41, 59, 0.88)';
    ctx.font = '700 13px "Inter", sans-serif';
    ctx.letterSpacing = '2.5px';
    ctx.fillText('HOY CELEBRAMOS CON GRAN CARIÑO A:', cx, 478);

    const nombre = (notif.nombre || 'Colaborador').toUpperCase();
    let fontSizeNombre = 44;
    if (nombre.length > 30) fontSizeNombre = 32;
    else if (nombre.length > 22) fontSizeNombre = 38;

    if (esTextoClaro) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 3;
    } else {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
    }
    ctx.fillStyle = colorTexto;
    ctx.font = `900 ${fontSizeNombre}px "Inter", sans-serif`;
    ctx.letterSpacing = '1px';
    ctx.fillText(nombre, cx, 524);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Divisor festivo con destellos
    const divGrad = ctx.createLinearGradient(cx - 260, 548, cx + 260, 548);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.3, cfg.gold2);
    divGrad.addColorStop(0.5, cfg.gold1);
    divGrad.addColorStop(0.7, cfg.gold2);
    divGrad.addColorStop(1, 'transparent');

    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 260, 548);
    ctx.lineTo(cx + 260, 548);
    ctx.stroke();

    ctx.fillStyle = cfg.goldRing;
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('✦', cx, 549);

    let metaTexto = '';
    if (notif.puesto && notif.departamento) {
        metaTexto = `${notif.puesto}  ·  ${notif.departamento}  ·  Clave: ${notif.clave_empleado}`;
    } else if (notif.departamento) {
        metaTexto = `Departamento: ${notif.departamento}  ·  Clave: ${notif.clave_empleado}`;
    } else {
        metaTexto = `Colaborador Clave: ${notif.clave_empleado}  ·  Familia Cítricos SAAO`;
    }

    ctx.fillStyle = esTextoClaro ? '#cbd5e1' : 'rgba(30, 41, 59, 0.85)';
    ctx.font = '600 15px "Inter", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(metaTexto, cx, 574);
    ctx.restore();

    // 10. Tarjeta de Mensaje de Cumpleaños
    const cardX = 95;
    const cardY = 604;
    const cardW = 890;
    const cardH = 228;

    ctx.save();
    dibujarRectanguloRedondeadoFeliz(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.fillStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fill();
    ctx.strokeStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Íconos decorativos festivos
    ctx.fillStyle = esTextoClaro ? 'rgba(254, 240, 138, 0.25)' : 'rgba(0, 0, 0, 0.16)';
    ctx.font = 'italic 72px "Georgia", serif';
    ctx.fillText('“', cardX + 32, cardY + 64);
    ctx.fillText('”', cardX + cardW - 52, cardY + cardH - 10);

    ctx.font = '600 19px "Inter", sans-serif';
    ctx.fillStyle = colorTexto;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.15px';

    let yCursor = dibujarTextoCentradoMultilineaFeliz(
        ctx,
        mensaje.cuerpo,
        cx,
        cardY + 54,
        770,
        28
    );

    ctx.fillStyle = esTextoClaro ? cfg.accentText : (esColorClaro(cfg.accentText) ? '#78350f' : cfg.accentText);
    ctx.font = '800 19.5px "Inter", sans-serif';
    ctx.letterSpacing = '0.4px';
    ctx.fillText(mensaje.cierre, cx, yCursor + 22);
    ctx.restore();

    // 11. Pie Celebratorio de Cumpleaños
    const fechaCumple = formatearFechaCumpleLarga(notif.fecha_cumpleanos || notif.fecha_nacimiento);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = esTextoClaro ? '#94a3b8' : '#475569';
    ctx.font = '600 11.5px "Inter", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('FECHA DE CUMPLEAÑOS', 140, 892);

    ctx.fillStyle = colorTexto;
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.letterSpacing = '0.3px';
    ctx.fillText(fechaCumple, 140, 918);

    ctx.textAlign = 'center';
    dibujarSelloCumpleanos(ctx, cx, 910, cfg.goldRing);

    ctx.textAlign = 'right';
    ctx.fillStyle = esTextoClaro ? '#94a3b8' : '#475569';
    ctx.font = '600 11.5px "Inter", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('CON EL APRECIO DE:', W - 140, 892);

    ctx.fillStyle = colorTexto;
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.letterSpacing = '0.3px';
    ctx.fillText('Familia Cítricos SAAO', W - 140, 918);

    ctx.textAlign = 'center';
    ctx.fillStyle = esTextoClaro ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.45)';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`Celebración Institucional de Vida · Tarjeta Digital SAAO`, cx, 995);
    ctx.restore();
}

// Emblema Central para Cumpleaños: Pastel con velas + Gran número de edad + Cinta 3D
function dibujarCentroCumpleanos(ctx, cx, cy, notif, cfg, esTextoClaro) {
    ctx.save();

    const embW = 470;
    const embH = 210;
    const embX = cx - embW / 2;
    const embY = cy - 85;

    // Resplandor detrás de la placa
    const glowPlaca = ctx.createRadialGradient(cx, cy + 20, 10, cx, cy + 20, 230);
    glowPlaca.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
    glowPlaca.addColorStop(1, 'transparent');
    ctx.fillStyle = glowPlaca;
    ctx.fillRect(embX - 40, embY - 40, embW + 80, embH + 80);

    // Placa redondeada festiva
    dibujarRectanguloRedondeadoFeliz(ctx, embX, embY, embW, embH, 24);
    const placaGrad = ctx.createLinearGradient(embX, embY, embX, embY + embH);
    placaGrad.addColorStop(0, esTextoClaro ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.35)');
    placaGrad.addColorStop(1, esTextoClaro ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = placaGrad;
    ctx.fill();

    const marcoGrad = ctx.createLinearGradient(embX, embY, embX + embW, embY + embH);
    marcoGrad.addColorStop(0, cfg.gold1);
    marcoGrad.addColorStop(0.5, cfg.gold2);
    marcoGrad.addColorStop(1, cfg.gold3);
    ctx.strokeStyle = marcoGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // --- PASTEL DE CUMPLEAÑOS VECTORIAL EN EL CENTRO SUPERIOR ---
    const cakeY = embY + 45;
    // Base del plato
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cakeY + 16, 44, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Piso inferior del pastel
    dibujarRectanguloRedondeadoFeliz(ctx, cx - 36, cakeY - 6, 72, 22, 4);
    const cakeGrad1 = ctx.createLinearGradient(cx - 36, cakeY - 6, cx + 36, cakeY - 6);
    cakeGrad1.addColorStop(0, cfg.gold2);
    cakeGrad1.addColorStop(0.5, cfg.gold1);
    cakeGrad1.addColorStop(1, cfg.gold2);
    ctx.fillStyle = cakeGrad1;
    ctx.fill();

    // Glaseado festivo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 24, cakeY - 6, 4, 0, Math.PI);
    ctx.arc(cx - 12, cakeY - 6, 4, 0, Math.PI);
    ctx.arc(cx, cakeY - 6, 4, 0, Math.PI);
    ctx.arc(cx + 12, cakeY - 6, 4, 0, Math.PI);
    ctx.arc(cx + 24, cakeY - 6, 4, 0, Math.PI);
    ctx.fill();

    // Piso superior del pastel
    dibujarRectanguloRedondeadoFeliz(ctx, cx - 26, cakeY - 26, 52, 20, 3);
    const cakeGrad2 = ctx.createLinearGradient(cx - 26, cakeY - 26, cx + 26, cakeY - 26);
    cakeGrad2.addColorStop(0, cfg.gold1);
    cakeGrad2.addColorStop(0.5, '#ffffff');
    cakeGrad2.addColorStop(1, cfg.gold1);
    ctx.fillStyle = cakeGrad2;
    ctx.fill();

    // 3 Velas de cumpleaños con llamas encendidas
    const velasX = [cx - 15, cx, cx + 15];
    velasX.forEach((vx, idx) => {
        // Vela
        ctx.fillStyle = idx === 1 ? '#ec4899' : '#38bdf8';
        ctx.fillRect(vx - 2, cakeY - 40, 4, 14);

        // Llama con resplandor
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(vx, cakeY - 44, 3, 5, 0, 0, Math.PI * 2);
        const flameGrad = ctx.createRadialGradient(vx, cakeY - 44, 1, vx, cakeY - 44, 6);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.4, '#fde047');
        flameGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = flameGrad;
        ctx.fill();
        ctx.restore();
    });

    // --- NÚMERO DE EDAD DESTACADO ---
    const edad = String(notif.edad || notif.anios || '');
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numGrad = ctx.createLinearGradient(cx - 60, cy + 30, cx + 60, cy + 60);
    numGrad.addColorStop(0, '#ffffff');
    numGrad.addColorStop(0.3, cfg.gold1);
    numGrad.addColorStop(0.7, cfg.gold2);
    numGrad.addColorStop(1, cfg.gold3);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = numGrad;
    ctx.font = '900 68px "Inter", sans-serif';
    ctx.fillText(edad, cx, cy + 40);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = cfg.accentText;
    ctx.font = '800 15px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('AÑOS DE VIDA', cx, cy + 82);
    ctx.restore();

    // --- CINTA INFERIOR 3D "¡FELIZ CUMPLEAÑOS!" ---
    dibujarCinta3DFeliz(ctx, cx, embY + embH - 12, 430, 42, cfg, '★  ¡ F E L I Z   C U M P L E A Ñ O S !  ★');

    ctx.restore();
}

// Dibuja globos festivos en 3D con volumen esférico, nudo y cuerda ondulada
function dibujarGloboCumpleanos(ctx, x, y, radio, color1, color2, colorHighlight, angulo = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angulo * Math.PI) / 180);

    // Cuerda ondulada hacia abajo
    ctx.beginPath();
    ctx.moveTo(0, radio * 1.25);
    ctx.bezierCurveTo(-10, radio * 1.8, 12, radio * 2.4, -4, radio * 3.2);
    ctx.bezierCurveTo(-14, radio * 3.8, 8, radio * 4.4, 0, radio * 5.0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nudo del globo
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.moveTo(-5, radio * 1.2);
    ctx.lineTo(5, radio * 1.2);
    ctx.lineTo(0, radio * 1.28);
    ctx.closePath();
    ctx.fill();

    // Cuerpo del globo
    ctx.beginPath();
    ctx.moveTo(0, radio * 1.2);
    ctx.bezierCurveTo(-radio * 1.15, radio * 1.0, -radio * 1.1, -radio * 1.0, 0, -radio * 1.1);
    ctx.bezierCurveTo(radio * 1.1, -radio * 1.0, radio * 1.15, radio * 1.0, 0, radio * 1.2);
    ctx.closePath();

    const balloonGrad = ctx.createRadialGradient(-radio * 0.35, -radio * 0.35, radio * 0.1, 0, 0, radio * 1.2);
    balloonGrad.addColorStop(0, color1);
    balloonGrad.addColorStop(0.7, color2);
    balloonGrad.addColorStop(1, '#000000');
    ctx.fillStyle = balloonGrad;
    ctx.fill();

    // Reflejo curvo brillante
    ctx.beginPath();
    ctx.ellipse(-radio * 0.38, -radio * 0.38, radio * 0.28, radio * 0.48, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    ctx.restore();
}

// Dibuja guirnalda de fiesta con banderines triangulares en arco superior
function dibujarGuirnaldaCumpleanos(ctx, y, w, cfg) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.quadraticCurveTo(w / 2, y + 45, w - 70, y);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const totalBanderines = 11;
    const colores = [cfg.gold1, cfg.gold2, cfg.accentText, '#ec4899', cfg.goldRing, '#a855f7', cfg.gold2, cfg.gold1, '#f59e0b', cfg.accentText, cfg.goldRing];

    for (let i = 0; i < totalBanderines; i++) {
        const t = (i + 1) / (totalBanderines + 1);
        const bx = 70 + t * (w - 140);
        const by = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 45) + t * t * y;

        ctx.fillStyle = colores[i % colores.length];
        ctx.beginPath();
        ctx.moveTo(bx - 14, by);
        ctx.lineTo(bx + 14, by);
        ctx.lineTo(bx, by + 28);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

// Dibuja confeti geométrico y serpentinas rizadas
function dibujarConfetiCumpleanos(ctx, w, h, cfg) {
    ctx.save();
    const confetis = [
        { x: 80, y: 320, w: 10, h: 6, rot: 25, color: cfg.goldRing },
        { x: 120, y: 410, w: 7, h: 7, rot: 45, color: '#ec4899' },
        { x: 60, y: 490, w: 12, h: 5, rot: -30, color: cfg.gold2 },
        { x: 140, y: 560, w: 8, h: 8, rot: 15, color: '#a855f7' },
        { x: 75, y: 680, w: 9, h: 6, rot: -40, color: cfg.gold1 },
        { x: 110, y: 770, w: 10, h: 7, rot: 60, color: '#f43f5e' },
        { x: w - 80, y: 320, w: 10, h: 6, rot: -25, color: cfg.goldRing },
        { x: w - 120, y: 410, w: 7, h: 7, rot: -45, color: '#a855f7' },
        { x: w - 60, y: 490, w: 12, h: 5, rot: 30, color: cfg.gold2 },
        { x: w - 140, y: 560, w: 8, h: 8, rot: -15, color: '#ec4899' },
        { x: w - 75, y: 680, w: 9, h: 6, rot: 40, color: cfg.gold1 },
        { x: w - 110, y: 770, w: 10, h: 7, rot: -60, color: '#f43f5e' },
        { x: 260, y: 110, w: 8, h: 8, rot: 35, color: cfg.goldRing },
        { x: 820, y: 110, w: 8, h: 8, rot: -35, color: cfg.goldRing },
        { x: 380, y: 80, w: 9, h: 5, rot: 15, color: '#ec4899' },
        { x: 700, y: 80, w: 9, h: 5, rot: -15, color: '#a855f7' }
    ];

    confetis.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
    });

    // Serpentinas rizadas festivas
    const serpentinas = [
        { x1: 90, y1: 270, cx1: 130, cy1: 300, cx2: 60, cy2: 340, x2: 95, y2: 380, color: cfg.gold2 },
        { x1: w - 90, y1: 270, cx1: w - 130, cy1: 300, cx2: w - 60, cy2: 340, x2: w - 95, y2: 380, color: cfg.gold2 }
    ];

    serpentinas.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.bezierCurveTo(s.cx1, s.cy1, s.cx2, s.cy2, s.x2, s.y2);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
    });

    // Estrellas destellantes festivas
    const estrellas = [
        { x: 190, y: 120, r: 12 },
        { x: w - 190, y: 120, r: 12 },
        { x: 220, y: 310, r: 9 },
        { x: w - 220, y: 310, r: 9 },
        { x: 120, y: 840, r: 10 },
        { x: w - 120, y: 840, r: 10 },
    ];
    estrellas.forEach(p => dibujarDestelloFeliz(ctx, p.x, p.y, p.r, cfg.goldRing));

    ctx.restore();
}

// Sello oficial festivo de cumpleaños
function dibujarSelloCumpleanos(ctx, x, y, goldColor) {
    ctx.save();
    // Anillo exterior dorado
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 65, 0, Math.PI * 2);
    ctx.stroke();

    // Anillo interior semitransparente
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Logo SAAO dentro del sello (si está disponible)
    if (FELICITACIONES_STATE.logoListo && FELICITACIONES_STATE.logoImg) {
        const logoSize = 108;
        // Círculo blanco de fondo para el logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 52, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // Clip circular para el logo
        ctx.clip();
        ctx.drawImage(FELICITACIONES_STATE.logoImg, x - logoSize / 2, y - logoSize / 2, logoSize, logoSize);
        ctx.restore();
    } else {
        // Fallback si el logo no cargó
        ctx.textAlign = 'center';
        ctx.fillStyle = goldColor;
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('★ SAAO ★', x, y - 6);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 9px "Inter", sans-serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText('CUMPLEAÑOS', x, y + 9);
    }
    ctx.restore();
}

// Formatea fecha en español para cumpleaños (ej. 17 de Octubre)
function formatearFechaCumpleLarga(fechaString) {
    if (!fechaString) return 'Día de Cumpleaños';
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const parts = fechaString.split('-').map(Number);
    if (parts.length >= 3) {
        return `${parts[2]} de ${nombresMeses[parts[1] - 1]}`;
    }
    return fechaString;
}

// ======================================================
// 5. UTILIDADES GRÁFICAS DE CANVAS
// ======================================================

function dibujarTextoCentradoMultilineaFeliz(ctx, texto, x, yInicio, anchoMaximo, interlineado) {
    const palabras = texto.split(' ');
    let lineaActual = '';
    let y = yInicio;

    for (let i = 0; i < palabras.length; i++) {
        const lineaPrueba = lineaActual ? lineaActual + ' ' + palabras[i] : palabras[i];
        if (ctx.measureText(lineaPrueba).width > anchoMaximo && i > 0) {
            ctx.fillText(lineaActual, x, y);
            lineaActual = palabras[i];
            y += interlineado;
        } else {
            lineaActual = lineaPrueba;
        }
    }
    if (lineaActual) {
        ctx.fillText(lineaActual, x, y);
        y += interlineado;
    }
    return y;
}

function dibujarRectanguloRedondeadoFeliz(ctx, x, y, ancho, alto, radio) {
    ctx.beginPath();
    ctx.moveTo(x + radio, y);
    ctx.lineTo(x + ancho - radio, y);
    ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
    ctx.lineTo(x + ancho, y + alto - radio);
    ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
    ctx.lineTo(x + radio, y + alto);
    ctx.quadraticCurveTo(x, y + alto, x, y + alto - radio);
    ctx.lineTo(x, y + radio);
    ctx.quadraticCurveTo(x, y, x + radio, y);
    ctx.closePath();
}

function dibujarDiamanteFeliz(ctx, x, y, radio, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - radio);
    ctx.lineTo(x + radio, y);
    ctx.lineTo(x, y + radio);
    ctx.lineTo(x - radio, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function dibujarEsquinasOrnamentalesFeliz(ctx, x, y, w, h, color) {
    const tam = 28;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x + tam, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + tam);
    ctx.stroke();
    dibujarDiamanteFeliz(ctx, x + 8, y + 8, 3.5, color);

    ctx.beginPath();
    ctx.moveTo(x + w - tam, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + tam);
    ctx.stroke();
    dibujarDiamanteFeliz(ctx, x + w - 8, y + 8, 3.5, color);

    ctx.beginPath();
    ctx.moveTo(x, y + h - tam);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + tam, y + h);
    ctx.stroke();
    dibujarDiamanteFeliz(ctx, x + 8, y + h - 8, 3.5, color);

    ctx.beginPath();
    ctx.moveTo(x + w - tam, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - tam);
    ctx.stroke();
    dibujarDiamanteFeliz(ctx, x + w - 8, y + h - 8, 3.5, color);
    ctx.restore();
}

function dibujarDestelloFeliz(ctx, cx, cy, radio, color) {
    ctx.save();
    ctx.fillStyle = color || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radio);
    ctx.quadraticCurveTo(cx, cy, cx + radio, cy);
    ctx.quadraticCurveTo(cx, cy, cx + radio, cy);
    ctx.quadraticCurveTo(cx, cy, cx - radio, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - radio);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
    ctx.beginPath();
    ctx.arc(cx, cy, radio * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function dibujarParticulasFestivasFeliz(ctx, goldColor) {
    const estrellas = [
        { x: 120, y: 140, r: 12 },
        { x: 960, y: 140, r: 12 },
        { x: 190, y: 240, r: 8 },
        { x: 890, y: 240, r: 8 },
        { x: 260, y: 170, r: 14 },
        { x: 820, y: 170, r: 14 },
        { x: 150, y: 360, r: 10 },
        { x: 930, y: 360, r: 10 },
        { x: 300, y: 310, r: 9 },
        { x: 780, y: 310, r: 9 },
        { x: 140, y: 760, r: 8 },
        { x: 940, y: 760, r: 8 },
        { x: 240, y: 840, r: 11 },
        { x: 840, y: 840, r: 11 },
    ];

    estrellas.forEach(p => dibujarDestelloFeliz(ctx, p.x, p.y, p.r, goldColor));

    const burbujas = [
        { x: 170, y: 190, r: 4, a: 0.25 },
        { x: 910, y: 190, r: 5, a: 0.22 },
        { x: 230, y: 320, r: 3.5, a: 0.18 },
        { x: 850, y: 320, r: 4, a: 0.2 },
        { x: 130, y: 460, r: 3, a: 0.15 },
        { x: 950, y: 460, r: 3.5, a: 0.16 },
    ];

    burbujas.forEach(b => {
        ctx.save();
        ctx.fillStyle = `rgba(254, 240, 138, ${b.a})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function dibujarCinta3DFeliz(ctx, cx, y, w, h, cfg, textoCinta = '★  T R A Y E C T O R I A   &   L E A L T A D  ★') {
    const x = cx - w / 2;
    const pliegue = 22;

    ctx.save();
    ctx.fillStyle = '#0a1a12';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + pliegue, y + h);
    ctx.lineTo(x, y + h + 14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w, y + h);
    ctx.lineTo(x + w - pliegue, y + h);
    ctx.lineTo(x + w, y + h + 14);
    ctx.closePath();
    ctx.fill();

    const ribGrad = ctx.createLinearGradient(x, y, x, y + h);
    ribGrad.addColorStop(0, cfg.ribbonBg1);
    ribGrad.addColorStop(0.5, cfg.ribbonBg2);
    ribGrad.addColorStop(1, cfg.ribbonBg3);

    ctx.fillStyle = ribGrad;
    dibujarRectanguloRedondeadoFeliz(ctx, x, y, w, h, 6);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    dibujarRectanguloRedondeadoFeliz(ctx, x + 2, y + 2, w - 4, h - 4, 5);
    ctx.stroke();

    ctx.fillStyle = cfg.ribbonTextColor;
    ctx.font = '800 15.5px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText(textoCinta, cx, y + h / 2);
    ctx.restore();
}

function dibujarSelloOficialFeliz(ctx, x, y, goldColor) {
    ctx.save();
    // Anillo exterior dorado
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 65, 0, Math.PI * 2);
    ctx.stroke();

    // Anillo interior semitransparente
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Logo SAAO dentro del sello (si está disponible)
    if (FELICITACIONES_STATE.logoListo && FELICITACIONES_STATE.logoImg) {
        const logoSize = 108;
        // Círculo blanco de fondo para el logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 52, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // Clip circular para el logo
        ctx.clip();
        ctx.drawImage(FELICITACIONES_STATE.logoImg, x - logoSize / 2, y - logoSize / 2, logoSize, logoSize);
        ctx.restore();
    } else {
        // Fallback si el logo no cargó
        ctx.fillStyle = goldColor;
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('★ SAAO ★', x, y - 6);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px "Inter", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('OFICIAL', x, y + 9);
    }
    ctx.restore();
}

function lanzarConfetiFelicitacion() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const modalDialog = document.querySelector('.felicitacion-dialog');
    const ancho = modalDialog ? modalDialog.offsetWidth : 780;
    const alto = modalDialog ? modalDialog.offsetHeight : 720;

    canvas.width = ancho;
    canvas.height = alto;

    if (FELICITACIONES_STATE.animacionConfetiId) {
        cancelAnimationFrame(FELICITACIONES_STATE.animacionConfetiId);
        FELICITACIONES_STATE.animacionConfetiId = null;
    }

    const colores = ['#10b981', '#f59e0b', '#fde047', '#34d399', '#6366f1', '#ec4899', '#ffffff'];
    const particulas = [];
    const totalParticulas = 60;

    for (let i = 0; i < totalParticulas; i++) {
        particulas.push({
            x: Math.random() * ancho,
            y: Math.random() * -alto,
            w: 6 + Math.random() * 6,
            h: 10 + Math.random() * 8,
            color: colores[Math.floor(Math.random() * colores.length)],
            velY: 2.5 + Math.random() * 3.5,
            velX: (Math.random() - 0.5) * 2,
            rotacion: Math.random() * 360,
            velRotacion: (Math.random() - 0.5) * 8,
        });
    }

    const tiempoInicio = performance.now();
    const duracionMs = 2800;

    function animar(ahora) {
        const transcurrido = ahora - tiempoInicio;
        if (transcurrido > duracionMs) {
            ctx.clearRect(0, 0, ancho, alto);
            FELICITACIONES_STATE.animacionConfetiId = null;
            return;
        }

        ctx.clearRect(0, 0, ancho, alto);
        const progreso = transcurrido / duracionMs;
        const fade = progreso > 0.7 ? (1 - progreso) / 0.3 : 1;

        particulas.forEach(p => {
            p.y += p.velY;
            p.x += p.velX;
            p.rotacion += p.velRotacion;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotacion * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, fade);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        FELICITACIONES_STATE.animacionConfetiId = requestAnimationFrame(animar);
    }

    FELICITACIONES_STATE.animacionConfetiId = requestAnimationFrame(animar);
}

function formatearFechaLargaFeliz(fechaString) {
    if (!fechaString) return 'Fecha conmemorativa';
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const [anio, mes, dia] = fechaString.split('-').map(Number);
    return `${dia} de ${nombresMeses[mes - 1]} de ${anio}`;
}
