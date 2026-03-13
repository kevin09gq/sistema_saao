$(document).ready(function() {
    const backendUrl = '../php/get_historial_cortes.php';
    const $selectAnio = $('#select_anio');
    const $selectSemana = $('#select_semana');
    const $btnBuscar = $('#btn_buscar_cortes');
    const $listaCortes = $('#lista_cortes');
    const $modalDetalles = new bootstrap.Modal(document.getElementById('modal_detalles_corte'));

    // Cargar años al iniciar
    function cargarAnios() {
        $.get(backendUrl, { action: 'get_years' }, function(anios) {
            $selectAnio.empty().append('<option value="">Seleccione un año...</option>');
            if (Array.isArray(anios)) {
                anios.forEach(anio => {
                    $selectAnio.append(`<option value="${anio}">${anio}</option>`);
                });
            }
        }).fail(function(err) {
            console.error('Error al cargar años:', err);
            const msg = err.responseJSON && err.responseJSON.error ? err.responseJSON.error : 'No se pudieron cargar los años';
            Swal.fire('Error', msg, 'error');
        });
    }

    cargarAnios();

    // Evento al cambiar de año
    $selectAnio.on('change', function() {
        const anio = $(this).val();
        if (anio) {
            $selectSemana.prop('disabled', false).empty().append('<option value="">Cargando semanas...</option>');
            $.get(backendUrl, { action: 'get_weeks', anio: anio }, function(semanas) {
                $selectSemana.empty().append('<option value="">Seleccione una semana...</option>');
                if (Array.isArray(semanas)) {
                    semanas.forEach(sem => {
                        $selectSemana.append(`<option value="${sem.id_nomina_relicario}">Semana ${sem.numero_semana}</option>`);
                    });
                }
            }).fail(function(err) {
                console.error('Error al cargar semanas:', err);
                Swal.fire('Error', 'No se pudieron cargar las semanas', 'error');
            });
        } else {
            $selectSemana.prop('disabled', true).empty().append('<option value="">Seleccione primero el año...</option>');
            $btnBuscar.prop('disabled', true);
        }
    });

    // Evento al cambiar de semana
    $selectSemana.on('change', function() {
        const idNomina = $(this).val();
        $btnBuscar.prop('disabled', !idNomina);
    });

    // Evento de búsqueda de cortes
    $btnBuscar.on('click', function() {
        const idNomina = $selectSemana.val();
        if (!idNomina) return;

        $listaCortes.empty().append('<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-success" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>');

        $.get(backendUrl, { action: 'get_cortes', id_nomina: idNomina }, function(cortes) {
            $listaCortes.empty();
            if (!Array.isArray(cortes) || cortes.length === 0) {
                $listaCortes.append('<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron cortes para esta semana.</td></tr>');
                return;
            }

            cortes.forEach(corte => {
                const row = `
                    <tr class="corte-item" data-id="${corte.id}">
                        <td class="fw-bold text-success">${corte.folio}</td>
                        <td>${corte.nombre_cortador}</td>
                        <td>${formatearFecha(corte.fecha_corte)}</td>
                        <td>$${parseFloat(corte.precio_reja).toFixed(2)}</td>
                        <td class="text-center">
                            <span class="badge bg-secondary loading-rejas" data-id="${corte.id}">Cargando...</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-success btn-ver-detalles" data-id="${corte.id}">
                                <i class="bi bi-eye"></i> Ver Detalles
                            </button>
                        </td>
                    </tr>
                `;
                $listaCortes.append(row);
            });

            // Cargar rejas después de renderizar todas las filas
            $('.loading-rejas').each(function() {
                const $badge = $(this);
                const idCorte = $badge.data('id');
                $.get(backendUrl, { action: 'get_corte_details', id_corte: idCorte }, function(data) {
                    let totalRejas = 0;
                    if (data && data.tablas) {
                        data.tablas.forEach(t => totalRejas += parseInt(t.rejas));
                    }
                    $badge.removeClass('bg-secondary').addClass('bg-success').text(`${totalRejas} rejas`);
                });
            });

        }).fail(function(err) {
            console.error('Error al cargar cortes:', err);
            $listaCortes.empty().append('<tr><td colspan="6" class="text-center text-danger py-4">Error al cargar los datos.</td></tr>');
        });
    });

    // Evento para ver detalles (botón o clic en fila)
    $(document).on('click', '.corte-item, .btn-ver-detalles', function(e) {
        e.stopPropagation();
        const idCorte = $(this).data('id') || $(this).closest('tr').data('id');
        if (idCorte) {
            abrirDetallesCorte(idCorte);
        }
    });

    function abrirDetallesCorte(idCorte) {
        $.get(backendUrl, { action: 'get_corte_details', id_corte: idCorte }, function(data) {
            if (!data || !data.corte) {
                Swal.fire('Error', 'No se encontró información del corte', 'error');
                return;
            }

            const corte = data.corte;
            const tablas = data.tablas || [];

            // Llenar header del modal
            $('#corte_info_header').html(`
                <div class="row corte-header-info">
                    <div class="col-md-6">
                        <p class="mb-1 text-muted small">FOLIO:</p>
                        <h4 class="text-success mb-3">${corte.folio}</h4>
                        <p class="mb-1 text-muted small">CORTADOR:</p>
                        <h5 class="corte-cortador-name">${corte.nombre_cortador}</h5>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p class="mb-1 text-muted small">FECHA DE CORTE:</p>
                        <h5 class="mb-3">${formatearFecha(corte.fecha_corte)}</h5>
                        <p class="mb-1 text-muted small">PRECIO POR REJA:</p>
                        <h5 class="text-success">$${parseFloat(corte.precio_reja).toFixed(2)}</h5>
                    </div>
                </div>
            `);

            // Llenar tabla de tablas
            const $listaTablas = $('#lista_tablas_corte').empty();
            let totalRejas = 0;
            
            if (tablas.length === 0) {
                $listaTablas.append('<tr><td colspan="2" class="text-center py-3">Sin desglose de tablas</td></tr>');
            } else {
                tablas.forEach(t => {
                    totalRejas += parseInt(t.rejas);
                    $listaTablas.append(`
                        <tr class="tabla-item">
                            <td class="text-center">Tabla ${t.num_tabla}</td>
                            <td class="text-center fw-bold text-dark">${t.rejas} rejas</td>
                        </tr>
                    `);
                });
            }

            // Total footer
            const totalDinero = totalRejas * parseFloat(corte.precio_reja);
            $('#total_tablas_footer').html(`
                <tr class="table-success">
                    <th class="text-end">TOTAL REJAS:</th>
                    <th class="text-center">
                        <span class="badge bg-success badge-rejas">${totalRejas} rejas</span>
                    </th>
                </tr>
                <tr style="background-color: #d1e7dd;">
                    <th class="text-end">TOTAL A PAGAR:</th>
                    <th class="text-center">
                        <span class="fs-4 fw-bold text-success">$${totalDinero.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </th>
                </tr>
            `);

            $modalDetalles.show();
        }).fail(function(err) {
            console.error('Error al cargar detalles:', err);
            Swal.fire('Error', 'No se pudieron cargar los detalles del corte', 'error');
        });
    }

    function formatearFecha(fechaStr) {
        if (!fechaStr) return '';
        const date = new Date(fechaStr + 'T00:00:00');
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', opciones);
    }
});
