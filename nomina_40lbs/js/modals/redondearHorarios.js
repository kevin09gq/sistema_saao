let jsonTabulador = null;
let cantidadIncentivo = 250;

// =========================================================================================
// FUNCIÓN PRINCIPAL DE REDONDEO
// =========================================================================================

// Esta función es el punto de partida para procesar y redondear los horarios de toda la nómina.
// Recorre cada uno de los departamentos y a todos sus empleados para calcular sus horas.
function redondearHorarios() {
    // Verificamos que la variable global de la nómina exista y contenga departamentos y horarios semanales
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos || !jsonNomina40lbs.horarios_semanales) {
        return;
    }

    // Cargar el tabulador de sueldos antes de procesar los empleados
    getTabulador();

    // Recorremos los departamentos de la nómina uno a uno
    jsonNomina40lbs.departamentos.forEach(function (departamento) {
        // Recorremos los empleados del departamento actual y verificamos si mostrar = true
        departamento.empleados.forEach(function (empleado) {
            if (!empleado.mostrar) {
                return; // Si no se debe mostrar, continuamos con el siguiente empleado
            }
            // Si el empleado tiene marcajes registrados en el biométrico, procedemos a redondearlos
            if (empleado.registros && empleado.registros.length > 0) {
                redondearRegistrosEmpleado(empleado);
            }
        });
    });

}

// =========================================================================================
// PROCESAMIENTO DE REGISTROS DE UN EMPLEADO
// =========================================================================================

