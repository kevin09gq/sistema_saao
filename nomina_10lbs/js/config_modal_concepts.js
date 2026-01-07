// Variable global para guardar la fila seleccionada
var filaSeleccionada = null;

// Función para calcular Total Percepciones
function calcularTotalPercepciones(empleado) {
    const sueldo = parseFloat(empleado.sueldo_semanal) || 0;
    const extras = parseFloat(empleado.sueldo_extra_total) || 0;
    return (sueldo + extras).toFixed(2);
}

// Función para calcular Total Deducciones
function calcularTotalDeducciones(empleado) {
    // Obtener valores de conceptos
    const buscarConcepto = (codigo) => {
        if (!Array.isArray(empleado.conceptos)) return 0;
        const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
        return concepto ? parseFloat(concepto.resultado) || 0 : 0;
    };

    const retardos = parseFloat(empleado.retardos) || 0;
    const isr = buscarConcepto('45');
    const imss = buscarConcepto('52');
    const ajusteSub = parseFloat(empleado.ajuste_sub) || 0;
    const infonavit = buscarConcepto('16');
    const permiso = parseFloat(empleado.permiso) || 0;
    const inasistencia = parseFloat(empleado.inasistencia) || 0;
    const uniformes = parseFloat(empleado.uniformes) || 0;
    const checador = parseFloat(empleado.checador) || 0;

    const total = retardos + isr + imss + ajusteSub + infonavit + permiso + inasistencia + uniformes + checador;
    return total.toFixed(2);
}



// ========================================
// MENÚ CONTEXTUAL EN LA TABLA DE NÓMINA
// ========================================

// Función simple: muestra el menú contextual cuando se hace click en cualquier parte de la tabla
function mostrarContextMenu() {
    var $menu = $('#context-menu');
    if ($menu.length === 0) return; // no hay menú en el DOM

    // Adjunta un manejador simple: al hacer click derecho (contextmenu) en el cuerpo de la tabla, posiciona y muestra el menú
    $('#tabla-nomina-body').on('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Guardar la fila sobre la que se hizo clic
        filaSeleccionada = $(e.target).closest('tr');

        var x = e.pageX;
        var y = e.pageY;
        $menu.css({ top: y + 'px', left: x + 'px' }).show();
    });
}

// Función simple: al hacer click en una opción del menú contextual, mostrar el modal
function bindContextMenuToModal() {
    var $menu = $('#context-menu');
    if ($menu.length === 0) return;

    $menu.on('click', '.cm-item', function (e) {
        e.preventDefault();

        // Obtener la clave de la fila seleccionada
        if (filaSeleccionada && filaSeleccionada.length > 0) {
            var clave = filaSeleccionada.data('clave');
            console.log(clave);


            // Cargar los datos del empleado en el modal
            if (typeof cargarData === 'function' && jsonNominaConfianza) {
                cargarData(jsonNominaConfianza, clave);
            }
        } else {

        }

        // Mostrar modal de detalles
        $('#modal-detalles').show();
        // Ocultar el menú contextual
        $menu.hide();
    });
}

// ========================================
// CERRAR EL MODAL Y LIMPIAR CAMPOS
// ========================================
// Función para cerrar el modal
function cerrarModalDetalles() {
    $("#cerrar-modal-detalles").click(function (e) {
        e.preventDefault();
        $('#modal-detalles').hide();
        limpiarModalDetalles();
    });
}

