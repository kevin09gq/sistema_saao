
// ========================================
// EVENTOS ESPECIALES POR EMPLEADO
// ========================================


function detectarRetardos(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        (departamento.empleados || []).forEach(e => {
            if (String(e.clave).trim() === String(claveEmpleado).trim()) empleado = e;
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // Inicializar historial
    if (!Array.isArray(empleado.historial_retardos)) {
        empleado.historial_retardos = [];
    }
    // Guardar valores editados manualmente (por fecha) para no perderlos al recalcular
    const valoresPrevios = {};
    empleado.historial_retardos.forEach(r => {
        if (!r || !r.fecha) return;
        valoresPrevios[String(r.fecha).trim()] = {
            tolerancia: parseFloat(r.tolerancia) || 0,
            descuento_por_minuto: parseFloat(r.descuento_por_minuto) || 0
        };
    });

    const nuevoHistorial = [];

    // Agrupar registros por fecha y encontrar la primera entrada de cada día
    const registrosAgrupados = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha || !reg.entrada) return;

        if (!registrosAgrupados[reg.fecha]) {
            registrosAgrupados[reg.fecha] = [];
        }
        registrosAgrupados[reg.fecha].push(reg);
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Procesar cada día
    Object.keys(registrosAgrupados).forEach(fecha => {
        // Obtener la primera entrada del día
        const registrosDia = registrosAgrupados[fecha];

        // Filtrar registros que tienen entrada válida
        const registrosConEntrada = registrosDia.filter(reg => reg.entrada && reg.entrada.includes(':'));

        if (registrosConEntrada.length === 0) return;

        const primeraEntrada = registrosConEntrada.reduce((earliest, current) => {
            const [h1, m1] = earliest.entrada.split(':');
            const [h2, m2] = current.entrada.split(':');
            const minutos1 = parseInt(h1) * 60 + parseInt(m1);
            const minutos2 = parseInt(h2) * 60 + parseInt(m2);
            return minutos1 < minutos2 ? earliest : current;
        });

        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const diaSemana = dias[fechaObj.getDay()];
        const diaNormal = diasNormales[fechaObj.getDay()];

        // Buscar horario oficial para este día
        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.entrada) return;

        // Calcular diferencia en minutos
        const [hReal, mReal] = primeraEntrada.entrada.split(':');
        const [hOficial, mOficial] = horarioOficial.entrada.split(':');

        const minutosReal = parseInt(hReal) * 60 + parseInt(mReal);
        const minutosOficial = parseInt(hOficial) * 60 + parseInt(mOficial);

        const diferencia = minutosReal - minutosOficial;

        if (diferencia > 0) {

            // Obtener valores por defecto para el historial
            const prev = valoresPrevios[String(fecha).trim()];
            const tolerancia = prev ? prev.tolerancia : 0;
            const descuentoPorMinuto = prev ? prev.descuento_por_minuto : 25;

            // Calcular minutos ajustados y descuento para este día
            const minutosAjustados = Math.max(0, diferencia - tolerancia);
            const totalDescontado = (minutosAjustados * descuentoPorMinuto);

            // Agregar al historial
            nuevoHistorial.push({
                fecha: fecha,
                dia: diaNormal,
                minutos_retardo: diferencia,
                tolerancia: tolerancia,
                descuento_por_minuto: descuentoPorMinuto,
                total_descontado: parseFloat(totalDescontado.toFixed(2))
            });
        }
    });

    // Reemplazar historial una sola vez (mantiene orden y preserva valores manuales por fecha)
    empleado.historial_retardos = nuevoHistorial;

    // El total de retardos se calcula desde el historial
    if (typeof recalcularTotalRetardos === 'function') {
        recalcularTotalRetardos(empleado);
    }
}

function detectarInasistencias(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        (departamento.empleados || []).forEach(e => {
            if (String(e.clave).trim() === String(claveEmpleado).trim()) empleado = e;
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // Preservar descuentos editados manualmente
    const descuentosPrevios = empleado._descuentos_inasistencias_previos || {};

    // Si hay descuentos previos guardados desde actualizarHorarioOficial, usarlos
    // Si no, verificar si ya existe un historial editado manualmente
    if (Object.keys(descuentosPrevios).length === 0 &&
        Array.isArray(empleado.historial_inasistencias) &&
        empleado.historial_inasistencias.length > 0) {

        // Guardar descuentos del historial existente
        empleado.historial_inasistencias.forEach(inasistencia => {
            if (inasistencia && inasistencia.dia) {
                descuentosPrevios[inasistencia.dia.toUpperCase()] = parseFloat(inasistencia.descuento_inasistencia) || 0;
            }
        });

        // Solo recalcular el total desde el historial existente
        if (typeof recalcularTotalInasistencias === 'function') {
            recalcularTotalInasistencias(empleado);
        }
        return;
    }

    // Inicializar historial de inasistencias
    empleado.historial_inasistencias = [];

    // Contador de inasistencias
    let inasistencias = 0;

    // Crear un mapa de fechas con registros
    const fechasConRegistros = new Set();
    empleado.registros.forEach(reg => {
        if (reg.fecha) {
            fechasConRegistros.add(reg.fecha);
        }
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Verificar cada día del horario oficial
    empleado.horario_oficial.forEach(horario => {
        const diaSemana = String(horario.dia || '').toUpperCase().trim();

        // Verificar si el día tiene horario de entrada (significa que debe trabajar)
        if (horario.entrada && horario.entrada !== '') {

            // Buscar registros para este día de la semana
            let tieneRegistro = false;

            // Recorrer todos los registros del empleado
            empleado.registros.forEach(reg => {
                if (!reg.fecha) return;

                // Obtener día de la semana de la fecha del registro
                const [dia, mes, anio] = reg.fecha.split('/');
                const diaRegistro = dias[new Date(anio, mes - 1, dia).getDay()];

                // Si el día coincide y tiene algún registro (entrada o salida)
                if (diaRegistro === diaSemana &&
                    ((reg.entrada && reg.entrada !== '') || (reg.salida && reg.salida !== ''))) {
                    tieneRegistro = true;
                }
            });

            // Si no tiene registro pero tenía horario, es inasistencia
            if (!tieneRegistro) {
                inasistencias++;

                // Usar descuento previo si existe (editado manualmente), si no usar sueldo_diario
                const diaCapitalizado = diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase();
                const descuentoPorInasistencia = descuentosPrevios[diaSemana] !== undefined
                    ? descuentosPrevios[diaSemana]
                    : (parseFloat(empleado.sueldo_diario) || 0);

                // Agregar al historial (necesitamos encontrar la fecha correspondiente)
                // Como no tenemos fecha específica, usaremos el nombre del día
                empleado.historial_inasistencias.push({
                    dia: diaCapitalizado, // Capitalizar
                    fecha: '', // No tenemos fecha específica porque no hay registro
                    descuento_inasistencia: descuentoPorInasistencia
                });

            }
        }
    });

    // Limpiar descuentos previos temporales
    delete empleado._descuentos_inasistencias_previos;

    // Guardar el número de inasistencias en el empleado
    empleado.inasistencias_contadas = inasistencias;

    // El total de inasistencias se calcula desde el historial
    if (typeof recalcularTotalInasistencias === 'function') {
        recalcularTotalInasistencias(empleado);
    }


}

function detectarOlvidosChecador(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        (departamento.empleados || []).forEach(e => {
            if (String(e.clave).trim() === String(claveEmpleado).trim()) empleado = e;
        });
    });

    if (!empleado || !Array.isArray(empleado.registros)) return;

    // Preservar descuentos editados manualmente
    const descuentosPrevios = {};
    
    // Si ya existe un historial editado manualmente
    if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length > 0) {
        // Guardar descuentos del historial existente por fecha
        empleado.historial_olvidos.forEach(olvido => {
            if (olvido && olvido.fecha) {
                descuentosPrevios[olvido.fecha] = parseFloat(olvido.descuento_olvido) || 20;
            }
        });
        
        // Solo recalcular el total desde el historial existente
        if (typeof recalcularTotalOlvidos === 'function') {
            recalcularTotalOlvidos(empleado);
        }
        return;
    }

    // Inicializar historial de olvidos
    empleado.historial_olvidos = [];

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Revisar cada registro
    empleado.registros.forEach(reg => {
        // Verificar si tiene entrada o salida (con datos válidos)
        const tieneEntrada = reg.entrada && reg.entrada !== '' && reg.entrada !== '-';
        const tieneSalida = reg.salida && reg.salida !== '' && reg.salida !== '-';

        // Olvido: tiene UNO pero NO el otro (registro incompleto)
        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            // Obtener nombre del día
            let diaNormal = '-';
            if (reg.fecha) {
                const [dia, mes, anio] = reg.fecha.split('/');
                const fechaObj = new Date(anio, mes - 1, dia);
                diaNormal = diasNormales[fechaObj.getDay()];
            }

            // Usar descuento previo si existe (editado manualmente), si no usar 20
            const descuentoPorOlvido = descuentosPrevios[reg.fecha] !== undefined 
                ? descuentosPrevios[reg.fecha] 
                : 20;
            
            empleado.historial_olvidos.push({
                dia: diaNormal,
                fecha: reg.fecha || '',
                descuento_olvido: descuentoPorOlvido
            });
        }
    });

    // Guardar número de olvidos
    empleado.olvidos_checador = empleado.historial_olvidos.length;

    // El total se calcula desde el historial
    if (typeof recalcularTotalOlvidos === 'function') {
        recalcularTotalOlvidos(empleado);
    }

}

