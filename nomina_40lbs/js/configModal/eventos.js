// ========================================
// VARIABLES GLOBALES
// ========================================

let descuentoPorChecador = 20;

// ========================================
// CALCULAR EVENTOS AL ARRANQUE DEL SISTEMA
// ========================================


function calcularOlvidosTodosEmpleados(jsonNomina40lbs) {
    // Validar que exista la nómina y sus departamentos
    if (!jsonNomina40lbs || !Array.isArray(jsonNomina40lbs.departamentos)) {
        return;
    }

    // Solo incluir al departamento de 40 libras, 10 libras y sin seguro

    const departamentosFiltrados = jsonNomina40lbs.departamentos.filter(depto => {
        const nombreDepto = String(depto.nombre || '').toLowerCase();
        return nombreDepto.includes('produccion 40 libras') || nombreDepto.includes('produccion 10 libras') || nombreDepto.includes('sin seguro');
    });


    // Iterar sobre todos los departamentos
    departamentosFiltrados.forEach(departamento => {
        // Iterar sobre todos los empleados del departamento
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            

            // Calcular el historial de olvidos para este coordinador
            asignarHistorialOlvidos(empleado);

            // Calcular y asignar el total de olvidos a la propiedad
            asignarTotalOlvidos(empleado, true); // force=true para asegurar la asignación

            // Limpiar historial si está vacío
            if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) {
                delete empleado.historial_olvidos;
            }
        });
    });
}


// ========================================================
// ASIGNAR HISTORIAL DE OLVIDOS DEL CHECADOR, INASISTENCIAS
// ========================================================
function asignarHistorialOlvidos(empleado) {
    // Validaciones básicas
    if (!empleado || !Array.isArray(empleado.registros)) {
        return;
    }

    // Inicializar historial si no existe
    if (!Array.isArray(empleado.historial_olvidos)) {
        empleado.historial_olvidos = [];
    }

    // Preservar descuentos manuales previos (por fecha) para no perderlos al recalcular
    const descuentosPrevios = {};
    const editadosPrevios = {};
    empleado.historial_olvidos.forEach(olvido => {
        if (!olvido || !olvido.fecha) return;
        const fechaNormalizada = String(olvido.fecha).trim();

        if (olvido.descuento_olvido !== undefined && olvido.descuento_olvido !== null && olvido.descuento_olvido !== '') {
            descuentosPrevios[fechaNormalizada] = parseFloat(olvido.descuento_olvido);
        } else {
            descuentosPrevios[fechaNormalizada] = descuentoPorChecador;
        }

        editadosPrevios[fechaNormalizada] = olvido.editado === true;
    });

    const nuevoHistorial = [];

    // Revisar cada registro
    empleado.registros.forEach(reg => {
        if (!reg || !reg.fecha) return;

        const tieneEntrada = reg.entrada && String(reg.entrada).trim() !== '' && String(reg.entrada).trim() !== '-';
        const tieneSalida = reg.salida && String(reg.salida).trim() !== '' && String(reg.salida).trim() !== '-';

        // Olvido: tiene UNO pero NO el otro
        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            const fechaNormalizada = String(reg.fecha).trim();
            const descuentoPorOlvido = descuentosPrevios[fechaNormalizada] !== undefined
                ? descuentosPrevios[fechaNormalizada]
                : descuentoPorChecador;

            nuevoHistorial.push({
                dia: nombreDia(fechaNormalizada),
                fecha: fechaNormalizada,
                descuento_olvido: descuentoPorOlvido,
                editado: editadosPrevios[fechaNormalizada] === true
            });
        }
    });

    // Ordenar por fecha
    nuevoHistorial.sort((a, b) => {
        const [da, ma, aa] = a.fecha.split('/').map(Number);
        const [db, mb, ab] = b.fecha.split('/').map(Number);
        return new Date(aa, ma - 1, da) - new Date(ab, mb - 1, db);
    });

    // Reemplazar historial completo
    empleado.historial_olvidos = nuevoHistorial;
}


// ========================================
// ASIGNAR EL TOTAL DE LOS EVENTOS A LAS PROPIEDADES CORRESPONDIENTES DEL EMPLEADO
// ========================================
function asignarTotalOlvidos(empleado, force = false) {
    // Validar que exista el historial de olvidos
    if (!Array.isArray(empleado.historial_olvidos)) {
        return;
    }

    // Si fue editado manualmente y no es force, respetar la edición manual
    if (empleado._checador_editado_manual && !force) {
        return;
    }

    // Contar total de olvidos y sumar descuentos
    let totalOlvidos = 0;
    let totalDescontado = 0;
    empleado.historial_olvidos.forEach(olvido => {
        totalOlvidos += 1;
        totalDescontado += parseFloat(olvido.descuento_olvido) || 0;
    });

    // Asignar totales a propiedades del empleado
    empleado.checador = totalDescontado;
}

function asignarTotalInasistencias(empleado, force = false) {
    if (!Array.isArray(empleado.historial_inasistencias)) {
        return;
    }

    if (empleado._inasistencia_editado_manual && !force) {
        return;
    }

    let totalInasistencias = 0;
    let totalDescontado = 0;
    empleado.historial_inasistencias.forEach(inasistencia => {
        totalInasistencias += 1;
        totalDescontado += parseFloat(inasistencia.descuento_inasistencia) || 0;
    });

    empleado.inasistencia = totalDescontado;
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

