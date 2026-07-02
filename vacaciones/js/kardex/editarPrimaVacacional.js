//==================================================================================================
// LÓGICA PARA VER DETALLE Y EDITAR LA PRIMA VACACIONAL EN MODAL
//==================================================================================================

$(document).ready(function () {
    // Vincular eventos para cálculo en tiempo real con delegación de eventos para mayor confiabilidad
    $(document).on('change input', '#edit_salarioDiario, #edit_porcentajePrima, #edit_septimoDia, #edit_festivos, #edit_incluirSeptimoDia, #edit_incluirFestivos, #edit_dispersionTarjeta, #edit_isr, #edit_imss, #edit_infonavit', function () {
        calcularEditarPrima();
    });

    // Escuchar cambios en edit_diasVacaciones para actualizar el séptimo día y recalcular
    $(document).on('change input', '#edit_diasVacaciones', function () {
        let dias = parseFloat($(this).val()) || 0;
        let septimo = (dias / 6).toFixed(2);
        $('#edit_septimoDia').val(septimo);
        calcularEditarPrima();
    });

    // Toggle Disfrutados
    $(document).on('change', '#edit_chkDisfrutados', function () {
        let $input = $('#edit_diasDisfrutados');
        if ($(this).is(':checked')) {
            $input.prop('disabled', false).css({ 'background-color': '', 'opacity': '1' });
        } else {
            $input.val('').prop('disabled', true).css({ 'background-color': '#f1f3f5', 'opacity': '0.6' });
        }
    });

    // Toggle Pagadas
    $(document).on('change', '#edit_chkPagadas', function () {
        let $input = $('#edit_diasPagadas');
        if ($(this).is(':checked')) {
            $input.prop('disabled', false).css({ 'background-color': '', 'opacity': '1' });
        } else {
            $input.val('').prop('disabled', true).css({ 'background-color': '#f1f3f5', 'opacity': '0.6' });
        }
    });

    // Vincular el evento submit del formulario de edición
    $(document).on('submit', '#formEditarPrimaVacacional', function (e) {
        e.preventDefault();
        guardarEditarPrima();
    });
});

