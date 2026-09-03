$(document).ready(function () {
    abrirModalDiasExtra();
    pasoNavegacionDiasExtra();
    buscadorEmpleadosDiasExtra();
    seleccionarTodosEmpleadosDiasExtra();
    seleccionarDepartamentosDiasExtra();
    aplicarDiasExtra();
});

//===================================================
// ABRIR EL MODAL DE DÍAS EXTRA
//===================================================

function abrirModalDiasExtra() {

    $('#btn_dias_extra').click(function () {

        // limpiar los selects del paso 1
        $('#selectDiaDiasExtra').val('');
        $('#selectAccionDiasExtra').val('');

        // limpiar el buscador
        $('#txtBuscarEmpleadoDiasExtra').val('');

        // ocultar la sección del paso 2 y limpiar la tabla
        $('#divListaEmpleadosDiasExtra').hide();
        $('#tbody-empleados-dias-extra').empty();
        $('#checkTodosDiasExtra').prop('checked', false);

        // mostrar el modal
        $('#modalDiasExtra').modal('show');

    });

}

//===================================================
// NAVEGACIÓN PASO 1 A PASO 2
//===================================================

function pasoNavegacionDiasExtra() {

    $('#btnSiguienteDiasExtra').click(function () {

        // obtener el día y la acción seleccionados
        let diaSeleccionado = $('#selectDiaDiasExtra').val();
        let accionSeleccionada = $('#selectAccionDiasExtra').val();

        // validar que se haya seleccionado un día
        if (!diaSeleccionado) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar el día de la semana.');
            return;
        }

        // validar que se haya seleccionado una acción
        if (!accionSeleccionada) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar la acción (agregar o quitar).');
            return;
        }

        // actualizar el label de la tabla según la acción elegida
        if (accionSeleccionada === 'agregar') {
            $('#labelTablaDiasExtra').html(
                '<i class="bi bi-plus-circle text-success me-1"></i> Empleados — Agregar día: ' + diaSeleccionado
            );
        } else {
            $('#labelTablaDiasExtra').html(
                '<i class="bi bi-dash-circle text-danger me-1"></i> Empleados — Quitar día: ' + diaSeleccionado
            );
        }

        // cargar la lista de empleados jornaleros
        cargarEmpleadosDiasExtra(diaSeleccionado, accionSeleccionada);

        // mostrar la sección del paso 2 con animación
        $('#divListaEmpleadosDiasExtra').slideDown();

    });

}

//===================================================
// CARGAR EMPLEADOS DE DEPARTAMENTOS TIPO_HORARIO = 2
//===================================================

function cargarEmpleadosDiasExtra(diaSeleccionado, accionSeleccionada) {

    // limpiar la tabla y desmarcar el checkbox principal
    $('#tbody-empleados-dias-extra').empty();
    $('#checkTodosDiasExtra').prop('checked', false);

    let hayEmpleados = false;

    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) return;

    jsonNominaHuasteca.departamentos.forEach(function (departamento) {

        // solo procesar departamentos jornaleros (tipo_horario = 2)
        if (departamento.tipo_horario != 2) return;

        if (!Array.isArray(departamento.empleados)) return;

        // filtrar empleados visibles (mostrar !== false)
        const empleadosMostrar = departamento.empleados.filter(function (emp) {
            return emp.mostrar !== false;
        });

        // si no hay empleados en este departamento, omitirlo
        if (empleadosMostrar.length === 0) return;

        hayEmpleados = true;

        // agregar fila de encabezado del departamento
        $('#tbody-empleados-dias-extra').append(`
            <tr class="table-secondary">
                <td colspan="5" class="fw-bold">
                    <input
                        type="checkbox"
                        class="form-check-input me-2 check-depto-dias-extra"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        empleadosMostrar.forEach(function (empleado) {

            // asegurar que el arreglo de días extra exista
            if (!Array.isArray(empleado.dias_extra_detalle)) {
                empleado.dias_extra_detalle = [];
            }

            // construir los badges de los días extra acumulados
            let diasExtraHTML = '';
            if (empleado.dias_extra_detalle.length > 0) {
                diasExtraHTML = empleado.dias_extra_detalle.map(function (item) {
                    return `<span class="badge bg-info text-dark me-1">${normalizarDia(item.dia)}</span>`;
                }).join('');
            } else {
                diasExtraHTML = '<span class="text-muted small">ninguno</span>';
            }

            // obtener los días trabajados base más los días extra acumulados
            let diasBase = empleado.dias_trabajados || 0;

            $('#tbody-empleados-dias-extra').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-dias-extra"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave || ''}</td>

                    <td>${empleado.nombre || ''}</td>

                    <td class="text-center">
                        <span class="badge bg-primary">${diasBase}</span>
                    </td>

                    <td>${diasExtraHTML}</td>

                </tr>
            `);

        });

    });

    // si no se encontraron empleados jornaleros, mostrar mensaje
    if (!hayEmpleados) {
        $('#tbody-empleados-dias-extra').append(`
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    <i class="bi bi-info-circle me-2"></i>
                    no se encontraron empleados jornaleros (tipo_horario = 2).
                </td>
            </tr>
        `);
    }

    // re-vincular los eventos de selección por departamento
    seleccionarDepartamentosDiasExtra();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosDiasExtra() {

    // al marcar/desmarcar el checkbox del departamento, afectar a todos sus empleados
    $('.check-depto-dias-extra').off('change').on('change', function () {
        let idDepto = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');
        $(`.check-empleado-dias-extra[data-departamento="${idDepto}"]`).prop('checked', seleccionado);
    });

}

