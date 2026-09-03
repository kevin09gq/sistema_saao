//==========================================================
// FUNCIÓN AUXILIAR PARA OBTENER LA ESTRUCTURA DE NÓMINA RELICARIO
//==========================================================
function obtenerDatosNominaPilar(dataNomina = null) {
    if (dataNomina && dataNomina.departamentos) {
        return dataNomina;
    }
    if (typeof jsonNominaPilar !== 'undefined' && jsonNominaPilar && jsonNominaPilar.departamentos) {
        return jsonNominaPilar;
    }
    if (typeof jsonHistorialPilar !== 'undefined' && jsonHistorialPilar && jsonHistorialPilar.departamentos) {
        return jsonHistorialPilar;
    }
    return null;
}

//==========================================================
// FUNCIÓN AUXILIAR PARA OBTENER EL HORARIO DEL EMPLEADO
//==========================================================
function obtenerHorarioEmpleadoPilar(empleado, dataNomina = null) {
    if (!empleado) return [];
    let data = obtenerDatosNominaPilar(dataNomina);
    let departamentos = data?.departamentos || [];
    let departamentoEmpleado = departamentos.find(function (departamento) {
        return departamento.id_departamento == empleado.id_departamento;
    });

    if (departamentoEmpleado) {
        if (departamentoEmpleado.tipo_horario == 1) {
            return empleado.horario_oficial || [];
        } else if (departamentoEmpleado.tipo_horario == 2) {
            return data?.horarioRancho || [];
        }
    }

    return empleado.horario_oficial || data?.horarioRancho || [];
}

//==========================================================
// FUNCIÓN AUXILIAR PARA OBTENER EL DEPARTAMENTO DEL EMPLEADO
//==========================================================
function obtenerDepartamentoEmpleadoPilar(empleado, dataNomina = null) {
    if (!empleado) return null;
    let data = obtenerDatosNominaPilar(dataNomina);
    let departamentos = data?.departamentos || [];
    return departamentos.find(function (departamento) {
        return departamento.id_departamento == empleado.id_departamento;
    }) || null;
}

//==========================================================
// FUNCIÓN PARA MOSTRAR LOS OLVIDOS DEL BIOMÉTRICO
//==========================================================

function establecerEventosOlvidosBiometrico(data) {

    // Limpiar contenedor
    $("#olvidos-checador-pilar").empty();

    let totalOlvidos = 0;
    let registros = Array.isArray(data) ? data : (data?.registros || []);

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#olvidos-checador-pilar").html(`
            <div class="text-muted text-center">
                No hubo olvidos.
            </div>
        `);

        $("#total-olvidos-checador-pilar").text(0);

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

            $("#olvidos-checador-pilar").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-exclamation-circle-fill text-danger me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // Si no hubo olvidos
    if (totalOlvidos === 0) {

        $("#olvidos-checador-pilar").html(`
            <div class="text-success text-center">
                Sin olvidos.
            </div>
        `);

    }

    // Mostrar total
    $("#total-olvidos-checador-pilar").text(totalOlvidos);

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS ENTRADAS TEMPRANAS
//==========================================================

function establecerEventosEntradasTempranas(empleado, dataNomina = null) {

    // Limpiar contenedor
    $("#entradas-tempranas-pilar").empty();

    // Acumulador de minutos
    let minutosTotalesEntradasTempranas = 0;

    // Obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#entradas-tempranas-pilar").html(`
            <div class="text-muted text-center">
                No hubo entradas tempranas.
            </div>
        `);

        $("#total-entradas-tempranas-pilar").text("00:00");

        return;
    }

    // obtener el horario según el tipo de horario del departamento
    let tipoHorario = obtenerHorarioEmpleadoPilar(empleado, dataNomina);

    if (!tipoHorario || tipoHorario.length == 0) {
        $("#entradas-tempranas-pilar").html(`
            <div class="text-muted text-center">
                Sin horario configurado.
            </div>
        `);
        $("#total-entradas-tempranas-pilar").text("00:00");
        return;
    }

    registros.forEach(function (registro) {


        // Si no tiene entrada, no se evalúa
        if (!registro.entrada) {
            return;
        }



        // buscar el horario correspondiente al día
        let horario = tipoHorario.find(function (item) {

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

            $("#entradas-tempranas-pilar").append(`
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

        $("#entradas-tempranas-pilar").html(`
            <div class="text-success text-center">
                Sin entradas tempranas.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-entradas-tempranas-pilar")
        .text(convertirMinutosAHorasMinutos(minutosTotalesEntradasTempranas));

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TARDÍAS
//==========================================================

function establecerEventosSalidasTardias(empleado, dataNomina = null) {

    // Limpiar contenedor
    $("#salidas-tardias-pilar").empty();

    // Acumulador de minutos
    let minutosTotalesSalidasTardias = 0;

    // Obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // obtener el horario según el tipo de horario del departamento
    let tipoHorario = obtenerHorarioEmpleadoPilar(empleado, dataNomina);

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#salidas-tardias-pilar").html(`
            <div class="text-muted text-center">
                No hubo salidas tardías.
            </div>
        `);

        $("#total-salidas-tardias-pilar").text("00:00");

        return;
    }

    if (!tipoHorario || tipoHorario.length == 0) {
        $("#salidas-tardias-pilar").html(`
            <div class="text-muted text-center">
                Sin horario configurado.
            </div>
        `);
        $("#total-salidas-tardias-pilar").text("00:00");
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
        let horario = tipoHorario.find(function (item) {

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

            $("#salidas-tardias-pilar").append(`
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


        $("#salidas-tardias-pilar").html(`
            <div class="text-success text-center">
                Sin salidas tardías.
            </div>
        `);


    }


    // Mostrar total acumulado
    $("#total-salidas-tardias-pilar")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTardias));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TEMPRANAS
