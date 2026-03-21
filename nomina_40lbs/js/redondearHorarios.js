jsonTabulador = null;
let cantidadIncentivo = 250;
function redondearHorarios() {
    // Verificar que exista jsonNomina40lbs con datos
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) {

        return;
    }

    // Verificar que existan horarios semanales guardados
    if (!jsonNomina40lbs.horarios_semanales || jsonNomina40lbs.horarios_semanales.length === 0) {
        return;
    }

    // Crear mapa de horarios semanales por día para fácil acceso
    var horariosPorDia = {};
    jsonNomina40lbs.horarios_semanales.forEach(function (horario) {
        horariosPorDia[horario.dia.toLowerCase()] = horario;
    });

    // Recorrer departamentos de producción 40 lbs, empaque 10 lbs y sin seguro
    jsonNomina40lbs.departamentos.forEach(function (departamento) {
        var nombreDept = departamento.nombre.toLowerCase();

        // Solo procesar los departamentos relevantes
        if (nombreDept.includes('produccion 40 libras') ||
            nombreDept.includes('produccion 10 libras') ||
            nombreDept.includes('sin seguro')) {


            // Recorrer empleados del departamento
            departamento.empleados.forEach(function (empleado) {
                // Verificar que el empleado tenga registros biométricos
                if (empleado.registros && empleado.registros.length > 0) {
                    redondearRegistrosEmpleado(empleado, horariosPorDia);


                }
            });
        }
    });

}