// Esta función procesa, agrupa y calcula las horas redondeadas de un empleado individual.
// Recibe como argumento el objeto del empleado a procesar (por ejemplo: { nombre: 'Juan', registros: [...] }).
function redondearRegistrosEmpleado(empleado) {
    // Limpiamos o inicializamos la lista de registros redondeados del empleado para evitar duplicar información
    empleado.biometrico_redondeado = [];

    // Limpiamos o incializamos los historiales de olvidos de checador e inasistencias para recalcularlos
    empleado.historial_olvidos = [];
    empleado.historial_inasistencias = [];

    // Agrupamos todos los marcajes del biométrico por su fecha.
    // Esto se hace porque un empleado puede registrar múltiples entradas o salidas en un mismo día.
    // Ejemplo de salida:
    // registrosPorFecha = {
    //    "13/06/2026": [{ fecha: "13/06/2026", dia: "sábado", entrada: "07:41", salida: "13:19" }],
    //    "16/06/2026": [
    //         { fecha: "16/06/2026", dia: "martes", entrada: "07:37", salida: "13:09" },
    //         { fecha: "16/06/2026", dia: "martes", entrada: "13:42", salida: "22:51" }
    //    ]
    // }
    var registrosPorFecha = {};

    empleado.registros.forEach(function (registro) {
        if (registro.fecha) {
            if (!registrosPorFecha[registro.fecha]) {
                registrosPorFecha[registro.fecha] = [];
            }
            registrosPorFecha[registro.fecha].push(registro);
        }
    });

    var resultadoFinal; // Variable temporal para guardar el resultado redondeado del día actual

    // Recorremos las fechas agrupadas utilizando un ciclo "for...in" que es muy sencillo de leer.
    // En cada vuelta del ciclo, la variable "fecha" tomará el valor de una fecha diferente (ejemplo: "13/06/2026").
    for (var fecha in registrosPorFecha) {
        var registrosDelDia = registrosPorFecha[fecha]; // Obtenemos el arreglo de marcajes de esta fecha específica

        // Obtenemos el día de la semana directamente desde el primer marcaje del día.
        // Ejemplo: Si primerRegistro es { dia: 'Sábado', ... }, "diaSemana" se convertirá a "sábado".
        var primerRegistro = registrosDelDia[0];
        var diaSemana = (primerRegistro.dia || "").toLowerCase().trim();

        // EXPLICACIÓN DEL APARTADO DE BÚSQUEDA DEL HORARIO SEMANAL:
        // Buscamos el horario oficial de la empresa configurado para el día de la semana actual.
        // Para ello, usamos la función nativa de JavaScript ".find()".
        // Esta función va elemento por elemento del arreglo "jsonNomina40lbs.horarios_semanales" 
        // y ejecuta la condición: "horario.dia.toLowerCase() === diaSemana".
        // Si el día del horario coincide con nuestro "diaSemana" (ejemplo: "sábado" === "sábado"),
        // la función ".find()" detiene su búsqueda y guarda ese objeto horario oficial en la variable "horarioSemanal".
        // Ejemplo de horario oficial encontrado: { dia: "Sábado", entrada: "08:00", salida: "13:00", entrada_comida: "00:00", termino_comida: "00:00" }
        var horarioSemanal = jsonNomina40lbs.horarios_semanales.find(function (horario) {
            return horario.dia.toLowerCase() === diaSemana;
        });

        // Si la empresa tiene configurado un horario para este día de la semana, redondeamos los marcajes
        if (horarioSemanal) {
            if (registrosDelDia.length >= 1) {
                // Revisamos si el empleado tiene inasistencia completa en el día.
                // Usamos ".every()" para comprobar si en todos los registros del día tanto la entrada como la salida están vacías.
                var esInasistencia = registrosDelDia.every(function (registro) {
                    var entradaLimpia = (registro.entrada || "").trim();
                    var salidaLimpia = (registro.salida || "").trim();
                    return entradaLimpia === "" && salidaLimpia === "";
                });

                // Si se determina que el empleado faltó por completo:
                if (esInasistencia) {
                    resultadoFinal = {
                        entrada: "00:00",
                        entrada_comida: "00:00",
                        termino_comida: "00:00",
                        salida: "00:00"
                    };
                } else {
                    // Si el empleado sí asistió, tomamos su primer marcaje de entrada y su último marcaje de salida
                    var horaEntradaRegistro = registrosDelDia[0].entrada;
                    var ultimoRegistro = registrosDelDia[registrosDelDia.length - 1];
                    var horaSalidaRegistro = ultimoRegistro.salida;

                    // EVALUACIÓN DE JORNADA SIMPLE (1 solo registro de entrada/salida en el biométrico)
                    if (registrosDelDia.length === 1) {
                        // CASO 5: Llamamos a "procesarJornadaInterrumpida" para comprobar si el empleado salió antes del periodo de comida.
                        // Sirve para: Dejar la salida real intacta si se retiró temprano del trabajo.
                        var resultadoInterrumpido = procesarJornadaInterrumpida(horaEntradaRegistro, horaSalidaRegistro, horarioSemanal);

                        if (resultadoInterrumpido !== null) {
                            resultadoFinal = resultadoInterrumpido;
                        } else {
                            // Si no es jornada interrumpida (ejemplo: salió después del almuerzo), se procesan entrada y salida de forma normal:
                            // - "procesarFaltaEntrada" sirve para autocompletar si no marcó entrada, o redondear si llegó temprano/tarde.
                            // - "procesarFaltaSalida" sirve para autocompletar si no marcó salida, o redondear aplicando tolerancia.
                            resultadoFinal = {
                                entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                                entrada_comida: "00:00",
                                termino_comida: "00:00",
                                salida: procesarFaltaSalida(horaSalidaRegistro, horarioSemanal.salida)
                            };
                        }
                    } else {
                        // EVALUACIÓN DE JORNADA CON MÚLTIPLES MARCAJES (2 o más registros en el biométrico)
                        // Verificamos si el horario oficial de la empresa contempla o no comida
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
                            // Si el horario de la empresa no contempla tiempo de comida, redondeamos entrada y salida de forma directa
                            resultadoFinal = {
                                entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                                entrada_comida: "00:00",
                                termino_comida: "00:00",
                                salida: procesarFaltaSalida(horaSalidaRegistro, horarioSemanal.salida)
                            };
                        } else {
                            // Si el horario oficial sí contempla comida, llamamos a "procesarJornadaNormal" para evaluar los marcajes de comida.
                            // Sirve para: Redondear entradas, salidas y calcular retardos/tolerancias del almuerzo.
                            resultadoFinal = procesarJornadaNormal(registrosDelDia, horarioSemanal, horaEntradaRegistro);
                        }
                    }
                }

                // Construimos el objeto con los datos finales ya redondeados
                var registroRedondeadoSimple = {
                    dia: diaSemana,
                    entrada: resultadoFinal.entrada,
                    entrada_comida: resultadoFinal.entrada_comida,
                    termino_comida: resultadoFinal.termino_comida,
                    salida: resultadoFinal.salida
                };

                // Calculamos las horas acumuladas en este registro específico.
                // - "calcularTotalesRegistroRedondeado" sirve para obtener el total de minutos laborados netos (restando comida).
                var totalesRegistro = calcularTotalesRegistroRedondeado(registroRedondeadoSimple);

                // - "formatearMinutosAHHMM" sirve para convertir minutos a formato HH:MM (ejemplo: 480 minutos -> "08:00")
                registroRedondeadoSimple.horas_trabajadas = formatearMinutosAHHMM(totalesRegistro.minutos_netos);
                registroRedondeadoSimple.horas_comida = formatearMinutosAHHMM(totalesRegistro.minutos_comida);
                registroRedondeadoSimple.minutos_trabajados = totalesRegistro.minutos_netos;

                // Guardamos el registro redondeado en la lista del empleado
                empleado.biometrico_redondeado.push(registroRedondeadoSimple);
            }
        }
    } // Fin del ciclo for...in

    // Calculamos el acumulado total semanal del empleado.
    // - "calcularTotalesEmpleadoRedondeado" sirve para sumarizar todos los minutos laborados de los días trabajados.
    var totalesEmpleado = calcularTotalesEmpleadoRedondeado(empleado);
    empleado.minutos_trabajados = totalesEmpleado.minutos_netos;
    empleado.horas_trabajadas = formatearMinutosAHHMM(totalesEmpleado.minutos_netos);

    // Calculamos el sueldo neto del empleado basado en los minutos trabajados y el tabulador
    establecerSueldoNeto(empleado);

    // Evaluamos e imprimimos el incentivo semanal (bono de asistencia).
    // - "aplicarIncentivoEmpleado" sirve para asignar $0.00 si tuvo inasistencias o el monto completo en caso de asistencia perfecta.
    aplicarIncentivoEmpleado(empleado);

    // Rellenamos de forma automática los días que el empleado no trabajó para completar la semana (de viernes a jueves)
    var diasSemana = ['viernes', 'sábado', 'domingo', 'lunes', 'martes', 'miércoles', 'jueves'];
    diasSemana.forEach(function (dia) {
        var existe = empleado.biometrico_redondeado.some(function (registro) {
            return registro.dia === dia;
        });
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

    // Ordenamos cronológicamente los días del empleado para mostrarlos ordenados desde el viernes hasta el jueves
    empleado.biometrico_redondeado.sort(function (a, b) {
        return diasSemana.indexOf(a.dia) - diasSemana.indexOf(b.dia);
    });

}

// =========================================================================================
// CASOS DE REDONDEO: ENTRADAS Y SALIDAS
// =========================================================================================

// CASO 1: Procesa el retardo en la entrada.
// Sirve para: Determinar si el empleado entró a tiempo o tarde.
// Ejemplo:
//   Si entrada oficial es "08:00" y marcó "07:50" -> devuelve "08:00" (Llegó a tiempo, se redondea a favor de la empresa).
//   Si entrada oficial es "08:00" y marcó "08:05" -> devuelve "08:05" (Llegó tarde, se le registra su retardo real).
function procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    // "convertirHoraAMinutos" sirve para pasar la hora a minutos numéricos para poder compararlos.
    // Ejemplo: "08:00" -> 480 minutos.
    var minutosRegistro = convertirHoraAMinutos(horaEntradaRegistro);
    var minutosSemanal = convertirHoraAMinutos(horaEntradaSemanal);

    if (minutosRegistro > minutosSemanal) {
        return horaEntradaRegistro; // Mantiene el retardo real
    } else {
        return horaEntradaSemanal; // Redondea al horario oficial de entrada
    }
}

