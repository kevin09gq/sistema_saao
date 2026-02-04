$(document).ready(function () {

    // Constantes
    const URL_APP = "/sistema_saao/";

    // Inicializar funciones
    cargarDatosPrestamo();
    initPlanPago();
    buscar_empleado();

    // Limpiar búsqueda de empleado
    $('#btn-limpiar-busqueda').on('click', function (e) {
        e.preventDefault();
        $('#empleado').val('');
        $('#id_empleado').val('');
    });


    /**
     * ===============================================
     * Cargar datos del préstamo en el formulario
     * ===============================================
     */
    function cargarDatosPrestamo() {
        if (typeof PRESTAMO_DATA === 'undefined') return;

        // Datos generales
        $('#id_empleado').val(PRESTAMO_DATA.id_empleado);
        $('#empleado').val(PRESTAMO_DATA.empleado);
        $('#folio').val(PRESTAMO_DATA.folio);
        $('#monto').val(parseFloat(PRESTAMO_DATA.monto));
        $('#fecha').val(PRESTAMO_DATA.fecha);

        // Plan de pago - calcular duración en semanas
        const semInicio = parseInt(PRESTAMO_DATA.sem_inicio);
        const anioInicio = parseInt(PRESTAMO_DATA.anio_inicio);
        const semFin = parseInt(PRESTAMO_DATA.sem_fin);
        const anioFin = parseInt(PRESTAMO_DATA.anio_fin);

        // Calcular número de semanas
        const numSemanas = calcularDuracionSemanas(semInicio, anioInicio, semFin, anioFin);

        $('#semana_inicio').val(semInicio);
        $('#anio_inicio').val(anioInicio);
        $('#num_semana').val(numSemanas);
        $('#semana_fin').val(semFin);
        $('#anio_fin').val(anioFin);
        $('#semana_fin_tmp').val(`Semana ${semFin} (${anioFin})`);

        // Calcular pago por semana
        const monto = parseFloat(PRESTAMO_DATA.monto);
        if (numSemanas > 0) {
            const pagoSemana = round2(monto / numSemanas);
            $('#pago_semana').val(pagoSemana);
        }

        // Renderizar tabla con detalles del JSON
        renderPlanFromJSON(PRESTAMO_DATA.detalle);
    }


    /**
     * ===============================================
     * Calcular duración en semanas entre dos fechas
     * ===============================================
     */
    function calcularDuracionSemanas(semInicio, anioInicio, semFin, anioFin) {
        // Convertir a offset absoluto (semanas desde año 0)
        const offsetInicio = (anioInicio * 52) + semInicio;
        const offsetFin = (anioFin * 52) + semFin;
        return offsetFin - offsetInicio + 1;
    }


    /**
     * ===============================================
     * Renderizar tabla desde JSON guardado
     * ===============================================
     */
    function renderPlanFromJSON(detalle) {
        if (!detalle || !Array.isArray(detalle) || detalle.length === 0) {
            $("#plan_table").html("");
            return;
        }

        let rows = "";
        let total = 0;

        detalle.forEach(function (item) {
            const semana = item.num_semana;
            const anio = item.anio;
            const montoSemanal = parseFloat(item.monto_semanal) || 0;
            const estado = item.estado || 'Pendiente';

            total += montoSemanal;

            rows += `
                <tr>
                    <td class="text-center">
                        Semana ${semana} (${anio})
                        <input type="number" class="form-control" name="detalle_plan_semana[]" value="${semana}" readonly hidden>
                        <input type="number" class="form-control" name="detalle_plan_anio[]" value="${anio}" readonly hidden>
                    </td>
                    <td class="text-center">
                        <input type="number" class="form-control" name="detalle_plan_monto[]" value="${montoSemanal.toFixed(2)}" step="0.01">
                    </td>
                    <td class="text-center">
                        <span class="badge ${estado === 'Pagado' ? 'bg-success' : 'bg-warning'}">${estado}</span>
                    </td>
                </tr>`;
        });

        let table = `
            <hr class="my-3">
            <h5 class="card-title">Detalles del plan de pago</h5>
            <div class="table-responsive">
                <table class="table table-bordered table-sm mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="text-center">Semana</th>
                            <th class="text-center">Monto ($)</th>
                            <th class="text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th>
                            <th class="text-center">$ ${round2(total).toFixed(2)}</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        $("#plan_table").html(table);
    }


    /**
     * ===============================================
     * Redondear a 2 decimales
     * ===============================================
     */
    function round2(n) {
        return Math.round((n + Number.EPSILON) * 100) / 100;
    }


    /**
     * ===============================================
     * Inicializa inputs y lógica para el plan de pago
     * ===============================================
     */
    function initPlanPago() {

        function renderPlan() {
            let monto = parseFloat($("#monto").val()) || 0;
            let num = parseInt($("#num_semana").val()) || 0;
            let pago = parseFloat($("#pago_semana").val()) || 0;
            let inicio = parseInt($("#semana_inicio").val()) || 1;

            // Usar el año del input anio_inicio
            const baseYear = parseInt($("#anio_inicio").val()) || new Date().getFullYear();

            if (!monto || !num || !pago) {
                $("#plan_table").html("");
                $("#semana_fin_tmp").val("");
                $("#semana_fin").val("");
                $("#anio_fin").val("");
                return;
            }

            let rows = "";
            let total = 0;
            for (let i = 0; i < num; i++) {
                // Calcular semana y año considerando saltos de año
                let offset = (inicio - 1) + i;
                let semanaNum = (offset % 52) + 1;
                let year = baseYear + Math.floor(offset / 52);

                let amount = (i < num - 1) ? round2(pago) : round2(monto - round2(pago) * (num - 1));
                total += amount;
                rows += `
                    <tr>
                        <td class="text-center">
                            Semana ${semanaNum} (${year})
                            <input type="number" class="form-control" name="detalle_plan_semana[]" value="${semanaNum}" readonly hidden>
                            <input type="number" class="form-control" name="detalle_plan_anio[]" value="${year}" readonly hidden>
                        </td>
                        <td class="text-center">
                            <input type="number" class="form-control" name="detalle_plan_monto[]" value="${amount.toFixed(2)}" step="0.01">
                        </td>
                        <td class="text-center">
                            <span class="badge bg-warning">Pendiente</span>
                        </td>
                    </tr>`;
            }

            let offsetFin = (inicio - 1) + num - 1;
            let finWeek = (offsetFin % 52) + 1;
            let finYear = baseYear + Math.floor(offsetFin / 52);
            $("#semana_fin_tmp").val(`Semana ${finWeek} (${finYear})`);
            $("#semana_fin").val(finWeek);
            $("#anio_fin").val(finYear);

            let table = `
                <hr class="my-3">
                <h5 class="card-title">Detalles del plan de pago</h5>
                <div class="table-responsive">
                    <table class="table table-bordered table-sm mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center">Semana</th>
                                <th class="text-center">Monto ($)</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot>
                            <tr>
                                <th>Total</th>
                                <th class="text-center">$ ${round2(total).toFixed(2)}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            $("#plan_table").html(table);
        }

        function updatePagoFromMonto() {
            let monto = parseFloat($("#monto").val()) || 0;
            let num = parseInt($("#num_semana").val()) || 1;
            if (monto > 0 && num > 0) {
                let pago = round2(monto / num);
                $("#pago_semana").val(pago);
            } else {
                $("#pago_semana").val("");
            }
            renderPlan();
        }

        function updateNumFromPago() {
            let monto = parseFloat($("#monto").val()) || 0;
            let pago = parseFloat($("#pago_semana").val()) || 0;
            if (monto > 0 && pago > 0) {
                let num = Math.ceil(monto / pago);
                $("#num_semana").val(num);
            }
            renderPlan();
        }

        // Eventos para recalcular cuando cambian los valores
        $("#monto").on("input", function () { updatePagoFromMonto(); });
        $("#num_semana").on("input", function () { updatePagoFromMonto(); });
        $("#pago_semana").on("input", function () { updateNumFromPago(); });
        $("#semana_inicio").on("change", function () { renderPlan(); });
        $("#anio_inicio").on("input change", function () { renderPlan(); });
    }


    /**
     * ===============================================
     * Funcion para buscar empleado con autocompletado
     * ===============================================
     */
    function buscar_empleado() {
        $("#empleado").autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "../php/buscarEmpleado.php",
                    type: "GET",
                    data: { buscar: request.term },
                    dataType: "json",
                    success: function (data) {
                        response($.map(data.data, function (item) {
                            return {
                                label: item.empleado,
                                value: item.empleado
                            };
                        }));
                    }
                });
            },
            select: function (event, ui) {
                let cadena = ui.item.value;
                let partes = cadena.split(" - ");
                let id_empleado = partes[0];
                $("#id_empleado").val(id_empleado);
                $("#folio").focus();
            },
            minLength: 2
        });
    }


    /**
     * =================================
     * Guardar cambios del prestamo
     * =================================
     */
    $(document).on('submit', '#form-editar-prestamo', function (e) {
        e.preventDefault();

        Swal.fire({
            title: "¿Guardar cambios?",
            text: "Se actualizará la información del préstamo.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, guardar cambios"
        }).then((result) => {
            if (result.isConfirmed) {

                // Datos generales del prestamo
                const id_empleado = $("#id_empleado").val();
                const id_prestamo = $("#id_prestamo").val();
                const id_plan = $("#id_plan").val();
                const id_detalle = $("#id_detalle").val();
                const folio = $("#folio").val();
                const monto = $("#monto").val();
                const fecha = $("#fecha").val();

                // ==============================
                //    Datos del plan de pago
                // ==============================
                const semana_inicio = $("#semana_inicio").val();
                const anio_inicio = $("#anio_inicio").val();
                const semana_fin = $("#semana_fin").val();
                const anio_fin = $("#anio_fin").val();

                // Detalle del plan de pago
                let detalle_plan = [];
                $("input[name='detalle_plan_semana[]']").each(function (index) {
                    const semana = $(this).val().trim();
                    const anio = $("input[name='detalle_plan_anio[]']").eq(index).val().trim();
                    const monto_semana = $("input[name='detalle_plan_monto[]']").eq(index).val().trim();

                    if (semana || anio || monto_semana) {
                        detalle_plan.push({
                            monto_semanal: monto_semana || '',
                            num_semana: semana || '',
                            anio: anio || '',
                            fecha_pago: '',
                            observacion: '',
                            estado: 'Pendiente',
                            id_abono: null
                        });
                    }
                });


                // =======================
                // Datos a enviar por AJAX
                // =======================
                let datos = {
                    // Datos generales del prestamo
                    id_empleado,
                    id_prestamo,
                    id_plan,
                    id_detalle,
                    folio,
                    monto,
                    fecha,
                    // Datos del plan de pago
                    semana_inicio,
                    anio_inicio,
                    semana_fin,
                    anio_fin,
                    // Detalle del plan de pago
                    detalle_plan
                };

                $.ajax({
                    type: "POST",
                    url: "../php/actualizarPrestamo.php",
                    data: datos,
                    dataType: "json",
                    success: function (response) {
                        console.log(response);

                        // Verificar si hay aviso de solapamiento
                        let tieneAvisoSolapamiento = response.data && response.data.aviso_solapamiento === true;
                        
                        if (tieneAvisoSolapamiento && response.data.planes_solapados && response.data.planes_solapados.length > 0) {
                            // Construir lista de planes solapados
                            let listaPlanes = response.data.planes_solapados.map(p => 
                                `<li><strong>Folio ${p.folio}</strong>: ${p.rango}</li>`
                            ).join('');
                            
                            Swal.fire({
                                title: response.titulo || 'Préstamo actualizado',
                                html: `
                                    <p>${response.mensaje || 'Proceso completado'}</p>
                                    <hr>
                                    <div class="alert alert-warning text-start">
                                        <strong><i class="bi bi-exclamation-triangle-fill"></i> Atención:</strong><br>
                                        Este plan se solapa con los siguientes préstamos:
                                        <ul class="mt-2 mb-0">${listaPlanes}</ul>
                                    </div>
                                `,
                                icon: 'warning',
                                confirmButtonText: 'Entendido'
                            }).then(() => {
                                window.location.href = URL_APP + "prestamos/views/";
                            });
                        } else {
                            Swal.fire({
                                title: response.titulo,
                                text: response.mensaje,
                                icon: response.icono,
                                confirmButtonText: 'Aceptar'
                            }).then(() => {
                                if (response.icono === 'success') {
                                    window.location.href = URL_APP + "prestamos/views/";
                                }
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error en la solicitud AJAX:", status, error);
                        Swal.fire({
                            title: xhr.responseJSON.titulo,
                            text: xhr.responseJSON.mensaje,
                            icon: xhr.responseJSON.icono,
                            confirmButtonText: 'Aceptar'
                        });
                    }
                });

            }
        });

    });

});