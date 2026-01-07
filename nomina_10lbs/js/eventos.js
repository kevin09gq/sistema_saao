// ========================================
// MOSTRAR EVENTOS ESPECIALES
// ========================================

// Función auxiliar para obtener nombre del día
function obtenerNombreDiaEvento(fecha) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const [dia, mes, anio] = fecha.split('/');
    const fechaObj = new Date(anio, mes - 1, dia);
    return dias[fechaObj.getDay()];
}

// Función para mostrar historial de retardos por día
function mostrarHistorialRetardos(empleado) {
    const $contenedor = $('#contenedor-historial-retardos');
    $contenedor.empty();

    if (!Array.isArray(empleado.historial_retardos) || empleado.historial_retardos.length === 0) {
        $contenedor.html('<p class="text-muted text-center"><i class="bi bi-info-circle"></i> No hay retardos registrados en el historial</p>');
        return;
    }

    let html = '';
    empleado.historial_retardos.forEach((retardo, index) => {
        html += `
            <div class="row mb-2 historial-retardo-item" data-index="${index}">
                <div class="col-md-2">
                    <label class="form-label fw-normal small">Día</label>
                    <input type="text" class="form-control form-control-sm historial-dia" value="${retardo.dia}" readonly>
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-normal small">Fecha</label>
                    <input type="text" class="form-control form-control-sm historial-fecha" value="${retardo.fecha}" readonly>
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-normal small">Minutos</label>
                    <input type="number" step="1" class="form-control form-control-sm historial-minutos" value="${retardo.minutos_retardo}" data-field="minutos_retardo">
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-normal small">Tolerancia</label>
                    <input type="number" step="1" class="form-control form-control-sm historial-tolerancia" value="${retardo.tolerancia}" data-field="tolerancia">
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-normal small">$/Min</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-descuento-min" value="${retardo.descuento_por_minuto}" data-field="descuento_por_minuto">
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-normal small">Descontado</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-total bg-light" value="${retardo.total_descontado.toFixed(2)}" readonly>
                </div>
            </div>
        `;
    });

    $contenedor.html(html);

    // Agregar eventos para actualizar totales cuando cambien los valores
    $contenedor.on('input', '.historial-minutos, .historial-tolerancia, .historial-descuento-min', function() {
        const $item = $(this).closest('.historial-retardo-item');
        const index = parseInt($item.data('index'));
        const minutos = parseFloat($item.find('.historial-minutos').val()) || 0;
        const tolerancia = parseFloat($item.find('.historial-tolerancia').val()) || 0;
        const descuentoMin = parseFloat($item.find('.historial-descuento-min').val()) || 0;
        
        const minutosAjustados = Math.max(0, minutos - tolerancia);
        const totalDescontado = (minutosAjustados * descuentoMin).toFixed(2);
        
        $item.find('.historial-total').val(totalDescontado);
        
        // Actualizar el objeto en el array
        if (empleado.historial_retardos[index]) {
            empleado.historial_retardos[index].minutos_retardo = minutos;
            empleado.historial_retardos[index].tolerancia = tolerancia;
            empleado.historial_retardos[index].descuento_por_minuto = descuentoMin;
            empleado.historial_retardos[index].total_descontado = parseFloat(totalDescontado);
        }
        
        // Recalcular total general de retardos
        recalcularTotalRetardos(empleado);
    });
}

// Función para recalcular el total de retardos basado en el historial
function recalcularTotalRetardos(empleado) {
    if (!Array.isArray(empleado.historial_retardos)) return;
    
    let totalDescontado = 0;
    empleado.historial_retardos.forEach(retardo => {
        totalDescontado += parseFloat(retardo.total_descontado) || 0;
    });
    
    $('#mod-retardos').val(totalDescontado.toFixed(2));
    empleado.retardos = totalDescontado;
}

// Función para mostrar olvidos de checador
function mostrarOlvidosChecador(empleado) {
    const $card = $('#olvidos-checador-card');
    const $content = $('#olvidos-checador-content');
    
    if (!$card.length || !$content.length) return;
    
    $content.empty();
    $card.removeClass('olvido-checador').addClass('olvido-checador');

    if (!Array.isArray(empleado.registros) || empleado.registros.length === 0) {
        $content.html('<p class="sin-eventos">No hay olvidos registrados</p>');
        $('#total-olvidos-checador').text('Total: 0 eventos');
        return;
    }

    let olvidos = [];
    empleado.registros.forEach(reg => {
        const tieneEntrada = reg.entrada && reg.entrada !== '' && reg.entrada !== '-';
        const tieneSalida = reg.salida && reg.salida !== '' && reg.salida !== '-';

        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            olvidos.push(reg.fecha);
        }
    });

    if (olvidos.length === 0) {
        $content.html('<p class="sin-eventos">No hay olvidos registrados</p>');
        $('#total-olvidos-checador').text('Total: 0 eventos');
    } else {
        let html = olvidos.map(fecha => {
            const nombreDia = obtenerNombreDiaEvento(fecha);
            return `<div class="evento-item"><span class="evento-dia">📅 ${nombreDia} ${fecha}</span></div>`;
        }).join('');
        $content.html(html);
        $('#total-olvidos-checador').html(`Total: ${olvidos.length} eventos`);
    }
}

