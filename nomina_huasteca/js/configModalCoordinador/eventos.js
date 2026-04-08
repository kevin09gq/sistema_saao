// ========================================
// VARIABLES GLOBALES
// ========================================
let descuentoPorMinuto = 25;
let descuentoPorChecador = 20;
// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Convierte "HH:MM" a minutos totales
function aMinutos(hora) {
    const [h, m] = hora.split(':');
    return parseInt(h) * 60 + parseInt(m);
}

// Convierte minutos a formato texto (45m ó 1h 30m)
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




// ========================================
// RECALCULAR EVENTOS DE UN COORDINADOR INDIVIDUAL (después de actualizar biométrico)
// ========================================

function recalcularEventosCoordinador(empleado) {
    // Validar que sea coordinador
    if (!empleado || empleado.tipo_horario !== 1) {
        return;
    }

    // Recalcular retardos
    asignarHistorialRetardos(empleado);
    asignarTotalRetardosCoordinador(empleado, false);
    if (Array.isArray(empleado.historial_retardos) && empleado.historial_retardos.length === 0) {
        delete empleado.historial_retardos;
    }

    // Recalcular inasistencias
    asignarHistorialInasistencias(empleado);
    asignarTotalInasistenciasCoordinador(empleado, false);
    if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length === 0) {
        delete empleado.historial_inasistencias;
    }

    // Recalcular olvidos del checador
    asignarHistorialOlvidos(empleado);
    asignarTotalOlvidosCoordinador(empleado, false);
    if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) {
        delete empleado.historial_olvidos;
    }
}

// ========================================
// CALCULAR EVENTOS AL ARRANQUE DEL SISTEMA
// ========================================

function calcularRetardosTodosCoordinadores(jsonNominaHuasteca) {
    // Validar que exista la nómina y sus departamentos
    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) {
        return;
    }

    // Iterar sobre todos los departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {
        // Iterar sobre todos los empleados del departamento
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Solo procesar coordinadores (tipo_horario === 1)
            if (empleado.tipo_horario !== 1) return;

            // Calcular el historial de retardos para este coordinador
            asignarHistorialRetardos(empleado);

            // Calcular y asignar el total de retardos a la propiedad
            asignarTotalRetardosCoordinador(empleado, true); // force=true para asegurar la asignación

            // Limpiar historial si está vacío
            if (Array.isArray(empleado.historial_retardos) && empleado.historial_retardos.length === 0) {
                delete empleado.historial_retardos;
            }
        });
    });
}

function calcularInasistenciasTodosCoordinadores(jsonNominaHuasteca) {
    // Validar que exista la nómina y sus departamentos
    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) {
        return;
    }

    // Iterar sobre todos los departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {
        // Iterar sobre todos los empleados del departamento
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Solo procesar coordinadores (tipo_horario === 1)
            if (empleado.tipo_horario !== 1) return;

            // Calcular el historial de inasistencias para este coordinador
            asignarHistorialInasistencias(empleado);

            // Calcular y asignar el total de inasistencias a la propiedad
            asignarTotalInasistenciasCoordinador(empleado, true); // force=true para asegurar la asignación

            // Limpiar historial si está vacío
            if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length === 0) {
                delete empleado.historial_inasistencias;
            }
        });
    });
}

function calcularOlvidosTodosCoordinadores(jsonNominaHuasteca) {
    // Validar que exista la nómina y sus departamentos
    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) {
        return;
    }

    // Iterar sobre todos los departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {
        // Iterar sobre todos los empleados del departamento
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Solo procesar coordinadores (tipo_horario === 1)
            if (empleado.tipo_horario !== 1) return;

            // Calcular el historial de olvidos para este coordinador
            asignarHistorialOlvidos(empleado);

            // Calcular y asignar el total de olvidos a la propiedad
            asignarTotalOlvidosCoordinador(empleado, true); // force=true para asegurar la asignación

            // Limpiar historial si está vacío
            if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) {
                delete empleado.historial_olvidos;
            }
        });
    });
}


