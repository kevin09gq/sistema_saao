

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
    $('#btn_dispersion_tarjeta').click(function () {

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
    jsonNominaConfianza.departamentos.forEach(function (departamento) {

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

    // Limpiar el checkbox principal
    $('#checkTodosDispersionTarjeta').prop('checked', false);

    // Obtener el departamento seleccionado
    let departamentoSeleccionado = $("#selectDepartamentoDispersionTarjeta").val();

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(function (departamento) {

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

                        <div class="input-group input-group-sm">

                            <input
                                type="number"
                                class="form-control input-tarjeta"
                                id="inputTarjeta-${empleado.id_empleado}"
                                value="${parseFloat(empleado.tarjeta || 0).toFixed(2)}"
                                oninput="limitarTarjetaEmpleado(${empleado.id_empleado})"
                                readonly>

                            <button
                                class="btn btn-outline-primary"
                                id="btnEditarTarjeta-${empleado.id_empleado}"
                                onclick="editarTarjetaEmpleado(${empleado.id_empleado})">

                                <i class="bi bi-pencil"></i>

                            </button>

                            <button
                                class="btn btn-outline-success"
                                id="btnGuardarTarjeta-${empleado.id_empleado}"
                                onclick="guardarTarjetaEmpleado(${empleado.id_empleado})"
                                hidden>

                                <i class="bi bi-check-lg"></i>

                            </button>

                            <button
                                class="btn btn-outline-danger"
                                id="btnCancelarTarjeta-${empleado.id_empleado}"
                                onclick="cancelarEdicionTarjeta(${empleado.id_empleado})"
                                hidden>

                                <i class="bi bi-x-lg"></i>

                            </button>

                        </div>

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




//===================================================
// FUNCIÓN PARA EDITAR LA TARJETA DEL EMPLEADO
//===================================================

function editarTarjetaEmpleado(idEmpleado) {

    $("#inputTarjeta-" + idEmpleado).prop("readonly", false).focus();

    $("#btnEditarTarjeta-" + idEmpleado).prop("hidden", true);

    $("#btnGuardarTarjeta-" + idEmpleado).prop("hidden", false);

    $("#btnCancelarTarjeta-" + idEmpleado).prop("hidden", false);

}


//===================================================
// FUNCIÓN PARA LIMITAR EL IMPORTE DE LA TARJETA
//===================================================

function limitarTarjetaEmpleado(idEmpleado) {

    let empleado = null;

    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        departamento.empleados.forEach(function (emp) {

            if (emp.id_empleado == idEmpleado) {

                empleado = emp;

            }

        });

    });

    if (!empleado) {
        return;
    }

    let maximo = parseFloat(empleado.tarjeta_copia) || 0;

    let cantidad = parseFloat($("#inputTarjeta-" + idEmpleado).val()) || 0;

    if (cantidad > maximo) {

        $("#inputTarjeta-" + idEmpleado).val(maximo.toFixed(2));

    }

}

//===================================================
// FUNCIÓN PARA GUARDAR LA TARJETA DEL EMPLEADO
//===================================================

function guardarTarjetaEmpleado(idEmpleado) {

    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        departamento.empleados.forEach(function (empleado) {

            if (empleado.id_empleado != idEmpleado) {
                return;
            }

            empleado.tarjeta = parseFloat($("#inputTarjeta-" + idEmpleado).val()) || 0;

        });

    });

    $("#inputTarjeta-" + idEmpleado).prop("readonly", true);

    $("#btnEditarTarjeta-" + idEmpleado).prop("hidden", false);

    $("#btnGuardarTarjeta-" + idEmpleado).prop("hidden", true);

    $("#btnCancelarTarjeta-" + idEmpleado).prop("hidden", true);

    llenarTablaNomina();

}


//===================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN DE LA TARJETA
//===================================================

function cancelarEdicionTarjeta(idEmpleado) {

    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        departamento.empleados.forEach(function (empleado) {

            if (empleado.id_empleado != idEmpleado) {
                return;
            }

            $("#inputTarjeta-" + idEmpleado).val(empleado.tarjeta);

        });

    });

    $("#inputTarjeta-" + idEmpleado).prop("readonly", true);

    $("#btnEditarTarjeta-" + idEmpleado).prop("hidden", false);

    $("#btnGuardarTarjeta-" + idEmpleado).prop("hidden", true);

    $("#btnCancelarTarjeta-" + idEmpleado).prop("hidden", true);

}