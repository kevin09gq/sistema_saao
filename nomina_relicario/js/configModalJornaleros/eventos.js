// ========================================
// VARIABLES GLOBALES
// ========================================

// Días de la semana SIN acentos (para comparar con horarioRancho)
const diasSemanaRancho = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
// Días con formato de visualización
const diasNombresJornalero = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Convierte "HH:MM" a minutos totales
function aMinutosJornalero(hora) {
    const [h, m] = hora.split(':');
    return parseInt(h) * 60 + parseInt(m);
}

// Convierte minutos a formato texto (45m ó 1h 30m)
function aTextoTiempoJornalero(minutos) {
    if (minutos < 60) return `${minutos}m`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Obtiene el nombre del día a partir de una fecha "DD/MM/YYYY"
function nombreDiaJornalero(fecha) {
    const [d, m, a] = fecha.split('/');
    return diasNombresJornalero[new Date(a, m - 1, d).getDay()];
}

// Obtiene el nombre del día SIN acento (para buscar en horarioRancho)
function diaSemanaRancho(fecha) {
    const [d, m, a] = fecha.split('/');
    return diasSemanaRancho[new Date(a, m - 1, d).getDay()];
}

// ========================================
// FUNCIÓN GENÉRICA PARA MOSTRAR EVENTOS
// ========================================

function mostrarEventosPorEntradaJornalero(empleado, selectorContent, selectorTotal, filtro, textoVacio, tipo = 'entrada') {
    const $content = $(selectorContent);
    $content.empty();

    const horarioRancho = jsonNominaRelicario?.horarioRancho;

    if (!Array.isArray(empleado.registros) || !Array.isArray(horarioRancho)) {
        $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
        $(selectorTotal).text('0');
        return;
    }

    // === CASO ESPECIAL: INASISTENCIAS ===
    if (tipo === 'inasistencia') {
        const inasistencias = empleado.registros.filter(r => {
            if (!r.fecha) return false;

            const nombreDiaSemana = diaSemanaRancho(r.fecha);
            const horarioDia = horarioRancho.find(h => h.dia?.toUpperCase().trim() === nombreDiaSemana);

            // Sin registro de entrada ni salida
            const sinRegistro = (!r.entrada || r.entrada.trim() === '') &&
                                 (!r.salida  || r.salida.trim()  === '');

            // Solo es inasistencia si: el día tiene horario Y no hay ningún marcaje
            return horarioDia?.entrada && horarioDia.entrada.trim() !== '' && sinRegistro;
        });

        if (inasistencias.length === 0) {
            $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
            $(selectorTotal).text('0');
            return;
        }

        $content.html(inasistencias.map(r => `
            <div class="evento-item">
                <span>${nombreDiaJornalero(r.fecha)} ${r.fecha}</span>
            </div>
        `).join(''));
        $(selectorTotal).text(inasistencias.length);
        return;
    }

    // === ENTRADAS / SALIDAS ===
    const esEntrada = tipo === 'entrada';
    const campo = esEntrada ? 'entrada' : 'salida';
    // Para entrada: quedarse con la primera (menor hora)
    // Para salida: quedarse con la última (mayor hora)
    const comparador = esEntrada
        ? (a, b) => aMinutosJornalero(a) < aMinutosJornalero(b)
        : (a, b) => aMinutosJornalero(a) > aMinutosJornalero(b);

    // Agrupar por fecha, guardando la primera entrada o la última salida del día
    const porFecha = {};
    empleado.registros.forEach(reg => {
        if (reg.fecha && reg[campo] && reg[campo].trim() !== '') {
            if (!porFecha[reg.fecha] || comparador(reg[campo], porFecha[reg.fecha])) {
                porFecha[reg.fecha] = reg[campo];
            }
        }
    });

    // Detectar eventos según el filtro
    const eventos = [];
    Object.entries(porFecha).forEach(([fecha, valor]) => {
        const nombreDiaSemana = diaSemanaRancho(fecha);
        const horarioDia = horarioRancho.find(h => h.dia?.toUpperCase().trim() === nombreDiaSemana);

        if (!horarioDia?.[campo] || horarioDia[campo].trim() === '') return;

        const diff = aMinutosJornalero(valor) - aMinutosJornalero(horarioDia[campo]);
        const resultado = filtro(diff);
        if (resultado) eventos.push({ fecha, minutos: resultado });
    });

    // Renderizar resultados
    if (eventos.length === 0) {
        $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
        $(selectorTotal).text('0');
        return;
    }

    const totalMin = eventos.reduce((acc, r) => acc + r.minutos, 0);
    $content.html(eventos.map(r => `
        <div class="evento-item">
            <span>${nombreDiaJornalero(r.fecha)} · ${aTextoTiempoJornalero(r.minutos)}</span>
        </div>
    `).join(''));
    $(selectorTotal).text(aTextoTiempoJornalero(totalMin));
}

// ========================================
// FUNCIONES PÚBLICAS DE EVENTOS
// ========================================


function mostrarEntradasTempranasJornalero(empleado) {
    mostrarEventosPorEntradaJornalero(
        empleado,
        '#entradas-tempranas-jornaleros',
        '#total-entradas-tempranas-jornaleros',
        (diff) => diff < -45 ? Math.abs(diff) : null,
        'Sin entradas tempranas'
    );
}

function mostrarSalidasTardiasJornalero(empleado) {
    mostrarEventosPorEntradaJornalero(
        empleado,
        '#salidas-tardias-jornaleros',
        '#total-salidas-tardias-jornaleros',
        (diff) => diff > 45 ? diff : null,
        'Sin salidas tardías',
        'salida'
    );
}

function mostrarSalidasTempranasJornalero(empleado) {
    mostrarEventosPorEntradaJornalero(
        empleado,
        '#salidas-tempranas-jornaleros',
        '#total-salidas-tempranas-jornaleros',
        (diff) => diff < 0 ? Math.abs(diff) : null,
        'Sin salidas tempranas',
        'salida'
    );
}

function mostrarRetardosJornalero(empleado) {
    mostrarEventosPorEntradaJornalero(
        empleado,
        '#retardos-jornaleros',
        '#total-retardos-jornaleros',
        (diff) => diff > 0 ? diff : null,
        'Sin retardos'
    );
}

function mostrarInasistenciasJornalero(empleado) {
    mostrarEventosPorEntradaJornalero(
        empleado,
        '#inasistencias-content-jornaleros',
        '#total-inasistencias-jornaleros',
        null,
        'Sin inasistencias',
        'inasistencia'
    );
}

function mostrarOlvidosChecadorJornalero(empleado) {
    const $content = $('#olvidos-checador-jornaleros');
    $content.empty();

    const horarioRancho = jsonNominaRelicario?.horarioRancho;

    if (!Array.isArray(empleado.registros) || !Array.isArray(horarioRancho)) {
        $content.html('<p class="sin-eventos">Sin olvidos del checador</p>');
        $('#total-olvidos-checador-jornaleros').text('0');
        return;
    }

    // Descuento por olvido del checador (desde config o valor por defecto 20)
    const descuentoOlvido = parseFloat(jsonNominaRelicario?.descuento_checador) || 20;

    // Detectar olvidos: tiene entrada pero NO salida, o salida pero NO entrada
    // Solo en días que tengan horario asignado en el rancho
    const olvidos = [];

    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;

        const tieneEntrada = reg.entrada && reg.entrada.trim() !== '' && reg.entrada.trim() !== '-';
        const tieneSalida  = reg.salida  && reg.salida.trim()  !== '' && reg.salida.trim()  !== '-';

        // Olvido: tiene UNO pero NO el otro (registro incompleto)
        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            // Verificar que el día tenga horario asignado en el rancho
            const nombreDiaSemana = diaSemanaRancho(reg.fecha);
            const horarioDia = horarioRancho.find(h => h.dia?.toUpperCase().trim() === nombreDiaSemana);

            if (horarioDia?.entrada && horarioDia.entrada.trim() !== '') {
                olvidos.push({
                    dia: nombreDiaJornalero(reg.fecha),
                    fecha: reg.fecha,
                    descuento_olvido: descuentoOlvido
                });
            }
        }
    });

    if (olvidos.length === 0) {
        $content.html('<p class="sin-eventos">Sin olvidos del checador</p>');
        $('#total-olvidos-checador-jornaleros').text('0');
        return;
    }

    $content.html(olvidos.map(o => `
        <div class="evento-item">
            <span>${o.dia} ${o.fecha} · $${parseFloat(o.descuento_olvido).toFixed(2)}</span>
        </div>
    `).join(''));
    $('#total-olvidos-checador-jornaleros').text(olvidos.length);
}