function detectarEntradasTempranas(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(emp => {
            if (String(emp.clave).trim() === String(claveEmpleado).trim()) {
                empleado = emp;
            }
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // Inicializar historial
    if (!Array.isArray(empleado.historial_entradas_tempranas)) {
        empleado.historial_entradas_tempranas = [];
    }

    const nuevoHistorial = [];

    // Agrupar registros por fecha
    const registrosAgrupados = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha || !reg.entrada) return;
        const fecha = reg.fecha.trim();
        if (!registrosAgrupados[fecha]) {
            registrosAgrupados[fecha] = [];
        }
        registrosAgrupados[fecha].push(reg);
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Procesar cada día
    Object.keys(registrosAgrupados).forEach(fecha => {
        const registros = registrosAgrupados[fecha];
        
        // Encontrar la primera entrada del día
        const primeraEntrada = registros.reduce((min, reg) => {
            if (!min || !min.entrada) return reg;
            return reg.entrada < min.entrada ? reg : min;
        }, null);

        if (!primeraEntrada || !primeraEntrada.entrada) return;

        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];
        const diaFormateado = diasNormales[new Date(anio, mes - 1, dia).getDay()];

        // Buscar horario oficial para ese día
        const horarioOficial = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.entrada) return;

        // Convertir horas a minutos para comparar
        const horaToMinutos = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };

        const minutosEntrada = horaToMinutos(primeraEntrada.entrada);
        const minutosOficial = horaToMinutos(horarioOficial.entrada);

        // Calcular diferencia (negativo = temprano)
        const diferencia = minutosOficial - minutosEntrada;

        // Si llegó temprano (45 minutos o más antes)
        if (diferencia >= 45) {
            nuevoHistorial.push({
                dia: diaFormateado,
                fecha: fecha,
                hora_entrada: primeraEntrada.entrada,
                hora_oficial: horarioOficial.entrada,
                minutos_temprano: diferencia
            });
        }
    });

    // Reemplazar historial
    empleado.historial_entradas_tempranas = nuevoHistorial;
}

function detectarSalidasTardias(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(emp => {
            if (String(emp.clave).trim() === String(claveEmpleado).trim()) {
                empleado = emp;
            }
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // Inicializar historial
    if (!Array.isArray(empleado.historial_salidas_tardias)) {
        empleado.historial_salidas_tardias = [];
    }

    const nuevoHistorial = [];

    // Agrupar registros por fecha
    const registrosAgrupados = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha || !reg.salida) return;
        const fecha = reg.fecha.trim();
        if (!registrosAgrupados[fecha]) {
            registrosAgrupados[fecha] = [];
        }
        registrosAgrupados[fecha].push(reg);
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Procesar cada día
    Object.keys(registrosAgrupados).forEach(fecha => {
        const registros = registrosAgrupados[fecha];
        
        // Encontrar la última salida del día
        const ultimaSalida = registros.reduce((max, reg) => {
            if (!max || !max.salida) return reg;
            return reg.salida > max.salida ? reg : max;
        }, null);

        if (!ultimaSalida || !ultimaSalida.salida) return;

        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];
        const diaFormateado = diasNormales[new Date(anio, mes - 1, dia).getDay()];

        // Buscar horario oficial para ese día
        const horarioOficial = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.salida) return;

        // Convertir horas a minutos para comparar
        const horaToMinutos = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };

        const minutosSalida = horaToMinutos(ultimaSalida.salida);
        const minutosOficial = horaToMinutos(horarioOficial.salida);

        // Calcular diferencia (positivo = tarde)
        const diferencia = minutosSalida - minutosOficial;

        // Si salió tarde (45 minutos o más después)
        if (diferencia >= 45) {
            nuevoHistorial.push({
                dia: diaFormateado,
                fecha: fecha,
                hora_salida: ultimaSalida.salida,
                hora_oficial: horarioOficial.salida,
                minutos_tarde: diferencia
            });
        }
    });

    // Reemplazar historial
    empleado.historial_salidas_tardias = nuevoHistorial;
}