// Función para limpiar los campos del modal
function limpiarModalDetalles() {
    // Limpiar campos de información básica
    $('#campo-nombre').text('');
    $('#campo-clave').text('');
    $('#nombre-empleado-modal').text('');

    // Limpiar campos de percepciones
    $('#mod-sueldo-semanal').val('');
    $('#mod-vacaciones').val('');

    // Limpiar campos de conceptos
    $('#mod-isr').val('');
    $('#mod-imss').val('');
    $('#mod-infonavit').val('');

    // Limpiar campos de deducciones
    $('#mod-tarjeta').val('');
    $('#mod-prestamo').val('');
    $('#mod-uniformes').val('');
    $('#mod-checador').val('');
    $('#mod-retardos').val('');
    $('#mod-inasistencias').val('');
    $('#mod-permiso').val('');

    // Limpiar tabla de registros biométricos
    $('#tabla-checador tbody').empty();

    // Limpiar tabla de horarios oficiales
    $('#horarios-oficiales-body').empty();

    // Limpiar conceptos personalizados
    $('#contenedor-conceptos-adicionales').empty();

    // Limpiar deducciones personalizadas
    $('#contenedor-deducciones-adicionales').empty();

    // Limpiar eventos especiales con mensajes de "Sin eventos"
    $('#olvidos-checador-content').html('<p class="sin-eventos">No hay olvidos registrados</p>');
    $('#retardos-content').html('<p class="sin-eventos">No hay retardos registrados</p>');
    $('#faltas-content').html('<p class="sin-eventos">No hay inasistencias registradas</p>');

    // Limpiar totales de eventos especiales
    $('#total-olvidos-checador').text('Total: 0 eventos');
    $('#total-retardos').text('Total: 0 eventos');
    $('#total-faltas').text('Total: 0 días');

    // Limpiar historial de retardos
    $('#contenedor-historial-retardos').empty();

    // Limpiar campo de sueldo a cobrar
    $('#mod-sueldo-a-cobrar').val('');
}

// ========================================
// FUNCIONES PARA LA FUNCIONALIDAD DE LOS INPUTS EN EL MODAL
// ========================================

// Función simple para actualizar automáticamente el Total Extra
function actualizarTotalExtra() {
    let total = 0;

    // Sumar vacaciones
    total += parseFloat($('#mod-vacaciones').val()) || 0;

    // Sumar todos los conceptos personalizados (solo los valores numéricos)
    $('#contenedor-conceptos-adicionales .concepto-personalizado input[type="number"]').each(function () {
        total += parseFloat($(this).val()) || 0;
    });

    // Actualizar el campo total con 2 decimales
    $('#mod-total-extra').val(total.toFixed(2));
}


// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros del checador
    $('#btn-biometrico').on('click', function () {
        // Mostrar tabla de checador
        $('#tabla-checador').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-horarios-oficiales').attr('hidden', true);

        // Marcar botón como activo
        $('#btn-biometrico').addClass('active');
        $('#btn-horarios-oficiales').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-horarios-oficiales').on('click', function () {
        // Ocultar tabla de checador
        $('#tabla-checador').attr('hidden', true);
        // Mostrar tabla de horarios oficiales
        $('#tabla-horarios-oficiales').removeAttr('hidden');

        // Marcar botón como activo
        $('#btn-horarios-oficiales').addClass('active');
        $('#btn-biometrico').removeClass('active');
    });
}

// ========================================
// EDITAR HORAS EN TABLA HORARIOS OFICIALES
// ========================================
function hacerHorasEditables() {
    // Hacer que las celdas de hora sean editables al hacer clic
    $(document).on('click', '#horarios-oficiales-body td', function () {
        const $celda = $(this);
        const indiceCelda = $celda.index(); // Obtener el índice de la columna

        // NO permitir editar la primera columna (Día)
        if (indiceCelda === 0) return;

        const textoActual = $celda.text().trim();

        // Si ya es un input, no hacer nada
        if ($celda.find('input').length > 0) return;

        // Crear input temporal
        const $input = $('<input type="time" class="form-control form-control-sm">');
        $input.val(textoActual !== '-' ? textoActual : '');

        // Reemplazar texto con input
        $celda.html($input);
        $input.focus();

        // Al salir del input (blur), validar y guardar
        $input.on('blur', function () {
            const valorIngresado = $input.val();

            if (valorIngresado) {
                // Validar formato HH:MM y rango
                if (validarHora(valorIngresado)) {
                    $celda.text(valorIngresado);
                } else {
                    alert('⚠️ Hora inválida. Use formato HH:MM (00:00 - 23:59)');
                    $celda.text(textoActual);
                }
            } else {
                $celda.text('-');
            }
        });

        // Al presionar Enter, guardar
        $input.on('keypress', function (e) {
            if (e.which === 13) { // Enter
                $input.blur();
            }
        });
    });
}