// Función para redondear los registros de un empleado específico
function redondearRegistrosEmpleado(empleado, horariosPorDia) {
    console.log('Empleado:', empleado.nombre);
    console.log('Registros originales:', empleado.registros);
    
    // Crear la propiedad biometrico_redondeado si no existe
    if (!empleado.biometrico_redondeado) {
        empleado.biometrico_redondeado = [];
    }
    
    // Limpiar registros redondeados existentes
    empleado.biometrico_redondeado = [];

    // AGRUPAR REGISTROS BIOMÉTRICOS POR FECHA
    // OBJETIVO: Organizar todos los registros del empleado por día para procesarlos individualmente
    // DATOS ORIGEN: empleado.registros (array con todos los registros biométricos del empleado)
    var registrosPorFecha = {}; // Objeto que contendrá los registros agrupados por fecha

    // Recorrer cada registro biométrico del empleado
    empleado.registros.forEach(function (registro) {
        // DATOS: registro.fecha (desde biométrico - formato "19/12/2025")
        if (registro.fecha && !registrosPorFecha[registro.fecha]) {
            // Si es la primera vez que vemos esta fecha, creamos un array vacío
            registrosPorFecha[registro.fecha] = [];
        }
        if (registro.fecha) {
            // Agregamos el registro completo al array de su fecha
            // DATOS: registro completo (desde biométrico - contiene entrada, salida, etc.)
            registrosPorFecha[registro.fecha].push(registro);
        }
    });

    // RESULTADO: registrosPorFecha = {
    //   "19/12/2025": [
    //     {fecha: "19/12/2025", entrada: "07:42", salida: "13:10"},
    //     {fecha: "19/12/2025", entrada: "13:34", salida: "20:01"}
    //   ],
    //   "20/12/2025": [
    //     {fecha: "20/12/2025", entrada: "", salida: ""}
    //   ]
    // }

    // PROCESAR CADA FECHA INDIVIDUALMENTE
    Object.keys(registrosPorFecha).forEach(function (fecha) {
        // DATOS: fecha (clave del objeto - viene de registro.fecha del biométrico)
        var registrosDelDia = registrosPorFecha[fecha]; // Array con todos los registros de esa fecha

        // OBTENER DÍA DE LA SEMANA A PARTIR DE LA FECHA
        // OBJETIVO: Saber si es lunes, martes, etc. para buscar el horario correspondiente
        var partesFecha = fecha.split('/');              // Divide "19/12/2025" en ["19","12","2025"]
        var fechaObj = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]); // Crea objeto Date
        var diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase(); // Obtiene "lunes","martes",etc.

        // OBTENER HORARIO SEMANAL CONFIGURADO PARA ESE DÍA
        // OBJETIVO: Buscar el horario programado que corresponde al día de la semana
        var horarioSemanal = horariosPorDia[diaSemana]; // DATOS: horariosPorDia (desde configuración de horarios semanales)

        if (horarioSemanal) {

            // Procesar registros del empleado si existen para esta fecha
            if (registrosDelDia.length >= 1) {
                var esInasistencia = registrosDelDia.every(function (r) {
                    var e = (r.entrada || "").trim();
                    var s = (r.salida || "").trim();
                    return e === "" && s === "";
                });

                if (esInasistencia) {
                    resultadoFinal = {
                        entrada: "00:00",
                        entrada_comida: "00:00",
                        termino_comida: "00:00",
                        salida: "00:00"
                    };
                } else {
                // DATOS DEL REGISTRO BIOMÉTRICO DEL EMPLEADO
                var primerRegistro = registrosDelDia[0];           // Primer registro biométrico del día
                var horaEntradaRegistro = primerRegistro.entrada;   // Hora de entrada real del empleado (desde biométrico)
                var horaSalidaRegistro = primerRegistro.salida;     // Hora de salida real del empleado (desde biométrico)

                // DATOS DEL HORARIO SEMANAL CONFIGURADO
                var horarioSemanal = horariosPorDia[diaSemana];      // Horario completo del día (desde configuración)

                // VERIFICAR SI ES JORNADA CON UN SOLO REGISTRO (sin comida)
                // Si solo hay 1 registro, significa que no hubo comida → siempre jornada interrumpida
                if (registrosDelDia.length === 1) {

                    var resultadoInterrumpido = {
                        entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                        entrada_comida: "00:00",   // No hay comida - valor nulo
                        termino_comida: "00:00",   // No hay comida - valor nulo
                        salida: procesarFaltaSalida(horaSalidaRegistro, horarioSemanal.salida) // Procesa salida con tolerancia
                    };

                    resultadoFinal = resultadoInterrumpido;
                } else {
                    // VERIFICAR SI EL HORARIO OFICIAL CONTEMPLA COMIDA
                    // Si el horario oficial no tiene comida (00:00), siempre es jornada interrumpida
                    var entradaComidaSemanal = (horarioSemanal.entrada_comida || "").trim();
                    var terminoComidaSemanal = (horarioSemanal.termino_comida || "").trim();
                    var sinComida = (
                        entradaComidaSemanal === "" ||
                        terminoComidaSemanal === "" ||
                        entradaComidaSemanal === "00:00" ||
                        terminoComidaSemanal === "00:00" ||
                        convertirHoraAMinutos(entradaComidaSemanal) === 0 ||
                        convertirHoraAMinutos(terminoComidaSemanal) === 0
                    );

                    if (sinComida) {

                        var resultadoSinComida = {
                            entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                            entrada_comida: "00:00",   // Horario oficial no contempla comida
                            termino_comida: "00:00",   // Horario oficial no contempla comida
                            salida: procesarFaltaSalida(horaSalidaRegistro, horarioSemanal.salida) // Procesa salida normal
                        };

                        resultadoFinal = resultadoSinComida;
                    } else {
                        // CUANDO HAY 2+ REGISTROS Y HORARIO CON COMIDA: PROCESAR COMO JORNADA COMPLETA CON COMIDA

                        // EJECUCIÓN DE CASOS NORMALES (1, 2, 3, 4, 6, 7, 8, 9): Jornada completa con comida
                        // Origen de datos: procesarJornadaNormal() llama internamente a:
                        //   - procesarFaltaEntrada() -> procesarRetardoEntrada() (CASOS 1 y 3)
                        //   - procesarFaltaSalida() -> procesarSalidaAnticipada() (CASOS 2 y 4)
                        //   - procesarFaltaSalidaComida() -> procesarSalidaComidaAnticipada() (CASOS 6 y 8)
                        //   - procesarFaltaRegresoComida() -> procesarRegresoComidaTarde() (CASOS 7 y 9)
                        resultadoFinal = procesarJornadaNormal(registrosDelDia, horarioSemanal, horaEntradaRegistro);
                    }
                }
                }


                // Crear registro redondeado final con estructura simple
                var registroRedondeadoSimple = {
                    dia: diaSemana,                                  // Día del registro (viernes, sábado, etc.)
                    entrada: resultadoFinal.entrada,               // Entrada redondeada (puede ser real o programada)
                    entrada_comida: resultadoFinal.entrada_comida,  // Entrada a comida (programada o 00:00)
                    termino_comida: resultadoFinal.termino_comida,   // Término de comida (programada o 00:00)
                    salida: resultadoFinal.salida                   // Salida redondeada (puede ser real o programada)
                };

                var totalesRegistro = calcularTotalesRegistroRedondeado(registroRedondeadoSimple);
                registroRedondeadoSimple.horas_trabajadas = formatearMinutosAHHMM(totalesRegistro.minutos_netos);
                registroRedondeadoSimple.horas_comida = formatearMinutosAHHMM(totalesRegistro.minutos_comida);
                registroRedondeadoSimple.minutos_trabajados = totalesRegistro.minutos_netos;
                empleado.biometrico_redondeado.push(registroRedondeadoSimple);
            }
        }
    });

    var totalesEmpleado = calcularTotalesEmpleadoRedondeado(empleado);
    empleado.minutos_trabajados = totalesEmpleado.minutos_netos;
    empleado.horas_trabajadas = formatearMinutosAHHMM(totalesEmpleado.minutos_netos);

    aplicarIncentivoEmpleado(empleado);

    // Agregar días faltantes de la semana (viernes a jueves) con propiedades vacías
    const diasSemana = ['viernes', 'sábado', 'domingo', 'lunes', 'martes', 'miércoles', 'jueves'];
    diasSemana.forEach(function (dia) {
        const existe = empleado.biometrico_redondeado.some(r => r.dia === dia);
        if (!existe) {
            empleado.biometrico_redondeado.push({
                dia: dia,
                entrada: '',
                entrada_comida: '',
                termino_comida: '',
                salida: '',
                horas_comida: '',
                horas_trabajadas: '',
                minutos_trabajados: 0
            });
        }
    });

    // Ordenar los días de viernes a jueves
    empleado.biometrico_redondeado.sort(function (a, b) {
        return diasSemana.indexOf(a.dia) - diasSemana.indexOf(b.dia);
    });

    console.log('Registros redondeados:', empleado.biometrico_redondeado);
}

