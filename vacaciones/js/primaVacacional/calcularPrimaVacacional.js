//==============================
// CALCULA LA PRIMA VACACIONAL EN TIEMPO REAL
//==============================
function inicializarEventosCalculo() {
    $('#diasVacaciones, #salarioDiario, #porcentajePrima, #dispersionTarjeta, #isr, #domingos, #festivos, #incluirDomingos, #incluirFestivos').on('change input', function () {
        calcularPrima();
    });
}

//==============================
// CALCULA LA PRIMA VACACIONAL Y ACTUALIZA LOS CAMPOS DE DESGLOSE Y RESUMEN
//==============================
function calcularPrima() {
    let diasVacaciones = parseFloat($('#diasVacaciones').val()) || 0;
    let domingos = parseFloat($('#domingos').val()) || 0;
    let festivos = parseFloat($('#festivos').val()) || 0;
    let incluirDom = $('#incluirDomingos').is(':checked');
    let incluirFest = $('#incluirFestivos').is(':checked');

    let domingosContados = incluirDom ? domingos : 0;
    let festivosContados = incluirFest ? festivos : 0;
    let diasTotales = diasVacaciones + domingosContados + festivosContados;

    let salarioDiario = parseFloat($('#salarioDiario').val()) || 0;
    let porcentajePrima = parseFloat($('#porcentajePrima').val()) || 25;
    let dispersionTarjeta = parseFloat($('#dispersionTarjeta').val()) || 0;
    let isr = parseFloat($('#isr').val()) || 0;

    // Calcular Sueldo de Vacaciones (Días Totales × Salario Diario)
    let sueldoVac = diasTotales * salarioDiario;
    $('#sueldoVacaciones').val('$' + sueldoVac.toFixed(2));

    // Fórmula: Días Totales × Salario diario × (Porcentaje / 100)
    let montoPrima = (diasTotales * salarioDiario * (porcentajePrima / 100));

    // Total a pagar = Prima - Dispersión - ISR
    let totalPagar = montoPrima - dispersionTarjeta - isr;

    // Actualizar etiqueta del total de días a calcular
    $('#diasTotalesCalculo').text(diasTotales.toFixed(3));

    // Actualizar campos de desglose (registro de cuentas)
    $('#desglosesDias').text(diasTotales.toFixed(3));
    $('#desglosesSalario').text('$' + salarioDiario.toFixed(2));
    $('#desglosesSueldoVac').text('$' + sueldoVac.toFixed(2));
    $('#desglosesPorcentaje').text((porcentajePrima.toFixed(2)) + '%');
    $('#desglosePrima').text('$' + montoPrima.toFixed(2));

    // Actualizar resumen final
    $('#resumenPrima').text('$' + montoPrima.toFixed(2));
    $('#resumenDispersion').text('$' + dispersionTarjeta.toFixed(2));
    $('#resumenISR').text('$' + isr.toFixed(2));
    $('#resumenTotal').text('$' + totalPagar.toFixed(2));
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
    let incluirDom = $('#incluirDomingos').is(':checked');
    let incluirFest = $('#incluirFestivos').is(':checked');
    let domingos = incluirDom ? ($('#domingos').val() || 0) : 0;
    let festivos = incluirFest ? ($('#festivos').val() || 0) : 0;

    let diasTotales = parseFloat(diasVacaciones) + parseFloat(domingos) + parseFloat(festivos);

    let salarioDiario = $('#salarioDiario').val();
    let porcentajePrima = $('#porcentajePrima').val();
    let dispersion = $('#dispersionTarjeta').val() || 0;
    let isr = $('#isr').val() || 0;
    let observaciones = $('#observaciones').val() || '';

    // 2. Calcular montos
    let montoPrima = diasTotales * (parseFloat(salarioDiario) || 0) * ((parseFloat(porcentajePrima) || 25) / 100);
    let totalPagado = montoPrima - (parseFloat(dispersion) || 0) - (parseFloat(isr) || 0);

    // 3. Validaciones simples
    if (!idEmpleado) { Swal.fire('Error', 'No se identificó al empleado.', 'error'); return; }
    if (!idKardex) { Swal.fire('Atención', 'Selecciona un movimiento de vacaciones.', 'warning'); return; }
    if (!numeroSemana) { Swal.fire('Atención', 'Ingresa el número de semana.', 'warning'); return; }
    if (!fechaPago || !fechaInicio || !fechaFin) { Swal.fire('Atención', 'Las fechas son obligatorias.', 'warning'); return; }
    if (!salarioDiario || parseFloat(salarioDiario) <= 0) { Swal.fire('Atención', 'Ingresa el salario diario.', 'warning'); return; }

    // 4. Confirmar antes de guardar
    Swal.fire({
        title: '¿Guardar Prima Vacacional?',
        text: 'Prima: $' + montoPrima.toFixed(2) + ' | Total a pagar: $' + totalPagado.toFixed(2),
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
                domingos: domingos,
                festivos: festivos,
                salario_diario: salarioDiario,
                porcentaje_prima: porcentajePrima,
                monto_prima_vacacional: montoPrima.toFixed(2),
                dispersion_tarjeta: dispersion,
                isr: isr,
                total_pagado: totalPagado.toFixed(2),
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
function limpiarFormulario() {
    $('#formPrimaVacacional')[0].reset();
    $('#idKardexSeleccionado').val('');
    $('#selectMovimientoKardex').val('');
    $('#diasTotalesCalculo').text('0.000');
    $('#sueldoVacaciones').val('$0.00');
    $('#desglosesDias').text('0.000');
    $('#desglosesSalario').text('$0.00');
    $('#desglosesSueldoVac').text('$0.00');
    $('#desglosesPorcentaje').text('25.00%');
    $('#desglosePrima').text('$0.00');
    $('#resumenPrima').text('$0.00');
    $('#resumenDispersion').text('$0.00');
    $('#resumenISR').text('$0.00');
    $('#resumenTotal').text('$0.00');

    if (typeof empleadoActual !== 'undefined' && empleadoActual) {
        $('#salarioDiario').val(empleadoActual.salario_diario || '');
    }
}