//==========================================================

function establecerEventosSalidasTempranas(empleado, dataNomina = null) {

    // Limpiar contenedor
    $("#salidas-tempranas-pilar").empty();

    // Acumulador de minutos
    let minutosTotalesSalidasTempranas = 0;

    // Obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // obtener el horario según el tipo de horario del departamento
    let tipoHorario = obtenerHorarioEmpleadoPilar(empleado, dataNomina);

    if (!registros || registros.length == 0) {


        $("#salidas-tempranas-pilar").html(`
            <div class="text-muted text-center">
                No hubo salidas tempranas.
            </div>
        `);


        $("#total-salidas-tempranas-pilar").text("00:00");


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
        let horario = tipoHorario.find(function (item) {

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

            $("#salidas-tempranas-pilar").append(`
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

        $("#salidas-tempranas-pilar").html(`
            <div class="text-success text-center">
                Sin salidas tempranas.
            </div>
        `);
    }

    // Mostrar total acumulado
    $("#total-salidas-tempranas-pilar")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTempranas));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS RETARDOS
//==========================================================
function establecerEventosRetardos(empleado, dataNomina = null) {

    // Limpiar contenedor
    $("#retardos-pilar").empty();

    // Acumulador de minutos
    let minutosTotalesRetardos = 0;

    // Obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // obtener el horario según el tipo de horario del departamento
    let tipoHorario = obtenerHorarioEmpleadoPilar(empleado, dataNomina);


    // Validar registros
    if (!registros || registros.length == 0) {

        $("#retardos-pilar").html(`
            <div class="text-muted text-center">
                No hubo retardos.
            </div>
        `);

        $("#total-retardos-pilar").text("00:00");

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
        let horario = tipoHorario.find(function (item) {

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

            $("#retardos-pilar").append(`
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

        $("#retardos-pilar").html(`
            <div class="text-success text-center">
                Sin retardos.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-retardos-pilar")
        .text(convertirMinutosAHorasMinutos(minutosTotalesRetardos));

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS AUSENTISMOS
//==========================================================

function establecerEventosAusentismos(empleado, dataNomina = null) {

    // limpiar contenedor
    $("#inasistencias-content-pilar").empty();

    let totalAusentismos = 0;

    // obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // obtener el horario según el tipo de horario del departamento
    let tipoHorario = obtenerHorarioEmpleadoPilar(empleado, dataNomina);

    // validar registros
    if (!registros || registros.length == 0) {

        $("#inasistencias-content-pilar").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

        $("#total-inasistencias-pilar").text(0);

        return;
    }

    // validar horario
    if (!tipoHorario || tipoHorario.length == 0) {

        $("#inasistencias-content-pilar").html(`
            <div class="text-muted text-center">
                Sin horario configurado.
            </div>
        `);

        $("#total-inasistencias-pilar").text(0);

        return;
    }

    // recorrer registros
    registros.forEach(function (registro) {

        // buscar horario del día
        let horario = tipoHorario.find(function (item) {

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

            $("#inasistencias-content-pilar").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-person-x-fill text-success me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // si no hubo ausencias
    if (totalAusentismos === 0) {

        $("#inasistencias-content-pilar").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

    }

    // mostrar total
    $("#total-inasistencias-pilar")
        .text(totalAusentismos);

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EXCESO DE HORA COMIDA
//==========================================================

function establecerEventosComidaExtra(empleado, dataNomina = null) {

    // limpiar contenedor
    $("#comida-pilar").empty();

    // acumulador de minutos extra
    let minutosTotalesComidaExtra = 0;

    // validar que el empleado tenga registros
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    if (registros.length == 0) {

        $("#comida-pilar").html(`
            <div class="text-muted text-center">
                Sin comida extra.
            </div>
        `);

        $("#total-comida-pilar").text("00:00");

        return;
    }

    // validar que el empleado tenga horario oficial
    let horarioOficial = obtenerHorarioEmpleadoPilar(empleado, dataNomina) || [];

    if (horarioOficial.length == 0) {

        $("#comida-pilar").html(`
            <div class="text-muted text-center">
                Sin comida extra.
            </div>
        `);

        $("#total-comida-pilar").text("00:00");

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

            $("#comida-pilar").append(`
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

        $("#comida-pilar").html(`
            <div class="text-success text-center">
                Sin comida extra.
            </div>
        `);

    }

    // mostrar total acumulado
    $("#total-comida-pilar").text(
        convertirMinutosAHorasMinutos(
            minutosTotalesComidaExtra
        )
    );

}

//==========================================================
// FUNCIÓN PARA MOSTRAR MARCAJES EXCEDENTES
//==========================================================

function establecerEventosMarcajes(empleado, dataNomina = null) {

    // limpiar contenedor
    $("#marcajes-pilar").empty();

    // acumulador de días con marcajes excedentes
    let totalMarcajesExcedentes = 0;

    // obtener registros del empleado
    let registros = Array.isArray(empleado) ? empleado : (empleado?.registros || []);

    // validar registros
    if (registros.length == 0) {

        $("#marcajes-pilar").html(`
            <div class="text-muted text-center">
                Sin marcajes excedentes.
            </div>
        `);

        $("#total-marcajes-pilar").text(0);

        return;
    }

    // buscar el departamento del empleado
    let departamentoEmpleado = obtenerDepartamentoEmpleadoPilar(empleado, dataNomina);

    // validar que exista el departamento
    if (!departamentoEmpleado) {

        $("#marcajes-pilar").html(`
            <div class="text-muted text-center">
                No se encontró el departamento del empleado.
            </div>
        `);

        $("#total-marcajes-pilar").text(0);

        return;
    }

    // obtener el horario correspondiente al tipo de horario
    let horarioEmpleado = obtenerHorarioEmpleadoPilar(empleado, dataNomina);

    // validar que exista el horario
    if (!horarioEmpleado || horarioEmpleado.length == 0) {

        $("#marcajes-pilar").html(`
            <div class="text-muted text-center">
                No se encontró el horario del empleado.
            </div>
        `);

        $("#total-marcajes-pilar").text(0);

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

        // tipo 1 puede tener horario de comida
        if (departamentoEmpleado.tipo_horario == 1) {

            if (
                horario.salida_comida &&
                horario.entrada_comida
            ) {

                limiteMarcajes = 4;

            }

        }

        // tipo 2 no tiene horario de comida
        // por lo tanto su límite permanece en 2

        // si supera los marcajes permitidos
        if (cantidadMarcajes > limiteMarcajes) {

            totalMarcajesExcedentes++;

            // marcar todos los registros del día
            registrosDia.forEach(function (registro) {

                registro.claseEvento = "table-pink";

            });

            $("#marcajes-pilar").append(`

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

        $("#marcajes-pilar").html(`

            <div class="text-success text-center">

                Sin marcajes excedentes.

            </div>

        `);

    }

    // mostrar total
    $("#total-marcajes-pilar")
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
    if (!hora) return 0;
    var partes = hora.split(':');
    var horas = parseInt(partes[0], 10) || 0;
    var minutos = parseInt(partes[1], 10) || 0;
    return horas * 60 + minutos;
}

//===================================================
// NORMALIZAR NOMBRE DEL DÍA
// QUITA ACENTOS Y CONVIERTE A MAYÚSCULAS
//===================================================
function normalizarDia(dia) {
    if (!dia) {
        return "";
    }
    return dia
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
}

