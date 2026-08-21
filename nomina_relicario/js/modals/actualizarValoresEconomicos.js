

$(document).ready(function () {
    
    // Abrir el modal al hacer clic en el botón "Actualizar Comida, Pasaje y Tardeada"
    abrirModalActualizarValores();

    // Guardar los valores actualizados al hacer clic en el botón "Guardar cambios"
    guardarValoresActualizados();
});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE LISTA DE RAYA
//===================================================

function abrirModalActualizarValores() {

    // Detectar el clic en el botón "Actualizar Lista de Raya"
    $('#btn_actualizar_valores_relicario').click(function () {

        //Establecer los valores en los campos del modal
        establecerValores();

        // Abrir el modal de Bootstrap
        $('#modalActualizarValores').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA ESTABLECER LOS VALORES EN EL MODAL
//===================================================

function establecerValores() {
    // Establecer los valores en los campos del modal
    $('#precio_pasaje_actualizar').val(jsonNominaRelicario.precio_pasaje);
    $('#pago_comida_actualizar').val(jsonNominaRelicario.pago_comida);
    $('#pago_tardeada_actualizar').val(jsonNominaRelicario.pago_tardeada);
}


//===================================================
// FUNCIÓN PARA GUARDAR LOS VALORES ACTUALIZADOS
//===================================================

function guardarValoresActualizados() {
    $("#btn_guardar_valores").click(function (e) {
        e.preventDefault();

        // Obtener los valores actualizados del modal
        var precioPasaje = $('#precio_pasaje_actualizar').val();
        var pagoComida = $('#pago_comida_actualizar').val();
        var pagoTardeada = $('#pago_tardeada_actualizar').val();

        // Actualizar en el JsonNominaRelicario
        jsonNominaRelicario.precio_pasaje = precioPasaje;
        jsonNominaRelicario.pago_comida = pagoComida;
        jsonNominaRelicario.pago_tardeada = pagoTardeada;

        // actualizar pasaje, comida y tardeada de cada empleado siempre y cuando el departamento es tipo_horario = 2
        jsonNominaRelicario.departamentos.forEach(function (departamento) {

            if (departamento.tipo_horario == 2) {

                departamento.empleados.forEach(function (empleado) {

                    calcularPagoComidaEmpleado(empleado);
                    calcularPagoPasajeEmpleado(empleado);
                    calcularTardeadaEmpleado(empleado);

                });
            }

        });

        // Cerrar el modal
        $('#modalActualizarValores').modal('hide');

        // Actualizar la tabla de empleados con los nuevos valores
        llenarTablaNomina();
    });
}