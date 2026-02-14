function redondearHorarios() {
    // Verificar que exista jsonNomina40lbs con datos
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) {
        console.log('No hay datos de nómina para redondear');
        return;
    }
    
    // Verificar que existan horarios semanales guardados
    if (!jsonNomina40lbs.horarios_semanales || jsonNomina40lbs.horarios_semanales.length === 0) {
        console.log('No hay horarios semanales guardados para usar como referencia');
        return;
    }
    
    // Crear mapa de horarios semanales por día para fácil acceso
    var horariosPorDia = {};
    jsonNomina40lbs.horarios_semanales.forEach(function(horario) {
        horariosPorDia[horario.dia.toLowerCase()] = horario;
    });
    
    // Recorrer departamentos de producción 40 lbs, empaque 10 lbs y sin seguro
    jsonNomina40lbs.departamentos.forEach(function(departamento) {
        var nombreDept = departamento.nombre.toLowerCase();
        
        // Solo procesar los departamentos relevantes
        if (nombreDept.includes('produccion 40 libras') || 
            nombreDept.includes('empaque 10 libras') || 
            nombreDept.includes('sin seguro')) {
            
            console.log('Procesando departamento:', departamento.nombre);
            
            // Recorrer empleados del departamento
            departamento.empleados.forEach(function(empleado) {
                // Verificar que el empleado tenga registros biométricos
                if (empleado.registros && empleado.registros.length > 0) {
                    console.log('Procesando empleado:', empleado.nombre);
                    redondearRegistrosEmpleado(empleado, horariosPorDia);
                    
                    // Mostrar los registros redondeados en consola
                    if (empleado.biometrico_redondeado && empleado.biometrico_redondeado.length > 0) {
                        console.log('✅ Registros redondeados para', empleado.nombre, ':', empleado.biometrico_redondeado);
                    } else {
                        console.log('⚠️ No se generaron registros redondeados para', empleado.nombre);
                    }
                }
            });
        }
    });
    
    console.log('Redondeo de horarios completado');
}

