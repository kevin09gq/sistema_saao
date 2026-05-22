$(document).ready(function () {
    mostrarContextMenu();
    guardar_cambios_aguinaldo();
});

// Funciones para mostrar el menú contextual
function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla_aguinaldo tbody').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Posicionar y mostrar menú
        $menu_contexto.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu_contexto.hide();
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
    $menu_contexto.hide();
});

/**
 * Abrir el modal de edición y llenar los campos con los datos del empleado seleccionado.
 */
function editarAguinaldo(id) {
    // Buscar el empleado en jsonAguinaldo por su id_empleado
    const empleado = jsonAguinaldo.empleados.find(e => e.id_empleado === id);

    // Si no se encuentra el empleado, mostrar un error y salir
    if (!empleado) {
        console.error("Empleado no encontrado:", id);
        alerta("error", "Empleado no encontrado", "El empleado seleccionado no se encuentra en los datos cargados. Contacta a sistemas.");
        return;
    }

    if (empleado.dias_trabajados < 60) {
        alerta("info", "Este empleado tiene menos de 60 dias trabajados por lo cual no tiene derecho a Aguinaldo", "error", true, 8000);
    }

    // Llenar los campos del modal con los datos del empleado
    $("#id_empleado").val(empleado.id_empleado);
    $("#clave_empleado").val(empleado.clave_empleado);
    $("#nombre_empleado").val(`${empleado.nombre || ''} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim());
    $("#nombre_departamento").val(empleado.nombre_departamento);
    $("#fecha_alta_empresa").val(empleado.fecha_alta_empresa);
    $("#fecha_pago").val(empleado.fecha_pago);

    // Dias de aguinaldo
    $("#dias_aguinaldo").val(empleado.dias_pago);
    
    // Si el empleado no tiene NSS, deshabilitar el campo de fecha de ingreso al IMSS
    if (empleado.status_nss === 0) {
        $("#fecha_alta_imss").prop("disabled", true);
        $("#check_usar_fecha_imss").prop("disabled", true);
        $("#isr").prop("disabled", true);
        $("#tarjeta").prop("disabled", true);
    } else {
        $("#fecha_alta_imss").prop("disabled", false);
        $("#check_usar_fecha_imss").prop("disabled", false);
        $("#isr").prop("disabled", false);
        $("#tarjeta").prop("disabled", false);
    }

    if (empleado.usar_fecha_real === 1) {
        $("#check_usar_fecha_real").prop("checked", true);
    } else {
        $("#check_usar_fecha_imss").prop("checked", true);
    }

    $("#fecha_alta_imss").val(empleado.fecha_alta_imss);
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
        tmp_dias_trabajados = diasTrabajados(empleado.fecha_alta_empresa);
    } else {
        tmp_dias_trabajados = diasTrabajados(empleado.fecha_alta_imss);
    }

    // Llenar el campo temporal de días trabajados
    $('#tmp_dias_trabajados').val(empleado.dias_trabajados_tmp || 0);

    // Marcar si se deben usar las ausencias para el cálculo del aguinaldo
    $('#usar_ausencias').prop('checked', empleado.usar_ausencias == 1);

    // Mostrar el modal
    modal_editar.show();
}

// =======================================================================================
// FUNCIONES PARA CALCULAR EL AGUINALDO, NETO A PAGAR, DIAS TRABAJADOS Y MESES TRABAJADOS
// =======================================================================================

/**
 * Función para recalcular el aguinaldo, neto a pagar, días trabajados y meses trabajados
 * Sólo cuando se detecta un cambio en las fechas ingreso real o imss
 */
function recalcular_todo_fechas() {
    let dias = 0;
    let fechaReal = $("#fecha_alta_empresa").val();
    let fechaImss = $("#fecha_alta_imss").val();

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

    // 2.1. Recuperar los dias que se darán de aguinaldo
    let dias_pago = parseInt($("#dias_aguinaldo").val()) || 0;

    // 3. Calcular al aguinaldo con los dias trabajados y el salario diario
    let aguinaldo = calcularAguinaldo(parseInt(dias), salarioDiario, dias_pago);

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

/**
 * Función para recalcular el aguinaldo, neto a pagar, días trabajados y meses trabajados
 * Sólo cuando se detecta un cambio en los campos de días trabajados, salario diario, ISR o tarjeta
 * También se llama a esta función cuando se activa o desactiva la opción de usar las ausencias para el cálculo del aguinaldo
 */
function recalcular_variables_calculo() {

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
    // Obtener los dias de pago del aguinaldo
    let dias_pago = parseInt($("#dias_aguinaldo").val()) || 0;
    // Calcular el nuevo aguinaldo con los valores actualizados
    let aguinaldo = calcularAguinaldo(diasTrabajados, salarioDiario, dias_pago);
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
$(document).on('change', '#fecha_alta_empresa, #fecha_alta_imss', function (e) {
    e.preventDefault();

    recalcular_todo_fechas();
});

// Detecta cambio en la fecha a usar Fecha Real
$(document).on('change', '#check_usar_fecha_real', function () {
    const input = document.getElementById('fecha_alta_empresa');
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
    const input = document.getElementById('fecha_alta_imss');
    if (input.value == "") {
        if (input.showPicker) {
            input.showPicker();
        }
    } else {
        recalcular_todo_fechas();
    }
});

// Eventos para recalcular al notar cambios en los campos de días trabajados, salario diario, ISR o tarjeta
$(document).on('input', '#tmp_dias_trabajados, #salario_diario, #ausencias, #dias_aguinaldo', function (e) {
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
 * ==========================================================================
 * EVENTOS PARA LOS BOTONES DE RESETEAR ISR Y TARJETA
* ===========================================================================
 */


// EVENTO PARA RESETEAR EL ISR
$(document).on('click', '#btn_resetear_isr', function (e) {
    e.preventDefault();

    // Obtener el id del empleado desde el campo oculto
    let id_empleado = parseInt($("#id_empleado").val());
    // Obtener el empleado del jsonAguinaldo usando el id_empleado
    let json = getAguinaldo();
    // Filtrar el empleado correspondiente al id_empleado
    let empleado = json.empleados.find(e => e.id_empleado === id_empleado);

    // Recuperar la copia original de ISR del empleado
    let isrOriginal = empleado.isr_cp || 0;

    // Actualizar el campo de IST con el valor original
    $('#isr').val(isrOriginal);

    // Recuperar el aguinaldo
    let aguinaldo = parseFloat($('#aguinaldo').val()) || 0;
    // Recuperar el valor de tarjeta
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;
    // Calcular el nuevo neto a pagar tomando en cuenta el nuevo ISR, aguinaldo y tarjeta
    let netoPagar = calcularNetoPagar(aguinaldo, isrOriginal, tarjeta);
    // Actualizar el campo de neto a pagar con el nuevo valor calculado
    $('#neto_pagar').val(netoPagar);
});

// EVENTO PARA RESETEAR EL ISR
$(document).on('click', '#btn_resetear_tarjeta', function (e) {
    e.preventDefault();

    // Obtener el id del empleado desde el campo oculto
    let id_empleado = parseInt($("#id_empleado").val());
    // Obtener el empleado del jsonAguinaldo usando el id_empleado
    let json = getAguinaldo();
    // Filtrar el empleado correspondiente al id_empleado
    let empleado = json.empleados.find(e => e.id_empleado === id_empleado);

    // Recuperar la copia original de ISR del empleado
    let tarjetaOriginal = empleado.tarjeta_cp || 0;

    // Actualizar el campo de IST con el valor original
    $('#tarjeta').val(tarjetaOriginal);

    // Recuperar el aguinaldo
    let aguinaldo = parseFloat($('#aguinaldo').val()) || 0;
    // Recuperar el valor de tarjeta
    let isr = parseFloat($('#isr').val()) || 0;
    // Calcular el nuevo neto a pagar tomando en cuenta el nuevo ISR, aguinaldo y tarjeta
    let netoPagar = calcularNetoPagar(aguinaldo, isr, tarjetaOriginal);
    // Actualizar el campo de neto a pagar con el nuevo valor calculado
    $('#neto_pagar').val(netoPagar);
});


/**
 * ==========================================================================================================
 * GUARDAR LOS CAMBIOS DEL EMPLEADO EDITADO EN EL JSON DE AGUINALDO, CERRAR EL MODAL Y ACTUALIZAR LA TABLA
 * ==========================================================================================================
 */

/**
 * Función para editar los datos de un empleado en el jsonAguinaldo,
 * recalcular su aguinaldo y actualizar la tabla con los nuevos datos.
 * Se ejecuta al enviar el formulario de edición del empleado.
 */
function guardar_cambios_aguinaldo() {
    $("#form_editar_empleado").submit(function (e) {
        e.preventDefault();

        // RECUPERAR LOS DIAS TRABAJADOS
        let diasTrabajados = parseInt($("#dias_trabajados").val()) || 0;

        if (diasTrabajados < 60) {
            Swal.fire({
                title: "Días trabajados menor a 60",
                text: "El empleado no tiene derecho a aguinaldo. ¿Deseas guardar los cambios de todas formas?",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#12772d",
                cancelButtonColor: "rgb(37, 23, 53)",
                confirmButtonText: "Sí, guardar cambios",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    guardar_edicion();
                }
            });
        } else {
            guardar_edicion();
        }

    });
}

/**
 * Aplicar los cambios para un empleado
 */
function guardar_edicion() {
    // RECUPERAR LOS VALORES DEL FORMULARIO
    const idEmpleado = parseInt($("#id_empleado").val());
    const fechaIngresoReal = $("#fecha_alta_empresa").val() ?? null;
    const fechaIngresoImss = $("#fecha_alta_imss").val() ?? null;
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
    const dias_pago = parseInt($("#dias_aguinaldo").val()) || 0;

    // Recupera los valores del jsonAguinaldo
    let json = getAguinaldo();

    // Recupera al empleado mediante el id
    const empleadoIndex = json.empleados.findIndex(e => e.id_empleado === idEmpleado);
    // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
    if (empleadoIndex === -1) {
        alerta("Error", "No se encontró el empleado para actualizar.", "error");
        return;
    }

    // Actualiza los datos del empleado en el jsonAguinaldo
    json.empleados[empleadoIndex].fecha_alta_empresa = fechaIngresoReal;
    json.empleados[empleadoIndex].fecha_alta_imss = fechaIngresoImss;
    json.empleados[empleadoIndex].dias_trabajados_tmp = tmpDiasTrabajados;
    json.empleados[empleadoIndex].dias_trabajados = diasTrabajados;
    json.empleados[empleadoIndex].meses_trabajados = mesesTrabajados(diasTrabajados);

    json.empleados[empleadoIndex].salario_diario = salarioDiario;
    json.empleados[empleadoIndex].usar_fecha_real = usarFecha == 1 ? 1 : 0;
    json.empleados[empleadoIndex].fecha_pago = fechaPago;
    json.empleados[empleadoIndex].aguinaldo = aguinaldo;

    json.empleados[empleadoIndex].isr = isr;
    json.empleados[empleadoIndex].tarjeta = tarjeta;
    json.empleados[empleadoIndex].neto_pagar = netoPagar;
    json.empleados[empleadoIndex].dias_pago = dias_pago;

    json.empleados[empleadoIndex].usar_ausencias = usarAusencias ? 1 : 0;
    json.empleados[empleadoIndex].total_ausencias = ausencias;

    // SI LOS DIAS TRABAJADOS ES 60 O MÁS TIENE DERECHO AL AGUINALDO
    json.empleados[empleadoIndex].derecho_aguinaldo = diasTrabajados >= 60;
    // SI LOS DIAS TRABAJADOS ES 60 O MÁS ENTONCES SERÁ VISIBLE EN LA TABLA DE AGUINALDO
    json.empleados[empleadoIndex].visible = diasTrabajados >= 60;
    // CALCULAR EL REDONDEO
    json.empleados[empleadoIndex].redondeo = json.empleados[empleadoIndex].aplicar_redondeo ? diferenciaRedondeo(netoPagar) : 0;
    // CALCULAR EL NETO A PAGAR CON REDONDEO
    json.empleados[empleadoIndex].neto_pagar_redondeado = calcularNetoPagarRedondeado(netoPagar, json.empleados[empleadoIndex].redondeo);

    // Guarda el json actualizado en el localStorage
    setAguinaldo(json);

    // Cierra el modal de edición
    modal_editar.hide();

    // Actualiza la tabla con los nuevos datos
    llenar_tabla_aguinaldo();

    // Muestra una alerta de éxito
    alerta("success", "Empleado actualizado", "Los cambios en el aguinaldo del empleado se han guardado correctamente.");
}