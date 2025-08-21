/*
 * ================================================================
 * MÓDULO DE BÚSQUEDA Y CARGA DE DATOS DEL EMPLEADO
 * ================================================================
 * Este módulo se encarga de:
 * - Buscar empleado específico por clave en el JSON global
 * ================================================================
 */

function buscarDatos(claveEmpleado) {
    // Busca el empleado en jsonGlobal usando la clave
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    let empleadoEncontrado = null;

    // Recorre todos los departamentos y empleados
    window.jsonGlobal.departamentos.forEach(depto => {
        (depto.empleados || []).forEach(emp => {
            // Compara la clave como string o número
            if (String(emp.clave) === String(claveEmpleado)) {
                empleadoEncontrado = emp;
            }
        });
    });
    
    if (empleadoEncontrado) {
        establecerDatosTrabajador(empleadoEncontrado.clave, empleadoEncontrado.nombre);
        establecerDatosConceptos(empleadoEncontrado.conceptos || []);
        llenarTablaRegistros(empleadoEncontrado.registros || []);
    }
}

/*
 * ================================================================
 * MÓDULO DE CONFIGURACIÓN DE DATOS EN MODAL
 * ================================================================
 * Este módulo se encarga de:
 * - Establecer datos básicos del trabajador (clave y nombre) en el modal
 * - Configurar valores de conceptos (ISR, IMSS, INFONAVIT) en formularios
 * - Manejar eventos de actualización en tiempo real de conceptos
 * - Sincronizar cambios con el JSON global del sistema
 * ================================================================
 */

function establecerDatosTrabajador(clave, nombre) {
    $('#campo-clave').text(clave);
    $('#campo-nombre').text(nombre);
}

function establecerDatosConceptos(conceptos) {
    // Limpiar todos los inputs antes de establecer nuevos valores
    $("#mod-isr").val(0);
    $("#mod-imss").val(0);
    $("#mod-infonavit").val(0);

    // Buscar cada concepto por su código y establecer su valor en el input correspondiente
    conceptos.forEach(concepto => {
        if (concepto.codigo === '45') {
            $("#mod-isr").val(concepto.resultado);
        }
        if (concepto.codigo === '52') {
            $("#mod-imss").val(concepto.resultado);
        }
        if (concepto.codigo === '16') { // Ajusta este código según tu JSON
            $("#mod-infonavit").val(concepto.resultado);
        }
    });

    // Agregar eventos para actualizar conceptos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-isr").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const isr = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '45', isr); // 45 es el código del ISR
    });

    $("#mod-imss").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const imss = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '52', imss); // 52 es el código del IMSS
    });

    $("#mod-infonavit").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const infonavit = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '16', infonavit); // 16 es el código del INFONAVIT
    });

}