// Función para redondear los registros de un empleado específico
function redondearRegistrosEmpleado(empleado, horariosPorDia) {
    console.log('Empleado:', empleado.nombre);
    console.log('Registros biométricos originales:', empleado.registros);
    
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
    empleado.registros.forEach(function(registro) {
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
    Object.keys(registrosPorFecha).forEach(function(fecha) {
        // DATOS: fecha (clave del objeto - viene de registro.fecha del biométrico)
        var registrosDelDia = registrosPorFecha[fecha]; // Array con todos los registros de esa fecha
        
        // OBTENER DÍA DE LA SEMANA A PARTIR DE LA FECHA
        // OBJETIVO: Saber si es lunes, martes, etc. para buscar el horario correspondiente
        var partesFecha = fecha.split('/');              // Divide "19/12/2025" en ["19","12","2025"]
        var fechaObj = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]); // Crea objeto Date
        var diaSemana = fechaObj.toLocaleDateString('es-ES', {weekday: 'long'}).toLowerCase(); // Obtiene "lunes","martes",etc.
        
        // OBTENER HORARIO SEMANAL CONFIGURADO PARA ESE DÍA
        // OBJETIVO: Buscar el horario programado que corresponde al día de la semana
        var horarioSemanal = horariosPorDia[diaSemana]; // DATOS: horariosPorDia (desde configuración de horarios semanales)
        
        if (horarioSemanal) {
            console.log('Procesando fecha:', fecha, 'Día:', diaSemana, 'Horario:', horarioSemanal);
            
            // Procesar registros del empleado si existen para esta fecha
            if (registrosDelDia.length >= 1) {
                // DATOS DEL REGISTRO BIOMÉTRICO DEL EMPLEADO
                var primerRegistro = registrosDelDia[0];           // Primer registro biométrico del día
                var horaEntradaRegistro = primerRegistro.entrada;   // Hora de entrada real del empleado (desde biométrico)
                var horaSalidaRegistro = primerRegistro.salida;     // Hora de salida real del empleado (desde biométrico)
                
                // DATOS DEL HORARIO SEMANAL CONFIGURADO
                var horarioSemanal = horariosPorDia[diaSemana];      // Horario completo del día (desde configuración)
                
                // VERIFICAR SI ES JORNADA CON UN SOLO REGISTRO (sin comida)
                // Si solo hay 1 registro, significa que no hubo comida → siempre jornada interrumpida
                if (registrosDelDia.length === 1) {
                    console.log('🔍 Jornada con un solo registro detectada - Sin comida');
                    
                    var resultadoInterrumpido = {
                        entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                        entrada_comida: "00:00",   // No hay comida - valor nulo
                        termino_comida: "00:00",   // No hay comida - valor nulo
                        salida: horaSalidaRegistro // Mantiene hora real (no redondea)
                    };
                    
                    resultadoFinal = resultadoInterrumpido;
                } else {
                    // VERIFICAR SI EL HORARIO OFICIAL CONTEMPLA COMIDA
                    // Si el horario oficial no tiene comida (00:00), siempre es jornada interrumpida
                    if (horarioSemanal.entrada_comida === "00:00" || horarioSemanal.termino_comida === "00:00") {
                        console.log('🔍 Horario oficial sin comida detectado - Jornada sin comida');
                        
                        var resultadoSinComida = {
                            entrada: procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada),
                            entrada_comida: "00:00",   // Horario oficial no contempla comida
                            termino_comida: "00:00",   // Horario oficial no contempla comida
                            salida: procesarFaltaSalida(horaSalidaRegistro, horarioSemanal.salida) // Procesa salida normal
                        };
                        
                        resultadoFinal = resultadoSinComida;
                    } else {
                        // CUANDO HAY 2+ REGISTROS Y HORARIO CON COMIDA: PROCESAR COMO JORNADA COMPLETA CON COMIDA
                        console.log('🔍 Jornada con 2+ registros y horario con comida detectada - Procesando con comida');
                        
                        // EJECUCIÓN DE CASOS NORMALES (1, 2, 3, 4, 6, 7, 8, 9): Jornada completa con comida
                        // Origen de datos: procesarJornadaNormal() llama internamente a:
                        //   - procesarFaltaEntrada() -> procesarRetardoEntrada() (CASOS 1 y 3)
                        //   - procesarFaltaSalida() -> procesarSalidaAnticipada() (CASOS 2 y 4)
                        //   - procesarFaltaSalidaComida() -> procesarSalidaComidaAnticipada() (CASOS 6 y 8)
                        //   - procesarFaltaRegresoComida() -> procesarRegresoComidaTarde() (CASOS 7 y 9)
                        resultadoFinal = procesarJornadaNormal(registrosDelDia, horarioSemanal, horaEntradaRegistro);
                    }
                }
                
                console.log('🔍 DEBUG - Resultado final antes de guardar:', resultadoFinal);
                
                // Crear registro redondeado final con estructura simple
                var registroRedondeadoSimple = {
                    fecha: fecha,                                    // Fecha del registro (desde biométrico)
                    entrada: resultadoFinal.entrada,               // Entrada redondeada (puede ser real o programada)
                    entrada_comida: resultadoFinal.entrada_comida,  // Entrada a comida (programada o 00:00)
                    termino_comida: resultadoFinal.termino_comida,   // Término de comida (programada o 00:00)
                    salida: resultadoFinal.salida                   // Salida redondeada (puede ser real o programada)
                };
                
                console.log('🔍 DEBUG - Registro que se guardará:', registroRedondeadoSimple);
                
                empleado.biometrico_redondeado.push(registroRedondeadoSimple);
            }
        }
    });
    
    console.log('✅ Registros redondeados para', empleado.nombre, ':', empleado.biometrico_redondeado);
}

// ========================================
// FUNCIONES PARA CADA CASO DE REDONDEO
// ========================================

