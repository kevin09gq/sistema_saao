
/************************************
 * OBTENER EL HORARIO DEL RANCHO 
 ************************************/

function obtenerHorarioRancho(empleado = null) {
    // Obtener el id_area del Huasteca (siempre es 4)
    const id_area = 4;

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
                jsonNominaHuasteca.horarioRancho = horarioRancho;
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

function actualizarPercepcionExtra(empleado, nombreConcepto, cantidad) {
    if (!Array.isArray(empleado.percepciones_extra)) {
        empleado.percepciones_extra = [];
    }
    const idx = empleado.percepciones_extra.findIndex(p => p.nombre === nombreConcepto);
    if (cantidad > 0) {
        if (idx !== -1) {
            empleado.percepciones_extra[idx].cantidad = parseFloat(cantidad.toFixed(2));
        } else {
            empleado.percepciones_extra.push({
                nombre: nombreConcepto,
                cantidad: parseFloat(cantidad.toFixed(2))
            });
        }
    } else {
        if (idx !== -1) {
            empleado.percepciones_extra.splice(idx, 1);
        }
    }
}

function calcularSueldoSemanal(empleado = null) {
    // Verificar que existe jsonNominaHuasteca
    if (!jsonNominaHuasteca || !jsonNominaHuasteca.departamentos) {
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
        // Si no se envía nada, recorrer todos los del departamento con tipo_horario 2 o 1
        jsonNominaHuasteca.departamentos.forEach(departamento => {
            if (!departamento.empleados) return;

            departamento.empleados.forEach(empleado => {
                if (empleado.tipo_horario === 2 || empleado.tipo_horario === 1) {
                    empleadosAProcesar.push(empleado);
                }
            });
        });
    }

    // === PROCESAR EMPLEADOS ===
    empleadosAProcesar.forEach(empleado => {
        const tipoHorario = parseInt(empleado.tipo_horario);
        // Verificar que sea tipo_horario 2 o 1
        if (tipoHorario !== 2 && tipoHorario !== 1) {
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
        const totalDiasTrabajados = Math.max(0, (diasAsistidos + diasExtra) - diasMenos);

        if (tipoHorario === 2) {
            empleado.dias_trabajados = totalDiasTrabajados;

            // === CALCULAR SUELDO SEMANAL ===
            const salarioDiario = parseFloat(empleado.salario_diario) || 0;
            const sueldoSemanal = totalDiasTrabajados * salarioDiario;
            empleado.salario_semanal = parseFloat(sueldoSemanal === 0 ? 0 : sueldoSemanal.toFixed(2));
        }

        // === CALCULAR PASAJE ===
        let pasajeTotal = 0;
        let aplicaPasaje = false;
        

        if (tipoHorario === 2) {
            const precioPasaje = parseFloat(jsonNominaHuasteca.precio_pasaje) || 0;

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
        } else if (tipoHorario === 1) {
            const precioPasaje = parseFloat(jsonNominaHuasteca.precio_pasaje) || 0;
            const tienePasajeExtra = Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.some(p => p.nombre === 'Pasaje');

            if (empleado.pasaje_override === 'quitar') {
                pasajeTotal = 0;
                delete empleado.pasaje_override;
                actualizarPercepcionExtra(empleado, 'Pasaje', 0);
            } else if (empleado.pasaje_override === 'agregar') {
                pasajeTotal = (totalDiasTrabajados || 1) * precioPasaje;
                delete empleado.pasaje_override;
                actualizarPercepcionExtra(empleado, 'Pasaje', pasajeTotal);
            } else if (tienePasajeExtra) {
                pasajeTotal = totalDiasTrabajados * precioPasaje;
                actualizarPercepcionExtra(empleado, 'Pasaje', pasajeTotal);
            }
        }

        if (aplicaPasaje) {
            empleado.pasaje = parseFloat(pasajeTotal === 0 ? 0 : pasajeTotal.toFixed(2));
        }

        // === CALCULAR COMIDA ===
        let comidaTotal = 0;
        let aplicaComida = false;

        if (tipoHorario === 2) {
            const precioComida = parseFloat(jsonNominaHuasteca.pago_comida) || 0;

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
        } else if (tipoHorario === 1) {
            const precioComida = parseFloat(jsonNominaHuasteca.pago_comida) || 0;
            const tieneComidaExtra = Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.some(p => p.nombre === 'Comida');

            if (empleado.comida_override === 'quitar') {
                comidaTotal = 0;
                delete empleado.comida_override;
                actualizarPercepcionExtra(empleado, 'Comida', 0);
            } else if (empleado.comida_override === 'agregar') {
                comidaTotal = (totalDiasTrabajados || 1) * precioComida;
                delete empleado.comida_override;
                actualizarPercepcionExtra(empleado, 'Comida', comidaTotal);
            } else if (tieneComidaExtra) {
                comidaTotal = totalDiasTrabajados * precioComida;
                actualizarPercepcionExtra(empleado, 'Comida', comidaTotal);
            }
        }

        if (aplicaComida) {
            empleado.comida = parseFloat(comidaTotal === 0 ? 0 : comidaTotal.toFixed(2));
        }

        if (tipoHorario === 2) {
            // === CALCULAR TARDEADAS ===
            const diasTardeados = calcularTardeadas(empleado);
            const montoTardeada = parseFloat(jsonNominaHuasteca.pago_tardeada) || 0;

            const totalTardeada = diasTardeados * montoTardeada;
            empleado.tardeada = parseFloat(totalTardeada === 0 ? 0 : totalTardeada.toFixed(2));
            // Recalcular el total extra de forma limpia (tardeada + percepciones_extra)
            if (typeof calcularTotalExtra === 'function') {
                calcularTotalExtra(empleado);
            } else {
                // Fallback si no está cargado el script del modal
                empleado.sueldo_extra_total = parseFloat(empleado.tardeada) || 0;
            }
        } else if (tipoHorario === 1) {
            // Recalcular el total extra sumando todas las percepciones extras para el coordinador
            let totalExtra = 0;
            if (Array.isArray(empleado.percepciones_extra)) {
                empleado.percepciones_extra.forEach(p => {
                    totalExtra += parseFloat(p.cantidad) || 0;
                });
            }
            empleado.sueldo_extra_total = parseFloat(totalExtra.toFixed(2));
        }

        // IMPORTANTE: Recalcular el total a cobrar con el nuevo sueldo y extras
        if (typeof calcularTotalCobrar === 'function') {
            calcularTotalCobrar(empleado);
        }

    });

    actualizarCabeceraNomina(jsonNominaHuasteca);
    // Actualizar la tabla manteniendo el filtrado y paginación actual
    if (typeof aplicarFiltrosActuales === 'function') {
        aplicarFiltrosActuales();
    }

    saveNomina(jsonNominaHuasteca);
}


/************************************
 * CALCULAR TARDEADAS 
 ************************************/

// calcula cuántos días el empleado se pasó más de 45 min de la hora de salida
// usa jsonNominaHuasteca.horarioRancho que es un arreglo de objetos {dia,entrada,salida,...}
function calcularTardeadas(empleado) {
    if (!empleado.registros || !jsonNominaHuasteca.horarioRancho) return 0;

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

        const horarioDia = jsonNominaHuasteca.horarioRancho.find(h => h.dia === dia);
        if (!horarioDia || !horarioDia.salida) return;

        // comparar la última marca con la hora de salida del horario
        const [hE, mE] = horaMarcaje.split(':').map(Number);
        const [hH, mH] = horarioDia.salida.split(':').map(Number);
        const diff = hE * 60 + mE - (hH * 60 + mH);
        if (diff > 45) contador++;
    });

    return contador;
}
