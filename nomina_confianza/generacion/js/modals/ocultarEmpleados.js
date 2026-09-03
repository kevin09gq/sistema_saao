
$(document).ready(function () {

    abrirModalOcultarEmpleados();

    buscadorEmpleadosOcultar();

    seleccionarTodosEmpleadoOcultar();

    seleccionarDepartamentosOcultar();
});

let empleadosSeleccionadosOcultar = [];


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE OCULTAR EMPLEADOS
//===================================================

function abrirModalOcultarEmpleados() {

    // Detectar el clic en el botón "Ocultar Empleados"
    $('#btn-ocultar-empleados').click(function () {
        cargarEmpleadosOcultar();
        // Abrir el modal de Bootstrap
        $('#modalOcultarEmpleados').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// SE MOSTRARÁN A TODOS LOS EMPLEADOS SIN IMPORTAR SI 
// ESTÁN OCULTOS O NO
//===================================================

function cargarEmpleadosOcultar() {

    // Limpiar tabla
    $('#tbody-empleados-ocultar').empty();

    // Limpiar el checkbox principal
    $('#checkSeleccionarTodosOcultar').prop('checked', false);

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {

        // Recorrer empleados del departamento sin importar si están ocultos o no

        const empleadosMostrar = departamento.empleados.filter(empleado => {
            return true; // Mostrar todos los empleados
        });

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-ocultar').append(`
            <tr class="table-secondary">
                <td colspan="4" class="fw-bold">
                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-ocultar"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);


        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-ocultar').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-ocultar"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                    <td>${empleado.mostrar ? '<span class="badge bg-success">Visible</span>' : '<span class="badge bg-danger">Oculto</span>'}</td>


                </tr>
            `);

        });

    });

    seleccionarDepartamentosOcultar();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosOcultar() {

    $('.check-departamento-ocultar').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        $(`.check-empleado-ocultar[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}


//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosOcultar() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoOcultar').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-ocultar tr').each(function () {

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

function seleccionarTodosEmpleadoOcultar() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkSeleccionarTodosOcultar').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-ocultar:visible').prop('checked', $(this).prop('checked'));

    });

}

//==========================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
//==========================================================

function obtenerEmpleadosSeleccionadosOcultar() {

    empleadosSeleccionadosOcultar = [];

    $(".check-empleado-ocultar:checked").each(function () {

        empleadosSeleccionadosOcultar.push(
            parseInt($(this).val())
        );

    });

}


//==========================================================
// FUNCIÓN PARA OCULTAR O DESOCULTAR EMPLEADOS
// mostrar = true  -> Mostrar empleado
// mostrar = false -> Ocultar empleado
//==========================================================

function establecerMostrarEmpleado(mostrar) {

    // Obtener empleados seleccionados
    obtenerEmpleadosSeleccionadosOcultar();

    // Validar selección
    if (empleadosSeleccionadosOcultar.length == 0) {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debes seleccionar al menos un empleado."
        );

        return;

    }

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        // Recorrer empleados
        departamento.empleados.forEach(function (empleado) {

            // Verificar si fue seleccionado
            if (empleadosSeleccionadosOcultar.includes(parseInt(empleado.id_empleado))) {

                empleado.mostrar = mostrar;

            }

        });

    });

    // Actualizar tabla del modal
    cargarEmpleadosOcultar();

    // Actualizar la vista principal
    llenarTablaNomina();

}

$("#btnOcultarEmpleados").click(function () {

    establecerMostrarEmpleado(false);

});

$("#btnDesocultarEmpleados").click(function () {

    establecerMostrarEmpleado(true);

});