function detectarSalidasTempranas(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(emp => {
            if (String(emp.clave).trim() === String(claveEmpleado).trim()) {
                empleado = emp;
            }
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // Inicializar historial
    if (!Array.isArray(empleado.historial_salidas_tempranas)) {
        empleado.historial_salidas_tempranas = [];
    }

    const nuevoHistorial = [];

    // Agrupar registros por fecha (incluir todos, incluso sin salida)
    const registrosAgrupados = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;
        const fecha = reg.fecha.trim();
        if (!registrosAgrupados[fecha]) {
            registrosAgrupados[fecha] = [];
        }
        registrosAgrupados[fecha].push(reg);
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Tolerancia de 10 minutos
    const TOLERANCIA_MINUTOS = 10;

    // Procesar cada día
    Object.keys(registrosAgrupados).forEach(fecha => {
        const registros = registrosAgrupados[fecha];
        
        // Ordenar registros por hora de entrada para identificar el último registro cronológicamente
        const registrosOrdenados = registros.slice().sort((a, b) => {
            const entradaA = a.entrada || '00:00';
            const entradaB = b.entrada || '00:00';
            return entradaA.localeCompare(entradaB);
        });
        
        // Tomar el ÚLTIMO registro del día (cronológicamente)
        const ultimoRegistro = registrosOrdenados[registrosOrdenados.length - 1];
        
        // Si el último registro NO tiene salida, significa que no checó su salida final
        // Por lo tanto, NO debe detectarse como salida temprana
        if (!ultimoRegistro.salida || ultimoRegistro.salida.trim() === '' || ultimoRegistro.salida === '-') {
            return; // Ignorar este día
        }
        
        // Si llegamos aquí, el último registro SÍ tiene salida, usar esa como salida final
        const salidaFinal = ultimoRegistro.salida;

        

        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];
        const diaFormateado = diasNormales[new Date(anio, mes - 1, dia).getDay()];

        // Buscar horario oficial para ese día
        const horarioOficial = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.salida) return;

        // Convertir horas a minutos para comparar
        const horaToMinutos = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };

        const minutosSalida = horaToMinutos(salidaFinal);
        const minutosOficial = horaToMinutos(horarioOficial.salida);

        // Calcular diferencia (negativo = temprano)
        const diferencia = minutosOficial - minutosSalida;

        // Si salió temprano (10 minutos o más antes)
        if (diferencia >= TOLERANCIA_MINUTOS) {
            nuevoHistorial.push({
                dia: diaFormateado,
                fecha: fecha,
                hora_salida: salidaFinal,
                hora_oficial: horarioOficial.salida,
                minutos_temprano: diferencia
            });
        }
    });

    // Reemplazar historial
    empleado.historial_salidas_tempranas = nuevoHistorial;
}



// ========================================
// DETECTAR EVENTOS AUTOMÁTICOS PARA TODOS LOS EMPLEADOS AL INICIAR EL SISTEMA
// ========================================
function detectarEventosAutomaticos(jsonNomina) {
    if (!jsonNomina || !Array.isArray(jsonNomina.departamentos)) return;


    let totalEmpleados = 0;
    let totalRetardos = 0;
    let totalInasistencias = 0;
    let totalOlvidos = 0;
    let totalPermisos = 0;

    // Recorrer todos los departamentos y empleados
    jsonNomina.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            if (!empleado.clave) return;

            totalEmpleados++;

            // Detectar retardos
            if (typeof detectarRetardosAutomatico === 'function') {
                const resultadoRetardos = detectarRetardosAutomatico(empleado);
                if (resultadoRetardos > 0) totalRetardos++;
            }

            // Detectar inasistencias
            if (typeof detectarInasistenciasAutomatico === 'function') {
                const resultadoInasistencias = detectarInasistenciasAutomatico(empleado);
                if (resultadoInasistencias > 0) totalInasistencias++;
            }

            // Detectar olvidos de checador
            if (typeof detectarOlvidosChecadorAutomatico === 'function') {
                const resultadoOlvidos = detectarOlvidosChecadorAutomatico(empleado);
                if (resultadoOlvidos > 0) totalOlvidos++;
            }

        });
    });


}

// Versión automática de detectarRetardos (sin dependencia del modal)
function detectarRetardosAutomatico(empleado) {
    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return 0;


    const registrosAgrupados = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha || !reg.entrada) return;
        if (!registrosAgrupados[reg.fecha]) {
            registrosAgrupados[reg.fecha] = [];
        }
        registrosAgrupados[reg.fecha].push(reg);
    });

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    Object.keys(registrosAgrupados).forEach(fecha => {
        const registrosDia = registrosAgrupados[fecha];
        const registrosConEntrada = registrosDia.filter(reg => reg.entrada && reg.entrada.includes(':'));

        if (registrosConEntrada.length === 0) return;

        const primeraEntrada = registrosConEntrada.reduce((earliest, current) => {
            const [h1, m1] = earliest.entrada.split(':');
            const [h2, m2] = current.entrada.split(':');
            const minutos1 = parseInt(h1) * 60 + parseInt(m1);
            const minutos2 = parseInt(h2) * 60 + parseInt(m2);
            return minutos1 < minutos2 ? earliest : current;
        });

        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];

        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial || !horarioOficial.entrada) return;

        const [hReal, mReal] = primeraEntrada.entrada.split(':');
        const [hOficial, mOficial] = horarioOficial.entrada.split(':');

        const minutosReal = parseInt(hReal) * 60 + parseInt(mReal);
        const minutosOficial = parseInt(hOficial) * 60 + parseInt(mOficial);

        const diferencia = minutosReal - minutosOficial;

        if (diferencia > 0) {
            // Crear historial de retardos
            if (!Array.isArray(empleado.historial_retardos)) {
                empleado.historial_retardos = [];
            }

            const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const [d, m, a] = fecha.split('/');
            const fechaObj = new Date(a, m - 1, d);
            const diaNormal = diasNormales[fechaObj.getDay()];

            // Valores por defecto para el historial
            const tolerancia = 0;
            const descuentoPorMinuto = 25;
            const minutosAjustados = Math.max(0, diferencia - tolerancia);
            const totalDescontado = (minutosAjustados * descuentoPorMinuto);

            empleado.historial_retardos.push({
                fecha: fecha,
                dia: diaNormal,
                minutos_retardo: diferencia,
                tolerancia: tolerancia,
                descuento_por_minuto: descuentoPorMinuto,
                total_descontado: parseFloat(totalDescontado.toFixed(2))
            });
        }
    });

    // El total se calcula desde el historial
    let totalDescontado = 0;
    if (Array.isArray(empleado.historial_retardos)) {
        empleado.historial_retardos.forEach(retardo => {
            totalDescontado += parseFloat(retardo.total_descontado) || 0;
        });
    }
    empleado.retardos = totalDescontado;
    return empleado.retardos;
}