// ========================================
// FUNCIONES PARA CADA CASO DE REDONDEO
// ========================================

// CASO 1: Retardo en entrada

function procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    // DATOS: horaEntradaRegistro (desde biométrico), horaEntradaSemanal (desde configuración)
    var minutosRegistro = convertirHoraAMinutos(horaEntradaRegistro);  // Convertir hora real a minutos
    var minutosSemanal = convertirHoraAMinutos(horaEntradaSemanal);    // Convertir hora programada a minutos

    if (minutosRegistro > minutosSemanal) {
        // Si hora real > hora programada: hay retardo - mantiene hora real
        return horaEntradaRegistro; // Retorna hora real (sin redondear)
    } else {
        // Si hora real ≤ hora programada: llegó a tiempo - redondea a hora programada
        return horaEntradaSemanal; // Retorna hora programada (redondeada)
    }
}

// CASO 2: Salida anticipada

function procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal) {
    // DATOS: horaSalidaRegistro (desde biométrico), horaSalidaSemanal (desde configuración)
    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);  // Convertir hora real a minutos
    var minutosSalidaSemanal = convertirHoraAMinutos(horaSalidaSemanal);    // Convertir hora programada a minutos

    // Aplicar tolerancia de 15 min antes para salida anticipada
    var toleranciaMin = minutosSalidaSemanal - 15;  // 15 minutos antes

    if (minutosSalidaRegistro >= toleranciaMin) {
        // Si está después de tolerancia mínima (15 min antes o cualquier hora después): redondea a hora programada
        return horaSalidaSemanal; // Retorna hora programada (redondeada)
    } else {
        // Si está antes de tolerancia (más de 15 min antes): mantiene hora real
        return horaSalidaRegistro; // Retorna hora real (sin redondear)
    }
}

// CASO 3: Falta de entrada

function procesarFaltaEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    // DATO: horaEntradaRegistro (desde biométrico), horaEntradaSemanal (desde configuración)
    if (!horaEntradaRegistro || horaEntradaRegistro.trim() === '') {
        // Si no hay marcaje: autocompleta con hora programada
        return horaEntradaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa como retardo o a tiempo
    return procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal);
}

