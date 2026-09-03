

$(document).ready(function () {
    abrirModalDispersionTarjeta();

    buscadorEmpleadosDispersionTarjeta();

    filtrarDepartamentoDispersionTarjeta();

});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DISPERSION DE TARJETA
//===================================================

function abrirModalDispersionTarjeta() {

    // Detectar el clic en el botón "Establecer Sueldo Base"
    $('#btnDispersionTarjeta').click(function () {

        cargarDepartamentosDispersionTarjeta();

        cargarEmpleadosDispersionTarjeta();

        // Abrir el modal de Bootstrap
        $('#modalDispersionTarjeta').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS DEPARTAMENTOS EN EL SELECT
//===================================================

function cargarDepartamentosDispersionTarjeta() {

    // Limpiar select
    $("#selectDepartamentoDispersionTarjeta").empty();

    // Opción por defecto
    $("#selectDepartamentoDispersionTarjeta").append(`
        <option value="todos">
            Todos los departamentos
        </option>
    `);

    // Agregar departamentos
    jsonHistorialPilar.departamentos.forEach(function (departamento) {

        $("#selectDepartamentoDispersionTarjeta").append(`
            <option value="${departamento.id_departamento}">
                ${departamento.nombre}
            </option>
        `);

    });

}

//===================================================
// FUNCIÓN PARA FILTRAR LOS EMPLEADOS POR DEPARTAMENTO
//===================================================

function filtrarDepartamentoDispersionTarjeta() {

    $("#selectDepartamentoDispersionTarjeta").change(function () {

        cargarEmpleadosDispersionTarjeta();

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosDispersionTarjeta() {

    // Limpiar tabla
    $('#tbody-empleados-dispersion-tarjeta').empty();

    // Obtener el departamento seleccionado
    let departamentoSeleccionado = $("#selectDepartamentoDispersionTarjeta").val();

    // Recorrer departamentos
    jsonHistorialPilar.departamentos.forEach(function (departamento) {

        // Filtrar departamento
        if (
            departamentoSeleccionado != "todos" &&
            departamentoSeleccionado != null &&
            departamento.id_departamento != departamentoSeleccionado
        ) {
            return;
        }

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(function (emp) {

            return emp.mostrar && emp.seguroSocial;

        });

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-dispersion-tarjeta').append(`
            <tr class="table-secondary">

                <td colspan="4" class="fw-bold">

                    <i class="bi bi-building me-2"></i>

                    ${departamento.nombre}

                </td>

            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(function (empleado) {

            $('#tbody-empleados-dispersion-tarjeta').append(`

                <tr>
                
                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                    <td>

                            <input
                                type="number"
                                class="form-control input-tarjeta"
                                value="${parseFloat(empleado.tarjeta || 0).toFixed(2)}"
                                readonly>

                    </td>

                </tr>

            `);

        });

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosDispersionTarjeta() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoDispersionTarjeta').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-dispersion-tarjeta tr').each(function () {

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





