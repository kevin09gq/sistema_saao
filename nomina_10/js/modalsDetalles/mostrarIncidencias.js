//==========================================================
// FUNCIÓN PARA MOSTRAR LOS OLVIDOS DEL BIOMÉTRICO
//==========================================================

function establecerEventosOlvidosBiometrico(registros) {

    // Limpiar contenedor
    $("#olvidos-checador-confianza").empty();

    let totalOlvidos = 0;

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#olvidos-checador-confianza").html(`
            <div class="text-muted text-center">
                No hubo olvidos.
            </div>
        `);

        $("#total-olvidos-checador-confianza").text(0);

        return;
    }

    // Recorrer registros
    registros.forEach((registro) => {

        // Verificar si el empleado asistió ese día
        const asistio =
            registro.entrada !== "" ||
            registro.salida !== "";

        // Si no asistió, no cuenta como olvido
        if (!asistio) {
            return;
        }

        // Si asistió y falta una marca, es olvido
        if (registro.entrada === "" || registro.salida === "") {

            totalOlvidos++;
            registro.claseEvento = "table-danger"; // Olvido Biométrico: Rojo

            $("#olvidos-checador-confianza").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-exclamation-circle-fill text-danger me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // Si no hubo olvidos
    if (totalOlvidos === 0) {

        $("#olvidos-checador-confianza").html(`
            <div class="text-success text-center">
                Sin olvidos.
            </div>
        `);

    }

    // Mostrar total
    $("#total-olvidos-checador-confianza").text(totalOlvidos);

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS ENTRADAS TEMPRANAS
//==========================================================

function establecerEventosEntradasTempranas(empleado) {

    // Limpiar contenedor
    $("#entradas-tempranas-confianza").empty();

    // Acumulador de minutos
    let minutosTotalesEntradasTempranas = 0;

    // Obtener registros del empleado
    let registros = empleado.registros || [];
    
    // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#entradas-tempranas-confianza").html(`
            <div class="text-muted text-center">
                No hubo entradas tempranas.
            </div>
        `);

        $("#total-entradas-tempranas-confianza").text("00:00");

        return;
    }


    registros.forEach(function (registro) {


        // Si no tiene entrada, no se evalúa
        if (!registro.entrada) {
            return;
        }



        // buscar el horario correspondiente al día
        let horario = horario_oficial.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(registro.dia);

        });



        // Si no existe horario, continuar
        if (!horario || !horario.entrada) {
            return;
        }


        // Convertir horas a minutos
        let entradaEmpleado = convertirHoraAMinutos(registro.entrada);

        let entradaHorario = convertirHoraAMinutos(horario.entrada);



        // Una hora antes de la entrada programada
        let limiteEntradaTemprana = entradaHorario - 60;



        // Llegó una hora o más antes
        if (entradaEmpleado <= limiteEntradaTemprana) {

            let minutosAntes = entradaHorario - entradaEmpleado;

            // Acumular minutos
            minutosTotalesEntradasTempranas += minutosAntes;
            registro.claseEvento = "table-primary"; // Entrada temprana: Azul

            $("#entradas-tempranas-confianza").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-sunrise-fill text-primary me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                    <span class="text-primary">
                        (${convertirMinutosAHorasMinutos(minutosAntes)} antes)
                    </span>
                </div>
            `);

        }

    });

    // Si no hubo entradas tempranas
    if (minutosTotalesEntradasTempranas === 0) {

        $("#entradas-tempranas-confianza").html(`
            <div class="text-success text-center">
                Sin entradas tempranas.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-entradas-tempranas-confianza")
        .text(convertirMinutosAHorasMinutos(minutosTotalesEntradasTempranas));

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TARDÍAS
//==========================================================

function establecerEventosSalidasTardias(empleado) {

    // Limpiar contenedor
    $("#salidas-tardias-confianza").empty();

    // Acumulador de minutos
    let minutosTotalesSalidasTardias = 0;

    // Obtener registros del empleado
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial;


    // Validar registros
    if (!registros || registros.length == 0) {

        $("#salidas-tardias-confianza").html(`
            <div class="text-muted text-center">
                No hubo salidas tardías.
            </div>
        `);

        $("#total-salidas-tardias-confianza").text("00:00");

        return;
    }


    // AGRUPAR REGISTROS POR FECHA

    let registrosPorDia = {};

    registros.forEach(function (registro) {


        if (!registrosPorDia[registro.fecha]) {

            registrosPorDia[registro.fecha] = [];

        }


        registrosPorDia[registro.fecha].push(registro);


    });


    // RECORRER CADA DÍA

    Object.keys(registrosPorDia).forEach(function (fecha) {


        let registrosDia = registrosPorDia[fecha];


        // Tomar el registro con la última salida
        let ultimaSalida = null;



        registrosDia.forEach(function (registro) {

            if (!registro.salida) {
                return;
            }


            if (
                ultimaSalida == null ||
                convertirHoraRegistroAMinutos(registro.salida, true) >
                convertirHoraRegistroAMinutos(ultimaSalida.salida, true)
            ) {
                ultimaSalida = registro;
            }

        });

        // Si no encontró salida
        if (!ultimaSalida) {
            return;
        }



        // buscar el horario correspondiente al día
        let horario = horario_oficial.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(ultimaSalida.dia);

        });


        if (!horario || !horario.salida) {
            return;
        }


        // Convertir considerando cambio de día
        let salidaEmpleado =
            convertirHoraRegistroAMinutos(
                ultimaSalida.salida,
                true
            );


        let salidaHorario =
            convertirHoraRegistroAMinutos(
                horario.salida,
                true
            );


        // Una hora después de la salida programada
        let limiteSalidaTardia = salidaHorario + 60;

        // Si salió una hora o más tarde
        if (salidaEmpleado >= limiteSalidaTardia) {

            let minutosDespues =
                salidaEmpleado - salidaHorario;


            // Acumular minutos
            minutosTotalesSalidasTardias += minutosDespues;
            ultimaSalida.claseEvento = "table-orange"; // Salida tardía: Naranja

            $("#salidas-tardias-confianza").append(`
                <div class="small py-1 border-bottom">

                    <i class="bi bi-sunset-fill me-1" style="color: #fd7e14;"></i>


                    <strong>${ultimaSalida.dia}</strong> - ${ultimaSalida.fecha}


                    <span style="color: #fd7e14;">
                        (${convertirMinutosAHorasMinutos(minutosDespues)} después)
                    </span>


                </div>
            `);



        }



    });


    // Si no hubo salidas tardías
    if (minutosTotalesSalidasTardias === 0) {


        $("#salidas-tardias-confianza").html(`
            <div class="text-success text-center">
                Sin salidas tardías.
            </div>
        `);


    }


    // Mostrar total acumulado
    $("#total-salidas-tardias-confianza")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTardias));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TEMPRANAS
//==========================================================

function establecerEventosSalidasTempranas(empleado) {

    // Limpiar contenedor
    $("#salidas-tempranas-confianza").empty();

    // Acumulador de minutos
    let minutosTotalesSalidasTempranas = 0;

    // Obtener registros del empleado
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial;


    if (!registros || registros.length == 0) {


        $("#salidas-tempranas-confianza").html(`
            <div class="text-muted text-center">
                No hubo salidas tempranas.
            </div>
        `);


        $("#total-salidas-tempranas-confianza").text("00:00");


        return;

    }

    // AGRUPAR REGISTROS POR FECHA

    let registrosPorDia = {};

    registros.forEach(function (registro) {


        if (!registrosPorDia[registro.fecha]) {


            registrosPorDia[registro.fecha] = [];


        }


        registrosPorDia[registro.fecha].push(registro);


    });


    // RECORRER CADA DÍA

    Object.keys(registrosPorDia).forEach(function (fecha) {

        let registrosDia = registrosPorDia[fecha];

        // Buscar la última salida del día
        let ultimaSalida = null;

        registrosDia.forEach(function (registro) {


            if (!registro.salida) {

                return;

            }

            if (
                ultimaSalida == null ||
                convertirHoraRegistroAMinutos(registro.salida) >
                convertirHoraRegistroAMinutos(ultimaSalida.salida)
            ) {


                ultimaSalida = registro;


            }

        });


        // Si no hay salida, continuar
        if (!ultimaSalida) {

            return;

        }


        // Buscar horario del día
        let horario = horario_oficial.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(ultimaSalida.dia);

        });

        if (!horario || !horario.salida) {

            return;

        }

        // Convertir salidas considerando cambio de día
        let salidaEmpleado =
            convertirHoraRegistroAMinutos(
                ultimaSalida.salida
            );

        let salidaHorario =
            convertirHoraRegistroAMinutos(
                horario.salida
            );


        // Diferencia de minutos antes de la salida
        let minutosAntes = salidaHorario - salidaEmpleado;

        // Salió 5 minutos o más antes
        if (minutosAntes >= 5) {

            minutosTotalesSalidasTempranas += minutosAntes;
            ultimaSalida.claseEvento = "table-purple"; // Salida temprana: Morado

            $("#salidas-tempranas-confianza").append(`
                <div class="small py-1 border-bottom">

                    <i class="bi bi-box-arrow-right me-1" style="color: #6f42c1;"></i>


                    <strong>${ultimaSalida.dia}</strong> - ${ultimaSalida.fecha}


                    <span style="color: #6f42c1;">
                        (${convertirMinutosAHorasMinutos(minutosAntes)} antes)
                    </span>


                </div>
            `);
        }

    });


    // Si no hubo salidas tempranas
    if (minutosTotalesSalidasTempranas === 0) {

        $("#salidas-tempranas-confianza").html(`
            <div class="text-success text-center">
                Sin salidas tempranas.
            </div>
        `);
    }

    // Mostrar total acumulado
    $("#total-salidas-tempranas-confianza")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTempranas));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS RETARDOS
//==========================================================
function establecerEventosRetardos(empleado) {

    // Limpiar contenedor
    $("#retardos-confianza").empty();

    // Acumulador de minutos
    let minutosTotalesRetardos = 0;

    // Obtener registros del empleado
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial;


    // Validar registros
    if (!registros || registros.length == 0) {

        $("#retardos-confianza").html(`
            <div class="text-muted text-center">
                No hubo retardos.
            </div>
        `);

        $("#total-retardos-confianza").text("00:00");

        return;
    }

    // AGRUPAR POR FECHA Y TOMAR LA PRIMERA ENTRADA DEL DÍA
    let primerasEntradas = {};

    registros.forEach(function (registro) {

        // Si no tiene entrada no se toma
        if (!registro.entrada) {
            return;
        }

        // Si todavía no existe esa fecha
        if (!primerasEntradas[registro.fecha]) {

            primerasEntradas[registro.fecha] = registro;

        } else {

            // Comparar cuál entrada es más temprana
            let entradaActual = convertirHoraAMinutos(
                primerasEntradas[registro.fecha].entrada
            );

            let nuevaEntrada = convertirHoraAMinutos(
                registro.entrada
            );

            if (nuevaEntrada < entradaActual) {

                primerasEntradas[registro.fecha] = registro;

            }

        }

    });

    // Obtener primeras entradas
    let registrosEntrada = Object.values(primerasEntradas);

    registrosEntrada.forEach(function (registro) {

        // Buscar horario del día
        let horario = horario_oficial.find(function (item) {

            return normalizarDia(item.dia) === normalizarDia(registro.dia);

        });


        if (!horario || !horario.entrada) {
            return;
        }

        // Convertir horas a minutos
        let entradaEmpleado = convertirHoraAMinutos(registro.entrada);
        let entradaHorario = convertirHoraAMinutos(horario.entrada);

        // Diferencia de minutos tarde
        let minutosRetardo = entradaEmpleado - entradaHorario;

        // Si entró después del horario
        if (minutosRetardo > 0) {

            // Acumular minutos
            minutosTotalesRetardos += minutosRetardo;
            registro.claseEvento = "table-warning"; // Retardo: Amarillo

            $("#retardos-confianza").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-clock-history text-warning me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                    <span class="text-warning">
                        (${convertirMinutosAHorasMinutos(minutosRetardo)} tarde)
                    </span>
                </div>
            `);

        }

    });

    // Si no hubo retardos
    if (minutosTotalesRetardos === 0) {

        $("#retardos-confianza").html(`
            <div class="text-success text-center">
                Sin retardos.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-retardos-confianza")
        .text(convertirMinutosAHorasMinutos(minutosTotalesRetardos));

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS AUSENTISMOS
//==========================================================

function establecerEventosAusentismos(empleado) {

    // limpiar contenedor
    $("#inasistencias-content-confianza").empty();

    let totalAusentismos = 0;

    // obtener registros del empleado
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial;


    // validar registros
    if (!registros || registros.length == 0) {

        $("#inasistencias-content-confianza").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

        $("#total-inasistencias-confianza").text(0);

        return;
    }

    // validar horario
    if (!horario_oficial || horario_oficial.length == 0) {

        $("#inasistencias-content-confianza").html(`
            <div class="text-muted text-center">
                Sin horario configurado.
            </div>
        `);

        $("#total-inasistencias-confianza").text(0);

        return;
    }

    // recorrer registros
    registros.forEach(function (registro) {

        // buscar horario del día
        let horario = horario_oficial.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(registro.dia);

        });

        // si no existe horario para ese día
        if (!horario) {
            return;
        }

        // si el día no tiene entrada programada no es laboral
        if (!horario.entrada || horario.entrada.trim() == "") {
            return;
        }

        // validar que tenía que trabajar pero no marcó nada
        if (
            (!registro.entrada || registro.entrada.trim() == "") &&
            (!registro.salida || registro.salida.trim() == "")
        ) {

            totalAusentismos++;

            registro.claseEvento = "table-success";

            $("#inasistencias-content-confianza").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-person-x-fill text-success me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // si no hubo ausencias
    if (totalAusentismos === 0) {

        $("#inasistencias-content-confianza").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

    }

    // mostrar total
    $("#total-inasistencias-confianza")
        .text(totalAusentismos);

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EXCESO DE HORA COMIDA
//==========================================================

function establecerEventosComidaExtra(empleado) {

    // limpiar contenedor
    $("#comida-confianza").empty();

    // acumulador de minutos extra
    let minutosTotalesComidaExtra = 0;

    // validar que el empleado tenga registros
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horario_oficial = empleado.horario_oficial;

    if (registros.length == 0) {

        $("#comida-confianza").html(`
            <div class="text-muted text-center">
                Sin comida extra.
            </div>
        `);

        $("#total-comida-confianza").text("00:00");

        return;
    }

    // validar que el empleado tenga horario oficial
    let horarioOficial = empleado.horario_oficial || [];

    if (horarioOficial.length == 0) {

        $("#comida-confianza").html(`
            <div class="text-muted text-center">
                Sin comida extra.
            </div>
        `);

        $("#total-comida-confianza").text("00:00");

        return;
    }

    // agrupar registros por fecha
    let registrosPorDia = {};

    registros.forEach(function (registro) {

        if (!registrosPorDia[registro.fecha]) {

            registrosPorDia[registro.fecha] = [];

        }

        registrosPorDia[registro.fecha].push(registro);

    });

    // recorrer cada día
    Object.keys(registrosPorDia).forEach(function (fecha) {

        let registrosDia = registrosPorDia[fecha];

        // buscar horario oficial correspondiente al día
        let horario = horarioOficial.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(registrosDia[0].dia);

        });

        // si no existe horario, continuar
        if (!horario) {
            return;
        }

        // validar si el horario tiene periodo de comida
        let tieneComida =
            horario.salida_comida &&
            horario.entrada_comida;

        // si no tiene comida programada, no se evalúa
        if (!tieneComida) {
            return;
        }

        // debe existir salida a comida y entrada de comida
        if (
            registrosDia.length < 2 ||
            !registrosDia[0].salida ||
            !registrosDia[1].entrada
        ) {
            return;
        }

        // obtener salida a comida
        let salidaComida =
            convertirHoraAMinutos(registrosDia[0].salida);

        // obtener entrada después de comida
        let entradaComida =
            convertirHoraAMinutos(registrosDia[1].entrada);

        // calcular tiempo real de comida
        let minutosTomados =
            entradaComida - salidaComida;

        // validar que el resultado sea válido
        if (minutosTomados <= 0) {
            return;
        }

        // calcular tiempo permitido según el horario oficial
        let inicioComida =
            convertirHoraAMinutos(horario.salida_comida);

        let finComida =
            convertirHoraAMinutos(horario.entrada_comida);

        // calcular minutos permitidos
        let minutosPermitidos =
            finComida - inicioComida;

        // si cruza medianoche
        if (minutosPermitidos < 0) {

            minutosPermitidos += 1440;

        }

        // calcular exceso de comida
        let minutosExtra =
            minutosTomados - minutosPermitidos;

        // si tomó más tiempo del permitido
        if (minutosExtra > 0) {

            minutosTotalesComidaExtra += minutosExtra;

            // marcar el registro de entrada después de comida
            registrosDia[1].claseEvento = "table-brown";

            $("#comida-confianza").append(`
                <div class="small py-1 border-bottom">

                    <i class="bi bi-clock-history me-1"
                       style="color:#795548;"></i>

                    <strong>${registrosDia[0].dia}</strong>
                    -
                    ${registrosDia[0].fecha}

                    <span style="color:#795548;">
                        (${convertirMinutosAHorasMinutos(minutosExtra)} extra)
                    </span>

                </div>
            `);

        }

    });

    // si no hubo excesos
    if (minutosTotalesComidaExtra == 0) {

        $("#comida-confianza").html(`
            <div class="text-success text-center">
                Sin comida extra.
            </div>
        `);

    }

    // mostrar total acumulado
    $("#total-comida-confianza").text(
        convertirMinutosAHorasMinutos(
            minutosTotalesComidaExtra
        )
    );

}

//==========================================================
// FUNCIÓN PARA MOSTRAR MARCAJES EXCEDENTES
//==========================================================

function establecerEventosMarcajes(empleado) {

    // limpiar contenedor
    $("#marcajes-confianza").empty();

    // acumulador de días con marcajes excedentes
    let totalMarcajesExcedentes = 0;

    // obtener registros del empleado
    let registros = empleado.registros || [];

     // Obtener Horario Oficial
    let horarioEmpleado = empleado.horario_oficial;



    // validar registros
    if (registros.length == 0) {

        $("#marcajes-confianza").html(`
            <div class="text-muted text-center">
                Sin marcajes excedentes.
            </div>
        `);

        $("#total-marcajes-confianza").text(0);

        return;
    }

    

    // validar que exista el horario
    if (!horarioEmpleado || horarioEmpleado.length == 0) {

        $("#marcajes-confianza").html(`
            <div class="text-muted text-center">
                No se encontró el horario del empleado.
            </div>
        `);

        $("#total-marcajes-confianza").text(0);

        return;
    }

    // agrupar registros por fecha
    let registrosPorDia = {};

    registros.forEach(function (registro) {

        if (!registrosPorDia[registro.fecha]) {

            registrosPorDia[registro.fecha] = [];

        }

        registrosPorDia[registro.fecha].push(registro);

    });

    // revisar cada día
    Object.keys(registrosPorDia).forEach(function (fecha) {

        let registrosDia = registrosPorDia[fecha];

        // buscar horario correspondiente al día
        let horario = horarioEmpleado.find(function (item) {

            return normalizarDia(item.dia) ===
                normalizarDia(registrosDia[0].dia);

        });

        // si no existe horario, continuar
        if (!horario) {

            return;

        }

        // contar todos los marcajes del día
        let cantidadMarcajes = 0;

        registrosDia.forEach(function (registro) {

            if (registro.entrada) {

                cantidadMarcajes++;

            }

            if (registro.salida) {

                cantidadMarcajes++;

            }

        });

        // determinar límite de marcajes
        let limiteMarcajes = 2;

        // tipo 2 no tiene horario de comida
        // por lo tanto su límite permanece en 2

        // si supera los marcajes permitidos
        if (cantidadMarcajes > limiteMarcajes) {

            totalMarcajesExcedentes++;

            // marcar todos los registros del día
            registrosDia.forEach(function (registro) {

                registro.claseEvento = "table-pink";

            });

            $("#marcajes-confianza").append(`

                <div class="small py-1 border-bottom">

                    <i class="bi bi-clock-fill me-1"
                       style="color:#e83e8c;">
                    </i>

                    <strong>${registrosDia[0].dia}</strong>
                    - ${fecha}

                    <span style="color:#e83e8c;">
                        (${cantidadMarcajes} marcajes)
                    </span>

                </div>

            `);

        }

    });

    // si no hubo excedentes
    if (totalMarcajesExcedentes === 0) {

        $("#marcajes-confianza").html(`

            <div class="text-success text-center">

                Sin marcajes excedentes.

            </div>

        `);

    }

    // mostrar total
    $("#total-marcajes-confianza")
        .text(totalMarcajesExcedentes);

}


//==========================================================
// CONVERTIR MINUTOS A FORMATO HORAS Y MINUTOS
//==========================================================

function convertirMinutosAHorasMinutos(minutos) {

    let horas = Math.floor(minutos / 60);

    let minutosRestantes = minutos % 60;

    return String(horas).padStart(2, "0") + ":" +
        String(minutosRestantes).padStart(2, "0");

}

function convertirHoraRegistroAMinutos(hora, esSalida = false) {

    if (!hora) {
        return null;
    }

    let minutos = convertirHoraAMinutos(hora);


    // Salidas entre 00:00 y 05:00 pertenecen al día siguiente
    if (esSalida && minutos <= 300) {

        minutos += 1440;

    }


    return minutos;

}


//==========================================================
// FUNCIÓN PARA OBTENER CLASE DEL EVENTO DEL REGISTRO
// DE ACUERDO A SU TIPO VA HACER EL COLOR DE LA FILA EN LA TABLA
//==========================================================
function obtenerClaseEventoRegistro(registro) {
    return registro.claseEvento || "";
}



//=============================================================
// FUNCION PARA CONVERTIR UNA HORA EN FORMATO HH:MM A MINUTOS
//=============================================================

function convertirHoraAMinutos(hora) {
    var partes = hora.split(':');
    var horas = parseInt(partes[0], 10);
    var minutos = parseInt(partes[1], 10);
    return horas * 60 + minutos;
}
