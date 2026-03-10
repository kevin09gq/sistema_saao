// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Convierte "HH:MM" a minutos totales
function aMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

// Convierte minutos a texto legible (ej: 1h 30m, 45m)
function aTextoTiempo(minutos) {
    if (minutos < 60) return `${minutos}m`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Obtiene el nombre del día a partir de una fecha "DD/MM/YYYY"
function nombreDia(fecha) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const [d, m, a] = fecha.split('/');
    return dias[new Date(a, m - 1, d).getDay()];
}

// Normaliza string removiendo acentos
function normalizarDia(dia) {
    return dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

// ========================================
// FUNCIÓN GENÉRICA DE EVENTOS
// ========================================
function mostrarEventosPorCampo(empleado, selectorContent, selectorTotal, filtro, textoVacio, tipo = 'entrada') {
    const $content = $(selectorContent);
    $content.empty();

    if (!Array.isArray(empleado.registros) || !Array.isArray(jsonNomina40lbs.horarios_semanales)) {
        $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
        $(selectorTotal).text('0');
        return;
    }

    // Crear mapa de horarios por día (normalizado) para fácil acceso
    const horariosPorDia = {};
    jsonNomina40lbs.horarios_semanales.forEach(horario => {
        horariosPorDia[normalizarDia(horario.dia)] = horario;
    });

    const esEntrada = tipo === 'entrada';
    const campo = esEntrada ? 'entrada' : 'salida';
    // Primera entrada del día o última salida del día
    const comparador = esEntrada
        ? (a, b) => aMinutos(a) < aMinutos(b)
        : (a, b) => aMinutos(a) > aMinutos(b);

    // Agrupar por fecha: primera entrada o última salida
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
        const dia = normalizarDia(nombreDia(fecha));
        const horario = horariosPorDia[dia];
        if (!horario || !horario[campo]) return;

        const diff = aMinutos(valor) - aMinutos(horario[campo]);
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
            <span>${nombreDia(r.fecha)} · ${aTextoTiempo(r.minutos)}</span>
        </div>
    `).join(''));
    $(selectorTotal).text(aTextoTiempo(totalMin));
}

// ========================================
// FUNCIONES ESPECÍFICAS
// ========================================
function mostrarEntradasTempranas(empleado) {
    mostrarEventosPorCampo(empleado, '#entradas-tempranas-40lbs', '#total-entradas-tempranas-40lbs',
        (diff) => diff < -50 ? Math.abs(diff) : null,
        'Sin entradas tempranas'
    );
}

function mostrarSalidasTardias(empleado) {
    mostrarEventosPorCampo(empleado, '#salidas-tardias-40lbs', '#total-salidas-tardias-40lbs',
        (diff) => diff > 50 ? diff : null,
        'Sin salidas tardías',
        'salida'
    );
}

function mostrarSalidasTempranas(empleado) {
    mostrarEventosPorCampo(empleado, '#salidas-tempranas-40lbs', '#total-salidas-tempranas-40lbs',
        (diff) => diff < -5 ? Math.abs(diff) : null,
        'Sin salidas tempranas',
        'salida'
    );
}

function mostrarRetardos(empleado) {
    mostrarEventosPorCampo(empleado, '#retardos-40lbs', '#total-retardos-40lbs',
        (diff) => diff > 0 ? diff : null,
        'Sin retardos'
    );
}

function mostrarInasistencias(empleado) {
    const $content = $('#inasistencias-content-40lbs');
    const $total = $('#total-inasistencias-40lbs');
    $content.empty();

    if (!Array.isArray(empleado.registros) || !Array.isArray(jsonNomina40lbs.horarios_semanales) || empleado.registros.length === 0) {
        $content.html('<p class="sin-eventos">Sin inasistencias</p>');
        $total.text('0');
        return;
    }

    const [d1, m1, a1] = empleado.registros[0].fecha.split('/').map(Number);
    const [d2, m2, a2] = empleado.registros[empleado.registros.length - 1].fecha.split('/').map(Number);
    const inicio = new Date(a1, m1 - 1, d1);
    const fin = new Date(a2, m2 - 1, d2);

    // Crear mapa de horarios normalizados
    const horariosPorDia = {};
    jsonNomina40lbs.horarios_semanales.forEach(h => {
        horariosPorDia[normalizarDia(h.dia)] = h;
    });

    const inasistencias = [];
    const fecha = new Date(inicio);

    while (fecha <= fin) {
        const d = fecha.getDate().toString().padStart(2, '0');
        const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const y = fecha.getFullYear();
        const fechaStr = `${d}/${m}/${y}`;
        
        const diaNormalizado = normalizarDia(nombreDia(fechaStr));
        const horario = horariosPorDia[diaNormalizado];
        
        if (horario?.entrada) {
            const tieneRegistro = empleado.registros.some(r => 
                r.fecha === fechaStr && ((r.entrada && r.entrada.trim()) || (r.salida && r.salida.trim()))
            );
            
            if (!tieneRegistro) {
                inasistencias.push({fecha: fechaStr});
            }
        }
        
        fecha.setDate(fecha.getDate() + 1);
    }

    if (inasistencias.length === 0) {
        $content.html('<p class="sin-eventos">Sin inasistencias</p>');
        $total.text('0');
    } else {
        $content.html(inasistencias.map(i => `<div class="evento-item"><span>${nombreDia(i.fecha)} ${i.fecha}</span></div>`).join(''));
        $total.text(inasistencias.length);
    }
}

function mostrarOlvidosChecador(empleado) {}