// CASO 1: Retardo en entrada
// EJECUCIÓN: Se llama desde procesarFaltaEntrada() cuando existe marcaje de entrada
// CONDICIÓN: horaEntradaRegistro > horaEntradaSemanal
// ORIGEN: procesarFaltaEntrada() -> procesarRetardoEntrada()
function procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    // DATOS: horaEntradaRegistro (desde biométrico), horaEntradaSemanal (desde configuración)
    var minutosRegistro = convertirHoraAMinutos(horaEntradaRegistro);  // Convertir hora real a minutos
    var minutosSemanal = convertirHoraAMinutos(horaEntradaSemanal);    // Convertir hora programada a minutos
    
    if (minutosRegistro > minutosSemanal) {
        // Si hora real > hora programada: hay retardo - mantiene hora real
        console.log('❌ Retardo detectado - Entrada sin redondear:', horaEntradaRegistro);
        return horaEntradaRegistro; // Retorna hora real (sin redondear)
    } else {
        // Si hora real ≤ hora programada: llegó a tiempo - redondea a hora programada
        console.log('✅ A tiempo - Entrada redondeada:', horaEntradaSemanal);
        return horaEntradaSemanal; // Retorna hora programada (redondeada)
    }
}

// CASO 2: Salida anticipada
// EJECUCIÓN: Se llama desde procesarFaltaSalida() cuando existe marcaje de salida
// CONDICIÓN: horaSalidaRegistro < horaSalidaSemanal
// ORIGEN: procesarFaltaSalida() -> procesarSalidaAnticipada()
function procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal) {
    // DATOS: horaSalidaRegistro (desde biométrico), horaSalidaSemanal (desde configuración)
    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);  // Convertir hora real a minutos
    var minutosSalidaSemanal = convertirHoraAMinutos(horaSalidaSemanal);    // Convertir hora programada a minutos
    
    if (minutosSalidaRegistro < minutosSalidaSemanal) {
        // Si hora real < hora programada: salida anticipada - mantiene hora real
        console.log('❌ Salida anticipada - Salida sin redondear:', horaSalidaRegistro);
        return horaSalidaRegistro; // Retorna hora real (sin redondear)
    } else {
        // Si hora real ≥ hora programada: salida correcta - redondea a hora programada
        console.log('✅ Salida correcta - Salida redondeada:', horaSalidaSemanal);
        return horaSalidaSemanal; // Retorna hora programada (redondeada)
    }
}