// CASO 4: Falta de salida

function procesarFaltaSalida(horaSalidaRegistro, horaSalidaSemanal) {
    // DATO: horaSalidaRegistro (desde biométrico), horaSalidaSemanal (desde configuración)
    if (!horaSalidaRegistro || horaSalidaRegistro.trim() === '') {
        // Si no hay marcaje: autocompleta con hora programada
        return horaSalidaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa como salida anticipada o correcta
    return procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal);
}

// CASO 5: Jornada interrumpida (salida antes de comida)

function procesarJornadaInterrumpida(horaEntradaRegistro, horaSalidaRegistro, horarioSemanal) {
    // DATOS: horaSalidaRegistro (desde biométrico), horarioSemanal.entrada_comida (desde configuración)
    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);           // Convertir hora real a minutos
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(horarioSemanal.entrada_comida); // Convertir hora comida programada a minutos

   
    if (minutosSalidaRegistro <= minutosEntradaComidaSemanal) {
        // Si salió antes o exactamente a la hora de comida: jornada interrumpida
         var entradaProcesada = procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada);

        var resultado = {
            entrada: entradaProcesada, // Procesa entrada (puede ser autocompletada)
            entrada_comida: "00:00",   // No hay comida - valor nulo
            termino_comida: "00:00",   // No hay comida - valor nulo
            salida: horaSalidaRegistro // Mantiene hora real (no redondea)
        };

        return resultado;
    }
    return null; // No es jornada interrumpida
}

// CASO 6: Salida a comer antes del horario oficial

function procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    // DATOS: horaSalidaComidaRegistro (desde biométrico), horaEntradaComidaSemanal (desde configuración)
    var minutosSalidaComidaRegistro = convertirHoraAMinutos(horaSalidaComidaRegistro);  // Convertir hora real a minutos
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(horaEntradaComidaSemanal);    // Convertir hora programada a minutos

    // Aplicar tolerancia de 15 min antes para entrada de comida
    var toleranciaMin = minutosEntradaComidaSemanal - 15;  // 15 minutos antes

    if (minutosSalidaComidaRegistro >= toleranciaMin) {
        // Si está después de tolerancia mínima (15 min antes o cualquier hora después): redondea a hora programada
        return horaEntradaComidaSemanal; // Retorna hora programada (redondeada)
    } else {
        // Si está antes de tolerancia (más de 15 min antes): mantiene hora real
        return horaSalidaComidaRegistro; // Retorna hora real (sin redondear)
    }
}

// CASO 7: Regreso de comida después del horario oficial

function procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    // DATOS: horaRegresoComidaRegistro (desde biométrico), horaTerminoComidaSemanal (desde configuración)
    var minutosRegresoComidaRegistro = convertirHoraAMinutos(horaRegresoComidaRegistro);  // Convertir hora real a minutos
    var minutosTerminoComidaSemanal = convertirHoraAMinutos(horaTerminoComidaSemanal);    // Convertir hora programada a minutos

    // Aplicar tolerancia de 15 min después para regreso de comida
    var toleranciaMax = minutosTerminoComidaSemanal + 15;  // 15 minutos después

    if (minutosRegresoComidaRegistro <= toleranciaMax) {
        // Si está dentro de tolerancia (hasta 15 min después): redondea a hora programada
        return horaTerminoComidaSemanal; // Retorna hora programada (redondeada)
    } else {
        // Si está después de tolerancia (más de 15 min después): mantiene hora real
        return horaRegresoComidaRegistro; // Retorna hora real (sin redondear)
    }
}

// CASO 8: Falta de marcaje en salida a comer

function procesarFaltaSalidaComida(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    // DATO: horaSalidaComidaRegistro (desde biométrico), horaEntradaComidaSemanal (desde configuración)
    if (!horaSalidaComidaRegistro || horaSalidaComidaRegistro.trim() === '') {
        // Si no hay marcaje de salida a comer: autocompleta con hora programada
        return horaEntradaComidaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa normal (aplica CASO 6)
    return procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal);
}

// CASO 9: Falta de marcaje en regreso de comida