//===================================================
// BUSCADOR EN TIEMPO REAL
//===================================================

function buscadorEmpleadosDiasExtra() {

    $('#txtBuscarEmpleadoDiasExtra').on('keyup', function () {

        // obtener el texto ingresado en minúsculas
        let texto = $(this).val().toLowerCase().trim();

        $('#tbody-empleados-dias-extra tr').each(function () {

            // ignorar las filas de encabezado de departamento
            if ($(this).hasClass('table-secondary')) return;

            // leer clave y nombre de la fila
            let clave = $(this).find('td:eq(1)').text().toLowerCase();
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // mostrar u ocultar según la coincidencia
            if (clave.includes(texto) || nombre.includes(texto)) {
                $(this).show();
            } else {
                $(this).hide();
            }

        });

    });

}

//===================================================
// SELECCIONAR / DESELECCIONAR TODOS LOS EMPLEADOS
//===================================================

function seleccionarTodosEmpleadosDiasExtra() {

    // al cambiar el checkbox principal, afectar todos los checkboxes visibles
    $('#checkTodosDiasExtra').change(function () {
        $('.check-empleado-dias-extra:visible').prop('checked', $(this).prop('checked'));
    });

}

//===================================================
// APLICAR DÍAS EXTRA A LOS EMPLEADOS SELECCIONADOS
//===================================================

function aplicarDiasExtra() {

    $('#btnAplicarDiasExtra').click(function () {

        // leer la acción y el día del paso 1
        let diaSeleccionado = $('#selectDiaDiasExtra').val();
        let accionSeleccionada = $('#selectAccionDiasExtra').val();

        // validar configuración del paso 1
        if (!diaSeleccionado || !accionSeleccionada) {
            mostrarAlerta('warning', 'Advertencia', 'Debes completar el Paso 1 antes de aplicar.');
            return;
        }

        // recolectar los ids de los empleados marcados
        let empleadosSeleccionados = [];
        $('.check-empleado-dias-extra:checked').each(function () {
            empleadosSeleccionados.push($(this).val().toString());
        });

        // validar que haya al menos un empleado seleccionado
        if (empleadosSeleccionados.length === 0) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar al menos un empleado.');
            return;
        }

        // recorrer los departamentos jornaleros y aplicar el cambio
        jsonNominaHuasteca.departamentos.forEach(function (departamento) {

            if (departamento.tipo_horario != 2) return;
            if (!Array.isArray(departamento.empleados)) return;

            departamento.empleados.forEach(function (empleado) {

                // omitir empleados no seleccionados
                if (!empleadosSeleccionados.includes(empleado.id_empleado.toString())) return;

                // asegurar que el arreglo de historial exista
                if (!Array.isArray(empleado.dias_extra_detalle)) {
                    empleado.dias_extra_detalle = [];
                }

                if (accionSeleccionada === 'agregar') {

                    // agregar el día al historial de días extra
                    empleado.dias_extra_detalle.push({
                        dia: diaSeleccionado
                    });

                    // incrementar los días trabajados en 1
                    empleado.dias_trabajados = (empleado.dias_trabajados || 0) + 1;

                } else if (accionSeleccionada === 'quitar') {

                    // buscar el índice del día a quitar en el historial (solo la primera coincidencia)
                    let indexQuitar = empleado.dias_extra_detalle.findIndex(function (item) {
                        return normalizarDia(item.dia) === normalizarDia(diaSeleccionado);
                    });

                    if (indexQuitar !== -1) {

                        // eliminar el día del historial
                        empleado.dias_extra_detalle.splice(indexQuitar, 1);

                        // decrementar los días trabajados (mínimo 0)
                        empleado.dias_trabajados = Math.max(0, (empleado.dias_trabajados || 0) - 1);

                    } else {
                        // el empleado no tiene ese día extra registrado, omitir
                        return;
                    }

                }

                // recalcular salario, comida y pasaje con los nuevos días trabajados
                calcularSalarioSemanal(empleado);
                calcularPagoComidaEmpleado(empleado);
                calcularPagoPasajeEmpleado(empleado);

            });

        });

        // actualizar la tabla de nómina con los nuevos cálculos
        llenarTablaNomina();

        // recargar la lista de empleados para reflejar el cambio en los badges
        cargarEmpleadosDiasExtra(diaSeleccionado, accionSeleccionada);

        mostrarAlerta(
            'success',
            'Éxito',
            `Se ${accionSeleccionada === 'agregar' ? 'agregó' : 'quitó'} el día correctamente a los empleados seleccionados.`
        );

    });

}
