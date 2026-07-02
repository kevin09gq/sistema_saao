//==============================
// CALCULA LA PRIMA VACACIONAL EN TIEMPO REAL
//==============================
function inicializarEventosCalculo() {
    // Escuchar cambios en diasVacaciones para actualizar el séptimo día
    $('#diasVacaciones').on('input change', function () {
        let dias = parseFloat($(this).val()) || 0;
        let septimo = (dias / 6).toFixed(2);
        $('#septimoDia').val(septimo);
        calcularPrima();
    });

    // Escuchar cambios en los demás campos para recalcular
    $('#salarioDiario, #porcentajePrima, #septimoDia, #festivos, #incluirSeptimoDia, #incluirFestivos').on('input change', function () {
        calcularPrima();
    });

    // Escuchar cambios en las deducciones para recalcular el total
    $('#dispersionTarjeta, #isr, #imss, #infonavit').on('input change', function () {
        calcularPrima();
    });

    // Toggle Disfrutados
    $('#chkDisfrutados').on('change', function () {
        let $input = $('#diasDisfrutados');
        if ($(this).is(':checked')) {
            $input.prop('disabled', false).css({ 'background-color': '', 'opacity': '1' });
        } else {
            $input.val('').prop('disabled', true).css({ 'background-color': '#f1f3f5', 'opacity': '0.6' });
        }
    });

    // Toggle Pagadas
    $('#chkPagadas').on('change', function () {
        let $input = $('#diasPagadas');
        if ($(this).is(':checked')) {
            $input.prop('disabled', false).css({ 'background-color': '', 'opacity': '1' });
        } else {
            $input.val('').prop('disabled', true).css({ 'background-color': '#f1f3f5', 'opacity': '0.6' });
        }
    });

    // El botón Limpiar manual también resetea el estado de los checkboxes/inputs
    $('#btn_limpiar').on('click', function () {
        setTimeout(() => { limpiarFormulario(); }, 0);
    });
}

//==============================
// CALCULA LA PRIMA VACACIONAL Y ACTUALIZA LOS CAMPOS DE DESGLOSE Y RESUMEN
//==============================
function calcularPrima() {
    let diasVacaciones = parseFloat($('#diasVacaciones').val()) || 0;
    let septimoDia = parseFloat($('#septimoDia').val()) || 0;
    let festivos = parseFloat($('#festivos').val()) || 0;
    let salarioDiario = parseFloat($('#salarioDiario').val()) || 0;
    let porcentajePrima = parseFloat($('#porcentajePrima').val()) || 25;

    let incluirSeptimo = $('#incluirSeptimoDia').is(':checked');
    let incluirFest = $('#incluirFestivos').is(':checked');

    // Deducciones
    let deducTarjeta = parseFloat($('#dispersionTarjeta').val()) || 0;
    let deducIsr = parseFloat($('#isr').val()) || 0;
    let deducImss = parseFloat($('#imss').val()) || 0;
    let deducInfonavit = parseFloat($('#infonavit').val()) || 0;

    // 1. Sueldo por vacaciones = Días Vacaciones * Salario Diario
    let sueldoVacaciones = diasVacaciones * salarioDiario;
    $('#sueldoVacaciones').val('$' + sueldoVacaciones.toFixed(2));

    // 2. Prima Vacacional = Sueldo por vacaciones * (Porcentaje Prima / 100)
    let montoPrima = sueldoVacaciones * (porcentajePrima / 100);

    // 3. Séptimo Día = septimoDia * Salario Diario
    let montoSeptimo = septimoDia * salarioDiario;

    // 4. Festivos = festivos * Salario Diario
    let montoFestivos = festivos * salarioDiario;

    // Actualizar los elementos de desglose/resumen
    $('#resumenVacaciones').text('$' + sueldoVacaciones.toFixed(2));
    $('#resumenPrima').text('$' + montoPrima.toFixed(2));
    $('#resumenSeptimoDia').text('$' + montoSeptimo.toFixed(2));
    $('#resumenFestivos').text('$' + montoFestivos.toFixed(2));

    // Calcular el subtotal de percepciones
    let subtotal = sueldoVacaciones + montoPrima;

    if (incluirSeptimo) {
        $('#filaSemptimoDia').show();
        subtotal += montoSeptimo;
    } else {
        $('#filaSemptimoDia').hide();
    }

    if (incluirFest) {
        $('#filaFestivos').show();
        subtotal += montoFestivos;
    } else {
        $('#filaFestivos').hide();
    }

    // Actualizar deducciones individuales en el resumen
    $('#resumenDeducTarjeta').text('$' + deducTarjeta.toFixed(2));
    $('#resumenDeducIsr').text('$' + deducIsr.toFixed(2));
    $('#resumenDeducImss').text('$' + deducImss.toFixed(2));
    $('#resumenDeducInfonavit').text('$' + deducInfonavit.toFixed(2));

    // Mostrar/ocultar filas individuales si tienen valor
    $('#filaDeducTarjeta').toggle(deducTarjeta > 0);
    $('#filaDeducIsr').toggle(deducIsr > 0);
    $('#filaDeducImss').toggle(deducImss > 0);
    $('#filaDeducInfonavit').toggle(deducInfonavit > 0);

    let totalDeducciones = deducTarjeta + deducIsr + deducImss + deducInfonavit;

    // Mostrar/ocultar separadores según si hay alguna deducción
    if (totalDeducciones > 0) {
        $('#separadorDeducciones').show();
        $('#separadorTotal').show();
    } else {
        $('#separadorDeducciones').hide();
        $('#separadorTotal').hide();
    }

    // Restar deducciones al total
    let total = subtotal - totalDeducciones;

    // Actualizar el total y los días totales en la pantalla
    $('#resumenTotal').text('$' + total.toFixed(2));

    // Modificación: Días Totales a Calcular ahora no suma séptimo día ni festivos
    let diasTotales = diasVacaciones;
    $('#diasTotalesCalculo').text(diasTotales.toFixed(3));
}

