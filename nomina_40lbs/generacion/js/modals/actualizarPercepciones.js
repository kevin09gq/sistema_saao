$(document).ready(function () {
    abrirModalActualizarPercepciones();
    buscadorEmpleadosActualizarPercepciones();
    seleccionarTodosEmpleadoActualizarPercepciones();
    actualizarPercepcionesEmpleados();
});

//==================================
// FUNCIÓN PARA ABRIR EL MODAL DE 
// ACTUALIZAR PERCEPCIONES
//==================================

function abrirModalActualizarPercepciones() {

    // Detectar el clic en el botón "Actualizar Percepciones"
    $('#btn_actualizar_percepciones').click(function () {
        cargarEmpleadosActualizarPercepciones();
        // Abrir el modal de Bootstrap
        $('#modalActualizarPercepciones').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosActualizarPercepciones() {

    // Limpiar tabla
    $('#tbody-empleados-actualizar-percepciones').empty();

    // Limpiar el checkbox principal
    $('#checkTodosActualizarPercepciones').prop('checked', false);

    // Recorrer departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-actualizar-percepciones').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-actualizar-percepciones').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-actualizar-percepciones"
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

function buscadorEmpleadosActualizarPercepciones() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoActualizarPercepciones').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-actualizar-percepciones tr').each(function () {

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

function seleccionarTodosEmpleadoActualizarPercepciones() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosActualizarPercepciones').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-actualizar-percepciones:visible').prop('checked', $(this).prop('checked'));

    });

}


//===================================================
// OBTENER INFORMACIÓN PARA ACTUALIZAR PERCEPCIONES
//===================================================

function obtenerDatosActualizarPercepciones() {

    // Obtener percepción seleccionada

    let propiedad = $('#selectTipoPercepcionActualizar').val();


    // Obtener cantidad

    let cantidad = $('#inputCantidadActualizarPercepcion').val();

    // Validar percepción

    if (propiedad === "") {


        Swal.fire(
            "Atención",
            "Seleccione una percepción",
            "warning"
        );


        return null;

    }

    // Validar cantidad

    if (cantidad === "" || isNaN(cantidad)) {


        Swal.fire(
            "Atención",
            "Ingrese una cantidad válida",
            "warning"
        );


        return null;

    }

    // Obtener empleados seleccionados

    let empleadosSeleccionados = [];

    $('.check-empleado-actualizar-percepciones:checked').each(function () {


        empleadosSeleccionados.push(
            $(this).val()
        );


    });


    if (empleadosSeleccionados.length === 0) {


        Swal.fire(
            "Atención",
            "Seleccione al menos un empleado",
            "warning"
        );


        return null;


    }


    return {


        propiedad: propiedad,

        cantidad: parseFloat(cantidad),

        empleados: empleadosSeleccionados


    };

}


//===================================================
// ACTUALIZAR PERCEPCIONES DE EMPLEADOS SELECCIONADOS
//===================================================

function actualizarPercepcionesEmpleados() {


    $('#btnActualizarPercepciones').click(function () {


        let datos = obtenerDatosActualizarPercepciones();


        if (datos === null) {

            return;

        }

        jsonNomina40lbs.departamentos.forEach(function (departamento) {

            departamento.empleados.forEach(function (empleado) {

                // Validar si el empleado está seleccionado

                if (
                    datos.empleados.includes(
                        String(empleado.id_empleado)
                    )
                ) {

                    // Actualizar propiedad

                    empleado[datos.propiedad] = datos.cantidad;


                }

            });

        });


        Swal.fire(
            "Correcto",
            "Percepciones actualizadas correctamente",
            "success"
        );

        llenarTablaNomina();

        // Cerrar el modal
        $('#modalActualizarPercepciones').modal('hide');

        //Limpiar el buscador y el input de cantidad y el select de percepciones
        $('#selectTipoPercepcionActualizar').val('');
        $('#txtBuscarEmpleadoActualizarPercepciones').val('');
        $('#inputCantidadActualizarPercepcion').val('');
        
    });

}