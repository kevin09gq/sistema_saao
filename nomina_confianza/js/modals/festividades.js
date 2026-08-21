$(document).ready(function () {
    abrirModalFestividades();
    pasoNavegacionFestividades();
    buscadorEmpleadosFestividades();
    seleccionarTodosEmpleadosFestividades();
    seleccionarDepartamentosFestividades();
    aplicarFestividades();
});

//===================================================
// ABRIR EL MODAL DE APLICAR FESTIVIDADES
//===================================================

function abrirModalFestividades() {

    $('#btn_aplicar_festividades').click(function () {

        // validar que la nómina esté inicializada con sus fechas
        if (!jsonNominaConfianza || !jsonNominaConfianza.fecha_inicio || !jsonNominaConfianza.fecha_cierre) {
            mostrarAlerta('error', 'Error', 'No se ha inicializado la estructura de la nómina.');
            return;
        }

        // ocultar la sección del paso 2 y limpiar todo al abrir
        $('#divListaEmpleadosFestividades').hide();
        $('#checkTodosFestividades').prop('checked', false);
        $('#txtBuscarEmpleadoFestividades').val('');
        $('#tbody-empleados-festividades').empty();

        // consultar las festividades del periodo de la nómina
        obtenerFestividadesNomina();

        // mostrar el modal
        $('#modalFestividades').modal('show');

    });

}

//===================================================
// OBTENER FESTIVIDADES DENTRO DEL PERIODO DE NÓMINA
//===================================================

function obtenerFestividadesNomina() {

    // mostrar indicador de carga en el select mientras se consulta
    $('#selectFestividadModal').html('<option value="">Cargando festividades...</option>');

    $.ajax({
        url: "../php/infoEmpleados.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerFestividadesNomina",
            fecha_inicio: jsonNominaConfianza.fecha_inicio,
            fecha_cierre: jsonNominaConfianza.fecha_cierre
        },
        success: function (respuesta) {

            // limpiar el select antes de llenarlo
            $('#selectFestividadModal').empty();

            // si no hay festividades en el periodo, mostrar mensaje y salir
            if (!respuesta.success || !respuesta.festividades || respuesta.festividades.length === 0) {
                $('#selectFestividadModal').append(`
                    <option value="">No existen días festivos registrados en este periodo de nómina.</option>
                `);
                return;
            }

            // agregar opción vacía inicial
            $('#selectFestividadModal').append(`
                <option value="">Seleccione un día festivo...</option>
            `);

            // llenar el select con las festividades encontradas
            respuesta.festividades.forEach(function (festividad) {
                $('#selectFestividadModal').append(`
                    <option 
                        value="${festividad.nombre}" 
                        data-dia="${festividad.dia_nombre}" 
                        data-fecha="${festividad.fecha_formateada}">
                        ${festividad.dia_nombre} ${festividad.fecha_formateada} - ${festividad.nombre}
                    </option>
                `);
            });

        },
        error: function (xhr, status, error) {
            console.error(error);
            $('#selectFestividadModal').html('<option value="">Error al cargar festividades.</option>');
        }
    });

}

//===================================================
// NAVEGACIÓN PASO 1 A PASO 2
//===================================================

function pasoNavegacionFestividades() {

    $('#btnSiguienteFestividad').click(function () {

        // validar que se haya seleccionado una festividad
        let valFestividad = $('#selectFestividadModal').val();
        if (!valFestividad) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar un día festivo.');
            return;
        }

        // obtener los datos del día festivo seleccionado
        let optionSeleccionada = $('#selectFestividadModal option:selected');
        let diaFestivo = optionSeleccionada.data('dia');
        let nombreFestividad = valFestividad;

        // cargar la lista de empleados filtrada por el día festivo
        cargarEmpleadosFestividades(diaFestivo, nombreFestividad);

        // mostrar la sección del paso 2 con animación
        $('#divListaEmpleadosFestividades').slideDown();

    });

}