// Versión automática de detectarInasistencias (sin dependencia del modal)
function detectarInasistenciasAutomatico(empleado) {
    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return 0;

    // Inicializar historial de inasistencias
    if (!Array.isArray(empleado.historial_inasistencias)) {
        empleado.historial_inasistencias = [];
    }

    let inasistencias = 0;
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    empleado.horario_oficial.forEach(horario => {
        const diaSemana = String(horario.dia || '').toUpperCase().trim();

        if (horario.entrada && horario.entrada !== '') {
            let tieneRegistro = false;

            empleado.registros.forEach(reg => {
                if (!reg.fecha) return;

                const [dia, mes, anio] = reg.fecha.split('/');
                const diaRegistro = dias[new Date(anio, mes - 1, dia).getDay()];

                if (diaRegistro === diaSemana &&
                    ((reg.entrada && reg.entrada !== '') || (reg.salida && reg.salida !== ''))) {
                    tieneRegistro = true;
                }
            });

            if (!tieneRegistro) {
                inasistencias++;

                // Calcular descuento individual por esta inasistencia
                const descuentoPorInasistencia = parseFloat(empleado.sueldo_diario) || 0;

                // Agregar al historial
                empleado.historial_inasistencias.push({
                    dia: diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase(),
                    fecha: '',
                    descuento_inasistencia: descuentoPorInasistencia
                });
            }
        }
    });

    empleado.inasistencias_contadas = inasistencias;

    // El total se calcula desde el historial
    let totalDescontado = 0;
    if (Array.isArray(empleado.historial_inasistencias)) {
        empleado.historial_inasistencias.forEach(inasistencia => {
            totalDescontado += parseFloat(inasistencia.descuento_inasistencia) || 0;
        });
    }

    empleado.inasistencia = totalDescontado;
    return empleado.inasistencia;
}

// Versión automática de detectarOlvidosChecador (sin dependencia del modal)
function detectarOlvidosChecadorAutomatico(empleado) {
    if (!empleado || !Array.isArray(empleado.registros)) return 0;

    let olvidos = 0;

    empleado.registros.forEach(reg => {
        const tieneEntrada = reg.entrada && reg.entrada !== '' && reg.entrada !== '-';
        const tieneSalida = reg.salida && reg.salida !== '' && reg.salida !== '-';

        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            olvidos++;
        }
    });

    let descuentoOlvidos = (olvidos * 20).toFixed(2);

    empleado.olvidos_checador = olvidos;
    empleado.checador = parseFloat(descuentoOlvidos) || 0;

    return empleado.checador;
}