// CASO 3: Evalúa marcajes de entrada ausentes.
// Sirve para: Autocompletar con la hora de entrada si el empleado olvidó marcar, o llamar a evaluar retardos si sí marcó.
// Ejemplo:
//   Si horaEntradaRegistro es "" -> devuelve "08:00" (olvido, autocompleta).
//   Si horaEntradaRegistro es "08:10" -> llama a "procesarRetardoEntrada" y devuelve "08:10".
function procesarFaltaEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    if (!horaEntradaRegistro || horaEntradaRegistro.trim() === '') {
        return horaEntradaSemanal;
    }
    // "procesarRetardoEntrada" sirve para calcular si el marcaje existente representa un retardo o no
    return procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal);
}

// CASO 2: Procesa la salida anticipada.
// Sirve para: Redondear la salida a la hora oficial si está dentro de la tolerancia de 15 minutos, o mantener la salida real si salió antes.
// Ejemplo (Salida oficial: "17:00"):
//   Si marcó salida a las "16:50" -> devuelve "17:00" (dentro de tolerancia).
//   Si marcó salida a las "16:30" -> devuelve "16:30" (salida anticipada, mantiene la real).
function procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal) {
    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);
    var minutosSalidaSemanal = convertirHoraAMinutos(horaSalidaSemanal);

    var limiteToleranciaMinutos = minutosSalidaSemanal - 15; // Aplica los 15 minutos de tolerancia antes de la salida

    if (minutosSalidaRegistro >= limiteToleranciaMinutos) {
        return horaSalidaSemanal; // Redondea a la hora oficial
    } else {
        return horaSalidaRegistro; // Salida anticipada: mantiene la hora real
    }
}