function procesarFaltaRegresoComida(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    // DATO: horaRegresoComidaRegistro (desde biométrico), horaTerminoComidaSemanal (desde configuración)
    if (!horaRegresoComidaRegistro || horaRegresoComidaRegistro.trim() === '') {
        // Si no hay marcaje de regreso de comida: autocompleta con hora programada
        return horaTerminoComidaSemanal; // Retorna hora programada (autocompletado)
    }
    // Si hay marcaje: procesa normal (aplica CASO 7)
    return procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal);
}

// Función auxiliar para procesar jornada normal con comida

function procesarJornadaNormal(registrosDelDia, horarioSemanal, horaEntradaRegistro) {
    // DATOS: registrosDelDia (desde biométrico), horarioSemanal (desde configuración), horaEntradaRegistro (desde biométrico)
    var entradaRedondeada = procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada); // Procesa entrada

    // PROCESAR CASOS DE COMIDA (CUANDO HAY 2+ REGISTROS)
    var entradaComidaRedondeada, terminoComidaRedondeada;

    if (registrosDelDia.length >= 2) {
        // Hay 2+ registros → hay comida
        var primerRegistro = registrosDelDia[0];           // Registro 1: entrada | salida a comer
        var segundoRegistro = registrosDelDia[1];          // Registro 2: regreso | salida final

        var horaSalidaComidaRegistro = primerRegistro.salida;      // Salida a comer (desde biométrico)
        var horaRegresoComidaRegistro = segundoRegistro.entrada;    // Regreso de comida (desde biométrico)

        // CASO 8: Procesar salida a comer (con detección de olvido)
        entradaComidaRedondeada = procesarFaltaSalidaComida(horaSalidaComidaRegistro, horarioSemanal.entrada_comida);

        // CASO 9: Procesar regreso de comida (con detección de olvido)
        terminoComidaRedondeada = procesarFaltaRegresoComida(horaRegresoComidaRegistro, horarioSemanal.termino_comida);
    } else {
        // Si por alguna razón no hay 2+ registros, usa valores programados
        entradaComidaRedondeada = horarioSemanal.entrada_comida;
        terminoComidaRedondeada = horarioSemanal.termino_comida;
    }

    var ultimoRegistro = registrosDelDia[registrosDelDia.length - 1];          // Último registro del día
    var salidaRedondeada = procesarFaltaSalida(ultimoRegistro.salida, horarioSemanal.salida); // Procesa salida

    return {
        entrada: entradaRedondeada,                    // Entrada procesada
        entrada_comida: entradaComidaRedondeada,        // Salida a comer procesada
        termino_comida: terminoComidaRedondeada,       // Regreso de comida procesado
        salida: salidaRedondeada                       // Salida procesada
    };
}

function calcularTotalesRegistroRedondeado(registroRedondeado) {
    function esHoraCero(hora) {
        var h = (hora || "").trim();
        return h === "" || h === "00:00" || convertirHoraAMinutos(h) === 0;
    }

    var entradaMin = convertirHoraAMinutos((registroRedondeado.entrada || "").trim());
    var salidaMin = convertirHoraAMinutos((registroRedondeado.salida || "").trim());

    var minutosTurno = Math.max(0, salidaMin - entradaMin);

    var minutosComida = 0;
    if (!esHoraCero(registroRedondeado.entrada_comida) && !esHoraCero(registroRedondeado.termino_comida)) {
        var entradaComidaMin = convertirHoraAMinutos((registroRedondeado.entrada_comida || "").trim());
        var terminoComidaMin = convertirHoraAMinutos((registroRedondeado.termino_comida || "").trim());
        minutosComida = Math.max(0, terminoComidaMin - entradaComidaMin);
    }

    var minutosNetos = Math.max(0, minutosTurno - minutosComida);

    return {
        minutos_turno: minutosTurno,
        horas_turno: minutosTurno / 60,
        minutos_comida: minutosComida,
        horas_comida: minutosComida / 60,
        minutos_netos: minutosNetos,
        horas_netas: minutosNetos / 60
    };
}