// ========================================
// MOSTRAR EVENTOS DE HISTORIALES ESPECIALES EN EL MODAL DE CONCEPTOS
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
        $contenedor.html(`
            <div style="text-align: center; padding: 2rem 1rem;">
                <p class="text-muted" style="font-size: 0.85rem; font-style: italic; margin: 0;">No hay retardos registrados en el historial</p>
            </div>
        `);
        return;
    }

    // Crear header de la tabla
    let html = `
        <div class="historial-retardos-header">
            <div class="historial-header-cell">Día</div>
            <div class="historial-header-cell">Fecha</div>
            <div class="historial-header-cell">Minutos</div>
            <div class="historial-header-cell">Tolerancia</div>
            <div class="historial-header-cell">$/Min</div>
            <div class="historial-header-cell">Descontado</div>
        </div>
    `;
    
    // Agregar filas de datos
    empleado.historial_retardos.forEach((retardo, index) => {
        html += `
            <div class="historial-retardo-item" data-index="${index}">
                <div>
                    <label class="form-label fw-normal small">Día</label>
                    <input type="text" class="form-control form-control-sm historial-dia" value="${retardo.dia}" readonly>
                </div>
                <div>
                    <label class="form-label fw-normal small">Fecha</label>
                    <input type="text" class="form-control form-control-sm historial-fecha" value="${retardo.fecha}" readonly>
                </div>
                <div>
                    <label class="form-label fw-normal small">Minutos</label>
                    <input type="number" step="1" class="form-control form-control-sm historial-minutos" value="${retardo.minutos_retardo}" data-field="minutos_retardo">
                </div>
                <div>
                    <label class="form-label fw-normal small">Tolerancia</label>
                    <input type="number" step="1" class="form-control form-control-sm historial-tolerancia" value="${retardo.tolerancia}" data-field="tolerancia">
                </div>
                <div>
                    <label class="form-label fw-normal small">$/Min</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-descuento-min" value="${retardo.descuento_por_minuto}" data-field="descuento_por_minuto">
                </div>
                <div>
                    <label class="form-label fw-normal small">Descontado</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-total" value="${retardo.total_descontado.toFixed(2)}" readonly>
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
        
        const $totalInput = $item.find('.historial-total');
        const valorAnterior = parseFloat($totalInput.val()) || 0;
        const valorNuevo = parseFloat(totalDescontado);
        
        $totalInput.val(totalDescontado);
        
        // Efecto visual cuando cambia el total
        if (valorAnterior !== valorNuevo) {
            $totalInput.addClass('updated');
            setTimeout(() => {
                $totalInput.removeClass('updated');
            }, 500);
        }
        
        // Marcar el item como editando
        $item.addClass('editing');
        
        // Actualizar el objeto en el array
        if (empleado.historial_retardos[index]) {
            empleado.historial_retardos[index].minutos_retardo = minutos;
            empleado.historial_retardos[index].tolerancia = tolerancia;
            empleado.historial_retardos[index].descuento_por_minuto = descuentoMin;
            empleado.historial_retardos[index].total_descontado = parseFloat(totalDescontado);
        }
        
        // IMPORTANTE: Limpiar la bandera de edición manual para que el historial sobrescriba
        empleado._retardos_editado_manual = false;
        
        // Recalcular total general de retardos
        recalcularTotalRetardos(empleado);
    });
    
    // Remover clase de edición cuando se pierde el foco
    $contenedor.on('blur', '.historial-minutos, .historial-tolerancia, .historial-descuento-min', function() {
        const $item = $(this).closest('.historial-retardo-item');
        setTimeout(() => {
            if (!$item.find('input:focus').length) {
                $item.removeClass('editing');
            }
        }, 100);
    });
}

// Función para recalcular el total de retardos basado en el historial
function recalcularTotalRetardos(empleado, force = false) {
    if (!Array.isArray(empleado.historial_retardos)) return;
    
    let totalDescontado = 0;
    empleado.historial_retardos.forEach(retardo => {
        totalDescontado += parseFloat(retardo.total_descontado) || 0;
    });
    
    // Solo actualizar si NO fue editado manualmente o si force=true
    if (!empleado._retardos_editado_manual || force) {
        $('#mod-retardos').val(totalDescontado.toFixed(2));
        empleado.retardos = totalDescontado;
        
        // Actualizar sueldo a cobrar en tiempo real
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }
    }
}

// Función para mostrar historial de inasistencias por día
function mostrarHistorialInasistencias(empleado) {
    const $contenedor = $('#contenedor-historial-inasistencias');
    $contenedor.empty();

    if (!Array.isArray(empleado.historial_inasistencias) || empleado.historial_inasistencias.length === 0) {
        $contenedor.html(`
            <div style="text-align: center; padding: 2rem 1rem;">
                <p class="text-muted" style="font-size: 0.85rem; font-style: italic; margin: 0;">No hay inasistencias registradas en el historial</p>
            </div>
        `);
        return;
    }

    // Crear header de la tabla
    let html = `
        <div class="historial-inasistencias-header">
            <div class="historial-header-cell">Día</div>
            <div class="historial-header-cell">Descuento</div>
        </div>
    `;
    
    // Agregar filas de datos
    empleado.historial_inasistencias.forEach((inasistencia, index) => {
        html += `
            <div class="historial-inasistencia-item" data-index="${index}">
                <div>
                    <label class="form-label fw-normal small">Día</label>
                    <input type="text" class="form-control form-control-sm historial-inasistencia-dia" value="${inasistencia.dia}" readonly>
                </div>
                <div>
                    <label class="form-label fw-normal small">Descuento ($)</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-inasistencia-descuento" value="${inasistencia.descuento_inasistencia.toFixed(2)}" data-field="descuento_inasistencia">
                </div>
            </div>
        `;
    });

    $contenedor.html(html);

    // Agregar eventos para actualizar totales cuando cambien los valores
    $contenedor.on('input', '.historial-inasistencia-descuento', function() {
        const $item = $(this).closest('.historial-inasistencia-item');
        const index = parseInt($item.data('index'));
        const descuento = parseFloat($(this).val()) || 0;
        
        // Actualizar el objeto en el array
        if (empleado.historial_inasistencias[index]) {
            empleado.historial_inasistencias[index].descuento_inasistencia = descuento;
        }
        
        // IMPORTANTE: Limpiar la bandera de edición manual para que el historial sobrescriba
        empleado._inasistencias_editado_manual = false;
        
        // Recalcular total general de inasistencias
        recalcularTotalInasistencias(empleado);
    });
}

// Función para recalcular el total de inasistencias basado en el historial
function recalcularTotalInasistencias(empleado, force = false) {
    if (!Array.isArray(empleado.historial_inasistencias)) return;
    
    let totalDescontado = 0;
    empleado.historial_inasistencias.forEach(inasistencia => {
        totalDescontado += parseFloat(inasistencia.descuento_inasistencia) || 0;
    });
    
    // Solo actualizar si NO fue editado manualmente o si force=true
    if (!empleado._inasistencias_editado_manual || force) {
        $('#mod-inasistencias').val(totalDescontado.toFixed(2));
        empleado.inasistencia = totalDescontado;
        
        // Actualizar sueldo a cobrar en tiempo real
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }
    }
}

// Función para mostrar historial de olvidos por día
function mostrarHistorialOlvidos(empleado) {
    const $contenedor = $('#contenedor-historial-olvidos');
    $contenedor.empty();

    if (!Array.isArray(empleado.historial_olvidos) || empleado.historial_olvidos.length === 0) {
        $contenedor.html(`
            <div style="text-align: center; padding: 2rem 1rem;">
                <p class="text-muted" style="font-size: 0.85rem; font-style: italic; margin: 0;">No hay olvidos registrados en el historial</p>
            </div>
        `);
        return;
    }

    // Crear header de la tabla
    let html = `
        <div class="historial-olvidos-header">
            <div class="historial-header-cell">Día</div>
            <div class="historial-header-cell">Fecha</div>
            <div class="historial-header-cell">Descuento</div>
        </div>
    `;
    
    // Agregar filas de datos
    empleado.historial_olvidos.forEach((olvido, index) => {
        html += `
            <div class="historial-olvido-item" data-index="${index}">
                <div>
                    <label class="form-label fw-normal small">Día</label>
                    <input type="text" class="form-control form-control-sm historial-olvido-dia" value="${olvido.dia}" readonly>
                </div>
                <div>
                    <label class="form-label fw-normal small">Fecha</label>
                    <input type="text" class="form-control form-control-sm historial-olvido-fecha" value="${olvido.fecha}" readonly>
                </div>
                <div>
                    <label class="form-label fw-normal small">Descuento ($)</label>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-olvido-descuento" value="${olvido.descuento_olvido.toFixed(2)}" data-field="descuento_olvido">
                </div>
            </div>
        `;
    });

    $contenedor.html(html);

    // Agregar eventos para actualizar totales cuando cambien los valores
    $contenedor.on('input', '.historial-olvido-descuento', function() {
        const $item = $(this).closest('.historial-olvido-item');
        const index = parseInt($item.data('index'));
        const descuento = parseFloat($(this).val()) || 0;
        
        const $descuentoInput = $(this);
        const valorAnterior = parseFloat($descuentoInput.val()) || 0;
        const valorNuevo = parseFloat(descuento);
        
        // Efecto visual cuando cambia el descuento
        if (valorAnterior !== valorNuevo) {
            $descuentoInput.addClass('updated');
            setTimeout(() => {
                $descuentoInput.removeClass('updated');
            }, 500);
        }
        
        // Marcar el item como editando
        $item.addClass('editing');
        
        // Actualizar el objeto en el array
        if (empleado.historial_olvidos[index]) {
            empleado.historial_olvidos[index].descuento_olvido = descuento;
        }
        
        // IMPORTANTE: Limpiar la bandera de edición manual para que el historial sobrescriba
        empleado._checador_editado_manual = false;
        
        // Recalcular total general de olvidos
        recalcularTotalOlvidos(empleado);
    });
    
    // Remover clase de edición cuando se pierde el foco
    $contenedor.on('blur', '.historial-olvido-descuento', function() {
        const $item = $(this).closest('.historial-olvido-item');
        setTimeout(() => {
            if (!$item.find('input:focus').length) {
                $item.removeClass('editing');
            }
        }, 100);
    });
}

// Función para recalcular el total de olvidos basado en el historial
function recalcularTotalOlvidos(empleado, force = false) {
    if (!Array.isArray(empleado.historial_olvidos)) return;
    
    let totalDescontado = 0;
    empleado.historial_olvidos.forEach(olvido => {
        totalDescontado += parseFloat(olvido.descuento_olvido) || 0;
    });
    
    // Solo actualizar si NO fue editado manualmente o si force=true
    if (!empleado._checador_editado_manual || force) {
        $('#mod-checador').val(totalDescontado.toFixed(2));
        empleado.checador = totalDescontado;
        
        // Actualizar sueldo a cobrar en tiempo real
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }
    }
}

// ========================================
// MOSTRAR EVENTOS ESPECIALES EN EL MODAL DE REGISTROS
// ========================================


// Función para mostrar entradas tempranas
function mostrarEntradasTempranas(empleado) {
    const $content = $('#entradas-tempranas-content');
    
    if (!$content.length) return;
    
    $content.empty();

    if (!Array.isArray(empleado.historial_entradas_tempranas) || empleado.historial_entradas_tempranas.length === 0) {
        $content.html('<p class="sin-eventos">No hay entradas tempranas registradas</p>');
        $('#total-entradas-tempranas').text('Total: 0 eventos');
        return;
    }

    let html = empleado.historial_entradas_tempranas.map(entrada => {
        const horas = Math.floor(entrada.minutos_temprano / 60);
        const minutos = entrada.minutos_temprano % 60;
        let tiempo = '';
        
        if (horas > 0) {
            tiempo = `${horas}h ${minutos}min`;
        } else {
            tiempo = `${minutos} min`;
        }
        
        return `
            <div class="evento-item">
                <div class="evento-item-content">
                    <div class="evento-info">
                        <strong class="evento-dia">${entrada.dia}</strong>
                        <span class="evento-fecha">${entrada.fecha}</span>
                        <div class="evento-detalle">
                            <i class="bi bi-clock-fill"></i> Entró: ${entrada.hora_entrada} (Oficial: ${entrada.hora_oficial})
                        </div>
                    </div>
                    <div class="evento-tiempo">
                        ${tiempo} antes
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    $content.html(html);
    $('#total-entradas-tempranas').html(`Total: ${empleado.historial_entradas_tempranas.length} eventos`);
}

// Función para mostrar salidas tardías
function mostrarSalidasTardias(empleado) {
    const $content = $('#salidas-tardias-content');
    
    if (!$content.length) return;
    
    $content.empty();

    if (!Array.isArray(empleado.historial_salidas_tardias) || empleado.historial_salidas_tardias.length === 0) {
        $content.html('<p class="sin-eventos">No hay salidas tardías registradas</p>');
        $('#total-salidas-tardias').text('Total: 0 eventos');
        return;
    }

    let html = empleado.historial_salidas_tardias.map(salida => {
        const horas = Math.floor(salida.minutos_tarde / 60);
        const minutos = salida.minutos_tarde % 60;
        let tiempo = '';
        
        if (horas > 0) {
            tiempo = `${horas}h ${minutos}min`;
        } else {
            tiempo = `${minutos} min`;
        }
        
        return `
            <div class="evento-item">
                <div class="evento-item-content">
                    <div class="evento-info">
                        <strong class="evento-dia">${salida.dia}</strong>
                        <span class="evento-fecha">${salida.fecha}</span>
                        <div class="evento-detalle">
                            <i class="bi bi-clock-fill"></i> Salió: ${salida.hora_salida} (Oficial: ${salida.hora_oficial})
                        </div>
                    </div>
                    <div class="evento-tiempo">
                        ${tiempo} después
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    $content.html(html);
    $('#total-salidas-tardias').html(`Total: ${empleado.historial_salidas_tardias.length} eventos`);
}

// Función para mostrar salidas tempranas
function mostrarSalidasTempranas(empleado) {
    const $content = $('#salidas-tempranas-content');
    
    if (!$content.length) return;
    
    $content.empty();

    if (!Array.isArray(empleado.historial_salidas_tempranas) || empleado.historial_salidas_tempranas.length === 0) {
        $content.html('<p class="sin-eventos">No hay salidas tempranas registradas</p>');
        $('#total-salidas-tempranas').text('Total: 0 eventos');
        return;
    }

    let html = empleado.historial_salidas_tempranas.map(salida => {
        const horas = Math.floor(salida.minutos_temprano / 60);
        const minutos = salida.minutos_temprano % 60;
        let tiempo = '';
        
        if (horas > 0) {
            tiempo = `${horas}h ${minutos}min`;
        } else {
            tiempo = `${minutos} min`;
        }
        
        return `
            <div class="evento-item">
                <div class="evento-item-content">
                    <div class="evento-info">
                        <strong class="evento-dia">${salida.dia}</strong>
                        <span class="evento-fecha">${salida.fecha}</span>
                        <div class="evento-detalle">
                            <i class="bi bi-clock-fill"></i> Salió: ${salida.hora_salida} (Oficial: ${salida.hora_oficial})
                        </div>
                    </div>
                    <div class="evento-tiempo">
                        ${tiempo} antes
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    $content.html(html);
    $('#total-salidas-tempranas').html(`Total: ${empleado.historial_salidas_tempranas.length} eventos`);
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
            return `
                <div class="evento-item">
                    <div class="evento-item-content">
                        <div class="evento-info">
                            <span class="evento-dia">
                                <i class="bi bi-calendar-x"></i> ${nombreDia} ${fecha}
                            </span>
                        </div>
                    </div>
                </div>
            `;
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


// ========================================
// DETECTAR PERMISOS Y COMIDAS AUTOMÁTICAMENTE
// ========================================

/**
 * Función principal que detecta y diferencia automáticamente entre comida y permisos
 * basándose en el horario oficial y los registros del biométrico
 */
function detectarPermisosYComida(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        (departamento.empleados || []).forEach(e => {
            if (String(e.clave).trim() === String(claveEmpleado).trim()) empleado = e;
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    // No guardar el análisis, solo se calcula para mostrar
    const nuevoAnalisis = [];
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diasNormales = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar registros por fecha
    const registrosPorFecha = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;
        if (!registrosPorFecha[reg.fecha]) {
            registrosPorFecha[reg.fecha] = [];
        }
        registrosPorFecha[reg.fecha].push(reg);
    });

    // Procesar cada día con registros
    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDia = registrosPorFecha[fecha];
        
        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const diaSemana = dias[fechaObj.getDay()];
        const diaNormal = diasNormales[fechaObj.getDay()];

        // Buscar horario oficial para este día
        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial) return;

        // Analizar los registros del día
        const analisisDia = analizarRegistrosDia(
            registrosDia,
            horarioOficial,
            fecha,
            diaNormal
        );

        if (analisisDia) {
            nuevoAnalisis.push(analisisDia);
        }
    });

    // No guardar el análisis en el empleado, solo retornar para mostrar
    return nuevoAnalisis;
}

/**
 * Analiza los registros de un día específico y determina qué es comida y qué es permiso
 */
function analizarRegistrosDia(registros, horarioOficial, fecha, diaNormal) {
    // Convertir horarios oficiales a minutos para facilitar comparaciones
    const horaOficial = {
        entrada: convertirHoraAMinutos(horarioOficial.entrada),
        salidaComida: convertirHoraAMinutos(horarioOficial.salida_comida),
        entradaComida: convertirHoraAMinutos(horarioOficial.entrada_comida),
        salida: convertirHoraAMinutos(horarioOficial.salida)
    };

    // Calcular duración oficial de la comida
    const duracionOficialComida = horaOficial.entradaComida - horaOficial.salidaComida;

    // Convertir todos los registros del día a un array de eventos
    const eventos = [];
    registros.forEach(reg => {
        if (reg.entrada && reg.entrada !== '-') {
            eventos.push({
                tipo: 'entrada',
                hora: reg.entrada,
                minutos: convertirHoraAMinutos(reg.entrada)
            });
        }
        if (reg.salida && reg.salida !== '-') {
            eventos.push({
                tipo: 'salida',
                hora: reg.salida,
                minutos: convertirHoraAMinutos(reg.salida)
            });
        }
    });

    // Ordenar eventos por hora
    eventos.sort((a, b) => a.minutos - b.minutos);

    // Analizar la secuencia de eventos
    const analisis = {
        fecha: fecha,
        dia: diaNormal,
        eventos: eventos,
        interpretacion: [],
        permisos: [],
        comida: null,
        escenario: ''
    };

    // Identificar el escenario y clasificar los eventos
    clasificarEventos(eventos, horaOficial, duracionOficialComida, analisis);

    return analisis;
}

/**
 * Clasifica los eventos como entrada, salida, comida o permiso
 */
function clasificarEventos(eventos, horaOficial, duracionOficialComida, analisis) {
    if (eventos.length === 0) return;

    // Variables para rastrear el estado
    let dentroJornada = false;
    let enComida = false;
    let enPermiso = false;
    let inicioPermiso = null;
    let inicioComida = null;

    // Tolerancia de 30 minutos para considerar que un rango es "hora de comida"
    const TOLERANCIA_COMIDA = 30;

    for (let i = 0; i < eventos.length; i++) {
        const evento = eventos[i];
        const siguienteEvento = i < eventos.length - 1 ? eventos[i + 1] : null;

        if (evento.tipo === 'entrada') {
            // Primera entrada del día
            if (!dentroJornada) {
                analisis.interpretacion.push({
                    hora: evento.hora,
                    tipo: 'E',
                    descripcion: 'Entrada a la jornada laboral'
                });
                dentroJornada = true;
            } else {
                // Regreso de algo (comida o permiso)
                if (inicioComida) {
                    // Regreso de comida
                    const duracionComida = evento.minutos - inicioComida.minutos;
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'RC',
                        descripcion: 'Regreso de comida',
                        duracion: `${Math.round(duracionComida)} minutos`
                    });
                    
                    analisis.comida = {
                        salida: inicioComida.hora,
                        entrada: evento.hora,
                        duracion: duracionComida,
                        duracionOficial: duracionOficialComida,
                        excede: duracionComida > (duracionOficialComida + TOLERANCIA_COMIDA)
                    };
                    
                    inicioComida = null;
                    enComida = false;
                } else if (inicioPermiso) {
                    // Regreso de permiso
                    let duracionPermiso = evento.minutos - inicioPermiso.minutos;
                    
                    // Si el permiso cruza la hora de comida oficial, restar la duración de la comida
                    // Verificar si el permiso incluye el rango de comida oficial
                    const inicioPermisoMin = inicioPermiso.minutos;
                    const finPermisoMin = evento.minutos;
                    const inicioComidaOficial = horaOficial.salidaComida;
                    const finComidaOficial = horaOficial.entradaComida;
                    
                    // Si el permiso abarca completamente el horario de comida, restar la duración oficial
                    if (inicioPermisoMin <= inicioComidaOficial && finPermisoMin >= finComidaOficial) {
                        duracionPermiso = duracionPermiso - duracionOficialComida;
                    }
                    
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'RP',
                        descripcion: 'Regreso de permiso',
                        duracion: `${Math.round(duracionPermiso)} minutos`
                    });
                    
                    analisis.permisos.push({
                        salida: inicioPermiso.hora,
                        entrada: evento.hora,
                        duracion: duracionPermiso,
                        duracionReal: evento.minutos - inicioPermiso.minutos,
                        duracionComidaRestada: (inicioPermisoMin <= inicioComidaOficial && finPermisoMin >= finComidaOficial) ? duracionOficialComida : 0
                    });
                    
                    inicioPermiso = null;
                    enPermiso = false;
                }
            }
        } else if (evento.tipo === 'salida') {
            // Determinar si es salida a comida, permiso o salida final
            if (siguienteEvento && siguienteEvento.tipo === 'entrada') {
                // Hay un regreso después, puede ser comida o permiso
                const duracionAusencia = siguienteEvento.minutos - evento.minutos;
                const horaCentro = evento.minutos + (duracionAusencia / 2);
                
                // ¿Está cerca del horario de comida oficial?
                const centroComidaOficial = horaOficial.salidaComida + (duracionOficialComida / 2);
                const distanciaAlCentroComida = Math.abs(horaCentro - centroComidaOficial);
                
                // ¿La duración es similar a la duración oficial de comida?
                const diferenciasDuracion = Math.abs(duracionAusencia - duracionOficialComida);
                
                // Si está cerca del horario de comida Y la duración es similar, es comida
                if (distanciaAlCentroComida < 90 && diferenciasDuracion < (duracionOficialComida + TOLERANCIA_COMIDA)) {
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'SC',
                        descripcion: 'Salida a comida'
                    });
                    inicioComida = evento;
                    enComida = true;
                } else {
                    // Es un permiso
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'SP',
                        descripcion: 'Salida por permiso'
                    });
                    inicioPermiso = evento;
                    enPermiso = true;
                }
            } else {
                // No hay regreso registrado
                // Determinar si salió a comida, permiso o es salida final
                const horaSalida = evento.minutos;
                
                // ¿Está cerca de la hora de salida oficial? (30 minutos antes o CUALQUIER tiempo después)
                const diferenciaSalida = horaSalida - horaOficial.salida;
                
                if (Math.abs(horaSalida - horaOficial.salida) < 30 || diferenciaSalida > 0) {
                    // Es salida final si está dentro de 30 min antes O cualquier tiempo después de la hora oficial
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'SF',
                        descripcion: diferenciaSalida > 60 ? 'Salida final (tardía)' : 'Salida final'
                    });
                } else if (Math.abs(horaSalida - horaOficial.salidaComida) < 30) {
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'SC',
                        descripcion: 'Salida a comida (sin regreso registrado)'
                    });
                    
                    analisis.comida = {
                        salida: evento.hora,
                        entrada: null,
                        duracion: null,
                        sinRegreso: true
                    };
                } else {
                    analisis.interpretacion.push({
                        hora: evento.hora,
                        tipo: 'SP',
                        descripcion: 'Salida por permiso (sin regreso registrado)'
                    });
                    
                    analisis.permisos.push({
                        salida: evento.hora,
                        entrada: null,
                        duracion: null,
                        sinRegreso: true
                    });
                }
            }
        }
    }

    // Identificar el escenario
    identificarEscenario(analisis);
}

