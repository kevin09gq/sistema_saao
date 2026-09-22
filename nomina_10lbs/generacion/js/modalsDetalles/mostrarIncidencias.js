//==========================================================
// FUNCIÓN PARA MOSTRAR LOS OLVIDOS DEL BIOMÉTRICO
//==========================================================

function establecerEventosOlvidosBiometrico(registros) {

    // Limpiar contenedor
    $("#olvidos-checador-10lbs").empty();

    let totalOlvidos = 0;

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#olvidos-checador-10lbs").html(`
            <div class="text-muted text-center">
                No hubo olvidos.
            </div>
        `);

        $("#total-olvidos-checador-10lbs").text(0);

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

            $("#olvidos-checador-10lbs").append(`
                <div class="small py-1 border-bottom">
                    <i class="bi bi-exclamation-circle-fill text-danger me-1"></i>
                    <strong>${registro.dia}</strong> - ${registro.fecha}
                </div>
            `);

        }

    });

    // Si no hubo olvidos
    if (totalOlvidos === 0) {

        $("#olvidos-checador-10lbs").html(`
            <div class="text-success text-center">
                Sin olvidos.
            </div>
        `);

    }

    // Mostrar total
    $("#total-olvidos-checador-10lbs").text(totalOlvidos);

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
