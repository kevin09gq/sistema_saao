
/************************************
 * OBTENER EL HORARIO DEL RANCHO 
 ************************************/

function obtenerHorarioRancho(empleado = null) {
    // Obtener el id_area del Palmilla (siempre es 5)
    const id_area = 5;

    $.ajax({
        type: "GET",
        url: "../php/info-rancho.php",
        data: {
            accion: "obtenerHorarioRancho",
            id_area: id_area
        },
        dataType: "json",
        success: function (response) {

            // response.data contiene el horario_jornalero
            if (response.data && response.data.horario_jornalero) {
                const horarioRancho = JSON.parse(response.data.horario_jornalero);
                jsonNominaPalmilla.horarioRancho = horarioRancho;
                // Siempre recalcular después de obtener/actualizar el horario
                calcularSueldoSemanal(empleado);
            }
        },
        error: function (error) {
            console.error("Error al obtener el horario:", error);
        }
    });
}

/************************************
 * CALCULAR SUELDO SEMANAL, PASAJE
 ************************************/

function calcularSueldoSemanal(empleado = null) {
    // Verificar que existe jsonNominaPalmilla
    if (!jsonNominaPalmilla || !jsonNominaPalmilla.departamentos) {
        return;
    }


    // Determinar qué empleados procesar
    let empleadosAProcesar = [];

    if (empleado) {
        // Si se envía un empleado o empleados específicos
        if (Array.isArray(empleado)) {
            empleadosAProcesar = empleado;
        } else {
            empleadosAProcesar = [empleado];
        }
    } else {
        // Si no se envía nada, recorrer todos los del departamento con tipo_horario 2
        jsonNominaPalmilla.departamentos.forEach(departamento => {
            if (!departamento.empleados) return;

            departamento.empleados.forEach(empleado => {
                if (empleado.tipo_horario === 2) {
                    empleadosAProcesar.push(empleado);
                }
            });
        });
    }

    // === PROCESAR EMPLEADOS ===
    empleadosAProcesar.forEach(empleado => {
        // Verificar que sea tipo_horario 2
        if (parseInt(empleado.tipo_horario) !== 2) {
            return;
        }

        // === CONTAR DÍAS DE ASISTENCIA ===
        let diasAsistidos = 0;

        if (empleado.registros && Array.isArray(empleado.registros)) {
            // Agrupar registros por fecha para manejar múltiples marcajes el mismo día
            const registrosPorFecha = {};

            empleado.registros.forEach(registro => {
                const fecha = registro.fecha;
                if (!registrosPorFecha[fecha]) {
                    registrosPorFecha[fecha] = [];
                }
                registrosPorFecha[fecha].push(registro);
            });

            // Contar días donde hubo al menos una entrada válida
            Object.keys(registrosPorFecha).forEach(fecha => {
                const registrosDelDia = registrosPorFecha[fecha];

                // Verificar si hay al menos una entrada válida ese día
                const tieneEntradaValida = registrosDelDia.some(registro =>
                    registro.entrada && registro.entrada.trim() !== ""
                );

                if (tieneEntradaValida) {
                    diasAsistidos++;
                }
            });
        }

        // === ASIGNAR DÍAS TRABAJADOS ===
        // Sumar días detectados por biometrico + días extra manuales - días de descuento
        const diasExtra = parseInt(empleado.dias_extra) || 0;
        const diasMenos = parseInt(empleado.dias_menos) || 0;
        empleado.dias_trabajados = (diasAsistidos + diasExtra) - diasMenos;

        // Evitar días negativos
        if (empleado.dias_trabajados < 0) {
            empleado.dias_trabajados = 0;
        }

        // === CALCULAR SUELDO SEMANAL ===
        const salarioDiario = parseFloat(empleado.salario_diario) || 0;
        const sueldoSemanal = empleado.dias_trabajados * salarioDiario;
        empleado.salario_semanal = sueldoSemanal === 0 ? 0 : sueldoSemanal.toFixed(2);

        // === CALCULAR PASAJE ===
        let pasajeTotal = 0;
        let aplicaPasaje = false;


        // Solo para empleados del tipo_horario 2 
        if (empleado.tipo_horario === 2) {
            const precioPasaje = parseFloat(jsonNominaPalmilla.precio_pasaje) || 0;

            if (empleado.pasaje_override === 'quitar') {
                pasajeTotal = 0;
                delete empleado.pasaje_override; // Eliminar la propiedad para limpiar el estado
            } else if (empleado.pasaje_override === 'agregar') {
                pasajeTotal = (empleado.dias_trabajados || 1) * precioPasaje;
                delete empleado.pasaje_override; // Eliminar la propiedad para limpiar el estado
            } else {
                pasajeTotal = empleado.dias_trabajados * precioPasaje;
            }
            aplicaPasaje = true;
        }

        if (aplicaPasaje) {
            empleado.pasaje = pasajeTotal === 0 ? 0 : pasajeTotal.toFixed(2);
        }

        // === CALCULAR COMIDA ===
        let comidaTotal = 0;
        let aplicaComida = false;

        // Solo para empleados del tipo_horario 2 con id_tipo_puesto diferente de 3
        if (parseInt(empleado.tipo_horario) === 2) {
            const precioComida = parseFloat(jsonNominaPalmilla.pago_comida) || 0;

            if (empleado.comida_override === 'quitar') {
                comidaTotal = 0;
                delete empleado.comida_override; // Eliminar la propiedad para limpiar el estado
            } else if (empleado.comida_override === 'agregar') {
                comidaTotal = (empleado.dias_trabajados || 1) * precioComida;
                delete empleado.comida_override; // Eliminar la propiedad para limpiar el estado
            } else {
                comidaTotal = empleado.dias_trabajados * precioComida;
            }
            aplicaComida = true;
        }

        if (aplicaComida) {
            empleado.comida = comidaTotal === 0 ? 0 : comidaTotal.toFixed(2);
        }

        // === CALCULAR TARDEADAS ===

        // calcular y asignar tardeadas
        const diasTardeados = calcularTardeadas(empleado);
        const montoTardeada = parseFloat(jsonNominaPalmilla.pago_tardeada) || 0;

        const totalTardeada = diasTardeados * montoTardeada;
        empleado.tardeada = totalTardeada === 0 ? 0 : totalTardeada.toFixed(2);
        // Recalcular el total extra de forma limpia (tardeada + percepciones_extra)
        if (typeof calcularTotalExtra === 'function') {
            calcularTotalExtra(empleado);
        } else {
            // Fallback si no está cargado el script del modal
            empleado.sueldo_extra_total = parseFloat(empleado.tardeada) || 0;
        }

    });

    actualizarCabeceraNomina(jsonNominaPalmilla);
    if (typeof aplicarFiltrosActuales === 'function') {
        aplicarFiltrosActuales();
    }
    saveNomina(jsonNominaPalmilla);
}