// Función para mostrar retardos
function mostrarRetardos(empleado) {
    const $card = $('#retardos-card');
    const $content = $('#retardos-content');
    
    if (!$card.length || !$content.length) return;
    
    $content.empty();
    $card.removeClass('retardo').addClass('retardo');

    if (!Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) {
        $content.html('<p class="sin-eventos">No hay retardos registrados</p>');
        $('#total-retardos').text('Total: 0 eventos');
        return;
    }

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    let retardosEncontrados = [];

    // Agrupar por fecha
    const regPorFecha = {};
    empleado.registros.forEach(reg => {
        if (reg.fecha && reg.entrada) {
            if (!regPorFecha[reg.fecha]) regPorFecha[reg.fecha] = [];
            regPorFecha[reg.fecha].push(reg);
        }
    });

    Object.keys(regPorFecha).forEach(fecha => {
        const registros = regPorFecha[fecha];
        const primeraEntrada = registros.reduce((a, b) => {
            const [h1, m1] = a.entrada.split(':');
            const [h2, m2] = b.entrada.split(':');
            return (parseInt(h1) * 60 + parseInt(m1)) < (parseInt(h2) * 60 + parseInt(m2)) ? a : b;
        });

        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];
        const horarioOficial = empleado.horario_oficial.find(x => String(x.dia || '').toUpperCase().trim() === diaSemana);

        if (horarioOficial && horarioOficial.entrada) {
            const [hReal, mReal] = primeraEntrada.entrada.split(':');
            const [hOficial, mOficial] = horarioOficial.entrada.split(':');
            const minutosReal = parseInt(hReal) * 60 + parseInt(mReal);
            const minutosOficial = parseInt(hOficial) * 60 + parseInt(mOficial);
            const diferencia = minutosReal - minutosOficial;

            if (diferencia > 0) {
                retardosEncontrados.push({ fecha, minutos: diferencia });
            }
        }
    });

    if (retardosEncontrados.length === 0) {
        $content.html('<p class="sin-eventos">No hay retardos registrados</p>');
        $('#total-retardos').text('Total: 0 eventos');
    } else {
        let html = retardosEncontrados.map(r => {
            const nombreDia = obtenerNombreDiaEvento(r.fecha);
            return `<div class="evento-item"><span class="evento-dia">📅 ${nombreDia} ${r.fecha}</span><span class="evento-tiempo">${r.minutos} min</span></div>`;
        }).join('');
        $content.html(html);
        $('#total-retardos').html(`Total: ${retardosEncontrados.length} días`);
    }
}

// Función para mostrar inasistencias
function mostrarInasistencias(empleado) {
    const $card = $('#faltas-card');
    const $content = $('#faltas-content');
    
    if (!$card.length || !$content.length) return;
    
    $content.empty();
    $card.removeClass('falta').addClass('falta');

    if (!Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) {
        $content.html('<p class="sin-eventos">No hay inasistencias registradas</p>');
        $('#total-faltas').text('Total: 0 días');
        return;
    }

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    let inasistenciasEncontradas = [];

    // Crear conjunto de fechas con registros
    const fechasConRegistros = new Set();
    empleado.registros.forEach(reg => {
        if (reg.fecha && ((reg.entrada && reg.entrada !== '') || (reg.salida && reg.salida !== ''))) {
            fechasConRegistros.add(reg.fecha);
        }
    });

    // Verificar cada día del horario oficial
    empleado.horario_oficial.forEach(horario => {
        const diaSemana = String(horario.dia || '').toUpperCase().trim();
        if (!horario.entrada || horario.entrada === '') return;

        let tieneRegistro = false;
        empleado.registros.forEach(reg => {
            if (!reg.fecha) return;
            const [dia, mes, anio] = reg.fecha.split('/');
            const diaRegistro = dias[new Date(anio, mes - 1, dia).getDay()];
            if (diaRegistro === diaSemana && ((reg.entrada && reg.entrada !== '') || (reg.salida && reg.salida !== ''))) {
                tieneRegistro = true;
            }
        });

        if (!tieneRegistro) {
            inasistenciasEncontradas.push(diaSemana);
        }
    });

    if (inasistenciasEncontradas.length === 0) {
        $content.html('<p class="sin-eventos">No hay inasistencias registradas</p>');
        $('#total-faltas').text('Total: 0 días');
    } else {
        let html = inasistenciasEncontradas.map(dia => `<div class="evento-item"><span class="evento-dia">${dia}</span><span class="evento-tiempo">Falta</span></div>`).join('');
        $content.html(html);
        $('#total-faltas').html(`Total: ${inasistenciasEncontradas.length} días`);
    }
}