// CASO 4: Evalúa marcajes de salida ausentes.
// Sirve para: Autocompletar la salida si no marcó, o llamar a evaluar salidas anticipadas si sí marcó.
// Ejemplo:
//   Si horaSalidaRegistro es "" -> devuelve "17:00" (olvido, autocompleta).
//   Si horaSalidaRegistro es "16:55" -> llama a "procesarSalidaAnticipada" y devuelve "17:00" (por tolerancia).
function procesarFaltaSalida(horaSalidaRegistro, horaSalidaSemanal) {
    if (!horaSalidaRegistro || horaSalidaRegistro.trim() === '') {
        return horaSalidaSemanal;
    }
    // "procesarSalidaAnticipada" sirve para evaluar si la salida registrada cumple con la tolerancia de 15 minutos
    return procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal);
}

// =========================================================================================
// CASO 5: JORNADA INTERRUMPIDA
// =========================================================================================

// CASO 5: Procesa la jornada interrumpida (cuando el empleado se retira antes de comer).
// Sirve para: Comprobar si la salida real del empleado ocurrió antes o justo en el inicio del almuerzo.
// Si se cumple, el empleado no tiene periodo de comida y su salida real se mantiene sin redondear.
// Ejemplo (Comida oficial inicia "13:00"):
//   Si entrada registrada es "08:00" y salida registrada es "12:00" (12:00 <= 13:00) -> devuelve { entrada: "08:00", entrada_comida: "00:00", termino_comida: "00:00", salida: "12:00" }.
//   Si salida registrada es "14:00" (después del almuerzo) -> devuelve null (no aplica jornada interrumpida).
function procesarJornadaInterrumpida(horaEntradaRegistro, horaSalidaRegistro, horarioSemanal) {
    var entradaComidaSemanal = (horarioSemanal.entrada_comida || "").trim();
    // Si la empresa no tiene horario de comida configurado, este caso no aplica
    if (entradaComidaSemanal === "" || entradaComidaSemanal === "00:00") {
        return null;
    }

    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(entradaComidaSemanal);

    // Si salió antes o exactamente a la hora de comida
    if (minutosSalidaRegistro <= minutosEntradaComidaSemanal) {
        // "procesarFaltaEntrada" sirve para calcular la entrada redondeada del empleado
        var entradaProcesada = procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada);

        return {
            entrada: entradaProcesada,
            entrada_comida: "00:00", // No hay periodo de comida
            termino_comida: "00:00", // No hay periodo de comida
            salida: horaSalidaRegistro // Mantiene la salida real sin redondear
        };
    }
    return null;
}

