$(document).ready(function () {

    // Constantes
    const URL_APP = "/sistema_saao/";

    // Inicializar la funciones
    buscar_empleado();
    initPlanPago();
    sincronizarAnioConFecha();


    /**
     * ==========================================
     * Sincronizar año de inicio con fecha seleccionada
     * ==========================================
     */
    function sincronizarAnioConFecha() {
        $("#fecha").on("change", function () {
            const fechaSeleccionada = $(this).val();
            if (fechaSeleccionada) {
                const anio = new Date(fechaSeleccionada).getFullYear();
                $("#anio_inicio").val(anio);
                // Disparar evento para recalcular el plan
                $("#anio_inicio").trigger('input');
            }
        });
    }


    /**
     * ==========================================
     * Cancelar y volver a la vista de prestamos
     * ==========================================
     */
    $(document).on('click', '#btnCancelar', function (e) {
        e.preventDefault();

        window.location.href = URL_APP + "prestamos/views/";

    });


    /**
     * ==========================================
     * Guardar nuevo prestamo
     * ==========================================
     */
    $(document).on('submit', '#form-nuevo-prestamo', function (e) {
        e.preventDefault();

        // Datos generales del prestamo
        const id_empleado = $("#id_empleado").val();
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
            folio,
            monto,
            fecha,
            // Datos del plan de pago
            semana_inicio,
            anio_inicio,
            semana_fin,
            anio_fin,
            // Detalle del plan de pago
            detalle_plan,
            // Flag para confirmar solapamiento (inicialmente false)
            confirmar_solapamiento: 'false'
        };

        // Intentar guardar el préstamo
        guardarPrestamo(datos);

    });

    /**
     * ==========================================
     * Función para guardar el préstamo
     * ==========================================
     */
    function guardarPrestamo(datos) {
        $.ajax({
            type: "POST",
            url: "../php/guardarNuevoPrestamo.php",
            data: datos,
            dataType: "json",
            success: function (response) {
                console.log(response);

                limpiarFormulario();

                Swal.fire({
                    title: response.titulo,
                    text: response.mensaje,
                    icon: response.icono,
                    confirmButtonText: 'Aceptar'
                });

            },
            error: function (xhr, status, error) {
                console.error("El servidor devolvio un error: ", status, error);
                
                let respuesta = xhr.responseJSON || {};
                
                // Verificar si es una advertencia de solapamiento que requiere confirmación
                if (xhr.status === 409 && respuesta.data && respuesta.data.requiere_confirmacion) {
                    // Construir lista de planes solapados
                    let listaPlanesHtml = '<ul class="text-start mb-0">';
                    respuesta.data.planes_solapados.forEach(function(plan) {
                        listaPlanesHtml += `<li><strong>Folio ${plan.folio}</strong><br><small class="text-muted">${plan.rango}</small></li>`;
                    });
                    listaPlanesHtml += '</ul>';

                    // Mostrar confirmación con los detalles del solapamiento
                    Swal.fire({
                        title: '⚠️ Solapamiento de Planes Detectado',
                        html: `
                            <p>El nuevo plan de pago <strong>(Sem ${datos.semana_inicio}/${datos.anio_inicio} - Sem ${datos.semana_fin}/${datos.anio_fin})</strong> 
                            se solapa con los siguientes planes existentes:</p>
                            ${listaPlanesHtml}
                            <hr>
                            <p class="text-warning mb-0"><i class="bi bi-exclamation-triangle"></i> Esto significa que el empleado tendrá pagos simultáneos de múltiples préstamos durante algunas semanas.</p>
                        `,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sí, guardar de todas formas',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Usuario confirma, enviar de nuevo con flag de confirmación
                            datos.confirmar_solapamiento = 'true';
                            guardarPrestamo(datos);
                        }
                    });
                } else {
                    // Otro tipo de error
                    Swal.fire({
                        title: respuesta.titulo || 'Error',
                        text: respuesta.mensaje || 'Ocurrió un error al guardar',
                        icon: respuesta.icono || 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        });
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
                                label: item.empleado, // lo que se muestra en la lista
                                value: item.empleado  // lo que se coloca en el input
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

                obtener_audeudo(id_empleado);

            },
            minLength: 2 // empieza a buscar desde 2 caracteres
        });
    }


    /**
     * ================================================
     * Funcion para saber si el empleado tiene adeudos
     * ================================================
     */
    function obtener_audeudo(id_empleado) {
        $.ajax({
            url: "../php/buscarAdeudoEmpleado.php",
            type: "POST",
            data: { id_empleado: id_empleado },
            dataType: "json",
            success: function (response) {


                console.log(response);


                if (response.data) {
                    // Construyes la alerta con los datos dinámicos
                    let alerta = `
                        <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            <h4 class="alert-heading">Advertencia!</h4>
                            <p>El empleado <span class="fw-bold">${response.data.empleado}</span> ya tiene un adeudo existente.</p>
                            <hr>
                            <p class="mb-0">El adeudo del empleado es de: <span class="fw-bold">${response.data.deuda_total}</span></p>
                        </div>
                    `;

                    // Insertas la alerta en el contenedor
                    $("#contenedor-alerta").html(alerta);

                    // Verificar si hay sem_fin_plan para posicionar el select
                    if (response.data.sem_fin_plan && response.data.anio_fin_plan) {
                        let semFinPlan = Number(response.data.sem_fin_plan);
                        let anioFinPlan = Number(response.data.anio_fin_plan);

                        // Obtener semana y año actual
                        let now = new Date();
                        let startOfYear = new Date(now.getFullYear(), 0, 1);
                        let days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
                        let semanaActual = Math.ceil((days + startOfYear.getDay() + 1) / 7);
                        let anioActual = now.getFullYear();

                        // Calcular la siguiente semana después del fin del plan
                        let siguienteSemana = semFinPlan + 1;
                        let siguienteAnio = anioFinPlan;
                        if (siguienteSemana > 52) {
                            siguienteSemana = 1;
                            siguienteAnio = anioFinPlan + 1;
                        }

                        // Comparar si la semana siguiente es próxima (no ha pasado)
                        // Convertir a un número comparable: anio*100 + semana
                        let valorSiguiente = siguienteAnio * 100 + siguienteSemana;
                        let valorActual = anioActual * 100 + semanaActual;

                        // Solo posicionar si la semana siguiente es >= a la actual
                        if (valorSiguiente >= valorActual) {
                            $("#semana_inicio").val(siguienteSemana);
                            // Disparar evento para recalcular el plan
                            $("#semana_inicio").trigger('input');
                        }
                    }

                } else {
                    // Vacías completamente el contenedor
                    $("#contenedor-alerta").html("");
                }

            }
        });
    }


    /**
     * ===============================================
     * Inicializa inputs y lógica para el plan de pago
     * ===============================================
     */
    function initPlanPago() {
        function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

        function renderPlan() {
            let monto = parseFloat($("#monto").val()) || 0;
            let num = parseInt($("#num_semana").val()) || 0;
            let pago = parseFloat($("#pago_semana").val()) || 0;
            let inicio = parseInt($("#semana_inicio").val()) || 1;
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
                // calcular semana y año considerando que pueden pasar al siguiente año
                let offset = (inicio - 1) + i; // 0-based offset
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
                            <input type="number" class="form-control" name="detalle_plan_monto[]" value="${amount.toFixed(2)}">
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
                            </tr>
                        </thead>

                        <tbody>${rows}</tbody>

                        <tfoot>
                            <tr>
                                <th>Total</th>
                                <th class="text-center">$ ${round2(total).toFixed(2)}</th>
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

        // Eventos
        $("#monto").on("input", function () { updatePagoFromMonto(); });
        $("#num_semana").on("input", function () { updatePagoFromMonto(); });
        $("#pago_semana").on("input", function () { updateNumFromPago(); });
        $("#semana_inicio").on("input", function () { renderPlan(); });
        $("#anio_inicio").on("input", function () { renderPlan(); });

        // Inicializar valores por defecto
        if ($("#num_semana").val() === "") $("#num_semana").val(5);
        updatePagoFromMonto();
    }


    /**
     * ===============================================
     * Limpiar el formulario al cargar la pagina
     * ===============================================
     */
    function limpiarFormulario() {
        $("#form-nuevo-prestamo")[0].reset();
        $("#plan_table").html("");
        $("#contenedor-alerta").html("");
    }


});