function llenarTablaRegistros(registros) {
    const tbody = $('#tabla-registros-body');
    tbody.empty();
    
    if (!registros || registros.length === 0) {
        tbody.append('<tr><td colspan="7" class="text-center">No hay registros disponibles</td></tr>');
        return;
    }
    
    // Función para obtener día de la semana
    function obtenerDiaSemana(fecha) {
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        return dias[fechaObj.getDay()];
    }
    
    // Función para convertir hora a minutos
    function horaAMinutos(hora) {
        if (!hora || hora === "" || hora === "00:00") return 0;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }
    
    // Función para convertir minutos a hora
    function minutosAHora(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    
    // Obtener horario oficial para descuento de comida
    function obtenerHorarioOficial(fecha) {
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = dias[fechaObj.getDay()];
        
        if (window.horariosSemanalesActualizados && window.horariosSemanalesActualizados.semana) {
            return window.horariosSemanalesActualizados.semana[diaSemana];
        }
        return null;
    }
    
    // Agrupar registros por fecha
    const registrosPorFecha = {};
    registros.forEach(registro => {
        if (registro.fecha && (registro.entrada || registro.salida)) {
            if (!registrosPorFecha[registro.fecha]) {
                registrosPorFecha[registro.fecha] = [];
            }
            registrosPorFecha[registro.fecha].push(registro);
        }
    });
    
    let totalHoras = 0;
    let totalMinutos = 0;
    
    // Procesar cada fecha
    Object.keys(registrosPorFecha).sort().forEach(fecha => {
        const registrosDia = registrosPorFecha[fecha];
        const diaSemana = obtenerDiaSemana(fecha);
        const horarioOficial = obtenerHorarioOficial(fecha);
        
        // Calcular tiempo trabajado del día
        let minutosDia = 0;
        
        // Si el horario oficial tiene totalHoras definido y no tiene horarios de comida específicos,
        // usar directamente el totalHoras del horario oficial
        if (horarioOficial && 
            horarioOficial.totalHoras && 
            horarioOficial.totalHoras !== "00:00" &&
            (horarioOficial.salidaComida === "00:00" || horarioOficial.entradaComida === "00:00")) {
            
            minutosDia = horaAMinutos(horarioOficial.totalHoras);
        } else {
            // Calcular sumando períodos trabajados
            registrosDia.forEach(registro => {
                if (registro.entrada && registro.salida && 
                    registro.entrada !== "00:00" && registro.salida !== "00:00") {
                    const minutosEntrada = horaAMinutos(registro.entrada);
                    const minutosSalida = horaAMinutos(registro.salida);
                    minutosDia += (minutosSalida - minutosEntrada);
                }
            });
            
            // Descontar tiempo de comida según horario oficial
            if (horarioOficial && horarioOficial.horasComida && horarioOficial.horasComida !== "00:00") {
                const minutosComida = horaAMinutos(horarioOficial.horasComida);
                minutosDia -= minutosComida;
            }
        }
        
        if (minutosDia < 0) minutosDia = 0;
        
        const horasDia = Math.floor(minutosDia / 60);
        const minutosDiaResto = minutosDia % 60;
        
        totalHoras += horasDia;
        totalMinutos += minutosDiaResto;
        
        // Obtener registros para mostrar en tabla
        const entrada = registrosDia[0]?.entrada || '';
        const salida = registrosDia[registrosDia.length - 1]?.salida || '';
        
        // Para horarios sin comida definida, solo mostrar entrada y salida
        let salidaComida = '';
        let entradaComida = '';
        
        // Solo mostrar horarios de comida si están definidos en el horario oficial
        if (horarioOficial && 
            horarioOficial.salidaComida !== "00:00" && 
            horarioOficial.entradaComida !== "00:00") {
            salidaComida = registrosDia.find(r => r.salida && r !== registrosDia[registrosDia.length - 1])?.salida || '';
            entradaComida = registrosDia.find(r => r.entrada && r !== registrosDia[0])?.entrada || '';
        }
        
        const fila = `
            <tr>
                <td class="celda-dia-registros">${diaSemana}</td>
                <td class="celda-tiempo-registros">${entrada === "00:00" ? '' : entrada}</td>
                <td class="celda-tiempo-registros">${salidaComida === "00:00" ? '' : salidaComida}</td>
                <td class="celda-tiempo-registros">${entradaComida === "00:00" ? '' : entradaComida}</td>
                <td class="celda-tiempo-registros">${salida === "00:00" ? '' : salida}</td>
                <td class="celda-tiempo-registros">${horasDia}</td>
                <td class="celda-tiempo-registros">${minutosDiaResto}</td>
            </tr>
        `;
        tbody.append(fila);
    });
    
    // Ajustar minutos totales
    const horasExtra = Math.floor(totalMinutos / 60);
    totalHoras += horasExtra;
    totalMinutos = totalMinutos % 60;
    
    // Actualizar totales en el pie de tabla
    $('.celda-total-horas-registros').text(totalHoras);
    $('.celda-total-minutos-registros').text(totalMinutos);
}
