//===================================================
// CALCULAR DÍAS TRABAJADOS PARA EMPLEADOS DE RANCHO
// TIPO_HORARIO = 2
// CUENTA UN DÍA SI EXISTE AL MENOS UNA ENTRADA
//===================================================

function calcularDiasTrabajadosRancho(empleado) {

    // Validar registros
    if (!empleado.registros || empleado.registros.length === 0) {

        empleado.dias_trabajados = 0;

        return;

    }

    // Arreglo para almacenar días ya contados
    let diasTrabajados = [];

    // Recorrer registros
    empleado.registros.forEach(function(registro) {

        // Validar que tenga entrada
        if (
            registro.entrada &&
            registro.entrada.trim() != ""
        ) {


            // Verificar que el día no esté contado todavía
            if (!diasTrabajados.includes(registro.fecha)) {


                diasTrabajados.push(registro.fecha);


            }


        }


    });



    // Guardar cantidad de días únicos trabajados
    empleado.dias_trabajados = diasTrabajados.length;

    

}

//===================================================
// FUNCION PARA CALCULAR EL SALARIO SEMANAL DEL EMPLEADO
// CON HORARIO DE RANCHO
//===================================================

function calcularSalarioSemanal(empleado) {
    
    // Validar que el empleado tenga días trabajados y que tenga mostrar = true 
    if (!empleado.dias_trabajados || !empleado.mostrar) {

        empleado.salario_semanal = 0;

        return;

    }

    // Calcular el total de comida según días trabajados
    empleado.salario_semanal = 
        empleado.salario_diario * empleado.dias_trabajados;

}

//===================================================
// FUNCIÓN PARA CALCULAR EL PAGO DE COMIDA
// RECIBE UN EMPLEADO COMO PARÁMETRO
//
// EL CÁLCULO SE REALIZA:
// PAGO COMIDA DIARIO * DÍAS TRABAJADOS
//
// EJEMPLO:
// pago_comida = 100
// dias_trabajados = 5
//
// resultado = 500
//===================================================

function calcularPagoComidaEmpleado(empleado) {

    // Validar que el empleado tenga días trabajados y que tenga mostrar = true 
    if (!empleado.dias_trabajados || !empleado.mostrar) {

        empleado.comida = 0;

        return;

    }

    // Obtener el pago diario de comida
    let pagoComida = parseFloat(jsonNominaRelicario.pago_comida) || 0;


    // Calcular el total de comida según días trabajados
    empleado.comida = 
        pagoComida * empleado.dias_trabajados;


}


//===================================================
// FUNCIÓN PARA CALCULAR EL PAGO DE PASAJE
// RECIBE UN EMPLEADO COMO PARÁMETRO
//
// EL CÁLCULO SE REALIZA:
// PRECIO PASAJE DIARIO * DÍAS TRABAJADOS
//
// EJEMPLO:
// precio_pasaje = 50
// dias_trabajados = 5
//
// resultado = 250
//===================================================

function calcularPagoPasajeEmpleado(empleado) {

    // Validar que el empleado tenga días trabajados y que tenga mostrar = true
    if (!empleado.dias_trabajados || !empleado.mostrar) {

        empleado.pasaje = 0;

        return;

    }

    // Obtener el precio del pasaje diario
    let precioPasaje = parseFloat(jsonNominaRelicario.precio_pasaje) || 0;


    // Calcular el total de pasaje según días trabajados
    empleado.pasaje =
        precioPasaje * empleado.dias_trabajados;


}
//===================================================
// CALCULAR TARDEADAS DEL EMPLEADO
//
// UNA TARDEADA CUENTA CUANDO EL EMPLEADO SALE
// UNA HORA O MÁS DESPUÉS DEL HORARIO DEL RANCHO.
//
// NO IMPORTA CUÁNTAS HORAS DESPUÉS SALGA.
// CADA DÍA SOLAMENTE CUENTA COMO UNA TARDEADA.
//===================================================

function calcularTardeadaEmpleado(empleado) {

    // validar que existan registros y que tenga mostrar = true 
    if (
        !empleado.registros ||
        empleado.registros.length === 0
        || !empleado.mostrar
    ) {

        empleado.total_tardeadas = 0;
        empleado.tardeada = 0;

        return;

    }


    // validar que exista el horario de rancho
    if (
        !jsonNominaRelicario.horarioRancho ||
        jsonNominaRelicario.horarioRancho.length === 0
    ) {

        empleado.total_tardeadas = 0;
        empleado.tardeada = 0;

        return;

    }


    // contador de tardeadas
    let totalTardeadas = 0;


    // arreglo para controlar los días procesados
    let diasProcesados = [];


    // recorrer todos los registros
    empleado.registros.forEach(function(registro) {

        // validar que tenga fecha
        if (!registro.fecha) {

            return;

        }


        // evitar procesar el mismo día más de una vez
        if (diasProcesados.includes(registro.fecha)) {

            return;

        }


        // obtener todos los registros del mismo día
        let registrosDia = empleado.registros.filter(function(registroDia) {

            return registroDia.fecha == registro.fecha;

        });


        // marcar el día como procesado
        diasProcesados.push(registro.fecha);


        // variable para guardar el último registro con salida
        let ultimoRegistro = null;


        // recorrer los registros del día
        registrosDia.forEach(function(registroDia) {

            // solamente tomar registros que tengan salida
            if (
                registroDia.salida &&
                registroDia.salida.trim() != ""
            ) {

                ultimoRegistro = registroDia;

            }

        });


        // si no existe salida ese día, no hay tardeada
        if (!ultimoRegistro) {

            return;

        }


        // normalizar el nombre del día del registro
        let diaRegistro =
            normalizarDia(ultimoRegistro.dia);


        // buscar el horario correspondiente
        let horarioDia = jsonNominaRelicario.horarioRancho.find(function(horario) {

            return normalizarDia(horario.dia) == diaRegistro;

        });


        // si no existe horario para ese día, no calcular
        if (!horarioDia) {

            return;

        }


        // si es día de descanso, no calcular
        if (horarioDia.descanso == "1") {

            return;

        }


        // validar que exista una salida programada
        if (
            !horarioDia.salida ||
            horarioDia.salida.trim() == ""
        ) {

            return;

        }


        // convertir la salida programada a minutos
        let minutosSalidaHorario =
            convertirHoraAMinutos(horarioDia.salida);
            


        // convertir la salida real a minutos
        let minutosSalidaEmpleado =
            convertirHoraAMinutos(ultimoRegistro.salida);


        // la tardeada comienza una hora después
        let minutosInicioTardeada =
            minutosSalidaHorario + 60;


        // validar si salió una hora o más después
        if (
            minutosSalidaEmpleado >=
            minutosInicioTardeada
        ) {

            // contar solamente una tardeada por día
            totalTardeadas++;

        }

    });

    // obtener el pago por cada tardeada
    let pagoTardeada =
        parseFloat(jsonNominaRelicario.pago_tardeada) || 0;


    // calcular el importe total de las tardeadas
    empleado.tardeada =
        totalTardeadas * pagoTardeada;

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




