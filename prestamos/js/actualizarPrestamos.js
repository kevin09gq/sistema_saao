
// Función para inicializar los handlers del modal de actualización
function inicializarModalActualizar() {
    abrirModalEditar();
    recalcularValores();
    validarMontoPago();
    agregarPago();
    agregarConcepto();
    eliminarConcepto();
    guardarCambiosPrestamo();
    eliminarPago();
    prevenirSubmitFormActualizar();
}

// Función para abrir modal al presionar botón editar
function abrirModalEditar() {
    $(document).on('click', '.btn-accion.editar', function () {
        // Obtener el id del préstamo desde el data-id de la fila
        let fila = $(this).closest('tr');
        let idPrestamo = fila.data('id');

        if (!idPrestamo) {
            alert('No se pudo obtener el ID del préstamo');
            return;
        }

        // Cargar datos del préstamo y sus pagos
        cargarDatosPrestamo(idPrestamo);
    });
}

// Función para cargar datos del préstamo y llenar el modal
function cargarDatosPrestamo(idPrestamo) {
    $.ajax({
        url: '../php/cargarPrestamos.php',
        type: 'GET',
        data: { id_prestamo: idPrestamo },
        dataType: 'json',
        success: function (data) {
            if (data.error) {

                return;
            }

            // Llenar campos del formulario con datos del préstamo
            let p = data.prestamo;
            $('#upd_id_prestamo').val(p.id_prestamo);
            $('#upd_empleado_nombre').val(p.nombre_completo + ' - Clave: ' + p.clave_empleado);
            $('#upd_monto_total').val(parseFloat(p.monto_total).toFixed(2));
            $('#upd_semanas_totales').val(p.semanas_totales);
            $('#upd_monto_semanal').val(parseFloat(p.monto_semanal).toFixed(2));
            $('#upd_semanas_pagadas').val(p.semanas_pagadas);
            $('#upd_saldo_restante').val(parseFloat(p.saldo_restante).toFixed(2));

            // Formatear fecha (de YYYY-MM-DD HH:MM:SS a YYYY-MM-DD para input date)
            let fecha = p.fecha_inicio.split(' ')[0];
            $('#upd_fecha_inicio').val(fecha);

            $('#upd_estado').val(p.estado);
            $('#upd_notas').val(p.notas || '');

            // Llenar tabla de pagos
            llenarTablaPagos(data.pagos);

            // Llenar tabla de conceptos
            if (data.conceptos) {
                llenarTablaConceptos(data.conceptos);
            } else {
                llenarTablaConceptos([]);
            }

            // Abrir el modal solo si no está ya visible (evita parpadeo)
            if (!$('#modalActualizarPrestamo').hasClass('show')) {
                $('#modalActualizarPrestamo').modal('show');
            }
        },
        error: function () {

        }
    });
}

