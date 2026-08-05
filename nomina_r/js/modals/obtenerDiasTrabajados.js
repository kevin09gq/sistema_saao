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