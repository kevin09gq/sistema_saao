$(document).ready(function () {

    const URL_SABE = "/sistema_saao/";
    const ID_EMPLEADO = window.ID_EMPLEADO_DETALLES;
    const LIMITE_DEFAULT = 5;

    let nombreEmpleadoActual = '';

    let planesPorId = {};

    let pagePrestamos = 1;
    let pageAbonos = 1;
    let pagePlanes = 1;

    let filtrosPrestamos = {
        orden: 'desc',
        busqueda: '',
        limite: LIMITE_DEFAULT
    };
    let filtrosAbonos = {
        orden: 'desc',
        busqueda: '',
        limite: LIMITE_DEFAULT
    };
    let filtrosPlanes = {
        orden: 'desc',
        busqueda: '',
        limite: LIMITE_DEFAULT
    };

    function debounce(fn, wait) {
        let t;
        return function () {
            let ctx = this;
            let args = arguments;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    function numeroDesdeControl(selector, fallback) {
        let v = $(selector).val();
        let n = Number(v);
        if (!Number.isFinite(n)) {
            return fallback;
        }
        return n;
    }

    function textoDesdeControl(selector) {
        let v = $(selector).val();
        return (v == null) ? '' : String(v);
    }

    function inicializarFiltrosDesdeUI() {
        if (document.getElementById('limite_prestamo')) {
            filtrosPrestamos.limite = numeroDesdeControl('#limite_prestamo', LIMITE_DEFAULT);
        }
        if (document.getElementById('busqueda_prestamo')) {
            filtrosPrestamos.busqueda = textoDesdeControl('#busqueda_prestamo').trim();
        }
        if (document.getElementById('limite_abono')) {
            filtrosAbonos.limite = numeroDesdeControl('#limite_abono', LIMITE_DEFAULT);
        }
        if (document.getElementById('busqueda_abono')) {
            filtrosAbonos.busqueda = textoDesdeControl('#busqueda_abono').trim();
        }
        if (document.getElementById('limite_plan')) {
            filtrosPlanes.limite = numeroDesdeControl('#limite_plan', LIMITE_DEFAULT);
        }
        if (document.getElementById('busqueda_plan')) {
            filtrosPlanes.busqueda = textoDesdeControl('#busqueda_plan').trim();
        }
    }

    function registrarEventosFiltros() {
        $('#btnMasRecientePrestamo').off('click').on('click', function () {
            filtrosPrestamos.orden = 'desc';
            pagePrestamos = 1;
            cargarPrestamos();
        });
        $('#btnMasAntiguoPrestamo').off('click').on('click', function () {
            filtrosPrestamos.orden = 'asc';
            pagePrestamos = 1;
            cargarPrestamos();
        });
        $('#limite_prestamo').off('change').on('change', function () {
            filtrosPrestamos.limite = numeroDesdeControl('#limite_prestamo', LIMITE_DEFAULT);
            pagePrestamos = 1;
            cargarPrestamos();
        });
        $('#busqueda_prestamo').off('input').on('input', debounce(function () {
            filtrosPrestamos.busqueda = textoDesdeControl('#busqueda_prestamo').trim();
            pagePrestamos = 1;
            cargarPrestamos();
        }, 350));

        $('#btnMasRecienteAbono').off('click').on('click', function () {
            filtrosAbonos.orden = 'desc';
            pageAbonos = 1;
            cargarAbonos();
        });
        $('#btnMasAntiguoAbono').off('click').on('click', function () {
            filtrosAbonos.orden = 'asc';
            pageAbonos = 1;
            cargarAbonos();
        });
        $('#limite_abono').off('change').on('change', function () {
            filtrosAbonos.limite = numeroDesdeControl('#limite_abono', LIMITE_DEFAULT);
            pageAbonos = 1;
            cargarAbonos();
        });
        $('#busqueda_abono').off('input').on('input', debounce(function () {
            filtrosAbonos.busqueda = textoDesdeControl('#busqueda_abono').trim();
            pageAbonos = 1;
            cargarAbonos();
        }, 350));

        $('#btnMasRecientePlan').off('click').on('click', function () {
            filtrosPlanes.orden = 'desc';
            pagePlanes = 1;
            cargarPlanes();
        });
        $('#btnMasAntiguoPlan').off('click').on('click', function () {
            filtrosPlanes.orden = 'asc';
            pagePlanes = 1;
            cargarPlanes();
        });
        $('#limite_plan').off('change').on('change', function () {
            filtrosPlanes.limite = numeroDesdeControl('#limite_plan', LIMITE_DEFAULT);
            pagePlanes = 1;
            cargarPlanes();
        });
        $('#busqueda_plan').off('input').on('input', debounce(function () {
            filtrosPlanes.busqueda = textoDesdeControl('#busqueda_plan').trim();
            pagePlanes = 1;
            cargarPlanes();
        }, 350));
    }

    inicializarFiltrosDesdeUI();
    registrarEventosFiltros();

    cargarDetalleEmpleado();
    cargarPrestamos();
    cargarAbonos();
    cargarPlanes();

    /**
     * ====================
     * FUNCIONES AUXILIARES
     * ====================
     */
    function formatearMoneda(numero) {
        let n = Number(numero || 0);
        return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatearFecha(fechaStr) {
        if (!fechaStr || fechaStr === '-') return '-';

        try {
            let fecha = new Date(fechaStr);

            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) return fechaStr;

            let dia = String(fecha.getDate()).padStart(2, '0');
            let anio = fecha.getFullYear();
            let horas = String(fecha.getHours()).padStart(2, '0');
            let minutos = String(fecha.getMinutes()).padStart(2, '0');

            let meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            let mes = meses[fecha.getMonth()];

            return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
        } catch (e) {
            return fechaStr;
        }
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

    /** -------------------------------------------------------------------------------------------- */

    /**
     * =========================================
     * PARTE 1.
     * AQUI EMPIEZA TODO LO RELACIONADO PARA
     * LLENAR LA INFORMACION EN LAS TABLAS QUE
     * VERAN LOS USUARIOS
     * =========================================
     */

    // Función para renderizar la paginación
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

    /**
     * Función para recuperar y mostrar los detalles del empleado
     */
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
            data: {
                id_empleado: ID_EMPLEADO,
                page: pagePrestamos,
                limit: filtrosPrestamos.limite,
                orden: filtrosPrestamos.orden,
                busqueda: filtrosPrestamos.busqueda
            },
            success: function (response) {
                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderPrestamos(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                let cont = document.getElementById('paginacion-prestamos');
                if (Number(filtrosPrestamos.limite) === -1) {
                    if (cont) {
                        cont.innerHTML = '';
                    }
                } else {
                    renderPaginacion('paginacion-prestamos', pg.page, pg.total_pages, function (newPage) {
                        pagePrestamos = newPage;
                        cargarPrestamos();
                    });
                }
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
                    <td class="text-center">${formatearFecha(item.fecha_registro)}</td>
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
            data: {
                id_empleado: ID_EMPLEADO,
                page: pageAbonos,
                limit: filtrosAbonos.limite,
                orden: filtrosAbonos.orden,
                busqueda: filtrosAbonos.busqueda
            },
            success: function (response) {
                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderAbonos(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                let cont = document.getElementById('paginacion-abonos');
                if (Number(filtrosAbonos.limite) === -1) {
                    if (cont) {
                        cont.innerHTML = '';
                    }
                } else {
                    renderPaginacion('paginacion-abonos', pg.page, pg.total_pages, function (newPage) {
                        pageAbonos = newPage;
                        cargarAbonos();
                    });
                }
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
                    <td colspan="6" class="text-center">Sin resultados</td>
                </tr>
            `;
            return;
        }

        let html = '';
        items.forEach(item => {
            let origen = Number(item.es_nomina) === 1 ? '<span class="badge text-bg-success">Nómina</span>' : '<span class="badge text-bg-warning">Tesorería</span>';
            let pausado = Number(item.pausado || 0);
            let fecha = pausado === 1 ? '-' : formatearFecha(item.fecha_pago);
            let observacion = item.observacion || '-';

            origen = pausado === 1 ? '<span class="badge text-bg-danger">Pausado</span>' : origen;

            // Mostrar botón solo si es Tesorería (es_nomina=0) y no está pausado (pausado=0)
            let esTesoreria = Number(item.es_nomina) === 0;
            let noPausado = pausado === 0;
            let mostrarBoton = esTesoreria && noPausado;

            let botonRecibo = mostrarBoton
                ? `<a href="generarReciboTesoreria.php?id_abono=${item.id_abono}" target="_blank" class="btn btn-sm btn-outline-danger" title="Generar Recibo Tesorería"><i class="bi bi-file-earmark-pdf-fill"></i></a>`
                : '';

            let botonEditar = `<button class="btn btn-sm btn-outline-primary btn-editar-abono" data-id-abono="${item.id_abono}" title="Editar Abono"><i class="bi bi-pencil-fill"></i></button>`;

            html += `
                <tr>
                    <td class="text-center">${item.folio || '-'}</td>
                    <td class="text-center">${item.semana_pago || '-'}</td>
                    <td class="text-end">$ ${formatearMoneda(item.monto_pago)}</td>
                    <td class="text-center">${fecha}</td>
                    <td class="text-center">${observacion}</td>
                    <td class="text-center">${origen}</td>
                    <td class="text-center">
                        ${botonRecibo}
                        ${botonEditar}
                    </td>
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
            data: {
                id_empleado: ID_EMPLEADO,
                page: pagePlanes,
                limit: filtrosPlanes.limite,
                orden: filtrosPlanes.orden,
                busqueda: filtrosPlanes.busqueda
            },
            success: function (response) {

                console.log(response);

                let data = response && response.data ? response.data : { items: [], pagination: { page: 1, total_pages: 1 } };
                renderPlanes(data.items || []);
                let pg = data.pagination || { page: 1, total_pages: 1 };
                let cont = document.getElementById('paginacion-planes');
                if (Number(filtrosPlanes.limite) === -1) {
                    if (cont) {
                        cont.innerHTML = '';
                    }
                } else {
                    renderPaginacion('paginacion-planes', pg.page, pg.total_pages, function (newPage) {
                        pagePlanes = newPage;
                        cargarPlanes();
                    });
                }
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
                    <td class="text-center">${formatearFecha(item.fecha_registro)}</td>
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
     * Esta funcion se relaciona con renderPlanes()
     * Abre el modal de detalles del plan
     */
    function abrirModalDetallesPlan({ empleado, folio, detalle }) {
        let modalEl = document.getElementById('modalDetallesPlan');
        if (!modalEl) {
            return;
        }

        $('#modal-detalles-plan-nombre-empleado').text(empleado || '-');
        $('#modal-detalles-plan-folio-prestamo').text((folio ? ('Folio: ' + folio) : '-'));

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
                        <td>${formatearFecha(fechaPago)}</td>
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

    /** -------------------------------------------------------------------------------------------- */

    /**
     * ===============================================
     * PARTE 2.
     * AQUI EMPIEZA TODO LO RELACIONADO CON LOS ABONOS
     * ===============================================
     */

    // Variables para almacenar los préstamos activos y el préstamo seleccionado
    let prestamosActivos = [];
    let prestamoSeleccionado = null;
    let proximaSemanaPermitida = null;

    /**
     * Cargar préstamos activos cuando se abre el modal de abono
     */
    $(document).on('shown.bs.modal', '#modalAbono', function () {
        cargarPrestamosActivos();
        actualizarEstadoFormularioAbono();
        limpiarFormularioAbono();
    });

    /**
     * Limpiar el formulario de abono al cerrar el modal
     */
    $(document).on('hidden.bs.modal', '#modalAbono', function () {
        limpiarFormularioAbono();
    });

    /**
     * Limpiar formulario de abono
     */
    function limpiarFormularioAbono() {
        prestamoSeleccionado = null;
        proximaSemanaPermitida = null;
        $('#id_prestamo_seleccionado').val('');
        $('#monto_pago').val('');
        $('#semana_pago').val('');
        $('#anio_pago').val('');
        $('#observacion_pago').val('');
        $('#clave_autorizacion').val('');
        $('#es_nomina').prop('checked', true).prop('disabled', false);
        $('#pausar_semana').prop('checked', false);
        $('#prestamo-seleccionado-info').attr('hidden', true);
        $('#btn-guardar-abono').prop('disabled', true);

        // Limpiar tabla de detalle
        $('#tabla-detalle-plan-abono').html(`
            <tr>
                <td colspan="3" class="text-center text-muted">Selecciona un préstamo primero</td>
            </tr>
        `);

        // Quitar selección visual de préstamos
        $('#tabla-prestamos-activos tr').removeClass('table-primary');
    }

    /**
     * Cargar préstamos activos del empleado
     */
    function cargarPrestamosActivos() {
        $.ajax({
            type: 'GET',
            url: URL_SABE + 'prestamos/php/obtenerPrestamosActivosConDetalle.php',
            dataType: 'json',
            data: { id_empleado: ID_EMPLEADO },
            success: function (response) {
                if (!response || !response.data || !response.data.prestamos) {
                    renderTablaPrestamosActivos([]);
                    return;
                }
                prestamosActivos = response.data.prestamos;
                renderTablaPrestamosActivos(prestamosActivos);
            },
            error: function (xhr) {
                let msg = 'No se pudieron cargar los préstamos';
                if (xhr && xhr.responseJSON && xhr.responseJSON.mensaje) {
                    msg = xhr.responseJSON.mensaje;
                }
                $('#tabla-prestamos-activos').html(`
                    <tr>
                        <td colspan="6" class="text-center text-danger">${msg}</td>
                    </tr>
                `);
                prestamosActivos = [];
            }
        });
    }

    /**
     * Renderizar tabla de préstamos activos
     */
    function renderTablaPrestamosActivos(prestamos) {
        let tbody = document.getElementById('tabla-prestamos-activos');
        if (!tbody) return;

        if (!Array.isArray(prestamos) || prestamos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No hay préstamos activos</td>
                </tr>
            `;
            return;
        }

        let html = '';
        prestamos.forEach((p, idx) => {
            let rangoPlan = p.plan
                ? `Sem ${p.plan.sem_inicio}/${p.plan.anio_inicio} - ${p.plan.sem_fin}/${p.plan.anio_fin}`
                : 'Sin plan';

            html += `
                <tr class="fila-prestamo-seleccionar" data-index="${idx}" style="cursor: pointer;" title="Clic para seleccionar este préstamo">
                    <td>${p.folio || '-'}</td>
                    <td class="text-center">$ ${formatearMoneda(p.monto)}</td>
                    <td class="text-center">$ ${formatearMoneda(p.total_abonado)}</td>
                    <td class="text-center">$ ${formatearMoneda(p.deuda_restante)}</td>
                    <td class="text-center"><small>${rangoPlan}</small></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-success btn-seleccionar-prestamo" data-index="${idx}">
                            <i class="bi bi-check-circle"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Seleccionar préstamo al hacer clic en la fila o botón
     */
    $(document).on('click', '.fila-prestamo-seleccionar, .btn-seleccionar-prestamo', function (e) {
        e.stopPropagation();

        let index = $(this).data('index');
        if (index === undefined) {
            index = $(this).closest('tr').data('index');
        }

        if (index === undefined || !prestamosActivos[index]) {
            return;
        }

        // Marcar visualmente el préstamo seleccionado
        $('#tabla-prestamos-activos tr').removeClass('table-primary');
        $(`#tabla-prestamos-activos tr[data-index="${index}"]`).addClass('table-primary');

        prestamoSeleccionado = prestamosActivos[index];
        $('#id_prestamo_seleccionado').val(prestamoSeleccionado.id_prestamo);

        // Mostrar info del préstamo seleccionado
        $('#info-prestamo-seleccionado').text(`Folio ${prestamoSeleccionado.folio} - Deuda: $${formatearMoneda(prestamoSeleccionado.deuda_restante)}`);
        $('#prestamo-seleccionado-info').removeAttr('hidden');

        // Cargar detalle del plan en la tabla de semanas
        renderTablaDetallePlanAbono(prestamoSeleccionado.detalle || []);

        // Guardar la próxima semana permitida
        proximaSemanaPermitida = prestamoSeleccionado.proxima_semana;
    });

    /**
     * Renderizar tabla de detalle del plan para seleccionar semana
     */
    function renderTablaDetallePlanAbono(detalle) {
        let tbody = document.getElementById('tabla-detalle-plan-abono');
        if (!tbody) return;

        if (!Array.isArray(detalle) || detalle.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">Sin detalles de plan</td>
                </tr>
            `;
            return;
        }

        // Encontrar el índice de la primera semana pendiente
        let primerPendienteIdx = -1;
        for (let i = 0; i < detalle.length; i++) {
            let estado = (detalle[i].estado || 'Pendiente').toString().trim().toLowerCase();
            if (estado === 'pendiente') {
                primerPendienteIdx = i;
                break;
            }
        }

        let html = '';
        detalle.forEach((item, idx) => {
            let semana = item.num_semana || '-';
            let anio = item.anio || '-';
            let monto = Number(item.monto_semanal || 0);
            let estado = (item.estado || 'Pendiente').toString().trim().toLowerCase();

            // Solo la primera semana pendiente es seleccionable (para respetar el orden)
            let esSeleccionable = (estado === 'pendiente' && idx === primerPendienteIdx);
            let claseEstado = estado === 'pagado' ? 'text-bg-success' : (estado === 'pausado' ? 'text-bg-warning' : 'text-bg-secondary');

            let cursorStyle = esSeleccionable ? 'cursor: pointer;' : '';
            let opacityStyle = (estado !== 'pendiente' || idx !== primerPendienteIdx) && estado === 'pendiente' ? 'opacity: 0.5;' : '';
            let rowClass = esSeleccionable ? 'table-light' : '';
            let title = esSeleccionable
                ? 'Doble clic para seleccionar esta semana'
                : (estado === 'pendiente' ? 'Debes pagar las semanas anteriores primero' : 'Esta semana ya fue procesada');

            html += `
                <tr class="fila-detalle-abono ${rowClass}" 
                    data-idx="${idx}" 
                    data-monto="${monto}" 
                    data-semana="${semana}" 
                    data-anio="${anio}" 
                    data-seleccionable="${esSeleccionable}"
                    data-estado="${estado}"
                    style="${cursorStyle} ${opacityStyle}" 
                    title="${title}">
                    <td class="text-center">Semana ${semana} / ${anio}</td>
                    <td class="text-end">$ ${formatearMoneda(monto)}</td>
                    <td class="text-center"><span class="badge ${claseEstado}">${item.estado || 'Pendiente'}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * Doble clic en una fila del detalle para seleccionar la semana
     */
    $(document).on('click', '.fila-detalle-abono', function () {
        let $tr = $(this);
        let esSeleccionable = $tr.data('seleccionable') === true || $tr.data('seleccionable') === 'true';
        let estado = $tr.data('estado');

        if (!esSeleccionable) {
            if (estado === 'pagado' || estado === 'pausado') {
                Swal.fire('No disponible', `Esta semana ya está ${estado === 'pagado' ? 'pagada' : 'pausada'}`, 'info');
            } else {
                Swal.fire('Orden de pagos', 'Debes pagar las semanas anteriores primero. Los pagos deben ser en orden secuencial.', 'warning');
            }
            return;
        }

        let monto = $tr.data('monto');
        let semana = $tr.data('semana');
        let anio = $tr.data('anio');

        // Colocar los datos en el formulario
        $('#monto_pago').val(monto);
        $('#semana_pago').val(semana);
        $('#anio_pago').val(anio);

        // Marcar visualmente la fila seleccionada
        $('.fila-detalle-abono').removeClass('table-success');
        $tr.addClass('table-success');

        // Habilitar botón de guardar
        $('#btn-guardar-abono').prop('disabled', false);

        // Mostrar mensaje de confirmación
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Semana ${semana}/${anio} - $${formatearMoneda(monto)} seleccionada`,
            showConfirmButton: false,
            timer: 1500
        });
    });

    /**
     * Enviar formulario de nuevo abono
     */
    $(document).on('submit', '#form-nuevo-abono', function (e) {
        e.preventDefault();

        let idPrestamo = $('#id_prestamo_seleccionado').val();
        let montoInput = document.getElementById('monto_pago');
        let fechaPago = $('#fecha_pago').val();
        let semanaPago = $('#semana_pago').val();
        let anioPago = $('#anio_pago').val();
        let esNomina = $('#es_nomina').is(':checked') ? 1 : 0;
        let pausarSemana = $('#pausar_semana').is(':checked') ? 1 : 0;
        let observacion = $('#observacion_pago').val() || '';
        let claveAutorizacion = $('#clave_autorizacion').val() || '';

        let monto = montoInput ? montoInput.value : '';

        // Validaciones
        if (!idPrestamo) {
            Swal.fire('Validación', 'Debes seleccionar un préstamo', 'warning');
            return;
        }

        if (!semanaPago || !anioPago) {
            Swal.fire('Validación', 'Debes seleccionar una semana del plan (doble clic en la tabla)', 'warning');
            return;
        }

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

        // Validar clave de autorización si va a Tesorería (no es nómina y no está pausado)
        if (esNomina === 0 && pausarSemana === 0) {
            if (!claveAutorizacion.trim()) {
                Swal.fire('Clave Requerida', 'Debes ingresar la clave de autorización para abonos en Tesorería', 'warning');
                return;
            }
        }

        $.ajax({
            type: 'POST',
            url: URL_SABE + 'prestamos/php/guardarNuevoAbono.php',
            dataType: 'json',
            data: {
                id_empleado: ID_EMPLEADO,
                id_prestamo: idPrestamo,
                monto_pago: monto,
                fecha_pago: fechaPago,
                semana_pago: semanaPago,
                anio_pago: anioPago,
                es_nomina: esNomina,
                pausar_semana: pausarSemana,
                observacion_pago: observacion,
                clave_autorizacion: claveAutorizacion
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

                // Verificar si hay aviso de solapamiento
                let tieneAvisoSolapamiento = response.data && response.data.aviso_solapamiento === true;
                
                if (tieneAvisoSolapamiento && response.data.planes_solapados && response.data.planes_solapados.length > 0) {
                    // Construir lista de planes solapados
                    let listaPlanes = response.data.planes_solapados.map(p => 
                        `<li><strong>Folio ${p.folio}</strong>: ${p.rango}</li>`
                    ).join('');
                    
                    Swal.fire({
                        title: response.titulo || 'Semana pausada',
                        html: `
                            <p>${response.mensaje || 'Proceso completado'}</p>
                            <hr>
                            <div class="alert alert-warning text-start">
                                <strong><i class="bi bi-exclamation-triangle-fill"></i> Atención:</strong><br>
                                El plan extendido ahora se solapa con los siguientes préstamos:
                                <ul class="mt-2 mb-0">${listaPlanes}</ul>
                            </div>
                        `,
                        icon: 'warning',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    Swal.fire(response.titulo || 'OK', response.mensaje || 'Proceso completado', 'success');
                }

                let modalEl = document.getElementById('modalAbono');
                if (modalEl) {
                    let modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    modal.hide();
                }

                limpiarFormularioAbono();

                cargarDetalleEmpleado();
                cargarPrestamos();
                cargarAbonos();
                cargarPlanes();
            },
            error: function (xhr) {
                let msg = 'No se pudo guardar';
                let titulo = 'Error';
                if (xhr && xhr.responseJSON) {
                    msg = xhr.responseJSON.mensaje || msg;
                    titulo = xhr.responseJSON.titulo || titulo;
                }
                Swal.fire(titulo, msg, 'error');
            }
        });
    });

    /**
     * Actualizar estado del formulario según checkboxes
     */
    function actualizarEstadoFormularioAbono() {
        let pausar = $('#pausar_semana').is(':checked');
        let esNomina = $('#es_nomina').is(':checked');
        let cont = document.getElementById('contenedor-observacion-pago');
        let montoInput = document.getElementById('monto_pago');
        let obs = document.getElementById('observacion_pago');
        let esNominaCheckbox = document.getElementById('es_nomina');
        let contClave = document.getElementById('contenedor-clave-autorizacion');
        let claveInput = document.getElementById('clave_autorizacion');

        if (cont) {
            cont.hidden = !pausar;
        }
        if (montoInput) {
            montoInput.required = !pausar;
            if (pausar) {
                // No limpiar el monto, solo deshabilitarlo visualmente
            }
        }
        if (obs) {
            obs.required = pausar;
            if (!pausar) {
                obs.value = '';
            }
        }
        // Si se pausa, desmarcar "Aplicar Nómina"
        if (esNominaCheckbox) {
            if (pausar) {
                esNominaCheckbox.checked = false;
                esNominaCheckbox.disabled = true;
            } else {
                esNominaCheckbox.disabled = false;
            }
        }

        // Mostrar campo de clave de autorización si NO es nómina y NO está pausado
        let mostrarClave = !esNomina && !pausar;
        if (contClave) {
            contClave.hidden = !mostrarClave;
        }
        if (claveInput) {
            claveInput.required = mostrarClave;
            if (!mostrarClave) {
                claveInput.value = '';
            }
        }
    }

    $(document).on('change', '#pausar_semana', function () {
        actualizarEstadoFormularioAbono();
    });

    $(document).on('change', '#es_nomina', function () {
        actualizarEstadoFormularioAbono();
    });

    /**
     * Editar abono existente
     */
    $(document).on('click', '.btn-editar-abono', function (e) {
        e.preventDefault();

        let idAbono = $(this).data('id-abono');
        let motivo = "AUTORIZACION PARA INGRESAR AL FORMULARIO DE EDICION DE ABONO. ID ABONO: " + idAbono;

        Swal.fire({
            title: "Ingresa clave de autorización",
            input: "password",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Autorizar",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,
            preConfirm: async (clave) => {
                try {
                    const response = await $.ajax({
                        type: "POST",
                        url: URL_SABE + "public/php/obtenerAutorizacion.php",
                        data: { clave: clave, motivo: motivo },
                        dataType: "json"
                    });

                    if (response.clv === true) {
                        window.location.href = `editarAbono.php?id_abono=${idAbono}&clv=${response.clv}`;
                    } else {
                        return Swal.showValidationMessage(
                            response.mensaje || 'Clave inválida'
                        );
                    }

                } catch (error) {
                    let res = error && error.responseJSON ? error.responseJSON : null;
                    return Swal.showValidationMessage(
                        res ? res.mensaje : 'Error al verificar la clave'
                    );
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

    });

});