// Validar formato y rango de hora
function validarHora(hora) {
    // Validar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(hora);
}



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
            console.log(`Retardo ${diferencia} min | ${fecha} entrada ${primeraEntrada.entrada} vs oficial ${horarioOficial.entrada} (${diaSemana})`);
            
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
                console.log(`Inasistencia detectada: ${diaSemana} - No hay registros para un día laboral`);
            }
        }
    });

    // Guardar el número de inasistencias en el empleado
    empleado.inasistencias_contadas = inasistencias;

    // Calcular el descuento por inasistencias: cantidad * sueldo_diario
    let descuentoInasistencias = 0;
    if (inasistencias > 0 && empleado.sueldo_diario) {
        descuentoInasistencias = (inasistencias * parseFloat(empleado.sueldo_diario)).toFixed(2);
    }

    // Actualizar el campo de inasistencias SOLO si está vacío (permitir edición manual)
    if (!$('#mod-inasistencias').val() || $('#mod-inasistencias').val() === '0') {
        $('#mod-inasistencias').val(descuentoInasistencias);
    }

    // Guardar el descuento en la propiedad inasistencia del empleado
    empleado.inasistencia = parseFloat($('#mod-inasistencias').val()) || 0;

    console.log(`Total inasistencias encontradas: ${inasistencias} | Descuento: ${descuentoInasistencias}`);
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

    let olvidos = 0;

    // Revisar cada registro
    empleado.registros.forEach(reg => {
        // Verificar si tiene entrada o salida (con datos válidos)
        const tieneEntrada = reg.entrada && reg.entrada !== '' && reg.entrada !== '-';
        const tieneSalida = reg.salida && reg.salida !== '' && reg.salida !== '-';

        // Olvido: tiene UNO pero NO el otro (registro incompleto)
        if ((tieneEntrada && !tieneSalida) || (!tieneEntrada && tieneSalida)) {
            olvidos++;
            console.log(`Olvido: ${reg.fecha} - Entrada: ${reg.entrada || 'vacío'}, Salida: ${reg.salida || 'vacío'}`);
        }
    });

    // Calcular el descuento por olvidos: cantidad * 20 pesos
    let descuentoOlvidos = (olvidos * 20).toFixed(2);

    // Guardar olvidos en las propiedades del empleado
    empleado.olvidos_checador = olvidos;

    // Actualizar el campo en el modal SOLO si está vacío (permitir edición manual)
    if ($('#mod-checador').length && !$('#mod-checador').val() || $('#mod-checador').val() === '') {
        $('#mod-checador').val(descuentoOlvidos);
    }
    // Guardar el valor del input (respeta edición manual)
    empleado.checador = parseFloat($('#mod-checador').val()) || 0;

    console.log(`Total olvidos de checador: ${olvidos} | Descuento: ${descuentoOlvidos}`);
}

