
let cantidadIncentivo = 200;

//===================================================
// FUNCIÓN PARA RECCORRER EL JSON Y MANDAR LOS EMPLEADOS 
// A LA FUNCIÓN DE CALCULAR DÍAS TRABAJADOS
//===================================================

function procesarEmpleadosIncentivo() {
    // Recorrer el JSON de empleados
    jsonNomina40lbs.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            // Llamar a la función para calcular días trabajados
            aplicarIncentivoEmpleado(empleado);
        });
    });
}


//===================================================
// CALCULAR DÍAS TRABAJADOS PARA EMPLEADOS DE 
// SUELDO DIARIO CUENTA UN DÍA SI EXISTE AL MENOS 
// UNA ENTRADA
//===================================================

function calcularDiasTrabajados(empleado) {

    // Validar registros
    if (!empleado.registros || empleado.registros.length === 0) {
        empleado.dias_trabajados = 0;
        empleado.sueldo_neto = 0;
        aplicarIncentivoEmpleado(empleado);
        return;
    }

    // Arreglo para almacenar días ya contados
    let diasTrabajados = [];

    // Recorrer registros
    empleado.registros.forEach(function (registro) {

        // Validar que tenga entrada válida y no sea falta (00:00 o vacía)
        if (
            registro.entrada &&
            registro.entrada.trim() !== "" &&
            registro.entrada.trim() !== "00:00"
        ) {

            // Verificar que el día no esté contado todavía
            if (!diasTrabajados.includes(registro.fecha)) {

                diasTrabajados.push(registro.fecha);

            }

        }

    });

    // Guardar cantidad de días únicos trabajados al empleado
    empleado.dias_trabajados = diasTrabajados.length;

    // Agregar días extras únicos del historial al total de días trabajados
    if (Array.isArray(empleado.dias_extra_detalle) && empleado.dias_extra_detalle.length > 0) {
        let diasExtrasSinDuplicar = [];

        // Recorrer cada día extra del historial
        empleado.dias_extra_detalle.forEach(function (diaExtra) {
            let diaFormateado = normalizarDia(diaExtra.dia);

            // Solo agregar si no está duplicado
            if (!diasExtrasSinDuplicar.includes(diaFormateado)) {
                diasExtrasSinDuplicar.push(diaFormateado);
            }
        });

        // Sumar los días extras únicos al total
        empleado.dias_trabajados += diasExtrasSinDuplicar.length;
    }

    calcularSalarioSemanal(empleado);
    aplicarIncentivoEmpleado(empleado);

}


//===================================================
// FUNCION PARA CALCULAR EL SALARIO SEMANAL 
// DEL EMPLEADO MULTIPLICANDO SU SALARIO DIARIO POR 
// LOS DÍAS TRABAJADOS
//===================================================

function calcularSalarioSemanal(empleado) {

    // Validar que el empleado tenga días trabajados y que tenga mostrar = true 
    if (empleado.dias_trabajados <= 0 || !empleado.mostrar) {
        empleado.sueldo_neto = 0;
        return;
    }

    // Calcular el total de sueldo neto según días trabajados
    empleado.sueldo_neto = empleado.salario_diario * empleado.dias_trabajados;

}


//===================================================
// FUNCION PARA APLICAR EL INCENTIVO AL EMPLEADO SI 
// CUMPLE CON LOS REQUISITOS
//===================================================

function aplicarIncentivoEmpleado(empleado) {
    // El incentivo solo se evalúa para empleados visibles con registros.
    if (!empleado) {
        return;
    }

    if (!empleado.mostrar || !empleado.registros) {
        empleado.incentivo = 0;
        return;
    }

    // Solo se consideran los días que tienen horario de entrada y salida.
    var diasConHorario = (typeof jsonNomina40lbs !== 'undefined' &&
        Array.isArray(jsonNomina40lbs.horarios_semanales))
        ? jsonNomina40lbs.horarios_semanales.filter(function (horario) {
            return horario.entrada && horario.salida;
        })
        : [];

    // Sin horario configurado no hay una semana contra la cual validar asistencia.
    if (diasConHorario.length === 0) {
        empleado.incentivo = 0;
        return;
    }

    // Cada día programado debe tener al menos una entrada válida.
    var trabajoTodosLosDias = diasConHorario.every(function (horario) {
        return empleado.registros.some(function (registro) {
            var entrada = String(registro.entrada || '').trim();
            var diaRegistro = String(registro.dia || '').trim().toLowerCase();
            var diaHorario = String(horario.dia || '').trim().toLowerCase();

            return diaRegistro === diaHorario &&
                entrada !== '' &&
                entrada !== '00:00';
        });
    });

    empleado.incentivo = trabajoTodosLosDias ? cantidadIncentivo : 0;
}
