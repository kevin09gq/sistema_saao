
/************************************
 * EDIAR PROPIEDADES DEL EMPLEADO DESDE EL MODAL DE COORDINADOR
 ************************************/

function editarPropiedades() {
    $("#btn-guardar-propiedades").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;
        modificarPercepciones(empleado);

        //limpiar empleado abierto después de guardar
        objEmpleadoCoordinador.limpiarEmpleado();
        // Cerrar modal después de guardar
        $('#modal-40lbs').modal('hide');


    });

}

/************************************
 * MODIFICAR PERCEPCIONES DEL EMPLEADO
 ************************************/

function modificarPercepciones(empleado) {

    // Obtener valores de las percepciones del modal
    let sueldoNeto = parseFloat($('#mod-sueldo-neto-40lbs').val());
    let sueldoExtraTotal = parseFloat($('#mod-sueldo-extra-total-40lbs').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoNeto = isNaN(sueldoNeto) ? 0 : sueldoNeto;
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.sueldo_neto = sueldoNeto;
    empleado.sueldo_extra_total = sueldoExtraTotal;

}