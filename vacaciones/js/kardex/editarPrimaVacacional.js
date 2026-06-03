//==================================================================================================
// LÓGICA PARA VER DETALLE Y EDITAR LA PRIMA VACACIONAL EN MODAL
//==================================================================================================

$(document).ready(function () {
    // Vincular eventos para cálculo en tiempo real con delegación de eventos para mayor confiabilidad
    $(document).on('change input', '#edit_diasVacaciones, #edit_domingos, #edit_festivos, #edit_incluirDomingos, #edit_incluirFestivos, #edit_salarioDiario, #edit_porcentajePrima, #edit_dispersionTarjeta, #edit_isr', function () {
        calcularEditarPrima();
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
    let domVal = parseFloat(prima.domingos) || 0;
    let festVal = parseFloat(prima.festivos) || 0;

    $('#edit_diasVacaciones').val(diasVac.toFixed(3));
    $('#edit_domingos').val(domVal);
    $('#edit_festivos').val(festVal);

    // Si domingos o festivos son mayores a 0, activar los switches. De lo contrario dejarlos apagados.
    $('#edit_incluirDomingos').prop('checked', domVal > 0);
    $('#edit_incluirFestivos').prop('checked', festVal > 0);

    $('#edit_salarioDiario').val(parseFloat(prima.salario_diario).toFixed(2));
    $('#edit_porcentajePrima').val(parseFloat(prima.porcentaje_prima).toFixed(2));
    $('#edit_dispersionTarjeta').val(parseFloat(prima.dispersion_tarjeta || 0).toFixed(2));
    $('#edit_isr').val(parseFloat(prima.isr || 0).toFixed(2));
    $('#edit_observaciones').val(prima.observaciones || '');

    // Calcular y mostrar totales en tiempo real
    calcularEditarPrima();

    // Mostrar el modal usando Bootstrap 5 (getOrCreateInstance evita duplicidad de instancias)
    let modalElement = document.getElementById('modalPrimaVacacional');
    let modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

//==============================
// CALCULA LA PRIMA VACACIONAL EN TIEMPO REAL DENTRO DEL MODAL
//==============================
function calcularEditarPrima() {
    let diasVac = parseFloat($('#edit_diasVacaciones').val()) || 0;
    let domingos = parseFloat($('#edit_domingos').val()) || 0;
    let festivos = parseFloat($('#edit_festivos').val()) || 0;
    let incluirDom = $('#edit_incluirDomingos').is(':checked');
    let incluirFest = $('#edit_incluirFestivos').is(':checked');

    let domingosContados = incluirDom ? domingos : 0;
    let festivosContados = incluirFest ? festivos : 0;
    let diasTotales = diasVac + domingosContados + festivosContados;

    let salarioDiario = parseFloat($('#edit_salarioDiario').val()) || 0;
    let porcentajePrima = parseFloat($('#edit_porcentajePrima').val()) || 25;
    let dispersionTarjeta = parseFloat($('#edit_dispersionTarjeta').val()) || 0;
    let isr = parseFloat($('#edit_isr').val()) || 0;

    // Calcular Sueldo de Vacaciones (Días Totales × Salario Diario)
    let sueldoVac = diasTotales * salarioDiario;
    $('#edit_sueldoVacaciones').val('$' + sueldoVac.toFixed(2));

    // Fórmula: Días Totales × Salario diario × (Porcentaje / 100)
    let montoPrima = (diasTotales * salarioDiario * (porcentajePrima / 100));

    // Total a pagar = Prima - Dispersión - ISR
    let totalPagar = montoPrima - dispersionTarjeta - isr;

    // Actualizar campos e informativos en el modal
    $('#edit_diasTotalesCalculo').text(diasTotales.toFixed(3));
    $('#edit_resumenPrima').text('$' + montoPrima.toFixed(2));
    $('#edit_resumenDispersion').text('$' + dispersionTarjeta.toFixed(2));
    $('#edit_resumenISR').text('$' + isr.toFixed(2));
    $('#edit_resumenTotal').text('$' + totalPagar.toFixed(2));

    // Actualizar desglose detallado
    $('#edit_desglosesDias').text(diasTotales.toFixed(3));
    $('#edit_desglosesSalario').text('$' + salarioDiario.toFixed(2));
    $('#edit_desglosesSueldoVac').text('$' + sueldoVac.toFixed(2));
    $('#edit_desglosesPorcentaje').text(porcentajePrima.toFixed(2) + '%');
    $('#edit_desglosePrima').text('$' + montoPrima.toFixed(2));
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
    let incluirDom = $('#edit_incluirDomingos').is(':checked');
    let incluirFest = $('#edit_incluirFestivos').is(':checked');
    let domingos = incluirDom ? ($('#edit_domingos').val() || 0) : 0;
    let festivos = incluirFest ? ($('#edit_festivos').val() || 0) : 0;

    let diasTotales = parseFloat(diasVac) + parseFloat(domingos) + parseFloat(festivos);

    let salarioDiario = $('#edit_salarioDiario').val();
    let porcentajePrima = $('#edit_porcentajePrima').val();
    let dispersion = $('#edit_dispersionTarjeta').val() || 0;
    let isr = $('#edit_isr').val() || 0;
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
    if (!salarioDiario || parseFloat(salarioDiario) <= 0) {
        Swal.fire('Atención', 'Ingresa el salario diario.', 'warning');
        return;
    }

    // Calcular montos finales
    let montoPrima = diasTotales * (parseFloat(salarioDiario) || 0) * ((parseFloat(porcentajePrima) || 25) / 100);
    let totalPagado = montoPrima - (parseFloat(dispersion) || 0) - (parseFloat(isr) || 0);

    Swal.fire({
        title: '¿Guardar Cambios de Prima?',
        text: 'Monto Prima: $' + montoPrima.toFixed(2) + ' | Total Neto: $' + totalPagado.toFixed(2),
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