// CASO 3: Falta de entrada
// EJECUCIÓN: Se llama desde procesarJornadaNormal() para procesar entrada
// CONDICIÓN: !horaEntradaRegistro || horaEntradaRegistro.trim() === ''
// ORIGEN: procesarJornadaNormal() -> procesarFaltaEntrada()
function procesarFaltaEntrada(horaEntradaRegistro, horaEntradaSemanal) {
    // DATO: horaEntradaRegistro (desde biométrico), horaEntradaSemanal (desde configuración)
    if (!horaEntradaRegistro || horaEntradaRegistro.trim() === '') {
        // Si no hay marcaje: autocompleta con hora programada
        console.log('🔧 Falta de entrada - Autocompletada:', horaEntradaSemanal);
        return horaEntradaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa como retardo o a tiempo
    return procesarRetardoEntrada(horaEntradaRegistro, horaEntradaSemanal);
}

// CASO 4: Falta de salida
// EJECUCIÓN: Se llama desde procesarJornadaNormal() para procesar salida
// CONDICIÓN: !horaSalidaRegistro || horaSalidaRegistro.trim() === ''
// ORIGEN: procesarJornadaNormal() -> procesarFaltaSalida()
function procesarFaltaSalida(horaSalidaRegistro, horaSalidaSemanal) {
    // DATO: horaSalidaRegistro (desde biométrico), horaSalidaSemanal (desde configuración)
    if (!horaSalidaRegistro || horaSalidaRegistro.trim() === '') {
        // Si no hay marcaje: autocompleta con hora programada
        console.log('🔧 Falta de salida - Autocompletada:', horaSalidaSemanal);
        return horaSalidaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa como salida anticipada o correcta
    return procesarSalidaAnticipada(horaSalidaRegistro, horaSalidaSemanal);
}

// CASO 5: Jornada interrumpida (salida antes de comida)
// EJECUCIÓN: Se llama directamente desde redondearRegistrosEmpleado()
// CONDICIÓN: horaSalidaRegistro <= horarioSemanal.entrada_comida
// ORIGEN: redondearRegistrosEmpleado() -> procesarJornadaInterrumpida()
function procesarJornadaInterrumpida(horaEntradaRegistro, horaSalidaRegistro, horarioSemanal) {
    // DATOS: horaSalidaRegistro (desde biométrico), horarioSemanal.entrada_comida (desde configuración)
    var minutosSalidaRegistro = convertirHoraAMinutos(horaSalidaRegistro);           // Convertir hora real a minutos
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(horarioSemanal.entrada_comida); // Convertir hora comida programada a minutos
    
    console.log('🔍 DEBUG - CASO 5:');
    console.log('  - Salida registro:', horaSalidaRegistro, 'minutos:', minutosSalidaRegistro);
    console.log('  - Entrada comida semanal:', horarioSemanal.entrada_comida, 'minutos:', minutosEntradaComidaSemanal);
    console.log('  - ¿Salida <= Comida?:', minutosSalidaRegistro, '<=', minutosEntradaComidaSemanal, '=', minutosSalidaRegistro <= minutosEntradaComidaSemanal);
    
    if (minutosSalidaRegistro <= minutosEntradaComidaSemanal) {
        // Si salió antes o exactamente a la hora de comida: jornada interrumpida
        console.log('⚠️ Jornada interrumpida - Salida antes o exactamente a hora de comida:', horaSalidaRegistro);
        
        var entradaProcesada = procesarFaltaEntrada(horaEntradaRegistro, horarioSemanal.entrada);
        
        var resultado = {
            entrada: entradaProcesada, // Procesa entrada (puede ser autocompletada)
            entrada_comida: "00:00",   // No hay comida - valor nulo
            termino_comida: "00:00",   // No hay comida - valor nulo
            salida: horaSalidaRegistro // Mantiene hora real (no redondea)
        };
        
        console.log('🔍 DEBUG - Resultado CASO 5:', resultado);
        return resultado;
    }
    return null; // No es jornada interrumpida
}

// CASO 6: Salida a comer antes del horario oficial
// EJECUCIÓN: Se llama desde procesarJornadaNormal() cuando hay 2+ registros
// CONDICIÓN: horaSalidaComidaRegistro < horarioSemanal.entrada_comida
// ORIGEN: procesarJornadaNormal() -> procesarSalidaComidaAnticipada()
function procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    // DATOS: horaSalidaComidaRegistro (desde biométrico), horaEntradaComidaSemanal (desde configuración)
    var minutosSalidaComidaRegistro = convertirHoraAMinutos(horaSalidaComidaRegistro);  // Convertir hora real a minutos
    var minutosEntradaComidaSemanal = convertirHoraAMinutos(horaEntradaComidaSemanal);    // Convertir hora programada a minutos
    
    if (minutosSalidaComidaRegistro < minutosEntradaComidaSemanal) {
        // Si salió a comer antes de hora programada: salida anticipada a comida - mantiene hora real
        console.log('❌ Salida a comida anticipada - Salida a comida sin redondear:', horaSalidaComidaRegistro);
        return horaSalidaComidaRegistro; // Retorna hora real (sin redondear)
    } else {
        // Si salió a comer en o después de hora programada: cumple horario - redondea a hora programada
        console.log('✅ Salida a comida correcta - Salida a comida redondeada:', horaEntradaComidaSemanal);
        return horaEntradaComidaSemanal; // Retorna hora programada (redondeada)
    }
}

// CASO 7: Regreso de comida después del horario oficial
// EJECUCIÓN: Se llama desde procesarJornadaNormal() cuando hay 2+ registros
// CONDICIÓN: horaRegresoComidaRegistro > horarioSemanal.termino_comida
// ORIGEN: procesarJornadaNormal() -> procesarRegresoComidaTarde()
function procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    // DATOS: horaRegresoComidaRegistro (desde biométrico), horaTerminoComidaSemanal (desde configuración)
    var minutosRegresoComidaRegistro = convertirHoraAMinutos(horaRegresoComidaRegistro);  // Convertir hora real a minutos
    var minutosTerminoComidaSemanal = convertirHoraAMinutos(horaTerminoComidaSemanal);    // Convertir hora programada a minutos
    
    if (minutosRegresoComidaRegistro > minutosTerminoComidaSemanal) {
        // Si regresó después de hora programada: regreso tardío - redondea a hora programada
        console.log('✅ Regreso de comida tardío - Regreso redondeado:', horaTerminoComidaSemanal);
        return horaTerminoComidaSemanal; // Retorna hora programada (redondeada)
    } else {
        // Si regresó en o antes de hora programada: cumple horario - redondea a hora programada
        console.log('✅ Regreso de comida correcto - Regreso redondeado:', horaTerminoComidaSemanal);
        return horaTerminoComidaSemanal; // Retorna hora programada (redondeada)
    }
}