function formatearMinutosAHHMM(totalMinutos) {
    var minutos = Math.max(0, parseInt(totalMinutos, 10) || 0);
    var horas = Math.floor(minutos / 60);
    var mins = minutos % 60;
    var hh = String(horas).padStart(2, '0');
    var mm = String(mins).padStart(2, '0');
    return hh + ':' + mm;
}

function aplicarIncentivoEmpleado(empleado) {
    var registros = empleado && empleado.biometrico_redondeado ? empleado.biometrico_redondeado : [];
    var tuvoFalta = registros.some(function (r) {
        var e = (r.entrada || '').trim();
        var s = (r.salida || '').trim();
        return e === '00:00' && s === '00:00';
    });

    empleado.incentivo = tuvoFalta ? 0 : cantidadIncentivo;
}

function calcularTotalesEmpleadoRedondeado(empleado) {
    var totales = {
        minutos_turno: 0,
        minutos_comida: 0,
        minutos_netos: 0,
        horas_turno: 0,
        horas_comida: 0,
        horas_netas: 0
    };

    var registros = empleado && empleado.biometrico_redondeado ? empleado.biometrico_redondeado : [];
    registros.forEach(function (registro) {
        var t = calcularTotalesRegistroRedondeado(registro);
        totales.minutos_turno += t.minutos_turno;
        totales.minutos_comida += t.minutos_comida;
        totales.minutos_netos += t.minutos_netos;
    });

    totales.horas_turno = totales.minutos_turno / 60;
    totales.horas_comida = totales.minutos_comida / 60;
    totales.horas_netas = totales.minutos_netos / 60;

    return totales;
}



// ======================================================
// ASIGNAR SUELDO NETO AL EMPLEADO SEGÚN HORAS TRABAJADAS
// ======================================================

// empleadosFiltro es OPCIONAL:
//   - Si se pasa (array de objetos emp), solo recalcula el sueldo de esos empleados
//   - Si NO se pasa, recalcula TODOS (uso normal al cargar la nómina)
function getTabulador(empleadosFiltro) {
    var idEmpresa = 1; // Ajusta según tu lógica
    $.ajax({
        url: '../php/getTabulador.php',
        type: 'POST',
        data: {
            accion: 'obtenerTabulador',
            id_empresa: idEmpresa
        },
        dataType: 'json',
        success: function (datos) {
            jsonTabulador = datos;
            console.log("Tabulador recibido:", jsonTabulador);
            // Pasa el filtro: si vino vacío recalcula todos, si vino con empleados solo esos
            imprimirSueldoBasePorHorasTrabajadas(jsonTabulador, empleadosFiltro || null);
            refrescarTabla();
        },
        error: function (xhr, status, error) {
        }
    });
}

function obtenerRangoTabuladorPorHorasTrabajadas(horasTrabajadasHHMM, tabulador) {
    if (!tabulador || !Array.isArray(tabulador) || tabulador.length === 0) {
        return null;
    }

    var minutosEmpleado = convertirHoraAMinutos((horasTrabajadasHHMM || "").trim());
    var rangoEncontrado = null;
    var maxMinDesde = -1;

    // Buscar el rango NO hora_extra cuyo "desde" sea el más alto pero <= minutos trabajados
    for (var i = 0; i < tabulador.length; i++) {
        var item = tabulador[i];
        
        // Saltar items sin rango o con tipo hora_extra
        if (!item || !item.rango || item.tipo === 'hora_extra') {
            continue;
        }

        var desdeStr = (item.rango.desde || "").trim();
        if (!desdeStr) {
            continue;
        }

        var minDesde = convertirHoraAMinutos(desdeStr);
        
        // Buscar el rango con el "desde" más alto que sea <= a las horas trabajadas
        if (minutosEmpleado >= minDesde && minDesde > maxMinDesde) {
            maxMinDesde = minDesde;
            rangoEncontrado = item;
        }
    }

    return rangoEncontrado;
}

