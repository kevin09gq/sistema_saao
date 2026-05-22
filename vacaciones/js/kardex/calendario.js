//==================================================================================================
// CONTROLADOR DE CALENDARIO DE DISPONIBILIDAD DE VACACIONES (ESTILO WINDOWS)
//==================================================================================================

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let vistaActual = 'dias'; // 'dias', 'meses', 'anios'
let festivosCalendario = [];

$(document).ready(function () {
    inicializarCalendario();
});

//==============================
// INICIALIZACIÓN DE EVENTOS DEL CALENDARIO
//==============================
function inicializarCalendario() {
    // Cargar festividades desde la base de datos
    $.post('../php/vacaciones_lft.php', {
        action: 'obtenerFestividades'
    }, function (fechas) {
        if (Array.isArray(fechas)) {
            festivosCalendario = fechas;
            renderizarCalendario();
        }
    }, 'json');

    // Botones para navegar (anterior / siguiente)
    $('#btnMesAnterior').on('click', function () {
        if (vistaActual === 'dias') {
            mesActual--;
            if (mesActual < 0) {
                mesActual = 11;
                anioActual--;
            }
        } else if (vistaActual === 'meses') {
            anioActual--;
        } else if (vistaActual === 'anios') {
            anioActual -= 12; // Moverse a la década anterior
        }
        renderizarCalendario();
    });

    $('#btnMesSiguiente').on('click', function () {
        if (vistaActual === 'dias') {
            mesActual++;
            if (mesActual > 11) {
                mesActual = 0;
                anioActual++;
            }
        } else if (vistaActual === 'meses') {
            anioActual++;
        } else if (vistaActual === 'anios') {
            anioActual += 12; // Moverse a la década siguiente
        }
        renderizarCalendario();
    });

    // Clic en la cabecera (cambiar tipo de vista estilo Windows)
    $('#calendarioMes').on('click', function () {
        if (vistaActual === 'dias') {
            vistaActual = 'meses';
        } else if (vistaActual === 'meses') {
            vistaActual = 'anios';
        }
        renderizarCalendario();
    });
}

//==============================
// HILO DE ACTUALIZACIÓN CON DATOS DEL EMPLEADO
//==============================
function actualizarCalendarioConDatos() {
    renderizarCalendario();
}

//==============================
// RENDERIZACIÓN DEL CALENDARIO MULTIVISTA
//==============================
function renderizarCalendario() {
    if (!empleadoActual) return;

    const $grid = $('#calendarioGrid');
    
    // Destruir tooltips existentes para evitar fugas de memoria
    if ($.fn.tooltip) {
        $grid.find('[title]').tooltip('dispose');
    }

    $grid.empty(); // Limpiar todo el contenido del grid

    if (vistaActual === 'dias') {
        renderizarVistaDias($grid);
    } else if (vistaActual === 'meses') {
        renderizarVistaMeses($grid);
    } else if (vistaActual === 'anios') {
        renderizarVistaAnios($grid);
    }
}

//==============================
// 1. RENDERIZAR VISTA DE DÍAS (VISTA PRINCIPAL)
//==============================
function renderizarVistaDias($grid) {
    const mesesNombres = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Cabecera: Mes y Año
    $('#calendarioMes').text(`${mesesNombres[mesActual]} ${anioActual}`);

    // Asegurar estructura de columnas de 7 columnas
    $grid.css('grid-template-columns', 'repeat(7, 1fr)');

    // Agregar nombres de los días de la semana
    const diasSemana = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
    $.each(diasSemana, function (i, d) {
        $grid.append(`<div class="calendar-day-name">${d}</div>`);
    });

    // Calcular días
    let primerDiaFecha = new Date(anioActual, mesActual, 1);
    let primerDiaSemana = primerDiaFecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    let diasFaltantes = (primerDiaSemana === 0) ? 6 : primerDiaSemana - 1;
    let totalDiasMes = new Date(anioActual, mesActual + 1, 0).getDate();

    // Relleno inicial
    for (let i = 0; i < diasFaltantes; i++) {
        $grid.append('<div class="calendar-day empty"></div>');
    }

    // Cargar rangos de vacaciones
    let rangosVacaciones = [];
    if (typeof listaMovimientosGlobal !== 'undefined') {
        $.each(listaMovimientosGlobal, function (i, m) {
            if (m.fecha_inicio && m.fecha_fin && m.dias_movimiento < 0) {
                rangosVacaciones.push({
                    inicio: new Date(m.fecha_inicio + 'T00:00:00'),
                    fin: new Date(m.fecha_fin + 'T00:00:00')
                });
            }
        });
    }

    // Datos aniversario
    let fechaIngreso = new Date(empleadoActual.fecha_ingreso_final + 'T00:00:00');
    let mesAniversario = fechaIngreso.getMonth();
    let diaAniversario = fechaIngreso.getDate();
    let anioIngreso = fechaIngreso.getFullYear();

    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        let fechaDia = new Date(anioActual, mesActual, dia);
        let y = fechaDia.getFullYear();
        let m = String(fechaDia.getMonth() + 1).padStart(2, '0');
        let d = String(fechaDia.getDate()).padStart(2, '0');
        let fechaStr = `${y}-${m}-${d}`;

        let clases = ['calendar-day'];
        let tooltips = [];

        let esDomingo = (fechaDia.getDay() === 0);

        if (fechaDia.getTime() === hoy.getTime()) {
            clases.push('today');
        }

        let esFestivo = festivosCalendario.includes(fechaStr);
        if (esFestivo && !esDomingo) {
            clases.push('festivo');
            tooltips.push('Día Festivo');
        }

        let esVacacion = false;
        if (!esDomingo && !esFestivo) {
            $.each(rangosVacaciones, function (i, rango) {
                if (fechaDia >= rango.inicio && fechaDia <= rango.fin) {
                    esVacacion = true;
                    return false;
                }
            });
        }
        if (esVacacion) {
            clases.push('vacaciones');
            tooltips.push('Vacaciones Tomadas');
        }

        if (mesActual === mesAniversario && dia === diaAniversario) {
            let aniosCumplidos = anioActual - anioIngreso;
            if (aniosCumplidos > 0) {
                if (fechaDia <= hoy) {
                    clases.push('aniversario');
                    tooltips.push(`Aniversario #${aniosCumplidos} (${aniosCumplidos} año${aniosCumplidos > 1 ? 's' : ''} cumplido${aniosCumplidos > 1 ? 's' : ''})`);
                } else {
                    clases.push('aniversario-proximo');
                    tooltips.push(`Próximo Aniversario #${aniosCumplidos} (Futuro)`);
                }
            }
        }

        let tooltipAttr = tooltips.length > 0 ? `title="${tooltips.join(' / ')}"` : '';
        let diaHtml = `<div class="${clases.join(' ')}" ${tooltipAttr}>${dia}</div>`;
        $grid.append(diaHtml);
    }

    if ($.fn.tooltip) {
        $grid.find('.calendar-day[title]').tooltip({
            trigger: 'hover',
            placement: 'top'
        });
    }
}