//==============================
// ABRE EL MODAL Y LLENA LOS DATOS DE LA PRIMA SELECCIONADA
//==============================
function verDetallePrima(idPrimaEmpleado) {
    if (!listaPrimasGlobal || listaPrimasGlobal.length === 0) {
        Swal.fire('Error', 'No hay información de primas cargada.', 'error');
        return;
    }

    // Buscar la prima en la lista global en memoria
    let prima = listaPrimasGlobal.find(p => p.id_prima_empleado == idPrimaEmpleado);

    if (!prima) {
        Swal.fire('Error', 'No se encontró el registro de la prima vacacional.', 'error');
        return;
    }

    // Llenar campos ocultos
    $('#edit_id_prima_empleado').val(prima.id_prima_empleado);
    $('#edit_id_empleado').val(prima.id_empleado);
    $('#edit_id_kardex').val(prima.id_kardex);

    // Llenar campos del formulario
    $('#edit_numeroSemana').val(prima.numero_semana);
    $('#edit_anio').val(prima.anio);
    $('#edit_fechaPago').val(prima.fecha_pago);
    $('#edit_fechaInicio').val(prima.fecha_inicio);
    $('#edit_fechaFin').val(prima.fecha_fin);

    let diasVac = parseFloat(prima.dias_vacaciones) || 0;
    let septimoVal = parseFloat(prima.septimo_dia) || 0;
    let festVal = parseFloat(prima.festivos) || 0;

    $('#edit_diasVacaciones').val(diasVac.toFixed(3));
    $('#edit_septimoDia').val(septimoVal.toFixed(2));
    $('#edit_festivos').val(festVal);

    // Activar los switches basándose en la configuración guardada en base de datos
    $('#edit_incluirSeptimoDia').prop('checked', parseInt(prima.incluir_septimo_dia) == 1);
    $('#edit_incluirFestivos').prop('checked', parseInt(prima.incluir_festivos) == 1);

    $('#edit_salarioDiario').val(parseFloat(prima.salario_diario).toFixed(2));
    $('#edit_porcentajePrima').val(parseFloat(prima.porcentaje_prima).toFixed(2));
    $('#edit_dispersionTarjeta').val(parseFloat(prima.dispersion_tarjeta || 0).toFixed(2));
    $('#edit_isr').val(parseFloat(prima.isr || 0).toFixed(2));
    $('#edit_imss').val(parseFloat(prima.imss || 0).toFixed(2));
    $('#edit_infonavit').val(parseFloat(prima.infonavit || 0).toFixed(2));

    // Días disfrutados / pagadas
    let diasDisfrutados = parseFloat(prima.dias_disfrutados || 0);
    let diasPagadas = parseFloat(prima.dias_pagadas || 0);

    $('#edit_chkDisfrutados').prop('checked', diasDisfrutados > 0).trigger('change');
    if (diasDisfrutados > 0) {
        $('#edit_diasDisfrutados').val(diasDisfrutados.toFixed(3));
    } else {
        $('#edit_diasDisfrutados').val('');
    }

    $('#edit_chkPagadas').prop('checked', diasPagadas > 0).trigger('change');
    if (diasPagadas > 0) {
        $('#edit_diasPagadas').val(diasPagadas.toFixed(3));
    } else {
        $('#edit_diasPagadas').val('');
    }

    $('#edit_observaciones').val(prima.observaciones || '');

    // Calcular y mostrar totales en tiempo real
    calcularEditarPrima();

    // Mostrar el modal usando Bootstrap 5
    let modalElement = document.getElementById('modalPrimaVacacional');
    let modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

//==============================
// CALCULA LA PRIMA VACACIONAL EN TIEMPO REAL DENTRO DEL MODAL
//==============================
function calcularEditarPrima() {
    let diasVac = parseFloat($('#edit_diasVacaciones').val()) || 0;
    let septimoDia = parseFloat($('#edit_septimoDia').val()) || 0;
    let festivos = parseFloat($('#edit_festivos').val()) || 0;
    let incluirSeptimo = $('#edit_incluirSeptimoDia').is(':checked');
    let incluirFest = $('#edit_incluirFestivos').is(':checked');

    let salarioDiario = parseFloat($('#edit_salarioDiario').val()) || 0;
    let porcentajePrima = parseFloat($('#edit_porcentajePrima').val()) || 25;

    // Deducciones
    let deducTarjeta = parseFloat($('#edit_dispersionTarjeta').val()) || 0;
    let deducIsr = parseFloat($('#edit_isr').val()) || 0;
    let deducImss = parseFloat($('#edit_imss').val()) || 0;
    let deducInfonavit = parseFloat($('#edit_infonavit').val()) || 0;

    // 1. Sueldo por vacaciones = Días Vacaciones * Salario Diario
    let sueldoVac = diasVac * salarioDiario;
    $('#edit_sueldoVacaciones').val('$' + sueldoVac.toFixed(2));

    // 2. Prima Vacacional = Sueldo por vacaciones * (Porcentaje Prima / 100)
    let montoPrima = sueldoVac * (porcentajePrima / 100);

    // 3. Séptimo Día = septimoDia * Salario Diario
    let montoSeptimo = septimoDia * salarioDiario;

    // 4. Festivos = festivos * Salario Diario
    let montoFestivos = festivos * salarioDiario;

    // Actualizar los elementos de desglose/resumen
    $('#edit_resumenVacaciones').text('$' + sueldoVac.toFixed(2));
    $('#edit_resumenPrima').text('$' + montoPrima.toFixed(2));
    $('#edit_resumenSeptimoDia').text('$' + montoSeptimo.toFixed(2));
    $('#edit_resumenFestivos').text('$' + montoFestivos.toFixed(2));

    // Calcular el subtotal de percepciones
    let subtotal = sueldoVac + montoPrima;

    if (incluirSeptimo) {
        $('#edit_filaSemptimoDia').show();
        subtotal += montoSeptimo;
    } else {
        $('#edit_filaSemptimoDia').hide();
    }

    if (incluirFest) {
        $('#edit_filaFestivos').show();
        subtotal += montoFestivos;
    } else {
        $('#edit_filaFestivos').hide();
    }

    // Actualizar deducciones individuales en el resumen del modal
    $('#edit_resumenDeducTarjeta').text('$' + deducTarjeta.toFixed(2));
    $('#edit_resumenDeducIsr').text('$' + deducIsr.toFixed(2));
    $('#edit_resumenDeducImss').text('$' + deducImss.toFixed(2));
    $('#edit_resumenDeducInfonavit').text('$' + deducInfonavit.toFixed(2));

    // Mostrar/ocultar filas individuales
    $('#edit_filaDeducTarjeta').toggle(deducTarjeta > 0);
    $('#edit_filaDeducIsr').toggle(deducIsr > 0);
    $('#edit_filaDeducImss').toggle(deducImss > 0);
    $('#edit_filaDeducInfonavit').toggle(deducInfonavit > 0);

    let totalDeducciones = deducTarjeta + deducIsr + deducImss + deducInfonavit;

    // Mostrar/ocultar separadores
    if (totalDeducciones > 0) {
        $('#edit_separadorDeducciones').show();
        $('#edit_separadorTotal').show();
    } else {
        $('#edit_separadorDeducciones').hide();
        $('#edit_separadorTotal').hide();
    }

    // Restar deducciones al total
    let total = subtotal - totalDeducciones;

    // Actualizar el total y los días totales en la pantalla del modal
    $('#edit_resumenTotal').text('$' + total.toFixed(2));

    // Modificación: Días Totales a Calcular en el modal ya no suma séptimo día ni festivos
    let diasTotales = diasVac;
    $('#edit_diasTotalesCalculo').text(diasTotales.toFixed(3));
}

//==============================
// ENVÍA LA INFORMACIÓN EDITADA AL SERVIDOR VÍA AJAX
//==============================
function guardarEditarPrima() {
    let idPrimaEmpleado = $('#edit_id_prima_empleado').val();
    let idEmpleado = $('#edit_id_empleado').val();
    let idKardex = $('#edit_id_kardex').val();
    let numeroSemana = $('#edit_numeroSemana').val();
    let anio = $('#edit_anio').val();
    let fechaPago = $('#edit_fechaPago').val();
    let fechaInicio = $('#edit_fechaInicio').val();
    let fechaFin = $('#edit_fechaFin').val();

    let diasVac = $('#edit_diasVacaciones').val() || 0;
    let incluirSeptimo = $('#edit_incluirSeptimoDia').is(':checked');
    let incluirFest = $('#edit_incluirFestivos').is(':checked');
    let septimoDia = $('#edit_septimoDia').val() || 0;
    let festivos = $('#edit_festivos').val() || 0;

    let salarioDiario = $('#edit_salarioDiario').val() || 0;
    let porcentajePrima = $('#edit_porcentajePrima').val() || 0;
    let dispersion = $('#edit_dispersionTarjeta').val() || 0;
    let isr = $('#edit_isr').val() || 0;
    let imss = $('#edit_imss').val() || 0;
    let infonavit = $('#edit_infonavit').val() || 0;

    // Días disfrutados / pagadas
    let tieneDisfrutados = $('#edit_chkDisfrutados').is(':checked');
    let tienePagadas = $('#edit_chkPagadas').is(':checked');
    let diasDisfrutados = tieneDisfrutados ? ($('#edit_diasDisfrutados').val() || 0) : 0;
    let diasPagadas = tienePagadas ? ($('#edit_diasPagadas').val() || 0) : 0;

    let observaciones = $('#edit_observaciones').val() || '';

    // Validaciones
    if (!idPrimaEmpleado) {
        Swal.fire('Error', 'No se identificó el registro de la prima vacacional.', 'error');
        return;
    }
    if (!numeroSemana) {
        Swal.fire('Atención', 'Ingresa el número de semana.', 'warning');
        return;
    }
    if (!anio) {
        Swal.fire('Atención', 'Ingresa el año.', 'warning');
        return;
    }
    if (!fechaPago || !fechaInicio || !fechaFin) {
        Swal.fire('Atención', 'Las fechas son obligatorias.', 'warning');
        return;
    }
    if (parseFloat(salarioDiario) <= 0) {
        Swal.fire('Atención', 'Ingresa el salario diario.', 'warning');
        return;
    }

    // Calcular montos finales para visualización en confirmación
    let sueldoVac = (parseFloat(diasVac) || 0) * (parseFloat(salarioDiario) || 0);
    let montoPrima = sueldoVac * ((parseFloat(porcentajePrima) || 0) / 100);
    let montoSeptimo = incluirSeptimo ? ((parseFloat(septimoDia) || 0) * (parseFloat(salarioDiario) || 0)) : 0;
    let montoFestivos = incluirFest ? ((parseFloat(festivos) || 0) * (parseFloat(salarioDiario) || 0)) : 0;
    let totalDeducciones = (parseFloat(dispersion) || 0) + (parseFloat(isr) || 0) + (parseFloat(imss) || 0) + (parseFloat(infonavit) || 0);
    let totalPagado = sueldoVac + montoPrima + montoSeptimo + montoFestivos - totalDeducciones;

    Swal.fire({
        title: '¿Guardar Cambios de Pago?',
        text: 'Total Neto: $' + totalPagado.toFixed(2),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745'
    }).then((result) => {
        if (!result.isConfirmed) return;

        $.ajax({
            url: '../php/infoEmpleados.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'editarPrimaVacacional',
                id_prima_empleado: idPrimaEmpleado,
                id_empleado: idEmpleado,
                id_kardex: idKardex,
                numero_semana: numeroSemana,
                anio: anio,
                fecha_pago: fechaPago,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                dias_vacaciones: diasVac,
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
                    Swal.fire('¡Actualizado!', resp.message, 'success');

                    // Cerrar el modal
                    let modalElement = document.getElementById('modalPrimaVacacional');
                    let modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    // Recargar historial de primas
                    if (typeof empleadoActual !== 'undefined' && empleadoActual) {
                        cargarPrimasVacacionales(empleadoActual);
                    }
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