// empleadosSeleccionados es OPCIONAL. Si se pasa, solo recalcula esos empleados.
// Si NO se pasa (o es null), recalcula TODOS (comportamiento original).
function imprimirSueldoBasePorHorasTrabajadas(tabulador, empleadosSeleccionados) {
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) {
        return;
    }

    // Construir un Set con las referencias de los objetos empleado (solo si hay seleccionados)
    // Usar referencias de objeto es más simple y rápido que comparar claves
    var soloSeleccionados = null;
    if (empleadosSeleccionados && empleadosSeleccionados.length > 0) {
        soloSeleccionados = new Set(empleadosSeleccionados);
    }

    var itemHoraExtra = null;
    for (var i = 0; i < (tabulador || []).length; i++) {
        if (tabulador[i] && tabulador[i].tipo === 'hora_extra' && tabulador[i].rango && tabulador[i].rango.desde) {
            itemHoraExtra = tabulador[i];
            break;
        }
    }
    var minDesdeHoraExtra = itemHoraExtra ? convertirHoraAMinutos((itemHoraExtra.rango.desde || '').trim()) : null;

    jsonNomina40lbs.departamentos.forEach(function (departamento) {
        var nombreDept = (departamento.nombre || "").toLowerCase();
        if (!(nombreDept.includes('produccion 40 libras') || nombreDept.includes('produccion 10 libras') || nombreDept.includes('sin seguro'))) {
            return;
        }

        (departamento.empleados || []).forEach(function (empleado) {

            // ✅ FILTRO: Si hay seleccionados, solo procesar los que estén en la lista
            // Se compara por referencia de objeto (mismo emp de jsonNomina40lbs)
            if (soloSeleccionados !== null && !soloSeleccionados.has(empleado)) {
                return; // ← Saltar este empleado, no tocar su sueldo
            }

            var horas = (empleado.horas_trabajadas || "").trim();
            if (!horas) {
                return;
            }

            var minutosEmpleado = convertirHoraAMinutos(horas);

            var rango = obtenerRangoTabuladorPorHorasTrabajadas(horas, tabulador);
            if (rango) {
                empleado.sueldo_neto = rango.sueldo_base;
                console.log('Tabulador =>', empleado.nombre, 'horas_trabajadas:', horas, 'sueldo_base:', rango.sueldo_base);
            } else {
                empleado.sueldo_neto = 0;
                console.log('Tabulador =>', empleado.nombre, 'horas_trabajadas:', horas, 'sueldo_base: NO ENCONTRADO');
            }

            if (itemHoraExtra && minDesdeHoraExtra !== null && minutosEmpleado > minDesdeHoraExtra) {
                var minutosExtra = Math.max(0, minutosEmpleado - minDesdeHoraExtra);
                var costo = parseFloat(itemHoraExtra.costo_por_minuto) || 0;
                var pagoExtra = minutosExtra * costo;
                empleado.horas_extra = pagoExtra.toFixed(2);

                console.log('Hora extra =>', empleado.nombre, 'minutos_extra:', minutosExtra, 'costo_por_minuto:', costo, 'pago_extra:', pagoExtra);
            } else {
                empleado.horas_extra = 0;
            }

            // RECALCULAR SUELDO_EXTRA_TOTAL después de asignar horas_extra
            recalcularSueldoExtraTotal(empleado);
        });
    });
}

// ======================================================
// RECALCULAR SUELDO EXTRA TOTAL
// ======================================================

// Función para obtener el total de conceptos adicionales del objeto empleado
function obtenerTotalConceptosAdicionales(empleado) {
    if (!empleado.percepciones_extra || !Array.isArray(empleado.percepciones_extra)) {
        return 0;
    }

    return empleado.percepciones_extra.reduce(function (total, percepcion) {
        return total + (parseFloat(percepcion.cantidad) || 0);
    }, 0);
}

// Función para recalcular sueldo_extra_total basándose en las propiedades del empleado
function recalcularSueldoExtraTotal(empleado) {
    if (!empleado) {
        return;
    }

    var totalExtras = 0;

    // Sumar percepciones extras
    totalExtras += obtenerTotalConceptosAdicionales(empleado);

    // Sumar horas extras
    totalExtras += parseFloat(empleado.horas_extra) || 0;

    // Sumar bono de antiguedad
    totalExtras += parseFloat(empleado.bono_antiguedad) || 0;

    // Sumar actividades especiales
    totalExtras += parseFloat(empleado.actividades_especiales) || 0;

    // Sumar puesto
    totalExtras += parseFloat(empleado.puesto) || 0;

    // Asignar el total
    empleado.sueldo_extra_total = parseFloat(totalExtras.toFixed(2));
}