//===================================================
// CARGAR EMPLEADOS DE DEPARTAMENTOS TIPO_HORARIO = 1
// SOLO SE MUESTRAN LOS QUE TIENEN INASISTENCIA EN ESE DÍA
// CON PRE-SELECCIÓN SI YA TIENEN EL DÍA JUSTIFICADO
//===================================================

function cargarEmpleadosFestividades(diaFestivo, nombreFestividad) {

    // limpiar la tabla y desmarcar el checkbox de seleccionar todos
    $('#tbody-empleados-festividades').empty();
    $('#checkTodosFestividades').prop('checked', false);

    let hayEmpleados = false;

    // validar que el json esté disponible
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        // solo procesar departamentos con horario oficial (tipo_horario = 1)
        if (departamento.tipo_horario != 1) return;

        if (!Array.isArray(departamento.empleados)) return;

        // filtrar empleados visibles que tienen inasistencia registrada en el día festivo
        const empleadosMostrar = departamento.empleados.filter(function (emp) {

            // el empleado debe estar habilitado para mostrar
            if (emp.mostrar === false) return false;

            // verificar si tiene el día festivo en su historial de inasistencias con descuento > 0
            if (!Array.isArray(emp.historial_inasistencias)) return false;

            return emp.historial_inasistencias.some(function (item) {
                return normalizarDia(item.dia) === normalizarDia(diaFestivo) &&
                       item.descuento_inasistencia > 0;
            });

        });

        // si ningún empleado del departamento aplica, omitir el departamento
        if (empleadosMostrar.length === 0) return;

        hayEmpleados = true;

        // agregar fila de encabezado del departamento
        $('#tbody-empleados-festividades').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <input
                        type="checkbox"
                        class="form-check-input me-2 check-depto-festividades"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // agregar una fila por cada empleado filtrado
        empleadosMostrar.forEach(function (empleado) {

            // verificar si el empleado ya tiene este día justificado
            let yaJustificado = false;
            if (Array.isArray(empleado.dias_justificados)) {
                yaJustificado = empleado.dias_justificados.some(function (d) {
                    return normalizarDia(d.dia) === normalizarDia(diaFestivo);
                });
            }

            // si ya está justificado, marcar el checkbox y resaltar la fila en verde
            let checkedAttr = yaJustificado ? 'checked' : '';
            let rowClass = yaJustificado ? 'class="table-success"' : '';

            $('#tbody-empleados-festividades').append(`
                <tr ${rowClass}>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-festividad"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}"
                            ${checkedAttr}>
                    </td>

                    <td>${empleado.clave || ''}</td>

                    <td>${empleado.nombre || ''}</td>

                </tr>
            `);

        });

    });

    // si no se encontraron empleados con inasistencia ese día, mostrar mensaje
    if (!hayEmpleados) {
        $('#tbody-empleados-festividades').append(`
            <tr>
                <td colspan="3" class="text-center text-muted py-3">
                    <i class="bi bi-check2-circle me-2"></i>
                    ningún empleado tiene inasistencia registrada en este día festivo.
                </td>
            </tr>
        `);
    }

    // re-vincular los eventos de selección por departamento tras renderizar
    seleccionarDepartamentosFestividades();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosFestividades() {

    // al marcar/desmarcar el checkbox del departamento, afectar a todos sus empleados
    $('.check-depto-festividades').off('change').on('change', function () {
        let idDepto = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');
        $(`.check-empleado-festividad[data-departamento="${idDepto}"]`).prop('checked', seleccionado);
    });

}

//===================================================
// BUSCADOR EN TIEMPO REAL
//===================================================