// =========================================================================================
// CASOS DE REDONDEO: HORARIOS DE COMIDA
// =========================================================================================

// CASO 6: Procesa salida a comer antes del horario oficial.
// Sirve para: Redondear el inicio de la comida a la hora oficial si marcó dentro de los 15 minutos previos de tolerancia.
// Ejemplo (Comida oficial inicia "13:00"):
//   Si marcó comida a las "12:50" -> devuelve "13:00" (dentro de tolerancia).
//   Si marcó comida a las "12:40" -> devuelve "12:40" (comida anticipada, mantiene la real).
function procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    var minutosSalidaComidaRegistro = convertirHoraAMinutos(horaSalidaComidaRegistro);
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(horaEntradaComidaSemanal);

    var limiteToleranciaMinutos = minutosEntradaComidaSemanal - 15; // Aplica los 15 minutos de tolerancia antes

    if (minutosSalidaComidaRegistro >= limiteToleranciaMinutos) {
        return horaEntradaComidaSemanal; // Redondea al horario oficial de inicio de comida
    } else {
        return horaSalidaComidaRegistro; // Mantiene el marcaje real de salida a comer
    }
}

// CASO 8: Evalúa la falta de marcaje al salir a comer.
// Sirve para: Autocompletar con el horario de comida oficial si no hay marcaje, o evaluar tolerancias si sí marcó.
// Ejemplo:
//   Si horaSalidaComidaRegistro es "" -> devuelve "13:00" (olvido, autocompleta).
//   Si horaSalidaComidaRegistro es "12:48" -> llama a "procesarSalidaComidaAnticipada" y devuelve "13:00".
function procesarFaltaSalidaComida(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    if (!horaSalidaComidaRegistro || horaSalidaComidaRegistro.trim() === '') {
        return horaEntradaComidaSemanal;
    }
    // "procesarSalidaComidaAnticipada" sirve para evaluar si la salida a comer cumple con la tolerancia de 15 minutos
    return procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal);
}

// CASO 7: Procesa el regreso de comida tarde.
// Sirve para: Redondear a la hora oficial de regreso de comer si llegó hasta 15 minutos tarde (tolerancia), o mantener el retardo real si excedió.
// Ejemplo (Retorno oficial: "14:00"):
//   Si regresó a las "14:10" -> devuelve "14:00" (dentro de tolerancia).
//   Si regresó a las "14:25" -> devuelve "14:25" (retardo de comida, mantiene hora real).
function procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    var minutosRegresoComidaRegistro = convertirHoraAMinutos(horaRegresoComidaRegistro);
    var minutosTerminoComidaSemanal = convertirHoraAMinutos(horaTerminoComidaSemanal);

    var limiteToleranciaMinutos = minutosTerminoComidaSemanal + 15; // Aplica los 15 minutos de tolerancia después

    if (minutosRegresoComidaRegistro <= limiteToleranciaMinutos) {
        return horaTerminoComidaSemanal; // Redondea a la hora oficial de regreso de comer
    } else {
        return horaRegresoComidaRegistro; // Regreso de comida tarde: mantiene la hora real
    }
}

