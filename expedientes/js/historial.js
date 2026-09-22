$(document).ready(function () {

    var idEmpleadoActual = 0;
    var registrosHistorialActuales = [];

    var etiquetasMap = {
        TEXT:    'Observaciones / Texto',
        DATE:    'Fecha',
        DECIMAL: 'Número Decimal',
        YEAR:    'Vigencia (Año)'
    };

    var iconosTipo = {
        TEXT:    'bi-text-left',
        DATE:    'bi-calendar-event',
        DECIMAL: 'bi-calculator',
        YEAR:    'bi-calendar3'
    };

    function setIdEmpleadoActual(id) {
        idEmpleadoActual = id;
    }

    function renderHistorialRegistro(h) {
        var raw = h.valor === null ? '' : $.trim(h.valor);
        var entregado = false;
        var extraDetails = [];
        var dateFormatted = h.fecha_registro || '';

        if (raw === '1' || raw === 'true') {
            entregado = true;
        } else if (raw === '0' || raw === 'false' || raw === '') {
            entregado = false;
        } else if (raw.startsWith('{') && raw.endsWith('}')) {
            try {
                var obj = JSON.parse(raw);
                if (obj) {
                    if (obj._entregado === '1' || obj._entregado === true || obj.BOOLEAN === '1' || obj.BOOLEAN === true) {
                        entregado = true;
                    }

                    // Iterar llaves extras
                    $.each(obj, function (k, v) {
                        if (k === '_entregado' || k === 'BOOLEAN') return;
                        if (v === null || v === undefined || v === '') return;

                        if (k === 'YEAR' && typeof v === 'object' && v !== null) {
                            var ini = v.inicio || '';
                            var fin = v.fin || '';
                            if (ini || fin) {
                                var strYear = (ini && fin) ? (ini + ' – ' + fin) : (ini ? 'Desde ' + ini : 'Hasta ' + fin);
                                extraDetails.push({
                                    icon: 'bi-calendar3',
                                    label: 'Vigencia (Año)',
                                    value: strYear
                                });
                            }
                        } else if (typeof v === 'object' && v !== null) {
                            if (v.inicio !== undefined && v.fin !== undefined && (v.inicio || v.fin)) {
                                extraDetails.push({
                                    icon: 'bi-calendar3',
                                    label: 'Vigencia',
                                    value: (v.inicio || '') + ' – ' + (v.fin || '')
                                });
                            }
                        } else {
                            var strVal = $.trim(String(v));
                            if (strVal && strVal !== 'Vacío' && strVal !== '0') {
                                extraDetails.push({
                                    icon: iconosTipo[k] || 'bi-info-circle',
                                    label: etiquetasMap[k] || k,
                                    value: strVal
                                });
                            }
                        }
                    });
                }
            } catch (e) {
                if (raw && raw !== '0') {
                    entregado = true;
                    extraDetails.push({
                        icon: 'bi-text-left',
                        label: 'Valor',
                        value: raw
                    });
                }
            }
        } else {
            entregado = true;
            extraDetails.push({
                icon: 'bi-text-left',
                label: 'Valor',
                value: raw
            });
        }

        // Crear tarjeta de registro
        var card = $('<div class="emp-req-card mb-3"></div>');
        var borderLeftColor = entregado ? '#22c55e' : '#94a3b8';
        card.css('border-left', '4px solid ' + borderLeftColor);

        var header = $('<div class="emp-req-header"></div>');

        // Fecha y badge de estatus
        var dateHtml = '<div class="d-flex align-items-center gap-2">'
            + '<i class="bi bi-clock text-muted"></i>'
            + '<span class="fw-bold text-dark" style="font-size:0.88rem;">' + dateFormatted + '</span>'
            + '</div>';
        header.append(dateHtml);

        var statusBadge = entregado
            ? '<span class="cat-badge-si"><i class="bi bi-check-circle"></i> Entregado</span>'
            : '<span class="cat-badge-no"><i class="bi bi-x-circle"></i> No entregado</span>';
        header.append('<div>' + statusBadge + '</div>');

        card.append(header);

        // Si existen detalles extras
        if (extraDetails.length > 0) {
            var body = $('<div class="emp-req-body pt-2 pb-3"></div>');
            var grid = $('<div class="row g-2"></div>');

            $.each(extraDetails, function (i, det) {
                grid.append(
                    '<div class="col-12">'
                    + '<div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background:#f8fafc; border:1px solid #f1f5f9;">'
                    + '<i class="bi ' + det.icon + ' text-success"></i>'
                    + '<span class="text-muted small fw-semibold me-1">' + det.label + ':</span>'
                    + '<span class="fw-bold text-dark small">' + det.value + '</span>'
                    + '</div>'
                    + '</div>'
                );
            });

            body.append(grid);
            card.append(body);
        }

        return card;
    }

    function renderListaHistorial(filtro) {
        filtro = (filtro || '').toLowerCase().trim();
        var cont = $('#contenedorHistorial').empty();

        var filtrados = registrosHistorialActuales.filter(function (h) {
            if (!filtro) return true;
            var txtBusqueda = (h.fecha_registro || '') + ' ' + (h.valor || '');
            if ((h.valor || '').includes('1')) txtBusqueda += ' entregado si';
            if ((h.valor || '').includes('0')) txtBusqueda += ' no entregado pendiente';
            return txtBusqueda.toLowerCase().includes(filtro);
        });

        var total = registrosHistorialActuales.length;
        if (total > 0) {
            if (filtro) {
                $('#counterHistorial').text('Mostrando ' + filtrados.length + ' de ' + total + ' registros');
            } else {
                $('#counterHistorial').text(total + ' registro' + (total === 1 ? '' : 's') + ' en total');
            }
        }

        if (filtrados.length === 0) {
            cont.html(
                '<div class="text-center py-4 text-muted">'
                + '<i class="bi bi-search fs-3 d-block mb-2 opacity-50"></i>'
                + '<div class="fw-semibold">Sin coincidencias</div>'
                + '<div class="small mt-1">No se encontraron registros en el historial para "' + filtro + '".</div>'
                + '</div>'
            );
        } else {
            $.each(filtrados, function (i, h) {
                cont.append(renderHistorialRegistro(h));
            });
        }
    }

    $(document).on('click', '.btn-ver-historial', function (e) {
        e.stopPropagation();
        var idExp = parseInt($(this).data('id-exp'));
        var nombre = $(this).data('nombre');
        $('#historialNombreCampo').text(nombre);
        $('#buscadorHistorial').val('');
        $('#barFiltroHistorial').addClass('d-none');
        registrosHistorialActuales = [];

        var cont = $('#contenedorHistorial').html('<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-success me-2" role="status"></div><span class="text-muted small">Cargando historial...</span></div>');
        
        $.getJSON('../php/expediente_empleado.php', { accion: 'obtenerHistorial', id_empleado: idEmpleadoActual, id_expediente: idExp }, function (res) {
            if (!res.exito || !res.historial || res.historial.length === 0) {
                cont.html(
                    '<div class="text-center py-5 text-muted">'
                    + '<i class="bi bi-clock-history fs-2 d-block mb-2 opacity-50 text-success"></i>'
                    + '<div class="fw-semibold text-dark">Sin historial de cambios</div>'
                    + '<div class="small text-muted mt-1" style="max-width:340px; margin:0 auto;">Aún no se han registrado modificaciones anteriores para este requisito.</div>'
                    + '</div>'
                );
            } else {
                registrosHistorialActuales = res.historial || [];
                $('#barFiltroHistorial').removeClass('d-none');
                renderListaHistorial('');
            }
            new bootstrap.Modal(document.getElementById('modalHistorialCampo')).show();
        });
    });

    $('#buscadorHistorial').on('input', function () {
        renderListaHistorial($(this).val());
    });

    window.expedienteHistorial = {
        setIdEmpleadoActual: setIdEmpleadoActual
    };
});
