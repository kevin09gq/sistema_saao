//==========================================================
// FUNCIÓN PARA MOSTRAR LOS OLVIDOS DEL BIOMÉTRICO
//==========================================================
function establecerEventosOlvidosBiometrico(registros) {

    // Limpiar contenedor
    $("#olvidos-checador-40lbs").empty();

    let totalOlvidos = 0;

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#olvidos-checador-40lbs").html(`
            <div class="text-muted text-center">
                No hubo olvidos.
            </div>
        `);

        $("#total-olvidos-checador-40lbs").text(0);

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

            $("#olvidos-checador-40lbs").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-exclamation-circle-fill text-danger me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // Si no hubo olvidos
    if (totalOlvidos === 0) {

        $("#olvidos-checador-40lbs").html(`
            <div class="text-success text-center">
                Sin olvidos.
            </div>
        `);

    }

    // Mostrar total
    $("#total-olvidos-checador-40lbs").text(totalOlvidos);

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS ENTRADAS TEMPRANAS
//==========================================================
function establecerEventosEntradasTempranas(registros) {

    // Limpiar contenedor
    $("#entradas-tempranas-40lbs").empty();

    // Acumulador de minutos
    let minutosTotalesEntradasTempranas = 0;


    // Validar registros
    if (!registros || registros.length == 0) {

        $("#entradas-tempranas-40lbs").html(`
            <div class="text-muted text-center">
                No hubo entradas tempranas.
            </div>
        `);

        $("#total-entradas-tempranas-40lbs").text("00:00");

        return;
    }


    registros.forEach(function (registro) {


        // Si no tiene entrada, no se evalúa
        if (!registro.entrada) {
            return;
        }


        // Buscar horario del mismo día
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {

            return item.dia.toLowerCase() === registro.dia.toLowerCase();

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

            $("#entradas-tempranas-40lbs").append(`
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

        $("#entradas-tempranas-40lbs").html(`
            <div class="text-success text-center">
                Sin entradas tempranas.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-entradas-tempranas-40lbs")
        .text(convertirMinutosAHorasMinutos(minutosTotalesEntradasTempranas));

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TARDÍAS
//==========================================================
function establecerEventosSalidasTardias(registros) {

    // Limpiar contenedor
    $("#salidas-tardias-40lbs").empty();

    // Acumulador de minutos
    let minutosTotalesSalidasTardias = 0;


    // Validar registros
    if (!registros || registros.length == 0) {

        $("#salidas-tardias-40lbs").html(`
            <div class="text-muted text-center">
                No hubo salidas tardías.
            </div>
        `);

        $("#total-salidas-tardias-40lbs").text("00:00");

        return;
    }



    //======================================================
    // AGRUPAR REGISTROS POR FECHA
    //======================================================
    let registrosPorDia = {};


    registros.forEach(function (registro) {


        if (!registrosPorDia[registro.fecha]) {

            registrosPorDia[registro.fecha] = [];

        }


        registrosPorDia[registro.fecha].push(registro);


    });






    //======================================================
    // RECORRER CADA DÍA
    //======================================================
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







        // Buscar horario del día
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {


            return item.dia.toLowerCase() ===
                ultimaSalida.dia.toLowerCase();


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






            $("#salidas-tardias-40lbs").append(`
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


        $("#salidas-tardias-40lbs").html(`
            <div class="text-success text-center">
                Sin salidas tardías.
            </div>
        `);


    }






    // Mostrar total acumulado
    $("#total-salidas-tardias-40lbs")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTardias));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LAS SALIDAS TEMPRANAS
