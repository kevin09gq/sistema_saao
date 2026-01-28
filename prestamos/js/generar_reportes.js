$(document).ready(function () {

    function getParams() {
        const anio = parseInt($('#reporte-anio').val() || '0');
        const semana = parseInt($('#reporte-semana').val() || '0');
        return { anio, semana };
    }

    function validar(anio, semana) {
        if (!anio || anio < 2000) {
            Swal.fire({
                title: 'Falta año',
                text: 'Selecciona un año válido.',
                icon: 'warning'
            });
            return false;
        }
        if (!semana || semana < 1 || semana > 53) {
            Swal.fire({
                title: 'Falta semana',
                text: 'Captura un número de semana válido (1-53).',
                icon: 'warning'
            });
            return false;
        }
        return true;
    }

    function formatoMoneda(valor) {
        return '$' + parseFloat(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }


    // **************************************************************************************************************************

    /**
     * ===========================
     * Sección para generar EXCEL
     * ===========================
     */

    // Generar Excel
    $('#btn-reporte-excel').on('click', function () {
        const { anio, semana } = getParams();
        if (!validar(anio, semana)) return;
        const url = `generarExcelsemana.php?anio=${encodeURIComponent(anio)}&semana=${encodeURIComponent(semana)}`;
        window.location.href = url;
    });

    // Previsualizar Reporte
    $('#btn-reporte-previsualizar').on('click', function () {
        const { anio, semana } = getParams();
        if (!validar(anio, semana)) return;

        const $btn = $(this);
        const $contenedor = $('#previsualizar');

        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Cargando...');
        $contenedor.html('<div class="text-center py-3"><div class="spinner-border text-success" role="status"></div><p class="mt-2">Cargando datos...</p></div>');

        $.ajax({
            url: 'previsualizarReporte.php',
            type: 'GET',
            data: { anio, semana },
            dataType: 'json',
            success: function (response) {
                if (!response.success) {
                    $contenedor.html(`
                        <div class="alert alert-warning mt-3" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${response.message}
                        </div>
                    `);
                    return;
                }

                const deptCols = response.dept_cols || [];
                const colspanDept = deptCols.length > 0 ? deptCols.length : 0;

                // Construir encabezados dinámicos
                let headersDept = deptCols.map(dc => `<th class="text-end text-nowrap" style="font-size: 0.75rem;">${dc}</th>`).join('');

                let html = `
                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="mb-0"><i class="bi bi-table me-2"></i>Vista previa - Semana ${response.semana} (${response.anio})</h6>
                            <span class="badge bg-success">${response.total_registros} registro(s)</span>
                        </div>
                        <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
                            <table class="table table-sm table-bordered mb-0" style="font-size: 0.85rem;">
                                <thead class="sticky-top">
                                    <tr>
                                        <th class="bg-warning text-dark">N°.SEM</th>
                                        <th class="bg-warning text-dark">COLABORADOR</th>
                                        <th class="bg-dark text-white text-end">DEUDA</th>
                                        ${headersDept}
                                        <th class="bg-warning text-dark text-end">ANTICIPO</th>
                                        <th class="bg-warning text-dark text-end">DESCUENTO</th>
                                        <th class="bg-dark text-white text-end">POR PAGAR</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

                response.data.forEach((row) => {
                    // Generar celdas de departamentos (solo el que corresponde tiene el monto)
                    let cellsDept = deptCols.map(dc => {
                        const val = (dc === row.dept_label) ? formatoMoneda(row.descuento) : '';
                        return `<td class="text-end">${val}</td>`;
                    }).join('');

                    html += `
                        <tr>
                            <td class="text-center">${response.semana}</td>
                            <td>${row.colaborador}</td>
                            <td class="text-end" style="background-color: #d8c8f8;">${formatoMoneda(row.deuda)}</td>
                            ${cellsDept}
                            <td class="text-end"></td>
                            <td class="text-end">${formatoMoneda(row.descuento)}</td>
                            <td class="text-end" style="background-color: #c8f8c8;">${formatoMoneda(row.por_pagar)}</td>
                        </tr>
                    `;
                });

                // Generar celdas de totales por departamento
                let totalsDept = deptCols.map(dc => {
                    const val = response.totales.por_dept && response.totales.por_dept[dc]
                        ? formatoMoneda(response.totales.por_dept[dc])
                        : formatoMoneda(0);
                    return `<td class="text-end">${val}</td>`;
                }).join('');

                html += `
                                </tbody>
                                <tfoot class="fw-bold" style="background-color: #fde9d9;">
                                    <tr>
                                        <td></td>
                                        <td>TOTALES</td>
                                        <td class="text-end">${formatoMoneda(response.totales.deuda)}</td>
                                        ${totalsDept}
                                        <td class="text-end"></td>
                                        <td class="text-end">${formatoMoneda(response.totales.descuento)}</td>
                                        <td class="text-end">${formatoMoneda(response.totales.por_pagar)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `;

                $contenedor.html(html);
            },
            error: function (xhr) {
                let msg = 'Error al obtener los datos';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                $contenedor.html(`
                    <div class="alert alert-danger mt-3" role="alert">
                        <i class="bi bi-x-circle-fill me-2"></i>
                        ${msg}
                    </div>
                `);
            },
            complete: function () {
                $btn.prop('disabled', false).html('<i class="bi bi-eye me-2"></i>Previsualizar');
            }
        });
    });

    // Limpiar Previsualización
    $(document).on('click', '#btn-limpiar-excel', function (e) {
        e.preventDefault();
        $('#previsualizar').html('');
    });


    // **************************************************************************************************************************

    /**
     * ====================================
     * Sección para generar Reporte General
     * ====================================
     */

    function formatoMonedaGeneral(valor) {
        return '$' + parseFloat(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatoFecha(fechaStr) {
        if (!fechaStr) return '-';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function getBadgeEstado(estado) {
        const badges = {
            'activo': '<span class="badge bg-success">Activo</span>',
            'pausado': '<span class="badge bg-warning text-dark">Pausado</span>',
            'liquidado': '<span class="badge bg-secondary">Liquidado</span>'
        };
        return badges[estado] || `<span class="badge bg-light text-dark">${estado}</span>`;
    }

    // Aplicar filtro
    $('#form-filtro-general').on('submit', function(e) {
        e.preventDefault();
        
        const anioInicio = $('#anioInicio').val();
        const semanaInicio = $('#semanaInicio').val();
        const anioFin = $('#anioFin').val();
        const semanaFin = $('#semanaFin').val();

        if (!anioInicio) {
            Swal.fire({
                title: 'Falta año',
                text: 'Debes seleccionar al menos el año de inicio.',
                icon: 'warning'
            });
            return;
        }

        const $btn = $('#btn-aplicar-filtro');
        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i>Cargando...');

        $.ajax({
            url: '../php/ObtenerReporteGeneral.php',
            type: 'GET',
            data: {
                anio_inicio: anioInicio,
                semana_inicio: semanaInicio || 0,
                anio_fin: anioFin || 0,
                semana_fin: semanaFin || 0
            },
            dataType: 'json',
            success: function(response) {
                if (!response.success) {
                    Swal.fire({
                        title: 'Error',
                        text: response.message,
                        icon: 'error'
                    });
                    return;
                }

                // Ocultar mensaje inicial y mostrar reporte
                $('#mensaje-inicial').hide();
                $('#contenedor-reporte').show();

                // Actualizar título
                $('#titulo-reporte').html(`Préstamos - ${response.filtro.descripcion}`);

                // ========== POR COBRAR ==========
                $('#total-monto-por-cobrar').text(formatoMonedaGeneral(response.por_cobrar.total));
                $('#total-prestamos-por-cobrar').text(`${response.por_cobrar.cantidad} Préstamo(s)`);
                
                let htmlPorCobrar = '';
                if (response.por_cobrar.detalle.length === 0) {
                    htmlPorCobrar = '<tr><td colspan="7" class="text-center text-muted py-3">No hay préstamos pendientes de cobro</td></tr>';
                } else {
                    response.por_cobrar.detalle.forEach(item => {
                        htmlPorCobrar += `
                            <tr>
                                <td>${item.empleado}</td>
                                <td><small class="text-muted">${item.folio}</small></td>
                                <td class="text-end">${formatoMonedaGeneral(item.monto_prestamo)}</td>
                                <td class="text-end text-success">${formatoMonedaGeneral(item.abonado)}</td>
                                <td class="text-end fw-bold text-danger">${formatoMonedaGeneral(item.pendiente)}</td>
                                <td class="text-center">${item.semana}/${item.anio}</td>
                                <td class="text-center">${getBadgeEstado(item.estado)}</td>
                            </tr>
                        `;
                    });
                }
                $('#tabla-por-cobrar').html(htmlPorCobrar);

                // ========== RECUPERADO ==========
                $('#total-monto-recuperado').text(formatoMonedaGeneral(response.recuperado.total));
                $('#total-abonos-recuperado').text(`${response.recuperado.cantidad} Abono(s)`);
                
                let htmlRecuperado = '';
                if (response.recuperado.detalle.length === 0) {
                    htmlRecuperado = '<tr><td colspan="6" class="text-center text-muted py-3">No hay abonos registrados</td></tr>';
                } else {
                    response.recuperado.detalle.forEach(item => {
                        const tipoAbono = item.es_nomina === 1 
                            ? '<span class="badge bg-success">Nómina</span>' 
                            : '<span class="badge bg-warning">Tesorería</span>';
                        htmlRecuperado += `
                            <tr>
                                <td>${item.empleado}</td>
                                <td><small class="text-muted">${item.folio}</small></td>
                                <td class="text-end text-success fw-bold">${formatoMonedaGeneral(item.monto_pago)}</td>
                                <td class="text-center">${item.num_sem_pago}/${item.anio_pago}</td>
                                <td class="text-center">${formatoFecha(item.fecha_pago)}</td>
                                <td class="text-center">${tipoAbono}</td>
                            </tr>
                        `;
                    });
                }
                $('#tabla-recuperado').html(htmlRecuperado);

                // ========== PRESTADO ==========
                $('#total-monto-prestado').text(formatoMonedaGeneral(response.prestado.total));
                $('#total-prestamos').text(`${response.prestado.cantidad} Préstamo(s)`);
                
                let htmlPrestado = '';
                if (response.prestado.detalle.length === 0) {
                    htmlPrestado = '<tr><td colspan="6" class="text-center text-muted py-3">No hay préstamos en este período</td></tr>';
                } else {
                    response.prestado.detalle.forEach(item => {
                        htmlPrestado += `
                            <tr>
                                <td>${item.empleado}</td>
                                <td><small class="text-muted">${item.folio}</small></td>
                                <td class="text-end fw-bold">${formatoMonedaGeneral(item.monto)}</td>
                                <td class="text-center">${item.semana}/${item.anio}</td>
                                <td class="text-center">${formatoFecha(item.fecha_registro)}</td>
                                <td class="text-center">${getBadgeEstado(item.estado)}</td>
                            </tr>
                        `;
                    });
                }
                $('#tabla-prestado').html(htmlPrestado);

            },
            error: function(xhr) {
                let msg = 'Error al obtener los datos';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                Swal.fire({
                    title: 'Error',
                    text: msg,
                    icon: 'error'
                });
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i class="bi bi-search me-1"></i>Aplicar filtro');
            }
        });
    });

    // Limpiar filtro
    $('#btn-limpiar-filtro').on('click', function() {
        $('#anioInicio').val(new Date().getFullYear());
        $('#semanaInicio').val('');
        $('#anioFin').val('');
        $('#semanaFin').val('');
        
        // Ocultar reporte y mostrar mensaje inicial
        $('#contenedor-reporte').hide();
        $('#mensaje-inicial').show();
    });

    // Botón PDF - Generar PDF del reporte general
    $('#btn-generar-pdf-general').on('click', function() {
        const anioInicio = $('#anioInicio').val();
        const semanaInicio = $('#semanaInicio').val();
        const anioFin = $('#anioFin').val();
        const semanaFin = $('#semanaFin').val();

        if (!anioInicio) {
            Swal.fire({
                title: 'Sin filtro',
                text: 'Primero aplica un filtro para generar el PDF.',
                icon: 'warning'
            });
            return;
        }

        // Construir URL con parámetros
        let url = `generarPdfGeneral.php?anio_inicio=${encodeURIComponent(anioInicio)}`;
        if (semanaInicio) url += `&semana_inicio=${encodeURIComponent(semanaInicio)}`;
        if (anioFin) url += `&anio_fin=${encodeURIComponent(anioFin)}`;
        if (semanaFin) url += `&semana_fin=${encodeURIComponent(semanaFin)}`;

        // Abrir PDF en nueva ventana
        const w = window.open(url, '_blank');
        if (!w) {
            Swal.fire({
                title: 'Pop-up bloqueado',
                text: 'Permite pop-ups para ver el PDF.',
                icon: 'info'
            });
        }
    });

});
