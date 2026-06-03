$(document).ready(function () {
    mostrarContextMenu();


});

// Funciones para mostrar el menú contextual
function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla_ptu tbody').on('contextmenu', 'tr', function (e) {
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
    abrir_modal_detalles(idEmpleado);
    // Ocultar el menú contextual
    $menu_contexto.hide();
});

/**
 * Función para abrir el modal de detalles del empleado seleccionado
 * @param {Integer} id ID del empleado para mostrar detalles 
 */
function abrir_modal_detalles(id) {

    // 1. RECUPERAR EL JSON
    let json = getUtilidad();

    // 2. BUSCAR EL EMPLEADO
    const empleado = json.empleados.find(e => e.id_empleado == id);

    if (!empleado) {
        console.error("Empleado no encontrado:", id);
        alerta("error", "Empleado no encontrado", "El empleado seleccionado no se encuentra en los datos cargados.");
        return;
    }

    // 3. LLENAR DATOS DE REFERENCIA
    $('#id_empleado').val(empleado.id_empleado);
    $('#clave_empleado').val(empleado.clave_empleado);
    $('#nombre_empleado').val(empleado.nombre + ' ' + empleado.ap_paterno + ' ' + empleado.ap_materno);
    $('#nombre_departamento').val(empleado.nombre_departamento);

    // 4. LLENAR FECHAS Y SELECCIÓN (NUEVO)
    $('#fecha_ingreso_real').val(empleado.fecha_ingreso_real);
    $('#fecha_ingreso_imss').val(empleado.fecha_ingreso_imss);

    $('#dias_trabajados').val(empleado.dias_trabajados || '');


    // Marcar el radio button según el valor booleano o de control
    // Si usar_fecha_real es true (o 1), marcamos "fecha real", sino "fecha imss"
    if (empleado.usar_fecha_real) {
        $('#check_usar_fecha_real').prop('checked', true);
    } else {
        $('#check_usar_fecha_imss').prop('checked', true);
    }

    // Si tiene seguro hacer la fecha imss editable, sino se le agrega un disabled
    if (empleado.status_seguro) {
        // TIENE SEGURO, HACER FECHA IMSS EDITABLE
        $('#fecha_ingreso_imss').prop('disabled', false);
        $('#check_usar_fecha_imss').prop('disabled', false);
    } else {
        // NO TIENE SEGURO, DESHABILITAR FECHA IMSS
        $('#fecha_ingreso_imss').prop('disabled', true);
        $('#check_usar_fecha_imss').prop('disabled', true);
    }

    // 5. LLENAR INPUTS EDITABLES
    $('#salario_diario').val(empleado.salario_diario ? empleado.salario_diario.toFixed(2) : '');
    $('#dias_pago').val(empleado.dias_pago || '');
    $('#dias_ptu').val(empleado.dias_ptu === 0 ? '' : empleado.dias_ptu);

    // 6. LLENAR RESULTADOS (Calculados)
    $('#total_ptu').val(empleado.ptu ? empleado.ptu.toFixed(2) : '');
    $('#tarjeta').val(empleado.tarjeta ? empleado.tarjeta.toFixed(2) : '');
    $('#neto_pagar').val(empleado.neto_pagar ? empleado.neto_pagar.toFixed(2) : '');

    // 7. LÓGICA DE NEGOCIO (Seguro)
    $('#tarjeta').prop('disabled', empleado.status_seguro === 0);

    // 8. ABRIR EL MODAL (Asegúrate de que modalCalculoPTU esté definido o usa bootstrap.Modal)
    // Si tu variable global se llama modalCalculoPTU:
    modalCalculoPTU.show();
}