//==========================================================
function establecerEventosSalidasTempranas(registros) {


    $("#salidas-tempranas-40lbs").empty();


    let minutosTotalesSalidasTempranas = 0;



    if (!registros || registros.length == 0) {


        $("#salidas-tempranas-40lbs").html(`
            <div class="text-muted text-center">
                No hubo salidas tempranas.
            </div>
        `);


        $("#total-salidas-tempranas-40lbs").text("00:00");


        return;

    }







    //======================================================
    // AGRUPAR REGISTROS POR FECHA
    //======================================================
    let registrosPorDia = {};



    registros.forEach(function (registro) {


        if (!registrosPorDia[registro.fecha]) {


            registrosPorDia[registro.fecha] = [];


        }


        registrosPorDia[registro.fecha].push(registro);


    });







    //======================================================
    // RECORRER CADA DÍA
    //======================================================
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
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {


            return item.dia.toLowerCase() ===
                ultimaSalida.dia.toLowerCase();


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






            $("#salidas-tempranas-40lbs").append(`
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



        $("#salidas-tempranas-40lbs").html(`
            <div class="text-success text-center">
                Sin salidas tempranas.
            </div>
        `);



    }







    // Mostrar total acumulado
    $("#total-salidas-tempranas-40lbs")
        .text(convertirMinutosAHorasMinutos(minutosTotalesSalidasTempranas));


}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS RETARDOS
//==========================================================
function establecerEventosRetardos(registros) {

    // Limpiar contenedor
    $("#retardos-40lbs").empty();

    // Acumulador de minutos
    let minutosTotalesRetardos = 0;

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#retardos-40lbs").html(`
            <div class="text-muted text-center">
                No hubo retardos.
            </div>
        `);

        $("#total-retardos-40lbs").text("00:00");

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
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {
            return item.dia.toLowerCase() === registro.dia.toLowerCase();
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

            $("#retardos-40lbs").append(`
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

        $("#retardos-40lbs").html(`
            <div class="text-success text-center">
                Sin retardos.
            </div>
        `);

    }

    // Mostrar total acumulado
    $("#total-retardos-40lbs")
        .text(convertirMinutosAHorasMinutos(minutosTotalesRetardos));

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS AUSENTISMOS
//==========================================================
function establecerEventosAusentismos(registros) {

    // Limpiar contenedor
    $("#inasistencias-content-40lbs").empty();

    let totalAusentismos = 0;

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#inasistencias-content-40lbs").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

        $("#total-inasistencias-40lbs").text(0);

        return;
    }

    // Recorrer registros
    registros.forEach(function (registro) {

        // Buscar horario del día
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {
            return item.dia.toLowerCase() === registro.dia.toLowerCase();
        });

        // Si no tiene horario ese día no se considera ausencia
        if (!horario) {
            return;
        }

        // Validar que tenía que trabajar pero no marcó nada
        if (registro.entrada == "" && registro.salida == "") {

            totalAusentismos++;
            registro.claseEvento = "table-success"; // Ausentismo: Verde

            $("#inasistencias-content-40lbs").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-person-x-fill text-success me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // Si no hubo ausencias
    if (totalAusentismos === 0) {

        $("#inasistencias-content-40lbs").html(`
            <div class="text-success text-center">
                Sin ausentismos.
            </div>
        `);

    }

    // Mostrar total
    $("#total-inasistencias-40lbs")
        .text(totalAusentismos);

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EXCESO DE HORA COMIDA
//==========================================================
function establecerEventosComidaExtra(registros) {


    // Limpiar contenedor
    $("#comida-40lbs").empty();


    // Acumulador de minutos extra
    let minutosTotalesComidaExtra = 0;



    // Validar registros
    if (!registros || registros.length == 0) {


        $("#comida-40lbs").html(`
            <div class="text-muted text-center">
                Sin comida extra.
            </div>
        `);


        $("#total-comida-40lbs").text("00:00");


        return;


    }

    //======================================================
    // AGRUPAR REGISTROS POR FECHA
    //======================================================
    let registrosPorDia = {};



    registros.forEach(function(registro){


        if(!registrosPorDia[registro.fecha]){


            registrosPorDia[registro.fecha] = [];


        }


        registrosPorDia[registro.fecha].push(registro);


    });


    //======================================================
    // RECORRER CADA DÍA
    //======================================================
    Object.keys(registrosPorDia).forEach(function(fecha){

        let registrosDia = registrosPorDia[fecha];


        // Buscar horario del día
        let horario = jsonNomina40lbs.horarios_semanales.find(function(item){



            return item.dia.toLowerCase() ===
                   registrosDia[0].dia.toLowerCase();



        });


        // Si no existe horario
        if(!horario){


            return;


        }


        //==================================================
        // VALIDAR SI EL DÍA TIENE HORA DE COMIDA
        //==================================================
        let tieneComida =
            horario.entrada_comida &&
            horario.termino_comida;


        //==================================================
        // DÍA CON COMIDA
        //==================================================
        if(tieneComida){


            // Debe tener solamente dos registros
            if(registrosDia.length != 2){


                return;


            }


            // Salida a comida
            let salidaComida =
                registrosDia[0].salida;


            // Entrada después de comida
            let entradaComida =
                registrosDia[1].entrada;


            // Validar marcajes
            if(!salidaComida || !entradaComida){


                return;


            }



            // Convertir horas
            let inicioComida =
                convertirHoraAMinutos(
                    salidaComida
                );


            let finComida =
                convertirHoraAMinutos(
                    entradaComida
                );


            // Si cruza medianoche
            if(finComida < inicioComida){


                finComida += 1440;


            }


            // Tiempo real tomado
            let minutosTomados =
                finComida - inicioComida;


            // Tiempo permitido según horario
            let minutosPermitidos =
                convertirHoraAMinutos(
                    horario.horas_comida
                );


            // Diferencia extra
            let minutosExtra =
                minutosTomados - minutosPermitidos;


            // Si tomó más tiempo
            if(minutosExtra > 0){


                minutosTotalesComidaExtra += minutosExtra;

                // Marcar la fila donde regresó de comida
                registrosDia[1].claseEvento = "table-brown";


                $("#comida-40lbs").append(`
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


        } else {

            //==================================================
            // DÍA SIN COMIDA
            //==================================================


            // Si tiene más de dos registros no se evalúa
            if(registrosDia.length != 2){


                return;


            }


        }

    });


    //======================================================
    // SI NO HUBO EXCESOS
    //======================================================
    if(minutosTotalesComidaExtra == 0){


        $("#comida-40lbs").html(`
            <div class="text-success text-center">
                Sin comida extra.
            </div>
        `);


    }


    // Mostrar total acumulado
    $("#total-comida-40lbs")
        .text(
            convertirMinutosAHorasMinutos(
                minutosTotalesComidaExtra
            )
        );

}

//==========================================================
// FUNCIÓN PARA MOSTRAR MARCAJES EXCEDENTES
//==========================================================
function establecerEventosMarcajes(registros) {


    // Limpiar contenedor
    $("#marcajes-40lbs").empty();


    let totalMarcajesExcedentes = 0;



    // Validar registros
    if (!registros || registros.length == 0) {


        $("#marcajes-40lbs").html(`
            <div class="text-muted text-center">
                Sin marcajes excedentes.
            </div>
        `);


        $("#total-marcajes-40lbs").text(0);


        return;

    }






    //======================================================
    // AGRUPAR REGISTROS POR FECHA
    //======================================================
    let registrosPorDia = {};



    registros.forEach(function (registro) {


        if (!registrosPorDia[registro.fecha]) {


            registrosPorDia[registro.fecha] = [];


        }


        registrosPorDia[registro.fecha].push(registro);


    });







    //======================================================
    // REVISAR CADA DÍA
    //======================================================
    Object.keys(registrosPorDia).forEach(function (fecha) {



        let registrosDia = registrosPorDia[fecha];



        // Buscar horario del día
        let horario = jsonNomina40lbs.horarios_semanales.find(function (item) {


            return item.dia.toLowerCase() ===
                registrosDia[0].dia.toLowerCase();


        });





        if (!horario) {

            return;

        }







        // Contar todos los marcajes del día
        let cantidadMarcajes = 0;



        registrosDia.forEach(function (registro) {



            if (registro.entrada) {

                cantidadMarcajes++;

            }



            if (registro.salida) {

                cantidadMarcajes++;

            }


        });







        //==================================================
        // DETERMINAR LIMITE DE MARCAJES
        //==================================================

        let limiteMarcajes = 2;



        // Tiene horario de comida
        if (
            horario.entrada_comida &&
            horario.termino_comida
        ) {

            limiteMarcajes = 4;

        }








        //==================================================
        // SI SUPERA LOS MARCAJES PERMITIDOS
        //==================================================

        if (cantidadMarcajes > limiteMarcajes) {



            totalMarcajesExcedentes++;



            // Marcar todos los registros del día
            registrosDia.forEach(function (registro) {


                registro.claseEvento = "table-pink";


            });





            $("#marcajes-40lbs").append(`

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







    // Si no hubo excedentes
    if (totalMarcajesExcedentes === 0) {


        $("#marcajes-40lbs").html(`

            <div class="text-success text-center">

                Sin marcajes excedentes.

            </div>

        `);


    }






    // Mostrar total
    $("#total-marcajes-40lbs")
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
