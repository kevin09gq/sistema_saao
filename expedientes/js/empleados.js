$(document).ready(function () {

    var empleadosTodos = [];
    var resumenProgresos = { total_requisitos: 0, catalogo_activo: [], progresos: {} };
    var paginaActualEmp = 1;
    var elementosPorPagina = 15;
    var departamentosTodos = [];

    function cargarAreas() {
        $.getJSON('../../public/php/obtenerAreas.php', function (areas) {
            var sel = $('#filtroAreaEmp').html('<option value="-1">Todas las áreas</option>');
            $.each(areas, function (i, a) { sel.append('<option value="' + a.id_area + '">' + a.nombre_area + '</option>'); });
            sel.on('change', function () {
                paginaActualEmp = 1;
                filtrarDepartamentosPorArea();
                renderEmpleados();
            });
            cargarDepartamentosExp();
        });
    }

    function cargarDepartamentosExp() {
        $.getJSON('../php/expediente_empleado.php', { accion: 'obtenerDepartamentos' }, function (deptos) {
            departamentosTodos = deptos || [];
            var sel = $('#filtroDeptoEmp').html('<option value="-1">Todos los depto.</option>');
            $.each(departamentosTodos, function (i, d) { sel.append('<option value="' + d.id_departamento + '" data-id-area="' + (d.id_area || '') + '">' + d.nombre_departamento + '</option>'); });
            sel.on('change', function () { paginaActualEmp = 1; renderEmpleados(); });
            cargarRequisitosFiltro();
        });
    }

    function filtrarDepartamentosPorArea() {
        var idArea = parseInt($('#filtroAreaEmp').val());
        var sel = $('#filtroDeptoEmp');
        var valorActual = sel.val();
        
        sel.html('<option value="-1">Todos los depto.</option>');
        
        if (idArea === -1) {
            // Mostrar todos los departamentos
            $.each(departamentosTodos, function (i, d) {
                sel.append('<option value="' + d.id_departamento + '" data-id-area="' + (d.id_area || '') + '">' + d.nombre_departamento + '</option>');
            });
        } else {
            // Mostrar solo departamentos de esa área
            $.each(departamentosTodos, function (i, d) {
                if (parseInt(d.id_area) === idArea) {
                    sel.append('<option value="' + d.id_departamento + '" data-id-area="' + (d.id_area || '') + '">' + d.nombre_departamento + '</option>');
                }
            });
        }
        
        // Si el valor seleccionado ya no existe, resetear a -1
        if (valorActual !== '-1' && !sel.find('option[value="' + valorActual + '"]').length) {
            sel.val('-1');
        } else {
            sel.val(valorActual);
        }
    }

    function cargarRequisitosFiltro() {
        $.getJSON('../php/catalogo_expediente.php', { accion: 'listar', soloActivos: '1' }, function (res) {
            var sel = $('#filtroFaltaRequisitoEmp').html('<option value="-1">Cualquier requisito</option>');
            if (res.exito && res.datos) {
                $.each(res.datos, function (i, c) {
                    sel.append('<option value="' + c.id_expediente + '">Le falta: ' + c.nombre + '</option>');
                });
            }
            sel.off('change').on('change', function () { paginaActualEmp = 1; renderEmpleados(); });
            cargarEmpleadosTodos();
        });
    }

    function cargarResumenProgresos(callback) {
        $.getJSON('../php/expediente_empleado.php', { accion: 'obtenerResumenProgresos' }, function (res) {
            if (res.exito) {
                resumenProgresos = res;
            }
            if (typeof callback === 'function') callback();
        });
    }

    function cargarEmpleadosTodos() {
        $.getJSON('../php/obtener_empleados_expedientes.php?accion=cargarEmpleados', function (emps) {
            empleadosTodos = emps || [];
            cargarResumenProgresos(function() {
                paginaActualEmp = 1;
                renderEmpleados();
            });
        });
    }

    function filtrarEmpleadosExp() {
        var texto = $('#buscadorEmpExp').val().toLowerCase().trim();
        var idArea = parseInt($('#filtroAreaEmp').val());
        var idDepto = parseInt($('#filtroDeptoEmp').val());
        var filtroAvance = $('#filtroAvanceEmp').val() || 'todos';
        var idFaltaReq = parseInt($('#filtroFaltaRequisitoEmp').val());

        return empleadosTodos.filter(function (e) {
            if (idArea !== -1 && parseInt(e.id_area) !== idArea) return false;
            if (idDepto !== -1 && parseInt(e.id_departamento) !== idDepto) return false;
            
            if (texto) {
                var nom = (e.nombre + ' ' + e.ap_paterno + ' ' + e.ap_materno).toLowerCase();
                if (!nom.includes(texto) && !(e.clave_empleado || '').toLowerCase().includes(texto)) return false;
            }

            var idEmp = parseInt(e.id_empleado);
            var infoEmp = resumenProgresos.progresos[idEmp];
            var totalReq = resumenProgresos.total_requisitos || 0;
            var entregadosMap = infoEmp ? (infoEmp.entregados || {}) : {};
            var numEntregados = Object.keys(entregadosMap).length;
            var pct = totalReq > 0 ? Math.round((numEntregados / totalReq) * 100) : 0;

            if (filtroAvance === 'completos' && (pct < 100 || totalReq === 0)) return false;
            if (filtroAvance === 'incompletos' && (pct === 100 || totalReq === 0)) return false;
            if (filtroAvance === 'sin_documentos' && numEntregados > 0) return false;

            if (idFaltaReq !== -1) {
                // Si ya entregó este documento, NO le falta -> excluir
                if (entregadosMap[idFaltaReq]) return false;
            }

            return true;
        });
    }

    function renderEmpleados() {
        var lista = filtrarEmpleadosExp();
        var tbody = $('#cuerpoEmpleadosExp').empty();
        var totalPaginas = Math.max(1, Math.ceil(lista.length / elementosPorPagina));
        if (paginaActualEmp > totalPaginas) paginaActualEmp = totalPaginas;
        var desde = (paginaActualEmp - 1) * elementosPorPagina;
        var hasta = Math.min(desde + elementosPorPagina, lista.length);
        var pagina = lista.slice(desde, hasta);

        // Info de registros
        if (lista.length > 0) {
            $('#infoEmpExp').text('Mostrando ' + (desde + 1) + '–' + hasta + ' de ' + lista.length + ' empleados');
        } else {
            $('#infoEmpExp').text('');
        }

        if (pagina.length === 0) {
            tbody.append('<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-person-slash fs-3 d-block mb-2 text-muted opacity-50"></i>No hay empleados que coincidan con los filtros aplicados.</td></tr>');
        } else {
            $.each(pagina, function (i, e) {
                var nombre = e.nombre + ' ' + e.ap_paterno + ' ' + e.ap_materno;
                var partes = nombre.trim().split(' ');
                var iniciales = (partes[0] ? partes[0][0] : '') + (partes[1] ? partes[1][0] : '');
                iniciales = iniciales.toUpperCase();

                var idEmp = parseInt(e.id_empleado);
                var infoEmp = resumenProgresos.progresos[idEmp];
                var totalReq = resumenProgresos.total_requisitos || 0;
                var entregadosMap = infoEmp ? (infoEmp.entregados || {}) : {};
                var numEntregados = Object.keys(entregadosMap).length;
                var pct = totalReq > 0 ? Math.round((numEntregados / totalReq) * 100) : 0;

                var tr = $('<tr></tr>');

                // Clave
                tr.append('<td><span class="emp-clave-badge">' + e.clave_empleado + '</span></td>');

                // Empleado con iniciales
                tr.append(
                    '<td><div class="emp-info-cell">'
                    + '<div class="emp-initials">' + iniciales + '</div>'
                    + '<div><div class="emp-name-main">' + nombre + '</div></div>'
                    + '</div></td>'
                );

                // Departamento
                tr.append('<td><span class="emp-dept-label">' + (e.nombre_departamento || 'Sin depto.') + '</span></td>');

                // Área
                tr.append('<td><span class="emp-area-label">' + (e.nombre_area || 'Sin área') + '</span></td>');

                // Progreso
                var progresoHtml = '<div class="emp-progress-wrapper">'
                    + '<div class="d-flex align-items-center gap-2 mb-1">'
                    + '<span class="emp-progress-text small fw-bold" data-id-emp="' + idEmp + '"></span>'
                    + '</div>'
                    + '<div class="emp-progress-track">'
                    + '<div class="emp-progress-bar" data-id-emp="' + idEmp + '" style="width:0%;"></div>'
                    + '</div>'
                    + '</div>';
                tr.append('<td>' + progresoHtml + '</td>');

                // Botón acción
                tr.append(
                    '<td class="text-end"><button class="emp-btn-action btn-ver-expediente" '
                    + 'data-id="' + e.id_empleado + '" data-nombre="' + nombre + '" data-clave="' + e.clave_empleado + '" '
                    + 'data-depto="' + (e.nombre_departamento || '') + '" data-status="' + e.nombre_status + '">'
                    + '<i class="bi bi-folder2-open"></i> Ver Expediente</button></td>'
                );

                tbody.append(tr);
                actualizarBarraProgreso(idEmp, pct, numEntregados + '/' + totalReq);
            });
        }
        renderPaginacion(lista.length, totalPaginas);
    }
    
    function actualizarBarraProgreso(idEmpleado, porcentaje, texto) {
        var $barra = $('.emp-progress-bar[data-id-emp="' + idEmpleado + '"]');
        var $texto = $('.emp-progress-text[data-id-emp="' + idEmpleado + '"]');

        $barra.css('width', porcentaje + '%');
        $barra.removeClass('color-success color-warning color-danger');

        if (porcentaje === 100) {
            $barra.addClass('color-success');
            $texto.removeClass('text-danger text-warning').addClass('text-success');
        } else if (porcentaje >= 50) {
            $barra.addClass('color-warning');
            $texto.removeClass('text-danger text-success').addClass('text-warning');
        } else {
            $barra.addClass('color-danger');
            $texto.removeClass('text-success text-warning').addClass('text-danger');
        }

        $texto.text(texto + ' (' + porcentaje + '%)');
    }

    function renderPaginacion(total, totalPaginas) {
        var ul = $('#paginacionEmpExp').empty();
        if (totalPaginas <= 1) return;
        var mkLi = function (label, page, disabled, active) {
            return '<li class="page-item ' + (disabled ? 'disabled' : '') + (active ? ' active' : '') + '"><button class="page-link" data-page="' + page + '">' + label + '</button></li>';
        };
        ul.append(mkLi('«', Math.max(1, paginaActualEmp - 1), paginaActualEmp === 1, false));
        for (var p = 1; p <= totalPaginas; p++) {
            if (p === 1 || p === totalPaginas || (p >= paginaActualEmp - 1 && p <= paginaActualEmp + 1)) {
                ul.append(mkLi(p, p, false, p === paginaActualEmp));
            } else if (p === paginaActualEmp - 2 || p === paginaActualEmp + 2) {
                ul.append('<li class="page-item disabled"><span class="page-link">…</span></li>');
            }
        }
        ul.append(mkLi('»', Math.min(totalPaginas, paginaActualEmp + 1), paginaActualEmp === totalPaginas, false));
        ul.find('button.page-link[data-page]').on('click', function () {
            paginaActualEmp = parseInt($(this).data('page'));
            renderEmpleados();
        });
    }

    $('#buscadorEmpExp').on('input', function () { paginaActualEmp = 1; renderEmpleados(); });
    $('#filtroAvanceEmp').on('change', function () { paginaActualEmp = 1; renderEmpleados(); });

    $('#btnLimpiarEmpExp').on('click', function () {
        $('#buscadorEmpExp').val('');
        $('#filtroAreaEmp').val('-1');
        $('#filtroDeptoEmp').val('-1');
        $('#filtroAvanceEmp').val('todos');
        $('#filtroFaltaRequisitoEmp').val('-1');
        paginaActualEmp = 1;
        renderEmpleados();
    });

    // =========================================================
    // EXPORTACIÓN A EXCEL (GENERAL Y PERSONALIZADA)
    // =========================================================

    // 1. Exportar General (1-Clic)
    $('#btnExportarGeneral').on('click', function () {
        var idArea = $('#filtroAreaEmp').val() || '-1';
        var idDepto = $('#filtroDeptoEmp').val() || '-1';
        var filtroAvance = $('#filtroAvanceEmp').val() || 'todos';
        var idFaltaReq = $('#filtroFaltaRequisitoEmp').val() || '-1';

        var url = '../php/exportar_excel.php?tipo_exportacion=general'
            + '&id_area=' + encodeURIComponent(idArea)
            + '&id_departamento=' + encodeURIComponent(idDepto)
            + '&filtro_avance=' + encodeURIComponent(filtroAvance)
            + '&id_falta_requisito=' + encodeURIComponent(idFaltaReq)
            + '&_t=' + new Date().getTime();

        Swal.fire({
            title: 'Generando Archivo',
            text: 'Preparando el Excel, la descarga comenzará en breve...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: function() {
                Swal.showLoading();
            }
        });

        setTimeout(function() {
            window.location.href = url;
            // Cerrar la alerta después de 2 segundos (tiempo estimado para iniciar descarga)
            setTimeout(function() {
                Swal.close();
            }, 2000);
        }, 800);
    });

    // 2. Exportar Personalizado (Modal Configurable)
    $('#btnExportarPersonalizado').on('click', function () {
        syncModalFiltros();
        cargarCheckboxesRequisitosModal();
        var modalEl = document.getElementById('modalExportarExcel');
        var modalObj = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalObj.show();
    });

    function syncModalFiltros() {
        // Copiar opciones de Área y Departamento
        var selAreaModal = $('#expModalArea').html($('#filtroAreaEmp').html());
        selAreaModal.val($('#filtroAreaEmp').val());

        filtrarDepartamentosModal();

        $('#expModalAvance').val($('#filtroAvanceEmp').val());
        $('#expModalStatus').val('-1');
    }

    $('#expModalArea').on('change', function () {
        filtrarDepartamentosModal();
    });

    function filtrarDepartamentosModal() {
        var idArea = parseInt($('#expModalArea').val());
        var selDeptoModal = $('#expModalDepto').html('<option value="-1">Todos los departamentos</option>');

        if (idArea === -1) {
            $.each(departamentosTodos, function (i, d) {
                selDeptoModal.append('<option value="' + d.id_departamento + '">' + d.nombre_departamento + '</option>');
            });
        } else {
            $.each(departamentosTodos, function (i, d) {
                if (parseInt(d.id_area) === idArea) {
                    selDeptoModal.append('<option value="' + d.id_departamento + '">' + d.nombre_departamento + '</option>');
                }
            });
        }

        var deptoActual = $('#filtroDeptoEmp').val();
        if (deptoActual !== '-1' && selDeptoModal.find('option[value="' + deptoActual + '"]').length) {
            selDeptoModal.val(deptoActual);
        } else {
            selDeptoModal.val('-1');
        }
    }

    function cargarCheckboxesRequisitosModal() {
        var cont = $('#contenedorCheckboxesReq').html('<div class="py-4 text-center text-muted small"><div class="spinner-border spinner-border-sm text-success me-2"></div>Cargando catálogo de requisitos...</div>');

        $.getJSON('../php/catalogo_expediente.php', { accion: 'listar', soloActivos: '1' }, function (res) {
            cont.empty();
            if (res.exito && res.datos && res.datos.length > 0) {
                $.each(res.datos, function (i, c) {
                    var idExp = c.id_expediente;
                    var tipoDato = c.tipo_dato || '';
                    var tiposArr = tipoDato.split(',').map(function(s){ return s.trim(); }).filter(function(t){ return t && t !== 'BOOLEAN'; });
                    var hasExtras = tiposArr.length > 0;

                    // Fila principal: checkbox + nombre + botón flecha (si tiene extras)
                    var rowHtml = '<div class="exp-req-row" id="row_exp_' + idExp + '">'
                        + '<div class="exp-req-main">'
                        + '<input class="form-check-input chk-req-export" type="checkbox" name="columnas[]" value="' + idExp + '" id="chk_exp_' + idExp + '" checked data-id-exp="' + idExp + '">'
                        + '<label for="chk_exp_' + idExp + '">' + c.nombre + '</label>'
                        + (hasExtras
                            ? '<span class="exp-req-toggle-btn" data-target="extras_' + idExp + '" title="Ver/Ocultar campos extras">'
                              + '<i class="bi bi-layers me-1"></i>Campos extras'
                              + '<i class="bi bi-chevron-right toggle-arrow"></i>'
                              + '</span>'
                            : '')
                        + '</div>';

                    // Panel de campos extras (oculto por defecto)
                    if (hasExtras) {
                        rowHtml += '<div class="exp-req-extras sub-extras-container" id="extras_' + idExp + '" data-id-exp="' + idExp + '">';
                        $.each(tiposArr, function(j, t) {
                            var lbl = 'Detalle';
                            var ico = 'bi-file-earmark-text';
                            if (t === 'DATE')    { lbl = 'Fecha';          ico = 'bi-calendar-event'; }
                            if (t === 'YEAR')    { lbl = 'Vigencia';       ico = 'bi-calendar3'; }
                            if (t === 'DECIMAL') { lbl = 'Cantidad';       ico = 'bi-calculator'; }
                            if (t === 'TEXT')    { lbl = 'Observaciones';  ico = 'bi-file-earmark-text'; }

                            rowHtml += '<label class="exp-req-extra-item" for="chk_sub_' + idExp + '_' + t + '" title="Clic para activar/desactivar">'
                                + '<input class="chk-subextra-export" type="checkbox" name="extra_fields[' + idExp + '][]" value="' + t + '" id="chk_sub_' + idExp + '_' + t + '" checked>'
                                + '<i class="bi ' + ico + '"></i><span>' + lbl + '</span>'
                                + '</label>';
                        });
                        rowHtml += '</div>';
                    }

                    rowHtml += '</div>';
                    cont.append(rowHtml);
                });

                // Inicializar estado de los chips tras renderizar
                cont.find('.exp-req-extra-item input:checked').closest('.exp-req-extra-item').addClass('is-checked');

            } else {
                cont.html('<div class="py-4 text-center text-muted small"><i class="bi bi-info-circle me-1"></i>No hay requisitos activos en el catálogo.</div>');
            }
        });
    }

    // ── Desplegar/ocultar panel de campos extras al hacer clic en el botón flecha
    $(document).on('click', '.exp-req-toggle-btn', function (e) {
        e.stopPropagation();
        var targetId = $(this).data('target');
        var panel = $('#' + targetId);
        var isOpen = panel.hasClass('is-open');

        panel.toggleClass('is-open', !isOpen);
        $(this).toggleClass('open', !isOpen);
    });

    // ── Toggle del chip: activar/desactivar campo extra al hacer clic
    $(document).on('change', '.chk-subextra-export', function () {
        var item = $(this).closest('.exp-req-extra-item');
        item.toggleClass('is-checked', $(this).is(':checked'));
        item.toggleClass('is-unchecked', !$(this).is(':checked'));
    });

    // ── Desmarca/marca requisito principal → actualiza chips y deshabilita/habilita
    $(document).on('change', '.chk-req-export', function () {
        var idExp = $(this).data('id-exp');
        var isChecked = $(this).is(':checked');
        var row = $('#row_exp_' + idExp);
        var extrasPanel = $('#extras_' + idExp);

        row.toggleClass('is-unchecked', !isChecked);

        extrasPanel.find('.chk-subextra-export').prop('checked', isChecked).prop('disabled', !isChecked);
        extrasPanel.find('.exp-req-extra-item')
            .toggleClass('is-checked', isChecked)
            .toggleClass('is-unchecked', false);
    });

    // ── Botón Seleccionar Todos
    $('#btnSeleccionarTodosReq').on('click', function () {
        $('#contenedorCheckboxesReq .chk-req-export').prop('checked', true);
        $('#contenedorCheckboxesReq .exp-req-row').removeClass('is-unchecked');
        $('#contenedorCheckboxesReq .chk-subextra-export').prop('checked', true).prop('disabled', false);
        $('#contenedorCheckboxesReq .exp-req-extra-item').addClass('is-checked').removeClass('is-unchecked');
    });

    // ── Botón Desmarcar Todos
    $('#btnDesmarcarTodosReq').on('click', function () {
        $('#contenedorCheckboxesReq .chk-req-export').prop('checked', false);
        $('#contenedorCheckboxesReq .exp-req-row').addClass('is-unchecked');
        $('#contenedorCheckboxesReq .chk-subextra-export').prop('checked', false).prop('disabled', true);
        $('#contenedorCheckboxesReq .exp-req-extra-item').removeClass('is-checked');
    });

    $('#formExportarExcel').on('submit', function (e) {
        var seleccionados = $('#contenedorCheckboxesReq .chk-req-export:checked').length;
        if (seleccionados === 0) {
            e.preventDefault();
            if (window.expedienteHelpers) {
                window.expedienteHelpers.mostrarAlerta('Selección requerida', 'Debes seleccionar al menos un requisito para exportar al archivo Excel.', 'warning');
            } else {
                alert('Debes seleccionar al menos un requisito para exportar.');
            }
            return false;
        }

        // Si pasa la validación, mostrar alerta de carga con animación y cerrar modal
        var modalEl = document.getElementById('modalExportarExcel');
        var modalObj = bootstrap.Modal.getInstance(modalEl);
        if (modalObj) modalObj.hide();

        Swal.fire({
            title: 'Generando Archivo',
            text: 'Preparando el Excel personalizado, la descarga comenzará en breve...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: function() {
                Swal.showLoading();
            }
        });

        // Cerrar la alerta después de 3 segundos (tiempo estimado para iniciar descarga)
        setTimeout(function() {
            Swal.close();
        }, 3000);
    });

    function recargarTodoElModulo() {
        cargarRequisitosFiltro();
    }

    $(document).on('shown.bs.tab', '#empleados-tab', function () {
        recargarTodoElModulo();
    });

    window.expedienteEmpleados = {
        actualizarProgresoEmpleado: recargarTodoElModulo,
        actualizarTodos: recargarTodoElModulo,
        recargarExpedientes: recargarTodoElModulo
    };

    cargarAreas();
});