function guardarPrima() {
    // 1. Recoger valores del formulario
    let idEmpleado = $('#idEmpleado').val();
    let idKardex = $('#idKardexSeleccionado').val();
    let numeroSemana = $('#numeroSemana').val();
    let anio = $('#anio').val();
    let fechaPago = $('#fechaPago').val();
    let fechaInicio = $('#fechaInicio').val();
    let fechaFin = $('#fechaFin').val();

    let diasVacaciones = $('#diasVacaciones').val() || 0;
    let incluirSeptimo = $('#incluirSeptimoDia').is(':checked');
    let incluirFest = $('#incluirFestivos').is(':checked');
    let septimoDia = $('#septimoDia').val() || 0;
    let festivos = $('#festivos').val() || 0;

    let salarioDiario = $('#salarioDiario').val() || 0;
    let porcentajePrima = $('#porcentajePrima').val() || 0;
    let dispersion = $('#dispersionTarjeta').val() || 0;
    let isr = $('#isr').val() || 0;
    let imss = $('#imss').val() || 0;
    let infonavit = $('#infonavit').val() || 0;

    // Días disfrutados / pagadas
    let tieneDisfrutados = $('#chkDisfrutados').is(':checked');
    let tienePagadas = $('#chkPagadas').is(':checked');
    let diasDisfrutados = tieneDisfrutados ? ($('#diasDisfrutados').val() || 0) : 0;
    let diasPagadas = tienePagadas ? ($('#diasPagadas').val() || 0) : 0;

    let observaciones = $('#observaciones').val() || '';

    // 2. Calcular montos para el registro
    let sueldoVacaciones = (parseFloat(diasVacaciones) || 0) * (parseFloat(salarioDiario) || 0);
    let montoPrima = sueldoVacaciones * ((parseFloat(porcentajePrima) || 0) / 100);
    let montoSeptimo = incluirSeptimo ? ((parseFloat(septimoDia) || 0) * (parseFloat(salarioDiario) || 0)) : 0;
    let montoFestivos = incluirFest ? ((parseFloat(festivos) || 0) * (parseFloat(salarioDiario) || 0)) : 0;
    let totalDeducciones = (parseFloat(dispersion) || 0) + (parseFloat(isr) || 0) + (parseFloat(imss) || 0) + (parseFloat(infonavit) || 0);
    let totalPagado = sueldoVacaciones + montoPrima + montoSeptimo + montoFestivos - totalDeducciones;

    // 3. Validaciones simples
    if (!idEmpleado) { Swal.fire('Error', 'No se identificó al empleado.', 'error'); return; }
    if (!idKardex) { Swal.fire('Atención', 'Selecciona un movimiento de vacaciones.', 'warning'); return; }
    if (!numeroSemana) { Swal.fire('Atención', 'Ingresa el número de semana.', 'warning'); return; }
    if (!fechaPago || !fechaInicio || !fechaFin) { Swal.fire('Atención', 'Las fechas son obligatorias.', 'warning'); return; }
    if (parseFloat(salarioDiario) <= 0) { Swal.fire('Atención', 'Ingresa el salario diario.', 'warning'); return; }

    // 4. Confirmar antes de guardar
    Swal.fire({
        title: '¿Guardar Pago de Vacaciones?',
        text: 'Total a pagar: $' + totalPagado.toFixed(2),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745'
    }).then((result) => {
        if (!result.isConfirmed) return;

        // 5. Enviar al servidor con $.ajax
        $.ajax({
            url: '../php/primaVacacional.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'guardarPrimaVacacional',
                id_empleado: idEmpleado,
                id_kardex: idKardex,
                numero_semana: numeroSemana,
                anio: anio,
                fecha_pago: fechaPago,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                dias_vacaciones: diasVacaciones,
                septimo_dia: septimoDia,
                festivos: festivos,
                incluir_septimo_dia: incluirSeptimo ? 1 : 0,
                incluir_festivos: incluirFest ? 1 : 0,
                salario_diario: salarioDiario,
                porcentaje_prima: porcentajePrima,
                monto_prima_vacacional: montoPrima.toFixed(2),
                dispersion_tarjeta: dispersion,
                isr: isr,
                imss: imss,
                infonavit: infonavit,
                total_pagado: totalPagado.toFixed(2),
                dias_disfrutados: diasDisfrutados,
                dias_pagadas: diasPagadas,
                observaciones: observaciones
            },
            success: function (resp) {
                if (resp.success) {
                    Swal.fire('¡Guardado!', resp.message, 'success');
                    limpiarFormulario();
                } else {
                    Swal.fire('Error', resp.message, 'error');
                }
            },
            error: function (xhr) {
                console.log('Error del servidor:', xhr.responseText);
                Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
            }
        });
    });
}