// ========================================
// ASIGNAR HISTORIAL DE LOS EVENTOS 
// ========================================
function asignarHistorialRetardos(empleado) {
    // Validaciones básicas
    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) {
        return;
    }

    // Inicializar historial si no existe
    if (!Array.isArray(empleado.historial_retardos)) {
        empleado.historial_retardos = [];
    }

    // Preservar valores manuales previos (por fecha) para no perderlos al recalcular
    const valoresPrevios = {};
    const editadosPrevios = {};
    empleado.historial_retardos.forEach(r => {
        if (!r || !r.fecha) return;
        const fechaNormalizada = String(r.fecha).trim();
        // Preservar tolerancia (incluso si es 0)
        const tolerancia = r.tolerancia !== undefined && r.tolerancia !== null && r.tolerancia !== '' 
            ? parseFloat(r.tolerancia) 
            : 0;
        // Preservar descuento_por_minuto (incluso si es 0)
        const descuentoMinuto = r.descuento_por_minuto !== undefined && r.descuento_por_minuto !== null && r.descuento_por_minuto !== ''
            ? parseFloat(r.descuento_por_minuto)
            : descuentoPorMinuto;
        valoresPrevios[fechaNormalizada] = {
            tolerancia: tolerancia,
            descuento_por_minuto: descuentoMinuto
        };
        // Preservar si fue editado manualmente
        editadosPrevios[fechaNormalizada] = r.editado === true;
    });

    const nuevoHistorial = [];
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    // Agrupar registros por fecha y obtener la PRIMERA entrada válida de cada día
    const registrosPorFecha = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha || !reg.entrada) return;

        const fechaNormalizada = String(reg.fecha).trim();
        if (!registrosPorFecha[fechaNormalizada]) {
            registrosPorFecha[fechaNormalizada] = [];
        }
        registrosPorFecha[fechaNormalizada].push(reg);
    });

    // Procesar cada día
    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDia = registrosPorFecha[fecha];

        // Filtrar registros con entrada válida y obtener la primera entrada
        const registrosConEntrada = registrosDia.filter(reg =>
            reg.entrada &&
            /^\d{1,2}:\d{2}/.test(reg.entrada.trim()) // Validar formato HH:MM o H:MM
        );

        if (registrosConEntrada.length === 0) return;

        // Obtener la primera entrada (menor hora)
        const primeraEntrada = registrosConEntrada.reduce((earliest, current) => {
            const minEarliest = aMinutos(earliest.entrada.trim());
            const minCurrent = aMinutos(current.entrada.trim());
            return minEarliest < minCurrent ? earliest : current;
        });

        // Obtener día de la semana a partir de la fecha
        const [dia, mes, anio] = fecha.split('/').map(x => parseInt(x.trim()));
        const fechaObj = new Date(anio, mes - 1, dia);
        const diaSemana = diasSemana[fechaObj.getDay()];
        const nombreDelDia = nombreDia(fecha);

        // Buscar horario oficial para este día de la semana
        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.entrada) return;

        // Calcular diferencia en minutos
        const minutosReal = aMinutos(primeraEntrada.entrada.trim());
        const minutosOficial = aMinutos(horarioOficial.entrada.trim());
        const diferencia = minutosReal - minutosOficial;

        if (diferencia > 0) {
            // Obtener tolerancia y descuento del historial anterior o valores por defecto
            const prev = valoresPrevios[fecha];
            const tolerancia = prev ? prev.tolerancia : 0;
            const descuentoMinuto = prev ? prev.descuento_por_minuto : descuentoPorMinuto;

            // Calcular minutos ajustados y descuento
            const minutosAjustados = Math.max(0, diferencia - tolerancia);
            const totalDescontado = minutosAjustados * descuentoMinuto;

            nuevoHistorial.push({
                fecha: fecha,
                dia: nombreDelDia,
                minutos_retardo: diferencia,
                tolerancia: tolerancia,
                descuento_por_minuto: descuentoMinuto,
                total_descontado: parseFloat(totalDescontado.toFixed(2)),
                editado: editadosPrevios[fecha] === true
            });
        }
    });

    // Ordenar historial por fecha (garantiza consistencia)
    nuevoHistorial.sort((a, b) => {
        const [da, ma, aa] = a.fecha.split('/').map(Number);
        const [db, mb, ab] = b.fecha.split('/').map(Number);
        return new Date(aa, ma - 1, da) - new Date(ab, mb - 1, db);
    });

    // Reemplazar historial completo
    empleado.historial_retardos = nuevoHistorial;
}