// CHANGE PARA DETECTAR CUANDO SE CAMBIE DE FECHA
$('#fecha_ingreso_real, #fecha_ingreso_imss').change(function (e) {
    e.preventDefault();

    // RECUPERAR EL AÑO
    let json = getUtilidad();
    let anio = json.anio;

    // RECUPERAR LAS FECHAS
    let fechaReal = $('#fecha_ingreso_real').val();
    let fechaIMSS = $('#fecha_ingreso_imss').val();
    let dias_trabajado = 0;

    let usarFechaReal = $('#check_usar_fecha_real').is(':checked');

    // Si se cambia la fecha real, actualizar la fecha imss con la misma fecha (si se está usando la fecha real)
    if (usarFechaReal) {
        dias_trabajado = diasTrabajados(fechaReal, anio);
    } else {
        // Si se cambia la fecha imss, actualizar la fecha real con la misma fecha (si se está usando la fecha imss)
        dias_trabajado = diasTrabajados(fechaIMSS, anio);
    }

    // ACTUALIZAR EL CAMPO DE DÍAS TRABAJADOS
    $('#dias_trabajados').val(dias_trabajado);

    // ACTUALIZAR EL CÁLCULO DE PTU
    let dias_pago = parseFloat($('#dias_pago').val()) || 0;
    let dias_ptu = diasPTU(dias_trabajado, dias_pago);
    $('#dias_ptu').val(dias_ptu);

    // RECUPERAR EL SALARIO DIARIO
    let salario_diario = parseFloat($('#salario_diario').val()) || 0;

    // CALCULAR EL TOTAL DE PTU
    let total_ptu = calcular_ptu(salario_diario, dias_ptu);
    $('#total_ptu').val(total_ptu.toFixed(2));

    // RECUPERAR TARJETA
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));

});

// EVENTO INPUT PARA DÍAS TRABAJADOS MANUAL CON VALIDACIÓN
$('#dias_trabajados').on('input', function () {
    let dias_trabajado = parseFloat($(this).val()) || 0;

    // VALIDACIÓN: no negativos ni mayores a 365
    if (dias_trabajado < 0) {
        dias_trabajado = 0;
        $(this).val(dias_trabajado);
    } else if (dias_trabajado > 365) {
        dias_trabajado = 365;
        $(this).val(dias_trabajado);
    }

    // ACTUALIZAR EL CÁLCULO DE PTU
    let dias_pago = parseFloat($('#dias_pago').val()) || 0;
    let dias_ptu = diasPTU(dias_trabajado, dias_pago);
    $('#dias_ptu').val(dias_ptu);

    // RECUPERAR EL SALARIO DIARIO
    let salario_diario = parseFloat($('#salario_diario').val()) || 0;

    // CALCULAR EL TOTAL DE PTU
    let total_ptu = calcular_ptu(salario_diario, dias_ptu);
    $('#total_ptu').val(total_ptu.toFixed(2));

    // RECUPERAR TARJETA
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));
});

// EVENTO INPUT PARA DÍAS DE PAGO
$('#dias_pago').on('input', function () {
    // RECUPERAR LOS DÍAS DE PAGO INGRESADOS
    let dias_pago = parseFloat($(this).val()) || 0;

    // VALIDACIÓN: no negativos ni mayores a 365
    if (dias_pago < 0) {
        dias_pago = 0;
        $(this).val(dias_pago);
    } else if (dias_pago > 365) {
        dias_pago = 365;
        $(this).val(dias_pago);
    }

    // RECUPERAR LOS DÍAS TRABAJADOS (ya ingresados o calculados)
    let dias_trabajado = parseFloat($('#dias_trabajados').val()) || 0;

    // CALCULAR DÍAS DE PTU
    let dias_ptu = diasPTU(dias_trabajado, dias_pago);
    $('#dias_ptu').val(dias_ptu);

    // RECUPERAR EL SALARIO DIARIO
    let salario_diario = parseFloat($('#salario_diario').val()) || 0;

    // CALCULAR EL TOTAL DE PTU
    let total_ptu = calcular_ptu(salario_diario, dias_ptu);
    $('#total_ptu').val(total_ptu.toFixed(2));

    // RECUPERAR TARJETA
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));
});

// EVENTO INPUT PARA DÍAS DE PTU
$('#dias_ptu').on('input', function () {
    // RECUPERAR LOS DÍAS DE PTU INGRESADOS
    let dias_ptu = parseFloat($(this).val()) || 0;

    // RECUPERAR LOS DÍAS DE PAGO COMO LÍMITE
    let dias_pago = parseFloat($('#dias_pago').val()) || 0;

    // VALIDACIÓN: no negativos ni mayores a dias_pago
    if (dias_ptu < 0) {
        dias_ptu = 0;
        $(this).val(dias_ptu);
    } else if (dias_ptu > dias_pago) {
        dias_ptu = dias_pago;
        $(this).val(dias_ptu);
    }

    // RECUPERAR EL SALARIO DIARIO
    let salario_diario = parseFloat($('#salario_diario').val()) || 0;

    // CALCULAR EL TOTAL DE PTU
    let total_ptu = calcular_ptu(salario_diario, dias_ptu);
    $('#total_ptu').val(total_ptu.toFixed(2));

    // RECUPERAR TARJETA
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));
});

