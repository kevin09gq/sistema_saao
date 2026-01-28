$(document).ready(function () {

    const URL_SABE = "/sistema_saao/";
    const ID_EMPLEADO = window.ID_EMPLEADO_DETALLES;
    const LIMITE = 5;

    let nombreEmpleadoActual = '';

    let planesPorId = {};

    let pagePrestamos = 1;
    let pageAbonos = 1;
    let pagePlanes = 1;

    cargarDetalleEmpleado();
    cargarPrestamos();
    cargarAbonos();
    cargarPlanes();

    function formatearMoneda(numero) {
        let n = Number(numero || 0);
        return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function badgeEstado(estado) {
        let e = (estado || '').toLowerCase();
        if (e === 'activo') {
            return '<span class="badge text-bg-success">Activo</span>';
        }
        if (e === 'pausado') {
            return '<span class="badge text-bg-warning">Pausado</span>';
        }
        return '<span class="badge text-bg-secondary">Liquidado</span>';
    }

    function badgeEstadoDetallePlan(estado) {
        let e = (estado || '').toString().trim().toLowerCase();
        if (e === 'pendiente') {
            return '<span class="badge text-bg-secondary">Pendiente</span>';
        }
        if (e === 'pausado') {
            return '<span class="badge text-bg-warning">Pausado</span>';
        }
        if (e === 'pagado') {
            return '<span class="badge text-bg-success">Pagado</span>';
        }
        return `<span class="badge text-bg-secondary">${estado || '-'}</span>`;
    }

    function abrirModalDetallesPlan({ empleado, folio, detalle }) {
        let modalEl = document.getElementById('modalDetallesPlan');
        if (!modalEl) {
            return;
        }

        $('#modal-detalles-plan-nombre-empleado').text(empleado || '-');
        $('#modal-detalles-plan-folio-prestamo').text((folio ? ('Folio: ' + folio) : '-') );

        let tbody = document.getElementById('cuerpo-tabla-detalle-plan');
        if (!tbody) {
            return;
        }

        let data = [];
        try {
            if (detalle && typeof detalle === 'string') {
                data = JSON.parse(detalle);
            } else if (Array.isArray(detalle)) {
                data = detalle;
            } else if (detalle && typeof detalle === 'object') {
                data = [detalle];
            }
        } catch (e) {
            data = [];
        }

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Sin detalles</td>
                </tr>
            `;
        } else {
            let html = '';
            data.forEach(d => {
                let monto = d.monto_semanal ?? '';
                let semana = d.num_semana ?? '';
                let anio = d.anio ?? '';
                let fechaPago = d.fecha_pago ?? '';
                let observacion = d.observacion ?? '';
                let estado = d.estado ?? '';

                html += `
                    <tr>
                        <td>Sem ${semana} / ${anio}</td>
                        <td>${monto}</td>
                        <td>${fechaPago}</td>
                        <td>${badgeEstadoDetallePlan(estado)}</td>
                        <td>${observacion}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        let modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }

    function renderPaginacion(containerId, page, totalPages, onClickPage) {
        let container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        let p = Number(page || 1);
        let t = Number(totalPages || 1);
        if (t < 1) {
            t = 1;
        }
        if (p < 1) {
            p = 1;
        }
        if (p > t) {
            p = t;
        }

        let start = Math.max(1, p - 2);
        let end = Math.min(t, p + 2);

        let html = '<ul class="pagination">';
        html += `
            <li class="page-item ${p === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${p - 1}" aria-label="Previous">&laquo;</a>
            </li>
        `;

        for (let i = start; i <= end; i++) {
            html += `
                <li class="page-item ${i === p ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${p === t ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${p + 1}" aria-label="Next">&raquo;</a>
            </li>
        `;
        html += '</ul>';

        container.innerHTML = html;
        $(container).find('a.page-link').off('click').on('click', function (e) {
            e.preventDefault();
            let target = Number($(this).data('page'));
            if (!target || target < 1 || target > t || target === p) {
                return;
            }
            onClickPage(target);
        });
    }

    function cargarDetalleEmpleado() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerDetalleEmpleado.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO },
            success: function (response) {
                let data = response && response.data ? response.data : null;
                if (!data || !data.empleado) {
                    return;
                }

                nombreEmpleadoActual = data.empleado.empleado || '';

                $('#detalle-empleado-nombre').text(data.empleado.empleado || '-');
                $('#detalle-empleado-clave').text(data.empleado.clave_empleado || '-');
                $('#detalle-empleado-departamento').text(data.empleado.nombre_departamento || '-');
                $('#detalle-empleado-empresa').text(data.empleado.nombre_empresa || '-');

                let historicoTotal = data.historico ? data.historico.total_prestado : 0;
                let deudaActiva = data.historico ? data.historico.deuda_activa : 0;
                $('#detalle-historico-total').text(`$ ${formatearMoneda(historicoTotal)}`);
                $('#detalle-historico-deuda').text(`$ ${formatearMoneda(deudaActiva)}`);
            }
        });
    }

    /**
     * Función para recuperar los préstamos del empleado
     */
    function cargarPrestamos() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerPrestamosEmpleado.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO, page: pagePrestamos, limit: LIMITE },
            success: function (response) {
                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderPrestamos(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                renderPaginacion('paginacion-prestamos', pg.page, pg.total_pages, function (newPage) {
                    pagePrestamos = newPage;
                    cargarPrestamos();
                });
            },
            error: function () {
                renderPrestamos([]);
                renderPaginacion('paginacion-prestamos', 1, 1, function () { });
            }
        });
    }

    /**
     * Función para renderizar los préstamos en la tabla
     */
    function renderPrestamos(items) {
        let tbody = document.getElementById('tabla-prestamos');
        if (!tbody) {
            return;
        }

        if (!items || items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Sin resultados</td>
                </tr>
            `;
            return;
        }

        let html = '';
        items.forEach(item => {
            html += `
                <tr>
                    <td class="text-center">${item.folio || '-'}</td>
                    <td class="text-end">$ ${formatearMoneda(item.monto)}</td>
                    <td class="text-end">$ ${formatearMoneda(item.abonado)}</td>
                    <td class="text-end">$ ${formatearMoneda(item.deuda)}</td>
                    <td class="text-center">${badgeEstado(item.estado)}</td>
                    <td class="text-center">${item.fecha_registro || '-'}</td>
                    <td class="text-center">
                        <a href="editarPrestamo.php?prestamo=${item.id_prestamo}" class="btn btn-sm btn-outline-success" title="Editar Préstamo"><i class="bi bi-pencil"></i></a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    /**
     * Función para recuperar los abonos del empleado
     */
    function cargarAbonos() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerAbonosEmpleado.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO, page: pageAbonos, limit: LIMITE },
            success: function (response) {
                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderAbonos(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                renderPaginacion('paginacion-abonos', pg.page, pg.total_pages, function (newPage) {
                    pageAbonos = newPage;
                    cargarAbonos();
                });
            },
            error: function () {
                renderAbonos([]);
                renderPaginacion('paginacion-abonos', 1, 1, function () { });
            }
        });
    }

    /**
     * Función para renderizar los abonos en la tabla
     */
    function renderAbonos(items) {
        let tbody = document.getElementById('tabla-abonos');
        if (!tbody) {
            return;
        }

        if (!items || items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Sin resultados</td>
                </tr>
            `;
            return;
        }

        let html = '';
        items.forEach(item => {
            let origen = Number(item.es_nomina) === 1 ? '<span class="badge text-bg-success">Nómina</span>' : '<span class="badge text-bg-warning">Tesorería</span>';
            html += `
                <tr>
                    <td class="text-center">${item.folio || '-'}</td>
                    <td class="text-center">${item.semana_pago || '-'}</td>
                    <td class="text-end">$ ${formatearMoneda(item.monto_pago)}</td>
                    <td class="text-center">${item.fecha_pago || '-'}</td>
                    <td class="text-center">${origen}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    /**
     * Función para recuperar los planes del empleado
     */
    function cargarPlanes() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerPlanesEmpleado.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO, page: pagePlanes, limit: LIMITE },
            success: function (response) {

                console.log(response);

                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderPlanes(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                renderPaginacion('paginacion-planes', pg.page, pg.total_pages, function (newPage) {
                    pagePlanes = newPage;
                    cargarPlanes();
                });
            },
            error: function () {
                renderPlanes([]);
                renderPaginacion('paginacion-planes', 1, 1, function () { });
            }
        });
    }

    /**
     * Función para renderizar los planes en la tabla
     */
    function renderPlanes(items) {
        let tbody = document.getElementById('tabla-planes');
        if (!tbody) {
            return;
        }

        planesPorId = {};

        let html = '';
        items.forEach(item => {
            planesPorId[item.id_plan] = item;
            html += `
                <tr>
                    <td class="text-center">${item.folio || '-'}</td>
                    <td class="text-center">Sem ${item.sem_inicio || '-'} / ${item.anio_inicio || '-'}</td>
                    <td class="text-center">Sem ${item.sem_fin || '-'} / ${item.anio_fin || '-'}</td>
                    <td class="text-center">${item.fecha_registro || '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-success btn-ver-detalle-plan" title="Ver Detalles" data-id-plan="${item.id_plan}"><i class="bi bi-search"></i></button>
                        <a href="editarPlan.php?id_plan=${item.id_plan}" class="btn btn-sm btn-outline-warning" title="Editar Plan"><i class="bi bi-pencil"></i></a>
                        <a href="generarPdfPlan.php?id_plan=${item.id_plan}" target="_blank" class="btn btn-sm btn-outline-danger" title="Generar PDF del plan"><i class="bi bi-file-earmark-pdf-fill"></i></a>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        $(tbody).find('.btn-ver-detalle-plan').off('click').on('click', function () {
            let idPlan = Number($(this).data('id-plan'));
            let plan = planesPorId[idPlan] || null;
            if (!plan) {
                abrirModalDetallesPlan({
                    empleado: nombreEmpleadoActual || $('#detalle-empleado-nombre').text() || '-',
                    folio: '-',
                    detalle: ''
                });
                return;
            }

            abrirModalDetallesPlan({
                empleado: nombreEmpleadoActual || $('#detalle-empleado-nombre').text() || '-',
                folio: plan.folio || '-',
                detalle: plan.detalle
            });
        });
    }


    /**
     * ===============================================
     * AQUI EMPIEZA TODO LO RELACIONADO CON LOS ABONOS
     * ===============================================
     */

    // Nuevo abono
    $(document).on('submit', '#form-nuevo-abono', function (e) {
        e.preventDefault();

        let montoInput = document.getElementById('monto_pago');
        let fechaPago = $('#fecha_pago').val();
        let semanaPago = $('#semana_pago').val();
        let anioPago = $('#anio_pago').val();
        let esNomina = $('#es_nomina').is(':checked') ? 1 : 0;
        let pausarSemana = $('#pausar_semana').is(':checked') ? 1 : 0;
        let observacion = $('#observacion_pago').val() || '';

        let monto = montoInput ? montoInput.value : '';

        if (pausarSemana === 0) {
            if (!monto || Number(monto) <= 0) {
                Swal.fire('Validación', 'Debes ingresar un monto válido', 'warning');
                return;
            }
        } else {
            if (!observacion.trim()) {
                Swal.fire('Validación', 'Debes ingresar el motivo de la pausa', 'warning');
                return;
            }
        }

        $.ajax({
            type: 'POST',
            url: URL_SABE + 'prestamos/php/guardarNuevoAbono.php',
            dataType: 'json',
            data: {
                id_empleado: ID_EMPLEADO,
                monto_pago: monto,
                fecha_pago: fechaPago,
                semana_pago: semanaPago,
                anio_pago: anioPago,
                es_nomina: esNomina,
                pausar_semana: pausarSemana,
                observacion_pago: observacion
            },
            success: function (response) {
                if (!response) {
                    Swal.fire('Error', 'Respuesta inválida del servidor', 'error');
                    return;
                }

                if (response.icono && response.icono !== 'success') {
                    Swal.fire(response.titulo || 'Aviso', response.mensaje || 'Ocurrió un problema', response.icono);
                    return;
                }

                Swal.fire(response.titulo || 'OK', response.mensaje || 'Proceso completado', 'success');

                let modalEl = document.getElementById('modalAbono');
                if (modalEl) {
                    let modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    modal.hide();
                }

                let form = document.getElementById('form-nuevo-abono');
                if (form) {
                    form.reset();
                }
                $('#es_nomina').prop('checked', true);
                $('#pausar_semana').prop('checked', false);
                actualizarEstadoFormularioAbono();

                cargarDetalleEmpleado();
                cargarPrestamos();
                cargarAbonos();
                cargarPlanes();
            },
            error: function (xhr) {
                let msg = 'No se pudo guardar';
                if (xhr && xhr.responseJSON && xhr.responseJSON.mensaje) {
                    msg = xhr.responseJSON.mensaje;
                }
                Swal.fire('Error', msg, 'error');
            }
        });
    });

    function actualizarEstadoFormularioAbono() {
        let pausar = $('#pausar_semana').is(':checked');
        let cont = document.getElementById('contenedor-observacion-pago');
        let montoInput = document.getElementById('monto_pago');
        let obs = document.getElementById('observacion_pago');
        let esNominaCheckbox = document.getElementById('es_nomina');

        if (cont) {
            cont.hidden = !pausar;
        }
        if (montoInput) {
            montoInput.required = !pausar;
            montoInput.disabled = pausar;
            if (pausar) {
                montoInput.value = '';
            }
        }
        if (obs) {
            obs.required = pausar;
            if (!pausar) {
                obs.value = '';
            }
        }
        // Si se pausa, desmarcar "Aplicar Nomina"
        if (esNominaCheckbox) {
            if (pausar) {
                esNominaCheckbox.checked = false;
                esNominaCheckbox.disabled = true;
            } else {
                esNominaCheckbox.disabled = false;
            }
        }
    }

    $(document).on('change', '#pausar_semana', function () {
        actualizarEstadoFormularioAbono();
    });

    $(document).on('shown.bs.modal', '#modalAbono', function () {
        actualizarEstadoFormularioAbono();
    });

    /**
     * ===============================================================
     *     AQUI EMPIEZA LA LOGICA PARA EL MODAL DE SELECCIONAR DETALLE
     * ===============================================================
     */

    let detallesPlanActivo = [];

    // Abrir modal de seleccionar plan sin cerrar el modal de abono
    $(document).on('click', '#btn-ver-modal-seleccionar-plan', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Cargar los detalles del plan activo más antiguo
        cargarDetallesPlanActivo();

        // Abrir el modal de seleccionar plan
        let modalSeleccionar = new bootstrap.Modal(document.getElementById('modal-seleccionar-plan'), {
            backdrop: false // Sin backdrop para que no interfiera con el modal de abono
        });
        modalSeleccionar.show();
    });

    /**
     * Cargar los detalles del plan activo más antiguo del empleado
     */
    function cargarDetallesPlanActivo() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerDetallePlanActivo.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO },
            success: function (response) {
                if (!response || !response.data || !response.data.detalle) {
                    renderTablaSeleccionarDetalle([]);
                    return;
                }

                let detalle = response.data.detalle;
                if (typeof detalle === 'string') {
                    try {
                        detalle = JSON.parse(detalle);
                    } catch (e) {
                        detalle = [];
                    }
                }

                detallesPlanActivo = Array.isArray(detalle) ? detalle : [];
                renderTablaSeleccionarDetalle(detallesPlanActivo);
            },
            error: function () {
                renderTablaSeleccionarDetalle([]);
            }
        });
    }

    /**
     * Renderizar la tabla de detalles para seleccionar
     */
    function renderTablaSeleccionarDetalle(detalle) {
        let tbody = document.getElementById('cuerpo-tabla-seleccionar-detalle');
        if (!tbody) return;

        if (!Array.isArray(detalle) || detalle.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">Sin detalles disponibles</td>
                </tr>
            `;
            return;
        }

        let html = '';
        detalle.forEach((item, idx) => {
            let semana = item.num_semana || '-';
            let anio = item.anio || '-';
            let monto = Number(item.monto_semanal || 0);
            let estado = (item.estado || 'Pendiente').toString().trim().toLowerCase();

            // Solo mostrar filas pendientes como seleccionables
            let esSeleccionable = estado === 'pendiente';
            let claseEstado = estado === 'pagado' ? 'text-bg-success' : (estado === 'pausado' ? 'text-bg-warning' : 'text-bg-secondary');
            let cursorStyle = esSeleccionable ? 'cursor: pointer;' : 'opacity: 0.6;';

            html += `
                <tr data-idx="${idx}" data-monto="${monto}" data-semana="${semana}" data-anio="${anio}" data-seleccionable="${esSeleccionable}" style="${cursorStyle}" title="${esSeleccionable ? 'Doble click para seleccionar' : 'No disponible'}">
                    <td class="text-center">Semana ${semana} / ${anio}</td>
                    <td class="text-end">$ ${formatearMoneda(monto)}</td>
                    <td class="text-center"><span class="badge ${claseEstado}">${item.estado || 'Pendiente'}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Doble click en una fila para seleccionar el monto
     */
    $(document).on('dblclick', '#cuerpo-tabla-seleccionar-detalle tr', function () {
        let $tr = $(this);
        let esSeleccionable = $tr.data('seleccionable');

        if (!esSeleccionable) {
            Swal.fire('No disponible', 'Solo puedes seleccionar semanas pendientes', 'info');
            return;
        }

        let monto = $tr.data('monto');
        let semana = $tr.data('semana');
        let anio = $tr.data('anio');

        // Colocar el monto en el input del modal de abono
        $('#monto_pago').val(monto);

        // Colocar la semana y año en los selects
        $('#semana_pago').val(semana);
        $('#anio_pago').val(anio);

        // Cerrar el modal de seleccionar
        let modalSeleccionar = bootstrap.Modal.getInstance(document.getElementById('modal-seleccionar-plan'));
        if (modalSeleccionar) {
            modalSeleccionar.hide();
        }

        // Mostrar mensaje de confirmación
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Monto $${formatearMoneda(monto)} seleccionado`,
            showConfirmButton: false,
            timer: 1500
        });
    });


    
});