// CASO 8: Falta de marcaje en salida a comer
// EJECUCIÓN: Se llama desde procesarJornadaNormal() cuando hay 2+ registros
// CONDICIÓN: horaSalidaComidaRegistro está vacío o es ""
// ORIGEN: procesarJornadaNormal() -> procesarFaltaSalidaComida()
function procesarFaltaSalidaComida(horaSalidaComidaRegistro, horaEntradaComidaSemanal) {
    // DATO: horaSalidaComidaRegistro (desde biométrico), horaEntradaComidaSemanal (desde configuración)
    if (!horaSalidaComidaRegistro || horaSalidaComidaRegistro.trim() === '') {
        // Si no hay marcaje de salida a comer: autocompleta con hora programada
        console.log('🔧 Falta de salida a comer - Autocompletada:', horaEntradaComidaSemanal);
        return horaEntradaComidaSemanal; // Retorna hora programada (autocompletada)
    }
    // Si hay marcaje: procesa normal (aplica CASO 6)
    return procesarSalidaComidaAnticipada(horaSalidaComidaRegistro, horaEntradaComidaSemanal);
}

// CASO 9: Falta de marcaje en regreso de comida
// EJECUCIÓN: Se llama desde procesarJornadaNormal() cuando hay 2+ registros
// CONDICIÓN: horaRegresoComidaRegistro está vacío o es ""
// ORIGEN: procesarJornadaNormal() -> procesarFaltaRegresoComida()
function procesarFaltaRegresoComida(horaRegresoComidaRegistro, horaTerminoComidaSemanal) {
    // DATO: horaRegresoComidaRegistro (desde biométrico), horaTerminoComidaSemanal (desde configuración)
    if (!horaRegresoComidaRegistro || horaRegresoComidaRegistro.trim() === '') {
        // Si no hay marcaje de regreso de comida: autocompleta con hora programada
        console.log('🔧 Falta de regreso de comida - Autocompletado:', horaTerminoComidaSemanal);
        return horaTerminoComidaSemanal; // Retorna hora programada (autocompletado)
    }
    // Si hay marcaje: procesa normal (aplica CASO 7)
    return procesarRegresoComidaTarde(horaRegresoComidaRegistro, horaTerminoComidaSemanal);
}

// Función auxiliar para procesar jornada normal con comida
// EJECUCIÓN: Se llama desde redondearRegistrosEmpleado() cuando no es jornada interrumpida
// CONDICIÓN: horaSalidaRegistro ≥ horarioSemanal.entrada_comida
// ORIGEN: redondearRegistrosEmpleado() -> procesarJornadaNormal()
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