// EVENTO INPUT PARA SALARIO DIARIO
$('#salario_diario').on('input', function () {
    // RECUPERAR EL SALARIO DIARIO INGRESADO
    let salario_diario = parseFloat($(this).val()) || 0;

    // VALIDACIÓN: no permitir negativos
    if (salario_diario < 0) {
        salario_diario = 0;
        $(this).val(salario_diario);
    }

    // RECUPERAR LOS DÍAS DE PTU
    let dias_ptu = parseFloat($('#dias_ptu').val()) || 0;

    // CALCULAR EL TOTAL DE PTU
    let total_ptu = calcular_ptu(salario_diario, dias_ptu);
    $('#total_ptu').val(total_ptu.toFixed(2));

    // RECUPERAR TARJETA
    let tarjeta = parseFloat($('#tarjeta').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));
});

// EVENTO INPUT PARA TARJETA
$('#tarjeta').on('input', function () {
    // RECUPERAR EL VALOR DE LA TARJETA
    let tarjeta = parseFloat($(this).val()) || 0;

    // VALIDACIÓN: no permitir negativos
    if (tarjeta < 0) {
        tarjeta = 0;
        $(this).val(tarjeta);
    }

    // RECUPERAR EL TOTAL DE PTU (campo calculado, no editable)
    let total_ptu = parseFloat($('#total_ptu').val()) || 0;

    // CALCULAR NETO A PAGAR
    let neto_pagar = calcular_neto_pagar(total_ptu, tarjeta);
    $('#neto_pagar').val(neto_pagar.toFixed(2));
});

// CHANGE PARA DETECTAR CUANDO SE CAMBIE EL RADIO
$('input[name="usar_fecha"]').change(function () {
    if ($('#check_usar_fecha_real').is(':checked')) {
        // Disparar el evento change de la fecha real
        $('#fecha_ingreso_real').trigger('change');
    } else if ($('#check_usar_fecha_imss').is(':checked')) {
        // Disparar el evento change de la fecha imss
        $('#fecha_ingreso_imss').trigger('change');
    }
});


/**
 * ===============================================================
 * EVENTOS PARA RESETEAR CAMPOS DE CÁLCULO
 * ===============================================================
 */

// RESETEAR Días Pago (Base)
$('#btn_resetear_dias_pago').click(function (e) {
    e.preventDefault();

    // RECUPERAR EL JSON
    let json = getUtilidad();
    // RECUPERAR EL ID DEL EMPLEADO
    let idEmpleado = $('#id_empleado').val();
    // OBTENER INDEX DEL EMPLEADO
    let indexEmpleado = json.empleados.findIndex(e => e.id_empleado == idEmpleado);

    if (indexEmpleado !== -1) {
        // OBTENER EL VALOR ORIGINAL DE DÍAS DE PAGO
        let dias_pago_copia = json.empleados[indexEmpleado].dias_pago_copia || 0;
        // ACTUALIZAR EL CAMPO DE DÍAS DE PAGO
        $('#dias_pago').val(dias_pago_copia);
        // DISPARAR EL EVENTO INPUT PARA RECALCULAR TODO
        $('#dias_pago').trigger('input');
    }
});

// RESETEAR Días PTU (Calculado desde inputs)
$('#btn_resetear_dias_ptu').click(function (e) {
    e.preventDefault();

    // RECUPERAR LOS VALORES ACTUALES DE LOS INPUTS
    let dias_trabajados = parseFloat($('#dias_trabajados').val()) || 0;
    let dias_pago = parseFloat($('#dias_pago').val()) || 0;

    // RECALCULAR LOS DÍAS DE PTU PROPORCIONAL
    let dias_ptu = diasPTU(dias_trabajados, dias_pago);

    // ACTUALIZAR EL CAMPO DE DÍAS DE PTU
    $('#dias_ptu').val(dias_ptu);

    // DISPARAR EL EVENTO INPUT PARA RECALCULAR TOTAL PTU Y NETO
    $('#dias_ptu').trigger('input');
});

// RESETEAR Salario Diario
$('#btn_resetear_salario').click(function (e) {
    e.preventDefault();

    // RECUPERAR EL JSON
    let json = getUtilidad();
    // RECUPERAR EL ID DEL EMPLEADO
    let idEmpleado = $('#id_empleado').val();
    // OBTENER INDEX DEL EMPLEADO
    let indexEmpleado = json.empleados.findIndex(e => e.id_empleado == idEmpleado);

    if (indexEmpleado !== -1) {
        // OBTENER EL VALOR ORIGINAL DE SALARIO DIARIO
        let salario_diario_copia = parseFloat(json.empleados[indexEmpleado].salario_diario_copia) || 0;

        // ACTUALIZAR EL CAMPO DE SALARIO DIARIO
        $('#salario_diario').val(salario_diario_copia);

        // DISPARAR EL EVENTO INPUT PARA RECALCULAR TOTAL PTU Y NETO
        $('#salario_diario').trigger('input');
    }
});