function detectarPermisos(claveEmpleado) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Buscar el empleado por clave
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        (departamento.empleados || []).forEach(e => {
            if (String(e.clave).trim() === String(claveEmpleado).trim()) empleado = e;
        });
    });

    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return;

    let horasPermiso = 0;

    // Agrupar registros por fecha
    const registrosPorFecha = {};
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;

        if (!registrosPorFecha[reg.fecha]) {
            registrosPorFecha[reg.fecha] = [];
        }
        registrosPorFecha[reg.fecha].push(reg);
    });

    // Días de la semana
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    // Analizar cada día
    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDia = registrosPorFecha[fecha];

        // Obtener día de la semana
        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];

        // Buscar horario oficial para este día
        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial) return;

        // Ordenar registros por hora (entrada/salida cronológicamente)
        const todosChequeos = [];
        registrosDia.forEach(reg => {
            if (reg.entrada && reg.entrada !== '' && reg.entrada !== '-') {
                const [h, m] = reg.entrada.split(':');
                todosChequeos.push({
                    tipo: 'entrada',
                    hora: reg.entrada,
                    minutos: parseInt(h) * 60 + parseInt(m)
                });
            }
            if (reg.salida && reg.salida !== '' && reg.salida !== '-') {
                const [h, m] = reg.salida.split(':');
                todosChequeos.push({
                    tipo: 'salida',
                    hora: reg.salida,
                    minutos: parseInt(h) * 60 + parseInt(m)
                });
            }
        });

        // Ordenar por minutos
        todosChequeos.sort((a, b) => a.minutos - b.minutos);

        // Analizar intervalos entre chequeos
        // Patrón esperado: entrada, salida a comer (1h-1.5h después), regreso de comer (1h después), salida final
        for (let i = 0; i < todosChequeos.length - 1; i++) {
            const actual = todosChequeos[i];
            const siguiente = todosChequeos[i + 1];

            const intervalo = siguiente.minutos - actual.minutos;

            // Si el intervalo entre salida y entrada es mayor a 2 horas, podría ser permiso
            // (período normal de comida es aproximadamente 1 hora)
            if (actual.tipo === 'salida' && siguiente.tipo === 'entrada' && intervalo > 120) {
                const horasExceso = (intervalo - 60) / 60; // Restar 1 hora de comida normal
                horasPermiso += horasExceso;
                console.log(`Posible permiso en ${fecha}: ${actual.hora} a ${siguiente.hora} = ${intervalo} min (exceso: ${horasExceso.toFixed(2)}h)`);
            }

            // También detectar si faltan chequeos (solo hay 2 registros en lugar de 4)
            // y hay un intervalo muy largo entre entrada y salida
            if (todosChequeos.length === 2 && actual.tipo === 'entrada' && siguiente.tipo === 'salida') {
                // Calcular horas esperadas según horario oficial
                if (horarioOficial.entrada && horarioOficial.salida) {
                    const [hEntrada, mEntrada] = horarioOficial.entrada.split(':');
                    const [hSalida, mSalida] = horarioOficial.salida.split(':');
                    const minutosEsperados = (parseInt(hSalida) * 60 + parseInt(mSalida)) - (parseInt(hEntrada) * 60 + parseInt(mEntrada));
                    
                    // Si trabajó menos horas de las esperadas, podría ser permiso
                    if (intervalo < minutosEsperados - 60) { // Con margen de 1 hora
                        const horasFaltantes = (minutosEsperados - intervalo) / 60;
                        console.log(`Posible permiso por horas faltantes en ${fecha}: ${horasFaltantes.toFixed(2)}h`);
                    }
                }
            }
        }
    });

    // Calcular descuento por permisos
    // Puede ser por horas o un monto fijo, ajustar según tu lógica de negocio
    let descuentoPermisos = 0;
    if (horasPermiso > 0 && empleado.sueldo_diario) {
        // Calcular descuento proporcional: (sueldo_diario / 8 horas) * horas de permiso
        const sueldoPorHora = parseFloat(empleado.sueldo_diario) / 8;
        descuentoPermisos = (horasPermiso * sueldoPorHora).toFixed(2);
    }

    // Guardar las horas de permiso en el empleado
    empleado.horas_permiso = horasPermiso.toFixed(2);

    // Actualizar el campo de permisos SOLO si está vacío (permitir edición manual)
    if ($('#mod-permiso').length && (!$('#mod-permiso').val() || $('#mod-permiso').val() === '0')) {
        $('#mod-permiso').val(descuentoPermisos);
    }

    // Guardar el descuento en la propiedad permiso del empleado
    empleado.permiso = parseFloat(descuentoPermisos) || 0;

    console.log(`Total horas de permiso detectadas: ${horasPermiso.toFixed(2)}h | Descuento: ${descuentoPermisos}`);
}