function asignarHistorialInasistencias(empleado) {
    // Validaciones básicas
    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) {
        return;
    }

    // Inicializar historial si no existe
    if (!Array.isArray(empleado.historial_inasistencias)) {
        empleado.historial_inasistencias = [];
    }

    // Preservar inasistencias manuales (tipo = 'manual')
    const inasistenciasManuales = empleado.historial_inasistencias.filter(i =>
        i && i.tipo === 'manual'
    );

    // Crear nuevo historial comenzando con las manuales
    const nuevoHistorial = [...inasistenciasManuales];

    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Crear mapa de fechas con registros agrupadas por día de la semana
    const registrosPorDiaSemana = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;

        const [dia, mes, anio] = reg.fecha.split('/').map(x => parseInt(x.trim()));
        const fechaObj = new Date(anio, mes - 1, dia);
        const diaSemana = diasSemana[fechaObj.getDay()];

        if (!registrosPorDiaSemana[diaSemana]) {
            registrosPorDiaSemana[diaSemana] = [];
        }
        registrosPorDiaSemana[diaSemana].push(reg);
    });

    // Procesar cada día del horario oficial
    empleado.horario_oficial.forEach(horario => {
        const diaSemana = String(horario.dia || '').toUpperCase().trim();

        // Si el día no tiene entrada definida, no es laborable
        if (!horario.entrada || horario.entrada === '') return;

        // Si tiene días justificados (vacaciones, descanso, etc.), saltar
        const estaJustificado = Array.isArray(empleado.dias_justificados) &&
            empleado.dias_justificados.some(j => j.dia.toUpperCase().trim() === diaSemana);
        if (estaJustificado) {
            return;
        }

        // Verificar si hay registros para este día de la semana
        const registrosDia = registrosPorDiaSemana[diaSemana] || [];
        const tieneRegistro = registrosDia.some(reg =>
            (reg.entrada && reg.entrada.trim() !== '') ||
            (reg.salida && reg.salida.trim() !== '')
        );

        // Si no hay registro pero tenía horario, es inasistencia
        if (!tieneRegistro) {
            const nombreDelDia = diasNormales[diasSemana.indexOf(diaSemana)];
            const descuentoPorInasistencia = parseFloat(empleado.salario_diario) || 0;

            nuevoHistorial.push({
                dia: nombreDelDia,
                descuento_inasistencia: descuentoPorInasistencia,
                tipo: 'automatico'
            });
        }
    });

    // Reemplazar historial completo (mantiene manuales + agrega automáticas)
    empleado.historial_inasistencias = nuevoHistorial;
}

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
        // Preservar el valor previo incluso si es 0. Solo usar la constante si no existe valor previo.
        if (olvido.descuento_olvido !== undefined && olvido.descuento_olvido !== null && olvido.descuento_olvido !== '') {
            descuentosPrevios[fechaNormalizada] = parseFloat(olvido.descuento_olvido);
        } else {
            descuentosPrevios[fechaNormalizada] = descuentoPorChecador;
        }
        // Preservar si el registro fue editado manualmente
        editadosPrevios[fechaNormalizada] = olvido.editado === true;
    });

    const nuevoHistorial = [];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    // Revisar cada registro
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;

        // Validar si tiene entrada o salida (valores no vacíos)
        const tieneEntrada = reg.entrada && String(reg.entrada).trim() !== '' && String(reg.entrada).trim() !== '-';
        const tieneSalida = reg.salida && String(reg.salida).trim() !== '' && String(reg.salida).trim() !== '-';

        // Olvido: tiene UNO pero NO el otro (registro incompleto)
        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            // Obtener nombre del día de la semana
            const [dia, mes, anio] = String(reg.fecha).split('/').map(x => parseInt(x.trim()));
            const fechaObj = new Date(anio, mes - 1, dia);
            const diaNormal = diasNormales[fechaObj.getDay()];
            const fechaNormalizada = String(reg.fecha).trim();

            // Usar descuento previo si existe (editado manualmente), si no usar constante global
            const descuentoPorOlvido = descuentosPrevios[fechaNormalizada] !== undefined
                ? descuentosPrevios[fechaNormalizada]
                : descuentoPorChecador;

            nuevoHistorial.push({
                dia: diaNormal,
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
function asignarTotalRetardosCoordinador(empleado, force = false) {
    // Validar que exista el historial de retardos
    if (!Array.isArray(empleado.historial_retardos)) {
        return;
    }

    // Si fue editado manualmente y no es force, respetar la edición manual
    if (empleado._retardos_editado_manual && !force) {
        return;
    }

    // Sumar todos los descuentos del historial
    let totalDescontado = 0;
    empleado.historial_retardos.forEach(retardo => {
        totalDescontado += parseFloat(retardo.total_descontado) || 0;
    });

    // Asignar el total a la propiedad retardos del empleado
    empleado.retardos = totalDescontado;
}

function asignarTotalInasistenciasCoordinador(empleado, force = false) {
    // Validar que exista el historial de inasistencias
    if (!Array.isArray(empleado.historial_inasistencias)) {
        return;
    }

    // Si fue editado manualmente y no es force, respetar la edición manual
    if (empleado._inasistencia_editado_manual && !force) {
        return;
    }

    // Contar total de inasistencias y sumar descuentos
    let totalDescontado = 0;
    empleado.historial_inasistencias.forEach(inasistencia => {
        // Si el usuario eligió ignorar automáticas, no las sumamos al total
        if (inasistencia.tipo === 'automatico' && empleado.ignorar_inasistencias_automaticas === true) {
            return;
        }
        totalDescontado += parseFloat(inasistencia.descuento_inasistencia) || 0;
    });

    // Asignar totales a propiedades del empleado
    empleado.inasistencia = totalDescontado;

}

function asignarTotalOlvidosCoordinador(empleado, force = false) {
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


// ========================================
// MOSTRAR EVENTOS ESPECIALES EN EL MODAL
// ========================================
function mostrarEventosPorEntrada(empleado, selectorContent, selectorTotal, filtro, textoVacio, tipo = 'entrada') {
    const $content = $(selectorContent);
    $content.empty();

    if (!Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) {
        $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
        $(selectorTotal).text('0');
        return;
    }

    // Caso especial: inasistencias (registros con entrada/salida vacías solo si el día tiene horario)
    if (tipo === 'inasistencia') {
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        // Queremos marcar solo cuando no hay ningún registro de ese día (entrada+y salida vacíos)
        const inasistencias = empleado.registros.filter(r => {
            if (!r.fecha) return false;

            const [d, m, a] = r.fecha.split('/');
            const diaSemana = diasSemana[new Date(a, m - 1, d).getDay()];
            const horario = empleado.horario_oficial.find(h => h.dia?.toUpperCase().trim() === diaSemana);

            // Verificar si el día está justificado
            const estaJustificado = Array.isArray(empleado.dias_justificados) &&
                empleado.dias_justificados.some(j => j.dia.toUpperCase().trim() === diaSemana);

            // En este registro no debe existir ninguna marca
            const sinRegistro = (!r.entrada || r.entrada.trim() === '') && (!r.salida || r.salida.trim() === '');

            // Solo es inasistencia si: tiene horario Y sinRegistro Y NO está justificado
            return horario?.entrada && sinRegistro && !estaJustificado;
        });

        if (inasistencias.length === 0) {
            $content.html(`<p class="sin-eventos">${textoVacio}</p>`);
            $(selectorTotal).text('0');
            return;
        }

        $content.html(inasistencias.map(r => `
            <div class="evento-item">
                <span>${nombreDia(r.fecha)} ${r.fecha}</span>
            </div>
        `).join(''));
        $(selectorTotal).text(inasistencias.length);
        return;
    }

    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const esEntrada = tipo === 'entrada';
    const campo = esEntrada ? 'entrada' : 'salida';
    const comparador = esEntrada ? (a, b) => aMinutos(a) < aMinutos(b) : (a, b) => aMinutos(a) > aMinutos(b);

    // Agrupar registros por fecha y obtener primera entrada o última salida
    const porFecha = {};
    empleado.registros.forEach(reg => {
        if (reg.fecha && reg[campo]) {
            if (!porFecha[reg.fecha] || comparador(reg[campo], porFecha[reg.fecha])) {
                porFecha[reg.fecha] = reg[campo];
            }
        }
    });

    // Detectar eventos según el filtro
    const eventos = [];
    Object.entries(porFecha).forEach(([fecha, valor]) => {
        const [d, m, a] = fecha.split('/');
        const diaSemana = diasSemana[new Date(a, m - 1, d).getDay()];
        const horario = empleado.horario_oficial.find(h => h.dia?.toUpperCase().trim() === diaSemana);

        if (!horario?.[campo]) return;

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

function mostrarRetardos(empleado) {
    mostrarEventosPorEntrada(empleado, '#retardos-coordinadores', '#total-retardos-coordinadores',
        (diff) => diff > 0 ? diff : null,
        'Sin retardos'
    );
}

function mostrarEntradasTempranas(empleado) {
    mostrarEventosPorEntrada(empleado, '#entradas-tempranas-coordinadores', '#total-entradas-tempranas-coordinadores',
        (diff) => diff < -45 ? Math.abs(diff) : null,
        'Sin entradas tempranas'
    );
}

function mostrarSalidasTardias(empleado) {
    mostrarEventosPorEntrada(empleado, '#salidas-tardias-coordinadores', '#total-salidas-tardias-coordinadores',
        (diff) => diff > 45 ? diff : null,
        'Sin salidas tardías',
        'salida'
    );
}

function mostrarSalidasTempranas(empleado) {
    mostrarEventosPorEntrada(empleado, '#salidas-tempranas-coordinadores', '#total-salidas-tempranas-coordinadores',
        (diff) => diff < 0 ? Math.abs(diff) : null,
        'Sin salidas tempranas',
        'salida'
    );
}

function mostrarInasistencias(empleado) {
    mostrarEventosPorEntrada(empleado, '#inasistencias-content-coordinadores', '#total-inasistencias-coordinadores',
        null, 'Sin inasistencias', 'inasistencia'
    );
}

function mostrarOlvidosChecador(empleado) {
    const $content = $('#olvidos-checador-coordinadores');
    $content.empty();

    // Validar que exista el historial de olvidos
    if (!Array.isArray(empleado.historial_olvidos) || empleado.historial_olvidos.length === 0) {
        $content.html('<p class="sin-eventos">Sin olvidos del checador</p>');
        $('#total-olvidos-checador-coordinadores').text('0');
        return;
    }

    // Renderizar historial de olvidos
    $content.html(empleado.historial_olvidos.map(olvido => `
        <div class="evento-item">
            <span>${olvido.dia} ${olvido.fecha} · $${parseFloat(olvido.descuento_olvido).toFixed(2)}</span>
        </div>
    `).join(''));

    // Mostrar total de olvidos
    $('#total-olvidos-checador-coordinadores').text(empleado.historial_olvidos.length);
}