function buscadorEmpleadosFestividades() {

    $('#txtBuscarEmpleadoFestividades').on('keyup', function () {

        // obtener el texto escrito en minúsculas para la comparación
        let texto = $(this).val().toLowerCase().trim();

        $('#tbody-empleados-festividades tr').each(function () {

            // ignorar las filas de encabezado de departamento
            if ($(this).hasClass('table-secondary')) return;

            // leer clave y nombre de la fila
            let clave = $(this).find('td:eq(1)').text().toLowerCase();
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // mostrar u ocultar la fila según la coincidencia
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

function seleccionarTodosEmpleadosFestividades() {

    // al cambiar el checkbox principal, afectar todos los checkboxes visibles
    $('#checkTodosFestividades').change(function () {
        $('.check-empleado-festividad:visible').prop('checked', $(this).prop('checked'));
    });

}

//===================================================
// APLICAR FESTIVIDAD A LOS EMPLEADOS SELECCIONADOS
//===================================================

function aplicarFestividades() {

    $('#btnAplicarFestividades').click(function () {

        // obtener la opción seleccionada del select de festividades
        let optionSeleccionada = $('#selectFestividadModal option:selected');
        let nombreFestividad = optionSeleccionada.val();
        let diaFestivo = optionSeleccionada.data('dia');

        // validar que se haya seleccionado una festividad
        if (!nombreFestividad) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar un día festivo en el Paso 1.');
            return;
        }

        // recolectar los ids de los empleados marcados en la tabla
        let empleadosSeleccionados = [];
        $('.check-empleado-festividad:checked').each(function () {
            empleadosSeleccionados.push($(this).val().toString());
        });

        // validar que al menos un empleado haya sido seleccionado
        if (empleadosSeleccionados.length === 0) {
            mostrarAlerta('warning', 'Advertencia', 'Debes seleccionar al menos un empleado.');
            return;
        }

        // recorrer los departamentos de tipo_horario = 1 para actualizar dias_justificados
        jsonNominaConfianza.departamentos.forEach(function (departamento) {

            if (departamento.tipo_horario != 1) return;
            if (!Array.isArray(departamento.empleados)) return;

            departamento.empleados.forEach(function (empleado) {

                // omitir empleados que no están en la selección
                if (!empleadosSeleccionados.includes(empleado.id_empleado.toString())) return;

                // asegurar que el arreglo exista antes de modificarlo
                if (!Array.isArray(empleado.dias_justificados)) {
                    empleado.dias_justificados = [];
                }

                // buscar si ya existe una justificación para este día
                let indexExistente = empleado.dias_justificados.findIndex(function (d) {
                    return normalizarDia(d.dia) === normalizarDia(diaFestivo);
                });

                if (indexExistente !== -1) {
                    // si el día ya existe, actualizar el tipo con el nombre de la festividad
                    empleado.dias_justificados[indexExistente].tipo = nombreFestividad;
                } else {
                    // si no existe, agregar el nuevo registro de justificación
                    empleado.dias_justificados.push({
                        dia: diaFestivo,
                        tipo: nombreFestividad
                    });
                }

                // poner en 0 el descuento de inasistencia del día festivo
                actualizarInasistenciaFestividad(empleado, diaFestivo);

            });

        });

        // cerrar el modal y notificar al usuario
        $('#modalFestividades').modal('hide');
        mostrarAlerta('success', 'Éxito', 'Se aplicó la festividad correctamente a los empleados seleccionados.');

        // actualizar la tabla de nómina con los nuevos cálculos
        llenarTablaNomina();

    });

}

//===============================================================
// FUNCIÓN PARA PONER EN 0 EL DESCUENTO DE INASISTENCIA
// CUANDO SE APLICA UNA FESTIVIDAD
//===============================================================

function actualizarInasistenciaFestividad(empleado, diaFestivo) {

    // si el empleado no tiene historial de inasistencias, no hay nada que actualizar
    if (
        !Array.isArray(empleado.historial_inasistencias) ||
        empleado.historial_inasistencias.length === 0
    ) {
        return;
    }

    // buscar el día festivo en el historial de inasistencias
    empleado.historial_inasistencias.forEach(function (inasistencia) {

        // ignorar registros sin día asignado
        if (!inasistencia.dia) {
            return;
        }

        // comparar el día ignorando mayúsculas y acentos
        if (
            normalizarDia(inasistencia.dia) ===
            normalizarDia(diaFestivo)
        ) {
            // quitar el descuento ya que el día está justificado por festividad
            inasistencia.descuento_inasistencia = 0;
        }

    });

    // recalcular el total de descuentos por inasistencias del empleado
    calcularDescuentoInasistencias(empleado);

}