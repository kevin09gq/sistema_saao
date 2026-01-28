$(document).ready(function () {
    const ID_PLAN = Number(window.ID_PLAN || 0);

    const ENDPOINT_OBTENER = '../php/obtenerPlanPago.php';
    const ENDPOINT_GUARDAR = '../php/guardarEdicionPlan.php';

    let montoPrestamo = 0;
    let idDetalle = 0;
    let detalleCache = [];

    const $form = $('#form-editar-plan');
    const $planTable = $('#plan_table');

    function round2(n) {
        const x = Number(n);
        if (!Number.isFinite(x)) return 0;
        return Math.round(x * 100) / 100;
    }

    function isPendiente(estado) {
        return String(estado || '').trim().toLowerCase() === 'pendiente';
    }

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function semanaYearSiguiente(semana, anio) {
        let s = Number(semana) || 1;
        let a = Number(anio) || new Date().getFullYear();
        s += 1;
        if (s > 52) {
            s = 1;
            a += 1;
        }
        return { semana: s, anio: a };
    }

    function normalizarFila(row) {
        return {
            monto_semanal: round2(row.monto_semanal),
            num_semana: Number(row.num_semana) || 0,
            anio: Number(row.anio) || 0,
            fecha_pago: row.fecha_pago ? String(row.fecha_pago) : '',
            observacion: row.observacion ? String(row.observacion) : '',
            estado: row.estado ? String(row.estado) : 'Pendiente',
            id_abono: row.id_abono === null || row.id_abono === undefined ? null : String(row.id_abono)
        };
    }

    function leerDetalleDesdeDOM() {
        const arr = [];

        $planTable.find('tbody tr').each(function () {
            const $tr = $(this);
            const estado = $tr.attr('data-estado') || 'Pendiente';

            if (isPendiente(estado)) {
                arr.push(normalizarFila({
                    monto_semanal: $tr.find('.js-monto').val(),
                    num_semana: $tr.find('.js-semana').val(),
                    anio: $tr.find('.js-anio').val(),
                    fecha_pago: $tr.find('.js-fecha').val(),
                    observacion: $tr.find('.js-obs').val(),
                    estado: 'Pendiente',
                    id_abono: null
                }));
            } else {
                const idx = Number($tr.attr('data-idx'));
                const orig = detalleCache[idx] || {};
                arr.push(normalizarFila(orig));
            }
        });

        return arr;
    }

    function calcularSuma(arr) {
        let sum = 0;
        for (const r of arr) sum += Number(r.monto_semanal) || 0;
        return round2(sum);
    }

    function renderResumen() {
        const det = leerDetalleDesdeDOM();
        const suma = calcularSuma(det);

        const ok = round2(suma) === round2(montoPrestamo);
        const clase = ok ? 'alert-success' : 'alert-warning';
        const texto = ok
            ? `Suma del detalle: $${suma} (OK)`
            : `Suma del detalle: $${suma} | Monto préstamo: $${round2(montoPrestamo)} (Debe ser exacto)`;

        $('#resumen_suma').remove();
        $planTable.append(`<div id="resumen_suma" class="alert ${clase} mt-3 mb-0">${texto}</div>`);
    }

    /**
     * Actualiza visualmente la semana fin y el número de semanas
     * basándose en la última fila del detalle
     */
    function actualizarSemanaFin(det) {
        if (!Array.isArray(det) || det.length === 0) {
            $('#semana_fin_tmp').val('');
            $('#semana_fin').val('');
            $('#anio_fin').val('');
            $('#num_semana').val(0);
            return;
        }

        // Obtener la última fila del detalle
        const last = det[det.length - 1];
        const semFin = Number(last.num_semana) || 0;
        const anioFin = Number(last.anio) || 0;

        // Actualizar campos visuales
        if (semFin >= 1 && semFin <= 52 && anioFin >= 2000) {
            $('#semana_fin_tmp').val(`Semana ${pad2(semFin)} / ${anioFin}`);
            $('#semana_fin').val(semFin);
            $('#anio_fin').val(anioFin);
        }

        // Actualizar número de semanas
        $('#num_semana').val(det.length);
    }

    function renderTabla(detalle) {
        detalleCache = Array.isArray(detalle) ? detalle : [];

        const rowsHtml = detalleCache
            .map((row, idx) => {
                const estado = row.estado || 'Pendiente';
                const editable = isPendiente(estado);

                if (!editable) {
                    return `
                        <tr data-estado="${String(estado)}" data-idx="${idx}">
                            <td>${row.num_semana ?? ''}</td>
                            <td>${row.anio ?? ''}</td>
                            <td>$${round2(row.monto_semanal)}</td>
                            <td>${row.fecha_pago ?? ''}</td>
                            <td>${row.observacion ?? ''}</td>
                            <td>${estado}</td>
                            <td></td>
                        </tr>
                    `;
                }

                return `
                    <tr data-estado="Pendiente" data-idx="${idx}">
                        <td>
                            <input type="number" class="form-control form-control-sm js-semana" min="1" max="52" value="${row.num_semana ?? ''}" required>
                        </td>
                        <td>
                            <input type="number" class="form-control form-control-sm js-anio" min="2000" value="${row.anio ?? ''}" required>
                        </td>
                        <td>
                            <input type="number" class="form-control form-control-sm js-monto" min="0" step="0.01" value="${round2(row.monto_semanal)}" required>
                        </td>
                        <td>
                            <input type="date" class="form-control form-control-sm js-fecha" value="${row.fecha_pago ?? ''}">
                        </td>
                        <td>
                            <input type="text" class="form-control form-control-sm js-obs" value="${row.observacion ?? ''}">
                        </td>
                        <td>Pendiente</td>
                        <td class="text-nowrap">
                            <button type="button" class="btn btn-sm btn-primary js-insertar">Insertar</button>
                            <button type="button" class="btn btn-sm btn-danger js-eliminar">Eliminar</button>
                        </td>
                    </tr>
                `;
            })
            .join('');

        const tableHtml = `
            <div class="table-responsive">
                <table class="table table-sm table-striped align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Año</th>
                            <th>Monto semanal</th>
                            <th>Fecha pago</th>
                            <th>Observación</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || '<tr><td colspan="7" class="text-center">Sin detalle</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;

        $planTable.html(tableHtml);
        renderResumen();
        actualizarSemanaFin(detalleCache);
    }

    function validarAntesDeGuardar(det) {
        if (!Array.isArray(det) || det.length === 0) {
            return { ok: false, msg: 'El detalle está vacío' };
        }

        for (const r of det) {
            const semana = Number(r.num_semana) || 0;
            const anio = Number(r.anio) || 0;
            const monto = Number(r.monto_semanal) || 0;

            if (semana < 1 || semana > 52) return { ok: false, msg: 'Semana inválida en el detalle' };
            if (anio < 2000) return { ok: false, msg: 'Año inválido en el detalle' };
            if (monto < 0) return { ok: false, msg: 'Monto semanal inválido en el detalle' };

            const estado = String(r.estado || '').trim().toLowerCase();
            if (estado !== 'pendiente' && estado !== 'pagado' && estado !== 'pausado') {
                return { ok: false, msg: 'Estado inválido en el detalle' };
            }
        }

        const suma = calcularSuma(det);
        if (round2(suma) !== round2(montoPrestamo)) {
            return { ok: false, msg: `La suma del detalle (${suma}) debe ser exactamente igual al monto del préstamo (${round2(montoPrestamo)})` };
        }

        return { ok: true, msg: '' };
    }

    function cargarPlan() {
        if (!ID_PLAN) {
            Swal.fire('Datos incompletos', 'Falta ID_PLAN', 'warning');
            return;
        }

        $.ajax({
            url: ENDPOINT_OBTENER,
            type: 'GET',
            dataType: 'json',
            data: { id_plan: ID_PLAN }
        })
            .done(function (resp) {
                if (!resp || !resp.data || !resp.data.plan) {
                    Swal.fire('Error', 'Respuesta inválida del servidor', 'error');
                    return;
                }

                const plan = resp.data.plan;
                const detalle = resp.data.detalle || [];
                idDetalle = Number(resp.data.id_detalle || 0);
                montoPrestamo = Number(plan.monto || 0);

                $('#empleado').val(plan.empleado || '');
                $('#folio').val(plan.folio || '');
                $('#monto').val(round2(plan.monto || 0));
                $('#fecha').val(plan.fecha_prestamo || '');

                const numSem = Array.isArray(detalle) ? detalle.length : 0;
                $('#num_semana').val(numSem || 1);

                let pagoSemana = 0;
                if (Array.isArray(detalle) && detalle.length > 0) {
                    pagoSemana = Number(detalle[0].monto_semanal || 0);
                }
                $('#pago_semana').val(round2(pagoSemana));

                if (plan.sem_inicio) {
                    $('#semana_inicio').val(String(plan.sem_inicio));
                }

                let finTxt = (plan.sem_fin && plan.anio_fin)
                    ? `Semana ${pad2(plan.sem_fin)} / ${plan.anio_fin}`
                    : '';
                if (!finTxt && Array.isArray(detalle) && detalle.length > 0) {
                    const last = detalle[detalle.length - 1];
                    const sf = Number(last.num_semana) || 0;
                    const af = Number(last.anio) || 0;
                    if (sf >= 1 && sf <= 52 && af >= 2000) {
                        finTxt = `Semana ${pad2(sf)} / ${af}`;
                    }
                }
                $('#semana_fin_tmp').val(finTxt);

                $('#semana_fin').val(plan.sem_fin || '').hide();
                $('#anio_fin').val(plan.anio_fin || '').hide();

                renderTabla(detalle);
            })
            .fail(function () {
                Swal.fire('Error', 'No se pudo cargar el plan', 'error');
            });
    }

    $planTable.on('input change', '.js-semana, .js-anio, .js-monto, .js-fecha, .js-obs', function () {
        renderResumen();
    });

    $planTable.on('click', '.js-insertar', function () {
        const $tr = $(this).closest('tr');
        const det = leerDetalleDesdeDOM();
        const idx = $tr.index();

        const prev = det[idx] || det[idx - 1] || det[0] || {};
        const baseSemana = Number(prev.num_semana) || 1;
        const baseAnio = Number(prev.anio) || new Date().getFullYear();
        const next = semanaYearSiguiente(baseSemana, baseAnio);

        const nueva = normalizarFila({
            monto_semanal: 0,
            num_semana: next.semana,
            anio: next.anio,
            fecha_pago: '',
            observacion: '',
            estado: 'Pendiente',
            id_abono: null
        });

        det.splice(idx + 1, 0, nueva);
        renderTabla(det);
    });

    $planTable.on('click', '.js-eliminar', function () {
        const $tr = $(this).closest('tr');
        const estado = $tr.attr('data-estado') || '';
        if (!isPendiente(estado)) return;

        const det = leerDetalleDesdeDOM();
        const idx = $tr.index();

        if (det.length <= 1) {
            Swal.fire('Validación', 'No puedes dejar el detalle vacío', 'warning');
            return;
        }

        det.splice(idx, 1);
        renderTabla(det);
    });

    $form.on('submit', function (e) {
        e.preventDefault();

        const det = leerDetalleDesdeDOM();
        const valid = validarAntesDeGuardar(det);
        if (!valid.ok) {
            Swal.fire('Validación', valid.msg, 'warning');
            return;
        }

        if (!idDetalle) {
            Swal.fire('Error', 'No se encontró id_detalle del plan', 'error');
            return;
        }

        $.ajax({
            url: ENDPOINT_GUARDAR,
            type: 'POST',
            dataType: 'json',
            data: {
                id_plan: ID_PLAN,
                id_detalle: idDetalle,
                detalle: JSON.stringify(det)
            }
        })
            .done(function (resp) {
                if (!resp) {
                    Swal.fire('Error', 'Respuesta inválida', 'error');
                    return;
                }
                Swal.fire(resp.titulo || 'OK', resp.mensaje || 'Guardado', resp.icono || 'success');
                if ((resp.icono || '').toLowerCase() === 'success') {
                    cargarPlan();
                }
            })
            .fail(function (xhr) {
                let msg = 'No se pudo guardar';
                try {
                    const r = xhr.responseJSON;
                    if (r && r.mensaje) msg = r.mensaje;
                } catch (_) { }
                Swal.fire('Error', msg, 'error');
            });
    });

    cargarPlan();
});