// RESETEAR Tarjeta
$('#btn_resetear_tarjeta').click(function (e) {
    e.preventDefault();

    // RECUPERAR EL JSON
    let json = getUtilidad();
    // RECUPERAR EL ID DEL EMPLEADO
    let idEmpleado = $('#id_empleado').val();
    // OBTENER INDEX DEL EMPLEADO
    let indexEmpleado = json.empleados.findIndex(e => e.id_empleado == idEmpleado);

    if (indexEmpleado !== -1) {
        // OBTENER EL VALOR ORIGINAL DE TARJETA
        let tarjeta_copia = parseFloat(json.empleados[indexEmpleado].tarjeta_copia) || 0;

        // ACTUALIZAR EL CAMPO DE TARJETA
        $('#tarjeta').val(tarjeta_copia == 0 ? '' : tarjeta_copia.toFixed(2));

        // DISPARAR EL EVENTO INPUT PARA RECALCULAR NETO A PAGAR
        $('#tarjeta').trigger('input');
    }
});


/**
 * ===============================================================
 * EVENTOS PARA GUARDAR LOS CAMBIOS
 * ===============================================================
 */

// SUBMIT DEL FORMULARIO EDITAR EMPLEADO
$('#form_editar_empleado').submit(function (e) {
    e.preventDefault();

    // RECUPERAR EL JSON
    let json = getUtilidad();
    // RECUPERAR EL ID DEL EMPLEADO
    let idEmpleado = $('#id_empleado').val();
    // OBTENER INDEX DEL EMPLEADO
    let indexEmpleado = json.empleados.findIndex(e => e.id_empleado == idEmpleado);

    if (indexEmpleado !== -1) {

        // ACTUALIZAR CAMPOS DESDE LOS INPUTS
        json.empleados[indexEmpleado].salario_diario = parseFloat($('#salario_diario').val()) || 0;
        json.empleados[indexEmpleado].dias_pago = parseFloat($('#dias_pago').val()) || 0;
        json.empleados[indexEmpleado].dias_ptu = parseFloat($('#dias_ptu').val()) || 0;
        json.empleados[indexEmpleado].ptu = parseFloat($('#total_ptu').val()) || 0;
        json.empleados[indexEmpleado].tarjeta = parseFloat($('#tarjeta').val()) || 0;
        json.empleados[indexEmpleado].neto_pagar = parseFloat($('#neto_pagar').val()) || 0;
        json.empleados[indexEmpleado].dias_trabajados = parseFloat($('#dias_trabajados').val()) || 0;

        // FECHAS: depende del radio seleccionado
        let usarFechaReal = $('#check_usar_fecha_real').is(':checked');
        json.empleados[indexEmpleado].usar_fecha_real = usarFechaReal;

        if (usarFechaReal) {
            json.empleados[indexEmpleado].fecha_ingreso_real = $('#fecha_ingreso_real').val() || null;
        } else {
            // Solo actualizar fecha IMSS si el empleado tiene seguro
            if (json.empleados[indexEmpleado].status_seguro == 1) {
                json.empleados[indexEmpleado].fecha_ingreso_imss = $('#fecha_ingreso_imss').val() || null;
            }
        }

        // CALCULAR REDONDEO
        json.empleados[indexEmpleado].redondeo = diferenciaRedondeo(json.empleados[indexEmpleado].neto_pagar);

        // CALCULAR NETO A PAGAR REDONDEO
        json.empleados[indexEmpleado].neto_pagar_redondeado = calcular_neto_pagar_redondeo(json.empleados[indexEmpleado].neto_pagar, json.empleados[indexEmpleado].redondeo);
    }

    // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
    setUtilidad(json);

    // Se llena la tabla con los datos obtenidos del storage
    llenar_tabla_ptu();

    // Cerrar el modal
    modalCalculoPTU.hide();

    // MOSTRAR ALERTA DE ÉXITO
    alerta("success", "Cambios guardados", "Los cambios realizados al empleado han sido guardados correctamente.");
});