/**
 * Identifica cuál de los 10 escenarios se presenta en el análisis
 */
function identificarEscenario(analisis) {
    const secuencia = analisis.interpretacion.map(e => e.tipo).join(' → ');
    
    // Escenarios definidos
    const escenarios = {
        'E → SP → RP → SC → RC → SF': '1. Permiso antes de la comida',
        'E → SC → RC → SP → RP → SF': '2. Permiso después de la comida',
        'E → SP → RP → SF': '3. Permiso que cruza la comida (o sin comida)',
        'E → SP → SC → RC → RP → SF': '4. Permiso antes y comida dentro del permiso',
        'E → SP': '6. Sale a permiso y ya no regresa',
        'E → SC → RC → SP': '7. Sale a permiso después de la comida y no regresa',
        'E → SC': '8. Sale a comer y no regresa',
        'E → SC → RC → SP → RP': '9. Regresa del permiso pero no checa salida',
        'E → SP → RP → SC': '10. Permiso antes de comida y no regresa después'
    };

    // Buscar coincidencia exacta
    if (escenarios[secuencia]) {
        analisis.escenario = escenarios[secuencia];
    } else {
        // Si no hay coincidencia exacta, analizar patrones
        if (secuencia.includes('E') && secuencia.includes('SC') && secuencia.includes('RC') && secuencia.includes('SF')) {
            if (secuencia.indexOf('SP') === -1) {
                analisis.escenario = 'Jornada normal con comida completa';
            }
        } else if (secuencia === 'E → SF') {
            analisis.escenario = 'Jornada corrida sin comida';
        } else {
            analisis.escenario = 'Otro patrón: ' + secuencia;
        }
    }
}