// Función para llenar la tabla de pagos
function llenarTablaPagos(pagos) {
    let tbody = $('#tablaPagosPrestamo tbody');
    tbody.empty();

    if (!pagos || pagos.length === 0) {
        tbody.append('<tr><td colspan="5" class="text-center">No hay pagos registrados</td></tr>');
        return;
    }

    pagos.forEach(function (pago, index) {
        let fila = `
            <tr data-id-pago="${pago.id_pago}">
                <td>${index + 1}</td>
                <td>$${parseFloat(pago.monto_pagado).toFixed(2)}</td>
                <td>${pago.numero_semana}</td>
                <td>${pago.fecha_pago}</td>
                <td>
                    <button class="btn btn-sm btn-danger eliminar-pago" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Función para llenar la tabla de conceptos
function llenarTablaConceptos(conceptos) {
    let tbody = $('#tablaConceptosPrestamo tbody');
    tbody.empty();

    if (!conceptos || conceptos.length === 0) {
        tbody.append('<tr><td colspan="5" class="text-center">No hay conceptos registrados</td></tr>');
        return;
    }

    conceptos.forEach(function (c, index) {
        let fila = `
            <tr data-id-concepto="${c.id_concepto}">
                <td>${index + 1}</td>
                <td>${c.concepto}</td>
                <td>$${parseFloat(c.monto).toFixed(2)}</td>
                <td>${c.fecha_registro}</td>
                <td>
                    <button class="btn btn-sm btn-danger eliminar-concepto" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Función para recalcular valores cuando se editan campos
function recalcularValores() {
    $(document).on('input', '#upd_monto_total, #upd_semanas_totales', function () {
        let montoTotal = parseFloat($('#upd_monto_total').val()) || 0;
        let semanasTotales = parseInt($('#upd_semanas_totales').val()) || 0;

        // Calcular monto semanal
        let montoSemanal = semanasTotales > 0 ? (montoTotal / semanasTotales) : 0;
        $('#upd_monto_semanal').val(montoSemanal.toFixed(2));

        // Calcular saldo restante: monto_total - suma de todos los pagos realizados
        let totalPagado = 0;
        $('#tablaPagosPrestamo tbody tr').each(function () {
            // Obtener el monto de cada fila (está en la segunda columna con formato $XXX.XX)
            let montoTexto = $(this).find('td').eq(1).text();
            if (montoTexto && montoTexto !== 'No hay pagos registrados') {
                let monto = parseFloat(montoTexto.replace('$', '').replace(',', '')) || 0;
                totalPagado += monto;
            }
        });

        let saldoRestante = montoTotal - totalPagado;
        if (saldoRestante < 0) saldoRestante = 0;
        $('#upd_saldo_restante').val(saldoRestante.toFixed(2));
    });
}

// Función para agregar un nuevo pago
function agregarPago() {
    $('#btnAgregarPago').on('click', function () {
        // Obtener valores del formulario
        let idPrestamo = $('#upd_id_prestamo').val();
        let montoPago = parseFloat($('#pago_monto').val()) || 0;
        let numeroSemana = $('#pago_semana').val();
        let fechaPago = $('#pago_fecha').val();
        let saldoRestante = parseFloat($('#upd_saldo_restante').val()) || 0;

        // Validar que todos los campos estén llenos
        if (!montoPago || !numeroSemana || !fechaPago) {
            alert('Por favor completa todos los campos del pago');
            return;
        }

        // Validación: monto no puede exceder el saldo restante
        if (montoPago > saldoRestante) {
            $('#pago_warning').show();
            alert('El monto del pago no puede ser mayor al saldo restante');
            return;
        }

        // Enviar datos al servidor
        $.ajax({
            url: '../php/agregarPago.php',
            type: 'POST',
            data: {
                id_prestamo: idPrestamo,
                monto_pagado: montoPago,
                numero_semana: numeroSemana,
                fecha_pago: fechaPago
            },
            dataType: 'json',
            success: function (respuesta) {
                if (respuesta.success) {
                    alert('Pago registrado exitosamente');

                    // Limpiar campos
                    $('#pago_monto').val('');
                    $('#pago_semana').val('');
                    $('#pago_fecha').val('');
                    $('#pago_warning').hide();

                    // Recargar datos del préstamo para actualizar la tabla de pagos
                    cargarDatosPrestamo(idPrestamo);

                    // Recargar la tabla principal de préstamos
                    cargarTablaPrestamos();

                    // Actualizar estadísticas
                    actualizarEstadisticas();
                } else {

                }
            },
            error: function () {
            }
        });
    });
}

// Validación en tiempo real del monto de pago
function validarMontoPago() {
    function checkMonto() {
        let montoPago = parseFloat($('#pago_monto').val()) || 0;
        let saldo = parseFloat($('#upd_saldo_restante').val());
        if (isNaN(saldo)) saldo = 0;

        if (montoPago > saldo) {
            $('#pago_warning').show();
            $('#btnAgregarPago').prop('disabled', true);
        } else {
            $('#pago_warning').hide();
            $('#btnAgregarPago').prop('disabled', false);
        }
    }

    // Revisar mientras se escribe y cuando cambia el saldo
    $(document).on('input', '#pago_monto', checkMonto);
    $(document).on('change input', '#upd_saldo_restante', checkMonto);

    // Recalcular al abrir el modal
    $('#modalActualizarPrestamo').on('shown.bs.modal', function () {
        checkMonto();
    });
}

// Función para agregar un nuevo concepto
function agregarConcepto() {
    $('#btnAgregarConcepto').on('click', function () {
        let idPrestamo = $('#upd_id_prestamo').val();
        let concepto = $('#concepto_add').val().trim();
        let monto = parseFloat($('#monto_concepto_add').val()) || 0;

        // Validaciones sencillas
        if (!idPrestamo) {
            alert('No se encontró el préstamo seleccionado');
            return;
        }
        if (!concepto) {
            alert('Ingrese un concepto');
            return;
        }
        if (monto <= 0) {
            alert('Ingrese un monto válido');
            return;
        }

        // Enviar al servidor
        $.ajax({
            url: '../php/agregarConcepto.php',
            type: 'POST',
            data: { id_prestamo: idPrestamo, concepto: concepto, monto: monto },
            dataType: 'json',
            success: function (res) {
                if (res && res.success) {
                    alert('Concepto agregado');

                    // Limpiar inputs
                    $('#concepto_add').val('');
                    $('#monto_concepto_add').val('');

                    // Actualizar valores en el modal si vienen en la respuesta
                    if (res.monto_total !== undefined) {
                        $('#upd_monto_total').val(parseFloat(res.monto_total).toFixed(2));
                    }
                    if (res.saldo_restante !== undefined) {
                        $('#upd_saldo_restante').val(parseFloat(res.saldo_restante).toFixed(2));
                    }
                    if (res.monto_semanal !== undefined) {
                        $('#upd_monto_semanal').val(parseFloat(res.monto_semanal).toFixed(2));
                    }
                    if (res.estado !== undefined) {
                        $('#upd_estado').val(res.estado);
                    }

                    // Recargar datos del préstamo para actualizar tablas y totales (opcional)
                    cargarDatosPrestamo(idPrestamo);

                    // Actualizar tabla principal y estadísticas
                    if (typeof cargarTablaPrestamos === 'function') cargarTablaPrestamos();
                    if (typeof actualizarEstadisticas === 'function') actualizarEstadisticas();
                } else {
                    alert('Error: ' + (res.mensaje || 'No se pudo agregar el concepto'));
                }
            },
            error: function () {
                alert('Error al contactar al servidor');
            }
        });

    });
}

// Función para eliminar un pago
function eliminarPago() {
    $(document).on('click', '.eliminar-pago', function () {
        let filaPago = $(this).closest('tr');
        let idPago = filaPago.data('id-pago');
        let idPrestamo = $('#upd_id_prestamo').val();

        if (!idPago || !idPrestamo) {
            alert('No se pudo obtener la información del pago');
            return;
        }

        if (!confirm('¿Seguro que deseas eliminar este pago?')) {
            return;
        }

        $.ajax({
            url: '../php/eliminarPago.php',
            type: 'POST',
            dataType: 'json',
            data: { id_pago: idPago, id_prestamo: idPrestamo },
            success: function (respuesta) {
                if (respuesta && respuesta.success) {
                    // Actualizar UI del modal sin recargar (evita parpadeo)
                    filaPago.remove();

                    // Si no hay filas, mostrar mensaje vacío
                    const tbody = $('#tablaPagosPrestamo tbody');
                    if (tbody.children('tr').length === 0) {
                        tbody.append('<tr><td colspan="5" class="text-center">No hay pagos registrados</td></tr>');
                    } else {
                        // Renumerar índice (#)
                        tbody.children('tr').each(function(index){
                            $(this).find('td').eq(0).text(index + 1);
                        });
                    }

                    // Actualizar campos del formulario
                    if (typeof respuesta.semanas_pagadas !== 'undefined') {
                        $('#upd_semanas_pagadas').val(respuesta.semanas_pagadas);
                    }
                    if (typeof respuesta.saldo_restante !== 'undefined') {
                        $('#upd_saldo_restante').val(parseFloat(respuesta.saldo_restante).toFixed(2));
                    }
                    if (respuesta.estado) {
                        $('#upd_estado').val(respuesta.estado);
                    }

                    // Actualizar fila de la tabla principal (progreso y estado) sin recargar
                    const filaPrincipal = $('tr[data-id="' + idPrestamo + '"]');
                    if (filaPrincipal.length) {
                        const semanasTotales = parseInt($('#upd_semanas_totales').val()) || 0;
                        const semanasPagadas = parseInt($('#upd_semanas_pagadas').val()) || 0;
                        const progresoPercent = semanasTotales > 0 ? Math.round((semanasPagadas / semanasTotales) * 100) : 0;

                        // Progreso barra y texto
                        filaPrincipal.find('.progreso-fill').css('width', progresoPercent + '%');
                        filaPrincipal.find('.progreso-texto').text(semanasPagadas + '/' + semanasTotales + ' pagos');

                        // Badge de estado
                        const badge = filaPrincipal.find('.badge');
                        if (badge.length && respuesta.estado) {
                            // Quitar estados conocidos y agregar el actual
                            badge.removeClass('pendiente activo pagado cancelado')
                                 .addClass(respuesta.estado)
                                 .text(respuesta.estado.charAt(0).toUpperCase() + respuesta.estado.slice(1));
                        }
                    }

                    // Actualizar estadísticas
                    actualizarEstadisticas();
                } else {
                    alert('No se pudo eliminar el pago');
                }
            },
            error: function () {
                alert('Error al eliminar el pago');
            }
        });
    });
}

// Función para eliminar un concepto
function eliminarConcepto() {
    $(document).on('click', '.eliminar-concepto', function () {
        let fila = $(this).closest('tr');
        let idConcepto = fila.data('id-concepto');
        let idPrestamo = $('#upd_id_prestamo').val();

        if (!idConcepto || !idPrestamo) {
            alert('No se pudo obtener la información del concepto');
            return;
        }

        if (!confirm('¿Seguro que deseas eliminar este concepto?')) {
            return;
        }

        $.ajax({
            url: '../php/eliminarConcepto.php',
            type: 'POST',
            dataType: 'json',
            data: { id_concepto: idConcepto, id_prestamo: idPrestamo },
            success: function (res) {
                if (res && res.success) {
                    // Remover fila
                    fila.remove();

                    // Si no hay filas, mostrar mensaje vacío
                    const tbody = $('#tablaConceptosPrestamo tbody');
                    if (tbody.children('tr').length === 0) {
                        tbody.append('<tr><td colspan="5" class="text-center">No hay conceptos registrados</td></tr>');
                    } else {
                        // Renumerar índice (#)
                        tbody.children('tr').each(function(index){
                            $(this).find('td').eq(0).text(index + 1);
                        });
                    }

                    // Actualizar campos del modal con los nuevos totales
                    if (res.monto_total !== undefined) {
                        $('#upd_monto_total').val(parseFloat(res.monto_total).toFixed(2));
                    }
                    if (res.saldo_restante !== undefined) {
                        $('#upd_saldo_restante').val(parseFloat(res.saldo_restante).toFixed(2));
                    }
                    if (res.monto_semanal !== undefined) {
                        $('#upd_monto_semanal').val(parseFloat(res.monto_semanal).toFixed(2));
                    }
                    if (res.semanas_pagadas !== undefined) {
                        $('#upd_semanas_pagadas').val(res.semanas_pagadas);
                    }
                    if (res.estado !== undefined) {
                        $('#upd_estado').val(res.estado);
                    }

                    // Actualizar tabla principal y estadísticas
                    if (typeof cargarTablaPrestamos === 'function') cargarTablaPrestamos();
                    if (typeof actualizarEstadisticas === 'function') actualizarEstadisticas();

                } else {
                    alert('No se pudo eliminar el concepto');
                }
            },
            error: function () {
                alert('Error al eliminar el concepto');
            }
        });
    });
}

// Evitar que el formulario del modal haga submit por Enter (evita query params en la URL)
function prevenirSubmitFormActualizar() {
    $(document).on('submit', '#formActualizarPrestamo', function (e) {
        e.preventDefault();
        $('#btnGuardarActualizar').trigger('click');
    });
}

// Función para guardar cambios del préstamo
function guardarCambiosPrestamo() {
    $('#btnGuardarActualizar').on('click', function () {
        // Obtener todos los valores del formulario
        let datos = {
            id_prestamo: $('#upd_id_prestamo').val(),
            monto_total: $('#upd_monto_total').val(),
            monto_semanal: $('#upd_monto_semanal').val(),
            semanas_totales: $('#upd_semanas_totales').val(),
            saldo_restante: $('#upd_saldo_restante').val(),
            estado: $('#upd_estado').val(),
            notas: $('#upd_notas').val(),
            fecha_inicio: $('#upd_fecha_inicio').val()
        };

        // Validar campos requeridos
        if (!datos.monto_total || !datos.semanas_totales) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        // Enviar datos al servidor
        $.ajax({
            url: '../php/actualizarPrestamo.php',
            type: 'POST',
            data: datos,
            dataType: 'json',
            success: function (respuesta) {
                if (respuesta.success) {

                    // Cerrar el modal
                    $('#modalActualizarPrestamo').modal('hide');

                    // Recargar la tabla principal
                    cargarTablaPrestamos();

                    // Actualizar estadísticas
                    actualizarEstadisticas();
                } else {

                }
            },
            error: function () {

            }
        });
    });
}

