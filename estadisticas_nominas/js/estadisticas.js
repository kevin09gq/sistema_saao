//====================================================
// VARIABLES GLOBALES DE ESTADÍSTICAS
//====================================================

// año seleccionado actualmente
let anioSeleccionado = '';

// datos de los kpis
let datosKpis = null;

// datos del desglose de la última semana
let datosDesglose = null;


//====================================================
// INICIALIZACIÓN
//====================================================

$(document).ready(function () {
    cargarSelectAnio();
});



//====================================================
// FUNCIÓN PARA CARGAR EL SELECT DE AÑOS
//====================================================

function cargarSelectAnio() {

    // llamada ajax para obtener los años
    $.ajax({
        type: "POST",
        url: "../php/estadisticas.php",
        data: {
            accion: "obtenerAnios"
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // limpiar el select
                $('#select_anio').empty();

                // agregar los años al select
                respuesta.anios.forEach(function (anio) {
                    $('#select_anio').append(`
                        <option value="${anio}">${anio}</option>
                    `);
                });

                // seleccionar el primer año por defecto
                if (respuesta.anios.length > 0) {
                    anioSeleccionado = respuesta.anios[0];
                    $('#select_anio').val(anioSeleccionado);

                    // cargar los kpis del año seleccionado
                    cargarKpis();
                }

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener los años:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA CARGAR LOS KPIs DEL AÑO SELECCIONADO
//====================================================

function cargarKpis() {

    // validar que haya un año seleccionado
    if (!anioSeleccionado) {
        return;
    }

    // llamada ajax para obtener los kpis
    $.ajax({
        type: "POST",
        url: "../php/estadisticas.php",
        data: {
            accion: "obtenerKpis",
            anio: anioSeleccionado
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos de kpis
                datosKpis = respuesta.kpis;

                // actualizar las 4 tarjetas kpi
                actualizarKpis();

                // cargar el desglose de la última semana
                cargarDesgloseUltimaSemana();

                // cargar la gráfica de evolución semanal
                if (typeof cargarEvolucionSemanal === 'function') {
                    cargarEvolucionSemanal(anioSeleccionado);
                }

                // cargar la gráfica de distribución presupuestal
                if (typeof cargarDistribucionPresupuestal === 'function') {
                    cargarDistribucionPresupuestal(anioSeleccionado);
                }

                // cargar la gráfica de ranking de costo
                if (typeof cargarRankingUltimaSemana === 'function') {
                    cargarRankingUltimaSemana(anioSeleccionado);
                }

                // cargar la gráfica de promedios semanales
                if (typeof cargarPromediosSemanales === 'function') {
                    cargarPromediosSemanales(anioSeleccionado);
                }

                // cargar el historial semanal
                if (typeof cargarHistorialSemanal === 'function') {
                    cargarHistorialSemanal(anioSeleccionado);
                }

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener los kpis:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR LAS 4 TARJETAS KPI
//====================================================

function actualizarKpis() {

    // validar que existan datos de kpis
    if (!datosKpis) {
        return;
    }

    //================================================
    // kpi 1: total de la última semana
    //================================================

    // actualizar el badge de la semana
    $('#kpi-total-ultima-semana-badge').text(`Semana ${datosKpis.ultima_semana}`);

    // actualizar el monto total
    $('#kpi-total-ultima-monto').text(formatearMonto(datosKpis.total_ultima_semana));

    // calcular variación vs semana anterior
    // fórmula: variación = total_ultima_semana - total_semana_anterior
    // fórmula porcentaje: (variación / total_semana_anterior) * 100
    let variacion = datosKpis.total_ultima_semana - datosKpis.total_semana_anterior;
    let porcentajeVariacion = 0;

    if (datosKpis.total_semana_anterior > 0) {
        porcentajeVariacion = (variacion / datosKpis.total_semana_anterior) * 100;
    }

    // generar el html de la variación según el resultado
    let htmlVariacion = '';
    if (variacion > 0) {
        htmlVariacion = `
            <span class="text-success small">
                <i class="bi bi-arrow-up"></i>
                +${formatearMonto(variacion)} (${porcentajeVariacion.toFixed(1)}%)
            </span>
            <span class="text-muted small">vs semana anterior</span>
        `;
    } else if (variacion < 0) {
        htmlVariacion = `
            <span class="text-danger small">
                <i class="bi bi-arrow-down"></i>
                ${formatearMonto(variacion)} (${porcentajeVariacion.toFixed(1)}%)
            </span>
            <span class="text-muted small">vs semana anterior</span>
        `;
    } else {
        htmlVariacion = `
            <span class="text-muted small">
                sin variación vs semana anterior
            </span>
        `;
    }

    // actualizar el html de la variación
    $('#kpi-total-ultima-vs-antigua').html(htmlVariacion);

    //================================================
    // kpi 2: semana más cara
    //================================================

    // actualizar el monto de la semana más cara
    $('#kpi-max-monto').text(formatearMonto(datosKpis.monto_semana_cara));

    // calcular diferencia vs promedio
    // fórmula: diferencia = monto_semana_cara - promedio_semanal
    let difPromedio = datosKpis.monto_semana_cara - datosKpis.promedio_semanal;
    $('#kpi-max-dif-promedio').text(`+${formatearMonto(difPromedio)} vs promedio semanal`);

    // actualizar el label de la semana
    $('#kpi-max-semana-label').text(`Semana ${datosKpis.semana_mas_cara}`);

    //================================================
    // kpi 3: acumulado del año
    //================================================

    // actualizar el monto acumulado
    // fórmula: suma de todas las nóminas de todas las semanas del año
    $('#kpi-acumulado-monto').text(formatearMonto(datosKpis.acumulado_anual));

    // actualizar el label del año
    $('#kpi-acumulado-semanas-label').text(`Año ${anioSeleccionado}`);

    //================================================
    // kpi 4: promedio semanal
    //================================================

    // actualizar el monto promedio
    // fórmula: promedio = suma de totales de todas las semanas / número de semanas
    $('#kpi-promedio-monto').text(formatearMonto(datosKpis.promedio_semanal));
}


//====================================================
// FUNCIÓN PARA FORMATEAR MONTOS
//====================================================

function formatearMonto(monto) {

    // formatear el monto a moneda mexicana
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto);
}


//====================================================
// FUNCIÓN PARA CARGAR EL DESGLOSE DE LA ÚLTIMA SEMANA
//====================================================

function cargarDesgloseUltimaSemana() {

    // validar que haya un año seleccionado
    if (!anioSeleccionado) {
        return;
    }

    // llamada ajax para obtener el desglose
    $.ajax({
        type: "POST",
        url: "../php/estadisticas.php",
        data: {
            accion: "obtenerDesgloseUltimaSemana",
            anio: anioSeleccionado
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos del desglose
                datosDesglose = respuesta.desglose;

                // actualizar el label de la fecha
                $('#label-fecha-ultima-semana').text(`Semana ${respuesta.ultima_semana} - Total consolidado: ${formatearMonto(respuesta.total_consolidado)}`);

                // renderizar el desglose en el contenedor
                renderizarDesgloseUltimaSemana(respuesta.desglose, respuesta.total_consolidado);

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener el desglose:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR EL DESGLOSE DE LA ÚLTIMA SEMANA
//====================================================

function renderizarDesgloseUltimaSemana(desglose, totalConsolidado) {

    // limpiar el contenedor
    $('#contenedor-desglose-ultima-semana').empty();

    // definir las 8 nóminas con sus clases y orden
    let nominas = [
        { nombre: '40 Lbs', clase: 'chip-8nom chip-8nom-40lbs' },
        { nombre: '40 Lbs Jornal', clase: 'chip-8nom chip-8nom-40lbs-jornal' },
        { nombre: '10 Lbs', clase: 'chip-8nom chip-8nom-10lbs' },
        { nombre: 'Confianza', clase: 'chip-8nom chip-8nom-confianza' },
        { nombre: 'Relicario', clase: 'chip-8nom chip-8nom-relicario' },
        { nombre: 'Pilar', clase: 'chip-8nom chip-8nom-pilar' },
        { nombre: 'Huasteca', clase: 'chip-8nom chip-8nom-huasteca' },
        { nombre: 'Palmilla', clase: 'chip-8nom chip-8nom-palmilla' }
    ];

    // recorrer cada nómina definida
    nominas.forEach(function (nominaDef) {

        // buscar el monto en el desglose recibido
        let nominaEncontrada = desglose.find(function (n) {
            return n.nomina === nominaDef.nombre;
        });

        // si no se encontró, usar monto 0
        let monto = nominaEncontrada ? nominaEncontrada.monto : 0;

        // calcular el porcentaje
        // fórmula: (monto_nomina / total_consolidado) * 100
        let porcentaje = 0;
        if (totalConsolidado > 0) {
            porcentaje = (monto / totalConsolidado) * 100;
        }

        // crear la tarjeta de la nómina
        $('#contenedor-desglose-ultima-semana').append(`
            <div class="col-12 col-sm-6 col-lg-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="${nominaDef.clase}">${nominaDef.nombre}</span>
                            <span class="badge bg-light text-dark">${porcentaje.toFixed(1)}%</span>
                        </div>
                        <h5 class="fw-bold mb-0 text-dark">${formatearMonto(monto)}</h5>
                        <small class="text-muted">Aportación individual</small>
                    </div>
                </div>
            </div>
        `);
    });
}


//====================================================
// EVENTO: CAMBIO DE AÑO EN EL SELECT
//====================================================

$('#select_anio').on('change', function () {

    // actualizar el año seleccionado
    anioSeleccionado = $(this).val();

    // recargar los kpis con el nuevo año
    cargarKpis();

    // recargar el desglose de la última semana
    cargarDesgloseUltimaSemana();

    // recargar la gráfica de evolución semanal
    if (typeof cargarEvolucionSemanal === 'function') {
        cargarEvolucionSemanal(anioSeleccionado);
    }

    // recargar la gráfica de distribución presupuestal
    if (typeof cargarDistribucionPresupuestal === 'function') {
        cargarDistribucionPresupuestal(anioSeleccionado);
    }

    // recargar la gráfica de ranking de costo
    if (typeof cargarRankingUltimaSemana === 'function') {
        cargarRankingUltimaSemana(anioSeleccionado);
    }

    // recargar la gráfica de promedios semanales
    if (typeof cargarPromediosSemanales === 'function') {
        cargarPromediosSemanales(anioSeleccionado);
    }

    // recargar el historial semanal
    if (typeof cargarHistorialSemanal === 'function') {
        cargarHistorialSemanal(anioSeleccionado);
    }
});



