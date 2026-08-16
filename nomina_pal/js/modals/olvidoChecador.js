

$(document).ready(function () {
    abrirModalOlvidosChecador();

    detectarCambiosSelect();

    seleccionarTodosEmpleadosOlvidosChecador();

    perdonarOlvidosChecador();


});

function detectarCambiosSelect() {
    // Detectar cambio en el select de día
    $('#selectDiaOlvidoChecador').change(function () {
        cargarEmpleadosOlvidosChecador();
    });

}
//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE LISTA DE RAYA
//===================================================

function abrirModalOlvidosChecador() {

    // Detectar el clic en el botón "Actualizar Lista de Raya"
    $('#btn_olvidos_checador').click(function () {
        cargarEmpleadosOlvidosChecador();
        // Abrir el modal de Bootstrap
        $('#modalOlvidosChecador').modal('show');

    });

}


//==========================================================
// FUNCIÓN PARA CARGAR EMPLEADOS CON OLVIDOS DE CHECADOR
// SEGÚN EL DÍA SELECCIONADO
//==========================================================

function cargarEmpleadosOlvidosChecador() {

    // Desmarcar el checkbox de "seleccionar todos"
    $('#checkTodosOlvidosChecador').prop('checked', false);

    // Obtener el valor del día seleccionado
    let selectDiaVal = $('#selectDiaOlvidoChecador').val();
    if (!selectDiaVal) {
        // Limpiar tabla
        $('#tbody-empleados-olvidos-checador').empty();
        return;
    }

    // Obtener día seleccionado y convertirlo a minúsculas
    let diaSeleccionado = normalizarDia(selectDiaVal).toLowerCase();

    // Limpiar tabla
    $('#tbody-empleados-olvidos-checador').empty();

    // Validar que haya seleccionado un día
    if (diaSeleccionado === "") {

        return;

    }



    // Recorrer departamentos
    jsonNominaPalmilla.departamentos.forEach(function (departamento) {



        // Recorrer empleados
        departamento.empleados.forEach(function (empleado) {

            // Validar que el empleado esté habilitado para mostrar
            if (empleado.mostrar !== true) {

                return;

            }

            // Validar que el empleado tenga historial de olvidos
            if (
                empleado.historial_olvidos &&
                empleado.historial_olvidos.length > 0
            ) {



                // Variable para acumular el descuento del día
                let descuentoTotal = 0;



                // Recorrer historial de olvidos del empleado
                empleado.historial_olvidos.forEach(function (olvido) {



                    // Comparar día ignorando mayúsculas y minúsculas
                    if (
                        olvido.dia &&
                        normalizarDia(olvido.dia).toLowerCase() === diaSeleccionado
                    ) {



                        // Sumar descuento del olvido
                        descuentoTotal += Number(
                            olvido.descuento_olvido
                        );


                    }



                });



                // Si tiene descuento ese día mostrar empleado
                if (descuentoTotal > 0) {



                    $('#tbody-empleados-olvidos-checador').append(`


                        <tr>


                            <td class="text-center">

                                <input
                                    type="checkbox"
                                    class="form-check-input check-empleado-olvido"
                                    value="${empleado.id_empleado}">

                            </td>



                            <td>
                                ${empleado.clave}
                            </td>



                            <td>
                                ${empleado.nombre}
                            </td>



                            <td class="text-center">

                                $${descuentoTotal.toFixed(2)}

                            </td>


                        </tr>


                    `);



                }



            }



        });



    });



    // Validar si no encontró empleados
    if (
        $('#tbody-empleados-olvidos-checador tr').length === 0
    ) {


        $('#tbody-empleados-olvidos-checador').append(`


            <tr>


                <td 
                    colspan="4" 
                    class="text-center">


                    No existen empleados con olvidos este día.


                </td>


            </tr>


        `);


    }


}



//===============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL.
//===============================================================

function seleccionarTodosEmpleadosOlvidosChecador() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosOlvidosChecador').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-olvido:visible').prop('checked', $(this).prop('checked'));

    });

}


//==========================================================
// FUNCIÓN PARA PERDONAR OLVIDOS DE CHECADOR
// OBTIENE LOS EMPLEADOS SELECCIONADOS Y PONE
// DESCUENTO_OLVIDO EN 0
//==========================================================

function perdonarOlvidosChecador() {

    // Detectar clic en el botón perdonar olvidos
    $('#btnPerdonarOlvidosChecador').click(function () {

        // Obtener empleados seleccionados
        let empleadosSeleccionados = [];

        $('.check-empleado-olvido:checked').each(function () {

            empleadosSeleccionados.push(
                $(this).val()
            );

        });

        // Validar selección
        if (empleadosSeleccionados.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );

            return;
        }

        // Obtener el día seleccionado
        let diaSeleccionado = normalizarDia(
            $('#selectDiaOlvidoChecador').val()
        );

        // Recorrer departamentos
        jsonNominaPalmilla.departamentos.forEach(function (departamento) {

            // Recorrer empleados
            departamento.empleados.forEach(function (empleado) {

                // Buscar empleado seleccionado
                if (
                    empleadosSeleccionados.includes(
                        empleado.id_empleado.toString()
                    )
                ) {

                    // Validar historial de olvidos
                    if (
                        empleado.historial_olvidos &&
                        empleado.historial_olvidos.length > 0
                    ) {

                        // Recorrer historial de olvidos
                        empleado.historial_olvidos.forEach(function (olvido) {

                            // Comparar el día eliminando acentos
                            if (
                                olvido.dia &&
                                normalizarDia(olvido.dia) === diaSeleccionado
                            ) {

                                // Perdonar descuento
                                olvido.descuento_olvido = 0;

                                // Marcar que fue editado
                                olvido.editado = true;

                            }

                        });

                        // Recalcular descuento del empleado
                        calcularDescuentoOlvidosChecador(empleado);

                    }

                }

            });

        });

        // Actualizar tabla de nómina
        llenarTablaNomina();

        // Actualizar tabla de empleados con olvidos
        cargarEmpleadosOlvidosChecador();

        mostrarAlerta(
            "success",
            "Correcto",
            "Se perdonaron los olvidos seleccionados."
        );

    });

}