// CASO 9: Evalúa la falta de marcaje al regresar de comer.
// Sirve para: Autocompletar con el horario de regreso de comida si no marcó, o evaluar tolerancias si sí marcó.
// Ejemplo:
//   Si horaRegresoComidaRegistro es "" -> devuelve "14:00" (olvido, autocompleta).
//   Si horaRegresoComidaRegistro es "14:08" -> llama a "procesarRegresoComidaTarde" y devuelve "14:00".
function procesarFaltaRegresoComida(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    if (!horaRegresoComidaRegistro || horaRegresoComidaRegistro.trim() === '') {
        return horaTerminoComidaSemanal;
    }
    // "procesarRegresoComidaTarde" sirve para evaluar si el retorno de comida cumple con la tolerancia de 15 minutos tardíos
    return procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal);
}

// PROCESAMIENTO DE JORNADA NORMAL CON COMIDA (2 o más registros biométricos en el día)
// Sirve para: Redondear todas las marcas de un día completo de trabajo que incluye hora de almuerzo.
// Evalúa la entrada, la salida a comer, el regreso de comer y la salida definitiva.
function procesarJornadaNormal(registrosDelDia, horarioSemanal, horaEntradaRegistro) {
    // "procesarFaltaEntrada" sirve para calcular la entrada redondeada o autocompletada
    var entradaRedondeada = procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada);

    var entradaComidaRedondeada, terminoComidaRedondeada;

    if (registrosDelDia.length >= 2) {
        // Si hay al menos dos marcajes físicos en el día, extraemos las marcas de comida:
        // - El primer marcaje (índice 0) define la salida a comer (primerRegistro.salida)
        // - El segundo marcaje (índice 1) define el regreso de comer (segundoRegistro.entrada)
        var primerRegistro = registrosDelDia[0];
        var segundoRegistro = registrosDelDia[1];

        var horaSalidaComidaRegistro = primerRegistro.salida;
        var horaRegresoComidaRegistro = segundoRegistro.entrada;

        // - "procesarFaltaSalidaComida" sirve para redondear o autocompletar la salida al almuerzo
        entradaComidaRedondeada = procesarFaltaSalidaComida(horaSalidaComidaRegistro, horarioSemanal.entrada_comida);

        // - "procesarFaltaRegresoComida" sirve para redondear o autocompletar el regreso del almuerzo
        terminoComidaRedondeada = procesarFaltaRegresoComida(horaRegresoComidaRegistro, horarioSemanal.termino_comida);
    } else {
        // Si no hay marcajes válidos para la comida, asignamos directamente los horarios configurados por la empresa
        entradaComidaRedondeada = horarioSemanal.entrada_comida;
        terminoComidaRedondeada = horarioSemanal.termino_comida;
    }

    var ultimoRegistro = registrosDelDia[registrosDelDia.length - 1];
    // - "procesarFaltaSalida" sirve para redondear o autocompletar la salida definitiva del empleado
    var salidaRedondeada = procesarFaltaSalida(ultimoRegistro.salida, horarioSemanal.salida);

    return {
        entrada: entradaRedondeada,
        entrada_comida: entradaComidaRedondeada,
        termino_comida: terminoComidaRedondeada,
        salida: salidaRedondeada
    };
}

// =========================================================================================
// CALCULO DE TIEMPOS Y TOTALES
// =========================================================================================