//==============================
// 2. RENDERIZAR VISTA DE MESES
//==============================
function renderizarVistaMeses($grid) {
    // Cabecera: Solo Año
    $('#calendarioMes').text(anioActual);

    // Ajustar columnas a 4 para meses
    $grid.css('grid-template-columns', 'repeat(4, 1fr)');

    const mesesNombresCortos = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    let fechaIngreso = new Date(empleadoActual.fecha_ingreso_final + 'T00:00:00');
    let mesAniversario = fechaIngreso.getMonth();
    let hoy = new Date();

    $.each(mesesNombresCortos, function (idx, nombre) {
        let clases = ['calendar-item-selector'];
        
        // Si el mes coincide con el mes actual en el que estamos parados
        if (idx === mesActual && anioActual === hoy.getFullYear()) {
            clases.push('active');
        }

        // Resaltar mes de aniversario
        let tooltipAttr = '';
        if (idx === mesAniversario) {
            clases.push('border-primary');
            // Usamos un estilo de borde para marcarlo
            tooltipAttr = `style="border: 2px dashed #8b5cf6;" title="Mes de Aniversario Laboral"`;
        }

        let mesHtml = $(`<div class="${clases.join(' ')}" ${tooltipAttr}>${nombre}</div>`);
        
        mesHtml.on('click', function () {
            mesActual = idx;
            vistaActual = 'dias';
            renderizarCalendario();
        });

        $grid.append(mesHtml);
    });

    if ($.fn.tooltip) {
        $grid.find('.calendar-item-selector[title]').tooltip({
            trigger: 'hover',
            placement: 'top'
        });
    }
}

//==============================
// 3. RENDERIZAR VISTA DE AÑOS
//==============================
function renderizarVistaAnios($grid) {
    // Determinar la década a mostrar (bloques de 12 años para rellenar 4x3)
    let anioBaseDecada = Math.floor(anioActual / 12) * 12;
    let anioFinDecada = anioBaseDecada + 11;

    // Cabecera: Rango de años
    $('#calendarioMes').text(`${anioBaseDecada} - ${anioFinDecada}`);

    // Ajustar columnas a 4 para los años
    $grid.css('grid-template-columns', 'repeat(4, 1fr)');

    let fechaIngreso = new Date(empleadoActual.fecha_ingreso_final + 'T00:00:00');
    let anioIngreso = fechaIngreso.getFullYear();
    let hoy = new Date();

    for (let a = anioBaseDecada; a <= anioFinDecada; a++) {
        let clases = ['calendar-item-selector'];
        
        if (a === anioActual) {
            clases.push('active');
        }

        let tooltipAttr = '';
        if (a === anioIngreso) {
            tooltipAttr = `style="border: 2px dashed #8b5cf6;" title="Año de Ingreso del Empleado"`;
        }

        let anioHtml = $(`<div class="${clases.join(' ')}" ${tooltipAttr}>${a}</div>`);

        anioHtml.on('click', function () {
            anioActual = a;
            vistaActual = 'meses';
            renderizarCalendario();
        });

        $grid.append(anioHtml);
    }

    if ($.fn.tooltip) {
        $grid.find('.calendar-item-selector[title]').tooltip({
            trigger: 'hover',
            placement: 'top'
        });
    }
}