/************************************
 * CALCULAR TARDEADAS 
 ************************************/

// calcula cuántos días el empleado se pasó más de 45 min de la hora de salida
// usa jsonNominaPalmilla.horarioRancho que es un arreglo de objetos {dia,entrada,salida,...}
function calcularTardeadas(empleado) {
    if (!empleado.registros || !jsonNominaPalmilla.horarioRancho) return 0;

    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    let contador = 0;

    // agrupar por fecha
    const regs = {};
    empleado.registros.forEach(r => {
        if (!regs[r.fecha]) regs[r.fecha] = [];
        regs[r.fecha].push(r);
    });

    Object.keys(regs).forEach(fecha => {
        const ult = regs[fecha][regs[fecha].length - 1];
        // tomar la última hora registrada (entrada o salida)
        const horaMarcaje = ult.salida || ult.entrada;
        if (!horaMarcaje) return;

        // convertir dd/mm/yyyy a fecha
        const p = fecha.split('/');
        const dt = new Date(p[2], p[1] - 1, p[0]);
        const dia = diasSemana[dt.getDay()];

        const horarioDia = jsonNominaPalmilla.horarioRancho.find(h => h.dia === dia);
        if (!horarioDia || !horarioDia.salida) return;

        // comparar la última marca con la hora de salida del horario
        const [hE, mE] = horaMarcaje.split(':').map(Number);
        const [hH, mH] = horarioDia.salida.split(':').map(Number);
        const diff = hE * 60 + mE - (hH * 60 + mH);
        if (diff > 45) contador++;
    });

    return contador;
}
