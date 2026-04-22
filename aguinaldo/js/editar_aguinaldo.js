$(document).ready(function () {
    guardar_cambios_aguinaldo();
    mostrarContextMenu();
});

/**
 * Abrir el modal de edición y llenar los campos con los datos del empleado seleccionado.
 */
function editarAguinaldo(id) {
    // Buscar el empleado en jsonAguinaldo por su id_empleado
    const empleado = jsonAguinaldo.find(e => e.id_empleado === id);

    // Si no se encuentra el empleado, mostrar un error y salir
    if (!empleado) {
        console.error("Empleado no encontrado:", id);
        alerta("Error", "Empleado no encontrado. Intente recargar la página.", "error");
        return;
    }

    if (empleado.dias_trabajados < 60) {
        alerta("El empleado seleccionado no es elegible para recibir aguinaldo porque ha trabajado menos de 60 días.", "error", "error", true, 8000);
    }

    // Llenar los campos del modal con los datos del empleado
    $("#id_empleado").val(empleado.id_empleado);
    $("#clave_empleado").val(empleado.clave_empleado);
    $("#nombre_empleado").val(`${empleado.nombre || ''} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim());
    $("#nombre_departamento").val(empleado.nombre_departamento);
    $("#fecha_ingreso_real").val(empleado.fecha_ingreso_real);
    $("#fecha_pago").val(empleado.fecha_pago);

    // Si el empleado no tiene NSS, deshabilitar el campo de fecha de ingreso al IMSS
    if (empleado.status_nss === 0) {
        $("#fecha_ingreso_imss").prop("disabled", true);
        $("#check_usar_fecha_imss").prop("disabled", true);
        $("#isr").prop("disabled", true);
        $("#tarjeta").prop("disabled", true);
    } else {
        $("#fecha_ingreso_imss").prop("disabled", false);
        $("#check_usar_fecha_imss").prop("disabled", false);
        $("#isr").prop("disabled", false);
        $("#tarjeta").prop("disabled", false);
    }

    if (empleado.usar_fecha_real === 1) {
        $("#check_usar_fecha_real").prop("checked", true);
    } else {
        $("#check_usar_fecha_imss").prop("checked", true);
    }

    $("#fecha_ingreso_imss").val(empleado.fecha_ingreso_imss);
    $("#dias_trabajados").val(empleado.dias_trabajados);
    $("#salario_diario").val(empleado.salario_diario);

    $('#aguinaldo').val(empleado.aguinaldo === -1 ? '0' : empleado.aguinaldo);
    $('#isr').val(empleado.isr == 0 ? '' : empleado.isr);
    $('#tarjeta').val(empleado.tarjeta == 0 ? '' : empleado.tarjeta);
    $('#neto_pagar').val(empleado.neto_pagar);

    $('#ausencias').val(empleado.total_ausencias == 0 ? '' : empleado.total_ausencias);

    // Calcular los días trabajados a mostrar en el campo temporal
    let tmp_dias_trabajados = 0;

    if (empleado.usar_fecha_real === 1) {
        tmp_dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real);
    } else {
        tmp_dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss);
    }

    // Llenar el campo temporal de días trabajados
    $('#tmp_dias_trabajados').val(empleado.tmp_dias_trabajados || 0);

    // Marcar si se deben usar las ausencias para el cálculo del aguinaldo
    $('#usar_ausencias').prop('checked', empleado.usar_ausencias == 1);

    // Mostrar el modal
    modal_editar.show();
}

// Funciones para mostrar el menú contextual
function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla_aguinaldo tbody').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Posicionar y mostrar menú
        $menu_corte.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu_corte.hide();
    });
}

// Evento para abrir el modal de detalles al hacer click en la opción del menú contextual
$(document).on('click', '#context_menu', function (e) {
    e.preventDefault();
    // Obtener el id del empleado desde la fila seleccionada
    const idEmpleado = filaSeleccionada.data('id');
    // Llamar a la función para editar el aguinaldo del empleado seleccionado
    editarAguinaldo(idEmpleado);
    // Ocultar el menú contextual
    $menu_corte.hide();
});

// =======================================================================================
// FUNCIONES PARA CALCULAR EL AGUINALDO, NETO A PAGAR, DIAS TRABAJADOS Y MESES TRABAJADOS
// =======================================================================================

/**
 * Función para recalcular el aguinaldo, neto a pagar, días trabajados y meses trabajados
 * Sólo cuando se detecta un cambio en las fechas ingreso real o imss
 */
function recalcular_todo_fechas() {
    let dias = 0;
    let fechaReal = $("#fecha_ingreso_real").val();
    let fechaImss = $("#fecha_ingreso_imss").val();

    $('#tmp_dias_trabajados').removeClass('bg-danger-subtle text-danger');

    // Saber si hay que usar la fecha real o la del imss
    let usarFecha = $('input[name="usar_fecha"]:checked').val();

    // 1. Calcular los dias trabajados a partir de la fecha de ingreso
    if (usarFecha == 1) {
        dias = diasTrabajados(fechaReal);
    } else {
        dias = diasTrabajados(fechaImss);
    }

    // 2.1. Actualizar el campo de días trabajados con el nuevo valor calculado
    $("#tmp_dias_trabajados").val(dias);

    // Verificar si se deben restar las ausencias
    let usarAusencias = $('#usar_ausencias').is(':checked');

    if (usarAusencias) {
        // Recuperar el número de ausencias
        let ausencias = parseInt($("#ausencias").val()) || 0;
        if (ausencias <= dias) {
            dias -= ausencias;
        } else {
            dias = 0;
        }
    }

    // 2.2. Actualizar el campo de total días con el nuevo valor calculado
    $('#dias_trabajados').val(dias);

    // 2. Recuperar el salario diario del empleado
    let salarioDiario = parseFloat($("#salario_diario").val()) || 0;

    // 3. Calcular al aguinaldo con los dias trabajados y el salario diario
    let aguinaldo = calcularAguinaldo(parseInt(dias) || 0, salarioDiario);

    // 4. Actualizar el campo de aguinaldo con el nuevo valor calculado
    $('#aguinaldo').val(aguinaldo === -1 ? '0' : aguinaldo);

    // 5. Recuperar el ISR y la tarjeta para calcular el neto a pagar
    let isr = parseFloat($('#isr').val()) || 0;
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // 6. Calcular el neto a pagar tomando en cuenta el nuevo aguinaldo, ISR y tarjeta
    let netoPagar = calcularNetoPagar(aguinaldo, isr, tarjeta);

    // 7. Actualizar el campo de neto a pagar con el nuevo valor calculado
    $('#neto_pagar').val(netoPagar);
}

function recalcular_variables_calculo() {

    $('#tmp_dias_trabajados').removeClass('bg-danger-subtle text-danger');

    // Obtener los valores actuales de días trabajados y salario diario
    let diasTrabajados = parseInt($("#tmp_dias_trabajados").val()) || 0;

    if (diasTrabajados > 365 || diasTrabajados < 0) {
        alerta("Número de dias trabajados invalido", "El número de días trabajados no puede ser mayor a 365 días ni menor a 0.", "error");
        $("#tmp_dias_trabajados").val(365);
        diasTrabajados = 365;
    }

    // Verificar si se deben restar las ausencias
    let usarAusencias = $('#usar_ausencias').is(':checked');

    if (usarAusencias) {
        // Recuperar el número de ausencias
        let ausencias = parseInt($("#ausencias").val()) || 0;

        if (ausencias <= diasTrabajados) {
            diasTrabajados -= ausencias;
        } else {
            diasTrabajados = 0;
        }
    }

    // Mostrar el el total dias trabajados
    $('#dias_trabajados').val(diasTrabajados);

    // Obtener el salario diario
    let salarioDiario = parseFloat($("#salario_diario").val()) || 0;
    // Calcular el nuevo aguinaldo con los valores actualizados
    let aguinaldo = calcularAguinaldo(diasTrabajados, salarioDiario);
    // Actualizar el campo de aguinaldo con el nuevo valor calculado
    $('#aguinaldo').val(aguinaldo === -1 ? '0' : aguinaldo);
    // Recalcular el neto a pagar tomando en cuenta el nuevo aguinaldo, ISR y tarjeta
    let isr = parseFloat($('#isr').val()) || 0;
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;
    let netoPagar = calcularNetoPagar(aguinaldo, isr, tarjeta);
    // Actualizar el campo de neto a pagar con el nuevo valor calculado
    $('#neto_pagar').val(netoPagar);
}

// ================================================================
// EVENTOS PARA HACER LOS CALCULOS
// ================================================================

// Evento para recalcular los días trabajados al cambiar la fecha de ingreso real
$(document).on('change', '#fecha_ingreso_real, #fecha_ingreso_imss', function (e) {
    e.preventDefault();

    recalcular_todo_fechas();
});

// Detecta cambio en la fecha a usar Fecha Real
$(document).on('change', '#check_usar_fecha_real', function () {
    const input = document.getElementById('fecha_ingreso_real');
    if (input.value == "") {
        if (input.showPicker) {
            input.showPicker();
        }
    } else {
        recalcular_todo_fechas();
    }
});

// Detecta cambio en la fecha a usar Fecha IMSS
$(document).on('change', '#check_usar_fecha_imss', function () {
    const input = document.getElementById('fecha_ingreso_imss');
    if (input.value == "") {
        if (input.showPicker) {
            input.showPicker();
        }
    } else {
        recalcular_todo_fechas();
    }
});

// Eventos para recalcular al notar cambios en los campos de días trabajados, salario diario, ISR o tarjeta
$(document).on('input', '#tmp_dias_trabajados, #salario_diario, #ausencias', function (e) {
    e.preventDefault();
    recalcular_variables_calculo();
});

// Evento para detectar si se deben usar las ausencias para el cálculo del aguinaldo
$(document).on('change', '#usar_ausencias', function (e) {
    e.preventDefault();
    recalcular_variables_calculo();
});

// Evento para cuando el usuario ingrese manualmente el aguinaldo
$(document).on('input', '#aguinaldo, #isr, #tarjeta', function (e) {
    e.preventDefault();

    // Calcular el nuevo aguinaldo con los valores actualizados
    let aguinaldo = parseFloat($('#aguinaldo').val()) || 0;
    // Recalcular el neto a pagar tomando en cuenta el nuevo aguinaldo, ISR y tarjeta
    let isr = parseFloat($('#isr').val()) || 0;
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;
    let netoPagar = calcularNetoPagar(aguinaldo, isr, tarjeta);
    // Actualizar el campo de neto a pagar con el nuevo valor calculado
    $('#neto_pagar').val(netoPagar);
});

/**
 * Función para editar los datos de un empleado en el jsonAguinaldo,
 * recalcular su aguinaldo y actualizar la tabla con los nuevos datos.
 * Se ejecuta al enviar el formulario de edición del empleado.
 */
function guardar_cambios_aguinaldo() {
    $("#form_editar_empleado").submit(function (e) {
        e.preventDefault();

        // Recupera los valores del formulario
        const idEmpleado = parseInt($("#id_empleado").val());
        const fechaIngresoReal = $("#fecha_ingreso_real").val() ?? null;
        const fechaIngresoImss = $("#fecha_ingreso_imss").val() ?? null;
        const tmpDiasTrabajados = parseInt($("#tmp_dias_trabajados").val()) || 0;
        const diasTrabajados = parseInt($("#dias_trabajados").val()) || 0;

        const salarioDiario = parseFloat($("#salario_diario").val()) || 0;
        const usarFecha = $('input[name="usar_fecha"]:checked').val();
        const fechaPago = $("#fecha_pago").val() ?? null;
        const aguinaldo = parseFloat($("#aguinaldo").val()) || 0;

        const isr = parseFloat($("#isr").val()) || 0;
        const tarjeta = parseFloat($("#tarjeta").val()) || 0;
        const netoPagar = parseFloat($("#neto_pagar").val()) || 0;

        const usarAusencias = $('#usar_ausencias').is(':checked');
        const ausencias = parseInt($("#ausencias").val()) || 0;

        if (diasTrabajados < 60) {
            // Marcar en rojo indicando que el empleado no tiene derecho a aguinaldo
            $('#tmp_dias_trabajados').addClass('bg-danger-subtle text-danger');
            // Alerta indicando que el empleado no tiene derecho a aguinaldo
            alerta("Dias trabajados insuficientes", "El empleado no tiene derecho a aguinaldo, dias trabajados: " + diasTrabajados + ". Para tener derecho, debe haber trabajado al menos 60 días totales.", "info");
            return;
        }

        // Recupera al empleado mediante el id
        const empleadoIndex = jsonAguinaldo.findIndex(e => e.id_empleado === idEmpleado);
        // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
        if (empleadoIndex === -1) {
            alerta("Error", "No se encontró el empleado para actualizar.", "error");
            return;
        }

        // Actualiza los datos del empleado en el jsonAguinaldo
        jsonAguinaldo[empleadoIndex].fecha_ingreso_real = fechaIngresoReal;
        jsonAguinaldo[empleadoIndex].fecha_ingreso_imss = fechaIngresoImss;
        jsonAguinaldo[empleadoIndex].tmp_dias_trabajados = tmpDiasTrabajados;
        jsonAguinaldo[empleadoIndex].dias_trabajados = diasTrabajados;
        jsonAguinaldo[empleadoIndex].meses_trabajados = mesesTrabajados(diasTrabajados);

        jsonAguinaldo[empleadoIndex].salario_diario = salarioDiario;
        jsonAguinaldo[empleadoIndex].usar_fecha_real = usarFecha == 1 ? 1 : 0;
        jsonAguinaldo[empleadoIndex].fecha_pago = fechaPago;
        jsonAguinaldo[empleadoIndex].aguinaldo = aguinaldo;

        jsonAguinaldo[empleadoIndex].isr = isr;
        jsonAguinaldo[empleadoIndex].tarjeta = tarjeta;
        jsonAguinaldo[empleadoIndex].neto_pagar = netoPagar;

        jsonAguinaldo[empleadoIndex].usar_ausencias = usarAusencias ? 1 : 0;
        jsonAguinaldo[empleadoIndex].total_ausencias = ausencias;

        // Guarda el jsonAguinaldo actualizado en el localStorage
        saveAguinaldo(jsonAguinaldo);

        // Cierra el modal de edición
        modal_editar.hide();

        // Actualiza la tabla con los nuevos datos
        llenar_tabla();

        // Muestra una alerta de éxito
        alerta("Actualizado correctamente.", "Los datos del empleado han sido actualizados correctamente.", "success", true);
    });
}