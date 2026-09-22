$(document).ready(function () {

    var idEmpleadoActual = 0;
    var camposExpedienteActuales = [];

    var iconosTipo = {
        BOOLEAN: 'bi-check2-square',
        DECIMAL: 'bi-calculator',
        TEXT: 'bi-text-left',
        DATE: 'bi-calendar-event',
        YEAR: 'bi-calendar3'
    };

    var etiquetasMap = {
        BOOLEAN: 'Sí / No',
        DECIMAL: 'Número Decimal',
        TEXT:    'Texto',
        DATE:    'Fecha Completa',
        YEAR:    'Año'
    };

    function esCampoEntregado(c) {
        var raw = c.valor === null ? '' : $.trim(c.valor);
        if (!raw || raw === '0') return false;
        if (raw.startsWith('{') && raw.endsWith('}')) {
            try {
                var obj = JSON.parse(raw);
                return obj._entregado === '1' || obj._entregado === true || obj.BOOLEAN === '1' || obj.BOOLEAN === true;
            } catch(e) {
                return false;
            }
        }
        return raw === '1' || raw === 'true';
    }

    function actualizarProgresoModal(campos) {
        if (!campos) return;
        var llenados = 0;
        var total = campos.length;
        $.each(campos, function (i, c) {
            if (esCampoEntregado(c)) llenados++;
        });
        var pct = total > 0 ? Math.round((llenados / total) * 100) : 0;

        var colorTexto = (pct === 100) ? 'text-success' : (pct > 0 ? 'text-warning-emphasis' : 'text-danger');
        $('#progresoTexto').html('<span class="' + colorTexto + ' fw-bold">' + llenados + ' / ' + total + ' entregados (' + pct + '%)</span>');

        var $barra = $('#progresoBarra').css('width', pct + '%');
        $barra.removeClass('bg-success bg-warning bg-danger');
        if (pct === 100) {
            $barra.addClass('bg-success');
        } else if (pct > 0) {
            $barra.addClass('bg-warning');
        } else {
            $barra.addClass('bg-danger');
        }
    }

    $(document).on('click', '.btn-ver-expediente', function () {
        idEmpleadoActual = parseInt($(this).data('id'));
        if (window.expedienteHistorial) {
            window.expedienteHistorial.setIdEmpleadoActual(idEmpleadoActual);
        }
        var nombre = $(this).data('nombre') || '';
        var clave = $(this).data('clave') || '';
        var depto = $(this).data('depto') || '';
        var status = $(this).data('status') || '';
        
        var partes = nombre.trim().split(' ');
        var iniciales = ((partes[0] ? partes[0][0] : '') + (partes[1] ? partes[1][0] : '')).toUpperCase();

        var esActivo = (status || '').toLowerCase().includes('activo');
        var badgeStatus = esActivo 
            ? '<span class="cat-badge-si"><i class="bi bi-check-circle"></i> Activo</span>'
            : '<span class="cat-badge-no" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca;"><i class="bi bi-x-circle"></i> ' + (status || 'Baja') + '</span>';

        $('#tituloExpedienteEmp').text('Expediente: ' + nombre);
        $('#infoEmpleadoExpediente').html(
            '<div class="d-flex align-items-center justify-content-between flex-wrap gap-3">'
            + '<div class="d-flex align-items-center gap-3">'
            +   '<div class="emp-initials" style="width:44px; height:44px; font-size:1rem;">' + iniciales + '</div>'
            +   '<div>'
            +     '<div class="d-flex align-items-center gap-2 mb-1">'
            +       '<div class="fw-bold text-dark fs-6">' + nombre + '</div>'
            +       '<span class="emp-clave-badge">' + clave + '</span>'
            +     '</div>'
            +     '<div class="emp-dept-label"><i class="bi bi-building me-1"></i>' + (depto || 'Sin departamento') + '</div>'
            +   '</div>'
            + '</div>'
            + '<div>' + badgeStatus + '</div>'
            + '</div>'
        );
        cargarExpedienteEmpleado();
        new bootstrap.Modal(document.getElementById('modalExpedienteEmpleado')).show();
    });

    function cargarExpedienteEmpleado() {
        var cont = $('#contenedorCamposExpediente').html('<div class="text-center py-5"><div class="spinner-border text-success" role="status"></div><div class="text-muted small mt-2">Cargando expediente...</div></div>');
        $.getJSON('../php/expediente_empleado.php', { accion: 'obtenerExpediente', id_empleado: idEmpleadoActual }, function (res) {
            if (!res.exito) { cont.html('<div class="alert alert-danger shadow-sm rounded-3">Error al cargar expediente.</div>'); return; }
            camposExpedienteActuales = res.datos || [];
            if (camposExpedienteActuales.length === 0) {
                cont.html('<div class="alert alert-info shadow-sm rounded-3"><i class="bi bi-info-circle me-2"></i>Aún no hay campos activos en el catálogo. Primero agrega campos en la pestaña "Catálogo de Requisitos".</div>');
                actualizarProgresoModal([]);
                return;
            }
            cont.empty();
            $.each(camposExpedienteActuales, function (i, c) {
                cont.append(renderCampoExpediente(c));
            });
            actualizarProgresoModal(camposExpedienteActuales);
        });
    }

    function renderCampoExpediente(c) {
        var entregado = esCampoEntregado(c);
        var card = $('<div class="emp-req-card" data-id-exp-card="' + c.id_expediente + '"></div>');
        
        var borderLeftColor = entregado ? '#22c55e' : '#e2e8f0';
        card.css('border-left', '4px solid ' + borderLeftColor);

        var cab = $('<div class="emp-req-header"></div>');
        var tituloWrap = $('<div class="d-flex align-items-center gap-2 flex-wrap"></div>');
        
        var titulo = '<h6 class="emp-req-title">' + c.nombre + '</h6>';
        tituloWrap.append(titulo);

        var tiposArr = (c.tipo_dato || '').split(',').map(function(t){ return t.trim(); }).filter(Boolean);
        $.each(tiposArr, function(i, t) {
            if (t !== 'BOOLEAN') {
                tituloWrap.append('<span class="cat-tipo-badge"><i class="bi ' + (iconosTipo[t] || 'bi-tag') + '"></i> ' + (etiquetasMap[t] || t) + '</span>');
            }
        });
        cab.append(tituloWrap);

        var rightWrap = $('<div class="d-flex align-items-center gap-2"></div>');
        
        if (entregado) {
            rightWrap.append('<span class="cat-badge-si badge-estado-doc"><i class="bi bi-check-circle"></i> Entregado</span>');
        } else {
            rightWrap.append('<span class="cat-badge-no badge-estado-doc"><i class="bi bi-x-circle"></i> Pendiente</span>');
        }

        if (c.historial) {
            rightWrap.append('<button class="emp-btn-action py-1 px-2.5 btn-ver-historial" data-id-exp="' + c.id_expediente + '" data-nombre="' + c.nombre + '" style="font-size:0.78rem;"><i class="bi bi-clock-history"></i> Historial</button>');
        }
        cab.append(rightWrap);
        card.append(cab);

        var body = $('<div class="emp-req-body"></div>');
        body.append(renderInputCampo(c));

        if (c.fecha_actualizacion && c.valor !== null) {
            body.append('<div class="text-muted small mt-2 opacity-75" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i>Última actualización: ' + c.fecha_actualizacion + '</div>');
        }

        card.append(body);
        return card;
    }

    function renderInputCampo(c) {
        var wrap = $('<div></div>');
        var idBase = 'campo_exp_' + c.id_expediente;
        var tiposArr = (c.tipo_dato || '').split(',').map(function(t){ return t.trim(); }).filter(function(t){ return t && t !== 'BOOLEAN'; });
        var rawValor = c.valor === null ? '' : c.valor;

        var valorObj = {};
        var entregado = false;

        if (rawValor.startsWith('{') && rawValor.endsWith('}')) {
            try {
                valorObj = JSON.parse(rawValor) || {};
                entregado = valorObj._entregado === '1' || valorObj._entregado === true || valorObj.BOOLEAN === '1' || valorObj.BOOLEAN === true;
            } catch(e) {
                valorObj = {};
                entregado = false;
            }
        } else {
            entregado = (rawValor === '1' || rawValor === 'true' || (rawValor !== '' && rawValor !== '0'));
            if (tiposArr.length === 1) {
                valorObj[tiposArr[0]] = rawValor;
            }
        }

        var masterSwitchId = idBase + '_master';

        var html = '<div class="exp-card-body" data-id-exp="' + c.id_expediente + '">';

        html += '<div class="emp-req-switch-container ' + (entregado ? 'is-checked' : '') + '">'
            + '<div class="form-check form-switch mb-0 fs-5 me-1">'
            + '<input class="form-check-input exp-master-switch toggle-activo" type="checkbox" ' + (entregado ? 'checked' : '')
            + ' id="' + masterSwitchId + '" data-id-exp="' + c.id_expediente + '" data-has-extras="' + (tiposArr.length > 0 ? '1' : '0') + '">'
            + '</div>'
            + '<label class="form-check-label fw-semibold mb-0 cursor-pointer ' + (entregado ? 'text-success' : 'text-secondary') + '" for="' + masterSwitchId + '" style="font-size:0.9rem;">'
            + (entregado ? 'Entregado / Cuenta con el documento' : 'No entregado / No cuenta con el documento') + '</label>'
            + '</div>';

        if (tiposArr.length > 0) {
            html += '<div class="emp-req-extras exp-extras-container ' + (entregado ? '' : 'd-none') + '">';
            html += '<div class="row g-3">';

            $.each(tiposArr, function(i, t) {
                var id = idBase + '_' + t;
                var val = valorObj[t] !== undefined ? valorObj[t] : '';
                html += '<div class="col-12">';

                switch(t) {
                    case 'DECIMAL':
                        html += '<label class="emp-form-label"><i class="bi bi-calculator me-1"></i>Número Decimal</label>'
                            + '<input type="number" class="emp-form-control exp-multi-input" data-tipo="DECIMAL" id="' + id + '" value="' + val + '" step="0.01" min="0" placeholder="0.00">';
                        break;
                    case 'TEXT':
                        html += '<label class="emp-form-label"><i class="bi bi-text-left me-1"></i>Observaciones / Texto</label>'
                            + '<textarea class="emp-form-control exp-multi-input" data-tipo="TEXT" id="' + id + '" rows="2" placeholder="Escribe la información...">' + val + '</textarea>';
                        break;
                    case 'DATE':
                        html += '<label class="emp-form-label"><i class="bi bi-calendar-event me-1"></i>Fecha</label>'
                            + '<input type="date" class="emp-form-control exp-multi-input" data-tipo="DATE" id="' + id + '" value="' + val + '">';
                        break;
                    case 'YEAR':
                        var valYear = (typeof val === 'object' && val !== null) ? val : {inicio:'', fin:''};
                        var anioActual = new Date().getFullYear();
                        html += '<label class="emp-form-label"><i class="bi bi-calendar3 me-1"></i>Vigencia (Año inicio - fin)</label>'
                            + '<div class="row g-2">'
                            + '<div class="col-6"><input type="number" class="emp-form-control exp-multi-year-inicio" id="' + id + '_inicio" value="' + (valYear.inicio || '') + '" min="1900" max="' + (anioActual + 50) + '" placeholder="Inicio (ej: 2020)"></div>'
                            + '<div class="col-6"><input type="number" class="emp-form-control exp-multi-year-fin" id="' + id + '_fin" value="' + (valYear.fin || '') + '" min="1900" max="' + (anioActual + 50) + '" placeholder="Fin (ej: 2025)"></div>'
                            + '</div>';
                        break;
                }
                html += '</div>';
            });

            html += '<div class="col-12 text-end mt-2">'
                + '<button class="emp-btn-action btn-guardar-multi-campo" data-id-exp="' + c.id_expediente + '" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d; font-weight:600;">'
                + '<i class="bi bi-save"></i> Guardar Información'
                + '</button></div>';

            html += '</div></div>';
        }

        html += '</div>';
        wrap.html(html);
        return wrap;
    }

    function guardarValor(idExp, valorNuevo, mostrarAlertaConfirmacion) {
        mostrarAlertaConfirmacion = mostrarAlertaConfirmacion !== undefined ? mostrarAlertaConfirmacion : true;

        $.post('../php/expediente_empleado.php', {
            accion: 'guardarValor',
            id_empleado: idEmpleadoActual,
            id_expediente: idExp,
            valor: valorNuevo
        }, function (r) {
            if (r.exito) {
                if (mostrarAlertaConfirmacion) {
                    window.expedienteHelpers.mostrarAlerta('Guardado', r.mensaje, 'success');
                }
                var campo = camposExpedienteActuales.find(function(c) { return c.id_expediente === idExp; });
                if (campo) {
                    campo.valor = valorNuevo;
                }
                actualizarEstadoVisual(idExp, campo);
                actualizarProgresoModal(camposExpedienteActuales);
                if (window.expedienteEmpleados) {
                    window.expedienteEmpleados.actualizarProgresoEmpleado(idEmpleadoActual);
                }
            } else {
                window.expedienteHelpers.mostrarAlerta('Error', r.mensaje, 'error');
            }
        }, 'json');
    }

    function actualizarEstadoVisual(idExp, campo) {
        var $card = $('[data-id-exp-card="' + idExp + '"]');
        var $badge = $card.find('.badge-estado-doc');
        var entregado = esCampoEntregado(campo);

        if (entregado) {
            $badge.replaceWith('<span class="cat-badge-si badge-estado-doc"><i class="bi bi-check-circle"></i> Entregado</span>');
            $card.css('border-left', '4px solid #22c55e');
        } else {
            $badge.replaceWith('<span class="cat-badge-no badge-estado-doc"><i class="bi bi-x-circle"></i> Pendiente</span>');
            $card.css('border-left', '4px solid #e2e8f0');
        }
    }

    $(document).on('change', '.exp-master-switch', function () {
        var idExp = parseInt($(this).data('id-exp'));
        var hasExtras = $(this).data('has-extras') === '1' || $(this).data('has-extras') === 1;
        var isChecked = $(this).is(':checked');
        var switchContainer = $(this).closest('.emp-req-switch-container');
        var label = switchContainer.find('label');
        var cardBody = $(this).closest('.exp-card-body');
        var extrasContainer = cardBody.find('.emp-req-extras, .exp-extras-container');

        if (isChecked) {
            label.removeClass('text-secondary').addClass('text-success').text('Entregado / Cuenta con el documento');
            switchContainer.addClass('is-checked');
            if (hasExtras) {
                extrasContainer.removeClass('d-none').addClass('d-block');
            }
            // Obtener el valor actual del campo
            var campo = camposExpedienteActuales.find(function(c) { return c.id_expediente === idExp; });
            if (campo && campo.valor && campo.valor !== '0' && campo.valor !== '') {
                try {
                    var valorObj = JSON.parse(campo.valor);
                    if (valorObj && typeof valorObj === 'object') {
                        valorObj._entregado = '1';
                        guardarValor(idExp, JSON.stringify(valorObj), false);
                    } else {
                        guardarValor(idExp, '1', false);
                    }
                } catch(e) {
                    guardarValor(idExp, '1', false);
                }
            } else {
                guardarValor(idExp, '1', false);
            }
        } else {
            label.removeClass('text-success').addClass('text-secondary').text('No entregado / No cuenta con el documento');
            switchContainer.removeClass('is-checked');
            if (hasExtras) {
                extrasContainer.removeClass('d-block').addClass('d-none');
            }
            // Obtener el valor actual del campo
            var campo = camposExpedienteActuales.find(function(c) { return c.id_expediente === idExp; });
            if (campo && campo.valor && campo.valor !== '0' && campo.valor !== '') {
                try {
                    var valorObj = JSON.parse(campo.valor);
                    if (valorObj && typeof valorObj === 'object') {
                        valorObj._entregado = '0';
                        guardarValor(idExp, JSON.stringify(valorObj), false);
                    } else {
                        guardarValor(idExp, '0', false);
                    }
                } catch(e) {
                    guardarValor(idExp, '0', false);
                }
            } else {
                guardarValor(idExp, '0', false);
            }
        }
    });

    $(document).on('click', '.btn-guardar-multi-campo', function () {
        var idExp = parseInt($(this).data('id-exp'));
        var cardBody = $(this).closest('.exp-card-body');
        var isChecked = cardBody.find('.exp-master-switch').is(':checked');
        var resObj = { _entregado: isChecked ? '1' : '0' };
        var hasError = false;

        cardBody.find('.exp-multi-input').each(function() {
            var tipo = $(this).data('tipo');
            resObj[tipo] = $.trim($(this).val());
        });

        var yearIni = cardBody.find('.exp-multi-year-inicio');
        var yearFin = cardBody.find('.exp-multi-year-fin');
        if (yearIni.length > 0) {
            var ini = $.trim(yearIni.val());
            var fin = $.trim(yearFin.val());
            if (ini || fin) {
                if (ini && fin && parseInt(ini) > parseInt(fin)) {
                    window.expedienteHelpers.mostrarAlerta('Aviso', 'El año de inicio no puede ser mayor al de fin.', 'warning');
                    hasError = true;
                    return false;
                }
                resObj['YEAR'] = { 
                    inicio: ini ? parseInt(ini) : '', 
                    fin: fin ? parseInt(fin) : '' 
                };
            } else {
                resObj['YEAR'] = { inicio: '', fin: '' };
            }
        }

        if (hasError) return;

        guardarValor(idExp, JSON.stringify(resObj), true);
    });

    // Botón Concluir Revisión
    $(document).on('click', '[data-bs-dismiss="modal"]', function() {
        if ($(this).closest('#modalExpedienteEmpleado').length > 0 && idEmpleadoActual > 0) {
            // Actualizar progreso en la tabla al cerrar el modal
            if (window.expedienteEmpleados) {
                window.expedienteEmpleados.actualizarProgresoEmpleado(idEmpleadoActual);
            }
        }
    });
});
