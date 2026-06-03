//==================================================================================================
// CALENDARIO GENERAL DE ANIVERSARIOS — Estilo Windows (días → meses → años)
// (vacaciones.php → #modalCalendario)
//
// Depende de:
//   - todosLosEmpleados : variable global cargada por index.js
//   - Bootstrap 5 Tooltips
//   - vacaciones_lft.php → action: 'obtenerFestividades'
//==================================================================================================

let mesActualGeneral  = new Date().getMonth();
let anioActualGeneral = new Date().getFullYear();
let festivosGeneral   = [];
let generalInicializado = false;
let vistaActualGeneral  = 'dias'; // 'dias' | 'meses' | 'anios'

$(document).ready(function () {

    //==============================
    // ABRIR MODAL — cargar festivos la primera vez
    //==============================
    $('#modalCalendario').on('show.bs.modal', function () {
        if (!generalInicializado) {
            $.post('../php/vacaciones_lft.php', { action: 'obtenerFestividades' }, function (fechas) {
                if (Array.isArray(fechas)) festivosGeneral = fechas;
                generalInicializado = true;
                renderizarCalendarioGeneral();
            }, 'json').fail(function () {
                generalInicializado = true;
                renderizarCalendarioGeneral();
            });
        } else {
            renderizarCalendarioGeneral();
        }
    });

    //==============================
    // CLIC EN EL ENCABEZADO DEL MES — cicla entre vistas
    //==============================
    $('#calendarMonthGeneral').addClass('calendar-month-clickable').on('click', function () {
        if (vistaActualGeneral === 'dias') {
            vistaActualGeneral = 'meses';
        } else if (vistaActualGeneral === 'meses') {
            vistaActualGeneral = 'anios';
        }
        // En 'anios' no se sube más
        renderizarCalendarioGeneral();
    });

    //==============================
    // BOTONES ANTERIOR / SIGUIENTE — comportamiento según vista
    //==============================
    $('#btnMesAnteriorGeneral').on('click', function () {
        if (vistaActualGeneral === 'dias') {
            mesActualGeneral--;
            if (mesActualGeneral < 0) { mesActualGeneral = 11; anioActualGeneral--; }
        } else if (vistaActualGeneral === 'meses') {
            anioActualGeneral--;
        } else if (vistaActualGeneral === 'anios') {
            anioActualGeneral -= 12;
        }
        renderizarCalendarioGeneral();
    });

    $('#btnMesSiguienteGeneral').on('click', function () {
        if (vistaActualGeneral === 'dias') {
            mesActualGeneral++;
            if (mesActualGeneral > 11) { mesActualGeneral = 0; anioActualGeneral++; }
        } else if (vistaActualGeneral === 'meses') {
            anioActualGeneral++;
        } else if (vistaActualGeneral === 'anios') {
            anioActualGeneral += 12;
        }
        renderizarCalendarioGeneral();
    });
});

//==============================
// DISPATCHER — elige la vista correcta
//==============================
function renderizarCalendarioGeneral() {
    const $grid = $('#calendarGridGeneral');

    // Destruir tooltips previos
    if ($.fn.tooltip) {
        $grid.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
    }
    $grid.empty();

    if (vistaActualGeneral === 'dias') {
        renderizarVistaDiasGeneral($grid);
    } else if (vistaActualGeneral === 'meses') {
        renderizarVistaMesesGeneral($grid);
    } else if (vistaActualGeneral === 'anios') {
        renderizarVistaAniosGeneral($grid);
    }
}

