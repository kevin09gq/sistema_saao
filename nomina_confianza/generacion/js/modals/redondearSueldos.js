$(document).ready(function () {
    abrirModalRedondearSueldos();

    buscadorEmpleadosRedondearSueldos();

    seleccionarTodosEmpleadoRedondearSueldos();

    seleccionarDepartamentosRedondearSueldos();

    aplicarRedondeoSueldos();

    quitarRedondeoSueldos();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE SUELDO BASE
//===================================================

function abrirModalRedondearSueldos() {

    // Detectar el clic en el botón "Establecer Sueldo Base"
    $('#btn_redondear_sueldos').click(function () {
        cargarEmpleadosRedondearSueldos();
        // Abrir el modal de Bootstrap
        $('#modalRedondearSueldos').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosRedondearSueldos() {

    // Limpiar tabla
    $('#tbody-empleados-redondear-sueldos').empty();

    // Limpiar el checkbox principal
    $('#checkTodosRedondearSueldos').prop('checked', false);

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-redondear-sueldos').append(`
            <tr class="table-secondary">
                <td colspan="7" class="fw-bold">
                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-redondear-sueldos"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(function (empleado) {
            let sueldoActual = 0;
            let diferencia = 0;
            let sueldoRedondeado = 0;

            if (empleado.redondeo_activo) {
                // Si el redondeo ya está activo, el total_cobrar ya está redondeado.
                // El sueldo original sin redondear se obtiene restando la diferencia (redondeo)
                sueldoRedondeado = parseFloat(empleado.total_cobrar) || 0;
                diferencia = parseFloat(empleado.redondeo) || 0;
                sueldoActual = sueldoRedondeado - diferencia;
            } else {
                // Si no está activo, el total_cobrar es el sueldo original sin redondear
                sueldoActual = parseFloat(empleado.total_cobrar) || 0;
                sueldoRedondeado = Math.round(sueldoActual);
                diferencia = sueldoRedondeado - sueldoActual;
            }

            // Mostrar la diferencia con signo
            let diferenciaTexto = "";
            if (diferencia > 0) {
                diferenciaTexto = "+" + diferencia.toFixed(2);
            } else if (diferencia < 0) {
                diferenciaTexto = diferencia.toFixed(2);
            } else {
                diferenciaTexto = "0.00";
            }

            let colorDiferenciaClass = "";
            if (diferencia > 0) {
                colorDiferenciaClass = "text-success";
            } else if (diferencia < 0) {
                colorDiferenciaClass = "text-danger";
            }

            // Estado
            let estado = empleado.redondeo_activo
                ? '<span class="badge bg-success">Redondeado</span>'
                : '<span class="badge bg-secondary">Sin Redondear</span>';

            $('#tbody-empleados-redondear-sueldos').append(`

                <tr>

                    <td class="text-center">

                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-redondear-sueldos"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">

                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                    <td class="text-end">
                        $${sueldoActual.toFixed(2)}
                    </td>

                    <td class="text-end ${colorDiferenciaClass}">
                        ${diferenciaTexto}
                    </td>

                    <td class="text-end fw-bold text-success">
                        $${sueldoRedondeado.toFixed(2)}
                    </td>

                    <td class="text-center">
                        ${estado}
                    </td>

                </tr>

            `);

        });

    });

    seleccionarDepartamentosRedondearSueldos();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosRedondearSueldos() {

    $('.check-departamento-redondear-sueldos').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        $(`.check-empleado-redondear-sueldos[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosRedondearSueldos() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoRedondearSueldos').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-redondear-sueldos tr').each(function () {

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

function seleccionarTodosEmpleadoRedondearSueldos() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosRedondearSueldos').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-redondear-sueldos:visible').prop('checked', $(this).prop('checked'));

    });

}

//==========================================================
// FUNCIÓN PARA ESTABLECER EL REDONDEO A LOS EMPLEADOS
//==========================================================
function aplicarRedondeoSueldos() {
    $('#btnRedondearSueldos').click(function () {
        // Verificar que exista al menos un empleado seleccionado
        if ($('.check-empleado-redondear-sueldos:checked').length === 0) {
            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );
            return;
        }

        // Recorrer todos los checkboxes seleccionados
        $('.check-empleado-redondear-sueldos:checked').each(function () {
            let idEmpleado = $(this).val();

            // Buscar el empleado en jsonNominaConfianza
            jsonNominaConfianza.departamentos.forEach(departamento => {
                departamento.empleados.forEach(empleado => {
                    if (empleado.id_empleado == idEmpleado) {

                        // Actualizar el estado del redondeo 
                        empleado.redondeo_activo = true;

                        // Actualiza el redondeo obteniedo de la fila seleccionada
                        empleado.redondeo = parseFloat($(this).closest('tr').find('td:eq(4)').text()) || 0;
                    }
                });
            });
        });


        // Actualizar la tabla principal
        llenarTablaNomina();

        // Cerrar modal
         $('#modalRedondearSueldos').modal('hide');
    });
}

//==========================================================
// FUNCIÓN PARA QUITAR EL REDONDEO A LOS EMPLEADOS
//==========================================================
function quitarRedondeoSueldos() {
    $('#btnQuitarRedondeoSueldos').click(function () {
        // Verificar que exista al menos un empleado seleccionado
        if ($('.check-empleado-redondear-sueldos:checked').length === 0) {
            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );
            return;
        }

        // Recorrer todos los checkboxes seleccionados
        $('.check-empleado-redondear-sueldos:checked').each(function () {
            let idEmpleado = $(this).val();


            // Buscar el empleado en jsonNominaConfianza
            jsonNominaConfianza.departamentos.forEach(departamento => {
                departamento.empleados.forEach(empleado => {
                    if (empleado.id_empleado == idEmpleado) {
                        empleado.redondeo_activo = false;
                        empleado.redondeo = 0;
                    }
                });
            });
        });

    

        // Actualizar la tabla principal
        llenarTablaNomina();

        // Cerrar modal
        $('#modalRedondearSueldos').modal('hide');
    });
}