/**
 * Convierte una hora en formato HH:MM a minutos desde medianoche
 */
function convertirHoraAMinutos(hora) {
    if (!hora || hora === '-') return 0;
    const partes = hora.split(':');
    return parseInt(partes[0]) * 60 + parseInt(partes[1]);
}

/**
 * Convierte minutos a formato HH:MM
 */
function convertirMinutosAHora(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Muestra el análisis de permisos y comidas en el modal
 */
function mostrarAnalisisPermisosComida(empleado) {
    const $content = $('#analisis-permisos-comida-content');
    if (!$content.length) return;

    // Calcular el análisis en tiempo real (no guardado)
    const analisisCalculado = detectarPermisosYComida(empleado.clave) || [];

    if (!Array.isArray(analisisCalculado) || analisisCalculado.length === 0) {
        $content.html('<p class="sin-eventos">No hay análisis de permisos y comidas disponible</p>');
        $('#total-analisis-permisos-comida').text('Total: 0 eventos');
        return;
    }

    let html = '';
    analisisCalculado.forEach(dia => {
        html += `
            <div class="analisis-dia mb-3" style="border: 1px solid #e0e0e0; padding: 12px; border-radius: 6px; background: #f9f9f9;">
                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                    ${dia.dia} - ${dia.fecha}
                </div>
                <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 8px; font-style: italic;">
                    ${dia.escenario}
                </div>
                <div style="margin-left: 12px;">
        `;

        dia.interpretacion.forEach(evento => {
            let icono = '';
            let color = '';
            
            switch(evento.tipo) {
                case 'E': 
                    icono = '🟢'; 
                    color = '#27ae60';
                    break;
                case 'SC': 
                    icono = '🍽️'; 
                    color = '#3498db';
                    break;
                case 'RC': 
                    icono = '🍽️'; 
                    color = '#3498db';
                    break;
                case 'SP': 
                    icono = '⏸️'; 
                    color = '#f39c12';
                    break;
                case 'RP': 
                    icono = '▶️'; 
                    color = '#f39c12';
                    break;
                case 'SF': 
                    icono = '🔴'; 
                    color = '#e74c3c';
                    break;
            }

            html += `
                <div style="display: flex; align-items: center; margin-bottom: 4px; padding: 4px 0;">
                    <span style="margin-right: 8px;">${icono}</span>
                    <span style="font-weight: 500; color: ${color}; min-width: 60px;">${evento.hora}</span>
                    <span style="color: #34495e; margin-left: 8px;">${evento.descripcion}</span>
                    ${evento.duracion ? `<span style="color: #95a5a6; margin-left: 8px; font-size: 0.85rem;">(${evento.duracion})</span>` : ''}
                </div>
            `;
        });

        // Mostrar resumen de comida si existe
        if (dia.comida) {
            html += `<hr style="margin: 8px 0; border-color: #e0e0e0;">`;
            html += `<div style="font-size: 0.85rem; color: #2980b9; margin-top: 8px;">`;
            html += `<strong>Comida:</strong> `;
            if (dia.comida.sinRegreso) {
                html += `Salida a ${dia.comida.salida} (sin regreso registrado)`;
            } else {
                html += `${dia.comida.salida} - ${dia.comida.entrada} `;
                html += `(${Math.round(dia.comida.duracion)} min)`;
                if (dia.comida.excede) {
                    html += ` <span style="color: #e74c3c;">⚠️ Excede tiempo oficial</span>`;
                }
            }
            html += `</div>`;
        }

        // Mostrar resumen de permisos si existen
        if (dia.permisos && dia.permisos.length > 0) {
            html += `<div style="font-size: 0.85rem; color: #f39c12; margin-top: 8px;">`;
            html += `<strong>Permisos (${dia.permisos.length}):</strong> `;
            dia.permisos.forEach((permiso, idx) => {
                if (permiso.sinRegreso) {
                    html += `Salida a ${permiso.salida} (sin regreso)`;
                } else {
                    html += `${permiso.salida} - ${permiso.entrada} (${Math.round(permiso.duracion)} min)`;
                    // Si se restó tiempo de comida, mostrar nota explicativa
                    if (permiso.duracionComidaRestada && permiso.duracionComidaRestada > 0) {
                        html += ` <span style="color: #7f8c8d; font-size: 0.8rem;">[Real: ${Math.round(permiso.duracionReal)} min - ${Math.round(permiso.duracionComidaRestada)} min comida]</span>`;
                    }
                }
                if (idx < dia.permisos.length - 1) html += '; ';
            });
            html += `</div>`;
        }

        html += `</div></div>`;
    });

    $content.html(html);
    $('#total-analisis-permisos-comida').text(`Total: ${analisisCalculado.length} días analizados`);
}