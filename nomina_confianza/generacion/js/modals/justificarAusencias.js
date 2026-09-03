$(document).ready(function () {
    abrirModalJustificarAusencias();
    buscadorEmpleadosJustificarAusencias();
    seleccionarTodosEmpleadoJustificarAusencias();
    seleccionarDepartamentosJustificarAusencias();
    justificarAusencias();
});

//=============================================================
// FUNCIÓN PARA ABRIR EL MODAL DE JUSTIFICAR AUSENCIAS
//=============================================================

function abrirModalJustificarAusencias() {

    $('#btn_justificar_ausencias').click(function () {

        // desmarcar todos los checkboxes de días del paso 1
        $('.check-dia-justificar').prop('checked', false);

        // limpiar el input del tipo/motivo
        $('#inputTipoJustificarAusencias').val('');

        // limpiar el buscador de empleados
        $('#txtBuscarEmpleadoJustificarAusencias').val('');

        // cargar la lista de empleados con ausencias > 0
        cargarEmpleadosJustificarAusencias();

        // abrir el modal de bootstrap
        $('#modalJustificarAusencias').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON
// inasistencia > 0 Y mostrar = true
//===================================================

function cargarEmpleadosJustificarAusencias() {

    // limpiar el contenido de la tabla
    $('#tbody-empleados-justificar-ausencias').empty();

    // desmarcar el checkbox de seleccionar todos
    $('#checkTodosJustificarAusencias').prop('checked', false);

    // bandera para saber si se encontraron empleados
    let hayEmpleados = false;

    // recorrer todos los departamentos de la nómina
    jsonNominaConfianza.departamentos.forEach(departamento => {

        // filtrar solo empleados visibles y que tengan al menos una inasistencia
        const empleadosMostrar = departamento.empleados.filter(
            empleado => empleado.mostrar && (empleado.inasistencia > 0)
        );

        // si el departamento no tiene empleados con ausencias, se omite
        if (empleadosMostrar.length === 0) {
            return;
        }

        hayEmpleados = true;

        // agregar fila de encabezado del departamento
        $('#tbody-empleados-justificar-ausencias').append(`
            <tr class="table-secondary">
                <td colspan="5" class="fw-bold">
                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-justificar-ausencias"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // agregar una fila por cada empleado con ausencias
        empleadosMostrar.forEach(empleado => {

            // construir los badges de días ausentes filtrando solo los que tienen descuento > 0
            let diasHTML = '';
            if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length > 0) {

                // filtrar únicamente los días con descuento activo
                let diasConDescuento = empleado.historial_inasistencias.filter(function (item) {
                    return item.descuento_inasistencia > 0;
                });

                if (diasConDescuento.length > 0) {
                    // generar un badge por cada día con descuento
                    diasHTML = diasConDescuento.map(function (item) {
                        let dia = normalizarDia(item.dia);
                        return `<span class="badge bg-warning text-dark me-1">${dia}</span>`;
                    }).join('');
                } else {
                    diasHTML = '<span class="text-muted small">sin descuento</span>';
                }

            } else {
                diasHTML = '<span class="text-muted small">sin detalle</span>';
            }

            $('#tbody-empleados-justificar-ausencias').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-justificar-ausencias"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                    <td class="text-center">
                        <span class="badge bg-danger">${empleado.inasistencia}</span>
                    </td>

                    <td>${diasHTML}</td>

                </tr>
            `);

        });

    });

    // si no se encontró ningún empleado con ausencias, mostrar mensaje
    if (!hayEmpleados) {
        $('#tbody-empleados-justificar-ausencias').append(`
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    <i class="bi bi-check2-circle me-2"></i>
                    no hay empleados con ausencias registradas.
                </td>
            </tr>
        `);
    }

    // re-vincular el evento de selección por departamento
    seleccionarDepartamentosJustificarAusencias();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosJustificarAusencias() {

    // al hacer clic en el checkbox del departamento, marcar/desmarcar todos sus empleados
    $('.check-departamento-justificar-ausencias').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        $(`.check-empleado-justificar-ausencias[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
//===================================================

function buscadorEmpleadosJustificarAusencias() {

    $('#txtBuscarEmpleadoJustificarAusencias').on('keyup', function () {

        // obtener texto ingresado en minúsculas para comparación
        let texto = $(this).val().toLowerCase().trim();

        $('#tbody-empleados-justificar-ausencias tr').each(function () {

            // ignorar las filas de encabezado de departamento
            if ($(this).hasClass('table-secondary') || $(this).hasClass('table-success')) {
                return;
            }

            // leer clave y nombre de las columnas correspondientes
            let clave = $(this).find('td:eq(1)').text().toLowerCase();
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // mostrar u ocultar según coincidencia
            if (clave.includes(texto) || nombre.includes(texto)) {
                $(this).show();
            } else {
                $(this).hide();
            }

        });

    });

}

//===============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
//===============================================================

function seleccionarTodosEmpleadoJustificarAusencias() {

    // al cambiar el checkbox principal, afectar todos los checkboxes visibles
    $('#checkTodosJustificarAusencias').change(function () {
        $('.check-empleado-justificar-ausencias:visible').prop('checked', $(this).prop('checked'));
    });

}

//===============================================================
// FUNCIÓN PARA APLICAR LA JUSTIFICACIÓN A LOS EMPLEADOS
// SOPORTA MÚLTIPLES DÍAS SELECCIONADOS
// Y GUARDA EN dias_justificados: [{ dia, tipo }]
//===============================================================

function justificarAusencias() {

    $('#btnEstablecerJustificacionAusencias').click(function () {

        // obtener todos los días marcados en los checkboxes del paso 1
        let diasSeleccionados = [];
        $('.check-dia-justificar:checked').each(function () {
            diasSeleccionados.push($(this).val());
        });

        // obtener el motivo escrito por el usuario
        let tipoSeleccionado = $('#inputTipoJustificarAusencias').val().trim();

        // validar que se haya seleccionado al menos un día
        if (diasSeleccionados.length === 0) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar al menos un día de la semana.');
            return;
        }

        // validar que se haya ingresado el motivo
        if (!tipoSeleccionado) {
            mostrarAlerta('warning', 'Advertencia', 'Debes ingresar el tipo / motivo de la justificación.');
            return;
        }

        // obtener los ids de los empleados seleccionados en la tabla
        let empleadosSeleccionados = [];
        $('.check-empleado-justificar-ausencias:checked').each(function () {
            empleadosSeleccionados.push($(this).val().toString());
        });

        // validar que haya al menos un empleado seleccionado
        if (empleadosSeleccionados.length === 0) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar al menos un empleado.');
            return;
        }

        // recorrer todos los departamentos de la nómina
        jsonNominaConfianza.departamentos.forEach(function (departamento) {

            if (!Array.isArray(departamento.empleados)) return;

            departamento.empleados.forEach(function (empleado) {

                // omitir si el empleado no está en la lista de seleccionados
                if (!empleadosSeleccionados.includes(empleado.id_empleado.toString())) return;

                // asegurar que el arreglo dias_justificados exista
                if (!Array.isArray(empleado.dias_justificados)) {
                    empleado.dias_justificados = [];
                }

                // iterar sobre cada día seleccionado en el paso 1
                diasSeleccionados.forEach(function (dia) {

                    // buscar si ya existe una justificación para este día
                    let indexExistente = empleado.dias_justificados.findIndex(function (d) {
                        return normalizarDia(d.dia) === normalizarDia(dia);
                    });

                    if (indexExistente !== -1) {
                        // si el día ya existe, actualizar únicamente el tipo
                        empleado.dias_justificados[indexExistente].tipo = tipoSeleccionado;
                    } else {
                        // si el día no existe, agregar la nueva justificación
                        empleado.dias_justificados.push({
                            dia: dia,
                            tipo: tipoSeleccionado
                        });
                    }

                    // poner en 0 el descuento de ese día en historial_inasistencias
                    actualizarInasistenciaJustificada(empleado, dia);

                });

            });

        });

        // cerrar el modal y notificar al usuario
        $('#modalJustificarAusencias').modal('hide');

        mostrarAlerta(
            'success',
            'Éxito',
            'La justificación se aplicó correctamente a los empleados seleccionados.'
        );

    });

}

//===============================================================
// FUNCIÓN PARA ACTUALIZAR EL DESCUENTO DE INASISTENCIA
// DEL DÍA QUE FUE JUSTIFICADO
//===============================================================

function actualizarInasistenciaJustificada(empleado, diaSeleccionado) {

    // si el empleado no tiene historial de inasistencias, salir
    if (
        !Array.isArray(empleado.historial_inasistencias) ||
        empleado.historial_inasistencias.length === 0
    ) {
        return;
    }

    // recorrer el historial para encontrar el día correspondiente
    empleado.historial_inasistencias.forEach(function (inasistencia) {

        // validar que el registro tenga día asignado
        if (!inasistencia.dia) {
            return;
        }

        // comparar el día ignorando mayúsculas y acentos
        if (
            normalizarDia(inasistencia.dia) ===
            normalizarDia(diaSeleccionado)
        ) {
            // poner el descuento en 0 ya que el día fue justificado
            inasistencia.descuento_inasistencia = 0;
        }

    });

    // recalcular el total de descuentos por inasistencias del empleado
    calcularDescuentoInasistencias(empleado);

    // actualizar la tabla de nómina para reflejar el cambio
    llenarTablaNomina();

}