// ========================================
// DETECTAR EVENTOS AUTOMÁTICOS PARA TODOS LOS EMPLEADOS
// ========================================
function detectarEventosAutomaticos(jsonNomina) {
    if (!jsonNomina || !Array.isArray(jsonNomina.departamentos)) return;

    console.log('🔍 Iniciando detección automática de eventos...');

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

            // Detectar permisos
            if (typeof detectarPermisosAutomatico === 'function') {
                const resultadoPermisos = detectarPermisosAutomatico(empleado);
                if (resultadoPermisos > 0) totalPermisos++;
            }
        });
    });

    console.log(`✅ Detección completada para ${totalEmpleados} empleados:`);
    console.log(`   - Retardos detectados: ${totalRetardos}`);
    console.log(`   - Inasistencias detectadas: ${totalInasistencias}`);
    console.log(`   - Olvidos de checador detectados: ${totalOlvidos}`);
    console.log(`   - Permisos detectados: ${totalPermisos}`);
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
            const descuentoPorMinuto = 0;
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
            }
        }
    });

    empleado.inasistencias_contadas = inasistencias;

    let descuentoInasistencias = 0;
    if (inasistencias > 0 && empleado.sueldo_diario) {
        descuentoInasistencias = (inasistencias * parseFloat(empleado.sueldo_diario)).toFixed(2);
    }

    empleado.inasistencia = parseFloat(descuentoInasistencias) || 0;
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

// Versión automática de detectarPermisos (sin dependencia del modal)
function detectarPermisosAutomatico(empleado) {
    if (!empleado || !Array.isArray(empleado.registros) || !Array.isArray(empleado.horario_oficial)) return 0;

    let horasPermiso = 0;
    const registrosPorFecha = {};
    
    empleado.registros.forEach(reg => {
        if (!reg.fecha) return;
        if (!registrosPorFecha[reg.fecha]) {
            registrosPorFecha[reg.fecha] = [];
        }
        registrosPorFecha[reg.fecha].push(reg);
    });

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDia = registrosPorFecha[fecha];
        const [dia, mes, anio] = fecha.split('/');
        const diaSemana = dias[new Date(anio, mes - 1, dia).getDay()];

        const horarioOficial = empleado.horario_oficial.find(x =>
            String(x.dia || '').toUpperCase().trim() === diaSemana
        );

        if (!horarioOficial) return;

        const todosChequeos = [];
        registrosDia.forEach(reg => {
            if (reg.entrada && reg.entrada !== '' && reg.entrada !== '-') {
                const [h, m] = reg.entrada.split(':');
                todosChequeos.push({
                    tipo: 'entrada',
                    hora: reg.entrada,
                    minutos: parseInt(h) * 60 + parseInt(m)
                });
            }
            if (reg.salida && reg.salida !== '' && reg.salida !== '-') {
                const [h, m] = reg.salida.split(':');
                todosChequeos.push({
                    tipo: 'salida',
                    hora: reg.salida,
                    minutos: parseInt(h) * 60 + parseInt(m)
                });
            }
        });

        todosChequeos.sort((a, b) => a.minutos - b.minutos);

        for (let i = 0; i < todosChequeos.length - 1; i++) {
            const actual = todosChequeos[i];
            const siguiente = todosChequeos[i + 1];
            const intervalo = siguiente.minutos - actual.minutos;

            if (actual.tipo === 'salida' && siguiente.tipo === 'entrada' && intervalo > 120) {
                const horasExceso = (intervalo - 60) / 60;
                horasPermiso += horasExceso;
            }
        }
    });

    let descuentoPermisos = 0;
    if (horasPermiso > 0 && empleado.sueldo_diario) {
        const sueldoPorHora = parseFloat(empleado.sueldo_diario) / 8;
        descuentoPermisos = (horasPermiso * sueldoPorHora).toFixed(2);
    }

    empleado.horas_permiso = horasPermiso.toFixed(2);
    empleado.permiso = parseFloat(descuentoPermisos) || 0;

    return empleado.permiso;
}