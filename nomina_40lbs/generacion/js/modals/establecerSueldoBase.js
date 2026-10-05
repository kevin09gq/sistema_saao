// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosSueldoBase = [];

$(document).ready(function () {
    abrirModalSueldoBase();

    buscadorEmpleadosSueldoBase();

    seleccionarTodosEmpleadoSueldoBase();

   obtenerEmpleadosSeleccionadosSueldoBase();

    quitarSueldoBase();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE SUELDO BASE
//===================================================

function abrirModalSueldoBase() {

    // Detectar el clic en el botón "Establecer Sueldo Base"
    $('#btn_establecer_sueldo_base').click(function () {
        cargarEmpleadosSueldoBase();
        // Abrir el modal de Bootstrap
        $('#modalSueldoBase').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosSueldoBase() {

    // Limpiar tabla
    $('#tbody-empleados-sueldo-base').empty();

    // Limpiar el checkbox principal
    $('#checkTodosSueldoBase').prop('checked', false);

    // Recorrer departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-sueldo-base').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-sueldo-base').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-sueldo-base"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                </tr>
            `);

        });

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosSueldoBase() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoSueldoBase').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-sueldo-base tr').each(function () {

            // Si la fila corresponde al encabezado de un departamento,
            // no se realiza la búsqueda sobre ella.
            if ($(this).hasClass('table-secondary') || $(this).hasClass('table-success')) {
                return;
            }

            // Obtener la clave del empleado (segunda columna)
            let clave = $(this).find('td:eq(1)').text().toLowerCase();

            // Obtener el nombre del empleado (tercera columna)
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // Verificar si el texto escrito coincide con la clave
            // o con el nombre del empleado.
            if (clave.includes(texto) || nombre.includes(texto)) {

                // Si coincide, mostrar la fila.
                $(this).show();

            } else {

                // Si no coincide, ocultar la fila.
                $(this).hide();

            }

        });

    });

}

//===============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL.
//===============================================================

function seleccionarTodosEmpleadoSueldoBase() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosSueldoBase').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-sueldo-base:visible').prop('checked', $(this).prop('checked'));

    });

}


//==========================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
// OBTENER ID DEL EMPLEADO, PARA ENVIAR LOS ID AL SERVIDOR
//==========================================================

function obtenerEmpleadosSeleccionadosSueldoBase() {
    // Detectar clic en el botón Continuar
    $('#btnEstablecerSueldoBase').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosSueldoBase = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-sueldo-base:checked').each(function () {

            // Obtener la fila del empleado
            let fila = $(this).closest('tr');

            // Crear un objeto con la información del empleado
            let empleado = {

                id_empleado: $(this).val(),

            };

            // Agregar el empleado al arreglo
            empleadosSeleccionadosSueldoBase.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosSueldoBase.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        } else {
            // Si hay empleados seleccionados, llamar a la función para obtener su sueldo base
            obtenerSueldoBase();
        }



    });
}

//==========================================================
// FUNCIÓN PARA OBTENER EL SUELDO BASE DE LOS EMPLEADOS
//==========================================================
function obtenerSueldoBase() {

    $.ajax({

        url: "../php/infoDepartamentos.php",

        type: "POST",

        data: {

            accion: "obtenerSueldoBase",

            empleados: JSON.stringify(empleadosSeleccionadosSueldoBase)

        },

        dataType: "json",

        success: function (respuesta) {

            copiarInformacionEmpleadoSueldoBase(respuesta);
        },

        error: function (xhr, status, error) {

            console.log(error);

        }

    });

}

//===================================================
// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// OBTENIDA DEl SERVIDOR Y ACTUALIZAR sueldo_neto

// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// BUSCA EL EMPLEADO DENTRO DE jsonNomina40lbs
// Y ACTUALIZA SU PROPIEDAD "sueldo_neto" CON EL 
// VALOR OBTENIDO DEL SERVIDOR.
//===================================================

function copiarInformacionEmpleadoSueldoBase(empleadosConSueldoBase) {

    empleadosConSueldoBase.forEach(empleadoServidor => {

        jsonNomina40lbs.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                if (empleado.id_empleado == empleadoServidor.id_empleado) {

                    empleado.sueldo_neto = empleadoServidor.salario_semanal;

                    empleado.sueldo_base = true;

                    // Limpiar historial de inasistencias para recalcularlo
                    empleado.historial_inasistencias = [];

                    // Establecer historial de inasistencias
                    crearHistorialInasistencias(empleado);

                }

            });

        });

    });

    llenarTablaNomina();

    $('#modalSueldoBase').modal('hide');

}


//==========================================================
// FUNCIÓN PARA QUITAR EL SUELDO BASE DE LOS EMPLEADOS
// SELECCIONADOS EN EL MODAL
//==========================================================

function quitarSueldoBase() {

    // Detectar clic en el botón "Quitar Sueldo Base"
    $('#btnQuitarSueldoBase').click(function () {

        // Verificar que exista al menos un empleado seleccionado
        if ($('.check-empleado-sueldo-base:checked').length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );

            return;
        }

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-sueldo-base:checked').each(function () {

            // Obtener el id del empleado
            let idEmpleado = $(this).val();

            // Buscar el empleado dentro del JSON
            jsonNomina40lbs.departamentos.forEach(departamento => {

                departamento.empleados.forEach(empleado => {

                    if (empleado.id_empleado == idEmpleado) {

                        // Quitar el sueldo base
                        empleado.sueldo_base = false;

                        // Remover la propiedad sueldo_base
                        delete empleado.sueldo_base;

                        // Obtener el tabulador de sueldos para restablecer el sueldo neto
                        getTabulador();

                        // Restablecer el sueldo neto de acuerdo al tabulador
                        establecerSueldoNeto(empleado);


                    }

                });

            });

        });

        // Actualizar la tabla
        llenarTablaNomina();

        // Cerrar el modal
        $('#modalSueldoBase').modal('hide');

    });

}