// Calcula los minutos netos trabajados en un día, descontando el almuerzo.
// Ejemplo:
//   Si entrada es "08:00", salida es "17:00" -> total de turno es 540 minutos (9 horas).
//   Si entrada de comida es "13:00", término de comida es "14:00" -> comida es 60 minutos (1 hora).
//   Retorna -> minutos_netos = 540 - 60 = 480 minutos (8 horas reales de trabajo).
function calcularTotalesRegistroRedondeado(registroRedondeado) {
    // Función interna para determinar si un horario está vacío, es cero, o representa "00:00".
    function esHoraCero(hora) {
        var horaTexto = (hora || "").trim();
        return horaTexto === "" || horaTexto === "00:00" || convertirHoraAMinutos(horaTexto) === 0;
    }

    // Convertimos las horas de entrada y salida a minutos totales para operar
    var entradaMinutos = convertirHoraAMinutos((registroRedondeado.entrada || "").trim());
    var salidaMinutos = convertirHoraAMinutos((registroRedondeado.salida || "").trim());

    var minutosTurno = salidaMinutos - entradaMinutos;
    if (minutosTurno < 0) {
        minutosTurno += 1440; // Añade 24 horas si el marcaje cruza la medianoche (ejemplo: de 22:00 a 06:00)
    }

    var minutesComida = 0;
    // Si el día sí tiene registrado un periodo de comida válido:
    if (!esHoraCero(registroRedondeado.entrada_comida) && !esHoraCero(registroRedondeado.termino_comida)) {
        var entradaComidaMinutos = convertirHoraAMinutos((registroRedondeado.entrada_comida || "").trim());
        var terminoComidaMinutos = convertirHoraAMinutos((registroRedondeado.termino_comida || "").trim());
        minutesComida = terminoComidaMinutos - entradaComidaMinutos;
        if (minutesComida < 0) {
            minutesComida += 1440; // Ajusta si la comida cruza la medianoche
        }
    }

    // El tiempo neto de trabajo es igual a los minutos del turno menos la comida
    var minutosNetos = Math.max(0, minutosTurno - minutesComida);

    return {
        minutos_turno: minutosTurno,
        horas_turno: minutosTurno / 60,
        minutos_comida: minutesComida,
        horas_comida: minutesComida / 60,
        minutos_netos: minutosNetos,
        horas_netas: minutosNetos / 60
    };
}

// Convierte minutos numéricos a formato legible de cadena HH:MM.
// Ejemplo: 480 minutos -> "08:00".
function formatearMinutosAHHMM(totalMinutos) {
    var minutosValidos = Math.max(0, parseInt(totalMinutos, 10) || 0);
    var horas = Math.floor(minutosValidos / 60);
    var minutosRestantes = minutosValidos % 60;

    // Rellenamos con un cero a la izquierda si el valor es de un solo dígito (ejemplo: "8" -> "08")
    var horasFormateadas = String(horas).padStart(2, '0');
    var minutosFormateados = String(minutosRestantes).padStart(2, '0');
    return horasFormateadas + ':' + minutosFormateados;
}

// Determina si al empleado le corresponde recibir el incentivo/bono de asistencia.
// Sirve para: Restar el bono a $0.00 si se detecta que el empleado faltó algún día de la semana.
// Ejemplo: Si el empleado tiene un registro con entrada "00:00" y salida "00:00" (inasistencia) -> incentivo = 0.
function aplicarIncentivoEmpleado(empleado) {
    var registros = empleado && empleado.biometrico_redondeado ? empleado.biometrico_redondeado : [];

    // Comprobamos si el empleado tiene algún día con inasistencia completa ("00:00" en entrada y salida)
    var tuvoFalta = registros.some(function (registro) {
        var entradaStr = (registro.entrada || '').trim();
        var salidaStr = (registro.salida || '').trim();
        return entradaStr === '00:00' && salidaStr === '00:00';
    });

    // Si tuvo una falta, el bono de incentivo es 0, de lo contrario recibe la cantidad total configurada (ejemplo: 250)
    empleado.incentivo = tuvoFalta ? 0 : cantidadIncentivo;
}

// Acumula la suma semanal de los minutos laborados de todos los registros del empleado.
// Sirve para: Sumarizar el total de horas de la semana y presentarlo en el reporte de nómina.
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
        // "calcularTotalesRegistroRedondeado" sirve para calcular los minutos laborados de un día individual
        var totalesRegistro = calcularTotalesRegistroRedondeado(registro);
        totales.minutos_turno += totalesRegistro.minutos_turno;
        totales.minutos_comida += totalesRegistro.minutos_comida;
        totales.minutos_netos += totalesRegistro.minutos_netos;
    });

    totales.horas_turno = totales.minutos_turno / 60;
    totales.horas_comida = totales.minutos_comida / 60;
    totales.horas_netas = totales.minutos_netos / 60;

    return totales;
}