//==============================
// LIMPIA EL FORMULARIO DESPUÉS DE GUARDAR
//==============================
//==============================
function limpiarFormulario() {
    $('#formPrimaVacacional')[0].reset();
    $('#idKardexSeleccionado').val('');
    $('#selectMovimientoKardex').val('');
    $('#diasTotalesCalculo').text('0.000');
    $('#sueldoVacaciones').val('$0.00');
    $('#resumenVacaciones').text('$0.00');
    $('#resumenPrima').text('$0.00');
    $('#resumenSeptimoDia').text('$0.00');
    $('#resumenFestivos').text('$0.00');
    
    // Limpiar deducciones en resumen
    $('#resumenDeducTarjeta').text('$0.00');
    $('#resumenDeducIsr').text('$0.00');
    $('#resumenDeducImss').text('$0.00');
    $('#resumenDeducInfonavit').text('$0.00');
    
    // Ocultar filas de deducciones en resumen
    $('#filaDeducTarjeta').hide();
    $('#filaDeducIsr').hide();
    $('#filaDeducImss').hide();
    $('#filaDeducInfonavit').hide();
    $('#separadorDeducciones').hide();
    $('#separadorTotal').hide();
    
    $('#resumenTotal').text('$0.00');

    // Resetear estado de los inputs disfrutados/pagadas
    $('#diasDisfrutados, #diasPagadas').val('').prop('disabled', true).css({ 'background-color': '#f1f3f5', 'opacity': '0.6' });

    if (typeof empleadoActual !== 'undefined' && empleadoActual) {
        $('#salarioDiario').val(empleadoActual.salario_diario || '').trigger('change');
    }
}