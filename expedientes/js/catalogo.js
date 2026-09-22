$(document).ready(function () {

    var ayudasTipo = {
        BOOLEAN: 'Ideal para: ¿Entregó RFC?, ¿Aprobado?, ¿Completo? Muestra opciones Sí / No.',
        DECIMAL: 'Ideal para: Estatura (1.75), Peso (72.5), Sueldo diario. Con 2 decimales.',
        TEXT: 'Ideal para: Observaciones, Número de INE, Domicilio, Comentarios.',
        DATE: 'Ideal para: Fecha de vencimiento, Fecha de entrega, Cumpleaños. Formato AAAA-MM-DD.',
        YEAR: 'Ideal para: Vigencia de INE, año de emisión. Solo guarda el año (ej: 2024).'
    };

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
        TEXT: 'Texto',
        DATE: 'Fecha Completa',
        YEAR: 'Año'
    };

    function cargarCatalogo() {
        $.getJSON('../php/catalogo_expediente.php', { accion: 'listar' }, function (res) {
            var tbody = $('#cuerpoCatalogo').empty();
            if (!res.exito || !res.datos || res.datos.length === 0) {
                tbody.append('<tr><td colspan="4" class="text-center text-muted py-5"><i class="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>No hay campos registrados. Agrega el primero.</td></tr>');
                return;
            }
            $.each(res.datos, function (i, c) {
                var tr = $('<tr></tr>');

                // Nombre + badges de tipo
                var nombreHtml = '<div class="cat-campo-cell">';
                nombreHtml += '<div class="cat-campo-nombre">';
                nombreHtml += c.nombre + '</div>';

                var tiposArr = (c.tipo_dato || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
                if (tiposArr.length > 0) {
                    var tiposLabels = tiposArr.map(function (t) {
                        return '<span class="cat-tipo-badge"><i class="bi ' + (iconosTipo[t] || 'bi-tag') + '"></i> ' + (etiquetasMap[t] || t) + '</span>';
                    }).join('');
                    nombreHtml += '<div class="cat-tipos-row">' + tiposLabels + '</div>';
                }
                nombreHtml += '</div>';
                tr.append('<td>' + nombreHtml + '</td>');

                // Historial badge
                tr.append('<td class="text-center">' + (c.historial
                    ? '<span class="cat-badge-si"><i class="bi bi-clock-history"></i> Sí</span>'
                    : '<span class="cat-badge-no">No</span>') + '</td>');

                // Toggle activo
                var checkActivo = '<div class="form-check form-switch d-flex justify-content-center"><input class="form-check-input toggle-activo" type="checkbox" '
                    + (c.activo ? 'checked' : '') + ' data-id="' + c.id_expediente + '"></div>';
                tr.append('<td class="text-center">' + checkActivo + '</td>');

                // Acciones
                var acciones = '<div class="d-flex justify-content-end gap-2">'
                    + '<button class="cat-btn-icon cat-btn-edit btn-editar" title="Editar" data-id="' + c.id_expediente + '"><i class="bi bi-pencil"></i></button>'
                    + '<button class="cat-btn-icon cat-btn-delete btn-eliminar" title="Eliminar" data-id="' + c.id_expediente + '"><i class="bi bi-trash"></i></button>'
                    + '</div>';
                tr.append('<td class="text-end">' + acciones + '</td>');

                tbody.append(tr);
            });
        });
    }

    var tiposSeleccionados = [];

    function toggleTipoDato(tipo) {
        var idx = tiposSeleccionados.indexOf(tipo);
        if (idx === -1) {
            tiposSeleccionados.push(tipo);
        } else {
            tiposSeleccionados.splice(idx, 1);
        }
        actualizarTarjetasTipo();
    }

    function actualizarTarjetasTipo() {
        $('.tipo-dato-card').each(function () {
            var t = $(this).data('tipo');
            $(this).toggleClass('selected', tiposSeleccionados.indexOf(t) !== -1);
        });
        var hints = tiposSeleccionados.map(function (t) { return ayudasTipo[t] ? '• ' + ayudasTipo[t] : ''; }).filter(Boolean).join('<br>');
        if (hints) {
            $('#ayudaTipoDatoTexto').html(hints);
            $('#ayudaTipoDato').removeClass('d-none');
        } else {
            $('#ayudaTipoDato').addClass('d-none');
        }
    }

    $(document).on('click', '.tipo-dato-card', function () {
        toggleTipoDato($(this).data('tipo'));
    });

    function limpiarTogglecards() {
        $('#cardHistorial').removeClass('activo');
        $('#modal_historial').prop('checked', false);
    }

    function abrirModalNuevo() {
        tiposSeleccionados = [];
        $('#modal_id_expediente').val(0);
        $('#tituloModalCampo').html('Nuevo Campo del Expediente');
        $('#formCampoCatalogo')[0].reset();
        actualizarTarjetasTipo();
        limpiarTogglecards();
        new bootstrap.Modal(document.getElementById('modalCampoCatalogo')).show();
    }

    function abrirModalEditar(id) {
        $.getJSON('../php/catalogo_expediente.php', { accion: 'listar' }, function (res) {
            if (!res.exito) return;
            var campo = res.datos.find(function (c) { return c.id_expediente === id; });
            if (!campo) return;
            tiposSeleccionados = (campo.tipo_dato || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
            $('#modal_id_expediente').val(campo.id_expediente);
            $('#tituloModalCampo').html('Editar Campo del Expediente');
            $('#modal_nombre').val(campo.nombre);
            actualizarTarjetasTipo();
            $('#modal_historial').prop('checked', !!campo.historial);
            $('#cardHistorial').toggleClass('activo', !!campo.historial);
            new bootstrap.Modal(document.getElementById('modalCampoCatalogo')).show();
        });
    }

    $(document).on('change', '#modal_historial', function () {
        $('#cardHistorial').toggleClass('activo', $(this).is(':checked'));
    });
    $(document).on('click', '#cardHistorial', function (e) {
        if (!$(e.target).is('input')) {
            var chk = $('#modal_historial');
            chk.prop('checked', !chk.prop('checked')).trigger('change');
        }
    });

    $('#btnAgregarCampo').on('click', abrirModalNuevo);

    $(document).on('click', '.btn-editar', function () {
        abrirModalEditar(parseInt($(this).data('id')));
    });

    $(document).on('click', '.btn-eliminar', function () {
        var id = parseInt($(this).data('id'));
        window.expedienteHelpers.confirmarAccion('¿Eliminar este campo?', 'Se eliminará permanentemente y no se podrá recuperar. Los datos de los empleados asociados también se borrarán.', function () {
            $.post('../php/catalogo_expediente.php', { accion: 'eliminar', id_expediente: id }, function (r) {
                if (r.exito) {
                    window.expedienteHelpers.mostrarAlerta('Eliminado', r.mensaje, 'success');
                    cargarCatalogo();
                    if (window.expedienteEmpleados) window.expedienteEmpleados.actualizarTodos();
                } else {
                    window.expedienteHelpers.mostrarAlerta('Error', r.mensaje, 'error');
                }
            }, 'json');
        });
    });

    $(document).on('change', '.toggle-activo', function () {
        var id = parseInt($(this).data('id'));
        $.post('../php/catalogo_expediente.php', { accion: 'toggleActivo', id_expediente: id }, function () {
            cargarCatalogo();
            if (window.expedienteEmpleados) window.expedienteEmpleados.actualizarTodos();
        }, 'json');
    });

    $('#formCampoCatalogo').on('submit', function (e) {
        e.preventDefault();
        var nombre = $('#modal_nombre').val().trim();
        var historial = $('#modal_historial').is(':checked') ? 1 : 0;
        var idExpediente = parseInt($('#modal_id_expediente').val());

        if (!nombre) { window.expedienteHelpers.mostrarAlerta('Aviso', 'El nombre del campo es obligatorio', 'warning'); return; }

        var tipoDatoStr = tiposSeleccionados.join(',');

        var $btnGuardar = $('#formCampoCatalogo').find('[type=submit]');
        $btnGuardar.prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i>Guardando...');

        $.post('../php/catalogo_expediente.php', {
            accion: 'guardar',
            id_expediente: idExpediente,
            nombre: nombre,
            tipo_dato: tipoDatoStr,
            historial: historial
        }, function (r) {
            $btnGuardar.prop('disabled', false).html('<i class="bi bi-save2 me-1"></i>Guardar Campo');
            if (r.exito) {
                bootstrap.Modal.getInstance(document.getElementById('modalCampoCatalogo')).hide();
                window.expedienteHelpers.mostrarAlerta('Guardado', r.mensaje, 'success');
                cargarCatalogo();
                // Actualizar automáticamente la vista y progreso de empleados
                if (window.expedienteEmpleados) {
                    window.expedienteEmpleados.actualizarTodos();
                }
            } else {
                window.expedienteHelpers.mostrarAlerta('Error', r.mensaje, 'error');
            }
        }, 'json').fail(function (jqXHR, textStatus, errorThrown) {
            $btnGuardar.prop('disabled', false).html('<i class="bi bi-save2 me-1"></i>Guardar Campo');
            window.expedienteHelpers.mostrarAlerta('Error de servidor', 'No se pudo guardar la información (' + textStatus + ')', 'error');
        });
    });

    cargarCatalogo();
});