//==============================
// VISTA 1 — DÍAS (principal)
//==============================
function renderizarVistaDiasGeneral($grid) {
    const mesesNombres = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    $('#calendarMonthGeneral').text(`${mesesNombres[mesActualGeneral]} ${anioActualGeneral}`);
    $grid.css('grid-template-columns', 'repeat(7, 1fr)');

    // Cabeceras de días
    $.each(["LU","MA","MI","JU","VI","SA","DO"], function (i, d) {
        $grid.append(`<div class="calendar-day-name">${d}</div>`);
    });

    // Relleno inicial (lunes = primera columna)
    let primerDia  = new Date(anioActualGeneral, mesActualGeneral, 1).getDay();
    let diasFalt   = (primerDia === 0) ? 6 : primerDia - 1;
    let totalDias  = new Date(anioActualGeneral, mesActualGeneral + 1, 0).getDate();
    for (let i = 0; i < diasFalt; i++) $grid.append('<div class="calendar-day empty"></div>');

    let hoy = new Date(); hoy.setHours(0,0,0,0);

    // Mapas de aniversarios: clave = número de día del mes
    let mapAniv  = {};   // cumplidos o de hoy
    let mapProx  = {};   // futuros

    if (typeof todosLosEmpleados !== 'undefined') {
        $.each(todosLosEmpleados, function (i, emp) {
            if (emp.id_status != 1 || !emp.fecha_ingreso_final) return;
            let fi = new Date(emp.fecha_ingreso_final + 'T00:00:00');
            if (fi.getMonth() !== mesActualGeneral) return;

            let numAniv = anioActualGeneral - fi.getFullYear();
            if (numAniv <= 0) return;

            let nombre = `${emp.nombre} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
            let etiqueta = `${nombre} (Aniversario #${numAniv})`;
            let diaKey   = fi.getDate();
            let fAniv    = new Date(anioActualGeneral, mesActualGeneral, diaKey);
            fAniv.setHours(0,0,0,0);

            if (fAniv <= hoy) {
                if (!mapAniv[diaKey]) mapAniv[diaKey] = [];
                mapAniv[diaKey].push(etiqueta);
            } else {
                if (!mapProx[diaKey]) mapProx[diaKey] = [];
                mapProx[diaKey].push(etiqueta);
            }
        });
    }

    // Renderizar días
    for (let dia = 1; dia <= totalDias; dia++) {
        let fDia = new Date(anioActualGeneral, mesActualGeneral, dia);
        let fechaStr = `${fDia.getFullYear()}-${String(fDia.getMonth()+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        let esDom = (fDia.getDay() === 0);

        let clases = ['calendar-day'];
        let tips   = [];

        if (fDia.getTime() === hoy.getTime()) clases.push('today');

        let esFestivo = festivosGeneral.includes(fechaStr);
        if (esFestivo && !esDom) {
            clases.push('festivo');
            tips.push('Dia Festivo');
        }

        if (mapAniv[dia] && mapAniv[dia].length > 0) {
            clases.push('aniversario');
            $.each(mapAniv[dia], function (i, e) { tips.push(e); });
        } else if (mapProx[dia] && mapProx[dia].length > 0) {
            clases.push('aniversario-proximo');
            $.each(mapProx[dia], function (i, e) { tips.push(e); });
        }

        let tipAttr = '';
        if (tips.length > 0) {
            let titleText = tips.join(' | ').replace(/"/g, '&quot;');
            tipAttr = `data-bs-toggle="tooltip" data-bs-placement="top" title="${titleText}"`;
        }

        $grid.append(`<div class="${clases.join(' ')}" ${tipAttr}>${dia}</div>`);
    }

    // Activar tooltips
    if ($.fn.tooltip) {
        $grid.find('[data-bs-toggle="tooltip"]').tooltip({ trigger: 'hover', container: 'body' });
    }
}

//==============================
// VISTA 2 — MESES (selector de mes)
//==============================
function renderizarVistaMesesGeneral($grid) {
    $('#calendarMonthGeneral').text(anioActualGeneral);
    $grid.css('grid-template-columns', 'repeat(4, 1fr)');

    const mesesCortos = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    let hoy = new Date();

    $.each(mesesCortos, function (idx, nombre) {
        let clases = ['calendar-item-selector'];

        // Resaltar mes actual si el año coincide
        if (idx === hoy.getMonth() && anioActualGeneral === hoy.getFullYear()) {
            clases.push('active');
        }

        let $item = $(`<div class="${clases.join(' ')}">${nombre}</div>`);
        $item.on('click', function () {
            mesActualGeneral   = idx;
            vistaActualGeneral = 'dias';
            renderizarCalendarioGeneral();
        });

        $grid.append($item);
    });
}

//==============================
// VISTA 3 — AÑOS (selector de año, bloques de 12)
//==============================
function renderizarVistaAniosGeneral($grid) {
    let anioBase = Math.floor(anioActualGeneral / 12) * 12;
    let anioFin  = anioBase + 11;

    $('#calendarMonthGeneral').text(`${anioBase} - ${anioFin}`);
    $grid.css('grid-template-columns', 'repeat(4, 1fr)');

    let hoy = new Date();

    for (let a = anioBase; a <= anioFin; a++) {
        let clases = ['calendar-item-selector'];
        if (a === hoy.getFullYear()) clases.push('active');

        let $item = $(`<div class="${clases.join(' ')}">${a}</div>`);
        $item.on('click', function () {
            anioActualGeneral  = a;
            vistaActualGeneral = 'meses';
            renderizarCalendarioGeneral();
        });

        $grid.append($item);
    }
}
